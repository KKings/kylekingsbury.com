---
title: "Sitecore Page Mode Switcher"
date: "2017-07-22"
metaDescription: "A useful utility to switch the page mode dynamically."
metaKeywords: "Sitecore, Page Mode, Normal Mode, Edit Mode, Switcher"
categories: 
  - "Sitecore"
---

Every now and again I find myself looking for a way to easily switch the Sitecore PageMode for a code block for either testing what happens when in specific modes or render renderings a specific way. The easiest solution is to use _**SetDisplayMode**_ on the Context Site:

```c#
Sitecore.Context.Site?.SetDisplayMode(DisplayMode.Normal, DisplayModeDuration.Temporary);
```

While this is very clean and simple, it often leads to repetitive code blocks. I wonder why Sitecore doesn't provide a _**PageModeSwitcher**_ as part of the out of the box API just like the _**ContextItemSwitcher, SiteContextSwitcher,**_ or _**DatabaseSwitcher**_ (any others to be honest).

Since a switcher is not available out of the box, we can create our own using the _**SetDisplayMode**_ method and implement _**IDisposable**_:

```c#
namespace Example
{
    using System;
    using Sitecore.Sites;

    public sealed class PageModeSwitcher : IDisposable
    {
        /// <summary>
        /// The Desired Display Mode while in the context
        /// </summary>
        private readonly DisplayMode desiredMode;

        /// <summary>
        /// THe Previous Display Mode that will be transitioned out of the context to
        /// </summary>
        private readonly DisplayMode previousMode;

        /// <summary>
        /// Gets the Current DisplayMode
        /// </summary>
        private DisplayMode CurrentMode => Sitecore.Context.Site?.DisplayMode ?? DisplayMode.Normal;

        public PageModeSwitcher(DisplayMode desiredMode)
        {
            this.desiredMode = desiredMode;
            this.previousMode = Sitecore.Context.Site?.DisplayMode ?? DisplayMode.Normal;

            this.Enter();
        }

        /// <summary>
        /// Enters the Desired Mode if not already within the Display Mode
        /// </summary>
        public void Enter()
        {
            if (this.CurrentMode != this.desiredMode)
            {
                Sitecore.Context.Site?.SetDisplayMode(this.desiredMode, DisplayModeDuration.Temporary);
            }
        }

        /// <summary>
        /// Exists the Desired Mode if not already within the Display Mode
        /// </summary>
        public void Exit()
        {
            if (this.CurrentMode != this.previousMode)
            {
                Sitecore.Context.Site.SetDisplayMode(this.previousMode, DisplayModeDuration.Remember);
            }
        }
        
        public void Dispose()
        {
            this.Exit();
        }
    }
}
```

And to use, we simply do the following:

```c#
using (new PageModeSwitcher(DisplayMode.Edit))
{
    // Execute code as if the mode was in Experience Editor
}
```

Do you have any tips and tricks that you want to share? Comment below!
