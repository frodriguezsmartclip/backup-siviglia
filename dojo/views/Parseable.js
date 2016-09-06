/**
 * Created by Usuario on 17/03/14.
 */
define(
    ["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin"],
    function (declare,WidgetBase, Templated,WidgetsInTemplate) {
        return declare([WidgetBase, Templated,WidgetsInTemplate], {
        SivigliaRoot:null,
        data:null,
        parsed:false,
        widgetsInTemplate:true,
        parseNode:function(data,node,regenerate)
        {
            if(regenerate)
            {
                if(this.oManager)
                    this.oManager.destruct();
                this.parsed=false;
                this.SivigliaRoot=new Siviglia.model.PathRoot();
            }

            if(!this.SivigliaRoot)
                this.SivigliaRoot=new Siviglia.model.PathRoot();


            var root=this.SivigliaRoot;
            if(data.constructor.toString().indexOf('Array')!=-1)
            {
                root.data=data;
            }
            else
            {
                for(var k in data)
                {
                    root[k]=data[k];
                }
            }

            this.data=data;
            if(this.parsed)
            {
                this.SivigliaRoot.notifyPathListeners();
                this.onParsed();
                return;
            }
            this.parsed=true;
            var tempRoot=this.domNode;

            this.oManager=new Siviglia.UI.Dom.Expando.ExpandoManager(root,root.context);
            var tnode= $(node || this.domNode);
            this.oManager.parse(tnode,this);
            this.onParsed();
        },
        onParsed:function()
        {
        },
        destroyRecursive:function()
        {
            if(this.oManager)
                this.oManager.destruct();
            this.inherited(arguments);
        }

    });
});
