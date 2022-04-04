---
title: "Pattern for implementing a custom HtmlCacheClearer"
date: "2019-12-12"
metaDescription: "Pattern for handling local and remotes events when implementing a custom HtmlCacheClearer"
metaKeywords: "Sitecore, HtmlCacheClearer, Remote and Local Events"
categories: 
  - "Sitecore"
tags: 
  - "patterns"
  - "publishing"
---

While there are many blog posts detailing how to implement a custom HtmlCacheClearer, some of these blog posts omit the fact that the out of the box HtmlCacheClearer can be used with multiple type of _EventArgs._ The reason for multiple types of _EventArgs_ is due to the separation of how the cache is being cleared through the event manager, either from a local event or from a remote event. Note that generally local events are executed on the machine that initiated the action, whereas, a remote event will be executed on the machine that is listening to these events - rule of thumb, your CM server listens to local events and your CD server will listen to the remote events. You typically only care about accessing the _EventArgs_ when you need to know more about what parameters were used when clearing the cache, such as the Target database, the language, the root item, etc.

With this post, I want to provide a base implementation of the HtmlCacheClearer that provides a clean separation for processing local and remote events.

```c#
public abstract class BaseHtmlCacheClearer<T1, T2> 
    where T1: SitecoreEventArgs
    where T2: PublishEndRemoteEventArgs
{
    public virtual void ClearCache(object sender, EventArgs args)
    {
        if (args == null)
        {
            return;
        }

        switch (args)
        {
            case T1 t1Args:
            {
                this.ClearCache(sender, t1Args);
                return;
            }
            case T2 t2Args:
            {
                this.ClearCache(sender, t2Args);
                return;
            }
            default:
            {
                throw new NotImplementedException($"Unsupported type found, {args.GetType().FullName}");
            }
        }
    }

    protected abstract void ClearCache(object sender, T1 args);

    protected abstract void ClearCache(object sender, T2 args);
}
```

The base implementation exposes separate methods for clearing local and remote events. To implement a custom HtmlCacheClearer we simply need to create a derived type of _BaseHtmlCacheClearer_ and set the generic types we are targeting. For instance, we could do the following:

```c#
public class HtmlCacheClearer : BaseHtmlCacheClearer<SitecoreEventArgs, PublishEndRemoteEventArgs>
{
    protected override void ClearCache(object sender, SitecoreEventArgs args)
    {
        // Write your code here for the local event
    }

    protected override void ClearCache(object sender, PublishEndRemoteEventArgs args)
    {
        // Write your code here for the remote event
    }
}
```

As a bonus, here is another example of an implementation using the _BaseHtmlCacheClearer_ that pulls parameters from both _EventArgs_ and centralizes the logic for executing your custom code:

```c#
public class HtmlCacheClearer : BaseHtmlCacheClearer<SitecoreEventArgs, PublishEndRemoteEventArgs>
{
    protected override void ClearCache(object sender, SitecoreEventArgs args)
    {
        var publisher = Event.ExtractParameter(args, 0) as Publisher;

        if (publisher == null)
        {
            // Log a useful message
            return;
        }

        var database = publisher.Options.TargetDatabase;
        var rootItem = publisher.Options.RootItem;
        var language = publisher.Options.Language;

        this.ClearCache(database, rootItem, language);
    }

    protected override void ClearCache(object sender, PublishEndRemoteEventArgs args)
    {
        var database = Database.GetDatabase(args.TargetDatabaseName);
        var language = Language.Parse(args.LanguageName);
        var rootItemId = ID.Parse(args.RootItemId);
        var rootItem = database.GetItem(rootItemId, language);

        this.ClearCache(database, rootItem, language);
    }

    protected virtual void ClearCache(Database database, Item rootItem, Language language)
    {
        Assert.IsNotNull(database, "database != null");
        Assert.IsNotNull(rootItem, "rootItem != null");
        Assert.IsNotNull(language, "language != null");

        // Write your custom code
    }
}
```
Hope you enjoyed this post!
