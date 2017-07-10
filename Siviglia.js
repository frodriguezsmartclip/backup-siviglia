
if (typeof Siviglia === 'undefined') {
    Siviglia = {};
}

// Se crea la funcion "map" para navegadores que no lo soporten
if (!Array.prototype.map) {
    Array.prototype.map = function (fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();

        var res = new Array(len);
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                res[i] = fun.call(thisp, this[i], i, this);
        }

        return res;
    };
}

// Se crea la funcion "forEach" para navegadores que no lo soporten
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fun /*, thisp*/) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();

        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this)
                fun.call(thisp, this[i], i, this);
        }
    };
}

Siviglia.isset = function(value)
{
    return typeof value!=="undefined";
};
Siviglia.issetOr = function (value,defValue)
{
    return Siviglia.isset(value)?value:defValue;
};
Siviglia.issetPathOr=function(value,path,defaultV)
{
    var parts=path.split(".");
    var c=value;
    for(var k=0;k<parts.length;k++)
    {
        if(typeof c[parts[k]]=="undefined")
            return defaultV;
        c=c[parts[k]];
    }
    return c;
};
Siviglia.typeOf = function (value) {
    var s = typeof value;
    if (s === 'object') {
        if (value) {
            if (Object.prototype.toString.call(value) == '[object Array]') {
                s = 'array';
            }
        } else {
            s = 'null';
        }
    }
    return s;
}
Siviglia.type = function (obj) {
    var checker = {};
    var types = "Boolean Number String Function Array Date RegExp Object".split(" ");
    for (var i in types) {
        checker[ "[object " + types[i] + "]" ] = types[i].toLowerCase();
    }
    return obj == null ?
        String(obj) :
        checker[ Object.prototype.toString.call(obj) ] || "object";
}
Siviglia.isFunction = function (obj) {
    return type(obj) === "function";
}
Siviglia.isString = function (obj) {
    return type(obj) === "string";
}
Siviglia.isInt = function (obj) {
    return type(obj) === "number" && obj==parseInt(obj);
}

Siviglia.isPlainObject = function (obj) {
    var hasOwn = Object.prototype.hasOwnProperty;
    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
        return false;
    }

    try {
        // Not own constructor property must be Object
        if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
            return false;
        }
    } catch (e) {
        // IE8,9 Will throw exceptions on certain host objects #9897
        return false;
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    var key;
    for (key in obj) {
    }
    return key === undefined || hasOwn.call(obj, key);
}
Siviglia.isArray = function (obj) {
    return Siviglia.type(obj) === "array";
}

Siviglia.Utils = Siviglia.Utils || {};

/*
 Conversion de una cadena de texto,a una referencia al elemento apuntado por la cadena.
 Resuelve una cadena tipo "Siviglia.Dom.Object" , a una referencia a ese elemento.

 */
Siviglia.Utils.stringToContext = function (str, defContext) {
    var contexts = str.split(".");
    if (contexts.length == 1)
    {
        if(typeof defContext[contexts[0]]=="undefined")
            defContext[contexts[0]]={};
        return defContext[contexts[0]];
    }

    if(!defContext)
        curContext = window;
    else
        curContext= defContext;
    var k;
    for (k = 0; k < contexts.length; k++) {
        if (!curContext[contexts[k]])
            curContext[contexts[k]] = {};
        curContext = curContext[contexts[k]];
    }

    return curContext;
}
/*
 Conversion de una cadena de texto, a un objeto padre y una propiedad del objeto.
 Resuelve una cadena tipo "Siviglia.Dom.Object" , a una referencia al elemento padre, y el nombre
 de la propiedad (Siviglia.Dom y Object)

 */

Siviglia.Utils.stringToContextAndObject = function (str, startContext,defContext,throwException) {
    var contexts = str.split(".");
    var l = contexts.length;
    if (l == 1 && defContext)return {
        context: defContext,
        object: str        
    };

    if(!startContext)
        curContext = window;
    else
        curContext= startContext;

    var k;
    for (k = 0; k < l - 1; k++) {
        if (!curContext[contexts[k]]) {
            if(typeof throwException!=="undefined" && throwException)
                throw "Not found";
            curContext[contexts[k]] = {};
        }
        curContext = curContext[contexts[k]];
    }
    return {
        context: curContext,
        object: contexts[l - 1]
    };
}

/*

 Funcion de adaptacion de clases existentes, al modelo Siviglia, para
 poder derivar de ellas.

 */

/*

 Funcion de construccion de clases

 */

Siviglia.Utils.buildClass = function (definition) {
    var context = definition.context;
    if (!context) {
        context = "window";
        contextObj = window;
    }
    else
        var contextObj = Siviglia.Utils.stringToContext(context, window);

    var k, j, i, h, inherits;
    for (k in definition.classes) {
        inherits = null;


        if (definition.classes[k].inherits)
            inherits = definition.classes[k].inherits.split(",");

        // En cualquier caso, el constructor debe ser este
        // GigyaAuthenticator.prototype=Object.create(UserProvider.prototype);

        // Ahora hay 4 escenarios, dependiendo de 1) el objeto hereda o no hereda,
        // y 2) especifica o no especifica un constructor.
        // Si hereda y especifica, deben aniadirse tanto su constructor, como los de otros objetos.
        // Si hereda y no especifica, su constructor es el del primer objeto del que herede.
        // Si no hereda y especifica, hay que aniadirlo a su prototype
        // Si no hereda y no especifica, hay que crearle uno dummy


        if(!inherits)
            contextObj[k] = Siviglia.issetOr(definition.classes[k].construct,function(){});

        var baseClass;

        var inheritClasses = [];


        if (inherits && inherits.length > 0) {

            // Se copian los prototype de otras clases.
            for (i = 0; i < inherits.length; i++) {

                var c = Siviglia.Utils.stringToContextAndObject(inherits[i], null,contextObj);

                inheritClasses.push(c.object);

                var curClass = c.context[c.object];

                inheritClasses = inheritClasses.concat(curClass.prototype.__inherits);
                if (!curClass) {
                    alert("Error de herencia:No se encuentra:" + c.object);
                }

                if (i == 0) {
                    var parts=inherits[i].split(".");
                    var baseClassName;
                    if(parts.length==1) 
                         baseClassName=context+"."+inherits[i];
                    else
                        baseClassName=inherits[i];

                    baseClass = c.object;
                    var curBaseClass=c.context[c.object];
                    if(Siviglia.isset(definition.classes[k].construct))                     
                        contextObj[k]=definition.classes[k].construct;
                    else
                        eval(context+"."+k+"=function(){"+baseClassName+".apply(this,arguments);};");
                    constructor=contextObj[k];
                    contextObj[k].prototype = (function(st){
                        var c = Siviglia.Utils.stringToContextAndObject(st, null,contextObj);
                        return Object.create(c.context[c.object].prototype)})(inherits[i]);
                }

                contextObj[k].prototype[c.object] = curClass.prototype.__construct;
                contextObj[k].prototype[c.object].__className = c.object;
                contextObj[k].prototype[c.object + "$destruct"] = curClass.prototype.__destruct;

                if (i == 0)continue;

                for (h in curClass.prototype) {
                    //if(h.indexOf("__")>-1 || h.indexOf("destruct")==0)continue;
                    if (h.indexOf("destruct") == 0)continue;

                    if ((definition.classes[k].methods && definition.classes[k].methods[h]) ||
                        contextObj[k].prototype[h]) {
                        contextObj[k].prototype[c.object + "$" + h] = curClass.prototype[h];
                    }
                    else {
                        contextObj[k].prototype[h] = curClass.prototype[h];
                    }
                }
            }
        }

        contextObj[k].prototype.__construct=contextObj[k];
        contextObj[k].prototype.constructor=contextObj[k];
        contextObj[k].prototype.destruct = function (ignoreInherit) {
            this.__destruct();
            this.__commonDestruct(ignoreInherit);
        }

        if (definition.classes[k].destruct)
            contextObj[k].prototype.__destruct = definition.classes[k].destruct;
        else
            contextObj[k].prototype.__destruct = function () {
            };

        if (!contextObj[k].prototype.__commonDestruct) {
            contextObj[k].prototype.__commonDestruct = function (ignoreInherit) {
                var k;
                if (this.__inherits && !ignoreInherit) {
                    for (k = 0; k < this.__inherits.length; k++) {
                        if (this[this.__inherits[k] + "$destruct"] != this.__commonDestruct)
                            this[this.__inherits[k] + "$destruct"](true);
                    }
                }
            }
        }

        // se copian los miembros y los metodos especificados en la definicion.
        var members = definition.classes[k].members || {};

        for (j in members)
            contextObj[k].prototype[j] = members[j];
        var constants = definition.classes[k].constants || {};
        for (j in constants) {
            contextObj[k][j] = constants[j];
        }
        var methods = definition.classes[k].methods || {};

        for (j in methods) {
            if (contextObj[k].prototype[j]) {
                // Si ya existe este metodo, es porque se ha copiado de la primera clase base.
                contextObj[k].prototype[baseClass + "$" + j] = contextObj[k].prototype[j];
            }
            contextObj[k].prototype[j] = methods[j];
        }

        contextObj[k].prototype.__inherits = inheritClasses;
    }
}


Siviglia.Dom = {};

/* Add prepend capabilities function */
Element.prototype.prependChild = function (child) {
    this.insertBefore(child, this.firstChild);
};

/*
 Sistema de gestion de ventos (listeners) 

 */
