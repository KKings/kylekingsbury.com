---
title: "Configuring Sitecore's SolrProvider to use SolrPostConnection"
date: "2017-09-07"
metaDescription: "Learn how to switch Sitecore's SolrProvider to use a HTTP POST instead of the default GET"
metaKeywords: "Sitecore, Solr, ContentSearch, POST"
categories: 
  - "Sitecore"
tags: 
  - "contentsearch"
  - "Sitecore"
  - "solr"
---

By default, Sitecore's ContentSearch Solr implementation is configured to send all requests to Solr using a HTTP **GET**. For most implementations, this is fine and shouldn't need to be changed. However, if you are doing very complex queries you'll quickly run into IIS's web server query string and URL length limits. You have two options at this point, configure the limits within the _web.config_ absurdly high or change the way Sitecore send's request to Solr. Since i've tried doing option 1 before with no luck, I prefer the latter as the limits for using **POST** are much, much higher.

Luckily for us with the latest release of Sitecore, the ContentSearch SolrProvider includes a default container with the ability to swap things in and out. If you are running an older version of Sitecore this was a fairly decent amount of work; lucky for you i've already built a [NuGet package](https://www.nuget.org/packages/Castle.Facilities.SolrNetIntegration/) ready for you to use.

### Configuring Sitecore to send POST requests instead of GET's

First up, we need to extend the _DefaultSolrStartUp_ class and override the _CreateConnection_ method to change out the original _SolrConnection_ from SolrNet to return _PostSolrConnection_ implementation.

namespace Example
{
    using Sitecore.ContentSearch.SolrProvider;
    using SolrNet;
    using SolrNet.Impl;

    public class SolrPostStartUp : DefaultSolrStartUp
    {
        /// <summary>
        /// Override the default implementation to use the SolrNet PostSolrConnection
        /// </summary>
        protected override ISolrConnection CreateConnection(string serverUrl)
        {
            var solrConnection = base.CreateConnection(serverUrl);

            var postConnection = new PostSolrConnection(solrConnection, serverUrl);

            return postConnection;
        }
    }
}

Next up, we need to create an instance of our _SolrPostStartUp_ class and call the base _Initialize_ method.

namespace Example
{
    using Sitecore.ContentSearch.SolrProvider;
    using Sitecore.ContentSearch.SolrProvider.SolrNetIntegration;
    using Sitecore.Pipelines;

    public class InitializeSolrPostProvider
    {
        public void Process(PipelineArgs args)
        {
            if (!SolrContentSearchManager.IsEnabled)
            {
                return;
            }

            if (IntegrationHelper.IsSolrConfigured())
            {
                IntegrationHelper.ReportDoubleSolrConfigurationAttempt(this.GetType());
            }
            else
            {
                new SolrPostStartUp().Initialize();
            }
        }
    }
}

And lastly, we need to override Sitecore's _initialize_ processor with our new processor.

<?xml version="1.0"?>
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/" xmlns:set="http://www.sitecore.net/xmlconfig/set/">
    <sitecore>
        <pipelines>
            <initialize>
                <processor type="Sitecore.ContentSearch.SolrProvider.Pipelines.Loader.InitializeSolrProvider, Sitecore.ContentSearch.SolrProvider">
                    <patch:attribute name="type">Example.InitializeSolrPostProvider,Example</patch:attribute>
                </processor>
            </initialize>
        </pipelines>
    </sitecore>
</configuration>

I hope you enjoyed this post!
