var globalCounter=0;
Siviglia.Utils.buildClass(
    {
        context: "Siviglia.Path",
        classes: {
            ContextStack: {
                construct: function () {
                    this.contextRoots={};
                    this.contextPointers={};
                },
                methods: {
                    addContext: function (handler) {
                        var prefix=handler.getPrefix();
                        if(prefix==="")
                            prefix="/";
                        if(!this.hasPrefix(prefix))
                            this.contextRoots[prefix]=[];
                        this.contextRoots[prefix].push(handler);
                        this.contextPointers[prefix]=handler;
                        handler.setStack(this);
                    },
                    removeContext:function(handler)
                    {
                        var prefix=handler.getPrefix();
                        if(prefix==="")
                            prefix="/";
                        if(!this.hasPrefix(prefix))
                            throw "INVALID CONTEXT REQUESTED:"+prefix;
                        var ctx=this.contextRoots[prefix].pop();
                        ctx.destruct();
                        var l=this.contextRoots[prefix].length;
                        if(l===0) {
                            delete this.contextRoots[prefix];
                            delete this.contextPointers[prefix];
                        }
                        else
                        {
                            this.contextPointers[prefix]=this.contextRoots[prefix][l-1];
                        }
                    },
                    getContext: function (prefix) {
                        if (typeof this.contextPointers[prefix] != "undefined")
                            return this.contextPointers[prefix];
                        if(!this.hasPrefix("/"))
                            throw new Exception("INVALID CONTEXT REQUESTED:"+prefix);
                        return this.contextPointers["/"];
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
                        return new Siviglia.Path.BaseCursor(this.contextPointers[prefix].getRoot());
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
                        this.id=globalCounter;
                        globalCounter++;
                        this.objRoot=objRoot;
                        this.pathStack=[];
                        this.remListeners=[];
                        this.__lastTyped=false;
                        this.reset();
                    },
                    destruct:function()
                    {
                        console.log("DESTROYING "+this.id);
                        this.cleanListeners();
                    },
                    methods:{
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
                                    cVal.addListener("CHANGE",this,"onChange",1);
                                    this.remListeners.push(cVal);
                                    this.pointer=cVal;
                                    return cVal.getValue()
                            }
                            else {
                                var v=this.pointer[spec];
                                if(typeof v==="undefined")
                                    throw "Unknown path "+spec;
                                if(typeof v=="object" && v!==null)
                                {
                                    if(v.hasOwnProperty("__type__"))
                                    {
                                        v.addListener("CHANGE",this,"onChange",this.id);
                                        this.remListeners.push(v);
                                        this.__lastTyped=true;
                                    }
                                }
                                else
                                    this.addPathListener(this.pointer,spec);
                                this.pointer=this.pointer[spec];
                            }
                        },
                        getValue:function()
                        {
                            if(this.__lastTyped==true)
                                return this.pointer.getValue();
                            return this.pointer;
                        },
                        addPathListener:function(parent,propName)
                        {
                            Siviglia.Path.eventize(parent,propName);
                            var m=this;
                            parent["_"+propName].addListener("CHANGE",this,"onChange");
                            this.remListeners.push(parent["_"+propName]);
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
                    this.firing=false;
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
                        this.fireEvent("CHANGE", {value: newVal,valid:this.valid});
                        this.firing=false;
                        return newVal;
                    },
                    parse:function(pathParts)
                    {
                        // TODO : Eliminar listeners.

                        var root=this.contexts.getRoot(pathParts[0].prefix);
                        var cursor=this.contexts.getCursor(pathParts[0].prefix);
                        this.cursors.push(cursor);
                        var m=this;
                        cursor.addListener("CHANGE",function(){
                             m.getPath();
                        })
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
                        for(var k=0;k<this.cursors.length;k++)
                            this.cursors[k].destruct();
                        this.cursors=[];
                    }
                }
            }
        }
    });

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
                    construct:function(str,contextStack)
                    {
                        this.contextStack=contextStack;
                        this.BASEREGEXP=/\[%(?:(?:([^: ,%]*)%\])|(?:([^: ,]*)|([^:]*)):(.*?(?=%\]))%\])/g;
                        this.BODYREGEXP=/\{%(?:([^%:]*)|(?:([^:]*):(.*?(?=%\}))))%\}/g;
                        this.PARAMREGEXP=/([^|$ ]+)(?:\||$|(?: ([^|$]+)))/g;
                        this.SUBPARAMREGEXP=/('[^']*')|([^ ]+)/g;
                        this.paths=[];
                        this.str=str;
                        this.pathController=null;

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
                                var controller=new Siviglia.Path.PathResolver(this.contextStack,path);
                                controller.addListener("CHANGE",this,"onListener");
                                this.paths.push(controller);
                                var val=controller.getPath();
                                if(!controller.isValid()) {
                                    this.parsing=false;
                                    throw new Siviglia.Path.ParametrizableStringException("Unknown path:" + path);
                                }
                                if(val===null) {
                                    this.parsing=false;
                                    throw new Siviglia.Path.ParametrizableStringException("Null value::" + path);
                                }
                                return val;
                            },
                            removeAllPaths:function()
                            {
                                for(var k=0;k<this.paths.length;k++)
                                    this.paths[k].destruct();
                            },
                            onListener:function()
                            {
                                if(!this.parsing) {
                                    this.removeAllPaths();
                                    this.fireEvent("CHANGE", {value: this.parse()});
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
                                        throw new Siviglia.Utils.ParametrizableStringException("Parameter not found:"+tag);
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


    if (!obj.hasOwnProperty("_" + propName)) {

        var v = obj[propName];
        var ev = new Siviglia.Dom.EventManager();

        Object.defineProperty(obj, "_" + propName, {
            get: function () {
                return ev;
            },
            set: function (val) {
            },
            enumerable: false
        });

        Object.defineProperty(obj, propName, {
            get: function () {
                return v;
            },
            set: function (val) {
                if (v!==val) {
                    if (typeof val === "object" && val!==null)
                        v = Siviglia.Path.Proxify(val, ev);
                    else
                        v = val;
                    if (!obj.__disableEvents__)
                        ev.fireEvent("CHANGE", {object: obj, property: propName, value: val});
                }
            }
        });
    }
}

Siviglia.Path.Proxify=function(obj,ev)
{
    var curVal=obj;

    var objProxy = new Proxy(obj,{
        get:function(target,prop)
        {
            return curVal[prop];
        },
        apply:function(target,thisArg,list)
        {
            return curVal.target.apply(thisArg,list);
        },
        set: function (target, prop,value) {
            curVal[prop]=value;
            if(!disableEvents)
                ev.fireEvent("CHANGE",{object:obj,value:value});
            return value;
        },
        deleteProperty:function(target,prop)
        {

            delete curVal[prop];
            if(!disableEvents)
                ev.fireEvent("CHANGE",{object:obj,property:propName,value:undefined});
        }
    });
}
