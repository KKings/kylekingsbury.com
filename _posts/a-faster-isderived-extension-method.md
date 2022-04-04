---
title: "A faster IsDerived Extension Method"
date: "2019-12-09"
author: "Kyle Kingsbury"
metaDescription: "Using the IsDerived extension method? Find out how to refactor to improve performance."
metaKeywords: "Performance, Sitecore, IsDerived, Extension Method"
categories: 
  - "Sitecore"
tags: 
  - "performance"
  - "extensions"
---

If you have been around Sitecore development long enough, you have undoubtedly run into the extension method 'IsDerived'. This extension method allows developers to easily determine whether an item inherits from a specific base template; the template can be anywhere in the inheritance chain. This opens up a lot of possibilities for developers to customize the inheritance chain for their templates. For instance, it allows multiple sites to inherit from a single template, allowing each site to provide their own standard values (in the Helix world, the Feature modules would provide the single template, with each Project inheriting this template).

In recent performance testing for a project I was working on, I noticed that under load, the IsDerived extension method as originally written was taking about 30-60ms per request (again, this is under load). While not extremely high, it was higher than we were comfortable with and any tweaks that we could make would be beneficial in the long-term, especially when code like the IsDerived extension method is so widely used.

Below you can find the updates to the IsDerived extension methods that I came up with that reduced the time taken under load - in our tests, the time per request under load was negligible.

```c#
public static class ItemExtensions
{
    /// <summary>
    /// Determine if the Item inherits a specific template, by ID
    /// </summary>
    /// <param name="item">The item</param>
    /// <param name="templateId">The template id</param>
    /// <returns><c>True</c> if the item inherits from <paramref name="templateId"/></returns>
    public static bool IsDerived(this Item item, ID templateId)
    {
        if (item == null)
        {
            return false;
        }

        return !templateId.IsNull && item.IsDerived(item.Database.GetItem(templateId, item.Language));
    }

    /// <summary>
    /// Determine if the Item inherits a specific template, by TemplateItem
    /// </summary>
    /// <param name="item">The item</param>
    /// <param name="inheritedTemplateItem">the templateItem</param>
    /// <returns><c>True</c> if the item inherits from <paramref name="inheritedTemplateItem"/></returns>
    public static bool IsDerived(this Item item, Item inheritedTemplateItem)
    {
        if (item == null
            || inheritedTemplateItem == null)
        {
            return false;
        }

        var itemTemplate = TemplateManager.GetTemplate(item);

        return itemTemplate != null && (itemTemplate.ID == inheritedTemplateItem.ID || itemTemplate.InheritsFrom(inheritedTemplateItem.ID, item.Database));
    }
}

public static class TemplateExtensions
{
    public static ID StandardTemplateId = ID.Parse("{1930BBEB-7805-471A-A3BE-4858AC7CF696}");

    /// <summary>
    /// 
    /// </summary>
    /// <param name="template"></param>
    /// <param name="inheritedId"></param>
    /// <param name="database"></param>
    /// <returns></returns>
    public static bool InheritsFrom(this Template template, ID inheritedId, Database database)
    {
        if (template == null || database == null)
        {
            return false;
        }

        if (template.ID == inheritedId)
        {
            return true;
        }

        var hasBaseTemplate = template.BaseIDs.Any(baseId => baseId == inheritedId);

        if (hasBaseTemplate)
        {
            return true;
        }

        var baseTemplates = template.BaseIDs
                                    .Where(baseId => baseId != TemplateExtensions.StandardTemplateId)
                                    .Select(baseId => TemplateManager.GetTemplate(baseId, database));

        return baseTemplates.Any(baseTemplate => baseTemplate != null && baseTemplate.InheritsFrom(inheritedId, database));
    }
}
```
This should be a drop-in replacement for your existing extension methods. Give it a try and let me know how it worked for you in the comments!