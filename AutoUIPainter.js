Siviglia.Utils.buildClass(
{
    context:"Siviglia.AutoUI.Painter",
    classes:
    {
        PainterFactory:
        {
            methods:
            {
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

                    switch (nodeObj.getClassName()) {
                        case "IntegerType":
                        case "StringType":
                        {

                            if (nodeObj.hasSourceInput()) {
                                var w = c.SelectorPainter(args);
                                w.setOptions(nodeObj.getSourceValues());
                                return w;
                            }
                            return new c.StringPainter(args);

                        }
                            break;
                        case "BooleanType":
                        {
                            return new c.BooleanPainter(args);
                        }
                            break;
                        case "ContainerType":
                        {
                            return new c.ContainerPainter(args);
                        }
                            break;
                        case "DictionaryType":
                        {
                            return new c.DictionaryPainter(args);
                        }
                            break;
                        case "ArrayType":
                        {
                            return new c.ArrayPainter(args);
                        }
                            break;
                        case "KeyReferenceType":
                        {
                            return new c.KeyReferencePainter(args);
                        }
                            break;
                        case "SelectorType":
                        {
                            return new c.SelectorPainter(args);
                        }
                            break;
                        case "TypeSwitcher":
                        {
                            return new c.TypeSwitcherPainter(args);
                        }
                            break;
                        case "ObjectArrayType":
                        {
                            return new c.ObjectArrayPainter(args);
                        }
                            break;
                        case "SivObjectSelector":
                        {
                            return new c.SelectorPainter(args);
                        }
                            break;
                        default:
                        {
                            console.debug("UNKNOWN DEFINITION");
                            console.dir(node.__definition);
                        }
                    }
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
                        "ObjectArrayType": "LateralMenuLayout"
                    };
                    //var layout=defaultLayouts[cName];
                    //var obj=Siviglia.Utils.stringToContextAndObject(layout);
                    //return new obj.context[obj.object](params)
                    return defaultLayouts[cName];
                }
                
            }
        }

    }
}
    );
