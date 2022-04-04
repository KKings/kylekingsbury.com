---
title: "Failed to synchronize segments. Message: Value cannot be null"
date: "2018-05-12"
metaDescription: "Learn about a Sitecore bug that could be affecting your Sitecore installation."
metaKeywords: "Sitecore, Hotfix, Bug, Experience Analytics, Hotfix"
categories: 
  - "Sitecore"
tags: 
  - "hotfix"
---

Probably once or twice a week, I take a few moments to review the Sitecore Logs looking for errors that may have been introduced that could be affecting our environments. While not a new message, I finally had a few moments to investigate what appears to be a common error for Sitecore 8.2 - 170407. If you are coming here after searching google, know you aren't doing anything wrong, this is a bug with Sitecore that has been resolved with a hotfix. To review, you can use the official reference number 141171.

```
FATAL [Experience Analytics]: Failed to synchronize segments. Message: Value cannot be null.
Parameter name: item. Details:    at Sitecore.Diagnostics.Assert.ArgumentNotNull(Object argument, String argumentName)
   at Sitecore.Workflows.Simple.WorkflowProvider.GetWorkflow(Item item)
   at Sitecore.ExperienceAnalytics.Core.Extensions.SegmentDefinitionExtensions.GetLanguageIndependentWorkFlowState(SegmentDefinition segmentDefinition)
   at Sitecore.ExperienceAnalytics.Client.Deployment.SyncSegmentsManager.<>c.<GetSegmentsToSynchronize>b__7_0(SegmentDefinition segmentDefinition)
   at System.Linq.Enumerable.WhereEnumerableIterator`1.MoveNext()
   at System.Collections.Generic.List`1..ctor(IEnumerable`1 collection)
   at System.Linq.Enumerable.ToList[TSource](IEnumerable`1 source)
   at Sitecore.ExperienceAnalytics.Client.Deployment.SyncSegmentsManager.GetSegmentsToSynchronize()
   at Sitecore.ExperienceAnalytics.Client.Deployment.SyncSegmentsManager.SynchronizeAllSegments()
   at System.Threading.Tasks.Task.Execute()
--- End of stack trace from previous location where exception was thrown ---
   at System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()
   at System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification(Task task)
   at Sitecore.ExperienceAnalytics.Client.Deployment.SyncSegmentsProcessor.<Process>d__4.MoveNext()
```

The hotfix is actually relatively straight-forward, you will need a new patch configuration file to override the default domain. Below is the configuration that _should_ resolve your issue; it is recommended to put in a App_Config\Include\zzz folder structure so it is loaded after all other configuration files.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
   <sitecore>
      <domainManager defaultProvider="config">
         <providers>
            <add name="config">
               <patch:attribute name="defaultDomain">default</patch:attribute>
            </add>
         </providers>
      </domainManager>
   </sitecore>
</configuration>
```

So what causes this issue? Simple, it's a security issue. Within the _GetLanguageIndependentWorkFlowState_ method, the code tries to get the item representing the Segment without being wrapped with a _SecurityDisabler_, so the database will try to get the item as _sitecore\anonymous_. Since the _sitecore\anonymous_ user does not have access to system level items, the database will return a null value and unfortunately, the _null_ value was not anticipated by the development team and therefore will throw an exception. For reference, the _SecurityDisabler_ causes code to run in the context of a user with administrative rights.

If you are still having trouble, you can find another potential solution on this [stackexchange](https://sitecore.stackexchange.com/questions/7099/failed-to-synchronize-segments) question.
