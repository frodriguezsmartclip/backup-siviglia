
Siviglia.Utils.eventize=function(obj,propName)
{
    var srcObject=obj[propName];
    if(typeof obj[propName]=="object")
    {
        if(!obj.hasOwnProperty("_"+propName)) {

            var ev=new Siviglia.Dom.EventManager();
            Object.defineProperty(obj, "_" + propName, {
                get: function () {
                    return ev;
                },
                set: function (val) {
                },
                enumerable: false
            });
            var objProxy = new Proxy(obj, {
                get:function(target,prop)
                {
                    return srcObject[prop];
                },
                apply:function(target,thisArg,list)
                {
                    return srcObject.apply(thisArg,list);
                },
                set: function (target, prop,value) {
                    srcObject[prop]=value;
                    oldValue=target[prop];
                    ev.fireEvent("CHANGE",{object:obj,oldValue:oldValue,property:propName,value:value});
                    return value;
                },
                deleteProperty:function(target,prop)
                {
                    oldValue=srcObject[prop];
                    delete srcObject[prop];
                    ev.fireEvent("CHANGE",{object:obj,oldValue:oldValue,property:propName,value:undefined});
                }
            })
            obj[propName]=objProxy;
        }
    }
    else {
        if (obj.hasOwnProperty("_" + propName))
            return;
        var ev = new Siviglia.Dom.EventManager();
        var cVal = obj[propName];
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
                return cVal;
            },
            set: function (value) {
                oldValue = obj[propName];
                cVal = value;
                ev.fireEvent("CHANGE", {object: obj, oldValue: oldValue, property: propName, value: value});
            }
        });
    }
}


Siviglia.Utils.buildClass(
    {
        context: "Siviglia.Path",
        classes: {
            ContextStack: {
                construct: function () {
                        this.contextRoots=[];
                },
                methods: {
                    addContext: function (handler) {
                        var prefix=handler.getPrefix();
                        if(prefix=="")
                            prefix="default";
                        this.contextRoots[prefix] = handler;
                    },
                    getContext: function (prefix) {
                        if (typeof this.contextRoots[prefix] != "undefined")
                            return this.contextRoots[prefix];
                        return this.contextRoots["default"];
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
                    }
                }
            },
            Context:{
                construct:function(prefix,stack)
                {
                    this.prefix=prefix;
                    this.stack=stack;

                    stack.addContext(this);
                },
                methods:
                    {
                        getPrefix:function(){return this.prefix;}
                    }
            },
            BaseObjectContainerCursor:{
                construct:function(objRoot)
                {
                    this.objRoot=objRoot;
                    this.pathStack=[];
                    this.reset();
                },
                methods:{
                    reset:function()
                    {
                        this.pointer=this.objRoot;
                    },
                    moveTo:function(spec)
                    {
                        var type = typeof this.pointer[spec];

                        if(type=="undefined")
                            throw "Unknown path";
                        this.pointer=this.pointer[spec];
                        this.pathStack.push(spec);
                    },
                    getValue:function()
                    {
                        return this.pointer;
                    },
                    addListener:function(cb)
                    {
                        var parent=this.pathStack[this.pathStack.length-2];
                        var propName=this.pathStack.length-1;
                        Siviglia.Utils.eventize(parent,propName);
                        parent["_"+propName].addListener("CHANGE",function(event,params){
                            cb.apply(null,params.value);
                        })
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
                }
            },
            PathResolver: {
                inherits: "Siviglia.Dom.EventManager",
                construct: function (contexts,path) {
                    this.contexts = contexts;
                    this.remlisteners=[];
                    this.path=path;
                    this.valid=false;
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
                        curExpr = null;
                        var prefix="";
                        var startingPath=true;
                        for (var k = 0; k < str.length; k++) {
                            var char = str[k];
                            if(startingPath)
                            {
                                if(char!="/")
                                {
                                    prefix=char;
                                    k++;
                                    char=str[k];
                                }
                                startingPath=false;
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
                                }
                                    break;

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

                                }
                                break;

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
                        var p=this.path[0];
                        if(p!="/" && !this.contexts.hasPrefix(p)) {

                            this.stack = this.buildTree(this.path);
                            this.clearListeners();
                            this.isValid = true;
                            var newVal = this.parse(this.stack, true);
                        }
                        else
                        {
                            newVal=this.path;
                        }
                        this.fireEvent("CHANGE", {value: newVal});
                        return newVal;
                    },
                    parse:function(pathParts,setListener)
                    {
                         // TODO : Eliminar listeners.
                        var root=this.contexts.getRoot(pathParts[0].prefix);
                        var cursor=new Siviglia.Path.BaseObjectContainerCursor(root);
                        var lastPointer,lastLabel;
                        var m=this;
                        for(var k=0;k<pathParts.length && this.isValid ;k++)
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
                                        this.isValid=false;
                                    }
                                }break;
                                case "subpath":
                                {
                                    var val=this.parse(p.components,p.subtype=="static"?false:true);
                                    if(this.isValid) {
                                        lastPointer = cursor.getValue();
                                        lastLabel = val;
                                        cursor.moveTo(val);
                                    }
                                }break;
                            }
                        }
                        if(this.isValid) {
                            if (this.remlisteners.indexOf(lastPointer["_" + lastLabel]) < 0) {
                                Siviglia.Utils.eventize(lastPointer, lastLabel);
                                this.remlisteners.push(lastPointer["_" + lastLabel]);
                                lastPointer["_" + lastLabel].addListener("CHANGE", null, function () {
                                    var newVal = m.parse(m.stack, true);
                                    m.fireEvent("CHANGE", {value: newVal});
                                });
                            }
                        }
                        return cursor.getValue();
                    },
                    clearListeners:function(){
                        for(var k=0;k<this.remlisteners.length;k++)
                         this.remlisteners[k].removeListeners(this);
                    }
                }
            }
        }
    });


