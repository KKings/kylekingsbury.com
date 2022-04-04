---
title: "Creating a custom command with Sitecore PowerShell Extensions"
date: "2018-09-24"
metaDescription: "Learn how to create a custom PowerShell command with some tips and tricks for easier development."
metaKeywords: "Sitecore, PowerShell, Commands, ContentSearch"
categories: 
  - "Sitecore"
tags: 
  - "contentsearch"
  - "powershell"
---

Ever wondered how to extend [Sitecore PowerShell Extensions](https://marketplace.sitecore.net/Modules/Sitecore_PowerShell_console.aspx) (SPE) and add custom commands to streamline your development? In this post, i'll review what you need to do to quickly start development.

> The Sitecore PowerShell Extensions (SPE) module is a Sitecore development accelerator which can drastically increase your productivity and curtail the amount of time it takes to deliver a Sitecore solution.

### Adding the binaries to your project

If you haven't already installed SPE, head over to the [installation guide](https://doc.sitecorepowershell.com/installation#download-the-module) and download and install the module into your solution.

Unfortunately, the SPE project only provides the releases in the form of Sitecore Packages and not provided as Nuget packages; not a blocker, but not convenient either. **Within** your Sitecore instance, navigate to your _bin_ directory and copy the _Cognifide.PowerShell.dll_ binary into a directory of your repository. For example, for libraries/binaries that are not found on Nuget, I will copy these files to a _libs_ folder at the root of my repository. Within Visual Studio, go ahead and add a reference to this binary and set the property _Copy Local_ to _false._

Next, using the Nuget Package Manager, we will need to add a reference to [System.Management.Automation.dll](https://www.nuget.org/packages/System.Management.Automation.dll/), version 10.0.10586.0 to your project - again - setting the property _Copy Local_ to _false._

### Creating a custom PowerShell command

Ok, so on to the fun part of the post, writing the custom PowerShell command.

As an example, lets say I want to make it easier to find products by Sku using the ContentSearch API. I would create a new class that extends the Cognifide.PowerShell.Commandlets.BaseCommand class.

#### **Example Command**

```c#
namespace Example.Powershell.Commands
{
    using System.Collections.Generic;
    using System.Linq;
    using System.Management.Automation;
    using Cognifide.PowerShell.Commandlets;
    using Cognifide.PowerShell.Core.Validation;
    using Sitecore.ContentSearch;
    using Sitecore.ContentSearch.Linq.Utilities;
    using Sitecore.ContentSearch.SearchTypes;

    [Cmdlet("Find", "Products")]
    [OutputType(typeof(SearchResultItem[]))]
    public class FindProductsCommandlet : BaseCommand
    {
        public static string[] Indexes
        {
            get
            {
                return ContentSearchManager.Indexes.Select(i => i.Name)
                                           .ToArray();
            }
        }

        [AutocompleteSet("Indexes")]
        [Parameter(Mandatory = true, Position = 0)]
        public string Index { get; set; }

        [Parameter(Mandatory = true)]
        public string[] Skus { get; set; }

        protected override void EndProcessing()
        {
            using (var searchContext = ContentSearchManager
                .GetIndex(string.IsNullOrEmpty(this.Index) ? "sitecore_web_index" : this.Index)
                .CreateSearchContext())
            {
                if (this.Skus == null || !this.Skus.Any())
                {
                    return;
                }

                var results = this.GetResults(searchContext, this.Skus);

                this.WriteObject(fullResults, true);
            }
        }

        private IEnumerable<SearchResultItem> GetResults(IProviderSearchContext searchContext, IList<string> skus)
        {
            var query = searchContext.GetQueryable<SearchResultItem>();
            var predicate = PredicateBuilder.False<SearchResultItem>();

            predicate = skus.Aggregate(predicate, (current, number) => current.Or(result => result["sku_t"] == number));

            query = query.Where(predicate);
            query = query.Take(skus.Count);

            return query.ToList();
        }
    }
}
```

A few things about this class:

- Adding the **CmdletAttribute** to the class, provides the ability to expose the command as by a unique name to the PowerShell console. It is recommend to use, the **Verb-Object** modifier.
- Adding the **ParameterAttribute** to a public property, we provide the ability to pass parameters from the console to the custom command. Some properties may need to be mandatory, you can force the console to error out if the property was not provided by setting _Mandatory = true_
- A custom command has a few methods you can use to execute your custom code: _BeginProcessing, EndProcessing_, and ProcessRecord
    
    - BeginProcessing - Performs any initialization of a command. If not overridden, the base implementation simply returns
    - EndProcessing - Performs cleanup or post steps for the command. If not overridden, the base implementation simply returns
    - ProcessRecord - Called for each input record that is processed by the cmdlet
    - For more information, review the [Cmdlet Input Processing Methods from Microsoft](https://docs.microsoft.com/en-us/powershell/developer/cmdlet/cmdlet-input-processing-methods)
- Using the WriteObject method, we can write data back to the console. This is essentially the output of the command

### Registering the custom command to Sitecore PowerShell Extensions

Now that we have our custom command class written, we need to expose this command to Sitecore PowerShell Extensions. To do this, we need to add additional configuration:

```xml
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/" xmlns:set="http://www.sitecore.net/xmlconfig/set/">
  <sitecore>
    <powershell>
      <commandlets>
        <add Name="Find Products" type="Example.Powershell.Commands.FindProductsCommandlet, Example" />
      </commandlets>
    </powershell>
  </sitecore>
</configuration>
```

### Using the custom command

After all of our hard-work, we finally get to use our custom command.

```powershell
$skus = @('111', '222', '333', '444')
$products = Find-Products -Skus $skus
```

And thats it, simple and straightforward! I hope you enjoyed this post and as always, be sure to leave a comment!
