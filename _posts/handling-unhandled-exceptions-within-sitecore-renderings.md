---
title: "Handling Unhandled Exceptions within Sitecore Renderings"
date: "2017-06-28"
metaDescription: "Learn how to handle unhandled exceptions within your Sitecore renderings."
metaKeywords: "Sitecore, Handling exceptions, Renderings, Views, Controllers"
categories: 
  - "Sitecore"
tags: 
  - "exceptions"
  - "unit-test"
  - "user-experience"
---

Even the best developers cannot stop the inevitable from happening. Whether it be a mistyped variable name within a view, an invalid content type set, or the dreaded _null reference exception;_ errors like these and others creep up from time to time that can in some cases, bring down your Sitecore implementation. Nothing hits a developer harder than knowing their code took down the site, but i'd argue it is much, much worse for the site visitor trying to access that resource and seeing an error message.

While these types of errors cannot be avoided, it's best to have a solution in place to mitigate the risk of having errors in your controllers or views take down a page. Luckily for us, Sitecore has improved the MVC implementation a bit since being first introduced and have exposed a series of classes that wrap the execution of all MVC renderings and provide the ability to add an _ErrorStrategy_ upon errors. This is pretty great and given the way Sitecore typically builds things, this is super flexible and can be modified.

> Nothing hits a developer harder than knowing their code took down the site, but i'd argue it is much, much worse for the site visitor trying to access that resource and seeing an error message.

Doing a little digging into the binaries with dotPeek, I notice that the default _ErrorStrategy,_ the _PageModeRenderingErrorStrategy_ class, will display the stack trace within the Experience Editor but allow the error to bubble up to Asp.net as an uncaught exception (if caught by Asp.net, this typically means the yellow screen of death). As I mentioned above, it's far worse to have the site taken down from silly mistakes within your Sitecore rendering, so if the rendering fails to render it should just not render itself.

### The 'catch all' error strategy

Let's create a new _IRendererErrorStrategy_ that has a few goals:

- Be unit-testable :)
- Catch all exceptions
- Log the full stacktrace 
- Inject HTML in place of where the rendering would have rendered on the page, but only for Experience Editor modes

```c#
/// <summary>
/// The backup plan for the inevitable
/// </summary>
public class CatchAllRendererErrorStrategy : IRendererErrorStrategy
{
    /// <summary>
    /// Sitecore Logger Implementation
    /// </summary>
    public virtual BaseLog Logger { get { return ServiceLocator.ServiceProvider.GetService<BaseLog>(); } }

    /// <summary>
    /// Are we in Normal Page Mode
    /// </summary>
    public virtual bool IsNormalMode { get { return Sitecore.Context.PageMode.IsNormal; } }

    /// <summary>
    /// Handle any exception directly. If we are in NormalMode, show nothing
    /// but if we are not, let's show an error block to alert the Content Author
    /// </summary>
    public virtual bool HandleError(Renderer renderer, Exception ex, TextWriter writer)
    {
        this.Logger.Error("Rendering Error", ex, typeof(CatchAllRendererErrorStrategy));

        if (!this.IsNormalMode)
        {
            var container = new TagBuilder("div");
            container.Attributes.Add("class", "alert alert-danger");
            container.InnerHtml = "This rendering failed to render. Please contact support to troubleshoot.";

            writer.Write(container.ToString());
        }

        return true;
    }
}
```

As you can see from the snippet above, the main point of entry for our new _ErrorStrategy_ is the _HandleError_ method which gives us everything we need to handle the error. We first log the exception to Sitecore, move on to checking if we are in Experience Editor and if so writing an error block to the current TextWriter, all while being 100% unit-testable. Also note, always returning _true_, catches the error entirely so it cannot be bubbled up.

### Registering our error strategy

Registering this strategy is fairly straightforward. We need to patch our _ErrorStrategy_ before the default one; registering this feels clunky, so if you can find a better way to register this _ErrorStrategy,_ let me know in the comments! 

```xml
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
  <sitecore>
    <pipelines>
      <mvc.renderRendering>
        <processor type="Sitecore.Mvc.Pipelines.Response.RenderRendering.ExecuteRenderer, Sitecore.Mvc">
          <param type="Sitecore.Mvc.Pipelines.Response.RenderRendering.HttpExceptionWrappingRendererErrorStrategy, Sitecore.Mvc" desc="rendererErrorHandler">
            <param type="Sitecore.Mvc.Pipelines.Response.RenderRendering.ChainedRendererErrorStrategy, Sitecore.Mvc" desc="rendererErrorHandler">
              <Handlers hint="list">
                <handler patch:before="handler[@type='Sitecore.Mvc.Pipelines.Response.RenderRendering.PageModeRenderingErrorStrategy, Sitecore.Mvc']" type="[Namespace, DLL]"/>
              </Handlers>
            </param>
          </param>
        </processor>
      </mvc.renderRendering>
    </pipelines>
  </sitecore>
</configuration>
```

_Note: Replace the **[Namespace, DLL]** with your binary information._

To test out the functionality, I created an example rendering on the page (or used an existing one) and threw an exception in the view or controller rendering. And here is an example of our _ErrorStrategy_ in Experience Editor (assumes you are using Bootstrap for styling):

![](data:image/png;base64,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)

Does your team follow a different approach? Let me know in the comments!
