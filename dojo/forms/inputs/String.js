define(["dojo/_base/declare", 'dijit/form/ValidationTextBox', 'Siviglia/forms/inputs/BaseInput'],
    function (declare, TextBox, BaseInput) {
        return declare([TextBox, BaseInput], {
            postMixInProperties:function()
            {
                this.validator=this.sivValidate;
                this.inherited(arguments)
            },
            sivInitialize:function(definition,value,params)
            {
                if(definition.PARAMTYPE=='DYNAMIC')
                {
                    this.set('intermediateChanges',true);
                    this.oldHandle=this._handleOnChange;
                    this._handleOnChange=function(/*anything*/ newValue, /*Boolean?*/ priorityChange){
                        // summary:
                        //		Called when the value of the widget has changed.  Saves the new value in this.value,
                        //		and calls onChange() if appropriate.   See _FormWidget._handleOnChange() for details.
                        if(this.curTimer)
                            clearTimeout(this.curTimer);

                        this._set("value", newValue);
                        var m=this;
                        this.curTimer=setTimeout(function(){m.oldHandle(newValue,priorityChange)},300);

                    }
                }

		this.set("value",value,null);
            }
       });
    }
);


/*StringInput:function(name,f,form,value)
 {
 var p = new Deferred();
 //dijit.form.ValidationTextBox
 require(["dijit/form/ValidationTextBox"],function(t)
 {

 var input=new t({name:name});
 input.inputInitializer=inputInitializer;
 input.sivigliaValue=valueConverter;
 input.validator=inputValidator;
 input.inputInitializer(f,form,value);
 p.resolve(input);
 });
 return p.promise;
 },*/
