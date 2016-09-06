Siviglia.Utils.buildClass({
    context:'Siviglia.AutoUI.Painter',
    classes:{
        Factory:{
            inherits:"Siviglia.UI.Widget,Siviglia.Dom.EventManager",
            methods:{
                preInitialize:function(params){
                    this.parentObject=params.parentObject;
                    this.parentNode=params.parentNode;
                    this.value=params.value;
                },
                initialize:function(params){
                    this.container=$(".factoryContainer",this.rootNode);
                    var rootWidget=this.factory(params.parentNode,{});
                    this.container.append(rootWidget.node);
                },
                factory:function(nodeObj,args)
                {
                    args = args || {};
                    args.uinode = nodeObj;
                    args.controller=this;
                    node = args;
                    if (nodeObj.definition.PAINTER) {
                        return new c[nodeObj.definition.PAINTER](args);
                    }
                    var c=Siviglia.AutoUI.Painter;
                    var type=nodeObj.getClassName();

                    var equivs={
                        "IntegerType":"StringPainter",
                        "StringType":"StringPainter",
                        "BooleanType":"BooleanPainter",
                        "ContainerType":"ContainerPainter",
                        "DictionaryType":"DictionaryPainter",
                        "ArrayType":"ArrayPainter",
                        "KeyReferenceType":"KeyReferencePainter",
                        "SelectorType":"SelectorPainter",
                        "TypeSwitcher":"TypeSwitcherPainter",
                        "ObjectArrayType":"ObjectArrayPainter",
                        "SivObjectSelector":"SelectorPainter",
                        "SubdefinitionType":"SubdefinitionPainter"
                    };
                    if(!equivs[type])
                    {
                        throw "NO ENCONTRADO WIDGET PARA "+type;
                    }
                    var dv=$('<div></div>');
                    var w=new Siviglia.AutoUI.Painter[equivs[type]]('AUTOPAINTER_'+type,
                        args,
                        {},
                        dv,
                        Siviglia.model.Root
                    );
                    return w;
                },
                // Funcion a sobreescribir para crear nuevos layouts.
                getLayout:function(params)
                {
                    var cName = params.uinode.getClassName();
                    var defaultLayouts={
                        "StringType": "SymmetricalLayout",
                        "ContainerType": "SymmetricalLayout",
                        "ArrayType": "SymmetricalLayout",
                        "SelectorType": "SymmetricalLayout",
                        "DictionaryType": "LateralMenuLayout",
                        "TypeSwitcher": "SymmetricalLayout",
                        "ObjectArrayType": "LateralMenuLayout",
                        "SubdefinitionType":"WindowLayout"
                    };
                    //var layout=defaultLayouts[cName];
                    //var obj=Siviglia.Utils.stringToContextAndObject(layout);
                    //return new obj.context[obj.object](params)
                    return defaultLayouts[cName];
                }
            }
        },
        BasePainter:
        {
            inherits:"Siviglia.UI.Widget,Siviglia.Dom.EventManager",
            methods:{
                preInitialize:function(params)
                {
                    this.uinode=params.uinode;
                    this.controller=params.controller;
                    this.title=this.uinode.definition.LABEL || '';
                    this.description=this.uinode.definition.DESCRIPTION || '';
                    var m=this;
                    this.uinode.addListener("change",this,"reload");
                },
                reload:function(event)
                {
                    this.notifyPathListeners();
                }

            }
        },
        SelectorPainter:
        {
            inherits:'BasePainter',
            methods:
            {
                preInitialize:function(params)
                {
                    this.BasePainter$preInitialize(params);
                    var h= $.Deferred();
                    var m=this;
                    params.uinode.loadSource().then(function(v){
                        m.options=v;
                        h.resolve();
                    })
                    return h;
                },
                initialize:function(params)
                {

                },
                reload:function(event)
                {
                    if(this.syntheticChange)
                        return;
                    this.BasePainter$reload(event);
                    var status='';

                    if(this.params.uinode.isUnset())
                    {
                        status='selected';
                    }
                    else
                    {
                        this.combo.val(this.getValue());
                    }
                    var defaultOpt=$('<option value="" '+status+'>--Elegir</option>');
                    this.combo.prepend(defautlOpt);
                },
                onChange: function () {
                    this.syntheticChange=true;
                    this.params.uinode.setValue(this.getValue());
                    this.syntheticChange=false;
                },

                getValue: function () {
                    return this.combo.val();
                }
            }
        },

        DictionaryPainter:
        {
            inherits:'BasePainter',
            methods:
            {
                preInitialize:function(params)
                {
                    this.BasePainter$preInitialize(params);
                    this.keys=this.uinode.getKeys();
                    this.currentWidget=null;
                    this.currentKey=null;
                },
                initialize:function(params)
                {
                    this.widgetContainer=$('.currentWidget',this.rootNode);
                    params.parent=this;
                    this.newItemWidget=new Siviglia.AutoUI.Painter.NewItemPainter('AUTOPAINTER_NewItem',
                        params,
                        {},
                        this.newItemNode,
                        Siviglia.model.Root
                    );
                    if(!this.uinode.definition.SAVE_URL)
                        this.saveNode.css({"display":"none"})

                },
                doSave:function()
                {
                    if(this.uinode.definition.SAVE_URL)
                    {
                        this.uinode.saveToUrl();
                    }
                },
                onLabelClicked:function(node, params)
                {
                    if(this.currentWidget)
                        this.currentWidget.destruct();
                    this.currentKey=params.key;
                    this.currentWidget=this.controller.factory(this.uinode.children[params.key], {});
                    this.widgetContainer.append(this.currentWidget.rootNode);
                },
                getLabel:function(node,params,event)
                {
                    var curKey=params.key;
                    node.html(this.uinode.definition.FIELDS[curKey].LABEL || curKey);
                },
                onRemoveClicked:function(node,params,event)
                {
                    this.uinode.removeItem(params.key);
                    if(params.key==this.currentKey)
                    {
                        this.currentWidget.destruct();
                    }
                },
                add:function(node)
                {
                    var val=this.newElementInput.val();
                    this.uinode.addItem(val);
                },
                reload:function(event)
                {
                    this.keys=this.uinode.getKeys();
                    this.BasePainter$reload(event);
                }

            }
        },
        ContainerPainter:
        {
            inherits:'DictionaryPainter',
            methods:
            {
                initialize:function(params)
                {
                    this.DictionaryPainter$initialize(params);
                    if(!this.uinode.definition.SAVE_URL)
                    {
                        this.saveNode.css({"display":"none"})
                    }
                },
                getSubInput:function(node,params)
                {
                    var value=this.uinode.children[params.key];
                    var currentWidget=this.controller.factory(value, {});
                    node.append(currentWidget.rootNode);
                },
                doSave:function()
                {
                    if(this.uinode.definition.SAVE_URL)
                    {
                        this.uinode.saveToUrl();
                    }
                }
            }
        },
        StringPainter:
        {
            inherits:'BasePainter',
            methods:
            {
                preInitialize:function(params)
                {
                    this.BasePainter$preInitialize(params);
                    this.value=params.uinode.getValue();
                },
                onChange:function(node,params)
                {
                    this.uinode.setValue(node.val());
                }
            }
        },
        BooleanPainter:
        {
            inherits:'BasePainter',
            methods:
            {
                preInitialize:function(params)
                {
                    this.BasePainter$preInitialize(params);
                    this.checked=(params.uinode.getValue()===true)?"checked":"";
                },
                onChange:function(node,params)
                {

                    this.uinode.setValue(node.is(":checked"));

                }
            }

        },
        ArrayPainter:
        {
            inherits:'BasePainter',
            methods:
            {
                preInitialize:function(params)
                {
                    this.BasePainter$preInitialize(params);
                    this.values=params.uinode.getValue()
                },
                initialize:function(params)
                {
                    this.newItemWidget=new Siviglia.AutoUI.Painter.NewItemPainter('AUTOPAINTER_NewItem',
                        params,
                        {},
                        this.newItemNode,
                        Siviglia.model.Root
                    );
                },
                add:function(node)
                {
                    var val=this.newElementInput.val();
                    this.uinode.addItem(val);
                },
                onRemoveClicked:function(node,params)
                {
                    this.uinode.remove(params.key);
                }
            }
        },
        SubdefinitionPainter:
        {
            inherits:'BasePainter',
            methods:
            {
                preInitialize:function(params)
                {
                    // No podemos pintarnos hasta que se cargue la definicion.
                    return params.uinode.getEntityPromise();
                },
                initialize:function(params)
                {
                    // Se crea un sub-parser, a partir del nodo recibido
                    var v=$("<div></div>");
                    var s=new Siviglia.AutoUI.Painter.Factory('AUTOUI_FACTORY',
                        {parentObject:null,parentNode:params.uinode.subController.rootNode},
                        {},
                        v,
                        Siviglia.model.Root);
                    this.subcontainer.append(v);
                }
            }
        },
        NewItemPainter:
        {
            inherits:'BasePainter',
            methods:
            {
                preInitialize:function(params)
                {
                    this.params=params;
                    this.BasePainter$preInitialize(params);
                },
                initialize:function()
                {
                    this.uinode.addListener("change",this,"paintInput");
                    this.paintInput();
                },
                paintInput:function()
                {
                    if (this.uinode.hasSourceInput()) {
                        this.mode=0;
                        this.newItemString.css({display:'none'});
                        this.newItemSelector.css({display:'block'});
                        var m=this;
                        $.when(this.uinode.getSourceValues()).then(function(vals){
                            m.newItemSelector.html("");
                            var defaultOpt=$('<option value="" selected>--Elegir</option>');
                            m.newItemSelector.append(defaultOpt);
                            for(var k=0;k<vals.length;k++)
                            {
                                m.newItemSelector.append(
                                    $('<option value="'+vals[k].value+'">'+vals[k].name+'</option>')
                                );
                            }
                            m.syntheticChange=false;
                        })
                    }
                    else {
                        this.mode=1;
                        this.newItemString.css({display:'block'});
                        this.newItemSelector.css({display:'none'});
                    }
                },
                paintValue: function () {

                },
                onAdd: function () {
                    var val;
                    if(this.mode==1)
                        val=this.newItemString.val();
                    else
                        val=this.newItemSelector.val();
                    if (val == "") return;
                    this.params.uinode.addItem(val);
                    this.paintInput();
                }
            }
        }
    }
});