Siviglia.Utils.buildClass(
{
    context:'Siviglia.AutoUI.Painter.Layout',
    classes:
    {
         BaseLayout:
         {
             construct:function(params)
             {
                 this.params=params;
                 this.uinode=this.params.uinode;
                 this.htmlNode=this.params.htmlNode;
                 this.controller=this.params.controller;
                 this.buildRendering();
             },
             methods:
             {
                 getTemplateString:function()
                 {
                     return '<span class="input '+this.uiNode.getClassName()+'"><span class="inputNode"></span></span>';
                 },
                 buildRendering:function()
                 {
                     this.rootNode=$(this.getTemplateString());
                     this.postCreate();
                 }
             }
         },
         SymmetricalLayout:
         {
             inherits:'BaseLayout',
             methods:
             {

                 getTemplateString:function()
                 {
                    return '<div class="SymmetricalLayout '+this.params.painter.uinode.getClassName()+'">\
                        <div class="title"></div>\
                        <div class="description SymmetricalLayoutDescription"></div>\
                        <table style="font-size:10px;border:1px solid #AAA" class="SymmetricalLayoutTable">\
                            <tbody class="fieldTable"></tbody>\
                        </table>\
                        <div style="text-align:right" class="saveBar"><input type="button" class="saveButton">Save</input></div>\
                        </div>';
                 },
                 postCreate: function () {
                     this.keyWidgets = {};
                     this.inputWidgets = {};
                     this.newItemW = null;                     
                     $(".title",this.rootNode).html(this.params.painter.getMainLabel());                     
                     $(".description",this.rootNode).html(this.params.painter.params.uinode.definition.DESCRIPTION);
                     this.reset();                     
                 },
                 reset: function () {
                     this.resetWidgets();                     
                     var keys = this.params.painter.getKeys();
                     var curKey;
                     var curTr;
                     var curTd;
                     for (var k = 0; k < keys.length; k++) {
                         curKey = keys[k];
                         curTr = document.createElement("tr");
                         if (!this.params.painter.params.uinode.definition.DONT_DRAW_KEYS) {

                             curTd = document.createElement("td");
                             curTd.className = "SymmentricalLayoutLabel";
                             this.keyWidgets[curKey] = this.params.painter.getKeyWidget(curKey);

                             $(curTd).append(this.keyWidgets[curKey].rootNode);
                             curTr.appendChild(curTd);
                         }
                         curTd = document.createElement("td");
                         curTd.className = "SymmentricalLayoutInput";
                         this.inputWidgets[curKey] = this.params.painter.getValueWidget(curKey);
                         $(curTd).append(this.inputWidgets[curKey].rootNode);

                         curTr.appendChild(curTd);

                         curTd = document.createElement("td");
                         curTd.className = "SymmentricalLayoutHelp";
                         if (this.inputWidgets[curKey].params.uinode.definition.HELP) {
                             curTd.innerHTML = this.inputWidgets[curKey].params.uinode.definition.HELP;
                         }
                         else
                             curTd.innerHTML = '&nbsp;'

                         curTr.appendChild(curTd);

                         $(".fieldTable",this.rootNode)[0].appendChild(curTr);

                     }
                     var curTd1, curTd2, curTd3;
                     var newItemW = this.params.painter.getNewValueWidget();

                     if (newItemW) {
                         curTr = document.createElement("tr");
                         curTd1 = document.createElement("td");
                         curTd1.className = "SymmetricalLayoutNewLabel";
                         curTd1.innerHTML = "Add:";
                         curTd2 = document.createElement("td");
                         curTd2.className = "SymmetricalLayoutNewInput";
                         newItemW.setContainer(this);
                         this.newItemW = newItemW;
                         $(curTd2).append(this.newItemW.rootNode);
                         curTr.appendChild(curTd1);
                         curTr.appendChild(curTd2);
                         $(".fieldTable",this.rootNode)[0].appendChild(curTr);
                     }
                     // If this node cant be saved, the save button is hidden:
                     if (!this.params.painter.params.uinode.hasSaveUrl()) {
                         $(".saveBar",this.rootNode)[0].style.display = 'none';
                     }

                 },
                 doSave: function () {
                     this.params.painter.params.uinode.saveToUrl();
                 },
                 selectLast: function () {
                     $(this.newItemW).focus();
                 },
                 resetWidgets: function () {
                     for (var k in this.inputWidgets) {
                         this.keyWidgets[k].destroy();
                         this.inputWidgets[k].destroy();
                     }
                     this.keyWidgets = {};
                     this.inputWidgets = {};

                     var tbody = $(".fieldTable",this.rootNode)[0];
                     while (tbody.children.length > 0) {
                         tbody.removeChild(tbody.children[0]);
                     }
                     if (this.newItemW) this.newItemW.destroy();
//                     $(this.rootNode).html("");
                 },
                 destroy: function () {
                     this.resetWidgets();                     
                 }
             }
         },
        LateralMenuLayout:
        {
            inherits:'BaseLayout',
            methods:{
                getTemplateString:function()
                {
                    return '<div class="LateralMenuLayout">\
                        <div class="title"></div>\
                        <div class="description"></div>\
                        <table style="font-size:10px;border:1px solid #AAA" width="100%"><tr>\
                            <td valign="top" style="background-color:#F0F0F0;border-right:2px solid #AAA;width:200px"> \
                                <div class="AutoUI_title2">Contents</div>\
                                <div class="theMenu"></div><br> \
                                <div class="newItemContainer">\
                                <b>New Element:</b><br>\
                                <div class="inputNode"></div> \
                                </div>\
                            </td><td valign="top">\
                                <div class="helpNode"></div>\
                                <div class="subInputNode"></div>\
                            </td></tr>\
                        </table>\
                        <div style="text-align:right" class="saveBar"><input type="button" class="saveButton">Save</input></div>\
                </div>'
                },

                postCreate: function () {

                    this.keyWidgets = {};
                    this.curSelection = null;
                    this.currentWidget = null;
                    this.formatterWidget = null;
                    this.newItemW = null;
                    this._title=$(".title",this.rootNode);
                    this._inputNode=$(".inputNode",this.rootNode);
                    this._title.html(this.params.painter.getMainLabel());
                    this._newItemContainer=$(".newItemContainer",this.rootNode);
                    this._saveBar=$(".saveBar",this.rootNode);
                    this._helpNode=$(".helpNode",this.rootNode);
                    this._subInputNode=$(".subInputNode",this.rootNode);
                    this.reset();
                },
                reset: function () {

                    if (this.params.painter.params.uinode.definition.DESCRIPTION) {
                        $(".description",this.rootNode).html(this.params.painter.params.uinode.definition.DESCRIPTION);
                    }
                    for (var k in this.keyWidgets)
                        this.keyWidgets[k].destroy();
                    if (this.newItemW) this.newItemW.destroy();
                    this.keyWidgets = {};


                    var theMenu=$(".theMenu",this.rootNode);
                    theMenu.html('');
                    this._inputNode.html('');
                    var keys = this.params.painter.getKeys();
                    var curKey;
                    var curDiv;
                    for (var k = 0; k < keys.length; k++) {
                        curKey = keys[k];
                        curDiv = document.createElement("div");
                        curDiv.className = "LateralMenuMenuEntry"
                        this.keyWidgets[keys[k]] = this.params.painter.getKeyWidget(keys[k]);
                        $(curDiv).append(this.keyWidgets[keys[k]].rootNode);
                        this.keyWidgets[keys[k]].setClickListener(this);
                        theMenu.append(curDiv);
                    }
                    var newItemW = this.params.painter.getNewValueWidget();

                    if (newItemW) {
                        newItemW.setContainer(this);
                        this.newItemW = newItemW;
                        this._inputNode.append(this.newItemW.rootNode);
                    }
                    else
                        this._newItemContainer.css({"display" :'none'});

                    if (keys.length > 0)
                        this.onLabelClicked(keys[0]);

                    // If this node cant be saved, the save button is hidden:
                    if (!this.params.painter.params.uinode.hasSaveUrl()) {
                        this._saveBar.css({"display":'none'});
                    }

                },
                doSave: function () {
                    this.params.painter.params.uinode.saveToUrl();
                },
                onLabelClicked: function (label) {
                    this._helpNode.html("");
                    if (this.curSelection && this.curSelection.domNode) {
                        this.currentWidget.destroy();
                        $(this.curSelection.domNode).removeClass('selectedReference');
                        this.currentWidget.destroyRecursive();
                    }
                    this._subInputNode.html('');
                    $(this.keyWidgets[label].domNode).addClass('selectedReference');
                    this.curSelection = this.keyWidgets[label];
                    this.currentWidget = this.params.painter.getValueWidget(label);
                    this._subInputNode.append(this.currentWidget.rootNode);
                    if (this.currentWidget.params.uinode.definition.HELP) {
                        this._helpNode.html(this.currentWidget.params.uinode.definition.HELP);
                    }

                },
                selectLast: function () {
                    var keys = this.params.painter.getKeys();
                    this.onLabelClicked(keys[keys.length - 1]);
                },
                destroy: function () {
                    this.params.uinode.removeListeners(this);
                    this.painter.removeListeners(this);
                    $(this.rootNode.html(""));

                }

            }
        }
    }
}
    );


