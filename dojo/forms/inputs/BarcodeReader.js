define(['dojo/_base/declare',
    'dijit/_Widget',
    'dijit/_Templated',
    'Siviglia/forms/inputs/BaseInput',
    'dojo/on','dojo/_base/lang',
    'dijit/form/Button',
    'dijit/form/ValidationTextBox'
],function(declare,_Widget,_Templated,BaseInput,on,lang){

 return declare([ _Widget, _Templated,BaseInput], {
       templateString:'<div class="BarcodeReader">'+
            '<form   data-dojo-attach-point="readForm" data-dojo-attach-event="onSubmit: doClicked,onClick: doClicked">'+
            '<input type="text"   data-dojo-attach-point="barcode" data-dojo-type="dijit/form/ValidationTextBox" intermediateChanges="false" trim="false" uppercase="false" lowercase="false" propercase="false" invalidMessage="$_unset_$" style="width: 110.109375px;">'+
            '</input>'+
            '<input type="submit"  data-dojo-attach-point="submitButton"  data-dojo-type="dijit/form/Button" intermediateChanges="false" label="Ok" iconClass="dijitNoIcon">'+
            '</input></form></div>',
       widgetsInTemplate:true,
       postCreate:function()
       {       		
           var m=this;
           this.oldVal='';
       		on(this.submitButton, 'click', lang.hitch(this, 'doClicked'));
            on(this.barcode,'click',lang.hitch(this,'onTextClicked'));
            on(this.barcode,'blur',function(){
                if(m.barcode.get("value")=="" && m.oldVal!='') {
                    m.barcode.set("value",m.oldVal,false);
                }
            });
           this.allowAny=true;
       		this.inherited(arguments);	
       },
       onTextClicked:function(){
                this.oldVal=this.barcode.get("value");
                this.barcode.set("value",'',false);
                },
       onBarcodeChanged:function(eventObj)
       {
           // El evento "change" se produce al hacer click al boton, no antes.
           eventObj.stopPropagation();
           eventObj.preventDefault();
           return false;
       },
       doClicked:function(eventObj)
       {
       	   var str=this.barcode.get("value");
           this.onChange();
           return false;
       },
        onChange:function()
        {

        },
       setWidth:function(w)
       {
           this.barcode.domNode.style.width=w+'px';
       },
       reset:function()
       {
            this.oldVal="";
       		this.barcode.set("value","",false);
       		this.focus();
       },
       setValue:function(val)
       {
       	    this.barcode.set("value",val,false);
       },
       getValue:function()
       {
           return this.barcode.get("value");
       },
       focus:function()
       {
       		this.barcode.focus();
       }
});
});
