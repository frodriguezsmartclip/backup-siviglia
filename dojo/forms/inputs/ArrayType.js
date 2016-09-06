define(["dojo/_base/declare", 'dijit/form/SimpleTextarea', 'Siviglia/forms/inputs/BaseInput'],
    function (declare, SimpleTextarea, BaseInput) {
        return declare([SimpleTextarea, BaseInput], {
            postMixInProperties:function()
            {
                this.validator=this.sivValidate;
                this.inherited(arguments)
            },
            sivInitialize:function(definition,value,params)
            {
                if (definition.ROWS) {
                    this.textbox.rows = definition.ROWS;
                }
                else {
                    this.textbox.rows = "8";
                }

                if (definition.COLS) {
                    this.textbox.cols = definition.COLS;
                }
                else {
                    this.textbox.cols = "60";
                }
                this.set("value",value,null);
            },
            getValue:function()
            {
                var val = this.get('value');
                var a = val.split("\n");

                return a;
            }
        });
    }
);