Siviglia.Utils.buildClass({
    context: 'Siviglia.Dom',
    classes: {
        EventManager: {

            construct: function () {
            },
            destruct: function () {
                if (this.runningListeners) {
                    this.runningListeners.map(function (i) {
                        i.target.removeListeners(this);
                    })
                }
                // If this destructor was called while this object was notifying its listeners,
                // simply set a flag and return.
                if (this.notifying) {
                    this.mustDestruct = true;
                    return;
                }
                this.runningListeners = null;
                this.listeners = null;

            },
            methods: {
                addListener: function (evType, object, method, param, target) {
                    if (!this.listeners)this.listeners = {};
                    if (!this.listeners[evType])
                        this.listeners[evType] = [];

                    var k;
                    for (k = 0; k < this.listeners[evType].length; k++) {
                        if (this.listeners[evType][k].obj == object && this.listeners[evType][k].method == method) {
                            return;
                        }
                    }
                    this.listeners[evType].push({
                        obj: object,
                        method: method,
                        param: param,
                        target: target
                    });


                    if (object && object.addRunningListener) {
                        object.addRunningListener(this);
                    }
                },
                addRunningListener: function (obj) {
                    if (!this.runningListeners) {
                        this.runningListeners = [
                            {
                                target: obj,
                                nListeners: 1
                            }
                        ];
                        return;
                    }
                    for (var k = 0; k < this.runningListeners.length; k++) {
                        if (this.runningListeners[k].target == obj) {
                            this.runningListeners[k].nListeners++;
                            return;
                        }
                    }
                    this.runningListeners.push({
                        target: obj,
                        nListeners: 1
                    });
                },
                removeRunningListener: function (obj) {
                    if (!this.runningListeners)return;
                    for (var k = 0; k < this.runningListeners.length; k++) {
                        if (this.runningListeners[k].target == obj) {
                            this.runningListeners[k].nListeners--;
                            if (this.runningListeners[k].nListeners == 0)
                                this.runningListeners.splice(k, 1);
                            return;
                        }
                    }

                },
                removeListener: function (evType, object, method, target) {
                    if (!this.listeners)return;
                    if (!this.listeners[evType])return;
                    var k, curL;
                    for (k = 0; k < this.listeners[evType].length; k++) {
                        curL = this.listeners[evType][k];
                        if (curL.obj == object && (!method || (method == curL.method))) {
                            if (target) {
                                if (curL.target != target)
                                    continue;
                            }
                            this.listeners[evType].splice(k, 1);
                            if (object && object.removeRunningListener) {
                                object.removeRunningListener(this);
                            }
                            return;
                        }
                    }
                },
                removeListeners: function (object) {
                    if (!this.listeners)return;
                    var k, j;
                    for (k in this.listeners) {
                        for (j = 0; j < this.listeners[k].length; j++) {
                            if (this.listeners[k][j].obj == object) {
                                this.listeners[k].splice(j, 1);
                                j--;
                            }
                        }
                    }
                },
                notify: function (evType, data, target) {
                    if (!this.listeners)return;
                    if (!this.listeners[evType]) {
                        return;
                    }
                    this.notifying = true;
                    var k;
                    var obj;
                    for (k = 0; k < this.listeners[evType].length; k++) {
                        obj = this.listeners[evType][k];
                        if (obj.obj) {
                            if(typeof obj.obj=="function")
                            {
                                obj.obj(evType,data,obj.param,target);
                            }
                            else {
                                if (!obj.obj[obj.method])
                                    continue;
                                obj.obj[obj.method](evType, data, obj.param, target);
                            }
                        }
                        else {
                            obj.method(evType, data, obj.param, target);
                        }
                    }
                    // The following is a protection code; if marks this object as "notifying",so, if as part of the notification, this object
                    // is destroyed, it will not destroy the listeners, but set the mustDestroy flag to true.
                    this.notifying = false;
                    if (this.mustDestroy) {
                        this.listeners = null;
                    }
                },
                fireEvent: function (event, data, target) {
                    if (typeof data!="undefined")
                        data.target = target;
                    else
                        data = {
                            target: target
                        };
                    data.src = this;
                    this.notify(event, data, target);
                }
            }
        }
    }
});

Siviglia.Utils.recurseHTML = function (node, applyFunc) {
    if ($(node).attr("noparse"))
        return;


    var parseChildren = applyFunc(node);
    if (!parseChildren) {
        return;
    }
    var nNodes = node.childNodes.length;
    for (var k = 0; k < nNodes; k++) {
        if (node.childNodes[k].tagName)
            Siviglia.Utils.recurseHTML(node.childNodes[k], applyFunc);
    }
}
/**
 *
 * Pre-declaracion de PathListener
 */
Siviglia.Utils.buildClass(
    {
        context: 'Siviglia.model',
        classes: {
            PathListener: {
                construct: function () {
                    this.pathListeners = [];
                    this.notifying=false;
                    this.newListeners=[];
                },
                destruct: function () {
                    if (!this.pathListeners)return;

                    this.pathListeners.map(function (z) {
                        z.destruct();
                    });
                },
                methods: {

                    addPathListener: function (listener) {
                        if(this.notifying)
                        {
                            this.newListeners.push(listener);
                            return;
                        }
                        if (!this.pathListeners) {
                            this.pathListeners = [];
                        }
                        this.pathListeners.push(listener);
                    },
                    removePathListener: function (listener) {
                        var k;
                        if (!this.pathListeners)return;

                        for (k = 0; k < this.pathListeners.length; k++) {
                            if (this.pathListeners[k] == listener) {
                                this.pathListeners.splice(k, 1);
                                listener.destruct();
                                return;
                            }
                        }
                    },
                    notifyPathListeners: function () {
                        var k;
                        this.notifying=true;
                        this.newListeners=[];
                        if (!this.pathListeners) {
                            this.pathListeners = [];
                        }

                        for (k = 0; k < this.pathListeners.length; k++) {
                            this.pathListeners[k].onChange();
                        }
                        // Aniadimos los listeners que se han creado posteriormente.
                        this.pathListeners.concat(this.newListeners);
                        this.notifying=false;
                    }
                    
                }

            }
        },                
    }
)
/**
 *
 *   Objetos expando para UI
 *
 */
Siviglia.Utils.buildClass(
    {
        context: "Siviglia.UI.Dom.Expando",
        classes: {
            Expando: {
                construct: function (expandoTag) {
                    this.expandoTag = expandoTag;
                },
                destruct: function () {
                    if (this.listener)
                        this.listener.destruct();
                    //console.debug("DESTROYING " + this.expandoTag);
                    this.listener = null;
                    if (this.node) {
                        this.node.remove();
                    }
                    this.node = null;
                    this.destroyed=true;
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        this.node = node;
                        this.unresolvedPaths = [];
                        var attr = node[0].getAttribute(this.expandoTag);
                        if (attr) {
                            this.listener = new Siviglia.model.Listener(this, "value", caller, pathRoot, contextObj, attr);
                            pathRoot.getPath(attr, this.listener, contextObj);
                            this.node = node;
                            this.node.data("listener", this.listener);
                            this.node.data(this.expandoTag, this);
                        }
                        var attr = node[0].getAttribute('sivMapped');
                        if (attr && caller.nodes) {
                            caller.nodes[attr] = this;
                        }
                        return true;
                    },
                    reset: function () {
                    }
                }
            }
        }
    });
