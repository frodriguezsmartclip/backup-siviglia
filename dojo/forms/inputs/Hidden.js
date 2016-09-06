define(["dojo/_base/declare", 'dijit/form/ValidationTextBox', 'Siviglia/forms/inputs/BaseInput'],
    function (declare, TextBox, BaseInput) {
        return declare([TextBox, BaseInput], {
            postCreate:function()
            {
                this.domNode.style.display='none';
                this.inherited(arguments);
            }
       });
    }
);
