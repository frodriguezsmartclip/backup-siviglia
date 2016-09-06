define(["dojo/_base/declare", 'dijit/form/Button', 'Siviglia/forms/inputs/BaseInput'],
    function (declare, Button, BaseInput) {
        return declare([Button, BaseInput], {sivigliaValue: function () {
            return null;
        }});
    }
);
/*
 SubmitInput:function(name,f,form,value)
 {
 var p=new Deferred();
 require(["dijit/form/Button"],function(t)
 {
 var label=f.LABEL ? f.LABEL:'Ok';
 var input=new t({'label':label,onClick:function(){form.submit()}});
 if(typeof(value)!=="undefined")
 input.set('value',value);
 p.resolve(input);

 }
 );
 return p.promise;
 },
 */