Siviglia.Utils.buildClass(
    {
        context: "Siviglia.UI.Dom.Expando",
        classes: {
            ValueExpando: {
                inherits: "Expando",
                construct: function () {
                    this.Expando("sivValue");
                    this.listeners=[];
                    this.origValues={};
                },
                destruct: function () {
                    if (this.listener)
                        this.listener.destruct();
                    //console.debug("DESTROYING " + this.expandoTag);
                    this.listener = null;
                    if (this.node) {
                        this.node.remove();
                    }
                    for(var k=0;k<this.listeners.length;k++)
                        this.listeners[k].listener.destruct();
                    this.listeners=null;
                    this.node = null;
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        this.attr = node[0].getAttribute("sivValue");

                        this.node = node;
                        this.unresolvedPaths = [];
                        var attrs=this.attr.split(","),attribute='',path='';
                        for(var k=0;k<attrs.length;k++)
                        {
                            var subAttr=attrs[k].split(":");
                            if(subAttr.length==1)
                            {
                                attribute='innerHTML';
                                path=subAttr[0];
                            }
                            else
                            {
                                attribute=subAttr[0];
                                path=subAttr[1];
                            }
                            var p2=path.split(" ");
                            // Si en el atributo existe mas de 1 path, es append siempre.
                            var append=p2.length > 1?1:0;



                            if(attribute.substr(0,1)=='+') {
                                attribute = attribute.substr(1);
                                append = 1;
                            }
                            // Soporte para que 1 solo atributo tenga mas de 1 path, separado por espacios.
                            // Ejemplo: className:/*a /*b,....
                            for(var j=0;j<p2.length;j++) {
                                this.origValues[attribute] = this.node[0][attribute];
                                var newListener = new Siviglia.model.Listener(this, "value", caller, pathRoot, contextObj, p2[j]);
                                this.listeners.push({attr: attribute, listener: newListener, append: append});
                                pathRoot.getPath(p2[j], newListener, contextObj);
                            }
                        }
                        var attr = node[0].getAttribute('SivigliaAlias');
                        if (attr && caller.nodes) {
                            caller.nodes[attr] = this;
                        }
                        return true;
                    },
                    onListener: function () {
                        var c;
                        var self=this;
                        // Se resetean al valor inicial.
                        // En una primera fase, se resetean todos los valores.
                        // En la segunda fase, se agregan los valores de los listeners
                        // Esto hay que hacerlo en 2 pasos por la posibilidad de que 1 atributo tenga mas de 1 path
                        this.listeners.map(function(i){
                                self.node[0][i.attr]=self.origValues[i.attr];
                        })
                        this.listeners.map(function(i){
                            if(i.listener.value==null)
                                self.node[0][i.attr]=null;
                            else
                                self.node[0][i.attr]=(i.append?self.node[0][i.attr]+" ":'')+i.listener.value;
                        })
                    },
                    reset: function () {
                        for(var k in this.origValues)
                            this.node[0][k] = this.origValues[k];

                    }
                }
            },
            CssExpando:{
                inherits:"Expando",
                construct:function(){
                    this.Expando("sivCss");
                },
                methods:{
                    _initialize:function(node,nodeManager,pathRoot,contextObj,caller)
                    {
                        this.cssProperty=node.attr("cssProperty");
                        this.oldProperty=node[0].style[this.cssProperty];
                        return this.Expando$initialize(node,nodeManager,pathRoot,contextObj,caller);
                    },
                    onListener:function()
                    {
                        this.node[0].style[this.cssProperty]=this.listener.value;
                    },
                    reset:function()
                    {
                        this.node[0].style[this.cssProperty]=this.oldProperty;
                    }
                }
            },
            AttrExpando:{
                inherits:"Expando",
                construct:function(){
                    this.Expando("sivAttr");
                },
                methods:{
                    _initialize:function(node,nodeManager,pathRoot,contextObj,caller)
                    {
                        this.attrProperty=node.attr("attrProperty");

                        this.oldProperty=node[0].style[this.attrProperty];
                        return this.Expando$_initialize(node,nodeManager,pathRoot,contextObj,caller);
                    },
                    onListener:function()
                    {
                        this.node[0].style[this.attrProperty]=this.listener.value;
                    },
                    reset:function()
                    {
                        this.node[0].style[this.attrProperty]=this.oldProperty;
                    }
                }
            },
            CallExpando: {
                inherits: "Expando",
                construct: function () {
                    this.Expando("sivCall");
                },
                destruct: function () {
                    if(this.paramObj)
                        this.paramObj.destruct();
                    if (this.listener)
                        this.listener.destruct();
                    //console.debug("DESTROYING " + this.expandoTag);
                    this.listener = null;
                    if (this.node) {
                        this.node.remove();
                    }
                    this.node = null;
                    this.destroyed=true;
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        this.method = node.attr("sivCall");
                        this.node = node;
                        this.caller = caller;
                        //return this.Expando$initialize(node,nodeManager,pathRoot,contextObj,caller);
                        // Directamente, se llama a initialize
                        // this.Expando$initialize(node,nodeManager,pathRoot,contextObj,caller);
                        // Noa aniadimos como listener de los parametros.
                        this.paramObj = node.data("paramsExpando");
                        if (this.paramObj)
                            this.paramObj.setController(this);
                        this.onListener();
                        // Un sivcall no debe procesar su contenido.El por que, es complejo:
                        // Supongamos que el contenido del nodo , va a ser establecido en la llamada , a otra subplantilla cargada via ajax.
                        // La primera vez que se procesa el sivCall, la plantilla que quiere meter en el nodo, no esta cacheada,
                        // asi que cuando termina la llamada , el nodo no tiene hijos, y no se parsean.
                        // La segunda vez que se ejecute el SivCall, la plantilla a meter YA esta cacheada, por lo que muy probablemente
                        // hara que ANTES de terminar la llamada, el nodo ya tenga la subplantilla.
                        // Esta diferencia hace que, en el primer caso, el contenido de sivCall no se parsee.En el segundo, si.
                        // Y esto puede provocar que el codigo acabe parseando dos veces la subplantilla.
                        // Por si acaso, metemos un parametro extra que nos indique que queremos hacer.
                        var doparse = node.attr("parseContent");
                        if (doparse)
                            return true;
                        return false; // NO se deben procesar los contenidos del nodo.Que lo haga quien lo llama.

                    },
                    onListener: function () {
                        if (this.method.substr(0, 1) == ".") {
                            return window[this.method.substr(1)](this.node, $(this.node).data("params"));
                        }
                        var src = this.caller;
                        if (this.caller.viewObject)
                            src = src.viewObject
                        var params=null;
                        if(Siviglia.isset(this.paramObj))
                            params=this.paramObj.getValues();
                        src[this.method](this.node, params);
                    },

                    reset: function () {
                        this.onListener();
                    }
                }
            },
            LoopExpando: {
                inherits: "Expando",
                construct: function () {
                    this.oManager = null;
                    this.Expando("sivLoop");
                },
                destruct: function () {
                    if (this.oManager)
                        this.oManager.destruct();
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        this.origHTML = [];
                        for (var k = 0; k < node[0].childNodes.length; k++) {
                            var cNode = node[0].childNodes[k];
                            if (cNode.nodeType != 3 && cNode.nodeType != 8)
                                this.origHTML.push(cNode.cloneNode(true));
                        }
                        this.contextParam = node.attr("contextIndex");
                        this.pathRoot = pathRoot;
                        this.context = contextObj;
                        this.Expando$_initialize(node, nodeManager, pathRoot, contextObj, caller);
                        return false;
                    },

                    onListener: function () {
                        this.node[0].innerHTML = "";
                        if (this.oManager) {
                            this.oManager.destruct();
                        }
                        //var newRoot = new Siviglia.model.PathRoot();
                        this.oManager = new Siviglia.UI.Dom.Expando.ExpandoManager(this.pathRoot, this.context);
                        //this.oManager.context = {}; // this.context;


                        var curNode;

                        var val = this.listener.value;
                        var tempNode = $(this.origHTML);

                        if (val.constructor.toString().indexOf("rray") < 0) {
                            if (val.constructor.toString().indexOf("bject") > 0) {
                                for (var k in val) {
                                    for (var j = 0; j < this.origHTML.length; j++) {
                                        curNode = this.origHTML[j].cloneNode(true);
                                        this.context[this.contextParam] = val[k];
                                        this.context[this.contextParam+"-index"]=k;
                                        this.oManager.parse([curNode], this.listener.caller, true, true);
                                        this.node.append(curNode);
                                    }
                                }
                            }
                            else {
                                //alert("Indicado LoopExpando sobre path que no es un array");
                                return;
                            }
                        }
                        else {

                            var l = this.listener.value.length;
                            for (var k = 0; k < l; k++) {
                                for (var j = 0; j < this.origHTML.length; j++) {
                                    curNode = this.origHTML[j].cloneNode(true);
                                    this.context[this.contextParam] = val[k];
                                    this.context[this.contextParam+"-index"]=k;
                                    this.oManager.parse([curNode], this.listener.caller, true, true);
                                    this.node.append(curNode);
                                }
                            }
                        }
                        delete this.context[this.contextParam];
                        delete this.context[this.contextParam+"-index"];
                        //this.oManager.context=oldContext;
                    },
                    onPathNotFound:function(path)
                    {
                        this.node[0].innerHTML = "";
                        if (this.oManager) {
                            this.oManager.destruct();
                        }
                    }
                }
            },
            IfExpando: {
                inherits: "Expando",
                construct: function () {
                    this.oManager = null;
                    this.Expando("sivIf");
                },
                destruct: function () {
                    if (this.oManager)
                        this.oManager.destruct();
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        this.origHTML = [];
                        for (var k = 0; k < node[0].childNodes.length; k++) {
                            var cNode = node[0].childNodes[k];
                            this.origHTML.push(cNode.cloneNode(true));
                        }
                        var attr = node[0].getAttribute("sivIf");
                        var parts=attr.split(' ');
                        if(parts.length!=3)
                        {
                            console.debug("SivIf no valido:"+attr);
                            return;
                        }
                        this.origDisplay=node.css("display");
                        this.pathRoot=pathRoot;
                        this.context=contextObj;
                        this.operator=parts[1];
                        this.source=parts[0];
                        this.compareTo=parts[2];
                        this.node = node;
                        var newListener=new Siviglia.model.Listener(this, "value", caller, pathRoot, contextObj, this.source);
                        this.listener=newListener;
                        this.dontRecurse=false;
                        pathRoot.getPath(this.source, newListener, contextObj);

                        return this.dontRecurse;
                    },
                    onListener: function () {
                        this.removeContent();
                        var val = this.listener.value;
                        if (!this.testValue(val))
                            this.removeContent();
                        else
                            this.restoreContent();
                    },
                    testValue:function(val)
                    {

                        return ((val == null || val == "") && this.compareTo == "null")
                            ||
                            (this.operator=="==" && val.toString() == this.compareTo)
                            ||
                            (this.operator=="!=" && val.toString() != this.compareTo);
                    },
                    restoreContent:function()
                    {
                        //var newRoot = new Siviglia.model.PathRoot();
                        this.oManager = new Siviglia.UI.Dom.Expando.ExpandoManager(this.pathRoot, this.context);
                        //this.oManager.context = {}; // this.context;
                        var curNode;
                        for (var j = 0; j < this.origHTML.length; j++) {
                            curNode = this.origHTML[j].cloneNode(true);
                            this.oManager.parse([curNode], this.listener.caller, true, true);
                            this.node.append(curNode);
                        }
                        this.node.css("display",this.origDisplay);
                        this.dontRecurse=false;
                    },
                    removeContent:function()
                    {
                        this.node[0].innerHTML = "";
                        if (this.oManager) {
                            this.oManager.destruct();
                        }
                        this.node.css("display","none");
                        this.dontRecurse=true;
                    },
                    onPathNotFound:function(path)
                    {
                        if(!this.listener)
                            return;
                        if(this.operator=="==" &&  this.compareTo == "null")
                            this.restoreContent();
                        else
                            this.removeContent();
                    }
                }
            },
            ClassExpando: {
                inherits: "Expando",
                construct: function () {
                    this.Expando("sivClass");
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        var attr = node[0].getAttribute("orClass");
                        if (attr == null) {

                            var oClass = node[0].className;
                            if (!oClass)oClass = "";
                            node[0].setAttribute("orClass", oClass);
                        }

                        return this.Expando$_initialize(node, nodeManager, pathRoot, contextObj, caller);

                    },
                    onListener: function () {
                        var oClass = this.node[0].getAttribute("orClass");
                        this.node[0].className = oClass + " " + this.listener.value;
                    },
                    reset: function () {
                        var oClass = this.node[0].getAttribute("orClass");
                        this.node[0].className = oClass;
                    }
                }
            },
            DojoExpando: {
                inherits: "Expando",
                construct: function () {
                    this.widgets = [];
                    this.Expando("sivDojo");

                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        return this.Expando$initialize(node, nodeManager, pathRoot, contextObj, caller);
                    },
                    onListener: function () {
                        var m = this;
                        var params = $(this.node).data("params");
                        require([this.listener.value], function (view) {
                            var newDiv = document.createElement("div");
                            var v = new view(params, null);
                            v.placeAt(newDiv);
                            m.node.append(newDiv);
                            m.widgets.push(v);
                        })

                    },
                    reset: function () {
                        for (var k = 0; k < this.widgets.length; k++)
                            this.widgets[k].destroyRecursive(false);
                        this.widgets = [];
                    }
                }
            },
            EventExpando: {
                inherits: "Expando",
                construct: function () {
                    this.Expando("sivEvent");
                },
                destruct: function () {
                    this.reset();
                    this.node.unbind();

                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        this.node = node;
                        var f = null;
                        var functions = [];
                        var attr = node[0].getAttribute(this.expandoTag);
                        var callback = node[0].getAttribute("sivCallback");
                        if (callback) {
                            node.data("event_caller", caller);
                            node.data("event_method", callback);
                            f = function (event) {
                                var caller = $(this).data("event_caller");

                                var paramObj = $(this).data("params");
                                var params = [];
                                var k;
                                params.push($(this));
                                /*for(k in paramObj)
                                 params.push(paramObj[k]);*/
                                params.push(paramObj);
                                var method = $(this).data("event_method");
                                if (caller.invoke)
                                    return caller.invoke(method, params, event);
                                else
                                    return caller[method].apply(caller, params, event);
                            }
                            functions.push(f);
                            this.node = node;
                        }
                        var firedState = node[0].getAttribute("fireState");
                        if (firedState) {
                            this.node.data("firedState", firedState);
                            var eventTarget = node[0].getAttribute("eventTarget");
                            if (eventTarget)
                                this.node.data("eventTarget", eventTarget);

                            f = function () {
                                var expando = $(this).data("sivEvent");
                                var target = $(this).data("eventTarget");
                                var parentNode = expando.findViewStateRoot(target);
                                var exp = $(parentNode).data("sivState");
                                //console.debug("FIRING STATE::"+$(this).data("firedState"));
                                // La siguiente llamada hace que se actualize la variable "al otro lado" del listener.
                                // Es decir, la apuntada por el contexto.
                                var val = $(this).data("firedState");
                                exp.listener.__widgetToCaller(val);
                                exp.setState(val);
                            }
                            functions.push(f);

                        }
                        if (functions.length) {
                            // Los nombres de callbacks son los mismos que en jQuery
                            $(node).off(attr);
                            var i = 0;
                            for (i; i < functions.length; i++) {
                                $(node).on(attr, functions[i]);
                            }
                        }
                        return this.Expando$_initialize(node, nodeManager, pathRoot, contextObj, caller);
                    },
                    findViewStateRoot: function (target) {
                        var node = this.node[0];
                        while (node && node.tagName && node.tagName != "body") {
                            if ($(node).data("sivState")) {
                                if (target) {
                                    if (node.getAttribute("sivAlias") == target)
                                        return node;
                                }
                                else
                                    return node;
                            }
                            node = node.parentNode;
                        }
                        if (!node || node.tagName == "body") {
                            alert("No se encuentra target de fireState");
                            return null;
                        }
                        return node;
                    },
                    onListener: function () {
                    },
                    reset: function () {
                        var attr = this.node[0].getAttribute(this.expandoTag);
                        if (attr)this.node.unbind(attr);
                    }
                }
            },
            ParamsExpando: {
                inherits: "Expando",
                construct: function () {
                    this.Expando("sivParams");
                },
                destruct:function(){

                    var nListeners = this.listeners.length;
                    var index;
                    for (var k = 0; k < nListeners; k++) {
                        this.listeners[k].l.destruct();
                    }
                    this.controller=null;
                    this.listeners=[];
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        this.node = node;
                        var attr = node[0].getAttribute(this.expandoTag);
                        if (attr.substr(0, 1) != "{")
                            attr = "{" + attr + "}";
                        //this.params=jsonlite.parse(attr);
                        this.params = jQuery.parseJSON(attr);

                        this.listeners = [];

                        this.path_recursive(this.params, this.params, 0, node, nodeManager, pathRoot, contextObj, caller);
                        // los parametros se almacenan en el nodo.Por lo tanto, el tag sivParams debe ser de los primeros que se
                        // parseen, antes de cualquier otro que los quiera utilizar.
                        this.node.data("params", this.params);
                        this.node.data("paramsExpando", this);
                        return true;

                    },
                    path_recursive: function (el, parentEl, idx, node, nodeManager, pathRoot, contextObj, caller) {

                        if (Object.prototype.toString.call(el) === '[object Array]') {
                            for (idx = 0; idx < el.length; idx++)
                                el[idx] = this.path_recursive(el[idx], el, idx, node, nodeManager, pathRoot, contextObj, caller);

                            return el;
                        }
                        if (el === null)
                        {
                            return null;
                        }
                        if (el instanceof Object) {
                            for (idx in el)
                                el[idx] = this.path_recursive(el[idx], el, idx, node, nodeManager, pathRoot, contextObj, caller);

                            return el;
                        }
                        if (el.toString().substr(0, 1) == "/") {
                            var newListener = new Siviglia.model.Listener(this, "param", caller, pathRoot, contextObj, el);
                            this.listeners.push({
                                p: parentEl,
                                i: idx,
                                l: newListener
                            });
                            var nVal = pathRoot.__getPath(pathRoot, el.split("/"), 0, contextObj, caller, newListener);
                            return newListener.value;
                        }
                        return el;
                    },
                    setController: function (obj) {
                        this.controller = obj;
                    },
                    onListener: function () {
                        var nListeners = this.listeners.length;
                        this.paramValues={};
                        for (var k = 0; k < nListeners; k++) {
                            var cl = this.listeners[k];
                            cl.p[cl.i] = this.listeners[k].l.value;
                            this.paramValues[cl.i]=this.listeners[k].l.value;
                            //index=this.listeners[k].i;
                            //this.params[index]=this.listeners[k].l.value;
                            if (this.controller && this.controller.viewObject) {
                                for (var j in this.params)
                                    this.controller.viewObject[j] = this.params[j];
                            }
                        }

                        if (this.node) {
                            this.node.data("params", this.params);
                        }

                        if (this.controller) {
                            this.controller.reset();
                        }
                    },
                    getValues:function()
                    {
                        return this.paramValues;
                    },
                    reset: function () {
                        var attr = this.node[0].getAttribute(this.expandoTag);
                        if (attr)this.node.unbind(attr);
                    }
                }

            },

            StateExpando: {
                inherits: "Expando",
                construct: function () {
                    this.oManager = null;
                    this.Expando("sivState");
                    this.caller = null;
                    this.innerManager = null;
                    this.parsed = false;
                },
                destruct: function () {
                    if (this.innerManager) {
                        this.innerManager.destruct();
                        this.innerManager = null;
                    }
                    if (this.oManager) {
                        this.oManager.destruct();
                        this.oManager = null;
                    }
                    this.Expando$destruct();
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {


                        //console.debug("INICIALIZANDO ESTADO "+node[0].className);
                        this.caller = caller;
                        var k;

                        for (k = 0; k < node[0].childNodes.length; k++) {
                            if (node[0].childNodes[k].tagName)
                                node[0].childNodes[k].style.display = 'none';
                        }

                        //this.oManager=new Siviglia.UI.Dom.Expando.ExpandoManager(nodeManager.pathRoot,nodeManager.contextObj);                                               
                        this.oManager = new Siviglia.UI.Dom.Expando.ExpandoManager(pathRoot, contextObj);
                        this.context = contextObj;

                        var childNodes = node[0].childNodes;
                        var nChildNodes = childNodes.length;
                        var stateVal = null;
                        var curNode;
                        //console.debug("ESTADO:"+val);
                        for (var i = 0; i < nChildNodes; i++) {
                            curNode = null;
                            tempNode = childNodes[i];
                            if (!childNodes[i].tagName)continue;
                            stateVal = tempNode.getAttribute("onState");
                            tempNode.setAttribute("origHTML", tempNode.innerHTML)
                        }

                        this.pathRoot = pathRoot;
                        this.context = contextObj;
                        this.node = node;
                        this.Expando$_initialize(node, nodeManager, pathRoot, contextObj, caller);
                        /*if(!this.curState)
                         this.setState("default");
                         */

                        return false;
                    },
                    onListener: function () {
                        this.setState(this.listener.value);
                    },
                    setState: function (val) {
                        if (this.oManager) {
                            this.oManager.destruct();
                        }
                        this.oManager = new Siviglia.UI.Dom.Expando.ExpandoManager(this.pathRoot, this.context);
                        this.oManager.context = this.context;

                        this.curState = val;

                        var i = 0, j = 0;
                        var childNodes = this.node[0].childNodes;
                        var nChildNodes = childNodes.length;
                        var stateVal = null;
                        var curNode;
                        //console.debug("ESTADO:"+val);
                        for (i; i < nChildNodes; i++) {
                            curNode = null;
                            tempNode = childNodes[i];
                            if (!childNodes[i].tagName)continue;

                            stateVal = tempNode.getAttribute("onState");

                            if (!stateVal) {
                                curNode = tempNode;
                            } else {
                                var tmpStateVal = stateVal.split(',');
                                for (j = 0; j < tmpStateVal.length; j++) {
                                    if (tmpStateVal[j] == val) {
                                        curNode = tempNode;
                                        break;
                                    }
                                }
                            }
                            if (curNode) {
                                var origHTML = curNode.getAttribute("origHTML").replace(/^\s+/g, '');
                                var p = document.createElement("div");
                                p.innerHTML = origHTML;
                                p.setAttribute("onState", curNode.getAttribute("onState"));
                                p.setAttribute("origHTML", origHTML);
                                this.oManager.parse($(p), this.listener.caller, true, true);
                                p.style.display = 'block';
                                curNode.parentNode.replaceChild(p, curNode);
                            }
                            else
                                tempNode.style.display = 'none';
                        }
                        if (this.caller && this.caller.fireEvent)
                            this.caller.fireEvent(val, this);
                    }

                }

            },
            ExpandoManager: {
                construct: function (pathRoot, contextObj) {
                    this.pathRoot = pathRoot;
                    this.context = contextObj;
                    this.expandos = [];
                    this.destroyed = true;
                    if(!Siviglia.isset(Siviglia.__expandoCount))
                        Siviglia.__expandoCount=0;
                    this.eid=Siviglia.__expandoCount;
                    console.log("CREANDO EXPANDOMANAGER CON EID:"+this.eid);
                    Siviglia.__expandoCount++;
                },
                destruct: function () {
                    //console.debug("******DESTROYING EXPANDOS");
                    this.destroyExpandos();
                    this.pathRoot = null;
                    this.expandos = null;
                    console.log("DESTROYING EXPANDO "+this.eid);
                },
                methods: {
                    parse: function (htmlNode, caller, removeAttr, keepObjects) {
                        if (this.expandos.length > 0 && !keepObjects) {
                            this.destroyExpandos();
                            this.expandos = [];
                        }
                        var manager = this;
                        var k;
                        var views = [];
                        for (k = 0; k < htmlNode.length; k++) {

                            if (htmlNode[k].nodeType == 3 || htmlNode[k].nodeType == 8) // TEXT -- HTML Comment
                            {
                                continue;
                            }
                            //if(htmlNode[k].getAttribute("SivigliaParsed"))continue;


                            Siviglia.Utils.recurseHTML(htmlNode[k],
                                function (node) {
                                    var k, attr;
                                    var retValue = true;
                                    if(node.getAttribute("sivId"))
                                    {
                                        var cWidget=Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgetStack.pop();
                                        var target=cWidget;
                                        if(cWidget!=cWidget.viewObject)
                                            target=cWidget.viewObject;

                                        target[node.getAttribute("sivId")]=$(node);
                                        Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgetStack.push(cWidget);
                                    }
                                    for (k in manager.installedExpandos) {
                                        if (!node.getAttribute) {
                                            //console.dir(node);
                                            break;
                                        }

                                        attr = node.getAttribute(k);
                                        if (attr) {

                                            if (k == "sivView") {
                                                views.push(node);

                                                continue;
                                            }

                                            var curExpando = $(node).data();
                                            if (curExpando["expando_" + attr]) {
                                                curExpando["expando_" + attr].onListener();
                                                return false;
                                            }
                                            else {
                                                retValue =  manager.addExpando(node, manager.installedExpandos[k], caller) && retValue;
                                            }
                                            /*if(removeAttr)
                                             node.removeAttribute(k);*/
                                        }
                                    }
                                    return retValue;
                                });
                            // Se parsean ahora las vistas.

                        }
                        for (var k = views.length - 1; k >= 0; k--) {
                            if ($(views[k]).data("parsed"))
                                continue;
                            manager.addExpando(views[k], 'ViewExpando', caller);
                            if (removeAttr)
                                views[k].removeAttribute('sivView');
                        }
                        return false;
                    },
                    addExpando: function (node, expType, caller) {
                        var newExpando = new Siviglia.UI.Dom.Expando[expType]();
                        var result = newExpando._initialize($(node), this, this.pathRoot, this.context, caller);
                        this.expandos.push(newExpando);
                        $(node).data("expando_" + expType, newExpando);
                        //node.setAttribute("expando_"+expType,newExpando);
                        return result;
                    },
                    resetExpandos: function () {
                        var k;
                        for (k = 0; k < this.expandos.length; k++)
                            this.expandos[k].reset();
                    },
                    destroyExpandos: function () {
                        var k;
                        if (!this.expandos)return;
                        for (k = 0; k < this.expandos.length; k++)
                            this.expandos[k].destruct();
                    },
                    updateExpandos: function () {
                        var k;
                        if (!this.expandos)return;

                        for (k = 0; k < this.expandos.length; k++) {
                            if (this.expandos[k].listener) {
                                this.expandos[k].listener.onChange();
                            }
                        }
                    }
                }
            }

        }
    }


);

