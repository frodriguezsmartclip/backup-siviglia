define(["dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
    'Siviglia/forms/inputs/BaseInput',
    'dojo/aspect','dojo/_base/lang',
    'Siviglia/forms/inputs/FixedSelect',
    'Siviglia/forms/inputs/BarcodeReader',
    ],
    function (declare, Widget,Templated,WidgetsInTemplate,BaseInput,aspect,lang,FixedSelect,BarcodeReader) {
        return declare([Widget, Templated,WidgetsInTemplate],
            {
                widgetsInTemplate:true,
                templateString:'<span><div data-dojo-attach-point="selectorNode"></div><div data-dojo-attach-point="barcodeNode"></div></span>',
                eventsEnabled:true,
                sivInitialize: function (definition,value,params) {
                    var p=this;
                    this.selector=new FixedSelect({},this.selectorNode);
                    this.barcode=new BarcodeReader({},this.barcodeNode);
                    this.selector.sivInitialize(definition,value,params);
                    aspect.after(this.selector,'onChange',lang.hitch(this,'onSelectorChanged'));
                    aspect.after(this.barcode,'onChange',function(ev)
                    {
                        p.onBarcodeChanged();
                    });
                },
               getValue: function () {
                    return parseInt(this.get('value'));
                },
                onSelectorChanged:function()
                {
                    this.setValue(this.selector.get("value"));
                },
                onBarcodeChanged:function()
                {
                    this.setValue(this.barcode.getValue());
                    //this.emit("change",{});

                },
                getValue:function()
                {
                    return this.value;
                },
                setValue:function(val)
                {
                    if(val==this.value)
                        return;
                    this.value=val;
                    this.eventsEnabled=false;
                    this.selector.set("value",this.value,false);
                    this.barcode.setValue(this.value);
                    this.eventsEnabled=true;
                    this.onChange();
                },
                onChange:function()
                {

                },
                reset:function()
                {
                    this.value=null;
                    this.selector.set("value",null);
                    this.barcode.reset();
                },
                focus:function()
                {
                    this.barcode.focus();
                }
            });
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
