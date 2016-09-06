define(["dojo/_base/declare","dijit/_WidgetBase",
    "dijit/_TemplatedMixin",'Siviglia/forms/inputs/BaseInput',"dojo/Evented","dojo/on","dojo/dom-class"],
    function (declare,WidgetBase,TemplatedMixin,BaseInput,Evented,on,dom) {
        return declare([WidgetBase,TemplatedMixin,BaseInput,Evented],
            {
                templateString:'<div><div data-dojo-attach-point="errorNode" class="SivErrorNode" style="display:none"></div><div data-dojo-attach-point="mainNode"></div></div>',
                sivInitialize: function (definition,value,params) {
                    this.store=params['STORE'];
                    this.query=params['QUERY']?params['QUERY']:{};
                    this.queryOpts=params['QUERYOPTS']?params['QUERYOPTS']:{};
                    this.createElement=params['GENERATOR'];
                    this.valueProperty=params['VALUEFIELD'];
                    this.selectedStyle=params['SELECTEDSTYLE'] || '';
                    this.value=value;
                    this.allowedValues=[];
                    var m=this;
                    this.reset();

                },
                focus: function()
                {


                },
                initializeSpeech:function()
                {
                    top.SpeechEngine = new webkitSpeechRecognition();
                    top.SpeechEngine.continuous = false;
                    top.SpeechEngine.interimResults = true;
                    top.SpeechEngine.lang='es-ES';

                    var m=this;

                    //top.SpeechEngine.onerror = function(event) { ... }
                    //top.SpeechEngine.onend = function() { ... }


                    top.SpeechEngine.start();
                    console.debug("LLAMO A START");
                },
                reset: function()
                {
                    var m=this;
                    this.currentItem=null;
                    this.mainNode.innerHTML='';
                    this.allowedValues=[];
                    this.store.query(this.query,this.queryOpts).forEach(function(item){
                        var d=document.createElement("div");
                        d.className="selectViewNodeWrapper";
                        var d1=document.createElement("div");
                        d1.className="selectViewNodeContents";
                        d.appendChild(d1);
                        m.allowedValues.push(item);

                        if(item[m.valueProperty]==m.value)
                        {
                            m.currentItem=d;
                            d.className+=' selectViewNodeSelected';
                            d1.className+=' selectViewNodeSelected';
                        }
                        d1.appendChild(m.createElement(item,this.value));
                        on(d,'click',function(ev){
                            m.onClicked(d,item[m.valueProperty])
                        });
                        m.mainNode.appendChild(d);
                    });
                },
                onClicked:function(node,value)
                {
                    if(this.currentItem)
                    {
                        dom.remove(this.currentItem,"selectViewNodeSelected");
                        dom.remove(this.currentItem.firstChild,"selectViewNodeSelected");
                    }
                    this.currentItem=node;
                    dom.add(node,"selectViewNodeSelected");
                    dom.add(node.firstChild,"selectViewNodeSelected");
                    this.value=value;
                    this.emit("change",value);
                },
                setValue:function(value)
                {
                    this.value=value;
                    this.reset();
                    this.emit("change",value);
                },
                getValue:function()
                {
                    if(this.value===null)
                        return null;
                    return parseInt(this.value);
                },
                get:function(varName)
                {
                    switch(varName)
                    {
                        case 'value':{return this.getValue();}
                    }
                    return '';
                },
                getAvailableValues:function()
                {
                   return this.allowedValues;
                },
                showError:function(type,message)
                {
                    this.errorNode.innerHTML=message;
                    this.errorNode.style.display='block';
                },
                clearErrors:function()
                {
                    this.errorNode.innerHTML='';
                    this.errorNode.style.display='none';
                }
                });
    }
);