Siviglia.Utils.buildClass(
    {
        context: 'Siviglia.UI.Dom.Expando',
        classes: {
            WidgetExpando: {
                inherits: 'Expando',
                construct: function () {
                    this.Expando("sivWidget");
                    if (!Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgets) {
                        Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgets = {};
                        Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgetStack = [];
                    }
                },
                destruct: function () {
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        this.caller = caller;
                        var k;
                        this.widgetName = node.attr("sivWidget");
                        this.widgetNode = node[0];
                        this.widgetCode = node.attr("widgetCode");
                        if (this.widgetCode) {
                            var codeClass = Siviglia.Utils.stringToContextAndObject(this.widgetCode);
                            codeClass.context[codeClass.object].prototype.__widgetObject = this;
                        }

                        this.widgetParams = node.attr("widgetParams");
                        Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgets[this.widgetName] = this;
                        this.context = contextObj;
                        this.pathRoot = pathRoot;
                        node.removeAttr("sivWidget");
                        //node[0].parentNode.removeChild(node[0]);                        
                        //this.Expando$initialize(node,nodeManager,pathRoot,contextObj,caller);
                        return false;
                    },
                    onListener: function () {
                    },
                    getNode: function () {
                        return $(this.widgetNode).clone(true);
                    },
                    getControllerInstance: function (view) {
                        if (this.widgetCode) {
                            var c = Siviglia.Utils.stringToContextAndObject(this.widgetCode);

                            return new c.context[c.object](view.widgetName, view.params, view.nodeParams, null, view.pathRoot, view);
                        }
                        return null;
                    },
                    getInstance: function () {
                        return new Siviglia.UI.Dom.Expando.ViewExpando(this.widgetName);
                    },
                    notifyPathListeners:function()
                    {
                        Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgetStack.push(this);
                        this.PathListener$notifyPathListeners();
                        Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgetStack.pop();
                    }
                }
            },
            WidgetFactory: {
                construct: function () {
                },
                methods: {
                    getInstance: function (widgetName) {
                        var lib = Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgets;
                        if (!lib || !lib[widgetName]) return null;
                        return lib[widgetName]
                    }
                }
            },
            WidgetNodeExpando: {
                inherits: 'Expando',
                construct: function () {
                    this.Expando("widgetNode");
                    this.view = null;
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        var nodeAlias = node[0].getAttribute("widgetNode");
                        if (caller.nodeParams) // caller debe ser un ViewExpando
                        {
                            var v = caller.nodeParams[nodeAlias];

                            if (v) {
                                if (typeof v == "string")
                                    node[0].html(v);
                                else {
                                    node.append(v);
                                }
                            }
                        }
                        return false;
                    }
                }
            },
            ViewExpando: {
                inherits: 'Expando,Siviglia.model.PathListener',
                construct: function (widgetName) {
                    this.Expando("sivView");
                    this.widgetRoot = null;
                    this.widgetName = widgetName || null;
                    this.subViews = [];
                    if(!Siviglia.isset(Siviglia.__viewCounter))
                        Siviglia.__viewCounter=0;
                    this.eid=Siviglia.__viewCounter;
                    Siviglia.__viewCounter++;
                    console.log("Creada vista con id:"+this.eid);
                },
                destruct: function () {
                    this.destroyed=true;
                    console.log("Destruyendo vista con id:"+this.eid);
                    if(this.resultPromise && this.resultPromise.state=="pending")
                        this.resultPromise.reject();
                    if (this.oManager) {
                        this.oManager.destruct();
                    }
                    this.Expando$destruct();
                    this.rootNode.remove();
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        this.pathRoot = pathRoot;
                        this.context = contextObj;
                        this.rootNode = node;
                        this.nodeManager = nodeManager;
                        this.caller = caller;
                        // En caso de que tengamos un id, al padre mapeamos la instancia de View, no el nodo.
                        if(node[0].getAttribute("sivId"))
                        {
                            var parent=Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgetStack.pop()
                            if(parent)
                                parent[node[0].getAttribute("sivId")]=this;
                        }
                        // Si ya tenemos un viewObject, es porque se nos ha creado desde js, en vez de desde html.
                        if (!this.viewObject) {

                            this.params = node.data("params") || {};
                            if (node.data("params")) {
                                node.data("paramsExpando").setController(this);
                            }
                            this.widgetName = node.attr("sivView");


                            this.nodeParams = {};
                            var curChild;
                            var att;
                            for (k = 0; k < node[0].childNodes.length; k++) {
                                curChild = node[0].childNodes[k];
                                if (curChild.tagName) {
                                    att = curChild.getAttribute("viewNode");
                                    if (att) {
                                        this.nodeParams[att] = $(curChild);
                                    }
                                }
                            }

                        }
                        if(caller && caller.addSubView)
                            this.parentWidget = caller;
                        this.reset();


                        return false;
                    },
                    reset: function () {
//                    this.rootNode.html("");
                        if (this.widgetName.substr(0, 1) == "/") {
                            this.listener = new Siviglia.model.Listener(this, "value", this.caller, this.pathRoot, this.context, "sivView");
                            this.widgetName = this.pathRoot.__getPath(this.pathRoot, this.widgetName.split("/"), 0, this.context, this, this.listener);
                        }
                        /**************/
                        var r=this.attach(this.caller, this.rootNode, this.params, this.nodeParams, this.pathRoot, this.context);
                    },
                    onChange: function () {
                    },
                    setViewObject: function (v, params, nodeParams) {
                        this.viewObject = v;
                        this.params = params;
                        this.nodeParams = nodeParams;
                    },
                    attach: function (caller, node, params, widgetParams, pathRoot, contextObj) {


                        var widgetFactory = new Siviglia.UI.Dom.Expando.WidgetFactory();
                        var widgetInstance = widgetFactory.getInstance(this.widgetName);
                        if (!this.viewObject)
                            this.viewObject = widgetInstance.getControllerInstance(this);

                        if (params) {
                            for (k in params) {
                                contextObj[k] = params[k];
                            }
                        }

                        this.nodeParams = widgetParams;

                        if (!this.viewObject)
                            this.viewObject = new Siviglia.model.PathListener();

                        this.oManager = new Siviglia.UI.Dom.Expando.ExpandoManager(pathRoot, contextObj);
                        console.log(" Widget creando manager con id "+this.oManager.eid);
                        if (this.nodeParams) {
                            var p = {};

                            for (var k in this.nodeParams) {
                                if (typeof this.nodeParams[k] == 'string')
                                    p[k] = $('<div>' + this.nodeParams[k] + '</div>');
                                else {
                                    p[k] = $(this.nodeParams[k]);//.clone(true);
                                    //$(this.nodeParams[k]).data("ORIGINAL",1);
                                    //p[k].data("ORIGINAL",2);
                                }
                                //this.oManager.parse(p[k],caller,true,true);
                                p[k].attr("noparse", 1);
                            }
                            this.nodeParams = p;

                        }
                        if (!this.viewObject.nodes)
                            this.viewObject.nodes = this.nodeParams;
                        for (var j in params) {
                            this.viewObject[j] = params[j];
                        }
                        this.resultPromise=$.Deferred();
                        this.resultPromise.resolve();
                        if (this.viewObject.preInitialize && !this.preInitialized) {
                            this.preInitialized = true;
                            var result=this.viewObject.preInitialize(params);
                            if(result && result.then)
                                this.resultPromise=result;
                        }
                        var m=this;
                        console.log("Pidiendo promesa para la vista con id:"+this.eid);
                        this.resultPromise.then(
                            function(v){
                                if(m.destroyed)
                                    return;
                                console.log("Ejecutando promesa de la vista con id:"+m.eid);
                                m.afterPreInitialize(widgetInstance,caller, node, params, widgetParams, pathRoot, contextObj);
                                if (m.viewObject && m.viewObject.initialize) {
                                    m.viewObject.initialize(m.params);
                                }
                            }
                        )
                        return this.resultPromise;

//                    this.rootNode.html("");


                    },
                    afterPreInitialize:function(widgetInstance,caller, node, params, widgetParams, pathRoot, contextObj,promiseVal)
                    {
                        this.Expando$_initialize(node, this.oManager, pathRoot, contextObj, caller);
                        this.widgetRoot = widgetInstance.getNode();

                        if (this.parentWidget) {
                            this.parentWidget.addSubView(this);
                        }
                        // Si estoy en una vista instansciada desde otra, el caller es la vista instansciada.
                        var nodeParent = this.widgetRoot.parentNode;
                        if (nodeParent)
                            var nodeNext = this.widgetRoot.nextSibling;

                        Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgetStack.push(this);
                        this.oManager.parse($(this.widgetRoot), this, true, true);
                        Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgetStack.pop();
                        if (nodeParent)
                            nodeParent.insertBefore(this.widgetRoot, nodeNext);
                        node.html("");
                        node.append(this.widgetRoot);
                        var self=this;
                        $("[sivMapped]",node).each(function(i,n){
                            self.viewObject.nodes[$(n).attr("sivMapped")]=$(n);
                        })
                        node.data("parsed", 1);
                    },
                    addSubView: function (v) {
                        this.subViews.push(v);
                    },
                    getRootWidget: function () {
                        if (this.parentWidget == null)
                            return this;
                        return this.parentWidget.getRootWidget();
                    },
                    invoke: function (method, params) {
                        if (this.viewObject) {
                            this.viewObject[method].apply(this.viewObject, params);
                        }
                    },
                    get: function (varName) {
                        return this[varName];
                    },
                    onListener: function () {
                    }

                }
            }
        }
    });


