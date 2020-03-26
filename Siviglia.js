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

Siviglia.isset = function (value) {
    return typeof value !== "undefined";
};
Siviglia.issetOr = function (value, defValue) {
    return Siviglia.isset(value) ? value : defValue;
};
Siviglia.issetPathOr = function (value, path, defaultV) {
    var parts = path.split(".");
    var c = value;
    for (var k = 0; k < parts.length; k++) {
        if (typeof c[parts[k]] == "undefined")
            return defaultV;
        c = c[parts[k]];
    }
    return c;
};
Siviglia.typeOf = function (value) {

    if (value === null)
        return "null";
    return Object.prototype.toString.call(value).match(/\s([a-zA-Z]+)/)[1].toLowerCase()

}
Siviglia.type = function (obj) {
    var checker = {};
    var types = "Boolean Number String Function Array Date RegExp Object".split(" ");
    for (var i in types) {
        checker["[object " + types[i] + "]"] = types[i].toLowerCase();
    }
    return obj == null ?
        String(obj) :
        checker[Object.prototype.toString.call(obj)] || "object";
}
Siviglia.isFunction = function (obj) {
    return Siviglia.type(obj) === "function";
}
Siviglia.isString = function (obj) {
    return Siviglia.type(obj) === "string";
}
Siviglia.isInt = function (obj) {
    return Siviglia.type(obj) === "number" && obj == parseInt(obj);
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
    if (contexts.length == 1) {
        if (typeof defContext[contexts[0]] == "undefined")
            defContext[contexts[0]] = {};
        return defContext[contexts[0]];
    }

    if (!defContext)
        curContext = window;
    else
        curContext = defContext;
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

Siviglia.Utils.stringToContextAndObject = function (str, startContext, defContext, throwException) {
    var contexts = str.split(".");
    var l = contexts.length;
    if (l == 1 && defContext) return {
        context: defContext,
        object: str
    };

    if (!startContext)
        curContext = window;
    else
        curContext = startContext;

    var k;
    for (k = 0; k < l - 1; k++) {
        if (!curContext[contexts[k]]) {
            if (typeof throwException !== "undefined" && throwException)
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
    } else
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


        if (!inherits)
            contextObj[k] = Siviglia.issetOr(definition.classes[k].construct, function () {
            });

        var baseClass;

        var inheritClasses = [];


        if (inherits && inherits.length > 0) {

            // Se copian los prototype de otras clases.
            for (i = 0; i < inherits.length; i++) {

                var c = Siviglia.Utils.stringToContextAndObject(inherits[i], null, contextObj);

                inheritClasses.push(c.object);

                var curClass = c.context[c.object];

                inheritClasses = inheritClasses.concat(curClass.prototype.__inherits);
                if (!curClass) {
                    alert("Error de herencia:No se encuentra:" + c.object);
                }

                if (i == 0) {
                    var parts = inherits[i].split(".");
                    var baseClassName;
                    if (parts.length == 1)
                        baseClassName = context + "." + inherits[i];
                    else
                        baseClassName = inherits[i];

                    baseClass = c.object;
                    var curBaseClass = c.context[c.object];
                    if (Siviglia.isset(definition.classes[k].construct))
                        contextObj[k] = definition.classes[k].construct;
                    else
                        eval(context + "." + k + "=function(){" + baseClassName + ".apply(this,arguments);};");
                    constructor = contextObj[k];
                    contextObj[k].prototype = (function (st) {
                        var c = Siviglia.Utils.stringToContextAndObject(st, null, contextObj);
                        return Object.create(c.context[c.object].prototype)
                    })(inherits[i]);
                }

                contextObj[k].prototype[c.object] = curClass.prototype.__construct;
                contextObj[k].prototype[c.object].__className = c.object;
                contextObj[k].prototype[c.object + "$destruct"] = curClass.prototype.__destruct;

                if (i == 0) continue;

                for (h in curClass.prototype) {
                    //if(h.indexOf("__")>-1 || h.indexOf("destruct")==0)continue;
                    if (h.indexOf("destruct") == 0) continue;

                    if ((definition.classes[k].methods && definition.classes[k].methods[h]) ||
                        contextObj[k].prototype[h]) {
                        contextObj[k].prototype[c.object + "$" + h] = curClass.prototype[h];
                    } else {
                        contextObj[k].prototype[h] = curClass.prototype[h];
                    }
                }
            }
        }

        contextObj[k].prototype.__construct = contextObj[k];
        contextObj[k].prototype.constructor = contextObj[k];
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


/* Add prepend capabilities function */
Element.prototype.prependChild = function (child) {
    this.insertBefore(child, this.firstChild);
};

/*
 Sistema de gestion de ventos (listeners)

 */

Siviglia.Dom = {
    listenerCounter: 0,
    managerCounter: 0,
    existingManagers: {},
    existingListeners: {},
    eventStack: [],
    dumpEventStack: function () {
        for (var k = 0; k < Siviglia.Dom.eventStack.length; k++) {
            var el = Siviglia.Dom.eventStack[k];
            console.log("id:" + el.id + " -- " + el.description);
        }
    }

};

Siviglia.Utils.buildClass({
    context: 'Siviglia.Dom',
    classes: {
        EventManager: {

            construct: function () {
                this._ev_id = Siviglia.Dom.managerCounter;
                Siviglia.Dom.existingManagers[this._ev_id] = this;
                Siviglia.Dom.managerCounter++;
                this._ev_firing = null;
                this._ev_listeners = null;
                this.disabledEvents=false;
            },
            destruct: function () {

                // If this destructor was called while this object was notifying its listeners,
                // simply set a flag and return.
                if (this._ev_notifying) {
                    this._ev_mustDestruct = true;
                    return;
                }
                this.destroyListeners();
            },
            methods: {
                addListener: function (evType, object, method, description) {
                    if (!this._ev_listeners) this._ev_listeners = {};
                    if (!this._ev_listeners[evType])
                        this._ev_listeners[evType] = [];

                    var k;
                    for (k = 0; k < this._ev_listeners[evType].length; k++) {
                        if (this._ev_listeners[evType][k].obj == object && this._ev_listeners[evType][k].method == method) {
                            return;
                        }
                    }
                    var newListener = {
                        obj: object,
                        method: method,
                        id: Siviglia.Dom.listenerCounter,
                        description: description
                    }
                    Siviglia.Dom.listenerCounter++;
                    this._ev_listeners[evType].push(newListener);
                    Siviglia.Dom.existingListeners[newListener.id] = newListener;
                },


                removeListener: function (evType, object, method, target) {
                    if (!this._ev_listeners) return;
                    if (!this._ev_listeners[evType]) return;
                    var k, curL;
                    for (k = 0; k < this._ev_listeners[evType].length; k++) {
                        curL = this._ev_listeners[evType][k];
                        if (curL.obj == object && (!method || (method == curL.method))) {
                            if (target) {
                                if (curL.target != target)
                                    continue;
                            }
                            console.debug("Removing listener " + curL.id);
                            delete Siviglia.Dom.existingListeners[curL.id];
                            this._ev_listeners[evType].splice(k, 1);
                            return;
                        }
                    }
                },
                removeListeners: function (object) {
                    if (!this._ev_listeners) return;
                    var k, j;
                    for (k in this._ev_listeners) {
                        for (j = 0; j < this._ev_listeners[k].length; j++) {
                            if (this._ev_listeners[k][j].obj == object) {
                                console.debug("Removing listener " + this._ev_listeners[k][j].id);
                                delete Siviglia.Dom.existingListeners[this._ev_listeners[k][j].id];
                                this._ev_listeners[k].splice(j, 1);
                                j--;
                            }
                        }
                    }
                },
                _ev_notify: function (evType, data, target) {
                    if (!this._ev_listeners) return;
                    if (!this._ev_listeners[evType]) {
                        return;
                    }
                    this._ev_notifying = true;
                    var k;
                    var obj;
                    // Hay que capturar aqui cuantos listeners de este tipo hay, y hacer el bucle sobre
                    // esos elementos, evitando los listeners de este mismo tipo que se puedan añadir durante
                    // la ejecución del bucle.
                    var nListeners = this._ev_listeners[evType].length;
                    // Iteramos sobre una copia de los listeners.
                    var copied = Array.from(this._ev_listeners[evType]);

                    try {
                        for (k = 0; k < nListeners; k++) {
                            // Si en algun momento los listeners estan a nulo, es que este objeto
                            // se ha destruido.

                            if (this._ev_listeners == null)
                                break;
                            // Pero el listener en si, lo cogemos de la copia.
                            obj = copied[k];
                            Siviglia.Dom.eventStack.push(obj);
                           // console.debug("NOTIFY: " + this._ev_id + " --> " + evType + " : " + obj.id);
                            if (obj.obj) {
                                if (typeof obj.obj == "function") {
                                    obj.obj(evType, data, obj.param, target);
                                } else {
                                    if (obj.obj[obj.method])
                                        obj.obj[obj.method](evType, data, obj.param, target);
                                }
                            } else {
                                obj.method(evType, data, obj.param, target);
                            }
                            Siviglia.Dom.eventStack.pop();
                        }
                    } catch (e) {
                        console.log("Error:");
                        console.dir(e);
                    }
                    // The following is a protection code; if marks this object as "notifying",so, if as part of the notification, this object
                    // is destroyed, it will not destroy the listeners, but set the mustDestroy flag to true.
                    this._ev_notifying = false;
                    if (this._ev_mustDestruct) {
                        this.destroyListeners();
                    }
                },
                destroyListeners: function () {
                    delete Siviglia.Dom.existingManagers[this._ev_id];
                    for (var k in this._ev_listeners) {
                        for (var j = 0; j < this._ev_listeners[k].length; j++) {
                            console.debug("DELETING LISTENER " + this._ev_listeners[k][j].id);
                            delete Siviglia.Dom.existingListeners[this._ev_listeners[k][j].id];
                        }
                    }
                    this._ev_listeners = null;
                },
                disableEvents:function(disable)
                {
                    this.disabledEvents=disable;
                },
                eventsDisabled:function()
                {
                    return this.disabledEvents;
                },
                fireEvent: function (event, data, target) {
                    if(this.disabledEvents)
                        return;
                    if (this._ev_firing == event)
                        return;
                    if (!this._ev_listeners) return;
                    if (!this._ev_listeners[event]) return;

                    if (data !== null) {
                        if (typeof data != "undefined")
                            data.target = target;
                        else
                            data = {
                                target: target
                            };
                        data.src = this;
                    }

                    this._ev_notify(event, data, target);
                    this._ev_firing = null;
                }
            }
        }
    }
});


Siviglia.Utils.buildClass(
    {
        context: "Siviglia.Path",
        classes: {
            ContextStack: {
                construct: function () {
                    this.contextRoots={};
                },
                methods: {
                    addContext: function (handler) {
                        var prefix=handler.getPrefix();
                        if(prefix==="")
                            prefix="/";
                        this.contextRoots[prefix]=handler;
                        handler.setStack(this);
                    },
                    removeContext:function(handler)
                    {
                        var prefix=handler.getPrefix();
                        if(prefix==="")
                            prefix="/";
                        if(!this.hasPrefix(prefix))
                            throw "INVALID CONTEXT REQUESTED:"+prefix;
                        var ctx=this.contextRoots[prefix];
                        ctx.destruct();
                        this.contextRoots[prefix]=null;
                        delete this.contextRoots[prefix];
                    },
                    getContext: function (prefix) {
                        if (typeof this.contextRoots[prefix] != "undefined")
                            return this.contextRoots[prefix];
                        throw new Exception("INVALID CONTEXT REQUESTED:"+prefix);
                    },
                    getRoot:function(str)
                    {
                        var prefix=str.substr(0, 1);
                        var ctx=this.getContext(prefix);
                        return ctx.getRoot();
                    },
                    hasPrefix:function(char)
                    {
                        return typeof this.contextRoots[char]!="undefined";
                    },
                    getCursor:function(prefix)
                    {
                        var cursor=new Siviglia.Path.BaseCursor(this.contextRoots[prefix].getRoot());
                        cursor.setPrefix(prefix);
                        return cursor;
                    },
                    getCopy:function()
                    {
                        var newContext=new Siviglia.Path.ContextStack();
                        for(var k in this.contextRoots)
                            newContext.addContext(this.contextRoots[k]);
                        return newContext;
                    }
                }
            },
            Context:{
                construct:function(prefix,stack)
                {
                    this.prefix=prefix;
                    this.stack=stack;
                    if(typeof stack!=="undefined" && stack!==null)
                        stack.addContext(this);
                },
                methods:
                    {
                        getPrefix:function(){return this.prefix;},
                        setStack:function(stack){
                            this.stack=stack;
                        }
                    }
            },
            BaseCursor:{
                inherits:"Siviglia.Dom.EventManager",
                construct:function(objRoot)
                {
                    this.objRoot=objRoot;
                    this.pathStack=[];
                    this.remListeners=[];
                    this.__lastTyped=false;
                    this.prefix=null;
                    this.reset();
                    this.EventManager();
                },
                destruct:function()
                {
                //    console.log("DESTROYING "+this.id);
                    this.cleanListeners();
                },
                methods:{
                    setPrefix:function(p)
                    {
                        this.prefix=p;
                    },
                    getPrefix:function()
                    {
                        return this.prefix;
                    },
                    reset:function()
                    {
                        this.__lastTyped=null;
                        this.pointer=this.objRoot;
                    },
                    moveTo:function(spec)
                    {

                        this.__lastTyped=false;
                        if(spec===".." && typeof this.pointer.getParent==="function")
                        {
                            cVal=this.pointer.getParent();
                            if(this.prefix!=='@') {
                                cVal.addListener("CHANGE", this, "onChange", "BaseCursor:" + spec);
                                this.remListeners.push(cVal);
                            }
                            this.pointer=cVal;
                            return cVal.getValue()
                        }
                        else {
                            var v=this.pointer[spec];
                            if(typeof v==="undefined")
                                throw "Unknown path "+spec;
                            if(typeof v=="object" && v!==null)
                            {
                                if(typeof v["__type__"]!=="undefined")
                                {
                                    if(this.prefix!="@") {
                                        v.addListener("CHANGE", this, "onChange", "BaseCursor:" + spec);
                                        this.remListeners.push(v);
                                    }
                                    this.__lastTyped=true;
                                }
                                else
                                    this.addPathListener(this.pointer, spec);

                            }
                            else
                                this.addPathListener(this.pointer,spec);
                            this.pointer=this.pointer[spec];
                        }
                    },
                    getValue:function()
                    {
                        //if(this.__lastTyped==true)
                        //    return this.pointer.getValue();

                        return this.pointer;
                    },
                    addPathListener:function(parent,propName)
                    {
                        if(this.prefix=='@')
                            return;
                        Siviglia.Path.eventize(parent,propName);
                        var m=this;
                        parent["*"+propName].addListener("CHANGE",this,"onChange","Basecursor:"+propName);
                        this.remListeners.push(parent["*"+propName]);
                    },
                    // Algun elemento del path ha cambiado.Hay que notificar para que vuelvan a parsearlo todo.
                    onChange:function()
                    {
                        this.fireEvent("CHANGE",null);
                        // Una vez que se dispara un evento de CHANGE, eliminamos todos los listeners.

                        this.cleanListeners();
                    },
                    cleanListeners:function()
                    {
                        for(var k=0;k<this.remListeners.length;k++)
                            this.remListeners[k].removeListeners(this);
                        this.remListeners=[];
                    }
                }
            },
            BaseObjectContext:{
                inherits:"Context",
                construct:function(objRoot,prefix,stack)
                {
                    this.objRoot=objRoot;
                    this.Context(prefix,stack);
                },
                methods:{
                    getRoot:function(){
                        return this.objRoot;
                    },
                    getCursor:function(){
                        return new Siviglia.Path.BaseObjectContainerCursor(this.objRoot);
                    }
                }
            },
            PathResolver: {
                inherits: "Siviglia.Dom.EventManager",
                construct: function (contexts,path) {
                    this.contexts = contexts;
                    this.remlisteners=[];
                    // Los paths antiguos utilizan /* para marcar un contexto determinado.
                    // Por compatibilidad, comprobamos si la cadena pasada tiene ese formato, y
                    // si es asi, lo convertimos al actual (sin la "/")
                    if((path[1]==="*" || path[1]==="@") && path[0]==="/")
                        path=path.substr(1);
                    this.path=path;
                    this.cursors=[];
                    this.valid=false;
                    this.lastValue=null;
                    this.firing=false;
                    this.EventManager();
                },
                destruct:function()
                {
                    this.clearListeners();
                },
                methods: {
                    buildTree: function (str) {
                        var componentStack = [];
                        var components = [];
                        componentStack.push(components);
                        var curExpr = null;
                        var prefix="";
                        var startingPath=true;
                        for (var k = 0; k < str.length; k++) {
                            var char = str[k];
                            if(startingPath)
                            {
                                if(!this.contexts.hasPrefix(char))
                                {
                                    throw "INVALID PATH:"+this.path;
                                }
                                curExpr={"type":"pathElement",str:"",prefix:char}
                                startingPath=false;
                                continue;
                            }
                            switch (char) {
                                case "/": {

                                    if (curExpr != null)
                                        components.push(curExpr);
                                    curExpr = {type: "pathElement", str: ""};
                                    // Si es el primer elemento del path, nos quedamos con el
                                    // caracter siguiente del path, que determina el contexto en el que
                                    // estamos buscando.
                                    if(components.length==0) {

                                        curExpr.prefix = prefix;
                                    }
                                    prefix="";
                                }
                                    break;
                                case "{": {
                                    var nextChar = str[k + 1];
                                    var expr = curExpr != null ? curExpr : {};
                                    expr.type = "subpath";
                                    if (nextChar == "%") {
                                        expr.subtype = "static";
                                        k++;
                                    } else {
                                        expr.subtype = "dynamic";
                                        expr.str = "";
                                    }
                                    components.push(expr);
                                    expr.components = [];
                                    componentStack.push(expr.components);
                                    components = expr.components;
                                    curExpr = null;
                                    startingPath=true;
                                }break;
                                case "}": {
                                    if (curExpr != null) {
                                        var lastChar = curExpr.str.substr(-1, 1);
                                        // Si el ultimo caracter de la expresion actual es un "%", se elimina
                                        if (lastChar == "%")
                                            curExpr.str = curExpr.str.substr(0, curExpr.str.length - 1);
                                        components.push(curExpr);
                                    }
                                    componentStack.pop();
                                    components=componentStack[componentStack.length-1];
                                    curExpr=null;
                                }break;
                                default: {
                                    curExpr.str += char;
                                }
                            }
                        }
                        if(curExpr && (curExpr.str.length>0 || curExpr.type=="subpath"))
                            components.push(curExpr);
                        if (componentStack.length > 1)
                            throw "Invalid Path";
                        return componentStack[0];
                    },
                    isValid:function()
                    {
                        return this.valid;
                    },
                    getPath:function()
                    {
                        if(this.firing)
                            return;
                        var p=this.path[0];
                        if(this.contexts.hasPrefix(p))
                        {
                            this.stack = this.buildTree(this.path);
                       //     console.log("DESTRUYO CURSORES");
                            this.clearListeners();
                            this.valid = true;
                            try {
                                var newVal = this.parse(this.stack, true);
                            }catch(e)
                            {
                                this.valid=false;
                                newVal=null;
                            }
                        }
                        else
                        {
                            this.valid=true;
                            newVal=this.path;
                        }
                        this.firing=true;
                        this.lastValue=newVal;
                        this.fireEvent("CHANGE", {value: newVal,valid:this.valid});
                        this.firing=false;
                        return newVal;
                    },
                    getValue:function(){return this.lastValue;},
                    parse:function(pathParts)
                    {
                        // TODO : Eliminar listeners.

                        var root=this.contexts.getRoot(pathParts[0].prefix);
                        var cursor=this.contexts.getCursor(pathParts[0].prefix);
                        this.cursors.push(cursor);
                        var m=this;
                        if(pathParts[0].prefix!=='@') {
                            cursor.addListener("CHANGE", this, "getPath", "PathResolver:" + this.path)
                        }
                        var lastPointer,lastLabel;

                        for(var k=0;k<pathParts.length && this.valid ;k++)
                        {
                            var p=pathParts[k];
                            switch(p.type)
                            {
                                case "pathElement":
                                {
                                    lastPointer=cursor.getValue();
                                    lastLabel=p.str;
                                    try {
                                        cursor.moveTo(p.str);
                                    }catch(e)
                                    {
                                        this.valid=false;
                                    }
                                }break;
                                case "subpath":
                                {
                                    var val=this.parse(p.components,p.subtype=="static"?false:true);
                                    if(this.valid) {
                                        lastPointer = cursor.getValue();
                                        lastLabel = val;
                                        cursor.moveTo(val);
                                    }
                                }break;
                            }
                        }
                        return cursor.getValue();
                    },
                    clearListeners:function(){
                        for(var k=0;k<this.remlisteners.length;k++)
                            this.remlisteners[k].removeListeners(this);

                        for(var k=0;k<this.cursors.length;k++) {
                            //      this.cursors[k].removeListeners(this);
                            this.cursors[k].destruct();
                        }
                        this.cursors=[];
                    }
                }
            }
        }
    });

Siviglia.Utils.parametrizableStringCounter=0;
Siviglia.Utils.buildClass({
    context:'Siviglia.Path',
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
                    inherits:"Siviglia.Dom.EventManager",
                    construct:function(str,contextStack,opts)
                    {
                        this._ps_id=Siviglia.Utils.parametrizableStringCounter;
                        Siviglia.Utils.parametrizableStringCounter++;
                        this.contextStack=contextStack;
                        this.BASEREGEXP=/\[%(?:(?:([^: ,]*)%\])|(?:([^: ,]*)|([^:]*)):(.*?(?=%\]))%\])/g;
                        this.BODYREGEXP=/\{%(?:([^%:]*)|(?:([^:]*):(.*?(?=%\}))))%\}/g;
                        this.PARAMREGEXP=/([^|$ ]+)(?:\||$|(?: ([^|$]+)))/g;
                        this.SUBPARAMREGEXP=/('[^']*')|([^ ]+)/g;
                        this.paths={};
                        this.str=str;
                        this.valid=true;
                        this.pathController=null;
                        this.useListeners=true;
                        if(typeof opts!=="undefined")
                        {
                            this.useListeners=Siviglia.issetOr(opts.useListeners,true);
                        }
                        this.EventManager();

                    },
                    destruct:function()
                    {
                        this.removeAllPaths();

                    },
                    methods:
                        {
                            parse:function()
                            {
                                this.parsing=true;
                                this.valid=true;
                                var str=this.str;
                                var m=this,r=new RegExp(this.BASEREGEXP),res,f=str;
                                try {
                                    while (res = r.exec(str))
                                        f = f.replace(res[0], this.parseTopMatch(res));
                                    this.parsing = false;
                                    this.fireEvent("CHANGE", {value: f});
                                    return f;
                                }catch(e)
                                {
                                    throw e;
                                }
                                return null;
                            },
                            parseTopMatch:function(match)
                            {
                                // Match simple

                                if(typeof match[1]!=="undefined")
                                {
                                    try {
                                        return this.getValue(match[1]);
                                    }catch (e)
                                    {
                                        this.parsing=false;
                                        console.error("PATH NOT FOUND::"+match[1])
                                        throw new Siviglia.Path.ParametrizableStringException("Parameter not found:"+match[1]);
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
                                        this.getValue(paramName);
                                        exists=true;
                                    }catch (e) {}

                                    mustInclude=(t.substr(0,1)=="!"?!exists:exists);
                                }
                                else
                                    mustInclude=this.parseComplexTag(t1);
                                if(mustInclude)
                                {
                                    var reg=new RegExp(this.BODYREGEXP);
                                    var m=this,bodyMatch,replacements=[];
                                    while(bodyMatch=reg.exec(match[4])) {
                                        var replacement=this.parseBody(bodyMatch);
                                        replacements.push({s:bodyMatch[0],r:replacement});
                                    }
                                    for(var k=0;k<replacements.length;k++) {
                                        match[4]=match[4].replace(replacements[k].s,replacements[k].r);
                                    }
                                    return match[4];
                                }
                                return '';
                            },
                            getValue:function(path)
                            {

                                if(typeof this.paths[path]!=="undefined") {
                                    if(!this.paths[path].isValid())
                                        this.valid=false;
                                    else {
                                        var v=this.paths[path].getValue();
                                        if(typeof v=="object")
                                            return JSON.stringify(v);
                                        return v;
                                    }
                                }

                                var controller=new Siviglia.Path.PathResolver(this.contextStack,path);
                                this.paths[path]=controller;
                                // Si no queremos que sea dinamico, ya que lo que queremos es el valor actual del path, y punto,
                                // no aniadimos ningun listener al path
                                if(this.useListeners) {
                                    if (!((path[0] == "/" && path[1] == "@") || (path[0] == "@")))
                                        controller.addListener("CHANGE", this, "onListener", "ParametrizableString: value:" + path);
                                }
                                var val=controller.getPath();
                                if(!controller.isValid()) {
                                    this.parsing=false;
                                    throw new Siviglia.Path.ParametrizableStringException("Unknown path:" + path);
                                }
                                else {
                                    if (val === null) {
                                        this.parsing = false;
                                        throw new Siviglia.Path.ParametrizableStringException("Null value::" + path);
                                    }
                                    else
                                    {
                                        if(typeof val=="object")
                                            return JSON.stringify(val);
                                    }
                                }

                                return val;
                            },
                            removeAllPaths:function()
                            {
                                for(var k in this.paths)
                                    this.paths[k].destruct();
                            },
                            onListener:function()
                            {
                                if(!this.parsing) {

                                    this.parse();
                                }
                            },
                            parseBody:function(match)
                            {
                                //this.BODYREGEXP=/{\%(?:(?<simple>[^%:]*)|(?:(?<complex>[^:]*):(?<predicates>.*?(?=\%}))))\%}/;
                                var v=Siviglia.issetOr(match[1],null);
                                if(v)
                                {
                                    try {
                                        return this.getValue(v);
                                    }catch(e)
                                    {
                                        this.parsing=false;
                                        throw new Siviglia.Path.ParametrizableStringException("Parameter not found:"+v);
                                    }
                                }
                                var complex=Siviglia.issetOr(match[2],null);
                                var cVal=null;
                                try {
                                    cVal=this.getValue(complex);
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
                                            this.parsing=false;
                                            throw new Siviglia.Path.ParametrizableStringException("Parameter not found:"+v);
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
                                        pars.push(cur=="@@"?cVal:this.getValue(cur));
                                    }
                                    cVal=this.controller[func].apply(this.controller,pars);
                                }
                                return cVal;
                            },
                            parseComplexTag:function(format)
                            {
                                var parts=format.split(',');
                                var d=$.Deferred();
                                var opsStack=[];

                                for(var k=0;k<parts.length;k++) {
                                    var c=parts[k];
                                    var sparts=c.split(" ");
                                    var negated=(sparts[0].substr(0,1)=='!');
                                    if(negated)
                                        tag=sparts[0].substr(1);
                                    else
                                        tag=sparts[0];
                                    if(sparts.length==1) {
                                        if(negated) {
                                            try {
                                                curValue = this.getValue(tag);
                                            }catch(e){
                                                curValue=null;
                                            }
                                            if (curValue!=null)
                                                return false;
                                        }
                                        continue;
                                    }

                                    var curValue;
                                    try{
                                        curValue=this.getValue(tag);
                                    }catch (e){
                                        this.parsing=false;
                                        throw new Siviglia.Path.ParametrizableStringException("Parameter not found:"+tag);
                                    }
                                    var result=false;
                                    switch(sparts[1]) {
                                        case "is":{
                                            result=Siviglia["is"+sparts[2].ucfirst()](curValue);
                                        }break;
                                        case "!=":{
                                            result=(curValue!=this.getValue(sparts[2]));
                                        }break;
                                        case "==":{
                                            result=(curValue==this.getValue(sparts[2]));
                                        }break;
                                        case ">":{
                                            result=(curValue>parseInt(this.getValue(sparts[2])));
                                        }break;
                                        case "<":{
                                            result=(curValue<parseInt(this.getValue(sparts[2])));
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
                }
        }
});

Siviglia.Path.eventize=function(obj,propName) {
    var srcObject = obj[propName];
    var disableEvents = false;
    if (obj.hasOwnProperty("__type__")) {
        if (obj.__type__ === "BaseTypedObject")
            return; // No se necesita hacer nada, ya que obj[propName] ya soporta addEventListener
    }
    // En cualquier otro caso, es posible hacer un proxy sobre el objeto padre.
    // Primero, quitar de enmedio el caso en que el obj[propName] es un BaseType, donde, de nuevo, no hay que hacer nada.
    if (obj[propName] !== null && obj[propName].hasOwnProperty("__type__") && obj[propName].__type__ == "BaseType")
        return; // No se necesita hacer nada, ya que obj[propName] ya soporta addEventListener

    // Si estamos aqui, ni el objeto, ni la propiedad, son objetos basetyped . Podrian ser objetos evented, incluso podrian
    // tener un evento CHANGE, pero no lo sabemos. Tendria que existir una propiedad que permitiera identificarlos, y que
    // evitara tener que montar un proxy sobre ellos.

    // Ahora hay varias posibilidades.
    // La primera que hay que mirar, es que obj[propName] sea null. En ese caso, no sabemos que va a ser obj[propName] en el futuro.
    // No sabemos si habra que crearle un proxy, o valdria con un defineProperty en el padre.
    // La segunda, es si obj[propName] es un objeto simple, o no. Si es un objeto simple, vale con un defineProperty.Si no, hay que montar un proxy.
    // Ahora, una restriccion: que ocurre si la propiedad comienza siendo una cosa, y luego es otra?
    // O, si empieza siendo "algo", y luego es "null"?
    // Por lo tanto, es mejor hacer un defineProperty en el padre, y en el hijo.
    if (!obj.hasOwnProperty("__disableEvents__")) {
        Object.defineProperty(obj, "__disableEvents__", {
            get: function () {
                return disableEvents;
            },
            set: function (val) {
                disableEvents = val;
            },
            enumerable: false
        });
    }


    if (!obj.hasOwnProperty("*" + propName)) {

        var v = obj[propName];
        var ev = new Siviglia.Dom.EventManager();

        Object.defineProperty(obj, "*" + propName, {
            get: function () {
                return ev;
            },
            set: function (val) {
            },
            enumerable: false
        });
        if(typeof v=="object")
        {
            if(obj.hasOwnProperty("__disableEvents__"))
                obj.__disableEvents__=true;
            obj[propName]=Siviglia.Path.Proxify(v, ev);
            if(obj.hasOwnProperty("__disableEvents__"))
                obj.__disableEvents__=false;
        }
        else {
            Object.defineProperty(obj, propName, {
                get: function () {
                    return v;
                },
                set: function (val) {

                        if (typeof val === "object" && val !== null)
                            v = Siviglia.Path.Proxify(val, ev);
                        else
                            v = val;
                        if (!obj.__disableEvents__)
                            ev.fireEvent("CHANGE", {object: obj, property: propName, value: val});

                },
                enumerable: true
            });
        }
    }
}

Siviglia.Path.Proxify=function(obj,ev)
{
    var curVal=obj;
    // Lo siguiente, no se puede hacer:
    // (Ver si el objeto es un proxy de un BaseType, y aniadir el listener al basetype)
    //obj.__parentbto__.addListener("CHANGE",null,function(evName,params){
    // ev.fireEvent("CHANGE",params);
    //});
    // Si hay un partenbto, o sea, obj es un proxy de un BaseType, ocurriria lo siguiente:
    // Actualemente, ese BaseType tiene el objeto "obj" como valor.
    // Si el listener no se pone directamente sobre *ese* proxy, sino sobre el basetype que
    // lo contiene, puede pasar lo siguiente:
    // Si el basetype cambia completamente de valor (creando un proxy nuevo), lanzara un evento
    // CHANGE, que disparará a este listener, que esta asociado al *antiguo* valor.
    // Y eso es porque se esta escuchando al padre del proxy, no al proxy en si mismo.

    if(typeof obj.__isProxy__ !== "undefined") {
        obj.__ev__.addListener("CHANGE",null,function(event,params){ev.fireEvent("CHANGE",params)});
        return obj;
    }

    var isArray=(obj.constructor.toString().indexOf("rray")>0);
    var __disableEvents__=false;
    var objProxy = new Proxy(obj,{
        get:function(target,prop)
        {
            if(prop==="__isProxy__")
                return true;
            if(prop=="__disableEvents__")
                return __disableEvents__;
            return curVal[prop];
        },
        apply:function(target,thisArg,list)
        {
            var retVal=curVal.target.apply(thisArg,list);
            //if(isArray && ['pop','push','slice','splice','concat','shift','unshift'])
            //    ev.fireEvent("CHANGE",{object:obj,property:propName,value:retVal});
            return retVal;
        },
        set: function (target, prop,value) {

            if(prop=="__disableEvents__")
            {
                __disableEvents__=value;
                return true;
            }
            curVal[prop]=value;
            if(!__disableEvents__) {
                if (!isArray || (isArray && prop !== "length"))
                    ev.fireEvent("CHANGE", {object: obj, value: value});
            }
            return true;
        },
        deleteProperty:function(target,prop)
        {
            delete curVal[prop];
            if(!__disableEvents__)
                ev.fireEvent("CHANGE",{object:obj,property:prop,value:undefined});
        }
    });
    return objProxy;
}



Siviglia.UI = {
    expandos: {
        'sivparams': 'ParamsExpando',
        'sivvalue': 'ValueExpando',
        'sivclass': 'ClassExpando',
        'sivloop': 'LoopExpando',
        'sivif': 'IfExpando',
        'sivevent': 'EventExpando',
        'sivstate': 'StateExpando',
        'sivwidget': 'WidgetExpando',
        'sivview': 'ViewExpando',
        'sivcss': 'CssExpando',
        'sivattr': 'AttrExpando',
        'sivcall': 'CallExpando',
        'sivdojo': 'DojoExpando'
    },
    viewStack: []
};
Siviglia.Utils.buildClass(
    {
        context: "Siviglia.UI",
        classes: {
            HTMLParser:
                {
                    construct: function (stack) {
                        if (!stack) {
                            stack = new Siviglia.Path.ContextStack();
                        }
                        this.stack = stack;
                        this.expandos = [];
                    },
                    destruct: function () {
                        this.stack = null;
                        this.destroyExpandos();

                    },
                    methods:
                        {
                            addContext: function (prefix, plainObj) {
                                var plainCtx = new Siviglia.Path.BaseObjectContext(plainObj, prefix, this.stack);
                            },
                            recurseHTML: function (node, applyFunc) {
                                var dataset = node.data();
                                if (dataset.noparse)
                                    return;
                                var parseChildren = applyFunc(node);
                                if (!parseChildren)
                                    return;
                                var m = this;
                                node.trigger("startChildren");
                                node.children().each(function (idx, el) {
                                    m.recurseHTML($(el), applyFunc);
                                })
                                node.trigger("endChildren");
                            },
                            destroyExpandos: function () {
                                this.expandos.map(function (v) {
                                    v.destruct();
                                })
                            },
                            parse: function (node) {

                                var cb = function (node) {
                                    var newExpandos = {};
                                    var dataset = node.data();
                                    var k;
                                    var retValue = true;
                                    if (dataset["sivid"]) {

                                        var curRoot = this.stack.getRoot("*");
                                        if (curRoot)
                                            curRoot[dataset["sivid"]] = node;
                                    }
                                    for (k in Siviglia.UI.expandos) {
                                        if (dataset[k])
                                            newExpandos[k] = new Siviglia.UI.Expando[Siviglia.UI.expandos[k]]();
                                    }

                                    for (var k in newExpandos) {
                                        retValue = retValue && newExpandos[k]._initialize($(node), this, this.stack, newExpandos);
                                        this.expandos.push(newExpandos[k]);
                                    }
                                    return retValue;
                                };

                                this.recurseHTML(node, cb.bind(this));

                                return false;
                            }
                        }
                }
        }
    }
);
Siviglia.UI.expandoCounter = 0;
Siviglia.Utils.buildClass(
    {
        context: "Siviglia.UI.Expando",
        classes:
            {
                Expando: {
                    construct: function (expandoTag) {
                        this.expandoTag = expandoTag;
                        this._ex_id = Siviglia.UI.expandoCounter;
                        Siviglia.UI.expandoCounter++;
                        this.str = null;
                        this.observer = null;
                    },
                    destruct: function () {
                        if (this.str)
                            this.str.destruct();
                        if (this.node) {
                            this.node.remove();
                        }

                        this.node = null;
                        this.destroyed = true;
                    },
                    methods: {
                        _initialize: function (node, nodeManager, stack, nodeExpandos) {
                            this.node = node;
                            var pString = node.data(this.expandoTag);
                            var contextual=false;
                            if((pString[0]=="/" && pString[1]=="@" ) || (pString[0]=="@"))
                               contextual=true;
                            if (pString[0] == "/")
                                pString = "[%" + pString + "%]";
                            this.stack=stack;
                            this.str = new Siviglia.Path.ParametrizableString(pString, stack);
                            if(!contextual)
                                this.str.addListener("CHANGE", this, "_update", "BaseExpando:" + this.expandoTag);
                            var v=this.str.parse();
                            if(contextual)
                                this.update(v);
                            return true;
                        },
                        _update: function (event, params) {
                            this.update(params.value);
                        }
                    }
                },
                ValueExpando: {
                    inherits: "Expando",
                    construct: function () {
                        this.Expando("sivvalue");
                    },
                    methods: {
                        update: function (val) {
                            if(typeof val.__type__!=="undefined")
                                val=val.getValue();
                            if (Siviglia.isString(val)) {
                                var parts = val.split("::");
                                for (var k = 0; k < parts.length; k++) {
                                    var p1 = parts[k].split("|")

                                    if (p1.length == 1)
                                        this.node.html(p1[0]);
                                    else
                                        this.node.attr(p1[0], p1[1]);
                                }
                            } else
                                this.node.html("" + val);
                        }
                    }
                },
                CallExpando: {
                    inherits: "Expando",
                    construct: function () {
                        this.Expando("sivcall");
                    },
                    destruct: function () {
                    },
                    methods: {
                        _initialize: function (node, nodeManager, stack, nodeExpandos) {
                            this.method = node.data("sivcall");
                            this.node = node;
                            this.stack=stack;
                            // Noa aniadimos como listener de los parametros.
                            // Nota: los parametros se parsean antes, ya que existen antes en el array de
                            // expandos existentes.
                            var paramsObj = node.data("sivparams");
                            if (paramsObj) {
                                this.paramObj = nodeExpandos["sivparams"];
                                this.paramObj.addListener("CHANGE", this, "update", "CallExpando:" + this.method);
                            }
                            this.update();
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
                        update: function () {
                            var params = null;
                            if (Siviglia.isset(this.paramObj))
                                params = this.paramObj.getValues();

                            if (this.method.substr(0, 1) == ".") {
                                return window[this.method.substr(1)](this.node, params);
                            }
                            var src = this.stack.getRoot("*")
                            src[this.method](this.node, params);
                        }
                    }

                },
                ParamsExpando: {
                    inherits: "Expando,Siviglia.Dom.EventManager",
                    construct: function () {
                        this.Expando("sivparams");
                        this.paramValues={};
                        this.paths=[];
                        this.EventManager();
                        this.disableEvents=false;
                    },
                    destruct:function()
                    {
                        if(this.paths!==null) {
                            this.paths.map(function (item) {
                                item.destruct();
                            });
                            this.paths = null;
                        }
                    },
                    methods: {
                        _initialize: function (node, nodeManager, stack, nodeExpandos) {
                            this.node = node;
                            var pObj = node.data(this.expandoTag);
                            if (typeof pObj == "string")
                                pObj = JSON.parse(pObj);
                            this.disableEvents=true;
                            var m=this;
                            for(var k in pObj)
                            {
                                (function(key,value){
                                    var pr=new Siviglia.Path.PathResolver(stack,value);
                                    pr.addListener("CHANGE",null,function(ev,param){
                                        m.updateParams(key,param.value);
                                    });
                                    m.paths.push(pr);
                                    pr.getPath();
                                })(k,pObj[k]);
                            }
                            this.disableEvents=false;
                            return true;
                        },
                        updateParams:function(pName,pValue)
                        {
                            //if(typeof pValue.__type__!=="undefined")
                            //    val=pValue.getValue();

                            this.paramValues[pName]=pValue;
                            if(this.disableEvents==false)
                                this.fireEvent("CHANGE", {value: this.paramValues});
                            if (this.node) {
                                this.node.data("params", this.params);
                            }
                        },
                        getValues: function () {
                            return this.paramValues;
                        }
                    }
                },
                // Aunque derive de Expando, Loop no se basa en parametrizableString, sino directamente en path.
                LoopExpando: {
                    inherits: "Expando",
                    construct: function () {
                        this.oManager = null;
                        this.resolver = null;
                        this.Expando("sivloop");
                        this.childNodes = [];
                        this.nest = true;
                    },
                    destruct: function () {
                        this.reset();
                        if (this.resolver)
                            this.resolver.destruct();
                        this.childNodes = null;
                    },
                    methods: {
                        _initialize: function (node, nodeManager, stack, nodeExpandos) {
                            this.origHTML = [];
                            this.stack = stack;
                            this.node = node;
                            for (var k = 0; k < node[0].childNodes.length; k++) {
                                var cNode = node[0].childNodes[k];
                                if (cNode.nodeType != 3 && cNode.nodeType != 8)
                                    this.origHTML.push(cNode.cloneNode(true));
                            }
                            if (typeof node.data("sivnested") !== "undefined")
                                this.nest = node.data("sivnested");

                            this.contextParam = node.data("contextindex");
                            this.resolver = new Siviglia.Path.PathResolver(stack, node.data("sivloop"));
                            this.resolver.addListener("CHANGE", this, "update", "LoopExpando:" + this.str);
                            this.resolver.getPath();
                            return false;
                        },
                        reset: function () {
                            if (this.oManager) {
                                this.oManager.destruct();
                            }
                            if (this.ownStack) {
                                this.ownStack.destruct()
                            }

                        },
                        update: function (event, params) {
                            for (var k = 0; k < this.childNodes.length; k++)
                                this.childNodes[k].remove();

                            this.reset();
                            if(params.valid===false)
                                return;
                            this.ownStack = this.stack.getCopy();
                            this.oManager = new Siviglia.UI.HTMLParser(this.ownStack);

                            var val = params.value;
                            if(typeof params.value.__type__!=="undefined")
                                val=params.value.getValue();
                            if (!val)
                                val = [];

                            var contextRoot;
                            var newNode;
                            var cb = (function (key, value) {
                                contextRoot = {};
                                if(!this.ownStack.hasPrefix("@"))
                                    var contextContext = new Siviglia.Path.BaseObjectContext(contextRoot, "@", this.ownStack);
                                else {
                                    contextRoot = this.ownStack.getRoot("@");
                                }
                                contextRoot[this.contextParam] = value;
                                contextRoot[this.contextParam + "-index"] = key;
                                var reference = this.node[0];

                                for (var j = 0; j < this.origHTML.length; j++) {
                                    var curNode = this.origHTML[j].cloneNode(true);
                                    if (curNode.nodeType == 1)
                                        this.oManager.parse($(curNode));
                                    if (this.nest)
                                        newNode.appendChild(curNode);
                                    else {
                                        reference.parentNode.insertBefore(curNode, reference.nextSibling);
                                        this.chilNodes.push({node:$(curNode),value:value});
                                        reference = curNode;
                                    }
                                }

                            }).bind(this);

                            var valType = val.constructor.toString();
                            newNode=document.createElement("div");

                            if (valType.substr(0,16) =="function Array()")
                                val.map(function (value, index) {
                                    cb(index, value);
                                });
                            else {
                                if (valType.indexOf("bject") > 0) {
                                    for (var k in val) {
                                        cb(k, val[k]);
                                    }
                                } else {
                                    //alert("Indicado LoopExpando sobre path que no es un array");
                                    return;
                                }
                            }
                            this.node[0].innerHTML = "";
                            $(newNode).children().appendTo(this.node);
                        }
                    }
                },
                EventExpando: {
                    inherits: "Expando",
                    construct: function () {
                        this.Expando("sivevent");
                    },
                    destruct: function () {
                        this.reset();
                        this.node.unbind();
                    },
                    methods: {
                        _initialize: function (node, nodeManager, stack, nodeExpandos) {
                            this.node = node;
                            var attr = node.data(this.expandoTag);
                            var callback = node.data("sivcallback");
                            if (!callback)
                                throw "Event Expando missing data-sivcallback expando";
                            var evContext = null;
                            try {
                                evContext = stack.getRoot("*");
                            } catch (e) {
                                evContext = window;
                            }
                            var paramsExpando = node.data("sivparams");
                            var paramsObj;
                            if (paramsExpando)
                                paramsObj = nodeExpandos["sivparams"].getValues();
                            node.data("event_caller", evContext);
                            node.data("event_method", callback);
                            var callbackBuilder = function (evName) {
                                return function (event) {
                                    var caller = $(this).data("event_caller");
                                    var params = [];
                                    params.push($(this));
                                    params.push(paramsObj);
                                    var method = $(this).data("event_method");
                                    // Si existe caller.invoke, es que es un widget
                                    if (caller.invoke)
                                        return evContext.invoke(method, params, evName, event);
                                    else
                                        return evContext[method].apply(caller, params, evName, event);
                                }
                            };
                            this.node = node;

                            var events = attr.split(",");
                            events.map(function (item) {
                                $(node).off(item);
                                $(node).on(attr, callbackBuilder(attr));
                            });
                        },
                        reset: function () {
                            var attr = this.node.data(this.expandoTag);
                            var events = attr.split(",");
                            events.map(function (item) {
                                this.node.unbind(item);
                            }.bind(this));
                        }
                    }
                },
                IfExpando: {
                    inherits: "Expando",
                    construct: function () {
                        this.oManager = null;
                        this.Expando("sivif");
                    },
                    destruct: function () {
                        if (this.oManager)
                            this.oManager.destruct();
                    },
                    methods: {
                        _initialize: function (node, nodeManager, stack, nodeExpandos) {

                            this.origHTML = [];
                            while (node[0].childNodes.length>0) {
                                var n = node[0].childNodes[0];
                                var s = n.cloneNode(true);
                                n.parentElement.removeChild(n);
                                this.origHTML.push(n);
                            }
                            this.origDisplay = node[0].style.display;

                            this.Expando$_initialize(node, nodeManager, stack, nodeExpandos);
                            return false;
                        },
                        update: function (val) {
                            if (!eval(val))
                                this.removeContent();
                            else
                                this.restoreContent();
                        },
                        restoreContent: function () {
                            if (this.oManager)
                                this.oManager.destruct();
                            this.oManager = new Siviglia.UI.HTMLParser(this.stack);
                            this.node.html("");
                            var curNode;
                            for (var j = 0; j < this.origHTML.length; j++) {
                                curNode = this.origHTML[j].cloneNode(true);
                                if (curNode.nodeType == 1)
                                    this.oManager.parse($(curNode));
                                this.node.append(curNode);
                            }
                            this.node.css("display", this.origDisplay);
                            this.dontRecurse = false;
                        },
                        removeContent: function () {
                            this.node[0].innerHTML = "";
                            if (this.oManager) {
                                this.oManager.destruct();
                            }

                            this.node.css("display", "none");
                            this.dontRecurse = true;
                        }
                    }
                },
            }
    }
)

Siviglia.Utils.buildClass(
    {
        context: 'Siviglia.UI.Expando',
        classes: {
            WidgetExpando: {
                inherits: 'Expando',
                construct: function () {
                    this.Expando("sivwidget");
                },
                methods: {
                    _initialize: function (node, nodeManager, pathRoot, contextObj, caller) {
                        this.caller = caller;
                        this.widgetName = node.data("sivwidget");
                        this.widgetNode = node[0];
                        this.widgetCode = node.data("widgetcode");
                        this.widgetParams = node.data("widgetparams");
                        if(typeof Siviglia.UI.Expando.WidgetExpando.prototype.widgets=="undefined")
                            Siviglia.UI.Expando.WidgetExpando.prototype.widgets={};
                        Siviglia.UI.Expando.WidgetExpando.prototype.widgets[this.widgetName] = this;
                        this.context = contextObj;
                        this.pathRoot = pathRoot;
                        node[0].removeAttribute("sivWidget");
                        node.removeData("sivWidget");
                        return false;
                    },
                    getNode: function () {
                        var newNode= $(this.widgetNode).clone(true);
                        newNode[0].removeAttribute("data-sivwidget");
                        newNode.removeData("sivwidget");
                        return newNode;
                    },
                    getClass: function(){
                        if(typeof this.widgetCode=="undefined") {
                            console.warn("El widget " + this.widgetName + " no tiene clase asociada.Se asume " + this.widgetName);
                            this.widgetCode=this.widgetName;
                        }


                        var curClass = Siviglia.Utils.stringToContextAndObject(this.widgetCode);
                        if(typeof curClass.context[curClass.object]==="undefined")
                        {
                            throw "ERROR::LA CLASE DEFINIDA PARA EL WIDGET "+this.widgetName+" ("+this.widgetCode+") NO EXISTE";
                        }


                        return this.widgetCode;
                    }
                }
            },
            WidgetFactory: {
                construct: function () {
                },
                methods: {
                    hasInstance:function(widgetName)
                    {
                        var lib = Siviglia.UI.Expando.WidgetExpando.prototype.widgets;

                        return lib && lib[widgetName];
                    },
                    get:function(widgetName,context)
                    {
                        var ins=this._getFromCache();
                        if(ins)
                        {
                            var p = $.Deferred();
                            p.resolve(ins);
                            return p;
                        }
                        return this._getFromRemote(widgetName,context);
                    },
                    _getFromCache:function(widgetName,context)
                    {
                        var lib = Siviglia.UI.Expando.WidgetExpando.prototype.widgets;
                        if (lib && lib[widgetName])
                            return lib[widgetName];
                        return null;
                    },
                    getInstance: function (widgetName,context) {

                        var p=this._getFromCache(widgetName,context);
                        if(p)
                            return p;
                        return this._getFromRemote(widgetName,context);
                    },
                    _getFromRemote:function(widgetName,context)
                    {
                        if(typeof Siviglia.UI.Expando.WidgetExpando.prototype.widgetPromises[widgetName]!=="undefined")
                            return Siviglia.UI.Expando.WidgetExpando.prototype.widgetPromises[widgetName];
                        var p = $.Deferred();
                        Siviglia.UI.Expando.WidgetExpando.prototype.widgetPromises[widgetName]=p;
                        var lib = Siviglia.UI.Expando.WidgetExpando.prototype.widgets;
                        Siviglia.Utils.load([
                            {"type":"widget",
                                "template":"/js/"+widgetName.replace(/\./g,"/")+".html",
                                "js":"/js/"+widgetName.replace(/\./g,"/")+".js",
                                "context":context
                            }
                        ]).then(function(){
                            // Cuando se ha parseado el nodo al cargar el widget, se ha autoañadido a la cache.
                            p.resolve(lib[widgetName]);
                        });

                        return p;
                    }
                }
            },

            View: {
                construct: function (template, params, widgetParams,node,  context) {
                    this.__template = template;
                    this.__params = params;
                    this.__node = node;
                    this.rootNode=node; // Solo por compatibilidad
                    this.__context = context.getCopy();
                    this.__widgetParams = widgetParams;
                    this.oManager=null;
                    var plainCtx = new Siviglia.Path.BaseObjectContext(this, "*", this.__context);
                    if(Siviglia.UI.viewStack.length>0)
                        this.parentView=Siviglia.UI.viewStack[Siviglia.UI.viewStack.length-1];
                    else
                        this.parentView=null;
                },
                destruct:function()
                {
                    if(this.oManager)
                        this.oManager.destruct();
                },
                methods: {
                    __build: function () {
                        var widgetFactory = new Siviglia.UI.Expando.WidgetFactory();
                        var f=(function (w) {

                            var returned=this.preInitialize(this.__params);
                            var f=function() {
                                this.__composeHtml(w);
                                this.parseNode();
                                this.initialize(this.__params);
                            }.bind(this);
                            if(typeof returned!=="undefined" && returned.then)
                                returned.then(f);
                            else
                                f();
                        }).bind(this);
                        if(!widgetFactory.hasInstance(this.__template))
                            $.when(widgetFactory.getInstance(this.__template)).then(f);
                        else
                            f(widgetFactory.getInstance(this.__template));
                    },
                    __composeHtml: function (widget) {

                        var widgetNode = widget.getNode();
                        //this.__node[0].parentNode.insertBefore(widgetNode[0],this.__node[0].nextSibling);
                        this.__node.append(widgetNode);
                    },
                    parseNode:function()
                    {

                        this.oManager = new Siviglia.UI.HTMLParser(this.__context);
                        try {
                            this.__node[0].removeAttribute("data-sivview");
                            this.__node.removeData("sivview");
                            Siviglia.UI.viewStack.push(this);
                            this.oManager.parse(this.__node);
                            Siviglia.UI.viewStack.pop();
                        }catch(e)
                        {
                            console.dir(e);
                            throw e;
                        }
                        //console.log(this.__node[0].innerHTML)
                    }
                }

            },
            ViewExpando: {
                inherits: 'Expando',
                construct: function () {
                    this.Expando('sivview');
                    this.view = null;
                    this.name = null;
                    this.params = null;
                    this.str=null;
                    this.gotName=false;
                    this.paramListeners=[];
                },
                destruct: function () {
                    if (this.view !== null)
                        this.view.destruct();
                },
                methods:
                    {
                        _initialize: function (node, nodeManager, stack, nodeExpandos) {
                            // Listener de nombre de vista: Es el propio del Expando.


                            this.stack=stack;

                            // Obtener id para, en su caso, mapear esta instancia sobre la vista padre.
                            // Nota: Esto podria ser un array.

                            this.node = node;
                            this.params=typeof nodeExpandos["sivparams"]=="undefined"?null:nodeExpandos["sivparams"];
                            //if (this.params)
                            //    this.params.addListener("CHANGE", this, "updateParams", "ViewExpando:" + this.method);

                            this.Expando$_initialize(node, nodeManager, stack, nodeExpandos);

                            return false;
                        },
                        update: function (params) {
                            this.name = params;
                            this.rebuild();
                        },
                        updateParams:function(event,params){

                              this.rebuild();
                        },
                        rebuild:function()
                        {
                            this.node.removeData("sivview");
                            this.node[0].removeAttribute("data-sivview");

                            if (this.view)
                                this.view.destruct();
                            if(this.params)
                                this.currentParamsValues=this.params.getValues();
                            var widgetFactory = new Siviglia.UI.Expando.WidgetFactory();
                            var f=(function (w) {
                                var className=w.getClass();
                                var obj=Siviglia.Utils.stringToContextAndObject(className);

                                this.view = new obj.context[obj.object](this.name, this.currentParamsValues,null, this.node,  this.stack);
                                this.view.__build();

                            }).bind(this);

                            if(!widgetFactory.hasInstance(this.name)) {
                                $.when(widgetFactory.getInstance(this.name)).then(f);
                            }
                            else
                                f(widgetFactory.getInstance(this.name));

                        }

                    }
            }

        }
    });
Siviglia.UI.Expando.WidgetExpando.prototype.widgets={};
Siviglia.UI.Expando.WidgetExpando.prototype.widgetPromises={};
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
                        p.node = $('<div style="display:none"></div>');
                        $(document.body).append(p.node);
                    }
                    var pr=$.Deferred();
                    subpromises.push(pr);
                    var promises=[];
                    promises.push(loadHTML(p.template,p.node));
                    promises.push(loadJS(p.js));
                    $.when.apply($,promises).then(function(){
                        var parser= new Siviglia.UI.HTMLParser(p.context);
                        parser.parse(p.node);
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
Siviglia.deepmerge=(function(){
    var isMergeableObject=function (val) {
        var nonNullObject = val && typeof val === 'object'

        return nonNullObject
            && Object.prototype.toString.call(val) !== '[object RegExp]'
            && Object.prototype.toString.call(val) !== '[object Date]'
    }

    var emptyTarget=function(val) {
        return Array.isArray(val) ? [] : {}
    }

    var cloneIfNecessary=function(value, optionsArgument) {
        var clone = optionsArgument && optionsArgument.clone === true
        return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
    }

    var defaultArrayMerge=function(target, source, optionsArgument) {
        var destination = target.slice()
        source.forEach(function(e, i) {
            if (typeof destination[i] === 'undefined') {
                destination[i] = cloneIfNecessary(e, optionsArgument)
            } else if (isMergeableObject(e)) {
                destination[i] = deepmerge(target[i], e, optionsArgument)
            } else if (target.indexOf(e) === -1) {
                destination.push(cloneIfNecessary(e, optionsArgument))
            }
        })
        return destination
    }

    var mergeObject=function(target, source, optionsArgument) {
        var destination = {}
        if (isMergeableObject(target)) {
            Object.keys(target).forEach(function (key) {
                destination[key] = cloneIfNecessary(target[key], optionsArgument)
            })
        }
        Object.keys(source).forEach(function (key) {
            if (!isMergeableObject(source[key]) || !target[key]) {
                destination[key] = cloneIfNecessary(source[key], optionsArgument)
            } else {
                destination[key] = deepmerge(target[key], source[key], optionsArgument)
            }
        })
        return destination
    }

    var deepmerge=function(target, source, optionsArgument) {
        var array = Array.isArray(source);
        var options = optionsArgument || { arrayMerge: defaultArrayMerge }
        var arrayMerge = options.arrayMerge || defaultArrayMerge

        if (array) {
            return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
        } else {
            return mergeObject(target, source, optionsArgument)
        }
    }

    deepmerge.all = function deepmergeAll(array, optionsArgument) {
        if (!Array.isArray(array) || array.length < 2) {
            throw new Error('first argument should be an array with at least two elements')
        }

        // we are sure there are at least 2 values, so it is safe to have no initial value
        return array.reduce(function (prev, next) {
            return deepmerge(prev, next, optionsArgument)
        })
    }

    return deepmerge;
})();



