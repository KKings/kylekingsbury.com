---
title: "Unit-testing devices and layouts with Sitecore.FakeDb"
date: "2017-06-13"
metaDescription: "Learn how to use the Sitecore.FakeDb library to easily write unit-tests against devices and layouts. "
metaKeywords: "Unit-test, FakeDb, Sitecore, TDD"
categories: 
  - "Sitecore"
tags: 
  - "sitecore-fakedb"
  - "unit-test"
---

After writing a few extension methods that checked whether a Sitecore Item had a layout for the default device or any device, I wondered if I could use the Sitecore.FakeDb library to unit-test these extension methods and provide some much needed code coverage for a project i'm working on. As most people do, I quickly did a few google searches and I was shocked, I couldn't find any example's showing what is needed to setup Sitecore.FakeDb to test against devices and layouts.

After some trial and error, I finally came across some useful tidbits that you can use in order to setup Sitecore.FakeDb to test Item's with devices and layouts.

For the sake of this post, i'll be using the following extension method:

```c#
/// <summary>
/// Determine if an item has layout details for the default device.
/// </summary>
/// <param name="item">Sitecore Item</param>
/// <returns><c>True></c> if a layout exists for the default device</returns>
public static bool HasLayoutDetailsForDefaultDevice(this Item item)
{
    return (from compare in item.Database.Resources.Devices.GetAll()
            where compare.IsDefault
            select item.Visualization.GetLayout(compare) != null).FirstOrDefault();
}
```

I'll break these tidbits into three areas:

- Scaffolding - setting up the database for Sitecore's API's
- Presentation - adding presentation to an Item
- Testing - getting and testing against our Item 

### Initial Sitecore Scaffolding

Unfortunately, as I quickly learned, we aren't able to apply XML to the layout field and expect things to magically work. Sitecore uses a series of classes (ItemVisualizations, Devices, etc) after parsing the XML that will query specific roots for all devices and layouts and validate that ID's referenced in the XML actually exist. Luckily, Sitecore makes it rather easy to use the same ID's and TemplateID's by exposing two classes: _ItemIDs_ and _TemplateIDs._

```c#
// Create an Instance of the FakeDb using AutoFixture
var db = fixture.Freeze<Db>();

var deviceId = ID.NewID;
var layoutId = ID.NewID;

// Add the 'Layout' root
db.Add(new DbItem("Layout", ItemIDs.LayoutRoot, TemplateIDs.MainSection)
{
    ParentID = ItemIDs.RootID,
    FullPath = "/sitecore/layout",
    Children =
    {
        // Adds the 'Devices' root
        new DbItem("Devices", ItemIDs.DevicesRoot, TemplateIDs.Node)
        {
            // Adds our device
            new DbItem("Default", deviceId, TemplateIDs.Device)
            {
                // Make this device the Default for simplicity
                { DeviceFieldIDs.Default, "1" }
            }
        },
        
        // Adds the 'Layouts' root
        new DbItem("Layouts", ItemIDs.Layouts, TemplateIDs.Node)
        {
            new DbItem("Default", layoutId, TemplateIDs.Layout)
        }
    }
});
```

In addition to creating the scaffolding for Sitecore, we have added a default device and a default layout that we can now reference in our XML.

### Adding Presentation Values

Next up, we need to manually create the XML that will be used for the presentation values of our item. As you can see below, a neat trick I learned from reading the source code of Sitecore.FakeDb is Sitecore has exposed a few helper methods from the _XmlDeltas_ class that we can leverage to create valid XML for the layout field by mocking the XML generated on the standard values and applying a delta (as if we were editing an instance of the item).

```c#
// Setup the Standard Values Presentation
var templateLayout =
    @"<r xmlns:xsd=""http://www.w3.org/2001/XMLSchema"">
        <d id=""{0}"" l=""{1}"" />
    </r>".FormatWith(deviceId, layoutId);

// Setup the item delta
// In our scenario, we aren't considered with the specific 
// rendering added, just that one is added
var itemDelta =
    @"<r xmlns:p=""p"" xmlns:s=""s"" p:p=""1"">
        <d id=""{0}"">
            <r uid=""{1}"" s:id=""{2}"" s:ph=""Main"" />
        </d>
    </r>".FormatWith(deviceId, ID.NewID, ID.NewID);

// Combine the Standard Values layout with the Item Layout
var layout = XmlDeltas.ApplyDelta(templateLayout, itemDelta);

var contextId = ID.NewID;

// Create a new item with our layout
 db.Add(new DbItem("context", contextId)
{
    { FieldIDs.LayoutField, layout }
});

### Getting and testing against our Sitecore Item

The last thing we need to do before writing a valid Unit-Test is to use the Sitecore API to get the Item to perform our unit-tests against. With the above setup and the FluentAssertions library, our Unit-Test becomes a single-line statement.

var contextItem = db.GetItem(contextId);

// Assert
contextItem.HasLayoutDetailsForDefaultDevice().Should().BeTrue();

### Testing a Sitecore Item with a blank layout

db.Add(new DbItem("context", contextId)
{
    { FieldIDs.LayoutField, "<r/>" }
});

var contextItem = db.GetItem(contextId);

// Assert
contextItem.HasLayoutDetailsForDefaultDevice().Should().BeFalse();
```

While the setup took a few tries to get Sitecore to play nice, I was pleasantly surprised how easy it was to test my Item. I hope you enjoyed this post! Let me know in the comments your tidbits for testing Sitecore's devices and layouts.

_Other libraries used: [FluentAssertions](https://www.nuget.org/packages/FluentAssertions/), [AutoFixture](https://www.nuget.org/packages/AutoFixture/), [Sitecore.FakeDb.AutoFixture](https://www.nuget.org/packages/Sitecore.FakeDb.AutoFixture/)_