/*
 Instalacion de gestores de expandos 

 */

Siviglia.UI.Dom.Expando.ExpandoManager.prototype.installedExpandos = {
    'sivValue': 'ValueExpando',
    'sivClass': 'ClassExpando',
    'sivLoop': 'LoopExpando',
    'sivIf':'IfExpando',
    'sivEvent': 'EventExpando',
    'sivParams': 'ParamsExpando',
    'sivState': 'StateExpando',
    'sivWidget': 'WidgetExpando',
    'sivView': 'ViewExpando',
    'widgetNode': 'WidgetNodeExpando',
    'sivCss':'CssExpando',
    'sivAttr':'AttrExpando',
    'sivCall': 'CallExpando',
    'sivDojo': 'DojoExpando'
};

/**
 *  Objetos de modelo relacionados con el recorrido de objetos
 *  usando paths.
 *  Contexto almacena valores a los que se puede hacer
 *  referencia dentro de un path.
 *  PathResolver es el root de los paths, y al que se
 *  le agregan objetos hijos como hojas del arbol.
 *  Listener es el objeto "token" que liga a los objetos del UI
 *  con los objetos del modelo, y envia la senial
 *  correspondiente al UI cuando el modelo cambia.
 *  PathListener es el objeto del que derivan los objetos
 *  modelo que vayan a formar parte de los paths, y almacena los
 *  listeners a notificar en caso de cambio.
 *
 */

