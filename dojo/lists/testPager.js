define(
    ["dojo/_base/declare","dijit/_WidgetBase",
        "dijit/_TemplatedMixin","dojo/dom-geometry"
    ],
    function(declare,WidgetBase,TemplatedMixin,geometry)
    {
        return declare([WidgetBase,TemplatedMixin],{
            templateString:'<div><span data-dojo-attach-point="container"></span></div>',
            item:null,
            postCreate:function()
            {
                this.container.innerHTML=this.item.pos;
                this.containerNode=this.domNode;
                this.inherited(arguments);
            },
            resizeChildren: function(){
                /*var box = geometry.getMarginBox(this.containerNode);

                this.domNode.style.width=box.w +'px';
                this.domNode.style.height=box.h +'px';*/
            },

            parseChildren: function(){
                //parser.parse(this.containerNode);
            }

        });
    });/**
 * Created with JetBrains PhpStorm.
 * User: Usuario
 * Date: 19/09/13
 * Time: 0:15
 * To change this template use File | Settings | File Templates.
 */
