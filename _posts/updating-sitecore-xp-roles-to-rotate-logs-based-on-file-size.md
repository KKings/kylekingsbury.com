---
title: "Updating Sitecore XP Roles to rotate logs based on file size"
date: "2020-05-21"
metaDescription: Learn how to update Sitecore XP Roles using Serilog to rotate logs and set a smaller file size limit, than the default 1GB."
metaKeywords: "Sitecore, xConnect, XP Roles, Logging, limit"
categories: 
  - "Serilog"
---

By default, logging within Sitecore XP roles uses a 1GB size limit per file and retains limits logs to 7 entries, logs are rolled per date. What this means, **is if you hit the 1GB file size limit, logging will be stopped for that day and will resume the next** day. There are two issues here, one is the file size of the log getting too big, and second, the logging stops after hitting that threshold potentially losing valuable data. Now I know what you are thinking, if the file size is getting that large it obviously means there are some issues that need to be resolved. And I agree, but that is a separate issue.

For this post, I want to provide a recipe for updating the Serilog configuration for the XP roles to set a much lower file size limit and allow the files to be rotated once that limit is reached. So lets jump right in!

## Updating Serilog to rotate logs based on File Size

Configuring the logging for xDB and related workers is vastly different than configuring logging for the core roles. The default location to configure logging for Sitecore XP roles is at _App\_Data\\Config\\Sitecore\\CoreServices\\sc.Serilog.xml_ and can be used to update Serilog to rotate logs to our needs. 

**Note:** Sitecore's XP roles use Serilog and the File and the Rolling File Sink's to create logs**.** The Rolling File Sink is deprecated and has been rolled into the FileSink in later versions of Serilog. 

For any XP role, navigate to the directory, _App\_Data\\Config\\Sitecore\\CoreServices\\sc.Serilog.xml_ and update the configuration with the following:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Settings>
  <Serilog>
    <Using>
      <FileSinkAssembly>Serilog.Sinks.File</FileSinkAssembly>
      <RollingFileSinkAssembly>Serilog.Sinks.RollingFile</RollingFileSinkAssembly>
    </Using>
    <MinimumLevel>
      <Default>Information</Default>
    </MinimumLevel>
    <WriteTo>
      <FileSink>
        <Name>File</Name>
        <Args>
          <path>App\_Data\\\\Logs\\\\xconnect-log-${MachineName}-${InstanceName}-.txt</path>
          <rollingInterval>Day</rollingInterval>
          <rollOnFileSizeLimit>True</rollOnFileSizeLimit>
          <fileSizeLimitBytes>10000000</fileSizeLimitBytes>
          <retainedFileCountLimit>7</retainedFileCountLimit>
          <buffered>False</buffered>
        </Args>
      </FileSink>
    </WriteTo>
    <Properties>
      <Application>XConnect</Application>
    </Properties>
  </Serilog>
</Settings>
```

This configuration changes a few things:

* Updates to use the FileSink instead of the obsolete RollingFileSink
* Sets the path and removes redundant arguments(timestamp)
* Sets the rollingInterval, rollOnFileSizeLimit, fileSizeLimitBytes arguments to configure the File Sink to rotate the logs by file size
  * In this configuration, the fileSizeLimitBytes is set to 10000000, which is roughly 10MB

I hope you find this recipe useful! If you have any questions, let me know in the comments!
