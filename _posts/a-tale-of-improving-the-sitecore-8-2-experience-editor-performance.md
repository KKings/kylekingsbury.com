---
title: "A tale of improving the Sitecore 8.2 experience editor performance"
date: "2019-09-30"
metaDescription: "Is your Sitecore 8.2 Experience Editor performance terrible? Learn if you suffer from the same experience as our setup."
metaKeywords: "Slow, Experience Editor, Sitecore 8.2, Performance, Requests"
categories: 
  - "Sitecore"
tags: 
  - "experience-editor"
  - "performance"
---

In recent months, our Content Authors for an eCommerce site built with **Sitecore 8.2** running on Azure (IaaS) were complaining about the painstaking process of editing and building pages with Sitecore's Experience Editor. While not unheard for Content Authors to complain that the Experience Editor is a bit sluggish (as in always), the authors were pointing out that _it would take 1-1.5 minutes for a single page to refresh or any action to be taken within Experience Editor_. If you compound this by the numerous edits that a single page would need and having multiple devices to edit, it would take the Content Authors roughly 30-45 minutes for a single page to be finished. This would drive anyone mad...

> it would take 1-1.5 minutes for a single page to refresh or any action to be taken within Experience Editor

So what was causing the issue? As it turns out, the major issue with Experience Editor in the Sitecore 8 series (coming from earlier versions) is that everything is componentized and every component makes one or multiple requests to the backend to build out the UI (images, js, css, data requests, etc), for every page refresh.

More requests generally translates into more latency for the time to edit metric, but more requests shouldn't necessary halt all operations. After digging into the issue for several hours, I came across two major issues:

1. Sitecore Speak was not configured for Production usage
2. Azure Application Gateway v1 was inspecting every request

### Configuring the Speak UI for "Production" use

In general, I would recommend that you first tackle these type of performance issues by reviewing and profiling your custom components and then moving on to another layer in the stack. To quickly rule out the application as the bottleneck, we went ahead and disabled all components on the page and still faced the same latency. A blank layout was still taking roughly 1-1.5 minutes to be editable, that wasn't a good sign.

After reviewing the network requests generated by experience editor and noticing that each request was taking longer than expected, we figured out that by default in the Sitecore 8.2 series, the Sitecore Speak UI is configured for developers instead of production usage. To fix this, there are a few settings that need to be tweaked:

- **Speak.HttpCaching.SetMaxAge** - set to false. The default is true and sets the max age of the HTTP resource to 0 which will force the browser to always request the resources on refresh. Setting to false, sets an appropriate max-age for the resource so the browser can cache it.
- **Speak.Html.MinifyScripts** - set to true. The default is false and does not minify the Speak UI scripts
- **Speak.Html.MinifyStylesheets** - set to true. The default is false and does not minify the Speak UI stylesheets
- **IsProductionMode** - set to true. The default is false but it doesn't seem to be used anywhere - can't hurt right?

Example patch configuration:

```xml
<?xml version="1.0"?>
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
  <sitecore>
    <settings>
      <setting name="Speak.Html.MinifyScripts">
        <patch:attribute name="value">true</patch:attribute>
      </setting>
      <setting name="Speak.Html.MinifyStylesheets">
        <patch:attribute name="value">true</patch:attribute>
      </setting>
      <setting name="Speak.HttpCaching.SetMaxAge">
        <patch:attribute name="value">false</patch:attribute>
      </setting>
      <setting name="IsProductionMode">
        <patch:attribute name="value">true</patch:attribute>
      </setting>
    </settings>
  </sitecore>
</configuration>
```

By adding the patch configuration and refreshing the Sitecore page, the time to edit metric went from roughly 1.5 minutes to approx. 40 seconds - note that this only occurs after the page assets were cached by the browser, initial request was still delayed.

### **Configuring the Azure Application Gateway v1**

Unfortunately, 40 seconds until time to edit is still not good enough for a solid editing experience. So after a thorough review of all components and application settings it was time to investigate the network and infrastructure setup. To determine if the network was the issue, we loaded experience editor in three scenarios:

1. On the physical machine, removing all latency
2. Through the clients network, less latency
3. Through VPN

As we hoped, while on the physical machine and working with experience editor, the time to edit metric was roughly 6-8 seconds whereas going through the clients network/vpn was roughly 40 seconds. Whoa... you read that right... Something in the network stack was causing a **huge** performance penalty, almost 30-35 seconds of a latency penalty. After a week or two of toggling switches, speaking with the client's networking teams, and scratching our head of where the bottleneck was, we finally ran out of options and decided to start disabling features in the Azure stack. Luckily for us and this article, the first part of the stack was the Application Gateway which has a setting that enables the Web Application Firewall (WAF) and puts it into detection mode - this mode is diagnostic only and logs all threats, but does not block requests. After disabling the WAF on the Content Management server in the Application Gateway, the time to edit metric inside the clients network and through VPN dropped to roughly 10-12 seconds.

So due to how the Speak UI was modularized, the WAF was inspecting each individual request to determine if the request was a threat or not. This caused each individual request to suddenly take 400ms to 1 second longer per request, compounded by the number of requests the experience editor sends, it was easy to see where the issue was.

**A word of caution.** Disabling the WAF can open your infrastructure to security threats, be sure to review and follow the security hardening guidelines provided by Sitecore and

**Note**: Sitecore 8 series and Sitecore 9.0 supports the WAF in detection mode. Sitecore 9.1 fully supports the WAF and you can read more about that [here](https://doc.sitecore.com/developers/91/sitecore-experience-manager/en/using-azure-application-gateway-to-secure-your-content-delivery-server.html).

**Tl;Dr**

In a recent project, there were two undocumented issues that slowed down the experience editor performance:

- Experience Editor requesting a lot of resources without setting correct HTTP cache headers. To resolve, update Sitecore settings to set the cache headers correctly
- Azure Application Gateway enabled on the Content Management server, set to detection mode. To resolve, disable detection mode for the Content Management server
