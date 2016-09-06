define(["dojo/_base/declare", 'dijit/form/CheckBox', 'Siviglia/forms/inputs/BaseInput'],
    function (declare, CheckBox, BaseInput) {

        return declare([CheckBox, BaseInput], {
            sivInitialize:function(definition,value,params)
            {
                this.definition=definition;
                this.validator=this.sivValidate;
                this.set('value', 1);
                this.setValue(value);


                this.sivParams=params;
            },
            setValue:function(value){
                if(value==null || value=="0" || value=="false" || value==false)
                    this.set('checked', false);
                else
                    this.set('checked', true);
            },
            getValue: function () {
                return this.get('checked')?true:false;
            }
        });
    }
);

/*BooleanInput:function(name,f,form,value)
 {
 var p = new Deferred();
 //dijit.form.ValidationTextBox
 require(["dijit/form/CheckBox"],function(t)
 {
 var input=new t({name:name});
 input.inputInitializer=inputInitializer;
 input.sivigliaValue=booleanValueConverter;
 input.validator=inputValidator;
 input.inputInitializer(f,form,value);
 p.resolve(input);
 });
 return p.promise;
 }*/