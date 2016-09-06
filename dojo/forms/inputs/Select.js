define(["dojo/_base/declare", 'dijit/form/Select', 'Siviglia/forms/inputs/BaseInput'],
    function (declare, Select, BaseInput) {
        return declare([Select, BaseInput],
            {
               getValue: function () {
                    return parseInt(this.get('value'));
                }});
    }
);
/*
 EnumInput:function(name,f,form,value)
 {
 var p=new Deferred();
 require(['dijit/form/Select'],function(t){
 var vals=[];
 for(var k in f.VALUES) {
 vals.push({'label':f.VALUES[k],'value':k})
 }

 input=new t({name:name,options:vals});
 input.inputInitializer=inputInitializer;
 input.sivigliaValue=integerCastConverter;
 input.validator=inputValidator;
 input.inputInitializer(f,form,value);
 p.resolve(input);
 });
 return p.promise;
 }*/