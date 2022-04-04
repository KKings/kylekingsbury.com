---
title: "Filtering Sitecore tree type fields by the inheritance chain"
date: "2020-04-14"
metaDescription: "Helix supported, Sitecore Field extensions to TreeList and DropTree fields to support filtering selections by inheritance."
metaKeywords: "Sitecore, TreeList, Tree, Helix, Inheritance"
author:
  name: Kyle Kingsbury
categories: 
  - "Helix"
  - "Sitecore"
---

When working with the Helix design patterns, a typical situation comes up where the project will include templates in the Feature or Foundation layer that contain TreeList, TreeListEx or DropTree fields that will need to enforce selections based on a template in that module. However, due to limitations from the Sitecore fields you can only enforce selections based on specific templates, not based on templates that are inherited. This is an issue when the modules exposes a base template, that will be inherited in a higher layer, but still needs to maintain the selection enforcement.

For example, lets say I am implementing a list module within the Feature layer and it includes the templates, _List_ and _List Item_, where _List Item_ templates will be selected on the _List_ template, I then want to enforce that only _List Item_'s are selected from within the _List_ template_._ Now most likely, the Project Layer will inherit the _List Item_ template in order to provide defaults or apply site specific workflow (any number of reasons really). And therein lies the problem, when you set the source of the field within the Feature layer, it is bound to a specific template(s) but it doesn't take into account the inheritance that usually comes with Helix.

You have a few options here, you can say screw Helix standards and just set the Template ID in the Feature or Foundation layer **OR** you can extend the fields to support inheritance. I'm hoping you are here because you want a solution to the problem, if so, lets get coding!

### The solution

In order to extend, in this case override, the default fields for TreeList, TreeList and DropTree, we have two options:

1. Create new Sitecore Field Types for three fields to call custom classes that inherit from the code of those Field Types
2. Use patch configuration to have Sitecore look for our classes **first** before defaulting to the out of the box configuration
 
I prefer the second approach in this instance as it is seamless in that all current instances of TreeList, TreeListEx and DropTree fields can use this new functionality while still supporting the old functionality and you do not need to create additional fields. **However**, I will note that because we are changing all instances of the fields, you will need to verify that Sitecore hasn't changed the underlying fields when upgrading _(the code below was written for 7.2 and reviewed with Sitecore 7.2, 8.2, 9, and 9.3 versions)._

What we are going to do is extend both base implementations so that the fields can include key value pairs. With the below extensions, we will now be able to update the fields Source property with syntax below to enforce selections by the inheritance:

```xml
Datasource={Insert Sitecore Query or Item Path}&IncludeBaseTemplatesForSelection={Insert GUID}
```

### Extending the DropTree field

To extend the DropTree field, we will need to create two new classes, one that inherits from the _Sitecore.Shell.Applications.ContentEditor.Tree_  and allows us to access the _Source_ property to pull out new information and one class that inherits from _Sitecore.Web.UI.HtmlControls.DataTreeview_ which allows us to access our new information and use it.

Add a new class called _Tree_ (name needs to be exact):