Siviglia.Utils.buildClass(
    {
        context: "Siviglia.model",
        classes: {
            Context: {
                methods: {
                    get: function (propName) {
                        return this[propName];
                    }
                }
            },
            Listener: {
                construct: function (parentObject, tag, caller, pathRootObject, context, path) {
                    //console.debug("CONSTRUIDO LISTENER");
                    this.initialized = false;
                    this.parentObject = parentObject;
                    this.tag = tag;
                    this.caller = caller;
                    this.pathRootObject = pathRootObject;
                    this.obj = pathRootObject;
                    this.index = 0;
                    this.context = context;
                    this.path = path.split("/");
                    this.contextual=0;
                },

                destruct: function () {
                    //console.debug("DESTRUIDO LISTENER");
                    if (!this.initialized)return;
                    if (this.obj) {
                        var p = this.obj;
                        this.obj = null;
                        if (p.removePathListener) // Si deriva de PathListener
                            p.removePathListener(this);
                    }
                    if (this.caller) {
                        var p = this.caller;
                        this.caller = null;
                        if (p.removePathListener) {
                            p.removePathListener(this);
                        }
                    }
                    // No se debe destruir el Expando asociado?
                },
                methods: {
                    setAsContextual:function()
                    {
                        this.contextual=1;
                    },
                    setPath: function (path, index, obj, context) {
                        if (!this.initialized && obj.addPathListener && obj.onListener && !this.noNotify && !this.contextual)
                            obj.addPathListener(this);
                        this.initialized = true;
                        this.resolvedObject = obj;
                        // To be optimized out:
                        var prop = path[1];
                        var firstChar = prop.substr(0, 1);
                        this.noNotify = false;
                        if (firstChar == '@' || firstChar == '$' || firstChar == '%') {
                            prop = prop.substr(1);
                            if (firstChar == '@') {
                                this.noNotify = true;
                            }
                        }
                        this.resolvedProperty = prop;
                        //this.path=path;
                        this.index = 0;
                        //this.pathRootObject=obj;
                        //this.obj=obj;
                        this.context = context;
                        this.initialized = true;

                    },
                    setValue: function (val) {

                            this.value = val;
                            if(this.parentObject && this.parentObject.onListener) 
                                this.parentObject.onListener(this, this.tag);
                            return val;

                    },
                    getValue: function (val) {
                        return this.value;
                    },
                    // LLamado por stateExpando cuando el cambio de estado se ha producido por un fireState.
                    // Sirve para actualizar el valor del elemento del path que define el estado.
                    __widgetToCaller: function (val) {
                        this.resolvedObject[this.resolvedProperty] = val;
                    },
                    onChange: function () {
                        if (this.noNotify == true)
                            return;
                        if (this.parentObject.expandoTag != "sivParams" && this.parentObject.node == null) {
                            this.destruct();
                        }
                        else
                            this.pathRootObject.__getPath(this.obj, this.path, this.index, this.context, this.pathRootObject, this);
                    },
                    invoke: function (callback, params) {
                        if (this.caller && this.caller[callback]) {
                            this.caller[callback].apply(this.caller, params);
                        }
                    },
                    isInitialized:function()
                    {
                        return this.initialized;
                    }
                }
            },

            PathResolver: {
                inherits: "Siviglia.model.PathListener",
                methods: {
                    addNode: function (elem, path) {
                        this[path] = elem;
                    },
                    
                    getPath: function (str, listener, context) {
                        if (str.substr(0, 1) != '/') return listener.setValue(str);
                        // Se buscan los subPaths.Estos subPaths NO son dinamicos.Se resuelven estaticamente.
                        var m=this;
                        str=str.replace(/{\%(.*?)%}/g,function(a,b){
                            // Ojo, no se pasa un listener
                            var subPath=b;
                            return m.__getPath(listener.pathRootObject, subPath.split("/"), 0, context, this, null);
                        });

                        //return this.__getPath(Siviglia.model.Root,str.split("/"),0,context,this,listener);
                        return this.__getPath(listener.pathRootObject, str.split("/"), 0, context, this, listener);
                    },
                    onPathNotFound: function (obj, path, index, context, currentObject, listener) {
                        if (listener) {

                            // Comprobacion de si existe un valor por defecto.
                            var v = path[path.length - 1];
                            if (v.substr) {
                                var defPos = v.indexOf("?");
                                if (defPos != -1) {
                                    var defValue = v.substr(defPos + 1);
                                    listener.setValue(defValue);

                                    return;
                                }
                            }

                            if(currentObject && currentObject.onPathNotFound && currentObject.onPathNotFound!=this.onPathNotFound)
                            {
                                return currentObject.onPathNotFound(obj?obj:currentObject,path,obj?index:index-1,context,currentObject,listener);
                            }
                            else
                            {

                                if (listener.parentObject.onPathNotFound)
                                    listener.parentObject.onPathNotFound();
                            }

                            return listener.pathRootObject.onNotFound(obj ? obj : currentObject, path, obj ? index : index - 1, context, currentObject, listener);
                            // listener.setValue("NOT FOUND :/"+path.join("/")+" idx:"+index);
                        }
                        else
                            return "NOT FOUND";
                    },
                    __getPathProperty: function (path, index, context, currentObject, listener, index) {
                        var prop = path[index + 1];
                        var cI = prop;
                        if (cI.substr) {
                            var defPos = cI.indexOf("?");
                            if (defPos != -1) {
                                prop = cI.substr(0, defPos);
                                defCi = cI.substr(defPos + 1);
                            }
                        }

                        if (prop.substr(0, 1) == "@") {
                            if (listener.caller)
                                propName = listener.caller[prop.substr(1)];
                            if (!propName) {
                                propName = context.get(prop.substr(1));
                            }
                        }
                        else
                            propName = prop;

                        var type = typeof this[propName];
                        if (type == "number" || type == "string" || type == "function") {
                            var val = (type == "function" ? this[propName]() : this[propName]);

                            if (listener) {
                                listener.setValue(val);
                                if (!listener.initialized) {

                                    listener.setPath(path, index, currentObject, context);
                                    //currentObject.addPathListener(listener);
                                }
                            }
                            return val;
                        }

                        return this.__getPath(this[propName], path, index + 1, context, currentObject, listener);
                    },
                    __getPath: function (obj, path, index, context, currentObject, listener) {
                        if (!index)index = 0;

                        if (typeof obj == "undefined") {
                            return this.onPathNotFound(obj, path, index, context, currentObject, listener);
                        }

                        if (index + 1 == path.length) {
                            if (listener) {
                                if (!listener.initialized) {
                                    listener.setPath(path, index, currentObject.viewObject || currentObject, context);
                                }
                                listener.setValue(obj);
                            }
                            return obj;
                        }


                        var cI = path[index + 1];
                        var defCi;
                        if (cI.substr) {
                            var defPos = cI.indexOf("?");
                            if (defPos != -1) {
                                cI = cI.substr(0, defPos);
                                defCI = cI.substr(defPos + 1);
                            }

                            var c = cI.substr(0, 1);
                            var scI = cI.substr(1);
                            // Si el primer caracter es $, se devuelve el path a partir del objeto/variable/etc
                            // apuntado por la variable de la vista.
                            // Si el primer caracter es %, se devuelve el path contenido en el valor de esa variable

                            var path2 = path.slice(0);
                            if ((c == "*" || c == "%") && listener && listener.caller && listener.caller.viewObject){
                                    var v = listener.caller;

                                    /*


                                path2[index + 1] = v1;
                                var n = this.__getPath(v.viewObject, path2, index, context, v.viewObject, listener);
                                listener.setPath(path, index, currentObject, context);
                                */

                                var n = this.__getPath(listener.caller.viewObject[scI], path, index + 1, context, listener.caller.viewObject, listener);
                                if (c == "%") {
                                    obj.addPathListener(listener);
                                    return listener.pathRootObject.getPath(n, listener, context);
                                }
                                return n;

                            }
                            // Si el primer caracter es @, se busca en el contexto.
                            if (c == "@") {
                                listener && listener.setAsContextual();
                                var vOnListener = null;
                                var tempObj = context;
                                path2[index + 1] = cI.substr(1);
                                if (typeof tempObj[path2[index + 1]] == "undefined") {
                                    if (typeof defCI == "undefined") {
                                        if (listener)
                                        {
                                            // Si un listener depende de una variable de contexto, que en su momento
                                            // existio, pero que ahora no existe, entonces, no cambia de valor.
                                            // Retorna su valor anterior.Es una especie de "closure".
                                            if(listener.isInitialized)
                                            {
                                                return listener.getValue();
                                            }
                                        }
                                            return this.onPathNotFound(obj, path, index, context, currentObject, index);
                                        return "NOT FOUND";
                                    }
                                    else {
                                        if (listener)
                                            listener.setValue(defCI);
                                        return defCI;
                                    }
                                }
                                var type = typeof tempObj[path2[index + 1]];

                                // En caso de que el elemento del contexto sea el ultimo elemento del path
                                if (path.length == index + 2 ) {
                                    if(listener) {
                                        listener.setValue(tempObj[path2[index + 1]]);
                                        listener.setPath(path, index, currentObject, context);
                                    }
                                    return tempObj[path2[index + 1]];
//                                    if (!listener.initialized) {
//                                        currentObject.addPathListener(listener);
//                                    }
                                }

                                if (!(type == "number" || type == "string")) {
                                    index++;
                                        obj = tempObj[path2[index]];
                                }
                                else {
                                        path[index + 1] = tempObj[path2[index + 1]];
                                }

                                var newVal=this.__getPath(obj, path2, index, context, currentObject, listener, index);
                                    //this.__getPath(tempObj,path2,index,context,currentObject,listener,index);
                                listener && listener.setPath(path, index, currentObject, context);
                                return newVal;
                            }
                            if (c == "#") {
                                var contVal;
                                if (context.get)
                                    contVal = context.get(path[index + 1].substr(1));
                                else
                                    contVal = context[path[index + 1].substr(1)];
                                if (listener) {
                                    listener.setValue(contVal);
                                    if (!listener.initialized) {
                                        listener.setPath(path, index, currentObject, context);
                                        //currentObject.addPathListener(listener);
                                    }
                                }

                                return contVal;
                            }
                        }

                        if (obj.__construct) {
                            // Es un objeto "nuestro"
                            var propName = null;
                            if (obj.notifyPathListeners) {
                                currentObject = obj;
                                index = index;
                            }
                            if (obj.__getPathProperty) {
                                return obj.__getPathProperty(path, index, context, currentObject, listener, index);
                            }

                            if (path[index + 1].substr(0, 1) == "@") {
                                if (listener.caller)
                                    propName = listener.caller[path[index + 1].substr(1)];
                                if (!propName) {
                                    propName = context.get(path[index + 1].substr(1));
                                }
                            }
                            else
                                propName = path[index + 1];

                            var type = typeof obj[propName];
                            if (type == "number" || type == "string" || type == "function") {
                                var val = (type == "function" ? obj[propName]() : obj[propName]);

                                if (listener) {
                                    listener.setValue(val);
                                    if (!listener.initialized) {

                                        listener.setPath(path, index, currentObject, context);
                                        // currentObject.addPathListener(listener);
                                    }
                                }
                                return val;
                            }
                            else {
                                return this.__getPath(obj[propName], path, index + 1, context, currentObject, listener);
                            }
                        }


                        var type = typeof obj[path[index + 1]];

                        if (type == "number" || type == "string" || type == "function") {
                            var val = (type == "function" ? obj[path[index + 1]]() : obj[path[index + 1]]);

                            if (listener) {
                                if (!listener.initialized)
                                listener.setPath(path, index, currentObject, context);
                                listener.setValue(val);

                            }
                            return val;
                        }
                        else {

                            return  this.__getPath(obj[path[index + 1]], path, index + 1, context, currentObject, listener);
                        }
                    }
                }
            }
        }
    });

