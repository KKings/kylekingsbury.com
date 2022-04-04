---
title: "Targets dropdown not populating within the Link Dialog"
date: "2017-12-02"
metaDescription: "Quick tip for troubleshooting the targets dropdown not populating within the Speak Link Dialog "
metaKeywords: "Sitecore, Speak UI, Targets Dropdown, InsertLinkViaTreeDialog"
categories: 
  - "Sitecore"
---

Are you missing your link targets within the Speak UI link selection dialog, InsertLinkViaTreeDialog? If you have searched the internet and still haven't come across an answer that worked, you have come to the right place.

### Missing Targets Dropdown Solution

When the dialog first loads, it pulls the _TargetsSearchPanelConfig_ provided within the Speak Layout. After the dialog has the configuration, the SearchDataSource  queries the _sitecore_core_index_ filtering by the root path and and the template. And there is the problem, if the index was recently created it could potentially be out of date. So if you tried the other solutions on the web, go ahead and **reindex the sitecore_core_index_**.

If you are like me, you might be asking yourself why did Sitecore implement the lookup as a _SearchDataSource_ instead of a _QueryDataSource_ when the dropdown will only be populated with a handful of items. 🤔

#### Additional information:

- All the Link Speak Dialogs use the same configuration, so adding or removing a new target should be displayed to all of the dialogs
- The targets configuration can be found in the core database: /sitecore/client/Applications/Dialogs/InsertLinkViaTreeDialog/PageSettings/TargetsSearchPanelConfig
- The targets can be added or updated in the core database: /sitecore/client/Applications/Dialogs/InsertLinkViaTreeDialog/PageSettings/Targets

 Anyways, hopefully this solution can help!
