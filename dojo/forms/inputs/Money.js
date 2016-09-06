define(["dojo/_base/declare", 'dijit/form/NumberSpinner', 'Siviglia/forms/inputs/BaseInput'],
    function (declare, NumberSpinner, BaseInput) {
        return declare([NumberSpinner, BaseInput], {});
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