/* Implementacion simple de una PathRoot */
Siviglia.Utils.buildClass(
    {
        context: 'Siviglia.model',
        classes: {
            PathRoot: {
                inherits: "Siviglia.model.PathResolver",
                construct: function () {
                    this.context = new Siviglia.model.Context();
                    this.unresolvedPaths = [];
                },
                methods: {
                    parseString:function(str,tag)
                    {
                        if(str.toString().substr(0,1)!="/") 
                            return str;
                        var listener = new Siviglia.model.Listener(this, tag, this, this,this.context, str);
                        return this.getPath(str, listener, this.context);

                    },
                    onNotFound: function (obj, path, index, context, currentObject, listener) {
                        if (this.unresolvingPaths)
                            return null;

                        this.unresolvedPaths.push({obj: obj, path: path, index: index, context: context, currentObject: currentObject, listener: listener});
                        return "NOT FOUND DE PATHROOT";
                    },
                    addElement: function (name, element) {
                        this[name] = element;
                        this.unresolvingPaths = true;
                        for (var k = 0; k < this.unresolvedPaths.length; k++) {
                            var t = this.unresolvedPaths[k];
                            val = this.__getPath(t.obj, t.path, t.index, t.context, t.currentObject, t.listener);
                            if (val) {
                                // Lo borramos de los pending paths
                                this.unresolvedPaths.splice(k, 1);
                            }
                        }
                        this.unresolvingPaths = false;
                    }
                }
            },
            RemotePath: {
                "inherits": 'Siviglia.model.PathRoot',
                construct: function (actionEndPoint) {
                    //this.actionEndPoint='http://127.0.0.1/framework/html';
                    this.actionEndPoint = actionEndPoint;
                    this.PathRoot();
                    this.callStack = [];
                },
                methods: {
                    onNotFound: function (obj, path, index, context, currentObject, listener, savedIndex) {
                        var k;
                        var newPath = [];

                        for (k = 0; k < path.length; k++) {
                            if (path[k][0] == '@')
                                newPath[k] = "" + context[path[k].substr(1)];
                            else
                                newPath[k] = path[k];
                            if (k == path.length - 2) {
                                var subPath = newPath.join("/");
                                if (this.callStack[subPath]) {
                                    this.callStack[subPath].push([obj, path, index, context, currentObject, listener, savedIndex]);
                                    return;
                                }
                                else
                                    this.callStack[subPath] = [arguments];
                            }
                        }
                        var remotePath = newPath.join("/");
                        $.ajax(
                            {url: this.actionEndPoint + remotePath + '?output=json',
                                context: this,
                                async: true,
                                dataType: 'json',
                                type: 'GET',
                                success: function (data, textStatus, jqXHR) {
                                    //console.debug(path);
                                    var lastStep = path.length;
                                    // Si lo que se ha devuelto es un objeto, significa que el ultimo elemento
                                    // del path pedido originalmente, es una propiedad.Por eso, lo que
                                    // se ha recibido, es el objeto que contiene a esa propiedad.
                                    // Por ello, el path a establecer, es el recibido, menos el ultimo elemento (la propiedad).
                                    // ej, si se pidio /usuario/nombre, y se recibe un objeto, significa que se ha recibido /usuario.
                                    if (data.data.DATA.constructor.toString().lastIndexOf("Object"))
                                        lastStep--;
                                    var k;
                                    var curNode = currentObject;
                                    var newNode;
                                    for (k = index + 1; k < lastStep - 1; k++) {
                                        newNode = new Siviglia.model.PathListener();
                                        curNode[newPath[k]] = newNode;
                                        curNode = newNode;
                                    }
                                    curNode[newPath[k]] = data.data.DATA;

                                    var k;

                                    var pending = this.callStack[subPath].slice(0);
                                    delete this.callStack[subPath];

                                    for (k = 0; k < pending.length; k++) {
                                        Siviglia.Dom.getPath(pending[k][0], pending[k][1], pending[k][2], pending[k][3], pending[k][4], pending[k][5], pending[k][6]);
                                    }
                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                }
                            });
                    }

                }
            }
        }
    }
)

Siviglia.Utils.buildClass(
    {
        context: "Siviglia.model",
        classes: {
            RemotePath: {
                "inherits": 'Siviglia.model.PathRoot',
                construct: function (actionEndPoint) {
                    this.actionEndPoint = actionEndPoint;
                    ;
                    this.PathRoot();
                    this.callStack = [];
                },
                methods: {
                    onNotFound: function (obj, path, index, context, currentObject, listener) {
                        var k;
                        var newPath = [];
                        // Resolving a problem:
                        // The problem is: if there are various elements requesting remote paths, which ones
                        // should be remote loaded, and which ones should wait because its results should come
                        // from requests already executing.
                        // Example: requesting /a/1/field1 and /a/1/field2 should make 1 request.
                        // requesting /a/FullList and /a/FullList?param=3 should make 2 requests.
                        // To solve this, we're supposing that anything that's called from a sivLoop,should use the full path.
                        // If not, only up to the n-1 elem.
                        var pathCut = 2;
                        if (listener.parentObject.expandoTag == "sivLoop") pathCut = 1;

                        for (k = 0; k < path.length; k++) {
                            if (path[k][0] == '@')
                                newPath[k] = "" + context[path[k].substr(1)];
                            else
                                newPath[k] = path[k];
                            if (k == path.length - pathCut) {
                                var subPath = newPath.join("/");
                                if (this.callStack[subPath]) {
                                    this.callStack[subPath].push([obj, path, index, context, currentObject, listener, index]);
                                    return;
                                }
                                else
                                    this.callStack[subPath] = [arguments];
                            }
                        }
                        var remotePath = newPath.join("/");
                        var c = this;
                        $.ajax(
                            {url: this.actionEndPoint + remotePath + (remotePath.indexOf('?') >= 0 ? '&' : '?') + 'output=json',
                                context: this,
                                async: true,
                                dataType: 'json',
                                type: 'GET',
                                success: function (data, textStatus, jqXHR) {
                                    var lastStep = path.length;
                                    // Si lo que se ha devuelto es un objeto, significa que el ultimo elemento
                                    // del path pedido originalmente, es una propiedad.Por eso, lo que
                                    // se ha recibido, es el objeto que contiene a esa propiedad.
                                    // Por ello, el path a establecer, es el recibido, menos el ultimo elemento (la propiedad).
                                    // ej, si se pidio /usuario/nombre, y se recibe un objeto, significa que se ha recibido /usuario.
                                    if (data.data.constructor.toString().lastIndexOf("Object") >= 0)
                                        lastStep--;
                                    var k;
                                    var curNode = currentObject;
                                    var newNode;
                                    for (k = index + 1; k < lastStep - 1; k++) {
                                        newNode = new Siviglia.model.PathListener();
                                        curNode[newPath[k]] = newNode;
                                        curNode = newNode;
                                    }
                                    curNode[newPath[k]] = data.data;

                                    var k;
                                    var pending = this.callStack[subPath].slice(0);
                                    for (k = 0; k < pending.length; k++) {
                                        listener.pathRootObject.__getPath(pending[k][0], pending[k][1], pending[k][2], pending[k][3], pending[k][4], pending[k][5]);
                                    }

                                },
                                error: function (jqXHR, textStatus, errorThrown) {
                                    console.debug("EN ERROR!!!!!");
                                }
                            });
                    }

                }
            }
        }
    });


Siviglia.model.Root = new Siviglia.model.PathRoot();


Siviglia.Utils.setCookie = function (name, value, expires, path, domain, secure) {
    var today = new Date().getTime();
    var expires_date = new Date(today + (expires ? expires * 1000 * 60 * 60 * 24 : 0));
    document.cookie = name + "=" + escape(value) +
        ( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
        ( ( path ) ? ";path=" + path : ";path=/" ) +
        ( ( domain ) ? ";domain=" + domain : "" ) +
        ( ( secure ) ? ";secure" : "" );
}
Siviglia.Utils.getCookie = function (check_name) {
    // first we'll split this cookie up into name/value pairs
    // note: document.cookie only returns name=value, not the other components
    var a_all_cookies = document.cookie.split(';');
    var a_temp_cookie = '';
    var cookie_name = '';
    var cookie_value = '';
    var b_cookie_found = false; // set boolean t/f default f

    for (var i = 0; i < a_all_cookies.length; i++) {
        // now we'll split apart each name=value pair
        a_temp_cookie = a_all_cookies[i].split('=');
        // and trim left/right whitespace while we're at it
        cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');
        // if the extracted name matches passed check_name
        if (cookie_name == check_name) {
            b_cookie_found = true;
            // we need to handle case where cookie has no value but exists (no = sign, that is):
            if (a_temp_cookie.length > 1) {
                cookie_value = unescape(a_temp_cookie[1].replace(/^\s+|\s+$/g, ''));
            }
            // note that in cases where cookie is initialized but no value, null is returned
            return cookie_value;
            break;
        }
        a_temp_cookie = null;
        cookie_name = '';
    }
    if (!b_cookie_found) {
        return null;
    }
}

/*

 The following functions are stolen from the dojo toolkit. (www.dojotoolkit.org)

 */
String.prototype.cTrim=function( characters) {
    if(!Siviglia.isset(characters)) {
        if(typeof String.prototype.trim !== undefined) {
            // Simply use the String.trim as a default
            return String.prototype.trim.call(string);
         } else {
            // set characters to whitespaces
            characters = "\s\uFEFF\xA0";
         }
    }
    // Characters is set at this point forward
    // Validate characters just in case there are invalid usages
    var escaped = characters.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');    
    var target = new RegExp('^[' + escaped + ']+|[' + escaped + ']+$',"g");    
    // Remove the characters from the string
    return this.replace(target, '');
};
String.prototype.ucfirst=function()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
}

if (!String.prototype.trim) {
    String.prototype.trim = function (c) {
        c=Siviglia.issetOr(c,'\s');
        return this.replace(/^\s+|\s+$/g, '');
    };

    String.prototype.ltrim = function (c) {
        c=Siviglia.issetOr(c,'\s');
        return this.replace(/^\s+/, '');
    };

    String.prototype.rtrim = function (c) {
        c=Siviglia.issetOr(c,'\s');
        return this.replace(/\s+$/, '');
    };

    String.prototype.fulltrim = function () {
        return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' ');
    };
}

