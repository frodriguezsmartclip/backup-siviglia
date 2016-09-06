define(["dojo/_base/declare", 'Siviglia/forms/inputs/String'],
    function (declare, String) {
        return declare([String], {

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
