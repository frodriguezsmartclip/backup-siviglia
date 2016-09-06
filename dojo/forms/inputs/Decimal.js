define(["dojo/_base/declare", 'dijit/form/ValidationTextBox', 'Siviglia/forms/inputs/BaseInput'],
    function (declare, TextBox, BaseInput) {
        return declare([TextBox, BaseInput], {
            postMixInProperties:function()
            {
                this.validator=this.inputValidator;
                this.inherited(arguments)
            }});
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