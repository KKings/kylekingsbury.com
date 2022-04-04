---
title: "Sitecore Horizon Overview"
date: "2020-03-10"
metaDescription: "Wondering about Sitecore Horizon? Get a quick overview on the new editor and determine if its right for your organization."
metaKeywords: "Sitecore Horizon, Next-Generation Editor"
categories: 
  - "Sitecore"
tags: 
  - "horizon"
---

![Sitecore Horizon with Habitat](/assets/images/Sitecore-Horizon-with-Habitat.png)

Sitecore Horizon is the next-generation editor for the Sitecore Experience Platform. Horizon includes the following features: 

- **Page Editor** - used to create and edit pages 
- **Simulator Mode** - used to preview web pages across devices, including a timeline view to preview web pages by dates
- **Insights View** - used to view analytics about the web page

With Horizon, Sitecore has separated the web app that hosts the editor (Horizon) from the web app that actually does the rendering (Sitecore), this means more infrastructure to support the Content Management (CM) side of Sitecore. Given the direction that Sitecore is headed (SaaS), this makes sense as they can scale and version separately, however, for the on-premise model, this adds another layer of management and potential cost.

## Installation

Sitecore Horizon is an optional module that is installed via SIF and includes two parts:

- Horizon, separate web app
    - I recommend setting up the domain as such: horizon.\[domain\], e.g. horizon.sc9.local
- Sitecore Module - Code/Configuration enabling Sitecore and Horizon to communicate using Sitecore Services Client
    - All configuration can be found at: **/App_Config/Modules/Horizon**

Sitecore SIF will handle setting up and installing Horizon and configuring an existing Sitecore instance to support Horizon. Installation, for the most part, was a breeze.

![Opening Horizon with Habitat](/assets/images/opening-horizon.gif)

### Setup Issues

![Sitecore Horizon with Error](/assets/images/Sitecore-Horizon-with-Error.png)

Although the installation process was relatively straightforward, I did run into a handful of issues when installing Horizon. For any issues, you can review the Horizon Logs to further investigate, they can be found at {YOUR WEB ROOT}\Logs. Here are some things that I ran into:

1. **Unable to communicate via SSL**
    1. Check that the SSL certificate that SIF created is in the machines trusted authority store
2. **Unable to access Node.js to render Horizon UI**
    1. Check that your Node.js installation is configured in your windows PATH variable and that the Horizon IIS App Pool has access to the executable (Read, Write, Execute)
3. **No Horizon Logs**  
    1. Still not sure about this one, but it happened twice. After restarting the machine, the logs started to generate
    2. Check that the setting, stdoutLogEnabled, in the web.config is set to true

### The good

There is a lot to like about the new Horizon Editor and has some similarities with other modern CMS's. Here are some things I really liked about the new interface:

- Slick, Modern UI for editing the Presentation Layer - marketers will favor this UI over the clunky Experience Editor any day
- Faster than Experience Editor as the page does not need to reload
    - Pages being edited are requested and rendered by the Sitecore instance and shown via Horizon
- Includes Drag and Drop Support, similar to Sitecore SXA
- Insights view brings analytics directly into the same context, authors do not need to swap between Sitecore modules to view data
- Auto-Save during editing, with undo/redo support
    - Undo support seemed to work fine for me
- Simulator mode allows you to easily change how the web page looks on different devices and by date
- Uses Quill.js for Rich Text Editor support
    - Telerik has been removed, everyone can rejoice!
- Backwards compatible with Experience Editor renderings

### The not so good

The number of issues is too long to list as all of the features provided by Experience Editor are not supported within Horizon, while I do not think all of the Experience Editor needs to be rebuilt into Horizon, Content Authors should not need to switch between multiple editors in order to do their job. 

Here is a list of some major issues:

- Lack of documentation. Besides the how to use and the installation guide, there is no documentation on how developers can extend or work with Horizon
    - Perhaps, Horizon is not meant to be extended the way Experience Editor can be?
- Multisite support appears to be handled through the _sc_site_ parameter, however, it is not clear how an editor can edit different sites using Horizon
    - If its based on the domain when logging into Sitecore, you would need separate domains for each site hosted on Sitecore. Bleh!
- Unable to personalize a rendering or add an a/b test
- Unable to publish using the Sitecore Publishing Service, you can publish using the out of the box publishing though
- Buckets show up as folders when using item buckets, this appears to be fine at first, but when using a lot of pages within buckets, finding and editing items would be hard
- Limited support for SXA
- Limited support for JSS
- Not compatible with all major browsers (Safari on MacOS and Internet Explorer)
- Must use Sitecore Identity Service
- Must use HTTPS on the CM instance
    - Overall this isn't a bad thing to use HTTPS, but it needs to be accounted for in the architecture
- To get full support of the Rich Text Editor, you have to add custom CSS to your stylesheets  
    - Definitely not a major issue, but something to draw attention to

Additionally, based on my usage, here are some additional details:

- Only basic fields are editable, think text and image fields only. I observed the following fields were not able to be edited:
    - General Link
    - Dates
- You need to login to Sitecore first, before navigating to Horizon
    - I would say this is a no-brainer, but you can get into an endless loop where Horizon loads, but your website loads the log-in screen of Sitecore with no way to actually log-in.
- Adding and removing renderings causes your site to reload
    - This is troublesome as you will often have to keep scrolling down your site to where you were editing, if editing below the fold
- Unable to create a new datasource when adding a new rendering, only existing datasources can be selected
- Unable to create a new version of the page from Horizon, you'll need to use Content Editor or use Workflow
- Unable to add images to a Rich Text field
- Unable to move renderings, only add or remove seems to be supported
- Does not support Experience Editor edit frames
    - Unless the text is visible, the user cannot edit any background data
- Unable to update rendering parameters
- Unable to view or add images from the media library
    - I think the viewing of images might be a bug
- Unable to see datasource/workflow references
    - I wonder if moving an item through workflow also moves the rendering datasource items through workflow as well
- Unable to see if an item is being personalized
- Placeholders are not able to be seen
    - I am not sure if this is a good thing yet as it makes it harder to see which renderings are compatible with a placeholder. The 'Add to Page' functionality does not seem to limit the rendering list, but it does limit where you can drag and drop

### Using Horizon

A picture is worth a thousand words, how about some short GIFs using some of the new features:

### Using the Simulator

![](/assets/images/Sitecore-Horizon-with-Simulator.gif)

### Using Page Insights

![](/assets/images/Sitecore-Horizon-with-Insights.gif)

### Adding Renderings

![Sitecore Horizong adding renderings](/assets/images/Sitecore-Horizong-adding-renderings.gif)

### Final Thoughts

Is Horizon an internal pet project? Is it meant to replace the Experience Editor in the future? I still have a lot of questions and I don't think i'll be getting any answers this year. In summary, unless Sitecore is planning on making Horizon more feature-rich, including standard features from Experience Editor, Horizon will end up being a nice modern UI that no one will use.
