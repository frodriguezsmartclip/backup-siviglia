define(['dojo/_base/declare','dijit/_Widget','dijit/_Templated','dojo/text!./templates/ActionExecuteView.html',
    'dojo/Evented','dijit/registry','dijit/form/Form','dijit/form/RadioButton','dijit/form/Select'
],function(declare, _Widget, _Templated, template, Evented, registry){
    return declare([_Widget, _Templated, Evented], {
        widgetsInTemplate:true,
        templateString:template,
        activeDataGroupMember: null,
        data: null,
        params: null,

        constructor:function(params)
        {
            this.activeDataGroupMember = params.activeDataGroupMember;
            this.data = params.data;
            this.params = params.params;
            this.inherited(arguments);
        },
        postCreate:function()
        {
            var self = this;

            if (this.activeDataGroupMember) {
                registry.byId('scopeSelector1').checked = true;
                this.dataGroupMemberName.innerHTML = '<strong>('+this.data.dataGroupMemberName+')</strong>';
                this.dataGroupMemberItems.innerHTML = '<strong>('+this.data.dataGroupMemberItems+' elementos)</strong>';
                this.dataGroupName.innerHTML = '<strong>('+this.data.dataGroupName+')</strong>';
                this.dataGroupItems.innerHTML = '<strong>('+this.data.dataGroupItems+' elementos)</strong>';

                //Hack para corregir la selección del primero, quitarlo!
                setTimeout(function() {
                    registry.byId('scopeSelector1').focus();
                }, 50)
            }
            else {
                registry.byId('scopeSelector1').setDisabled(true);
                registry.byId('scopeSelector2').setDisabled(true);
                this.cronSelect.setDisabled(true);
                registry.byId('scopeSelector3').checked = true;
            }
            this.selectionItems.innerHTML = '<strong>('+this.data.selectionItems+' elementos)</strong>';

            //Selección en los radio
            registry.byId('scopeSelector1').on('change', function(isChecked){
                if (isChecked) {
                    self.cronSelect.setDisabled(false);
                }
            });
            registry.byId('scopeSelector1').on('change', function(isChecked){
                if (isChecked) {
                    self.cronSelect.setDisabled(false);
                }
            });
            registry.byId('scopeSelector3').on('change', function(isChecked){
                if (isChecked) {
                    self.cronSelect.setDisabled(true);
                }
            });

        },
        cancelAction:function()
        {
            this.emit('ACTION CANCELLED', {});
        },
        selectAction:function()
        {
            if (this.executeActionForm.validate()) {
                var scope = 0;
                var cronValue = 0;

                if (registry.byId('scopeSelector1').checked) {
                    scope = 1;
                }
                else if (registry.byId('scopeSelector2').checked) {
                    scope = 2;
                }
                else if (registry.byId('scopeSelector3').checked) {
                    scope = 3;
                }

                if (this.activeDataGroupMember) {
                    cronValue = this.cronSelect.get('value');
                }

                var params = {scope: scope, cronValue: cronValue};
                this.emit('ACTION SELECTED', {params: params});
            }
        }

    })
});