```c#
namespace Sitecore.Foundation.SitecoreExtensions.FieldTypes
{
    using System;
    using System.Web.UI.WebControls;
    using Sitecore;
    using Sitecore.Diagnostics;
    using Sitecore.Globalization;
    using Sitecore.Web.UI.HtmlControls;
    using Sitecore.Web.UI.Sheer;

    /// <summary>
    /// Extends the <see cref="Sitecore.Shell.Applications.ContentEditor.Tree"/> by
    /// adding in support to filter the selectable templates in a Tree by the base templates
    /// Syntax for the Field Source: Datasource={Insert Sitecore Query or Item Path}&IncludeBaseTemplatesForSelection={Insert GUID}
    /// </summary>
    public class Tree : Sitecore.Shell.Applications.ContentEditor.Tree
    {
        #region Additional Fields for Filtering

        public string ExcludeTemplatesForDisplay
        {
            get
            {
                return this.GetViewStateString("ExcludeTemplatesForDisplay");
            }
            set
            {
                Assert.ArgumentNotNull(value, "value");
                this.SetViewStateString("ExcludeTemplatesForDisplay", value);
            }
        }

        public string ExcludeTemplatesForSelection
        {
            get
            {
                return this.GetViewStateString("ExcludeTemplatesForSelection");
            }
            set
            {
                Assert.ArgumentNotNull(value, "value");
                this.SetViewStateString("ExcludeTemplatesForSelection", value);
            }
        }

        public string IncludeTemplatesForDisplay
        {
            get
            {
                return this.GetViewStateString("IncludeTemplatesForDisplay");
            }
            set
            {
                Assert.ArgumentNotNull(value, "value");
                this.SetViewStateString("IncludeTemplatesForDisplay", value);
            }
        }

        public string IncludeTemplatesForSelection
        {
            get
            {
                return this.GetViewStateString("IncludeTemplatesForSelection");
            }
            set
            {
                Assert.ArgumentNotNull(value, "value");
                this.SetViewStateString("IncludeTemplatesForSelection", value);
            }
        }

        public string IncludeBaseTemplatesForSelection
        {
            get
            {
                return this.GetViewStateString("IncludeBaseTemplatesForSelection");
            }
            set
            {
                Assert.ArgumentNotNull(value, "value");
                this.SetViewStateString("IncludeBaseTemplatesForSelection", value);
            }
        }

        #endregion

        /// <summary>
        /// Overrides the source property to pull out the DataSource
        /// and filterable properties
        /// </summary>
        public new string Source
        {
            get { return base.Source; }
            set
            {
                if (value == null)
                {
                    base.Source = value;
                }
                else
                {
                    var contextItem = Client.ContentDatabase.GetItem(this.ItemID);
                    var datasourceValue = StringUtil.ExtractParameter("DataSource", value).Trim();

                    if (datasourceValue.StartsWith("query:"))
                    {
                        this.ExcludeTemplatesForSelection = StringUtil.ExtractParameter("ExcludeTemplatesForSelection", value).Trim();
                        this.IncludeTemplatesForSelection = StringUtil.ExtractParameter("IncludeTemplatesForSelection", value).Trim();
                        this.IncludeTemplatesForDisplay = StringUtil.ExtractParameter("IncludeTemplatesForDisplay", value).Trim();
                        this.ExcludeTemplatesForDisplay = StringUtil.ExtractParameter("ExcludeTemplatesForDisplay", value).Trim();
                        this.IncludeBaseTemplatesForSelection = StringUtil.ExtractParameter("IncludeBaseTemplatesForSelection", value).Trim();

                        var queryItem = contextItem.Axes.SelectSingleItem(datasourceValue.Substring("query:".Length));

                        if (queryItem != null)
                        {
                            base.Source = queryItem.ID.ToString();
                        }
                    }
                    else if (value.StartsWith("query:"))
                    {
                        var queryItem = contextItem.Axes.SelectSingleItem(value.Substring("query:".Length));
                        if (queryItem != null)
                        {
                            base.Source = queryItem.ID.ToString();
                        }
                    }
                    else
                    {
                        base.Source = value;
                    }
                }
            }
        }

        /// <summary>
        /// Overrides the <see cref="DropDown"/>, and changing the DataTreeView to use a FilteredTreeView
        /// </summary>
        protected override void DropDown()
        {
            if (!string.IsNullOrEmpty(this.Value))
            {
                var dataContext = Sitecore.Context.ClientPage.FindSubControl(this.DataContext) as DataContext;
                Assert.IsNotNull(dataContext, typeof(DataContext), "Datacontext "{0}" not found.", (object)this.DataContext);
                dataContext.Folder = this.Value;
            }

            var hiddenHolder = UIUtil.GetHiddenHolder(this);
            DataTreeNode dataTreeNode = null;
            var scrollbox = new Scrollbox();
            Sitecore.Context.ClientPage.AddControl(hiddenHolder, scrollbox);
            scrollbox.Width = 300;
            scrollbox.Height = 400;

            var dataTreeview = this.GetDataTreeview();
            dataTreeview.Class = "scTreeview scPopupTree";
            dataTreeview.DataContext = this.DataContext;
            dataTreeview.ID = this.ID + "_treeview";
            dataTreeview.AllowDragging = false;

            if (this.AllowNone)
            {
                dataTreeNode = new DataTreeNode();
                Sitecore.Context.ClientPage.AddControl(dataTreeview, dataTreeNode);
                dataTreeNode.ID = this.ID + "_none";
                dataTreeNode.Header = Translate.Text("[none]");
                dataTreeNode.Expandable = false;
                dataTreeNode.Expanded = false;
                dataTreeNode.Value = "none";
                dataTreeNode.Icon = "Applications/16x16/forbidden.png";
            }

            Sitecore.Context.ClientPage.AddControl(scrollbox, dataTreeview);
            dataTreeview.Width = new Unit(100.0, UnitType.Percentage);
            dataTreeview.Click = this.ID + ".Select";
            dataTreeview.DataContext = this.DataContext;

            if (string.IsNullOrEmpty(this.Value) && dataTreeNode != null)
            {
                dataTreeview.ClearSelection();
                dataTreeNode.Selected = true;
            }
            SheerResponse.ShowPopup(this.ID, "below-right", scrollbox);
        }

        protected virtual DataTreeview GetDataTreeview()
        {
            return new FilteredDataTreeView
            {
                ExcludeTemplatesForDisplay = Tree.GetValues(this.ExcludeTemplatesForDisplay),
                ExcludeTemplatesForSelection = Tree.GetValues(this.ExcludeTemplatesForSelection),
                IncludeTemplatesForDisplay = Tree.GetValues(this.IncludeTemplatesForDisplay),
                IncludeTemplatesForSelection = Tree.GetValues(this.IncludeTemplatesForSelection),
                IncludeBaseTemplatesForSelection = Tree.GetValues(this.IncludeBaseTemplatesForSelection)
            };
        }

        private static string GetValues(string templates)
        {
            if (String.IsNullOrEmpty(templates))
            {
                return null;
            }

            return templates.Split(new { ',' }, StringSplitOptions.RemoveEmptyEntries);
        }
    }
}
```

