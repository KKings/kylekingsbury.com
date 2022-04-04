---
title: "Deliver faster with the Fluent ContentSearch Library"
date: "2017-05-12"
metaDescription: "Take the complexity out of complex queries with the Sitecore.ContentSearch.Fluent library; a simple fluent abstraction on top of the Sitecore ContentSearch API."
metaKeywords: "Sitecore, ContentSearch, Fluent, Abstraction, Faster Delivery"
categories: 
  - "Sitecore"
tags: 
  - "contentsearch"
  - "search"
---

With the Sitecore 7 release, Sitecore introduced the ContentSearch API to improve developer's lives by providing a familiar LINQ abstraction on top of Lucene and SOLR. This allowed developers to develop against a single API that could work with any search provider, all while using LINQ's very, very likable API.

While the ContentSearch API provides the abstraction over the search provider, it does not provide utilities to easily add common query clauses and expects the developer to know how to build these clauses. Furthermore, the logic needed to generate queries is often duplicated multiple times, across multiple files. If the logic to generate complex clauses is generic enough, why not have a reusable library to make building search driven components faster!

As such, for these many reasons, the Sitecore.ContentSearch.Fluent library was created to address these concerns and provide a fluent interface to build complex queries, easily.

##### Benefits of using the Sitecore.ContentSearch.Fluent library:

- Readable, Maintainable code
- Flexibility to change or add complex clauses with ease
- Reuse logic across classes (anyone still using a _SearchHelper_ type class, this is for you!)
- Unit-Testing (The ContentSearch API is unit-testable, you need to create the wrappers)
- You want to stop searching google for how to use the PredicateBuilder utilities :)

##### Abstractions on top of the ContentSearch API:

- Sorting
- Querying
- Filtering
- Pagination
- Projection (select)

##### Most importantly, the querying and filtering abstractions offer the following clauses:

- **And** - Creates a Group using the PredicateBuilder.True();
- **Or** - Creates a Group using the PredicateBuilder.False();
- **Not** - Creates a logical where using _Not_
- **Where** - Adds a simple filter clause to the expression tree
- **OrWhere** - Adds a simple filter clause to the expression tree with a starting _Or_ expression
- **All** - All terms provided must return true against the condition
- **OrAll** - All terms provided must return true against the condition with a starting _Or_ expression
- **Any** - Only one of the terms provided must return true against the condition
- **OrAny** - Only one of the terms provided must return true against the condition with a starting _Or_ expression
- **ManyAny** - For each group of terms, only one term in the group must match against the condition, but each group must match at least one
- **OrManyAny** - For each group of terms, only one term in the group must match against the condition, but each group must match at least one term with a starting _Or_ expression

##### Conditional Clauses:

- **IfWhere** - If the condition is true, adds the condition using the _Where_ method
- **IfOrWhere** - If the condition is true, adds the condition using the _OrWhere_ method staring with an _Or_ expression
- **IfAny** - If the condition is true, adds the condition using the _Any_ method
- **IfOrAny** - If the condition is true, adds the condition using the _OrAny_ method staring with an _Or_ expression
- **IfAll** - If the condition is true, adds the condition using the _All_ method
- **IfOrAll** - If the condition is true, adds the condition using the _OrAll_ method staring with an _Or_ expression
- **IfManyAny** - If the condition is true, adds the condition using the _ManyAny_ method
- **IfOrManyAny** - If the condition is true, adds the condition using the _OrManyAny_ method staring with an _Or_ expression

What is great is that developers can chain these clauses together to form very complex queries, without sacrificing readability. By chaining method calls and providing simple reusable clauses, developers can write maintainable, flexible and unit-testable code, faster.

Ok, cool. There are a lot of methods, but how does it compare to the out of the box ContentSearch API. Let's say we have the following requirements:

1. Get the 2nd page of articles, with 15 results
2. _Filter_ the articles by selected tags
    
    - Assume these are selections on the website
3. If selected, _filter_ the selected articles by if the article is considered a feature
    
    - Assume this is a toggle on the website
4. Sort the list in ascending order by the Created date

And here is the test data setup (this represents the user's selection on the website):

```c#
// Setting up test data
var tags = new List<string> { "Tag1", "Tag2" };
var isFeature = false;

Using the ContentSearch API, we would create something similar to this:

using (var context = ContentSearchManager.GetIndex("sitecore_web_index").CreateSearchContext())
{
    var predicate = PredicateBuilder.True<SearchResultItem>();

    predicate = predicate.Or(result => result.TemplateId == ArticlePage.TemplateId);

    var query = context.GetQueryable<SearchResultItem>().Filter(predicate);

    query = query.Page(2, 15);

    // Filter by the tags
    if (tags.Any())
    {
        var tagsPredicate = tags.Aggregate(PredicateBuilder.True<SearchResultItem>(), (current, tag) => current.And(query.Where(result => result.Tags.Contains(tag))));

        query = query.Where(tagsPredicate);
    }

    // Filter by if the article is a feature
    if (isFeature)
    {
        query = query.Where(result => result.IsFeature == true);
    }
               
    query = query.OrderBy(result => result.CreatedDate);

    var results = query.GetResults();
}
```

Not bad, however, there are a couple glaring issues. One is the verbosity of the API makes it harder to read and therefore, harder to maintain. Second it assumes the user is well versed in understanding the PredicateBuilder utility class. For complex queries, this can quickly get messy.

Let's see how the Sitecore.ContentSearch.Fluent library can help us out here:

```c#
/**
 * This example skips over the Dependency Injection of all services.
 * In practice, you would inject an ISearchManager interface into your classes
 */

var provider = ServiceLocator.ServiceProvider.GetService<ISearchProvider>();

using (var manager = new DefaultSearchManager(provider))
{
    var results = manager.ResultsFor<SearchResultItem>(search => search
        .Paging(paging => paging
            .SetPageMode(PageMode.Pager)
            .SetPage(2)
            .SetDisplaySize(15))
        .Query(q => q
            .And(and => and
                .IfAll(tags.Any(), tags, (result, tag) => result.Tags.Contains(tag))
                .IfWhere(isFeature, result => result.IsFeature == true)))
        .Filter(filter => filter
            .And(and => and
                .Where(result => result.TemplateId == ArticlePage.TemplateId)))
        .Sort(sort => sort
            .By(result => result.CreatedDate)));
}
```

Wow! Not only is the Fluent API easier to read, it makes more complex querying simple and intuitive by using the Fluent interface.

> By chaining method calls and providing simple reusable clauses, developers can write maintainable, flexible and unit-testable code, faster.

While this post is only an introduction on how to use the Sitecore.ContentSearch.Fluent library, the library is full of useful utilities that developers can make use in there next project. Be sure to check out the full source available on [github](https://github.com/KKings/Sitecore.ContentSearch.Fluent/tree/refactor-api).