Siviglia.Utils.buildClass(
    {
        context:'Siviglia.AutoUI.Painter',
        classes:
        {
            BasePainter:
            {
                construct:function(params)
                {
                    this.params=params;
                    this.uinode=this.params.uinode;
                    this.htmlNode=this.params.htmlNode;
                    this.controller=this.params.controller;
                    this.buildRendering();
                },
                methods:
                {
                    getTemplateString:function()
                    {
                        return '<span class="input '+this.uiNode.getClassName()+'"><span class="inputNode"></span></span>';
                    },
                    buildRendering:function()
                    {
                        this.rootNode=$(this.getTemplateString());
                        this.postCreate();
                    }
                }
            },
            ReferencePainter:
            {
                inherits:"BasePainter",
                methods:{
                    getTemplateString:function()
                    {
                        return '<div class="ReferencePaainter"> \
                <span  class="theBox"  style="padding:2px;font-weight:bold"></span> \
                <span style="font-size:10px;padding:1px;cursor:pointer;background-color:red;color:white" class="delButton" >x</span> \
                </div>';
                    },
                    postCreate: function () {
                        var m=this;
                        $(".theBox",this.rootNode).click(function(e){m.params.uinode.fireEvent("clicked");})
                        $(".delButton",this.rootNode).click(function(e){m.params.uinode.fireEvent("delete");});
                        $(".theBox",this.rootNode).html(this.params.uinode.getValue());
                    },
                    onChange: function () {
                        this.node.setValue(this.theBox.get('value'));
                    },
                    showDelete: function () {
                        $(".delButton",this.rootNode).css({"display":'block'});
                    },
                    hideDelete: function () {
                        $(".delButton",this.rootNode).css({"display":"none"});
                    }
                }
            },
            NewItemPainter:
            {
                inherits:"BasePainter",
                methods:
                {

                    getTemplateString:function(){

                       return '<div class="NewItemPainter"><div class="AddItemNode"></div>\
                                    <input type="button" class="AddItemButton">Add</div>\
                                 </div>';
                    },
                    postCreate: function () {
                        var m=this;
                        $(".AddItemButton",this.rootNode).click(function(){m.onAdd()});
                        this.paintValue();
                    },
                    paintValue: function () {

                        if (this.newItemWidget) {
                            this.newItemWidget.destroy();
                            $(".AddItemNode",this.rootNode).html('');
                        }

                        if (this.params.uinode.hasSourceInput()) {
                            this.newItemNode = this.params.controller.Siviglia.AutoUI.NodeFactory({"TYPE": "SELECTOR"}, null, null,this);
                            this.newItemWidget = this.params.controller.factory(this.newItemNode);
                            this.newItemWidget.setOptions(this.params.uinode.getSourceValues());
                        }
                        else {
                            this.newItemNode = Siviglia.AutoUI.NodeFactory({"TYPE": "STRING"}, this.uinode, null);
                            this.newItemWidget = this.params.controller.factory(this.newItemNode);

                        }
                        $(".AddItemNode",this.rootNode).append(this.newItemWidget.rootNode);

                    },
                    onAdd: function () {
                        var val = this.newItemWidget.getValue();
                        if (val == "") return;
                            this.params.uinode.addItem(val);
                        this.widgetContainer.selectLast();
                    },
                    setContainer: function (el) {
                        this.widgetContainer = el;
                    }

                }
            },
            "ArrayNewItemPainter":
            {
                inherits:'NewItemPainter',
                methods:
                {
                    postCreate: function () {
                        $(".AddItemNode",this.rootNode).css({"display":"none"});
                    },
                    onAdd: function () {
                        this.params.uinode.addItem(null);
                        this.widgetContainer.selectLast();
                    }

                }
            },
            "SingleItemPainter":
            {
                inherits:'BasePainter',
                methods:
                {
                    getTemplateString:function()
                    {
                        return '<span><span clas="inputContainer"><input type="text" class="inputNode" dojoAttachEvent="onchange:onChange"></span></span>';
                    },
                    postCreate: function () {
                        this.params.uinode.addListener("change", this, "repaint");
                        var m=this;
                        $(".inputNode",this.rootNode).change(function(){m.params.uinode.setValue($(".inputNode", m.rootNode).val(), m.nodeKey);})
                        this.repaint();
                    },
                    repaint: function () {
                        if (this.params.uinode.definition.READONLY) {
                            $(".inputContainer",this.rootNode).html(this.params.uinode.getValue());
                            return;
                        }
                        var value="";
                        if (!this.params.uinode.isUnset())
                            value=this.params.uinode.getValue();
                        $(".inputNode",this.rootNode).val(value);
                    },
                    getValue: function () {

                        if (this.params.uinode.definition.READONLY)
                            return this.params.uinode.getValue();
                        return $(".inputNode",this.rootNode).val();
                    }
                }

            },
            MultipleItemPainter:
            {
                inherits:"BasePainter",
                methods:
                {
                    getTemplateString:function(){return '<div></div>';},
                    postCreate: function () {
                        this.params.uinode.addListener("change", this, "repaint");
                        this.params.uinode.addListener("delete", this, "repaint");
                        this.layoutWidget = null;
                        this.newElementWidget = null;
                        this.saveWidget = null;
                            if (!this.params.extraDefinition)this.params.extraDefinition = {};
                        this.repaint();
                    },
                    repaint: function () {
                        // This could happen as the nodes load synchronously.So, while we are painting, it's possible that another "change" event happens.
                        if (this.painting) return;
                        this.painting = true;
                        var k;
                        if (this.layoutWidget)
                            this.layoutWidget.reset();
                        else {
                            var layoutClass = this.params.uinode.definition.LAYOUT;
                            if (layoutClass) {
                                console.debug("FOUND LAYOUT:" + layoutClass);
                            }

                            if (!layoutClass) {
                                layoutClass = this.controller.getLayout(this.params);
                            }
                            this.layoutWidget = new Siviglia.AutoUI.Painter.Layout[layoutClass]({painter: this, formatter: layoutClass});
                            $(this.rootNode).append(this.layoutWidget.rootNode);

                        }
                        this.painting = false;
                    },

                    getKeys: function () {
                        return this.params.uinode.getKeys();
                    },

                    getKeyWidget: function (key) {
                        var keyW = this.params.uinode.definition.KEYWIDGET || this.params.extraDefinition.KEYWIDGET;
                        if (!keyW)
                            keyW = "SimpleLabel";

                        var keyList = this.params.uinode.getKeys();
                        var keyWidget = new Siviglia.AutoUI.Painter[keyW]({label: this.getKeyLabel(key), index: key});

                        if (!(this.params.extraDefinition && this.params.extraDefinition.ERASABLE_KEYS))
                            return keyWidget;

                        var eraseW = this.params.uinode.definition.ERASEWIDGET || this.params.extraDefinition.ERASEWIDGET;
                        if (!eraseW)
                            eraseW = "Erasable";

                        var erasableWidget = new Siviglia.AutoUI.Painter[eraseW]({widget: keyWidget, uinode: this.params.uinode,controller:this.controller, index: key});
                        return erasableWidget;
                    },
                    getKeyLabel: function (key) {
                        var subItem = this.params.uinode.getKey(key);
                        return subItem.definition.LABEL;
                    },
                    getValueWidget: function (key) {
                        var value = this.params.uinode.getKey(key);
                        return this.controller.factory(value, this.getValueWidgetParams());
                    },
                    keysAreReferences: function () {
                        return false;
                    },
                    valuesAreReferences: function () {
                        return false;
                    },
                    getValueWidgetParams: function () {
                        return {};

                    },
                    getNewValueWidget: function () {
                        return new Siviglia.AutoUI.Painter.NewItemPainter({uinode: this.params.uinode,controller:this.controller});
                    },
                    canSave: function () {
                        return this.params.uinode.definition.SAVE_URL;
                    },
                    doSave: function () {
                        var val = this.params.uinode.save();
                        console.dir(val);
                    },
                    getMainLabel: function () {
                        return this.params.uinode.definition.LABEL;
                    },
                    destroy: function () {
                        this.params.uinode.removeListeners(this);
                    }

                }
            },
            SimpleLabel:
            {
                inherits:'BasePainter',
                methods:
                {
                    getTemplateString:function(){return '<span class="label" ></span>'},
                    postCreate: function () {
                        $(this.rootNode).html(this.params.label);
                        var m=this;
                        $(this.rootNode).click(function(){if (m.clickListener) m.clickListener.onLabelClicked(m.params.index);});
                        this.clickListener = null;
                    },
                    setClickListener: function (wid) {
                        this.clickListener = wid;
                    }
                }
            },
            StringPainter:
            {
                inherits:'SingleItemPainter'
            },
            Erasable:
            {
                inherits:'StringPainter',
                methods:
                {
                    getTemplateString:function(){
                        return '<span> \
                        <span class="widgetPlace"></span>\
                        <span style="font-size:10px;padding:1px;cursor:pointer;background-color:red;color:white" class="delButton">x</span></span>';},
                    postCreate: function () {
                        this.params.widget.startup();
                        var m=this;
                        $(".delButton",this.rootNode).click(function(){m.params.uinode.removeItem(m.params.index);})
                        $(".widgetPlace",this.rootNode).append(this.params.widget);
                        $(this.widgetPlace).append(this.params.widget.rootNode);
                    }
                }
            },
            ContainerPainter:
            {
                inherits:'MultipleItemPainter',
                methods:
                {
                    getNewValueWidget: function () {
                        return null;
                    }

                }
            },
            ArrayPainter:
            {
                inherits:'MultipleItemPainter',
                methods:
                {
                    postCreate: function () {
                        this.params.extraDefinition = {ERASABLE_KEYS: true, ERASEWIDGET: "Erasable"};
                    },
                    getNewValueWidget: function () {
                        if (this.params.uinode.hasSourceInput)
                            return new Siviglia.AutoUI.Painter.NewItemPainter({uinode: this.params.uinode,controller:this.controller});

                        return new Siviglia.AutoUI.Painter.ArrayNewItemPainter({uinode: this.params.uinode,controller:this.controller});
                    },
                    getKeyLabel: function (key) {
                        return key;
                    }
                }
            },
            ObjectArrayPainter:
            {
                inherits:'MultipleItemPainter',
                methods:
                {
                    getNewValueWidget: function () {
                        return new Siviglia.AutoUI.Painter.ArrayNewItemPainter({controller:this.controller,uinode: this.params.uinode});
                    },
                    getKeyLabel: function (key) {
                        return key;
                    }
                }
            },
            DictionaryPainter:
            {
                inherits:'MultipleItemPainter',
                methods:
                {
                    getKeyLabel: function (key) {
                        return key;
                    }

                }
            },
            TypeSwitcherPainter:
            {
                inherits:'BasePainter',
                methods:
                {
                    getTemplateString:function(){
                        return '<div> \
                                                   <div class="contentPane">\
                                                   <div >\
                                                   <span class=typeChanger"> \
                                                   </span> \
                                                   <input type="button" class="changeButton" >Change Type</span>\
                                                   </div> \
                                                   <div class="fieldContainer"></div>\
                                                   </div>\
                                               </div>';

                    },
                    postCreate: function () {

                        var m=this;
                        $(".changeButton",this.rootNode).click(function(){m.onChangeType()});
                        this.params.uinode.addListener("change", this, "paintValue");
                        this.typeNode = null;
                        this.paintValue();

                    },
                    paintValue: function () {

                        if (this.typeNode) {
                            this.typeNodeWidget.destroy();
                            this.typeNode.destruct();
                        }
                        $(".typeChanger",this.rootNode).html("");
                        $(".fieldContainer",this.rootNode).html("");
                        var vals = this.params.uinode.getAllowedTypes();
                        var typeNodeDef = {TYPE: "SELECTOR"};
                        var val;
                        if (this.params.uinode.isUnset())
                            val = null;
                        else
                            val = this.params.uinode.getCurrentType();
                        this.typeNode = Siviglia.AutoUI.NodeFactory(typeNodeDef, null, val);
                        this.typeNodeWidget = this.controller.factory({uinode:this.typeNode,options: vals,controller:this.controller});
                        $(".typeChanger",this.rootNode).append(this.typeNodeWidget.rootNode);

                        if (!this.params.uinode.isUnset()) {
                            var sNode = {uinode:this.params.uinode.getSubNode(),controller:this.controller};
                            this.subNodeWidget = this.controller.factory(sNode, null);
                            $(".fieldContainer",this.rootNode).append(this.subNodeWidget.rootNode);
                        }
                    },
                    onChangeType: function () {

                        var v = $(".typeNodeWidget",this.rootNode).val();

                        if (!v) {
                            alert("Please choose a type");
                            return;
                        }
                        if (this.params.uinode.getCurrentType() == v) {
                            return;
                        }
                        this.params.uinode.setType(v);
                    },

                    destroy: function () {
                        if (this.typeNode) {
                            this.typeNode.removeListeners(this);
                            this.typeNode.destruct();
                        }
                        this.params.uinode.removeListeners(this);
                    }

                }
            },
            SelectorPainter:
            {
                inherits:'BasePainter',
                destruct:function()
                {
                    this.params.uinode.removeListeners(this);
                },
                methods:
                {
                    getTemplateString:function()
                    {
                        return '<span> \
                                  <span class=".fieldContainer"><select class="combo"></select></span> \
                                                </span>';

                    },
                    postCreate: function () {
                        var m=this;
                        $(".combo",this.rootNode).change(function(){m.onChange()});
                        this.paintValue();
                        this.allowEvents = true;
                    },
                    setOptions: function (opt) {
                        this.options = opt;
                        this.paintCombo();
                    },
                    buildOptions:function(optDef)
                    {

                    },
                    paintValue: function () {
                        var k;
                        if (this.params.uinode.hasSourceInput()) {
                            var m=this;
                            this.options = $.when(this.params.uinode.getSourceValues()).then(function(o){
                                m.options=o;
                                m.paintCombo();
                            });
                        }
                        else
                            this.paintCombo();
                    },
                    paintCombo:function()
                    {
                        $(".combo option",this.rootNode).remove();
                        var optionLabel='labeñ';
                        var optionValue='value';
                        if(this.params.uinode.definition.OPTIONLABEL)
                        {
                            optionLabel= this.params.uinode.definition.OPTIONLABEL;
                            optionValue=this.params.uinode.definition.OPTIONVALUE;
                        }
                        if(!this.options)
                            this.options=this.params.uinode.definition.OPTIONS;

                        var status='';
                        if(this.params.uinode.isUnset())
                        {
                            status='selected';
                        }
                        var defaultOpt=$('<option value="" '+status+'>--Elegir</option>');
                        $(".combo",this.rootNode).append(defaultOpt);
                        this.syntheticChange=true;
                        for(var k=0;k<this.options.length;k++)
                        {
                            status=this.params.uinode.save()==this.options[k][optionValue]?'selected':'';

                            $(".combo",this.rootNode).append(
                                $('<option value="'+this.options[k][optionValue]+'">'+this.options[k][optionValue]+'</option>')
                            );
                        }
                        this.syntheticChange=false;
                    },
                    onChange: function () {
                        if(!this.syntheticChange)
                            this.params.uinode.setValue(this.getValue());

                    },
                    getValue: function () {
                        return $(".combo",this.rootNode).val();
                    }

                }
            },
            BooleanPainter:
            {
                inherits:'BasePainter',
                methods:{
                    getTemplateString:function()
                    {
                        return '<span> <input type="checkbox" class="theCheck"></span>';
                    },
                    postCreate: function () {
                        this.paintValue();
                        var m=this;
                        $(".theCheck",this.rootNode).change(function(){m.onChange();});
                        this.paintValue();
                    },
                    paintValue:function()
                    {
                        $this.syntheticChange=true;
                        $(".theCheck",this.rootNode).prop('checked',this.params.uinode.getValue()?true:false)
                        $this.syntheticChange=false;
                    },
                    onChange:function()
                    {
                        if(this.syntheticChange)
                            return;
                        var val=$(".theCheck",this.rootNode).prop('checked');
                        this.params.uinode.setValue(val);
                    }
                }
            }

        }
    }
);

/* <div style="text-align:right;border:0px" class="dijitTitlePaneTitle" dojoAttachPoint="addButton"><div dojoType="dijit.form.Button" type="button" dojoAttachEvent="onClick:onNew">New element</div></div> \


 <div id="dialogOne" dojoType="dijit.Dialog" title="My Dialog Title">
 <div dojoType="dijit.layout.TabContainer" style="width: 200px; height: 300px;">
 <div dojoType="dijit.layout.ContentPane" title="foo">
 Content of Tab "foo"
 </div>
 <div dojoType="dijit.layout.ContentPane" title="boo">
 Hi, I'm Tab "boo"
 </div>
 </div>
 </div>
 */