Siviglia.types = {
    fromJson: function (/*String*/ json) {
        return eval("(" + json + ")"); // Object
    },
    _escapeString: function (/*String*/str) {
        return ('"' + str.replace(/(["\\])/g, '\\$1') + '"').
            replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").
            replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r"); // string
    },
    isString: function (/*anything*/ it) {
        return (typeof it == "string" || it instanceof String); // Boolean
    },

    isArray: function (/*anything*/ it) {
        //	summary:
        //		Return true if it is an Array.
        //		Does not work on Arrays created in other windows.
        return it && (it instanceof Array || typeof it == "array"); // Boolean
    },

    isFunction: function (/*anything*/ it) {
        // summary:
        //		Return true if it is a Function
        return Function.call(it) === "[object Function]";
    },

    isObject: function (/*anything*/ it) {
        return it !== undefined &&
            (it === null || typeof it == "object" || Siviglia.types.isArray(it) || Siviglia.types.isFunction(it)); // Boolean
    }
};

function getMouseEventCoordinates(event, reference) {
    if (event.offsetX !== undefined && event.offsetY !== undefined)
        return {x: event.offsetX, y: event.offsetY};
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    do {
        totalOffsetX += reference.offsetLeft - reference.scrollLeft;
        totalOffsetY += reference.offsetTop - reference.scrollTop;
    }
    while (reference = reference.offsetParent)

    canvasX = event.pageX - totalOffsetX - document.body.scrollLeft;
    canvasY = event.pageY - totalOffsetY - document.body.scrollTop;

    return {x: canvasX, y: canvasY}

}

Siviglia.Utils.buildClass(
    {
        context: 'Siviglia.UI',
        classes: {
            Widget: {
                inherits: "Siviglia.UI.Dom.Expando.ViewExpando",
                construct: function (widgetName, params, nodeParams, node, pathRoot, widget) {
                    this.ViewExpando(widgetName);
                    this.subViews = [];
                    this.pathRoot = pathRoot;
                    if (!widget) {
                        if (params.template) {
                            var hiddenEl = document.createElement("div");
                            $(hiddenEl).html(template);
                        }
                        this.view = this;
                        this.params = params;
                        this.nodeParams = nodeParams;
                        if (node) {
                            this.setViewObject(this, params, nodeParams);
                            this.__initialize(node, null, pathRoot, pathRoot.context, null);
                        }
                    }
                    else {
                        this.view = widget;
                    }


                },



                methods: {
                    /* attach:function(node){

                     this.ViewExpando$attach(this,node,this.params,this.nodeParams);
                     this.onAttach();

                     },*/
                    onAttach: function () {
                    },
                    getRootNode: function () {
                        return this.view.widgetRoot;
                    },
                    addSubView: function (v) {
                        this.subViews.push(v);
                    },

                    __initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        this.pathRoot = pathRoot;
                        this.context = contextObj;
                        this.rootNode = node;
                        this.nodeManager = nodeManager;
                        this.caller = caller;
                        this.parentWidget = caller;
                        this.attach(this.caller, this.rootNode, this.params, this.nodeParams, this.pathRoot, this.context);
                        return false;
                    },
                    notifyPathListeners:function()
                    {
                        Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgetStack.push(this);
                        this.ViewExpando$notifyPathListeners();
                        Siviglia.UI.Dom.Expando.WidgetExpando.prototype.widgetStack.pop();
                    }

                }
            }

        }
    }

);


Siviglia.Utils.buildClass({
    context:'Siviglia.App',
    classes:
    {
        Page:{
            inherits:"Siviglia.Dom.EventManager",
            construct:function(App)
            {
                this.App=App;
                this.EventManager();
                this.oManager=new Siviglia.UI.Dom.Expando.ExpandoManager(this.App.root,this.App.root.context);
            },
            methods:
            {
                onLoaded:function()
                {

                    this.fireEvent("PAGE_LOADED");
                    this.oManager.parse($(document.body),null);
                    this.fireEvent("UI_INITIALIZED");
                },
                parseWidgets:function(node) {
                    this.oManager.parse(node, null, null, true);
                }
                /*

                 */
            }
        },
        App:{
            inherits:"Siviglia.Dom.EventManager",
            construct:function(config){
                this.config=config;
                //Siviglia.Model.initialize(config);
                this.root=Siviglia.model.Root;
            },
            methods:
            {
                initialize:function()
                {
                    var self=this;
                    $(document).ready(function(){
                        if(self.page)
                            self.page.onLoaded()}
                    );
                },
                getRoot:function()
                {
                    return this.root;
                },
                getPage:function()
                {
                    return this.page;
                },
                setPage:function(page)
                {
                    this.page=page;
                    top.page=page;
                    top.eventManager=page;
                },
                startup:function()
                {
                }
            }
        }
    }
});

Siviglia.Utils.buildClass({
    context:'Siviglia.Utils',
    classes:
    {
        ParametrizableStringException:{
            construct:function(message)
            {
                this.message=message;                
            }
        },
        ParametrizableString:
        {
            /*
                Si se quieren utilizar paths, controller debe ser una instancia de una clase derivada
                de Siviglia.model.PathRoot
            */
            construct:function(controller)
            {
                this.controller=controller;
                this.BASEREGEXP=/\[%(?:(?:([^: ,%]*)%\])|(?:([^: ,]*)|([^:]*)):(.*?(?=%\]))%\])/g;
                this.BODYREGEXP=/\{%(?:([^%:]*)|(?:([^:]*):(.*?(?=%\}))))%\}/g;
                this.PARAMREGEXP=/([^|$ ]+)(?:\||$|(?: ([^|$]+)))/g;
                this.SUBPARAMREGEXP=/('[^']*')|([^ ]+)/g;                
            },
            methods:
            {
                parse:function(str,params)
                {
                    params=Siviglia.issetOr(params,{});                        
                    var m=this,r=this.BASEREGEXP,res,f=str;
                    while(res=r.exec(str)) 
                        f=f.replace(res[0], this.parseTopMatch(res,params));
                    return f;
                },
                parseTopMatch:function(match,params)
                {
                    // Match simple
                    
                    if(typeof match[1]!=="undefined")
                    {
                        try {
                            return this.getValue(match[1],params);
                        }catch (e)
                        {
                            throw new Siviglia.Utils.ParametrizableStringException("Parameter not found:"+match[1]);
                        }
                    }
                    var t=Siviglia.issetOr(match[2],null);
                    var t1=Siviglia.issetOr(match[3],null)
                    var mustInclude=false,exists=false,body='';
                    if(t)
                    {
                        var paramName=t;
                        var negated=(t.substr(0,1)=="!");
                        if(negated) 
                            paramName=t.substr(1);
                        try
                        {
                            this.getValue(paramName,params);
                            exists=true;
                        }catch (e) {}

                        mustInclude=(t.substr(0,1)=="!"?!exists:exists);
                    }
                    else
                        mustInclude=this.parseComplexTag(t1,params);
                    if(mustInclude)
                    {                        
                        var reg=new RegExp(this.BODYREGEXP);
                        var m=this,bodyMatch,replacements=[];
                        
                        while(bodyMatch=reg.exec(match[4])) {
                            var replacement=this.parseBody(bodyMatch,params);
                            replacements.push({s:bodyMatch[0],r:replacement});
                        }
                        for(var k=0;k<replacements.length;k++) {
                            match[4]=match[4].replace(replacements[k].s,replacements[k].r);
                        }

                        return match[4];
                    }
                    return '';
                },
                getValue:function(path,params)
                {
                    if(path.substr(0,1)=="/") 
                        return this.getPath(path);
                    try
                    {
                        var o=Siviglia.Utils.stringToContextAndObject(path, params, params, 1);
                    }catch(e)
                    {
                        throw new Siviglia.Utils.ParametrizableStringException("Parameter not found:"+path);
                    }
                    if(!Siviglia.isset(o.context[o.object])) {
                        throw new Siviglia.Utils.ParametrizableStringException("Parameter not found:"+path);
                    }
                    return o.context[o.object];
                },
                getPath:function(path)
                {                    
                    if(!this.controller || !this.controller.parseString) 
                        return path;
                    return this.controller.parseString(path);                    
                },
                parseBody:function(match,params)
                {
                    //this.BODYREGEXP=/{\%(?:(?<simple>[^%:]*)|(?:(?<complex>[^:]*):(?<predicates>.*?(?=\%}))))\%}/;
                    var v=Siviglia.issetOr(match[1],null);
                    if(v)
                    {
                        try {
                            return this.getValue(v, params);
                        }catch(e)
                        {
                            throw new Siviglia.Utils.ParametrizableStringException("Parameter not found:"+v);
                        }
                    }
                    var complex=Siviglia.issetOr(match[2],null);
                    var cVal=null;
                    try {
                        cVal=this.getValue(complex, params);
                    }catch(e) {}

                    var r=this.PARAMREGEXP,res;
                    while(res= r.exec(match[3]))
                    {                    
                        var func=typeof res[1]=="undefined"?null:res[1];
                        var args=typeof res[2]=="undefined"?null:res[2];
                        if(func=="default" && cVal==null)
                        {
                            cVal=args.cTrim("'");
                            continue;
                        }
                        if(! args)
                        {
                            if(cVal==null)
                            {
                                throw new Siviglia.Utils.ParametrizableStringException("Parameter not found:"+v);
                            }
                            cVal=this.controller[func](cVal);
                            continue;
                            
                        }
                        /* //this.SUBPARAMREGEXP=/('[^']*')|([^ ]+)/g; */
                        var r2=new RegExp(this.SUBPARAMREGEXP);
                        var cRes=null;
                        var pars=[];
                        var cur;
                        while(cRes=r2.exec(args)) {
                            cur=Siviglia.isset(cRes[0])?cRes[0].cTrim("'"):cRes[1];
                            pars.push(cur=="@@"?cVal:this.getPath(cur));                            
                        }
                        cVal=this.controller[func].apply(this.controller,pars);
                    }
                    return cVal;
                },
                parseComplexTag:function(format,params)
                {
                    parts=format.split(',');
                    for(var k=0;k<parts.length;k++) {
                        var c=parts[k];
                        var sparts=c.split(" ");
                        var negated=(sparts[0].substr(0,1)=='!');
                        if(negated) 
                            tag=sparts[0].substr(1);
                        else
                            tag=sparts[0];
                        if(sparts.length==1) {
                            if(negated) 
                                if(Siviglia.isset(params[tag])) 
                                    return false;
                                continue;
                        }

                        var curValue;
                        try{
                            curValue=this.getValue(tag,params);
                        }catch (e){
                            throw new Siviglia.Utils.ParametrizableStringException("Parameter not found:"+param);
                        }                        
                            
                        var result=false;
                        
                        switch(sparts[1]) {
                            case "is":{
                                result=Siviglia["is"+sparts[2].ucfirst()](curValue);
                            }break;
                            case "!=":{
                                result=(curValue!=this.getPath(sparts[2]));
                            }break;
                            case "==":{
                                result=(curValue==this.getPath(sparts[2]));
                            }break;
                            case ">":{
                                result=(curValue>parseInt(this.getPath(sparts[2])));
                            }break;
                            case "<":{
                                result=(curValue<parseInt(this.getPath(sparts[2])));
                            }break;
                        }
                        if(negated)
                            result=!result;
                        if(!result)
                            return false;
                    }
                    return true;
                }
            }
        },
        applyRecursive:function(object,params)
        {
            if(Siviglia.isString(object)) {
                return this.parse()
            }
            if(Siviglia.isArray(object)) {
                var r=[];
                for(var k=0;k<object.length;k++) {
                    r.push(this.applyRecursive(object[k],params));
                }
                return r;
            }
            if(Siviglia.isPlainObject(object)) {
                var r={};                
                for(var k in object) {
                    r[k]=this.applyRecursive(object[k],params);
                }
            }
            return object;
        }
    }
});

Siviglia.Utils.load=function(assets)
{

    var loadHTML=function(url,node){
        var p=$.Deferred();

        $.get(url).then(function(r){
            if(typeof node == "undefined")
            {
                node=$("<div></div>");
                $(document.body).append(node);
            }
            node.html(r);
            // Ojo, aqui se llama a un objeto Siviglia.App.Page
            p.resolve(node);
        });
        return p;
    };
    var loadJS=function(url){
        var promise=$.Deferred();
        var v=document.createElement("script");
        v.onload=function(){promise.resolve();}
        v.src=url;
        document.head.appendChild(v);
        return promise;
    };
    var loadCSS=function(url){
        var promise=$.Deferred();
        var v=document.createElement("link");
        v.rel="stylesheet";
        v.href=url;
        v.onload=function(){promise.resolve();}
        document.head.appendChild(v);
        return promise;
    };

    var curPromise=$.Deferred();
    var subpromises=[];
    for(var k=0;k<assets.length;k++)
    {
        var p=assets[k];
        if(typeof p=="string")
        {
            var type="html";
            // Es una simple cadena.Se busca que tipo de recurso puede ser.
            var aa=document.createElement("a");
            aa.href=p;
            var path=aa.pathname.split("/");
            if(path.length>0)
            {
                var ss=path[path.length-1];
                var suffix=ss.split(".");
                if(suffix.length > 1)
                    type=suffix.pop();
            }
            switch(type) {
                case "html": {
                    subpromises.push(loadHTML(p));
                }break;
                case "js": {
                    subpromises.push(loadJS(p));
                }break;
                    case "css": {
                        subpromises.push(loadCSS(p));
                    }break;
                }
            }
            else
            {
                switch(p.type)
                {
                    case "widget":{
                        if(!p.node) {
                            p.node = $("<div></div>");
                            $(document.body).append(p.node);
                        }
                        var pr=$.Deferred();
                        subpromises.push(pr);
                        var promises=[];
                        promises.push(loadHTML(p.template,p.node));
                        promises.push(loadJS(p.js));
                        $.when.apply($,promises).then(function(){
                            page.parseWidgets(p.node);
                            pr.resolve(p.node);
                        })
                    }break;
                    case "html":{
                        subpromises.push(loadHTML(p.url));
                    }break;
                    case "js":{
                        subpromises.push(loadJS(p.url));
                    }break;
                    case "css":{
                        subpromises.push(loadCSS(p.url));
                    }break;
                }
            }
        }

        $.when.apply($, subpromises).done(function() {curPromise.resolve();});
        return curPromise;
};