Next we need to add the _FilteredDataTreeView_ class:

```c#
namespace Sitecore.Foundation.SitecoreExtensions.FieldTypes
{
    using System;
    using System.Linq;
    using Sitecore.Data.Items;
    using Sitecore.Foundation.SitecoreExtensions.Extensions;
    using Sitecore.Web.UI.HtmlControls;
    using Sitecore.Web.UI.Sheer;
    using Control = System.Web.UI.Control;

    /// <summary>
    /// Supporting class to allow additional paramters to filtered the tree
    /// </summary>
    internal class FilteredDataTreeView : DataTreeview
    {
        public string ExcludeTemplatesForDisplay
        {
            get { return this.GetViewStateProperty("ExcludeTemplatesForDisplay", null) as string; }
            set { this.SetViewStateProperty("ExcludeTemplatesForDisplay", value, null); }
        }

        public string ExcludeTemplatesForSelection
        {
            get { return this.GetViewStateProperty("ExcludeTemplatesForSelection", null) as string; }
            set { this.SetViewStateProperty("ExcludeTemplatesForSelection", value, null); }
        }

        public string IncludeTemplatesForDisplay
        {
            get { return this.GetViewStateProperty("IncludeTemplatesForDisplay", null) as string; }
            set { this.SetViewStateProperty("IncludeTemplatesForDisplay", value, null); }
        }

        public string IncludeTemplatesForSelection
        {
            get { return this.GetViewStateProperty("IncludeTemplatesForSelection", null) as string; }
            set { this.SetViewStateProperty("IncludeTemplatesForSelection", value, null); }
        }

        public string IncludeBaseTemplatesForSelection
        {
            get { return this.GetViewStateProperty("IncludeBaseTemplatesForSelections", null) as string; }
            set { this.SetViewStateProperty("IncludeBaseTemplatesForSelections", value, null); }
        }

        public override void HandleMessage(Message message)
        {
            if (message.Name == "event:keydown")
            {
                Sitecore.Context.ClientPage.ClientResponse.ClosePopups(false);
                message.CancelDispatch = true;
            }
            else
            {
                base.HandleMessage(message);
            }
        }

        protected override void Populate(DataContext dataContext, Control control, Item root, Item folder, string selectedIDs)
        {
            if (this.ExcludeTemplatesForDisplay == null && this.IncludeTemplatesForDisplay == null)
            {
                base.Populate(dataContext, control, root, folder, selectedIDs);
            }
            else
            {
                if (this.IncludeTemplatesForDisplay != null && !this.IncludeTemplatesForDisplay.Contains(root.TemplateName)
                    || this.ExcludeTemplatesForDisplay != null && this.ExcludeTemplatesForDisplay.Contains(root.TemplateName))
                {
                    return;
                }

                base.Populate(dataContext, control, root, folder, selectedIDs);

                foreach (var dataTreeNode in control.Controls.OfType<DataTreeNode>().Where(p => p.Visible && p.Expandable))
                {
                    if (!String.IsNullOrEmpty(dataTreeNode.ItemID))
                    {
                        var obj = dataContext.GetItem(dataTreeNode.ItemID);

                        if (obj == null)
                        {
                            continue;
                        }

                        var flag = false;
                        foreach (Item child in obj.Children)
                        {
                            if (this.IncludeTemplatesForDisplay != null && this.IncludeTemplatesForDisplay.Contains(child.TemplateName))
                            {
                                flag = true;
                                break;
                            }

                            if (this.ExcludeTemplatesForDisplay != null && !this.ExcludeTemplatesForDisplay.Contains(child.TemplateName))
                            {
                                flag = true;
                                break;
                            }
                        }

                        if (!flag)
                        {
                            dataTreeNode.Expandable = false;
                            dataTreeNode.Expanded = false;
                        }
                    }
                }
            }
        }

        protected override TreeNode GetTreeNode(Item item, Control parent)
        {
            var treeNode = base.GetTreeNode(item, parent);

            if (this.ExcludeTemplatesForSelection != null && this.ExcludeTemplatesForSelection.Contains(item.TemplateName))
            {
                treeNode.Enabled = false;
            }

            if (this.ExcludeTemplatesForDisplay != null && this.ExcludeTemplatesForDisplay.Contains(item.TemplateName))
            {
                treeNode.Visible = false;
            }

            if (this.IncludeTemplatesForSelection != null && !this.IncludeTemplatesForSelection.Contains(item.TemplateName))
            {
                treeNode.Enabled = false;
            }

            if (this.IncludeTemplatesForDisplay != null && !this.IncludeTemplatesForDisplay.Contains(item.TemplateName))
            {
                treeNode.Visible = false;
            }

            if (this.IncludeBaseTemplatesForSelection != null &&
                !this.IncludeBaseTemplatesForSelection.Any(t => item.IsDerived(Sitecore.Data.ID.Parse(t))))
            {
                treeNode.Enabled = false;
            }

            return treeNode;
        }

        protected override void NodeClicked(Message message, TreeNode node)
        {
            var dataTreeNode = node as DataTreeNode;

            if (dataTreeNode != null && !dataTreeNode.Enabled)
            {
                Sitecore.Context.ClientPage.ClientResponse.ClosePopups(false);
                message.CancelDispatch = true;
            }
            else
            {
                base.NodeClicked(message, node);
            }
        }
    }
}
```

