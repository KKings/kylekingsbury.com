---
title: "Sitecore Cache Extensions"
date: "2017-04-25"
metaDescription: "Sitecore cache extensions is a module for adding configuration based caches, in a unit-testable way."
metaKeywords: "Sitecore Caches, Caching, Configuration Based Caching, Unit-Testable Sitecore"
categories: 
  - "Sitecore"
tags: 
  - "caching"
  - "Helix"
  - "unit-test"
---

Months ago, I wrote a helix-based module for caching within Sitecore that allowed developers to add configuration-based caches to their projects in a unit-testable way. Without a proper introduction, the module didn't receive much fanfare... bummer. So, here goes...

##### Introducing the Sitecore Cache Extensions

The Sitecore Cache Extensions is a helix-based module that provides a configuration based instantiation of Sitecore caches. In addition, it provides extensibility endpoints for adding session caches and per-request caches (transient) that developers can easily add to their code to get the power of caching without sacrificing clean code. If you are still adding 'Helper' or 'CacheManager' type classes that wrap calls to a Sitecore cache or statically create the Sitecore cache, it's time to upgrade!

###### Adding Sitecore Cache Extensions to your project

Using the package manager console in Visual Studio, run the following command against the project you want to add caching too:

```powershell
Install-Package Sitecore.CacheExtensions
```

Running the command will add the necessary binaries, etc. After successfully adding the package to the project, it's time to configure some caches. Add a new Sitecore configuration file for caching; all Sitecore caches can be found at /sitecore/caches:

```xml
<?xml version="1.0"?>
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
    <sitecore>
        <caches>
            <cache name="example-cache" maxSize="100MB" lifespan="60" expirationType="sliding" />
        </caches>
    </sitecore>
</configuration
```

Each configured cache implements _ICache_ and _CustomCache_ (the Sitecore Cache). Looking at the above example, we have some properties we can configure:

- **maxSize** - the max size of the cache, expressed as a string representation. Examples: 100K, 100MB, 2GB
- **lifespan** - the lifetime of a single cache entry within the cache, expressed in seconds. Examples: 60, 360, 3600
- **expirationType** - the type of expiration for cache entries. Examples: sliding, absolute
    
    - Sliding expiration type expires cache entries after the timespan of the last accessed date
    - Absolute expiration type expires cache entries after the time span

Great, so we configured a cache, but how do you actually get access to the cache. Easy enough. The Sitecore Cache Extensions adds all dependencies and initial implementations to the out of the box Sitecore dependency injection container. For more information regarding Sitecore's dependency injection container, Kam Figy wrote a [great post](http://kamsar.net/index.php/2016/08/Dependency-Injection-in-Sitecore-8-2/.) with everything you need to get started. For our purposes, you will need to inject the _ICacheManager_, implemented by the _SitecoreCacheManager,_ into your implementations. The great thing is, the _SitecoreCacheManager_ returns an implementation of _ICache_ instead of _CustomCache_ (the Sitecore Cache) to keep the code independent of Sitecore. An example class implementing a fake IRepository for reference:

```c#
namespace Example
{
    using System;
    using KKings.Foundation.Caching.Caches;

    public StoreRepository : IRepository
    {
        /// <summary>
        /// Implementation of ICacheManager
        /// </summary>
        private readonly ICacheManager _cacheManager;

        /// <summary>
        /// ICacheManager injected by the DI Container after you
        /// have registered your class
        /// </summary>
        public StoreRepository(ICacheManager cacheManager)
        {
            this._cacheManager = cacheManager;
        }
    }
}
```

After we have a reference to the _ICacheManager_, implemented by the _SitecoreCacheManager_, we then can use the available methods on the _ICacheManager_ to get a reference to our configured cache 'example-cache' and call methods on the cache to get entries. Example method getting the configured cache and getting an entry by a key:

```c#
/// <summary>
/// Configured cache name
/// </summary>
private const string CacheName = "example-cache";

public virtual ICacheEntry Get(string key) 
{
    // Passing true here will throw an exception
    var cache = this._cacheManager.Get(CacheName, true);

    // Get a cache entry by key
    var entry = cache.Get(key);

    if (entry != null) 
    {
        return entry;
    }

    // If the entry was not found by key, add logic here to fetch and add it to the cache
}
```

Awesome, we have access to our configured caches while keeping our classes unit testable. Success!

While this post only covers using Sitecore Cache Extensions to configure Sitecore caches, it also provides implementations for caching within the session, implemented by _SessionCache_, or per request, _TransientCache_. Be sure to check out the full source available on [github](https://github.com/KKings/Sitecore.CacheExtensions).
