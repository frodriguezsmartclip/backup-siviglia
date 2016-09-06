define(["dojo/_base/declare", 'dijit/form/TextBox', 'Siviglia/forms/inputs/BaseInput'],
    function (declare, TextBox, BaseInput) {
        return declare([TextBox, BaseInput], {type: 'password'});
    }
);
/*
 require(["dijit/form/TextBox"],function(t)
 {
 input=new t({name:name,'type':'password'});
 input.inputInitializer=inputInitializer;
 input.sivigliaValue=valueConverter;
 input.validator=inputValidator;
 input.inputInitializer(f,form);
 p.resolve(input);
 });
 */