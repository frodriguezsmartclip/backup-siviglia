Siviglia.Utils.buildClass({
    context:'Siviglia.AutoUI.Painter',
    classes:{
        Factory:{
            inherits:"Siviglia.UI.Widget,Siviglia.Dom.EventManager",
            methods:{
                preInitialize:function(params){
                    this.parentObject=params.parentObject;
                    this.parentNode=params.parentNode;
                    this.controller=params.controller;
                    this.value=params.value;
                },
                initialize:function(params){
                    this.container=$(".factoryContainer",this.rootNode);
                    var rootWidget=this.factory(params.parentNode,null,{});
                    this.container.append(rootWidget.view.rootNode);
                },
                factory:function(nodeObj,parentNode,args)
                {
                    args = args || {};
                    args.uinode = nodeObj;
                    args.parentNode = parentNode;
                    args.controller= this.controller;
                    args.painterFactory=this;
                    node = args;
                    var dv=$('<div></div>');

                    if (nodeObj.definition.PAINTER) {
                        return new
                        Siviglia.AutoUI.Painter[nodeObj.definition.PAINTER](
                            'AUTOPAINTER_'+nodeObj.definition.PAINTER,
                            args,{},dv,Siviglia.model.Root
                        );
                    }

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
                        "TypeSwitcher":"TypeSwitchPainter",
                        "ObjectArrayType":"ObjectArrayPainter",
                        "SivObjectSelector":"SelectorPainter",
                        "SubdefinitionType":"SubdefinitionPainter",
                        "FixedDictionaryType":"FixedDictionaryPainter"
                    };
                    if(!equivs[type])
                    {
                        // Si no se encuentra un tipo de painter asociado, se mira si existe una clase del proyecto,
                        // que nos diga que painter usar.
                        // Es decir, que un tipo de dato "custom" debe proveer de una clase en el namespace Siviglia.AutoUI,
                        // que gestiona el tipo, y que tiene una variable PAINTER "estatica" (prototipo)
                        if(Siviglia.isset(Siviglia.AutoUI[type]))
                            equivs[type]=Siviglia.AutoUI[type].PAINTER;

                        throw "NO ENCONTRADO WIDGET PARA "+type;
                    }
                    if(!Siviglia.AutoUI.Painter[equivs[type]])
                    {
                        throw "NO ENCONTRADO PAINTER PARA "+type+" : ("+equivs[type]+")";
                    }


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
                    this.parentNode=params.parentNode;
                    this.controller=params.controller;
                    this.painterFactory=params.painterFactory;
                    this.title=this.uinode.definition.LABEL || '';
                    this.description=this.uinode.definition.DESCRIPTION || '';
                    this.helpText=Siviglia.issetOr(this.uinode.definition.HELP || '');
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

                    this.inputF=new Siviglia.Forms.JQuery.Inputs.Enum(null,this.inputNode);
                    var v=params.uinode.definition;

                    this.inputF.sivInitialize(v,params.uinode.getValue(),{});
                    var m=this;
                    this.inputF.on("change",function(node){
                        if(m.syntheticChange)
                            return;
                        m.syntheticChange=true;
                        m.uinode.setValue(m.inputF.getValue());
                        m.syntheticChange=false;

                    })
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

                    this.currentWidget=null;
                    this.currentKey=null;
                    // Miramos si el tipo que vamos a generar, es simple o no.
                    var childType=params.uinode.getValueInstance(null,null);
                    this.hasSimpleType=childType.isSimpleType();
                },
                initialize:function(params)
                {
                    if(!this.uinode.definition.SAVE_URL)
                        this.saveNode.css({"display":"none"})
                },
                buildNewItemWidget:function(node,params)
                {
                    if(this.newItemWidget) {
                        this.newItemWidget.destruct();
                    }
                    node.html("");

                    var pp=this.params;
                    pp.parent=this;
                    var tempNode=$("<div></div>");
                    this.newItemWidget=new Siviglia.AutoUI.Painter.NewItemPainter('AUTOPAINTER_NewItem',
                        pp,
                        {},
                        tempNode,
                        Siviglia.model.Root
                    );
                    node.append(tempNode);
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
                    console.log("*****LABEL CLICKED*****");
                    this.currentKey=params.key;
                    this.notifyPathListeners();

                },
                getInputFor:function(node,params)
                {
                    if(this.currentWidget!=null) {
                        this.currentWidget.destruct();
                        this.currentWidget = null;
                        node.html("");
                    }
                    if(params.key==null)
                        return;
                    var newNode=this.__getInputFor(params.key);
                    node.append(newNode);
                },
                __getInputFor:function(key)
                {
                    var newWidget=this.painterFactory.factory(this.uinode.children[key], this.uinode.parent,{});
                    //this.currentWidget=newWidget;
                    //this.currentKey=key;
                    return newWidget.rootNode;
                },
                getLabel:function(node,params,event)
                {
                    var curKey=params.key;
                    node.html(this.uinode.definition.FIELDS[curKey].LABEL || curKey);
                },
                onRemoveClicked:function(node,params,event)
                {
                    if(params.key==this.currentKey && this.currentWidget!=null)
                    {
                        this.currentWidget.destruct();
                    }
                    this.currentKey=null;
                    this.currentWidget=null;
                    this.uinode.removeItem(params.key);
                },
                addItem:function(val)
                {
                    this.uinode.addItem(val);
                    this.onLabelClicked(null,{key:val});
                },
                reload:function(event)
                {

                    this.BasePainter$reload(event);
                }

            }
        },
        FixedDictionaryPainter:
            {
              inherits:'DictionaryPainter',
                methods:
                    {
                        preInitialize:function(params)
                        {
                            this.BasePainter$preInitialize(params);
                            this.currentWidget=null;
                            this.currentKey=null;
                        },

                        buildNewItemWidget:function(node,params)
                        {
                            if(this.newItemSelector)
                            {
                                this.newItemSelector.node.remove();
                                this.newItemSelector=null;
                            }
                            var uinode=this.params.uinode;
                            var possibleKeys=this.params.uinode.getPossibleKeys();
                            // Se hace una copia de las keys posibles.
                            var target={};
                            for(var k in possibleKeys)
                            {
                                target[k]=possibleKeys[k];
                            }
                            // Si el nodo tiene un valor, eliminamos las keys ya existentes, para que solo se puedan
                            // crear keys aun no usadas.
                            if(!uinode.isUnset())
                            {
                                var v=uinode.getValue();
                                for(var k in v)
                                    delete target[k];
                            }
                            var opts=[];
                            for(var j in target)
                            {
                                opts.push(target[j].LABEL);
                            }
                            if(opts.length>0) {

                                this.newItemSelector = new Siviglia.Forms.JQuery.Inputs.Enum(null, this.newItemNode);
                                this.newItemSelector.sivInitialize({TYPE: 'Enum', VALUES: opts}, null, {});

                                var m = this;
                                this.newItemSelector.on("change", function (ev) {
                                    if (m.syntheticChange)
                                        return;
                                    m.syntheticChange = true;
                                    var curLabel = m.newItemSelector.getValue();
                                    var tt = m.uinode.getPossibleKeys();
                                    for (var k in tt) {
                                        if (tt[k].LABEL == curLabel) {
                                            m.onChangeType(k);
                                            m.syntheticChange = false;
                                            m.buildNewItemWidget(node,{});
                                        }
                                    }
                                });
                                node.append(this.newItemSelector.node);
                            }

                        },
                        onChangeType:function(val)
                        {
                            var uinode=this.params.uinode;
                            var possibleKeys=this.params.uinode.getPossibleKeys();
                            var type=possibleKeys[val]["TYPE"];
                            this.uinode.addItem(val);
                            this.onLabelClicked(null,{key:val});

                        },
                        onRemoveClicked:function(node,params,event)
                        {
                            this.DictionaryPainter$onRemoveClicked(node,params,event);
                            this.buildNewItemWidget(this.newItemNode);
                        },
                        getInputFor:function(node,params)
                        {
                            if(this.currentWidget!=null) {
                                this.currentWidget.destruct();
                                this.currentWidget = null;
                                node.html("");
                            }
                            if(params.key==null)
                                return;
                            var newNode=this.__getInputFor(params.key);
                            node.append(newNode);
                        },
                        __getInputFor:function(key)
                        {
                            var newWidget=this.painterFactory.factory(this.uinode.children[key], this.uinode.parent,{});
                            this.currentWidget=newWidget;
                            this.currentKey=key;
                            return newWidget.rootNode;
                        },
                    }
            },
        ContainerPainter:
        {
            inherits:'DictionaryPainter',
            methods:
            {
                preInitialize:function(params)
                {
                    this.BasePainter$preInitialize(params);

                    this.currentWidget=null;
                    this.currentKey=null;
                },
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
                    console.log("************GETTING SUBINPUT*****");
                    var value=this.uinode.children[params.key];
                    var currentWidget=this.painterFactory.factory(value,this.uinode.parent, {});
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
                initialize:function(params)
                {
                    this.inputF=new Siviglia.Forms.JQuery.Inputs.String(null,this.inputNode);
                    this.inputF.sivInitialize(params.uinode.definition,params.uinode.getValue(),{});
                    var m=this;
                    this.inputF.on("change",function(node){
                        m.uinode.setValue(m.inputF.getValue());
                    })
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
                initialize:function(params)
                {

                    this.inputF=new Siviglia.Forms.JQuery.Inputs.Boolean(null,this.inputNode);
                    this.inputF.sivInitialize(params.uinode.definition,params.uinode.getValue(),{});
                    var m=this;
                    this.inputF.on("change",function(node){
                        m.uinode.setValue(m.inputF.getValue()=="1"?true:false);
                    })

                }
            }

        },
        ObjectArrayPainter: {
            inherits:'BasePainter',
            methods: {
                preInitialize:function(params)
                {
                    this.BasePainter$preInitialize(params);
                    this.currentWidget=null;
                    this.currentKey=null;
                    this.uinode=params.uinode;
                    this.keyDirection="HORIZONTAL";
                },
                initialize:function(params)
                {

                    this.nElems=this.uinode.children.length;
                    this.widgetContainer=$('.currentWidget',this.rootNode);
                    params.parent=this;
                    //if(!this.uinode.definition.SAVE_URL)
                    //    this.saveNode.css({"display":"none"})
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
                        this.currentKey=params.index;
                        this.currentWidget=this.painterFactory.factory(this.uinode.children[params.index], this.uinode.parent,{});
                        this.widgetContainer.append(this.currentWidget.rootNode);
                },
                getLabel:function(node,params,event)
                {
                    if(typeof this.uinode.definition.VALUELABEL!="undefined")
                        node.html(this.uinode.getValue()[params.index][this.uinode.definition.VALUELABEL]);
                    else
                        node.html(params.index);
                },
                onRemoveClicked:function(node,params,event)
                {
                        this.uinode.removeItem(params.index);
                        if(params.index==this.currentKey)
                        {
                            this.currentWidget.destruct();
                        }
                },
                addItem:function(node)
                {
                    var val=this.uinode.addItem(null);
                    this.onLabelClicked(null,{index:this.uinode.children.length-1});
                },
                reload:function(event)
                {
                    this.nElems=this.uinode.children.length;
                    this.BasePainter$reload(event);
                }

            }
        },
        FixedPainter: {
            inherits:'BasePainter',
            methods:
                {
                    preInitialize:function(params)
                    {
                        var tt=params;
                        this.uinode=params.uinode;
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
                    this.BasePainter$preInitialize(params);
                    return params.uinode.getEntityPromise();
                },
                initialize:function(params)
                {
                    // Se crea un sub-parser, a partir del nodo recibido
                    var v=$("<div></div>");
                    var s=new Siviglia.AutoUI.Painter.Factory('AUTOUI_FACTORY',
                        {parentObject:null,parentNode:params.uinode.subController.rootNode,controller:this.controller,painterFactory:this.painterFactory},
                        {},
                        v,
                        Siviglia.model.Root);
                    this.subcontainer.append(v);
                }
            }
        },
        TypeSwitchPainter:
            {
                inherits:'BasePainter',
                methods:
                    {
                        preInitialize:function(params)
                        {
                            this.BasePainter$preInitialize(params);
                            this.value=params.uinode.getValue()
                            this.typeNode = null;
                            this.typeSelector=null;
                        },
                        initialize:function(params)
                        {
                            this.params=params;
                            this.paintValue();
                        },
                        paintValue: function () {
                            if (this.typeNode) {
                                this.typeNodeWidget.destroy();
                                this.typeNode.destruct();
                            }
                            this.createTypeSelector();


                            var val;
                            if (this.params.uinode.isUnset())
                                val = null;
                            else
                                val = this.params.uinode.getCurrentType();

                            if(val!=null) {
                                this.typeNode = Siviglia.AutoUI.NodeFactory(this.params.uinode.getSubNode().definition, null, val, this.uinode.controller);
                            }
                            else
                                this.typeNode=null;

                            this.repaintType();

                        },
                        repaintType:function()
                        {
                            if(this.subNodeWidget)
                                this.subNodeWidget.destruct();
                            this.fieldContainer.innerHTML='';
                            if (!this.params.uinode.isUnset()) {
                                var sNode = this.params.uinode.getSubNode();
                                this.subNodeWidget = this.painterFactory.factory(sNode, this.params.uinode.parent,{});
                                this.fieldContainer.append(this.subNodeWidget.rootNode);
                            }
                        },
                        createTypeSelector:function()
                        {
                            if(this.typeSelector!=null)
                                return;
                            //var vals = this.params.uinode.definition.ALLOWED_TYPES;
                            var vals=this.params.uinode.getAllowedTypes();
                            var val;
                            if (this.params.uinode.isUnset())
                                val = null;
                            else
                                val = this.params.uinode.getCurrentType();

                            this.inputF=new Siviglia.Forms.JQuery.Inputs.Enum(null,this.typeSwitchSelector);
                            this.inputF.sivInitialize({TYPE:'Enum',VALUES:vals},val,{});

                            var m=this;
                            this.inputF.on("change",function(node){
                                if(m.syntheticChange)
                                    return;
                                m.syntheticChange=true;
                                m.onChangeType(m.inputF.getValue());
                                m.syntheticChange=false;

                            })
                        },
                        onChangeType: function (v) {


                            if (!v) {
                                alert("Please choose a type");
                                return;
                            }
                            if (this.params.uinode.getCurrentType() == v) {
                                return;
                            }
                            this.params.uinode.setType(v);
                            this.repaintType();
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

