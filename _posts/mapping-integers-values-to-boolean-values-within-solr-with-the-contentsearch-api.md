---
title: "Mapping integers values to boolean values within Solr with the ContentSearch API"
date: "2017-12-29"
metaDescription: "Learn how to easily map a boolean value to and from Solr with the Content Search API"
metaKeywords: "Solr, Content Search, Sitecore, DocumentMapper"
categories: 
  - "Sitecore"
tags: 
  - "contentsearch"
  - "solr"
---

If you work with Sitecore and search driven experiences enough, you will undoubtedly run into a scenario where you need to map a complex type from your codebase to a single entry into your index.  Luckily for us, Sitecore has already built the abstractions and the implementation into the Content Search API in order to handle mapping complex types into single fields within the index, the _DocumentMapper_. Follow on below as we use a simple example to map values in the index to a different type in our codebase.

### Backstory

Let's say we have a product index, driven by Sitecore Commerce and Commerce Server, and we have an external application that updates the indexed products with near real-time pricing and inventory data. One of these fields is an integer, let's name it "Is Available", that is represented as a 0 for _false_ or 1 for _true_, as this is how the source system gets it. So throughout our application and search code, when we are looking for products that are available we would sprinkle in expressions like, _result.IsAvailable == 1_, to only return products that are available to be shown.

While this is perfectly fine, in big applications with a lot of moving parts, I would argue for maintainability reasons that it is far better to remove magic numbers and make your code more readable.

So how do we let Sitecore know that we want to map an integer value to a boolean, you ask. There are actually two common approaches we can leverage within the ContentSearch API to map our code to the index values (and back), attribute based per property or configuration based per type. For this example, since we do not want to rewrite all integers to booleans, we will use the _per property_ approach. This is actually the simpler (less code) approach. To accomplish this, we will need to create a custom _TypeConverter_ that will handle the mapping and then we will need to add an attribute to the property we want to be handled differently.

### Implementing a TypeConverter

```c#
namespace Example
{
    using System;
    using System.ComponentModel;
    using System.Globalization;

    public class IndexableIntToBoolConverter : TypeConverter
    {
        /// <summary>
        /// Determine if the <param ref="sourceType" /> can be converted from
        /// Hint: This is the type declared in your codebase
        /// </summary>
        public override bool CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
        {
            return sourceType == typeof(bool) || base.CanConvertFrom(context, sourceType);
        }

        /// <summary>
        /// Determine if the <param ref="destinationType" /> can be converted to
        /// Hint: This is the value you want to store within the index
        /// </summary>
        public override bool CanConvertTo(ITypeDescriptorContext context, Type destinationType)
        {
            return destinationType == typeof(int) || base.CanConvertTo(context, destinationType);
        }

        /// <summary>
        /// Convert the object from the index to your type
        /// </summary>
        public override object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, object value)
        {
            return value != null && ((int)value >= 1);
        }

        /// <summary>
        /// Convert the object from your type to the index
        /// </summary>
        public override object ConvertTo(ITypeDescriptorContext context, CultureInfo culture, object value, Type destinationType)
        {
            return ((bool)value) ? 1 : 0;
        }
    }
}
```

The TypeConverter exposes four methods we can override to map an integer value from the index to a boolean value:

- CanConvertFrom - _true_ if the source type is the correct type (this is your complex type)
- ConvertTo - Converts your complex type to the index type
- CanConvertTo - _true_ if the destination type is the correct type (this is the index type)
- ConvertFrom - Converts the index type to the complex type

From the official documentation on [Microsoft](https://msdn.microsoft.com/en-us/library/system.componentmodel.typeconverter(v=vs.110).aspx):

> **System.ComponentModel.TypeConverter:** Provides a unified way of converting types of values to other types, as well as for accessing standard values and subproperties.

### Using our TypeConverter 

Now that we have a implementation of a _TypeConverter_ that converts boolean values to integers and back, we now need to add an attribute to the property we want to be handled differently. By using the _TypeConverterAttribute_, we are signaling to Sitecore to execute our _TypeConverter_ when serializing and deserializing from the index back to our _SearchResultItem_, instead of the default implementation.

```c#
namespace Example
{
    using System;
    using System.ComponentModel;
    using Sitecore.ContentSearch;

    public class CustomSearchResultItem : SearchResultItem
    {
        ### [IndexField("is### _available")### ]
        ### [TypeConverter(typeof(IndexableIntToBoolConverter))### ]
        public virtual bool IsAvailable { get; set; }
    }
}
```

Now that we have our mapping configured, in our application and search code when we are looking for products that are available we can use expressions like _result.IsAvailable_ instead of _result.IsAvailable == 1_. While not a huge breakthrough here, this makes reading code a lot easier.

Check back soon as we explore mapping complex types to the index.
