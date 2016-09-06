define(["dojo/_base/declare", 'dijit/form/FilteringSelect', 'Siviglia/forms/inputs/BaseInput', 'dojo/store/Memory'],
    function (declare, FilteringSelect, BaseInput, Memory) {
        return declare([CheckBox, BaseInput],
            {
            }
        );
    }
);

/*
 RelationshipInput:function(name,f,form,dsdef)
 {
 var p = new Deferred();
 require(["dijit/form/FilteringSelect","dojo/store/Memory"],function(t,Memory)
 {
 var params=form.getInputParams(name);
 Siviglia.loader.getDataSource(params.DATASOURCE.OBJECT,
 params.DATASOURCE.NAME,
 {}
 ).then(function(d){
 params=form.getInputParams(name);
 // Se crea el array de opciones.
 var opts=[];
 if(params.PRE_OPTIONS) {
 for(var k in params.PRE_OPTIONS)
 opts.push({'name':params.PRE_OPTIONS[k],'id':k});
 }
 var nLabels=params.LABEL.length;
 var cLabel;
 var dl=d.length;

 for(var k=0;k<dl;k++) {
 cLabel='';
 for(var j=0;j<nLabels;j++)
 {
 if(j>0) cLabel+=' ';
 cLabel+=d[k][params.LABEL[j]];
 }
 opts.push({'name':cLabel,'id':d[k][params.VALUE]});
 }
 var input=new t({name:name,labelAttr:'name',
 store:new Memory({data:opts})
 });

 input.inputInitializer=inputInitializer;
 input.sivigliaValue=relationValueConverter;
 input.validator=inputValidator;
 input.inputInitializer(f,form,value);
 p.resolve(input);

 }
 );
 });
 return p.promise;
 },
 */