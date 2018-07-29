Siviglia.Utils.buildClass({

    context: 'Siviglia.AutoUI',
    classes: {
        /*
            El Controller es la conexion de AutoUI con el "mundo exterior".Depende de la existencia
            de un fichero php en la url "baseUrl".
            Este endpoint es el que se usara para toda la sincronizacion entre cliente y servidor.
         */
        AutoUIController:
        {
            extends:'Siviglia.model.RemotePath',
            construct:function(baseUrl,parentController)
            {
                this.baseUrl=baseUrl;
                if(typeof parentController !="undefined")
                    this.parentController=parentController;
                //this.RemotePath(baseUrl);
                this.PathRoot();
            },
             methods:
             {
                 initialize:function(definition,value)
                 {
                     this.definitions=definition;                     
                     this.rootNode=Siviglia.AutoUI.NodeFactory(definition.ROOT, null, value,this);
                     return this.rootNode;
                 },
                 /*
                    La funcion clone es requerida por los objetos de tipo SubDefinition, que, si no tienen un
                    controlador especifico, clonan el actual.
                  */
                 clone:function()
                 {

                     return new Siviglia.AutoUI.AutoUIController(this.baseUrl,parentController);
                 },
                 setParent:function(obj)
                 {
                     this.parentController=obj;
                 },
                 doGet:function(url)
                 {
                     var h= $.Deferred();
                     var m=this;
                     $.ajax({
                         async:true,
                         dataType:'json',
                         data:'',
                         type:'GET',
                         url:url,
                         success:function(response){

                             if(response.success || !response.error)
                             {
                                 h.resolve(response);

                                 return;

                             }
                             m.showError(response);
                             h.reject(response);

                         },
                         error:function(error){
                             m.showAjaxError(error)
                         }
                     });
                     return h;
                 },
                 doPost:function(url,data)
                 {
                     var h= $.Deferred();
                     var m=this;
                     $.ajax({
                         async:true,
                         dataType:'json',
                         data:data,
                         type:'POST',
                         url:url,
                         success:function(response){
                             if(response.success || !response.error)
                             {
                                 h.resolve(response);
                                 return;
                             }
                             m.showError(response);
                             h.reject(response);

                         },
                         error:function(error){
                             m.showAjaxError(error)
                         }
                     });
                     return h;
                 },
                 loadRemoteData:function(u,key)
                 {
                     if(u.match(/^http/) || u.match(/^\//))
                     {
                         return this.doGet(u);
                     }
                     var url=this.baseUrl+'?action=loadValue&entity=u';
                     if(typeof key!="undefined")
                        url+='&key='+key;
                     return this.doGet(url);
                 },
                 loadEntity:function(name,key)
                 {
                     var h= $.Deferred();
                     var m=this;
                     var url=this.baseUrl+'?action=entity&entity='+name;
                     if(typeof key != "undefined")
                        url+="&key="+key;
                     this.doGet(url).then(function(r){
                         h.resolve(r);

                     });
                     return h;
                 },
                 saveObject:function(url,data,key)
                 {
                    return this.doPost(this.baseUrl+'?action=saveEntity&entity='+url,{data:data,key:key});
                 },
                 save:function()
                 {
                     return this.rootNode.save();
                 },
                 fetchDatasource:function(dsName)
                 {
                     var h= $.Deferred();
                     this.doGet(this.baseUrl+'?datasource='+dsName).then(function(r){
                         if(r.success)
                             h.resolve(r.data);
                         else
                            console.debug("Error obteniendo datasource "+dsName);
                     })
                     return h;
                 },
                 /*getPath:function()
                 {
                     if(this.parentController==null)
                        return null;
                     return this.parentController.getCurrentPath();
                 }*/

             }
        },
        /**
         * NodeType
         *
         * @author ICSW (11/06/2012)
         *
         * claves:
         *    "CUSTOMTYPE": Hace que la factoria genere un objeto de la clase esepecificada.
         */

        Node: {
            inherits: 'Siviglia.model.PathResolver',
            construct: function (className, definition, parent, value,controller) {
                this.className = className;
                this.controller=controller;
                this.unset = true;
                this.loaded = false;
                this.parent=parent;
                this.simpleType=false;
                if (typeof(parent) == "string")
                    this.parent = this.getPath(parent);
                else
                    this.parent = parent;
                this.sourceType = definition.TYPE;
                var baseDef = this.controller.definitions[definition.TYPE];
                var k;
                this.definition = {};

                if (baseDef) {
                    for (k in baseDef) {
                        this.definition[k] = baseDef[k];
                    }
                }
                for (k in definition) {
                    if (k != "TYPE" || (k == "TYPE" && !this.definition["TYPE"])) {
                        this.definition[k] = definition[k];
                    }
                }


                this.initSubType();
                //*/
                //this.__definition=definition;
                if (typeof value != "undefined" && value != null)
                    this.setValue(value);
                else {
                    if(typeof definition["DEFAULT"]!="undefined")
                    {
                        this.setValue(
                            this.decodeDefault(definition["DEFAULT"])
                        );

                    }
                    else
                        this.value = null;
                }


            },
            methods: {
                initSubType: function () {
                },
                isContainer: function () {
                    return false;
                },
                getClassName: function () {
                    return this.className;
                },

                setValue: function (value) {
                    if (this.value === value)return;

                    this.loaded = true;
                    this.value = value;
                    this.unset = false;
                    this.fireEvent("change");

                    if (this.parent) {
                        if (this.parent.unset) {
                            this.parent.unset = false;
                            this.parent.fireEvent("change");
                        }
                    }
                },
                save: function () {
                    return this.value;

                },
                load: function () {
                    var el = this;
                    if (this.definition.LOAD_URL) {
                        this.controller.loadRemoteData(this.definition.LOAD_URL).then(function(data){
                            el.loaded = true;
                            el.setValue(data.data);
                        });
                    }
                    else
                    {
                        this.loaded=true;
                    }
                },
                isLoaded: function () {
                    return this.loaded;
                },
                checkLoaded: function () {
                    return true;
                },

                getType: function () {
                    return this.definition["TYPE"]
                },
                getValue: function () {
                    return this.value
                },
                getReference: function () {
                    return this.value
                },
                decodeDefault: function(def){
                    return def;
                },

                isUnset: function () {
                    return this.unset;
                },
                un_set: function () {
                    if (typeof this.value != "undefined")
                        delete this.value;
                    this.unset = true;
                    this.fireEvent("delete");
                },
                hasSaveUrl: function () {
                    return false;
                },
                hasSourceInput: function () {
                    return this.definition["SOURCE"];
                },

                saveToUrl: function () {
                    var val = this.save();
                    var data=Siviglia.types.toJson(this.save());
                    var path=this.getCurrentPath();
                    return this.controller.saveObject(this.definition.SAVE_URL,data,path);
                },
                isSimpleType:function(){return this.simpleType;},
                __getPathProperty:function(path,index,context,currentObject,listener,index)
                {
                    // En un nodo, las propiedades pueden ser :
                    // .. <-- es ir al padre
                    // Ninguna, es decir, no se especifica una subpropiedad, sino que este elemento
                    // es el ultimo del path: se devuelve el valor.
                    // Cualquier otro: a definir en las clases derivadas, especialmente, en los
                    // contenedores.Esto se hace en getCustomPathProperty.
                    var prop = path[index + 1];
                    if(prop=="..")
                        return this.__getPath(this.parent,path,index+1,context,currentObject,listener);

                    var val;
                    if(index+1==path.length-1) {
                        val = this.getValue();
                        this.__initializeListener(listener,val,path,index,context);
                    }
                    else
                       val=this.getCustomPathProperty(path,index,context,currentObject,listener);

                   return val;
                },
                getCustomPathProperty:function(path,index,context,currentObject,listener)
                {
                    throw "AutoUI:Simple Nodes dont have custom properties."
                },
                __initializeListener:function(listener,value,path,index,context)
                {
                    if (listener) {

                        if (!listener.initialized) {

                            listener.setPath(path, index, this, context);
                            //currentObject.addPathListener(listener);
                        }
                        listener.setValue(value);
                    }
                }

            }

        },

        /**
         * BooleanType
         *
         * @author ICSW (11/06/2012)
         */
        BooleanType: {
            inherits: "Siviglia.AutoUI.Node",
            construct: function (definition, parent, value,controller) {
                this.Node("BooleanType", definition, parent, value,controller);
                this.simpleType=true;
            }
        },
        /**
         * BaseKeyContainerType
         *
         * @author ICSW (12/06/2012)
         */
        BaseKeyContainerType: {
            inherits: 'Siviglia.AutoUI.Node',
            methods: {
                setValue: function (val) {
                    this.value = val;
                    for (var k in val) {
                        if (this.children[k]) {
                            this.children[k].setValue(this.getValueFromKey(k));
                        }
                    }
                    this.unset = false;
                    this.fireEvent("change");

                },
                isContainer: function () {
                    return true;
                },
                save: function () {

                    var v = {};
                    var isUnset=true;
                    for (var k in this.children) {
                        if (this.children[k].isUnset())
                            v[k] = null;
                        else
                            v[k] = this.children[k].save();
                        isUnset=false;
                    }
                    this.unset=isUnset;
                    this.value=isUnset?null:v;

                    this.value = v;
                    return v;

                },
                checkLoaded: function () {
                    if (!this.isLoaded())this.load();
                },
                getKeys: function () {
                    this.checkLoaded();
                    var res = [];
                    for (var k in this.children) res.push(k);
                    return res;
                },
                getCustomPathProperty:function(path,index,context,currentObject,listener)
                {
                    this.checkLoaded();
                    var prop= path[index + 1];
                    var val=null;
                    if(prop == "_KEYS_")
                    {
                        var res=[];
                        for(var k in this.children)
                            res.push(k);
                        this.__initializeListener(listener,res,path,index,context);
                        return res;
                    }

                    if(!this.children[prop])
                        throw "Path not found"

                    return this.__getPath(this.children[prop],path,index+1,context,currentObject,listener);
                },


                getReference: function () {
                    this.checkLoaded();
                    var results = [];
                    for (var k in this.children) {
                        if (this.children[k].definition["IGNOREKEY"]) continue;
                        results.push(k);
                    }
                    return results;
                },
                getValueFromKey: function (k) {
                    this.checkLoaded();
                    if(this.definition["VALUEFIELD"])
                    {
                        if(this.definition["VALUEFIELD"]=="[#KEY#]")
                            return k;
                        return this.value[k][this.definition["VALUEFIELD"]];
                    }

                    return this.value[k];
                },
                getKeyFromValue: function(v)
                {
                    this.checkLoaded();
                    for(var k in this.children)
                    {
                        if(this.children[k]==v)
                        {
                            if(this.definition["VALUEFIELD"])
                            {
                                if(this.definition["VALUEFIELD"]=="[#KEY#]")
                                    return k;
                                return this.value[k][this.definition["VALUEFIELD"]];
                            }
                        }
                    }
                    return null;
                },
                addItem: function (key) {
                    this.checkLoaded();
                    this.children[key] = this.getValueInstance(null,key);
                    this.save();
                    this.fireEvent("change");
                    return this.children[key];
                },
                removeItem: function(key)
                {
                    this.checkLoaded();
                    if(typeof this.children[key] != "undefined")
                    {
                        this.children[key]=null;
                        delete this.children[key];
                    }
                    this.save();
                    this.fireEvent("change");
                }

            }
        },
        BaseArrayContainerType: {
            inherits: 'Siviglia.AutoUI.Node',
            methods: {
                setValue: function (val) {
                    if (this.children) {
                        for (var k = 0; k < this.children.length; k++)
                            this.children[k].destruct();

                    }
                    this.value = val;
                    this.children = [];
                    var instance;
                    for (var k = 0; k < val.length; k++) {
                        instance = this.getValueInstance(val[k],k);
                        this.children.push(instance);
                    }
                    this.unset = false;
                    this.fireEvent("change");

                },
                checkLoaded: function () {
                    if (!this.isLoaded())this.load();
                },
                getReference: function () {
                    this.checkLoaded();
                    return this.getKeys();

                },
                getValueFromKey: function (key) {
                    this.checkLoaded();
                    if(this.definition["VALUEFIELD"])
                    {
                        if(this.definition["VALUEFIELD"]=="[#KEY#]")
                            return key;
                        return this.value[k][this.definition["VALUEFIELD"]];
                    }
                    return this.value[key];
                },
                getKeyFromValue: function(v)
                {
                    this.checkLoaded();
                    for(var k=0;k<this.children.length;k++)
                    {
                        if(this.children[k]==v)
                        {
                            if(this.definition["VALUEFIELD"])
                            {
                                if(this.definition["VALUEFIELD"]=="[#KEY#]")
                                    return k;
                                return this.value[k][this.definition["VALUEFIELD"]];
                            }
                        }
                    }
                    return null;
                },
                getKeys: function () {
                    this.checkLoaded();
                    if (!this.children) return [];
                    var res = [];
                    for (var k = 0; k < this.children.length; k++) res.push(k);
                    return res;
                },
                add: function (val) {
                    this.checkLoaded();
                    if (!this.children)this.children = [];

                    this.children.push(val);
                    if (this.unset)
                        this.unset = false;
                    this.fireEvent("change");
                },
                removeItem: function (position) {
                    this.checkLoaded();
                    this.children.splice(position, 1);
                    this.save();
                    this.fireEvent("change");
                },
                remove: function(item)
                {
                    this.checkLoaded();
                    var position=0;
                    for(var k=0;k<this.children.length;k++) {
                        if(this.children[k]==item) {
                            this.children.splice(position, 1);
                            break;
                        }
                        position++;
                    }
                    this.fireEvent("change");
                },
                setItem: function (val, position) {
                    this.checkLoaded();
                    this.children[position] = val;
                    this.fireEvent("change");
                },
                addItem: function (value) {
                    this.checkLoaded();
                    if (!this.children)this.children = [];
                    var nI=this.getValueInstance(value,this.children.length);
                    this.children.push(nI);
                    this.save();
                    this.fireEvent("change");
                    return nI;
                },
                save: function () {

                    this.value = [];
                    if (this.children) {
                        for (var k = 0; k < this.children.length; k++) {
                            this.value.push(this.children[k].save());
                        }
                    }
                    return this.value;
                },

                getCustomPathProperty:function(path,index,context,currentObject,listener)
                {
                    this.checkLoaded();
                    var prop= path[index + 1];
                    var val=null;
                    if(prop == "_COUNT_")
                    {
                        var res=this.children.length;
                        this.__initializeListener(listener,res,path,index,context);
                        return res;
                    }
                    var pint=parseInt(prop);
                    if(pint < 0 || pint > this.children.length)
                        throw "Invalid index";


                    return this.__getPath(this.children[k],path,index+1,context,currentObject,listener);
                },

            }
        },
        /**
         * ContainerType
         *
         * @author ICSW (11/06/2012)
         */
        ContainerType: {

            inherits: 'Siviglia.AutoUI.BaseKeyContainerType',
            construct: function (definition, parent, value,controller) {
                this.Node("ContainerType", definition, parent, value,controller);
            },
            methods: {
                initSubType: function () {
                    this.children = {};
                    var k = 0;
                    for (k in this.definition["FIELDS"])
                        this.children[k] = Siviglia.AutoUI.NodeFactory(this.definition["FIELDS"][k], this,null,this.controller);
                }
            }
        },
        /**
         *
         * SourcedType
         *
         * @author ICSW (11/06/2012)
         */
        SourcedType: {
            inherits: 'Siviglia.AutoUI.Node',
            construct: function () {

                this.listeningTo = null;
            },
            methods: {

                loadSource: function (pathSrc) {
                    var h= $.Deferred();

                    var newListener = new Siviglia.model.Listener(this, "value", caller, pathRoot, contextObj, p2[j]);
                    this.listeners.push({attr: attribute, listener: newListener, append: append});
                    pathRoot.getPath(p2[j], newListener, contextObj);



                    if(pathSrc.substr(0,9)=="[BASEURL]")
                    {
                        this.controller.fetchDatasource(pathSrc.substr(9)).then(function(data){
                            h.resolve(data);
                        });
                        return h;
                    }
                    // A partir de aqui, se supone que es una url.


                    var path = pathSrc.split("/");
                    var el;
                    if (path[0] == '..') {
                        el = this.parent.getPath(path, 1);
                    }
                    else {
                        // if the last element of the path is "", it should be removed.
                        if (path[path.length - 1] == "")
                            path = path.splice(path.length - 1, 1);
                        el = this.rootNode.getPath(path, 1);
                    }

                    if (!el) {
                        return null;
                    }
                    var mustSet = false;

                    if (!this.listeningTo)
                        mustSet = true;
                    else {
                        if (this.listeningTo != el) {
                            this.listeningTo.removeListeners(this);
                            mustSet = true;
                        }

                    }
                    if (mustSet) {
                        this.listeningTo = el;
                        el.addListener("change", this, "onSourceExpressionChanged");
                    }
                    h.resolve(el);
                    return h;
                },

                onSourceExpressionChanged: function () {
                    this.fireEvent("sourceChange");

                },
                getSourceValues: function () {

                    var p= $.Deferred();
                    var curVals = this.save();
                    var m=this;
                    this.loadSource(this.definition["SOURCE"]).then(function(srcValObject){
                    if (!srcValObject)return [];

                        var val;
                    if(Siviglia.types.isArray(srcValObject))
                        val=srcValObject;
                    else
                        val = srcValObject.getReference();
                    var k;
                    var sVals = new Array();
                    var sourceExclusive = true;
                    var curVal;
                    if (m.definition.SOURCE_REPEAT) {
                        sourceExclusive = false;
                    }
                    else {
                        curVal = m.save();
                        if (Siviglia.typeOf(curVal) != "array") {
                            if(curVal==null)
                                curVal=[];
                            else
                                curVal = [curVal];
                        }
                    }

                    var sVal;

                    for (k = 0; k < val.length; k++) {
                        sVal = val[k];
                        if (sourceExclusive && array_contains(curVal, sVal))
                            continue;

                        sVals.push({LABEL: sVal, VALUE: sVal});
                    }
                        p.resolve(sVals);
                    });
                    return p;
                }
            }
        },
        /**
         * StringType
         *
         * @author ICSW (11/06/2012)
         */
        StringType: {
            inherits: "Siviglia.AutoUI.SourcedType",
            construct: function (definition, parent, value,controller) {
                this.Node("StringType", definition, parent, value,controller);
                this.simpleType=true;
            },
            methods:{
                isSimpleType:function(){return true;}
            }
        },
        /**
         *  IntegerType
         */
        IntegerType: {
            inherits: "Siviglia.AutoUI.Node",
            construct: function (definition, parent, value,controller) {
                this.Node("IntegerType", definition, parent, value);
                this.simpleType=true;
            }
        },
        /**
         * ArrayType
         *
         * @author ICSW (11/06/2012)
         */
        ArrayType: {
            inherits: 'Siviglia.AutoUI.BaseArrayContainerType,Siviglia.AutoUI.SourcedType',
            construct: function (definition, parent, value,controller) {
                this.value = [];
                this.children=[];
                this.Node("ArrayType", definition, parent, value,controller);
                this.SourcedType();
            },
            methods: {
                initSubType: function () {
                    this.children = [];
                },
                getReference: function () {
                    this.save();
                    return this.value;

                },
                onSourceExpressionChanged: function () {
                    var m=this;
                    this.loadSource(this.definition["SOURCE"]).then(function(srcValObject) {
                        var val = srcValObject.getReference();
                        m.setValue(array_intersect(m.value, val));
                        m.fireEvent("sourceChange");
                    });
                },
                getValueInstance: function (value,key) {
                    return Siviglia.AutoUI.NodeFactory({TYPE: "STRING"}, this, value,this.controller);
                }
            }

        },
        /**
         * SelectorType
         *
         * @author ICSW (11/06/2012)
         */
        SelectorType: {
            inherits: 'Siviglia.AutoUI.SourcedType',
            construct: function (definition, parent, value,controller) {
                this.Node("SelectorType", definition, parent, value,controller);
                this.options = [];
                this.SourcedType();
            },
            methods: {
                initSubType: function () {

                },
                setValue: function (val) {
                    if (val == this.value)return;
                    this.value = val;
                    this.unset = false;
                    this.fireEvent("change");

                },
                save: function () {

                    return this.value;
                },
                loadSource:function()
                {
                    if(this.definition["VALUES"])
                    {
                        var h= $.Deferred();
                        h.resolve(this.definition["VALUES"]);
                        return h;
                    }
                    if(this.definition["SOURCE"])
                    {
                        return this.SourcedType$loadSource(this.definition["SOURCE"]);
                    }
                    console.debug("UNKNOWN SOURCE FOR SELECTORTYPE:");
                    console.dir(this.definition);
                }
            }
        },
        /**
         * DictionaryType
         *
         * @author ICSW (11/06/2012)
         */
        DictionaryType: {

            inherits: 'Siviglia.AutoUI.BaseKeyContainerType,Siviglia.AutoUI.SourcedType',
            construct: function (definition, parent, value,controller) {

                this.Node("DictionaryType", definition, parent, value,controller);
                this.SourcedType();
            },
            methods: {
                initSubType: function () {
                    this.childType = this.definition.VALUETYPE;
                    this.children = {};
                },

                setValue: function (val) {
                    this.children=[];
                    if (Siviglia.types.isArray(val)) {
                        // We suppose those are keys.
                        var nVal = {};
                        for (var k = 0; k < val.length; k++)
                            this.children[val[k]] = Siviglia.AutoUI.NodeFactory({"TYPE": this.childType}, this, null,this.controller);

                        this.value = nVal;
                    }
                    else
                        this.value = val;


                    for (var k in this.value) {
                        var newInstance = Siviglia.AutoUI.NodeFactory({"TYPE": this.childType}, this, this.getValueFromKey(k),this.controller);
                        this.children[k] = newInstance;
                    }
                    this.unset = false;
                    this.fireEvent("change");
                },
                getValueInstance: function (val,key) {
                    return Siviglia.AutoUI.NodeFactory({"TYPE": this.childType}, this, val,this.controller);
                }
            }
        },
        /*
            Un FixedDictionary, solo puede tener un cierto set de claves; Cada una de las claves, tiene un tipo asociado.
            Por ejemplo, esto sirve como una configuracion de plugins: Cada clave del diccionario es un plugin.No puede haber mas
            de una instancia de cada plugin, y la key tiene un tipo de dato asociado (la configuracion del plugin).
         */
        FixedDictionaryType:{
            inherits: 'Siviglia.AutoUI.DictionaryType',
            construct: function (definition, parent, value,controller) {
                this.Node("FixedDictionaryType", definition, parent, value,controller);
                this.SourcedType();
            },
            methods:
                {
                    initSubType: function() {
                        this.children={}
                    },
                    setValue: function(val)
                    {
                        this.children={};
                        this.value=val;
                        for(var k in this.value)
                        {
                            var childType=this.definition.KEYMAP[k]["TYPE"];
                            this.children[k]=Siviglia.AutoUI.NodeFactory({"TYPE":childType},this,this.value[k],this.controller);
                        }
                        this.unset=false;
                        this.fireEvent("change");
                    },
                    addItem: function (key) {
                        this.checkLoaded();
                        this.children[key] = this.getValueInstance(null,key);
                        this.save();
                        this.fireEvent("change");
                        return this.children[key];
                    },
                    removeItem: function(key, value)
                    {
                        delete this.children[key];
                        this.save();
                        this.fireEvent("change");
                    },
                    getPossibleKeys: function()
                    {
                        return this.definition.KEYMAP;
                    },
                    getValueInstance:function(val,key)
                    {
                        var type=Siviglia.issetOr(this.definition.KEYMAP[key],null);
                        if(type==null)
                            return null;
                        return Siviglia.AutoUI.NodeFactory({"TYPE": this.definition.KEYMAP[key].TYPE}, this, val,this.controller);

                    }
                }
        },
        /**
         * TypeSwitcher
         *
         * @author ICSW (11/06/2012)
         */
        TypeSwitcher: {
            inherits: 'Siviglia.AutoUI.Node',
            construct: function (definition, parent, value,controller) {
                this.subNode = null;
                this.Node("TypeSwitcher", definition, parent, value,controller);
                console.debug("CREANDO TYPESWITCHER...");
                this.currentType = null;

            },
            destruct: function () {
                this.subNode.destruct();
            },
            methods: {
                setValue: function (val) {
                    this.receivedValue = val;
                    if (this.subNode)
                        this.subNode.destruct();
                    var subType=this.getTypeFromValue(val);
                    this.currentType = subType;
                    var subdefinition={"TYPE": subType};
                    if(Siviglia.issetOr(this.definition,"ALLOWED_TYPE_DEFINITIONS",null))
                    {
                        subdefinition=this.definition.ALLOWED_TYPE_DEFINITIONS[subType=="String"?"_String":subType];
                    }
                    this.subNode = Siviglia.AutoUI.NodeFactory(subdefinition, this, val,this.controller);
                    this.unset = false;
                    this.fireEvent("change");
                },
                getTypeFromValue:function(val)
                {
                    var typeField = Siviglia.issetOr(this.definition.TYPE_FIELD,null);
                    if(typeField!=null)
                        return val[typeField];;

                    for(var ss in this.definition.TYPE_TYPE)
                    {
                        if(val.constructor.toString().match(ss)==ss)
                            return this.definition.TYPE_TYPE[ss].TYPE;
                    }
                },
                getValue: function () {
                    if (this.subNode && !this.subNode.isUnset())
                        return this.subNode.getValue();
                    return null;
                },
                save: function () {
                    if (this.subNode && !this.subNode.isUnset())
                        return this.subNode.save();
                    return null;
                },
                setType: function (typeName) {
                    if(Siviglia.isset(this.definition.TYPE_FIELD)) {
                        var c = {};
                        c[this.definition.TYPE_FIELD] = typeName;
                    }
                    this.setValue(c);
                },
                getAllowedTypes: function () {
                    var result = [];
                    if(Siviglia.isset(this.definition.TYPE_FIELD)) {
                        if(Siviglia.isset(this.definition.ALLOWED_TYPE_DEFINITIONS))
                        {
                            for (var k in this.definition.ALLOWED_TYPE_DEFINITIONS) {
                                var n = this.definition.ALLOWED_TYPE_DEFINITIONS[k];
                                result.push({LABEL: n.LABEL || n, VALUE: k});
                            }
                        }
                        if(Siviglia.isset(this.definition.ALLOWED_TYPES)) {
                            for (var k = 0; k < this.definition.ALLOWED_TYPES.length; k++) {
                                var n = this.definition.ALLOWED_TYPES[k];
                                result.push({LABEL: n, VALUE: n});
                            }
                        }
                    }
                    else
                    {
                        for(var ss in this.definition.TYPE_TYPE)
                        {
                            var cc=this.definition.TYPE_TYPE[ss];
                            result.push({LABEL:cc.LABEL,VALUE:cc.TYPE});
                        }
                    }
                    return result;
                },
                getCurrentType: function () {
                    if (Siviglia.isset(this.receivedValue)) {
                        if(Siviglia.isset(this.definition.TYPE_FIELD)) {
                            var typeField = this.definition.TYPE_FIELD;
                            return this.receivedValue[typeField];
                        }
                        else
                        {
                            for(var ss in this.definition.TYPE_TYPE)
                            {
                                var cc=this.definition.TYPE_TYPE[ss];
                                if(this.receivedValue.constructor.toString().match(ss) != null)
                                    return cc.TYPE;
                            }
                        }
                    }
                    return this.currentType;
                },
                getSubNode: function () {
                    return this.subNode;
                },
                __getCurrentPath: function (obj) {
                    if (this.parent == null)return '/ROOT';
                    return this.parent.__getCurrentPath(this);
                }
            }

        },
        FormContainer: {
            inherits: 'Siviglia.AutoUI.Node',
            construct: function (definition, parent, value,controller) {
                this.groups={};
                this.Node("FormContainer", definition, parent, value,controller);

            },
            destruct: function () {
                for(var k in this.groups)
                {
                    for(var h in this.groups[k])
                        this.groups[k][h].destruct();
                }
            },
            methods: {
                setValue: function (val) {
                    for(var k in this.definition.GROUPS)
                    {
                        this.groups[k]={};
                        var cdef=this.definition.GROUPS[k];
                        for(var h in  cdef.CONTENTS)
                        {
                            var curVal=typeof val[h]=="undefined"?null:val[h];
                            this.groups[k][h]= Siviglia.AutoUI.NodeFactory(cdef.CONTENTS[h], this, curVal,this.controller);
                        }
                    }
                    this.value=val;
                    this.unset = false;
                    this.fireEvent("change");
                },
                getValue: function () {
                  var v={};
                  for(var k in this.groups)
                  {
                      for(var j in this.groups[k])
                      {
                          v[j]=this.groups[k][j].getValue();
                      }
                  }
                  return v;
                },
                __getCurrentPath: function (obj) {
                    if (this.parent == null)return '/ROOT';
                    return this.parent.__getCurrentPath();
                },
                isSimpleType:function(){return false;}
            }

        },
        /**
         * ObjectArrayType
         *
         * @author ICSW (11/06/2012)
         */
        ObjectArrayType: {
            inherits: 'Siviglia.AutoUI.BaseArrayContainerType,Siviglia.AutoUI.SourcedType',
            construct: function (definition, parent, value,controller) {
                this.value = [];
                this.children = [];
                this.Node("ObjectArrayType", definition, parent, value,controller);

            },
            methods: {
                initSubType: function () {
                },
                getValueInstance: function (val,key) {
                    return Siviglia.AutoUI.NodeFactory({"TYPE": this.definition.VALUETYPE}, this, val,this.controller);
                }
            }
        },
        /*
         TIPO SUBDEFINITION:
         CLAVES:
         "TYPE":"SUBDEFINITION"
         "OBJECTTYPE":"<nombre>",
         "CONTROLLER_CLASS":"<class>"

         Al ser llamado su metodo "setValueFromField", con el valor de la key para cargar una instancia del <objectType>.
         Para cargarlo, llama al metodo "loadType" del controller, con los parametros <objectType>, <key>.

         La respuesta debe incluir tanto la definicion de edicion del tipo, como el valor.
         Esa respuesta se pasa al metodo initializeSubdefinition, el cual crea el controlador especificado en
          "CONTROLLER_CLASS", o crea un AutoUIController por defecto, para gestionar la nueva definicion.
          Se le establece el tipo.
         */
        SubdefinitionType:
        {
            inherits: "Siviglia.AutoUI.Node",
            construct: function (definition, parent, value,controller) {
                this.Node("SubdefinitionType", definition, parent, value, controller);
                this.entityPromise= $.Deferred();
            },
            methods:
            {
                isContainer: function () {
                    return true;
                },
                setValueFromField:function(v)
                {
                    var m=this;

                    this.controller.loadEntity(this.definition["OBJECTTYPE"],v).then(function(r)
                    {
                        m.initializeSubdefinition(r.data);
                        m.entityPromise.resolve();
                    });
                    return this.entityPromise;
                },
                getEntityPromise:function()
                {
                    return this.entityPromise;
                },
                initializeSubdefinition:function(data)
                {
                    if(this.definition["CONTROLLER_CLASS"])
                    {
                        var codeClass = Siviglia.Utils.stringToContextAndObject(this.definition["CONTROLLER_CLASS"]);
                        this.subController=new codeClass.context[codeClass.object]();
                    }
                    else
                        this.subController=this.controller.clone();
                    this.subController.setParent(this);
                    if(data.value!=null)
                    {
                        if (this.parent) {
                            if (this.parent.unset) {
                                this.parent.unset = false;
                                this.parent.fireEvent("change");
                            }
                        }
                    }
                    this.subController.initialize(data.meta,data.value,this.controller.baseUrl);
                },
                setValue: function (value) {
                    this.setValueFromField(value);
                },
                isLoaded: function () {
                    return this.loaded;
                },
                checkLoaded: function () {
                    return true;
                },
                getType: function () {
                    return this.definition["TYPE"]
                },
                getValue: function () {
                    return this.value
                },
                save:function()
                {
                    return this.subController.save();
                }
            }

        }

    }

});


Siviglia.AutoUI.NodeFactory = function (definition, parent, value,controller) {
    var type = definition.TYPE;
    var cDef=definition;
    var newDef={};
    while(cDef)
    {
        for(var k in cDef)
        {
            if(typeof newDef[k]=="undefined" || k=="TYPE")
                newDef[k]=cDef[k];
        }
        cDef=controller.definitions[cDef["INHERITS"]];
    }

    definition=newDef;
    type=definition["TYPE"];
    
    if (!type) {
        if (definition["CUSTOMTYPE"])
            return new Siviglia.AutoUI[definition["CUSTOMTYPE"]](definition, parent, value);
    }
    if (type[0] == "*") {
        type = type.substr(1);
        //def = Siviglia.AutoUI.root.definitions[type];
        def=controller.definitions[type];
        if (!def) {
            Siviglia.debug("Tipo no encontrado: *type:" + type);
            return null;
        }
        //definition["TYPE"]=type;
        return Siviglia.AutoUI.NodeFactory(def, parent, value,controller);
    }
    if(!controller) {
        controller=parent.controller;
    }
    var o=null;
    switch (type) {
        case "INTEGER":
        case "STRING":
        {
            o=new Siviglia.AutoUI.StringType(definition, parent, value,controller);
        }
            break;
        case "BOOLEAN":
        {
            o=new Siviglia.AutoUI.BooleanType(definition, parent, value,controller);
        }
            break;
        case "CONTAINER":
        {
            o=new Siviglia.AutoUI.ContainerType(definition, parent, value,controller);
        }
            break;
        case "DICTIONARY":
        {
            o=new Siviglia.AutoUI.DictionaryType(definition, parent, value,controller);
        }
            break;
        case "FIXEDDICTIONARY":
        {
            o=new Siviglia.AutoUI.FixedDictionaryType(definition, parent, value,controller);
        }break;
        case "ARRAY":
        {
            o=new Siviglia.AutoUI.ArrayType(definition, parent, value,controller);
        }
            break;
        case "SELECTOR":
        {
            o=new Siviglia.AutoUI.SelectorType(definition, parent, value,controller);
        }
            break;
        case "TYPESWITCH":
        {
            o=new Siviglia.AutoUI.TypeSwitcher(definition, parent, value,controller);
        }
            break;
        case "OBJECTARRAY":
        {
            o=new Siviglia.AutoUI.ObjectArrayType(definition, parent, value,controller);
        }break;
        case "SUBDEFINITION":
        {
            o=new Siviglia.AutoUI.SubdefinitionType(definition,parent,value,controller);
        }break;
        case "FORMCONTAINER":
        {
            o=new Siviglia.AutoUI.FormContainer(definition, parent, value,controller);
        }break;
        default:
        {
            // Se mira si el tipo es un tipo "custom", definido dentro de la definicion
            // del formulario, en el padre.

            def = parent.controller.definitions[type];
            if (def)
                o=new Siviglia.AutoUI.NodeFactory(def, parent, value,controller);
            else
            {

                // Si el tipo no esta definido en la definicion del padre, se
                // mira si existe el tipo como clase.Ojo que aqui, el nombre del tipo
                // debe coincidir con el nombre de la clase, y estar en el namespace Siviglia.AutoUI
                if(Siviglia.isset(Siviglia.AutoUI[type]))
                {
                    o=new Siviglia.AutoUI[type](def,parent,value,controller);
                }
                else
                {
                    // Si no es un tipo derivado, y no hay ninguna clase que lo gestione,
                    // es un error
                    throw "AUTOUI: UNKNOWN NODE TYPE IN DEFINITION: " + type;
                }
            }

        }
    }
    //o.controller=parent?parent.controller:controller;
    //o.rootNode=parent?parent.rootNode:controller.rootNode;
    return o;
    


}

array_contains = function (haystack, needle) {

    for (var i = 0; i < haystack.length; i++) {
        if (haystack[i] == needle) return true;
    }
    return false;

}
array_compare = function (total, partial, storeEq) {
    if (!total)return [];
    if (!partial)return [];
    var k, j;
    var found = false;
    var result = [];
    for (k = 0; k < total.length; k++) {
        found = false;
        for (j = 0; j < partial.length; j++) {
            if (total[k] == partial[j]) {
                found = true;
                break;
            }
        }
        if ((found && storeEq ) || (!found && !storeEq))
            result[result.length] = total[k];
    }
    return result;
}
array_intersect = function (total, partial) {
    if (!total)return [];
    if (!partial)return [];
    return array_compare(total, partial, true);
}

array_diff = function (total, partial) {
    if (!total)return partial;
    if (!partial)return [];
    return array_compare(total, partial, false);
}

array_remove = function (arr, val) {
    var k;
    for (k = 0; k < arr.length; k++) {
        if (arr[k] == val) {
            arr.splice(k, 1);
            return arr;
        }
    }
}


