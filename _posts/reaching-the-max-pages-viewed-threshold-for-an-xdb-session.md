---
title: "Reaching the max pages viewed threshold for an xDb Session"
date: "2018-04-29"
metaDescription: "Understanding and handling the error message, Session with Id [session id] has reached the max page threshold of 50"
metaKeywords: "xDb, Sitecore, Session, xProfile"
categories: 
  - "Sitecore"
tags: 
  - "debugging"
  - "xdb"
---

In my current project, I came across an odd issue for a component that was developed using interactions captured by xDb where xDb would completely stop tracking after what appeared to be at arbitrary intervals. To some testers, xDb would stop tracking after 9 page views, others it was 10-12 page views. What I didn't know at the time was that Sitecore xDb comes configured with a setting, _MaxPageIndexThreshold (set to 50)_, on the _SetDummySession_ processor within the _ensureSessionContext_ pipeline that ultimately will stop tracking after a threshold is met. Who knew! Luckily for me, Sitecore was logging a very informative error message when this threshold had been hit:

> Session with Id _\[session id\]_ has reached the max page threshold of 50. If you see this message regularly, you should increase configuration parameter MaxPageIndexThreshold to avoid loss of valid data

Understanding the error was straightforward, xDb had stopped tracking all interactions after it hit the _MaxPageIndexThreshold_ of 50. But how was the system reaching this limit only after 9-12 reported page views? After a brief look into Sitecore xProfile and MongoDb, it was pretty obvious, we had set up tracking on all of our API requests. So for every page view, we would potentially be triggering 3-6 additional page views.

![Homer, being homer](https://media.giphy.com/media/xT5LMESsx1kUe8Hiyk/giphy.gif)

Resolving the issue was a simple change in configuration, however, removing all of our AJAX requests from being tracked was a little trickier. Luckily, EPAM Systems very own Pavel Veller had written a [post](http://jockstothecore.com/xdb-tracking-the-untrackable-part-2/) a few years back about how to track AJAX requests as a page event for the previous page. Using a modified version of Pavel's code, I was able to remove unnecessary tracking of AJAX requests as page views. With the change in configuration and removing of unnecessary tracking, the issue was non-existent.

While the issue was self-inflicted, I definitely learned my lesson. On my current and future projects, I will only be tracking AJAX requests as page events and only for AJAX requests that were triggered by the visitor.
