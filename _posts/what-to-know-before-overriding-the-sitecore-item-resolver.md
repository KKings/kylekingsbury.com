---
title: "Overriding the Sitecore Item Resolver? Watch out for the mvc.getPageItem pipeline!"
date: "2017-08-05"
metaDescription: "When overriding the Sitecore Item Resolver to add custom item resolution using Sitecore Mvc, the mvc.getPageItem pipeline is your worst enemy! Find out how to resolve."
metaKeywords: "Sitecore, Mvc, ItemResolver, Override, mvc.getPageItem, httprequestbegin"
categories: 
  - "Sitecore"
tags: 
  - "configuration"
  - "mvc"
---

Something that has been a bit annoying to me when developing custom _ItemResolver's_ for Sitecore MVC is that you cannot simply add logic into the _httpRequestBegin_ pipeline to add your custom logic. No, that would be too simple right? If you are using Sitecore MVC than not only must you do your Item Resolution logic within the _httpRequestBegin_, you must also override or rearrange the _mvc.getPageItem_ pipeline so that the MVC pipelines do not override or cannot find your _Sitecore.Context.Item._

### Sitecore MVC Background

To accommodate MVC many years ago, Sitecore added several processors to detect when a route or a layout needed MVC and if so it would transfer processing to MVC or ignore the request entirely. After Sitecore detects that the request needs MVC it will run the _mvc.getPageItem_ which does similar processing to what the _ItemResolver_ does within the _httpRequestBegin_ pipeline except that it doesn't assume that an Item was already found. Seems odd that we would have the same logic run twice... In any case, if we look at the important processors in the _mvc.getPageItem_ pipeline we find the following (in this order):

- **SetLanguage** - Sets the Sitecore.Context.Language
- **GetFromRouteValue** - Sets the Sitecore.Context.Item by replacing values within the URL with route data
- **GetFromRouteUrl** - Sets the Sitecore.Context.Item by querying Sitecore with the URL path in relation to the Sitecore.Context.Site's StartItem
- **GetFromOldContext** \- Sets the Sitecore.Context.Item by using the original Sitecore.Context.Item found within the _httpRequestBegin_

If we back up for a moment and dig a little deeper into the source code we find that the real flaw in logic comes within _mvc.requestBegin_ and creating the _PageContex_t. The _PageContext_ contains a method, _GetItem_, that essential calls the _mvc.getPageItem pipeline_ regardless of whether there is already a _Sitecore.Context.Item_ or _Sitecore.Context.Language_ found. Oh Sitecore... If you already did the work to find the Language and the Context.Item, the _mvc.getPageItem_ pipeline should probably not run.

### How to resolve

The really simple solution to resolve this issue is to reorder the processors within the _mvc.getPageItem_ pipeline so that _GetFromOldContext_ always comes after the _SetLanguage_ processor.

```xml
<sitecore>
  <pipelines>
    <mvc.getPageItem>
      <processor type="Sitecore.Mvc.Pipelines.Response.GetPageItem.GetFromOldContext, Sitecore.Mvc">
        <patch:delete />
      </processor>
      <processor patch:after="processor\[@type='Sitecore.Mvc.Pipelines.Response.GetPageItem.SetLanguage, Sitecore.Mvc'\]" type="Sitecore.Mvc.Pipelines.Response.GetPageItem.GetFromOldContext, Sitecore.Mvc"/>
    </mvc.getPageItem>
  </pipelines>
</sitecore>
```

A little more involved solution is to override the _PageContext_ to fix the issue; to do that we need to override the _SetupPageContext_ processor to add our custom _PageContext (fair warning, I did not test this :( ):_

```c#
namespace Example
{
    using System.Web.Routing;
    using Sitecore.Data.Items;
    using Sitecore.Mvc.Pipelines.Request.RequestBegin;
    using Sitecore.Mvc.Presentation;

    public class SetupPageContext : Sitecore.Mvc.Pipelines.Request.RequestBegin.SetupPageContext
    {
        protected override PageContext CreateInstance(RequestContext requestContext, RequestBeginArgs args)
        {
            return new PageContextFixed
            {
                RequestContext = requestContext
            };
        }
    }

    public class PageContextFixed : PageContext
    {
        protected override Item GetItem()
        {
            // Assumption: If you have a Context.Item you have to have a Context.Language
            return Sitecore.Context.Item ?? base.GetItem();
        }
    }
}
```

And the configuration:

```xml
<sitecore>
  <pipelines>
    <mvc.requestBegin>
      <processor patch:instead="processor\[@type='Sitecore.Mvc.Pipelines.Request.RequestBegin.SetupPageContext, Sitecore.Mvc'\]" type="Example.SetupPageContext,Example" />
    </mvc.requestBegin>
  </pipelines>
</sitecore>
```

There we go, two simple solutions to fix Sitecore MVC issues with using Sitecore MVC and custom ItemResolvers.
