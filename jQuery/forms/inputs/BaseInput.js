Siviglia.Utils.buildClass(
    {
        "context":"Siviglia.Forms.JQuery.Inputs",
        classes:
        {
            BaseInput:
            {
                construct:function(baseParams,node)
                {
                    this.rootNode=$(node);
                    this.node=this.createBaseNode();
                    this.rootNode.append(this.node);
                    this.node.addClass("input");
                    this.tooltip=null;
                },
                methods:
                {
                    sivInitialize:function(definition,value,params)
                    {
                        this.definition=definition;
                        this.sivParams=params || {};
                        this.createInput(value);
                        if(value!=null)
                            this.setValue(value);
                        this.rootNode.addClass(definition.TYPE);
                        if(typeof definition.NAME!="undefined")
                            this.rootNode.addClass(definition.NAME);
                    },
                    showError:function(type,message,exception)
                    {
                        if(exception && exception.params)
                        {
                            for(var k in exception.params)
                            {
                                message=message.replace('%'+k+'%',exception.params[k]);
                            }
                        }

                            var d=new Date();
                            this.tooltip=this.node.jqxTooltip({name:d+d.getMilliseconds(), animationShowDelay:'fast',autoHide:false,closeOnClick:false,position:'right' });

                            this.node.jqxTooltip({content: message});

                        this.node.jqxTooltip("open");
                        this.node.addClass("errored");
                        /*if(this.validator)
                        {
                        this.validator.rules=[{input: '.input', message: message , action: '', rule: function (input, commit) {commit(true)}}];
                        this.validator.validate();
                        this.validator.rules=this.getValidationRules();
                        }*/

                     },
                     getValidationRules:function()
                     {
                         var rules=[];
                         if(this.definition["REQUIRED"])
                         {
                             rules.push({ input: '.input', message: 'Username is required!', action: 'keyup, blur', rule: 'required' });
                         }
                         return rules;
                     },
                     clearErrors:function()
                     {
                         if(this.tooltip)
                            this.node.jqxTooltip( 'destroy' );
                         this.node.removeClass("errored");
                         /*if(this.validator)
                         ths.validator.hide();*/
                     },
                     getValue:function()
                     {
                         return this.node.val();
                     },
                     setValue:function(value)
                     {
                         this.node.val(value);
                     },
                    validate:function()
                    {
                        //this.node.jqxValidator('validateInput',this.node)
                    },
                     get:function(property)
                     {
                         switch(property)
                         {
                             case "value":
                             {
                                 return this.getValue();
                             }break;
                         }
                     },
                     set:function(property,value)
                     {
                        switch(property)
                        {
                            case "value":
                            {
                                this.setValue(value);
                            }break;
                            case "disabled":
                            {
                                this.setDisabled(value);
                            }
                        }
                     },
                     setInputWrapper:function(obj)
                     {
                        this.inputWrapper=obj;
                     },
                     getPath:function(path,obj,key)
                     {
                        if(this.inputWrapper)
                        {
                            return this.inputWrapper.getPath(path,obj,key);
                        }
                        obj[key]=path;
                        return path;
                     },
                     on:function(event,callback)
                     {
                         this.node.on(event,callback);
                     },
                    createBaseNode:function()
                    {
                        return $('<span></span>');
                    },
                    startup:function()
                    {

                    }

                }
            },
            String:
            {
                /*
                 {disabled: false,
                 filter: c._filter,
                  sort: c._sort,
                  highlight: c._highlight,
                  dropDownWidth: null,
                  renderer: c._renderer,
                  opened: false,
                  $popup: a("<ul></ul>"),
                  source: [],
                  roundedCorners: true,
                  searchMode: "default",
                  placeHolder: "",
                  width: null,
                  height: null,
                  value: "",
                  rtl: false,
                  displayMember: "",
                  valueMember: "",
                  events: ["select", "open", "close"],
                  popupZIndex: 20000, items: 8, item: '<li><a href:"#"></a></li>', minLength: 1, maxLength: null};
                 */
                inherits:'BaseInput',
                methods:
                {
                    createInput:function()
                    {
                        var opts={};
                        if(this.sivParams["placeHolder"])
                            opts.placeHolder=this.sivParams["placeHolder"];
                        if(this.sivParams["source"])
                            opts.source=this.sivParams.source;
                        /*  $("#input").jqxInput({placeHolder: "Enter a Country", height: 25, width: 200, minLength: 1,  source: countries });*/
                         this.node.jqxInput(opts);
                    },
                    getValidationRules:function()
                    {
                        var rules=this.BaseInput$getValidationRules();
                        if(this.definition["MAXLENGTH"])
                        {
                            rules.push({ input: '.input', message: 'La longitud maxima es de '+this.definition["MAXLENGTH"]+'caracteres', action: 'keyup, blur'});
                        }
                        if(this.definition["MINLENGTH"])
                        {
                            rules.push({input:'.input',message: 'La longitud minima es de '+this.definition["MINLENGTH"]+'caracteres', action: 'keyup, blur'});
                        }
                        if(this.definition["REGEXP"])
                        {
                            var self=this;
                            rules.push({input:'.input',message:'Valor no valido',rule: function (input, commit) {
                                if(!input.val().match(self.definition["REGEXP"]))
                                    commit(true)
                                else
                                    commit(false);
                            }});
                        }
                    },
                    setDisabled:function(val)
                    {
                        this.node.jqxInput({ disabled: val});
                    },
                    createBaseNode:function()
                    {
                        return $('<input></input>');
                    }
                }
            },
            Enum:
            {
                inherits:'BaseInput',
                methods:
                {
                    createInput:function()
                    {
                        var finalOpts=[];
                        for(var k=0;k<this.definition.VALUES.length;k++)
                        {
                            var c=this.definition.VALUES[k];
                            var label,value;
                            label=value=c;
                            if(typeof c=="object")
                            {
                                label=c.LABEL;
                                value=c.VALUE;
                            }
                            finalOpts.push(
                                {html:'<div tabIndex=0 style="padding:1px">'+label+'</div>',label:label,value:value}
                            )
                        }
                        var opts={source:finalOpts,placeHolder:'Seleccionar', height: 25, width: 200,minLength:0};
                        this.node.jqxComboBox(opts);

                    },
                    setDisabled:function(val)
                    {
                        this.node.jqxInput({ disabled: val});
                    },
                    createBaseNode:function()
                    {
                        return $('<div></div>');
                    }
                }
            },
            Integer:
            {
                inherits:'BaseInput',
                methods:
                {
                    createInput:function()
                    {
                        /* {value: null,
                            decimal: 0,
                            min: -99999999,
                            max: 99999999,
                            width: 200,
                            validationMessage: "Invalid value",
                            height: 25, textAlign: "right", readOnly: false,
                            promptChar: "_",
                            decimalDigits: 2,
                            decimalSeparator: ".", groupSeparator: ",", groupSize: 3, symbol: "", symbolPosition: "left", digits: 8, negative: false, negativeSymbol: "-", disabled: false, inputMode: "advanced", spinButtons: false, spinButtonsWidth: 18, spinButtonsStep: 1, autoValidate: true, spinMode: "advanced", enableMouseWheel: true, touchMode: "auto", rtl: false, events: ["valueChanged", "textchanged", "mousedown", "mouseup", "keydown", "keyup", "keypress", "change"], aria: {"aria-valuenow": {name: "decimal", type: "number"}, "aria-valuemin": {name: "min", type: "number"}, "aria-valuemax": {name: "max", type: "number"}, "aria-disabled": {name: "disabled", type: "boolean"}}, invalidArgumentExceptions: ["invalid argument exception"]};
                         */
                        var opts={};
                        this.node.jqxNumberInput({decimalDigits:0});
                    },
                    setDisabled:function(val)
                    {
                        this.node.jqxNumberInput({ disabled: val});
                    }
                }
            },
            Decimal:
            {
                inherits:'Integer',
                methods:
                {
                    createInput:function()
                    {
                        var opts={};
                        this.node.jqxNumberInput({decimalDigits:this.definition.NDECIMALS,digits:this.definition.NINTEGERS})
                    }
                }
            },
            Text:
            {
                inherits:'BaseInput',
                methods:
                {
                    createInput:function()
                    {
                        this.node.jqxEditor();
                    },
                    setDisabled:function(val)
                    {
                        this.node.jqxEditor({ disabled: val});
                    },
                    getValue:function()
                    {
                        return this.node.jqxEditor("val");
                    }
                }
            },
            ArrayType:
            {
                inherits:'Text',
                methods:
                {
                    getValue:function()
                    {
                        var v=this.node.jqxEditor("val");
                        if(v=="")
                            return [];
                        return v.split("\n");
                    }
                }
            },
            AutoIncrement:
            {
                inherits:'Integer',
                methods:
                {
                    createInput:function()
                    {
                        this.node.jqxNumberInput({disabled:true});
                    }
                }
            },
            BarcodeReader:
            {
                inherits:'BaseInput',
                construct:function(baseParams,node)
                {
                    this.BaseInput(baseParams,node);
                    this.eventListeners=[];
                    this.oldVal='';
                },
                methods:
                {
                    createInput:function()
                    {

                        var template='<div class="BarcodeReader">'+
                            '<input type="text" class="barcodeInput" style="width: 110.109375px;">'+
                            '</input><input type="button"  class="barcodeSubmit" label="Ok"></div>';
                        this.node.html(template);
                        this.reader=$(".barcodeInput",this.node);
                        this.button=$(".barcodeSubmit",this.node);
                        var self=this;
                        this.reader.bind('click',function(){self.onTextClicked();})
                        this.reader.bind('blur',function(){
                            if(self.reader.val()=="" && self.oldVal!='') {
                                self.reader.val(m.oldVal);
                            }});
                        this.button.on("click",function(){self.emitChange.apply(self,arguments)});
                    },
                    on:function(event,callback)
                    {
                        if(event!="change")
                            return;
                        this.eventListeners.push(callback);
                    },
                    emitChange:function()
                    {
                        for(var k=0;k<this.eventListeners.length;k++)
                        {
                            this.eventListeners[k].apply(arguments);
                        }
                    },
                    reset:function()
                    {
                        this.oldVal="";
                        this.barcode.set("value","",false);
                        this.focus();
                    },
                    setValue:function(val)
                    {
                        this.oldVal=val;
                        this.reader.val(val);
                    },
                    getValue:function()
                    {
                        return this.reader.val();
                    },
                    focus:function()
                    {
                        this.reader.focus();
                    },
                    setDisabled:function(val)
                    {
                        this.button.prop("disabled",val);
                        this.reader.prop("disabled",val);
                    }

                }
            },
            Boolean:
            {
                inherits:'BaseInput',
                methods:
                {
                    createInput:function()
                    {
                        // {animationShowDelay: 300, animationHideDelay: 300, width: null, height: null, boxSize: "13px", checked: false, hasThreeStates: false, disabled: false, enableContainerClick: true, locked: false, groupName: "", keyboardCheck: true, enableHover: true, hasInput: true, rtl: false, updated: null, disabledContainer: false, _canFocus: true, aria: {"aria-checked": {name: "checked", type: "boolean"}, "aria-disabled": {name: "disabled", type: "boolean"}}, events: ["checked", "unchecked", "indeterminate", "change"]};
                        this.node.jqxCheckBox({ width: 18, height: 18});
                    },
                    setValue:function(value){
                       if(value==null || value=="0" || value=="false" || value==false)
                            this.uncheck();
                       else
                            this.check();
                     },
                     getValue: function () {
                         return this.node.val()?"1":"0";

                     },
                    createBaseNode:function()
                    {
                        return $('<div></div>');
                    },
                    setDisabled:function(val)
                    {
                        this.node.jqxCheckBox({disabled:val})
                    },
                    check:function()
                    {
                        this.node.jqxCheckBox({ checked: true });
                    },
                    uncheck:function()
                    {
                        this.node.jqxCheckBox({ checked: false });
                    }
                }
            },
            ComboBox:
            {
                inherits:'BaseInput',
                methods:
                {
                    get:function(v)
                    {
                        if(v=="searchString")
                        {
                            return this.searchString;
                        }
                        if(v=="value")
                        {
                            return this.internalValue;
                        }
                        return this.BaseInput$get(v);
                    },
                    sivInitialize:function(definition,value,params)
                    {
                        this.definition=definition;
                        this.internalValue=null;
                        this.sivParams=params || {};
                        this.adapterSet=false;
                        this.createInput(value);
                        this.rootNode.addClass(definition.TYPE);
                        this.rootNode.addClass(definition.NAME);

                        /* this.validator=this.node.jqxValidator({
                         rules: this.getValidationRules()
                         });*/
                    },
                    createInput:function(value)
                    {
                    /* var b = {disabled: false, width: 200, height: 25, items: new Array(), selectedIndex: -1,
                     selectedItems: new Array(), _selectedItems: new Array(),
                     source: null, scrollBarSize: a.jqx.utilities.scrollBarSize,
                     arrowSize: 18, enableHover: true,
                     enableSelection: true, visualItems: new Array(),
                     groups: new Array(), equalItemsWidth: true,
                     itemHeight: -1, visibleItems: new Array(),
                     emptyGroupText: "Group", emptyString: "",
                     openDelay: 250, closeDelay: 300, animationType: "default",
                     dropDownWidth: "auto", dropDownHeight: "200px",
                     autoDropDownHeight: false,
                     enableBrowserBoundsDetection: false,
                     dropDownHorizontalAlignment: "left",
                     searchMode: "startswithignorecase",
                     autoComplete: false, remoteAutoComplete: false,
                     remoteAutoCompleteDelay: 500, selectionMode:
                     "default", minLength: 2, displayMember: "",
                     valueMember: "", groupMember: "", searchMember: "",
                     keyboardSelection: true, renderer: null,
                     autoOpen: false, checkboxes: false, promptText: "",
                     placeHolder: "", rtl: false, listBox: null,
                     validateSelection: null,
                     showCloseButtons: true, renderSelectedItem: null, search: null, popupZIndex: 100000, searchString: null, multiSelect: false, showArrow: true, _disabledItems: new Array(), touchMode: "auto", autoBind: true, aria: {"aria-disabled": {name: "disabled", type: "boolean"}}, events: ["open", "close", "select", "unselect", "change", "checkChange", "bindingComplete"]};
                     */
                            var params=this.sivParams;
                            if(!this.sivParams.DATASOURCE.PARAMS)
                                this.sivParams.DATASOURCE.PARAMS={};
                            this.dsParams= this.sivParams.DATASOURCE.PARAMS;
                            // Se ha de hacer aqui, antes de que se calcule los parametros para el adapter
                            if(value)
                            {
                                this.sivParams.DATASOURCE.PARAMS[this.sivParams.VALUE]=value;

                                this.internalValue=value;
                            }
                            if(this.sivParams.MAX_RESULTS)
                            {
                                this.sivParams.DATASOURCE.PARAMS["__count"]=this.sivParams.MAX_RESULTS;
                            }
                            var self=this;
                            this.searchField = params.LABEL[0];
                            this.nullValue = null;
                            this.combo=this.node.jqxComboBox({
                                emptyString:null,
                                openDelay:200,
                                autoComplete:true,
                                autoBind:false,

                                minLength:1,
                                remoteAutoComplete:true,displayMember:this.searchField,valueMember:params.VALUE,autoDropDownHeight: true,width:200,height:25,
                                search:function(str)
                                {
                                    console.debug("SEARCHING:"+str);
                                    self.searching=1;
                                    self.searchString=str;
                                    self.dsParams[self.paramField]=self.searchString;
                                    self.dsParams[self.sivParams.VALUE]=null;
                                    self.refresh();
                                }
                            });
                        this.tempValue=value;
                    },
                    startup:function()
                    {

                        this.getAdapter(this.tempValue);
                        var params=this.sivParams;
                        var self=this;

                        var valueField=params.VALUE;

                        this.node.on("select",function(e){
                            var curIndex=self.node.jqxComboBox("getSelectedItem");
                            if(curIndex)
                            {
                                if(self.internalValue!=curIndex.originalItem[valueField])
                                {
                                    self.setValue(curIndex.value);
                                }
                            }
                        });
                        // Cuando se hace blur en el nodo, pueden pasar 3 cosas:
                        // 1) Que la cadena de busqueda no sea null, y sea parte del valor actual: se completa el valor actual.
                        // 2) Que la cadena de busqueda no sea null, y no sea parte del valor actual: se pone a null.
                        // 1) Que la cadena de busqueda sea "" o null : el valor interno pasa a ser null.
                        $(".jqx-combobox-input",this.node).on("blur",function(){
                                var ss=self.getVisibleLabel();
                                var si=self.getSelectedLabel();
                                console.debug("BLUR: Visible:"+ss+", Selected:"+si);
                                self.searchString='';
                                self.dsParams[self.paramField]=self.searchString;
                                self.searching=0;
                                if(ss=='' || !si)
                                {
                                    self.forceValue(null,'');
                                    return;
                                }
                                if(si==ss)
                                    return;
                                if(si.match(ss))
                                {
                                    self.forceValue(self.lastItem,si);
                                }
                                else
                                {
                                    self.forceValue(null,'');
                                }
                        });

                        },
                        forceValue:function(item,searchString)
                        {
                            console.debug("FORCING VALUE "+this.definition.LABEL+":"+(item?item.value:"null")+", LABEL:"+searchString);
                            if(this.definition.LABEL=='id_state' && item==null && searchString!='')
                            debugger;
                            this.internalValue=item?item[this.sivParams.VALUE]:null;
                            this.lastItem=item;
                            if(item==null)
                                this.node.jqxComboBox("selectedIndex",-1);
                            this.setVisibleLabel(searchString);
                            this.searchString=searchString;
                            this.inputWrapper.pathListener.notifyPathListeners();
                            //                            this.node.trigger("select");
                        },
                        getSelectedLabel:function()
                        {
                            var it=this.lastItem;
                            if(!it)
                                return null;
                            return it[this.searchField];
                        },
                        getVisibleLabel:function()
                        {
                            return $('.jqx-combobox-input',this.node).val();
                        },
                        setVisibleLabel:function(val)
                        {

                            return $('.jqx-combobox-input',this.node).val(val);
                        },
                        refresh:function()
                        {
                            console.debug("REFRESH::"+this.definition.LABEL);

                            if(this.adapter )
                            {
                                if( !this.adapterSet){
                                    this.adapterSet=true;
                                    this.combo.jqxComboBox({source:this.adapter})
                                }
                                else
                                    this.adapter.onParamsChanged();
                            }
                        },
                        createBaseNode:function()
                        {
                            return $('<div></div>');
                        },
                        setDisabled:function(val)
                        {
                            if(!this.combo)
                                return;
                            this.combo.attr("disabled",true);
                        },
                        on:function(event,callback)
                        {
                            var self=this;
                            if(event=="change")
                                event="select";
                            this.node.on(event,function(){
                                console.debug("GOT EVENT!::"+self.definition.LABEL+":"+self.internalValue);
                                callback.apply(arguments);
                            });
                        },
                        setValue:function(val)
                        {
                            //if(this.definition.LABEL=='id_state' && val==233)
                            //    debugger;
                            console.debug("SETTING VALUE::"+this.definition.LABEL+":"+val);
                            this.dsParams[this.sivParams.VALUE]=val;
                            this.internalValue=val;
                            var item=this.node.jqxComboBox("getSelectedItem");
                            if(item)
                            {
                                this.lastItem=item.originalItem;
                                this.searchString=this.lastItem.label;
                            }
                            else
                            {
                                this.lastItem=null;
                            }
                            this.inputWrapper.pathListener.notifyPathListeners();

                        },
                        getValue:function()
                        {
                            if(this.internalValue==null)
                                return this.nullValue;
                            return this.internalValue;
                        },
                        getAdapter:function(value)
                        {
                            var params=this.sivParams;
                            this.dsParams=this.sivParams.DATASOURCE.PARAMS || {};
                            var model = params.DATASOURCE.OBJECT;
                            var remoteDs = params.DATASOURCE.NAME;
                            var valueField=params.VALUE;
                            var labelField=params.LABEL[0];
                            var self=this;

                            this.searchField = params.LABEL[0];
                            // Se establece el campo por defecto de busqueda
                            this.paramField = 'dyn' + this.searchField;
                            // Se crea el parametro de busqueda, para el adapter dinamico.
                            this.dsParams[this.paramField]=this.getVisibleLabel();

                            var helper=new Siviglia.Model.jQuery.jqxWidgets.Utils();
                            this.adapter=helper.getDynamicDataAdapter(this.inputWrapper.pathListener,model,remoteDs,this.dsParams,
                                {
                                    loadComplete:function(localdata)
                                    {
                                        if(!localdata.data)
                                            return;
                                        // Si para esta carga se establecio un valor unico, se borra de los parametros.
                                        self.dsParams[self.sivParams.VALUE]=null;
                                        // Se llama de nuevo en el dataBind()!=
                                        var source =
                                        {
                                            localdata: localdata.data,
                                            datatype: "array"
                                        };
                                        var adapter=new $.jqx.dataAdapter(source,{});
                                        self.node.jqxComboBox("source",adapter);

                                        console.debug("LOADCOMPLETE::"+self.definition.LABEL);

                                        // Si nos ha llegado mas de 1 valor,
                                        if(localdata.data.length==1)
                                        {
                                            self.forceValue(localdata.data[0],localdata.data[0][self.sivParams.LABEL[0]])
                                        }
                                        var found=false;

                                        for(var k=0;k<localdata.data.length && !found;k++)
                                        {
                                            if(localdata.data[k][valueField]==self.internalValue)
                                            {
                                                //self.forceValue(localdata.data[k],localdata.data[k][self.sivParams.LABEL[0]])
                                                found=true;
                                            }
                                            if(localdata.data[k][labelField].substr(self.searchString))
                                                foundLabel=true;
                                        }
                                        if(!foundLabel || !self.searching)
                                            self.searchString='';


                                        // si el valor actual no esta entre los datos recibidos, es que ya no es un valor posible.
                                        if(!found)
                                        {
                                                self.forceValue(null,foundLabel?self.searchString:'');

                                        }
                                        self.searching=0;
                                        return localdata.data;
                                    }
                                }
                            );
                                    if(typeof value!="undefined" && value!==null)
                                    {
                                        this.dsParams[self.sivParams.VALUE]=value;
                                        this.refresh();
                                    }

                        }
                }
            },
            FixedSelect:{
                inherits:'BaseInput',
                methods:{
                    sivInitialize:function(definition,value,params)
                    {
                        this.definition=definition;
                        this.sivParams=params || {};
                        this.createInput(value);
                        this.rootNode.addClass(definition.TYPE);
                        this.rootNode.addClass(definition.NAME);
                    },
                    createInput:function(value)
                    {
                        var params=this.sivParams;
                        var valueField=params.VALUE;
                        var searchField=params.LABEL[0];
                        this.dsParams=this.sivParams.DATASOURCE.PARAMS || {};
                        this.searchField = params.LABEL[0];
                        if (params.NULL_RELATION)
                        {
                            this.nullValue = params.NULL_RELATION[0];
                        }
                        else
                        {
                            this.nullValue = null;
                        }
                        var self=this;

                        this.combo=null;
                        this.tempValue=value;
                        this.combo=this.node.jqxComboBox({
                            emptyString:null,autoBind:true,
                            displayMember:searchField,
                            valueMember:params.VALUE,
                            width:200,
                            placeHolder:this.sivParams["placeholder"]?this.sivParams["placeholder"]:null,

                        });
                        this.tempValue=value;
                    },
                    getAdapter:function(value)
                    {
                        var params=this.sivParams;
                        this.dsParams=this.sivParams.DATASOURCE.PARAMS || {};
                        var model = params.DATASOURCE.OBJECT;
                        var remoteDs = params.DATASOURCE.NAME;
                        var valueField=params.VALUE;
                        var self=this;
                        var helper=new Siviglia.Model.jQuery.jqxWidgets.Utils();
                        var initializing=true;
                        if(typeof value!="undefined")
                        {
                            this.sivParams[valueField]=value;
                        }
                        this.adapter=helper.getDynamicDataAdapter(this.inputWrapper.pathListener,model,remoteDs,this.dsParams,
                            {
                                loadComplete:function(localdata)
                                {
                                    if(typeof(localdata.data)=="undefined")
                                        return;
                                    var source =
                                    {
                                        localdata: localdata.data,
                                        datatype: "array"
                                    };
                                    var adapter=new $.jqx.dataAdapter(source,{});
                                    self.node.jqxComboBox("source",adapter);

                                    if(localdata.count==1)
                                    {
                                        self.node.jqxComboBox('selectIndex', 0);
                                    }
                                    else
                                    {
                                        // Se busca si entre los datos recibidos, esta el valor actual.
                                        for(var k=0;k<localdata.data.length;k++)
                                        {
                                            if(localdata.data[k][valueField]==self.value)
                                                return;
                                        }
                                        // si el valor actual no esta entre los datos recibidos, es que ya no es un valor posible.
                                        if(self.internalValue!=null)
                                            self.node.jqxComboBox('selectItem',null);
                                    }
                                    if(initializing)
                                    {
                                        self.node.val(value);
                                        initializing=false;
                                    }
                                    self.inputWrapper.pathListener.notifyPathListeners();
                                }
                            }
                        )
                    },
                    setValue:function(val)
                    {
                        //if(this.definition.LABEL=='id_state' && val==233)
                        //    debugger;

                        this.dsParams[this.sivParams.VALUE]=val;
                        this.BaseInput$setValue(val);
                        this.inputWrapper.pathListener.notifyPathListeners();

                    },
                    refresh:function()
                    {

                        if(this.adapter)
                        {
                            if( !this.adapterSet){
                                this.adapterSet=true;
                                this.combo.jqxComboBox({source:this.adapter})
                            }
                            else
                                this.adapter.onParamsChanged();
                        }
                    },
                    setDisabled:function(disabled)
                    {},
                    createBaseNode:function()
                    {
                        return $('<div></div>');
                    },
                    startup:function()
                    {
                        this.getAdapter(this.tempValue);
                        var params=this.sivParams;
                        var self=this;

                        var valueField=params.VALUE;

                        this.node.on("select",function(e){
                                    self.inputWrapper.pathListener.notifyPathListeners();
                        });
                        this.adapter.onParamsChanged();

                    }

                }
            },
            Relationship:{
                inherits:'ComboBox'
                //inherits:'FixedSelect'
            },
            Date:
            {
                inherits:'BaseInput',
                methods:
                {
                    createInput:function(value)
                    {
                        //
                        this.node.jqxDateTimeInput({});
                        if(value)
                            this.node.val(value);
                    },
                    getValue: function () {
                        val = this.node.jqxDateTimeInput('value');
                        if (val != null)
                        {
                            var v=val.getMonth()+1;
                            if(v<10)
                                v='0'+v;
                            return val.getFullYear() + "-" + v + "-" + val.getDate() + " " + val.getHours() + ":" + val.getMinutes() + ":" + val.getSeconds();
                        }
                        return null;
                    },
                    setValue:function(val)
                    {
                        this.node.jqxDateTimeInput({'value':val});
                    }
                }
            },
            DateTime:
            {
                inherits:'BaseInput',
                methods:
                {
                    createInput:function(value)
                    {
                        this.node.jqxDateTimeInput({ formatString: 'F' });
                        if(value)
                            this.node.val(value);
                    },
                    getValue: function () {
                        val = this.node.jqxDateTimeInput('value');
                        if (val != null)
                        {
                            var v=val.getMonth()+1;
                            if(v<10)
                                v='0'+v;
                            return val.getFullYear() + "-" + v + "-" + val.getDate() + " " + val.getHours() + ":" + val.getMinutes() + ":" + val.getSeconds();
                        }
                        return null;
                    },
                    setValue:function(val)
                    {
                        this.node.jqxDateTimeInput({'value':val});
                    },
                    createBaseNode:function()
                    {
                        return $('<div></div>');
                    }
                }
            },
            Hidden:{
                inherits:'BaseInput',
                methods:
                {
                    createInput:function(value)
                    {
                        this.node.html('<input type="hidden"></input>');
                        if(value)
                            this.setValue(value);

                    },
                    setValue:function(value)
                    {
                        $("input",this.node).val(value)
                    },
                    getValue:function(value)
                    {
                        return $("input",this.node).val();
                    },
                    on:function(event,callback)
                    {
                        $("input",this.node).bind(event,callback);
                    }

                }
            },
            Money:{
                inherits:'Decimal'
            },
            Password:{
                inherits:'String'
            },
            State:{
                inherits:'Enum'
            },
            Name:{
              inherits:'String'
            },
            Street:{
                inherits:'String'
            },
            City:{
              inherits:'String'
            },
            Phone:{
                inherits:'String'
            },
            UUID:{
                inherits:'String'
            }/*,
            Submit
            */
        }
    }
);