/*var pather=new Siviglia.Path.PathResolver(null);
console.dir(pather.buildTree("/a/b/c"));
console.dir(pather.buildTree("/aa/bb/cc"));
console.dir(pather.buildTree("/aa/{/bb/cc}"));
console.dir(pather.buildTree("/a/{/b}/{/c}"));
console.dir(pather.buildTree("/a/{/b/{/c}}"));
console.dir(pather.buildTree("/a/{/b/{/c}/d/{/e/f}}"));
*/
var sampleObj={

    c:"z",
    d:{
        q:1,
        h:2
    },
    e:{
        "z":"q",
        "p":"h"
    }
}
var sampleObj2={
    x:{
        y:"q"
    }
}
/*

var stack=new Siviglia.Path.ContextStack();
var plainCtx=new Siviglia.Path.BaseObjectContext(sampleObj,"",stack);
var pather=new Siviglia.Path.PathResolver(stack,"/d/{/e/{/c}}");
pather.addListener("CHANGE",function(evName,data){console.log("CAMBIADO A :"+data.value)});
pather.getPath();
setTimeout(function(){
    sampleObj.e.z="h";
    },2000);

setTimeout(function(){
    sampleObj.e.p="q";
    sampleObj.c="p";
},4000);



 */
/*
var stack=new Siviglia.Path.ContextStack();
var plainCtx=new Siviglia.Path.BaseObjectContext(sampleObj,"",stack);
var plain2=new Siviglia.Path.BaseObjectContext(sampleObj2,"@",stack);
var pather=new Siviglia.Path.PathResolver(stack,"/d/{@/x/y}");
pather.addListener("CHANGE",function(evName,data){console.log("CAMBIADO A :"+data.value)});
pather.getPath();
setTimeout(function(){sampleObj2.x.y="h"},3000);
*/
var stack=new Siviglia.Path.ContextStack();
var pather=new Siviglia.Path.PathResolver(stack,"abcde");
var p=pather.getPath();
//setTimeout(function(){sampleObj.c="p";},1000);


if(0) {
    var z = {a: 2, b: {q: 2}, c: []};
    Siviglia.Utils.eventize(z, "a");
    Siviglia.Utils.eventize(z, "b");
    Siviglia.Utils.eventize(z, "c");

    z._a.addListener("CHANGE", null, function () {
        console.log("CHANGED!!");
        console.dir(arguments)
    });
    z._b.addListener("CHANGE", null, function () {
        console.log("CHANGED B!!");
        console.dir(arguments)
    });
    z._c.addListener("CHANGE", null, function () {
        console.log("CHANGED C!!");
        console.dir(arguments)
    });


    setTimeout(function () {
        z.a = 12;
    }, 1000)
    setTimeout(function () {
        z.b["s"] = 22;
    }, 2000)
    setTimeout(function () {
        delete z.b["s"]
    }, 3000)
    setTimeout(function () {
        z.c.push(22);
    }, 4000)
    setTimeout(function () {
        z.c.pop()
    }, 5000)
}
if(0) {
    var params = {
        id_site: 1
    };
    var sourceDef = {
        "TYPE": "DataSource",
        "MODEL": "/model/web/Site",
        "DATASOURCE": "FullList",
        "PARAMS": {
            "id_site": "[%id_site%]"
        },
        "LABEL": "namespace",
        "VALUE": "id_site"
    }
    var sourceFactory = new Siviglia.Data.SourceFactory();
    var source = sourceFactory.getFromSource(sourceDef, null, params);
    source.fetch();
}


if(0) {
    var h = {};
    var s = new Siviglia.model.BaseTypedObject({
        "FIELDS": {
            "a": {
                "TYPE": "String",
                "MINLENGTH": 2
            },
            "q": {
                "TYPE": "Array",
                "VALUETYPE": {
                    "TYPE": "Dictionary",
                    "VALUETYPE": {
                        "TYPE": "Container",
                        "FIELDS": {
                            "h1": {"TYPE": "String"},
                            "e1": {"TYPE": "Boolean"}
                        }
                    }
                }
            },
            "d": {
                "TYPE": "TypeSwitcher",
                "TYPE_FIELD": "Type",
                "CONTENT_FIELD": "Content",
                "ALLOWED_TYPES": {
                    "b": {
                        "TYPE": "Container",
                        "FIELDS": {

                            "b1": {"TYPE": "Integer"},
                            "c1": {"TYPE": "Boolean"}
                        }
                    },
                    "c": {
                        "TYPE": "Dictionary",
                        "VALUETYPE": {
                            "TYPE": "Container",
                            "FIELDS": {
                                "h1": {"TYPE": "String"},
                                "e1": {"TYPE": "Boolean"}
                            }
                        }
                    }
                }
            }
        }
    }, h);
    s.ready().then(function (ins) {
        try {
            ins.a = "hola";
            s.d = {"Type": "b", "Content": {"b1": 4, "c1": true}};
            s.d.Type = "c";
            s.d.Content.pp = {"h1": "pepito", e1: true};
            s.q = [{aa: {h1: "aaa", e1: false}, bb: {h1: "zzz", e1: true}},
                {qq: {h1: "aaa1", e1: false}, dd: {h1: "zzz1", e1: true}},
                {t: {h1: "aaa2", e1: false}, bb: {h1: "zzz2", e1: true}}
            ];

            console.dir(s.q);

        } catch (e) {
            console.dir(e);
        }

    });

}
