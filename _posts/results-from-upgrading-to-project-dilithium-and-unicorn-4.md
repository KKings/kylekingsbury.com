---
title: "Results from upgrading to Project Dilithium and Unicorn 4"
date: "2017-06-27"
metaDescription: "Testing driving the latest from Unicorn 4 and Project Dilithium."
metaKeywords: "Sitecore, Unicorn, Serialization, Dilithium, Performance"
categories: 
  - "Sitecore"
tags: 
  - "continuous-integration"
  - "unicorn"
---

If you haven't been following along with the community, the serialization framework that has quickly become the standard for Sitecore received an upgrade this past week. I don't think the timing of this release could have come at a better time, as i've been experiencing really poor performance with synching Unicorn with an _underpowered_ environment. With Unicorn 4 being touted as a drop-in replacement for Unicorn 3, I just needed to find the time to upgrade the package and tweak our CI/CD process. 

### Project woes, terrible sync times

As part of our continuous integration process for a project I am actively working on, we are using Visual Studio Team Services (VSTS) to build and release to our development and upper environments. The biggest bottleneck of our release process, was to my surprise, synching Unicorn. What I felt should have taken a few minutes to sync Unicorn, was taking up to 30 minutes (or longer) to push out the latest release, with or without any actual changes to the serialized items. I know I mentioned this environment is entirely unpowered, and it really is, but I can't control that ;)

Anyways, because Unicorn was taking what felt like forever, the VSTS agent installed on the machines would sometimes timeout causing a failed build. Failed builds, from syncing changes that took long? Unacceptable! Keep in mind also, VSTS also charges per the minute when using the hosted agent, hanging builds equals more money. Yikes!

### Enter Project Dilithium, Unicorn 4

Upgrading to Unicorn 4 and enabling Dilithium is a fairly straightforward process. Upgrade the NuGet package and rename the file, Unicorn.Dilithium.config.example to Unicorn.Dilithium.config. For more information, check out the [Github project](https://github.com/kamsar/Unicorn).

Let me tell you, the performance was immediately noticeable in my local development environment. With 50ish different configurations, Unicorn 4 handled everything in less than a minute.

The real test would come after I submit a pull-request to push the new changes to the upper environments. An approval later and guess what... Unicorn 4 worked flawlessly. What seemed like a lifetime to sync changes (or no changes at all) to the development environment, was now taking 1-3 minutes.

Granted all mileage will vary with Unicorn 4, but for our setup, project Dilithium was a much needed addition!
