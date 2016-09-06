/**
 * Created by Usuario on 18/03/14.
 */
/**
 * Created by Usuario on 17/03/14.
 */
define(
    ["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin"],
    function (declare,WidgetBase, Templated,WidgetsInTemplate) {
        return declare([WidgetBase, Templated,WidgetsInTemplate], {
            regions:{},
            parseNode:function(regionName,data)
            {
                if(this.regions[regionName])
                {
                    this.copyToRoot(this.regions[regionName].pathRoot,data);
                    this.regions[regionName].data=data;
                    this.regions[regionName].pathRoot.notifyPathListeners();
                    this.onParsed(regionName);
                    return;
                }

                var curRoot=new Siviglia.model.PathRoot();
                this.regions[regionName]={
                    pathRoot:curRoot,
                    data:data
                };
                this.copyToRoot(curRoot,data);
                this.regions[regionName].oManager=new Siviglia.UI.Dom.Expando.ExpandoManager(curRoot,curRoot.context);
                this.regions[regionName].oManager.parse($(this[regionName]),this);
                this.onParsed(regionName);
            },
            onParsed:function(regionName)
            {

            },
            copyToRoot:function(root,data)
            {
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
            }
        });
    });
