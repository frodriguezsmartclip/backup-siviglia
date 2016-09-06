define(
    ["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin",
        "dijit/_WidgetsInTemplateMixin"],
    function (declare,WidgetBase,Templated,WidgetsInTemplate) {
        return declare([WidgetBase, Templated,WidgetsInTemplate], {
            postCreate:function()
            {
                this.showNotifications();
                this.inherited(arguments);
            },
            showNotifications:function()
            {
                if (this.model) {
                    var m=this;
                    var indexField = this.model.modelMeta.definition.INDEXFIELDS[0];
                    var modelName = this.model.modelMeta.modelName;
                    var n=new Siviglia.Model.Model('notification');
                    n.getView('views/ShowNotifications', {model:n, params:{object:modelName, id_object:this.model.get(indexField)}}, null).then(function(v) {
                        m[m.notificationsContainer].appendChild(v.domNode);
                        v.startup();
                    });
                }
            },
            showSpecificNotifications:function(object, idObject)
            {
                var m=this;
                var n=new Siviglia.Model.Model('notification');
                n.getView('views/ShowNotifications', {model:n, params:{object:object, id_object:idObject}}, null).then(function(v) {
                    m[m.notificationsContainer].appendChild(v.domNode);
                    v.startup();
                });

            }
        });
    });
