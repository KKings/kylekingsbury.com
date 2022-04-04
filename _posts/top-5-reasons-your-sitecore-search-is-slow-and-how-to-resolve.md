---
title: "Top 5 reasons your Sitecore search is slow and how to resolve"
date: "2020-06-09"
metaDescription: "Is your Sitecore search crawling? Find out the top 5 reasons your Sitecore search is slow and how to resolve these issues"
metaKeywords: "Search, Performance, Tips"
categories: 
  - "Sitecore"
tags: 
  - "performance"
---

It's an all-too-familiar story--you were part of an implementation that created a beautiful search interface based on the latest UX trends and built on top of Sitecore's latest Content Search API. You tested the search interface locally and in your integration environment, and from your view, the results loaded in a timely manner. Heck, maybe you weren't even paying attention to the speed in which the results loaded. But then something terrible happens. The search implementation goes into production and WHAM! The business starts getting reports of how painfully slow the search results are loading. Granted, sometimes it takes months (or even years!) after the implementation for these issues to arise. But the business doesn't care--they want it fixed as soon as possible.

Whether you've been in this situation before, or are currently experiencing performance issues with your search results loading slow, let me offer some advice. First, before you blame the infrastructure or the latest code changes, take a few minutes and evaluate if your search implementation committed one of these common costly mistakes:

### 1.Querying Sitecore databases after retrieving search results

Querying Sitecore databases after retrieving search results is essentially taking each search result item that was found in your search index and using the Item API to retrieve the item from the database. This is typically because you need to output the URL of the item or to filter out the results based on additional criteria not stored in the index.

**What to do instead?**

Instead of querying the Sitecore databases after retrieving your search results, index everything that is needed to support the search interfaces alongside the document--including the relative URL. This favors the query time performance over the index time performance and, unless you have some crazy logic, this is a negligible performance issue that is easily justified.

### 2.Querying without pagination

Querying without pagination puts no limits on the number of records retrieved from the search index. 

Imagine if you went to your favorite search engine and typed in "pizza," and it attempted to show you everything it has relating to pizza. The results would be in the billions. Not only would this be extremely hard to scale for your favorite search engine, you would never be able to review everything that came back. The same principles can be applied to your search interfaces. Querying the search index without pagination will retrieve everything from the index that matches your criteria, and thus has a huge potential for retrieving a large number of records that will not be used by your site visitors.

**What to do instead?**

Use the Content Search LINQ paging methods, _Skip_ and _Take,_ provided by the Content Search API **on every call to the index**. By limiting the amount of data retrieved, you reduce the stress on the network as you have reduced the payload size between systems, as well as the amount of time both Sitecore and your search provider need to process the data. Additionally, I recommend setting the _ContentSearch.SearchMaxResults_ to a number between 100-1000. This setting controls the default number of results that the Content Search API will return if you do not use pagination.

### 3\. Selecting all fields for a search result

Selecting all fields for a search result takes all fields for a document in the index and returns them all for a search result, even though only a handful of the fields will be used.

Take for example Amazon's product catalog. Each product in that catalog could possibly contain 1,000+ dimensions or attributes for every product for sale (i.e. height, weight, width, depth, size, color, brand, rating, price, prime, etc). But when you search for products on Amazon, you do not see all 1,000+ dimensions. You only see a small subset, such as the Image, Title, Description, Rating, and Number of Reviews. 

**What to do instead?**

Instead of selecting all fields for a search result, limit the fields selected to only what is needed to support your search interface by using the _Select_ method from the Content Search API **on every call to the index**. As stated in #2, by limiting the amount of data retrieved for each record, you reduce the stress on the network as you have reduced the payload size between systems, as well as the amount of time both Sitecore and your search provider need to process the data.

### 4\. Enabling Content Search item security

By default, Sitecore Content Search item security is disabled, but can be enabled globally through a configuration setting or for each individual query. If item security is enabled for your query, Sitecore will automatically lookup the item in the database to check the context users permissions--therefore performing #1 for you without you knowing. 

**Note:** Sitecore 9.3 uses additional query filters to use item permissions within a query; this is the preferred approach and the most performant.

**What to do instead?**

For Sitecore versions earlier than 9.3, instead of enabling Content Search item security, leave it disabled. If your solution needs to apply security to restrict access to search results based on the role, my recommendation is to index the roles with the documents and then use queries to filter out the results (this is the approach 9.3 uses.)

### 5\. Querying without relevant filters/filtering in-memory

This is probably the easiest one, but querying without relevant filters is essentially not using the context of the search request with business rules to filter out unnecessary documents and then doing post-processing to filter out documents in-memory. In regards to the context, it can be anything from the template types needed, to the site the visitor is on, or even the language they are searching in (and many, many others).

**What to do instead?**

As mentioned in number #1, always favor the query time performance over the index time performance. All necessary fields to support querying and filtering, along with all fields to show within the search interface, should be indexed with the record. The rules of thumb here are to reduce the available results to the smallest dataset possible and to avoid filtering the search results in-memory and instead use the index to filter.

I hope you enjoyed this post. Please comment below with any questions; I'd love to hear from you!