### Extending TreeList and TreeListEx

Extending the TreeList and TreeListEx fields is a lot more straightforward then the DropTree. We will need to add an additional class that extends the _Sitecore.Shell.Applications.ContentEditor.TreeList_ and allows us to access the source property to pull out the additional filters. **Note**: Both Sitecore fields derive from the same class.

```c#
namespace Sitecore.Foundation.SitecoreExtensions.FieldTypes
{
    using System;
    using System.ComponentModel;
    using System.Linq;
    using Sitecore;
    using Sitecore.Data;
    using Sitecore.Data.Items;
    using Sitecore.Diagnostics;
    using Sitecore.Foundation.SitecoreExtensions.Extensions;
    using Sitecore.Globalization;
    using Sitecore.Web.UI.HtmlControls;
    using Sitecore.Web.UI.Sheer;
    using Sitecore.Web.UI.WebControls;

    /// <summary>
    /// Extends the <see cref="Sitecore.Shell.Applications.ContentEditor.TreeList"/> by
    /// adding in support to filter the selectable templates in a Tree by the base templates
    /// Syntax for the Field Source: Datasource={Insert Sitecore Query or Item Path}&IncludeBaseTemplatesForSelection={Insert GUID}
    /// </summary>
    public class TreeList : Sitecore.Shell.Applications.ContentEditor.TreeList
    {
        #region Additional Fields for Filtering

        [Category("Data")]
        [Description("Comma separated list of item ids.")]
        public string IncludeBaseTemplatesForSelection
        {
            get
            {
                return this.GetViewStateString("IncludeBaseTemplatesForSelection");
            }
            set
            {
                Assert.ArgumentNotNull(value, "value");
                this.SetViewStateString("IncludeBaseTemplatesForSelection", value);
            }
        }

        #endregion

        /// <summary>
        /// Overrides the source property to pull out DataSource property
        /// </summary>
        public new string Source
        {
            get
            {
                return base.Source;
            }
            set
            {
                if (value == null)
                {
                    base.Source = null;
                }
                else
                {
                    var datasourceValue = StringUtil.ExtractParameter("DataSource", value).Trim();

                    if (datasourceValue.StartsWith("query:"))
                    {
                        base.Source = value.Replace(datasourceValue, this.ResolveQuery(datasourceValue));
                    }
                    else if (value.StartsWith("query:"))
                    {
                        base.Source = this.ResolveQuery(value);
                    }
                    else
                    {
                        base.Source = value;
                    }
                }
            }
        }

        /// <summary>
        /// Overrides the <see cref="OnLoad"/> method to set our custom properties
        /// </summary>
        /// <param name="args"></param>
        protected override void OnLoad(EventArgs args)
        {
            if (!Sitecore.Context.ClientPage.IsEvent)
            {
                this.SetProperties();
            }

            base.OnLoad(args);
        }
        
        /// <summary>
        /// Overrides the <see cref="Add"/> method to execute our custom logic
        /// and determine if the selected item in the tree inherits from
        /// a configured base template
        /// </summary>
        protected new void Add()
        {
            if (this.Disabled)
            {
                return;
            }

            var viewStateString = this.GetViewStateString("ID");
            var treeviewEx = this.FindControl(viewStateString + "_all") as TreeviewEx;

            Assert.IsNotNull(treeviewEx, typeof(DataTreeview));
            var listbox = this.FindControl(viewStateString + "_selected") as Listbox;

            Assert.IsNotNull(listbox, typeof(Listbox));
            var selectionItem = treeviewEx.GetSelectionItem(Language.Parse(this.ItemLanguage), Sitecore.Data.Version.Latest);

            if (selectionItem == null)
            {
                SheerResponse.Alert("Select an item in the Content Tree.");
            }
            else
            {
                if (!this.HasIncludeBaseTemplatesForSelection(selectionItem))
                {
                    return;
                }

                base.Add();
            }
        }

        /// <summary>
        /// Resolves the Sitecore Query
        /// </summary>
        /// <param name="query">The Sitecore Query</param>
        /// <returns></returns>
        protected virtual string ResolveQuery(string query)
        {
            var contextItem = Sitecore.Context.ContentDatabase.Items[this.ItemID];

            /**
             * This area can be an additional extension point to allow for 'tokens'
             * within the query, such as $site or $home.
             */

            var obj = contextItem?.Axes.SelectSingleItem(query.Substring("query:".Length));

            return obj != null 
                ? obj.Paths.FullPath 
                : String.Empty;
        }

        private void SetProperties()
        {
            this.IncludeBaseTemplatesForSelection = StringUtil.ExtractParameter("IncludeBaseTemplatesForSelection", this.Source).Trim();
        }

        private bool HasIncludeBaseTemplatesForSelection(Item item)
        {
            if (String.IsNullOrEmpty(this.IncludeBaseTemplatesForSelection))
            {
                return true;
            }

            var items = this.IncludeBaseTemplatesForSelection.Split(new { ',' }, StringSplitOptions.RemoveEmptyEntries);

            if (!items.Any())
            {
                return true;
            }

            return items.Any(id => item.IsDerived(new ID(id)));
        }
    }
}
```

#### Configuring our new Field Types

To override Sitecore's default fields seamlessly, we need apply a patch configuration to the _controlSources_ node that inserts a location to search **before** Sitecore's fields are evaluated. When Sitecore is looking for the implementation of it's fields, it looks for controlSources with a prefix of "content", so if we include our own source with the same prefix **before** Sitecore's we allow Sitecore to check our namespace to see if the type exists before using Sitecore's.

```xml
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/" xmlns:set="http://www.sitecore.net/xmlconfig/set/">
    <sitecore>
        <controlSources>
            <source patch:before="*[@namespace='Sitecore.Shell.Applications.ContentEditor']" mode="on" 
                    namespace="Sitecore.Foundation.SitecoreExtensions.FieldTypes" assembly="Sitecore.Foundation.SitecoreExtensions" prefix="content" />
        </controlSources>
    </sitecore>
</configuration>
```

And that it, a gist is available [here](https://gist.github.com/KKings/7b092c77f62d4b3e31a4a494cd17fefb).
