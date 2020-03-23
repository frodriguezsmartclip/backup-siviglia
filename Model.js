
// Nombres de modelos: App.<layer>.<objetoPadre>.Model
Siviglia.globals={};
Siviglia.Utils.buildClass({
    context:"Siviglia",
    classes:{
        Cache:{
            construct:function()
            {
                this.cache={};
            },
            methods:
            {
                add:function(key,value)
                {
                    this.cache[key]=value;
                },
                get:function(key)
                {
                    return this.cache[key];

                },
                delete:function(key)
                {
                    this.cache[key]=null;
                }
            }
        }
    }
    }
);
var Cache=new Siviglia.Cache();
Siviglia.globals.Cache=Cache;

Siviglia.Utils.buildClass(
    {
        "context":"Siviglia.Model.Frameworks",
        classes:
        {
            'Dojo':
            {
                construct:function(config)
                {
                    this.config=config;
                },
                methods:
                {
                    loadInput:function(inputType)
                    {
                        var p= $.Deferred();
                        require(['Siviglia/forms/inputs/' + inputType],function(i){
                            p.resolve(i);
                        });
                        return p;
                    },
                    addInputEventListener:function(input,event,callback)
                    {
                        input.on(event,callback);
                    },
                    getViewInstance:function(modelName,viewName,params,node,styles)
                    {
                        var cacheName=modelName.model+".views."+viewName;
                        var def=Cache.get(cacheName);
                        var d=document.createElement("div");
                        if(node)
                            node.appendChild(d);
                        var p= $.Deferred();
                        if(def)
                        {
                            p.resolve(def);
                            return $.when(new def(params,d));
                        }


                        var fName=modelName.getObjectPath()+'/'+viewName;
                        require([fName],function(fo)
                            {
                                // Se cachea
                                Cache.add(cacheName,fo);
                                fo.prototype.framework=self;
                                var view=new fo(params,d);
                                p.resolve(view);
                            },
                            function(err)
                            {
                                console.debug("No se encuentra la vista "+fName);
                            });
                        return p;
                    },

                    getFormInstance:function(mName,formName,params,node)
                    {
                        var context=mName.getContext();
                        var self=this;
                        var cacheName=mName.getCanonicalDotted()+".forms."+formName;
                        var d=document.createElement("div");
                        if(node)
                        {
                            node.appendChild(d);
                        }
                        var def=Cache.get(cacheName);
                        if(def)
                        {
                            return $.when(new def(params,d));
                        }
                        var p= $.Deferred();
                        /*
                         http://192.168.1.11/js/dojo/backoffice/ps_product/objects/PercentilProduct/actions/templates/Edit.html?1425315207668
                         */
                        var fName=mName.getObjectPath()+'/actions/'+formName;
                        require([fName],function(fo)
                        {
                            Cache.add(cacheName,fo);
                            fo.prototype.framework=self;
                            var form=new fo(params,d);
                            p.resolve(form);
                        });
                        return p;
                    }
                }
            },
            'Jquery':
            {
                construct:function(config)
                {
                    this.config=config;
                   // $.getScript(config.staticsUrl+'/'+Siviglia.Model.mapper.getCommonJSPrefix()+'jqwidgets/globalization/globalize.culture.'+config.locale+'.js');
                },
                methods:
                {
                    loadInput:function(inputType)
                    {
                        return $.when(Siviglia.Forms.JQuery.Inputs[inputType]);
                    },
                    addInputEventListener:function(input,event,callback)
                    {
                        input.on(event,callback);
                    },
                    getViewInstance:function(modelName,viewName,params,node,styles)
                    {
                        var p= $.Deferred();
                        var self=this;
                        if(viewName.substr(0,1)=='/')
                            viewName=viewName.substr(1);
                        var className='App.'+modelName.getCanonicalDotted()+"."+viewName.replace(/\//g,".");
                        var cO=Siviglia.Utils.stringToContextAndObject(className);
                        if(cO.context[cO.object])
                        {
                            cO.context[cO.object].prototype.framework=self;
                            // Se crea una instancia de la clase con su layout
                            p.resolve(new cO.context[cO.object](className.replace(/\./g,"/"),
                                {'params':params,'node':node},{},node,Siviglia.model.Root));
                        }
                        else
                        {
                            // Se tiene que cargar remotamente el widget.
                        }
                        return p;
                    },

                    getFormInstance:function(mName,formName,params,node)
                    {
                        var p= $.Deferred();
                        if(formName.substr(0,1)=='/')
                            formName=formName.substr(1);
                        var className='App.'+mName.getCanonicalDotted()+".actions."+formName.replace(/\//g,".");
                        var cO=Siviglia.Utils.stringToContextAndObject(className);
                        if(cO.context[cO.object])
                        {
                            cO.context[cO.object].prototype.framework=this;
                            // Se crea una instancia de la clase con su layout
                            p.resolve(new cO.context[cO.object](className.replace(/\./g,"/"),
                                {'params':params,'node':node},{},node,Siviglia.model.Root));
                        }
                        else
                        {
                            // Se tiene que cargar remotamente el widget.
                        }
                        return p;
                    }
                }
            }
        }
    }
);


Siviglia.Model.initialize=function(config)
{

    Siviglia.Model.config=config;
    var nn={};

    Siviglia.Model.mapper=new Siviglia.Model[config.mapper](config);
    Siviglia.Model.loader=new Siviglia.Model.Loader();
    Siviglia.Model.metaLoader=new Siviglia.Model.MetaLoader();

    switch(config.jsFramework)
    {
        case 'jquery':
        {
             Siviglia.Model.Framework=new Siviglia.Model.Frameworks.Jquery(config);
        }break;
        case "dojo":
        {
             Siviglia.Model.Framework=new Siviglia.Model.Frameworks.Dojo(config);
        }break;
    }
}

Siviglia.Utils.buildClass({
    context:'Siviglia.Model',
    classes:{
        ModelName:{
            construct:function(mname)
            {
                if(typeof mname=="string")
                {
                    var objPath=mname.replace('\\','/').split("/");
                    if(objPath[0]=="")
                        objPath=objPath.splice(1);
                    if(objPath[0]!="model")
                        objPath.unshift("model");
                    this.namespace=objPath[1];
                    var l=objPath.length;
                    this.model=objPath[l-1];
                    objPath.shift();
                    objPath.shift();
                    objPath.pop();
                    this.parentModel=objPath.length==0?null:objPath;
                }
                else
                {
                    var src=mname;
                    if(src.definition)
                            src=mname.definition;

                    this.model=src.name;
                    this.parentModel=src.parentObject;

                    this.namespace=src.layer;
                }
                this.parentModelStr=this.parentModel?this.parentModel.join("/"):"";
                this.config=Siviglia.Model.mapper.config;
            },
            methods:{
                getObjectPath:function()
                {
                    return Siviglia.Model.mapper.getObjectPath(this);
                },
                getObjectUrl:function()
                {
                    return Siviglia.Model.mapper.getObjectUrl(this);
                },
                getCanonical:function(ignoreNamespace)
                {
                    if(ignoreNamespace)
                        return 'model/'+(this.namespace==this.config.defaultNamespace?'':this.namespace+'/')+(this.parentModelStr+'/')+this.model;
                    return 'model/'+this.namespace+'/'+(this.parentModelStr)+this.model;
                },
                getCanonicalDotted:function(ignoreNamespace)
                {
                    return this.getCanonical(ignoreNamespace).replace(/\//g,'.');
                },
                getContext:function()
                {
                    if(this.parentModel)
                    {
                        if(App[this.namespace] && App[this.namespace][this.parentModel])
                                return App[this.namespace][this.parentModel];
                        return null;
                    }
                    return App["model"][this.namespace];
                },
                getDatasourceUrl:function(datasource,id,params)
                {
                    return Siviglia.Model.mapper.getDatasourceUrl(this,datasource,id,params);
                },
                getJSModelPath:function()
                {
                    return Siviglia.Model.mapper.getJSModelPath(this);
                },
                getActionUrl:function(actionName)
                {
                    return Siviglia.Model.mapper.getActionUrl(this,actionName);
                }

            }
        },
        BackofficeMapper:{
            construct:function(config)
            {
                this.config=config;
            },
            methods:{
                getMetaPath:function(options)
                {
                    return this.config.baseUrl+'/meta?'+options;
                },
                getModel:function(spec)
                {
                    var m=new Siviglia.Model.ModelName(spec);
                    return this.config.baseUrl+"/js/"+config.jsFramework+"/"+ this.getObjectPath(m)+"/Model.js";
                },
                getObjectPath:function(model)
                {
                    return 'model/'+model.namespace+'/'+(model.parentModel?model.parentModel.join('/objects/')+'/objects/':'')+model.model;
                },
                getObjectUrl:function(model)
                {
                    if(model.namespace==this.config.defaultNamespace)
                        return this.config.baseUrl+"/"+(model.parentModel?model.parentModel.join('/objects')+'/objects/':'')+model.model;
                    else
                        return this.config.baseUrl+"/"+ this.getObjectPath(model)
                },
                getDatasourceUrl:function(model,datasource,id,params)
                {
                    var query="";
                    if(params!==null) {
                        for(var k in params)
                            query+=(k+"="+params[k]+"&");
                    }
                    var baseUrl = this.config.baseUrl;
                    var datasourcePrefix = '';
                    if (this.config.datasourcePrefix !== undefined) {
                        datasourcePrefix = this.config.datasourcePrefix+"/";
                    }

                    return baseUrl+datasourcePrefix+model.getCanonical(1)+'/'+(id?id+'/':'')+datasource+'?output=json'+"&"+query;
                },
                getJSModelPath:function(model)
                {
                    return this.config.baseUrl+"/js/"+config.jsFramework+"/"+this.getObjectPath(model)+"/Model.js";
                },
                getActionUrl:function(model,actionName)
                {
                    return this.config.baseUrl+'/action';
                },
                getCommonJSPrefix:function()
                {
                    return "packages/";
                }

            }
        },
        FrontMapper:
        {
            inherits:'Siviglia.Model.BackofficeMapper',
            methods:
            {
                getActionUrl:function(model,actionName)
                {
                    return this.config.baseUrl+'/action/'+model.getCanonical(1)+'/'+actionName;
                },
                getCommonJSPrefix:function()
                {
                    return "common/";
                }
            }
        },
        Transport:{
            methods:
            {
                doGet:function async (url,okcallback,errCallback)
                {
                    var h= $.Deferred();
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
                                    if(okcallback)
                                        return okcallback(response);
                                    return;
                                }
                                h.reject(response);
                                if(response.error==2)
                                {
                                    alert("La sesion ha expirado.Debe hacer login de nuevo.");
                                    document.location.reload();
                                    return;
                                }

                                if(errCallback)
                                    return errCallback(response);
                                else
                                    throw response;
                            },
                            error:function(error){
                                    if(error.error && error.error==2)
                                    {
                                        alert("La sesion ha expirado.Debe hacer login de nuevo.")
                                        document.location.reload();
                                        return;
                                    }
                                    if(!errCallback)
                                        throw error;
                                    if(errCallback)
                                        return errCallback(error);
                            }
                    });
                    return h;
                },
                doPost:function(url,data,okcallback,errCallback)
                {
                        return $.ajax({
                            async:true,
                            dataType:'json',
                            data:data,
                            type:'POST',
                            url:url,
                            success:function(response){
                                if(response.success || !response.error)
                                {
                                    return okcallback(response);
                                }
                                if(errCallback)
                                    return errCallback(response);
                                else
                                    throw response;
                            },
                            error:function(error){
                                errCallback(error);
                                //throw error;
                            }
                        });
                },
                _loadScript:function(url, callback) {
                    var script = document.createElement("script");
                    script.type = "text/javascript";

                    if (script.readyState) { //IE
                        script.onreadystatechange = function() {
                            if ( script.readyState == "loaded" || script.readyState == "complete") {
                                script.onreadystatechange = null;
                                callback();
                            }
                        };
                    }
                    else { //Others
                        script.onload = function() {
                            callback();
                        };
                    }

                    script.src = url;
                    document.getElementsByTagName("head")[0].appendChild(script);
                }
            }
          },
        MetaLoader:{
            construct:function(config)
            {
                this.Model={};
                this.Datasource={};
                this.Form={};
                this.config=config;
                this.transport=new Siviglia.Model.Transport();
            },
            methods:
            {
                getModel:function(model){
                    var self = this;
                    var mName=new Siviglia.Model.ModelName(model);
                    var std=mName.getCanonical();
                    var cacheName=mName.getCanonicalDotted()+".Meta.Model";
                    var cached=Cache.get(cacheName);
                    if(cached)
                    {
                        return $.when(cached);
                    }
                    var c=this;
                    var p=$.Deferred();
                    this._baseLoad(model,"Model").then(
                        function(response){
                            var fName=mName.getJSModelPath();
                            self.transport._loadScript(fName, function() {
                                Cache.add(cacheName,response);
                                p.resolve(response);
                            });
                        });
                    return p;
                },
                _baseLoad:function(model,type,name)
                {
                    var mName=new Siviglia.Model.ModelName(model);
                    var std=mName.getCanonical();
                    var cacheName=mName.getCanonicalDotted()+".Meta."+type;
                    if(type=="Model")
                        name="model";
                    else
                        cacheName=cacheName+"."+name;
                    var cached=Cache.get(cacheName);
                    if(cached)
                        return $.when(cached);

                    var self=this;
                    var defer= $.Deferred();
                    this.getMultiple([{type:type,model:model,name:name}]).then(function(d){
                        defer.resolve(Cache.get(cacheName));
                        });
                    return defer;
                },
                getDataSource:function(model,dsName)
                {
                    return this._baseLoad(model,'Datasource',dsName);
                },
                getForm:function(model,formName){
                    return this._baseLoad(model,'Form',formName);
                },
                getMultiple:function(spec)
                {
                    var defer= $.Deferred();
                    var param=JSON.stringify(spec);
                    this.transport.doGet(Siviglia.Model.mapper.getMetaPath('multi='+param),
                        function(response){
                            var data=response.data;
                            for(var k=0;k<data.length;k++)
                            {
                                var mName=new Siviglia.Model.ModelName(data[k].model);
                                var std=mName.getCanonicalDotted();
                                var cacheName=std+".Meta."+data[k].type;
                                if(data[k].type!="Model")
                                    cacheName+=("."+data[k].name);
                                Cache.add(cacheName,data[k].definition);
                            }
                            defer.resolve(data);
                        },
                        function(error){
                            throw error;
                        }
                    );
                    return defer;
                },

                getType:function(definition)
                {
                    var p=$.Deferred();
                    var m=this;
                    if(definition.MODEL)
                    {
                        this.getModel(definition.MODEL).then(function(m){
                            p.resolve(m.getType(m.FIELDS[definition["FIELD"]]));
                        });
                        return p;
                    }
                    return $.when(new Siviglia.types[def["TYPE"]](def));
                }
            }
        },
        Loader:{
            construct:function(config)
            {
                this.config=config;
                this.transport=new Siviglia.Model.Transport();
            },
            methods:
            {
                getModel:function(model,id,datasource){

                    var mName=new Siviglia.Model.ModelName(model);
                    if(!datasource)
                        datasource='View';
                    var p=$.Deferred();
                    this.transport.doGet(mName.getDatasourceUrl(datasource,id),
                        function(response){
                            if(response.result==1 && response.count==1)
                            {
                                if(response.data.constructor.toString().indexOf("Object")>=0)
                                    p.resolve(response.data);
                                else
                                    p.resolve(response.data[0]);
                            }
                            else
                                p.reject(response);
                        },
                        function(error)
                        {
                            p.reject(error);
                            throw error;
                        }
                    );
                    return p;
                },
                getModelInstance:function(modelMeta,params)
                {
                    var mName=new Siviglia.Model.ModelName(modelMeta.modelName);
                    var context=mName.getContext();
                    if(context[mName.model])
                    {
                        if(context[mName.model]["Model"])
                        {
                            var i=new context[mName.model]["Model"](modelMeta,params);
                            return $.when(i);
                        }
                    }
                    else
                        context[mName.model]={};
                    var std=mName.getCanonical();
                    var p=$.Deferred();

                    this.transport._loadScript(mName.getJSModelPath(modelMeta), function() {
                        p.resolve(i);
                    });
                    return p;
                },

                getMemoryDataSource:function(model,name,params,p)
                {
                    var location=this.getDatasourceUrl(model,name,params,p);
                    var h=$.Deferred();
                    location=location+"&rnd="+Math.random();
                    var m=this;
                    this.transport.doGet(location,
                            function(response){
                                //if(p.DATASOURCES) {
                                //    return m.getDataSource(model,name,params,p);
                                //}
                                h.resolve(m.processMemoryDataSource(response));
                            },
                            function(error)
                            {
                                h.reject(error);
                            });
                            return h;
                },
                processMemoryDataSource:function(response)
                {
                    var p=response.definition;

                    if(!response.data) {
                        h.reject(error);
                        throw error;
                    }
                    if(!p.DATASOURCES)
                    {
                        if(p.ROLE=='view' ) {
                            var opt={data:response.data[0]};
                        }
                        else {
                            var opt={data:response.data}
                        }
                        if(p.INDEXFIELDS) {
                            opt.idProperty=p.INDEXFIELDS[0];
                        }
                        return new Siviglia.Model.Datasource.Memory(opt);
                    }
                    else
                    {
                        var v={};
                        for(var k in response.data)
                        {
                            v[k]=new Siviglia.Model.Datasource.Memory({data:response.data[k]});
                        }
                        return v;
                    }

                },
                /*
                    El formato de options es:
                    {sort:[{attribute:, descending:(true/false)}],page:,pagination:}}
                 */
                getDataSource:function(model, name, params,options)
                {
                        return new Siviglia.Data.RemoteDataSource(model,name,params,options);
                },
                getRawDataSource:function(model, name, params)
                {
                    var mName=new Siviglia.Model.ModelName(model);
                    var query='';
                    var location=mName.getDatasourceUrl(name,null,params);
                    var transport=new Siviglia.Model.Transport();
                    var h=$.Deferred();
                    transport.doGet(location,
                        function(response){
                            if(!response.data)
                            {
                                h.reject(error);
                                throw error;
                            }
                            h.resolve(response.data);
                        },
                        function(error)
                        {
                            h.reject(error);
                            throw error;
                        });
                    return h;
                },
                doAction:function(keys,data,objectName,actionName)
                {
                    var mName=new Siviglia.Model.ModelName(objectName);
                    var actionFormat={
                        "object":objectName,
                        "name":actionName,
                        "FIELDS":data
                        };
                    if(keys)
                    {
                        actionFormat["keys"]=keys;
                    }
                    var nd=new Date();
                    var p=$.Deferred();
                    var url=mName.getActionUrl(actionName);
                    var transport=new Siviglia.Model.Transport();
                    transport.doPost(url+'?output=json&nc='+nd.getTime(),
                        {json:JSON.stringify(actionFormat)},
                        function(response){
                            p.resolve(response);
                            return response;
                        },
                        function(error)
                        {
                            p.reject(error);
                            throw error;
                        }
                    );
                    return p;
                },
                preload:function(dependences)
                {
                    return Siviglia.Model.metaLoader.getMultiple(dependencies);
                }

            }
        },
        Model:
        {
            construct:function(modelName)
            {
                this.definition=null,
                this.instances=null,
                this.modelName=modelName;
            },
            methods:
            {
                create:function(params)
                {
                    var p=$.Deferred();
                    var c=this;
                    var h=0;
                    this.getDefinition().then(function(d){
                        $.when(Siviglia.Model.loader.getModelInstance(c,params)).then(
                            function(i) {
                                h=1;
                                p.resolve(i);
                            },
                            function(error) {
                                p.reject(error);
                            }
                        );
                    });

                return p;
            },
            load:function(id,nocache,datasource)
            {
                var c=this;
                var p=$.Deferred();
                this.getStore().then(
                    function(s)
                    {
                        if(!nocache)
                        {
                            if(s.get(id))
                                return when(s.get(id));
                        }
                        Siviglia.Model.loader.getModel(c.modelName,id,datasource).then(
                            function(d)
                            {
                                s.put(d);
                                Siviglia.Model.loader.getModelInstance(c).then(
                                    function(i)
                                    {
                                        i.load(d);
                                        p.resolve(i);
                                    },
                                    function(error)
                                    {
                                        p.reject(error);
                                    }
                                )
                            },
                            function(error)
                            {
                                /*if(!error.result)
                                throw error;*/
                                p.reject(error);
                            }
                        );
                    },
                    function(err)
                    {
                        p.reject(err);
                    }
                );
            return p;
        },
        getStore:function()
        {
            var c=this;
            var p=$.Deferred();
            return $.when(this.instances ||
                (function(){
                    c.getDefinition().then(function(d){
                        c.instances=new Siviglia.Model.Datasource.Memory({data:[],idProperty:d.INDEXFIELDS[0]});
                        p.resolve(c.instances);
                    },
                    function(error)
                    {
                        throw error;
                        p.reject(error);
                    }
                )
                return p;
            })());

        },
        getDefinition:function()
        {
            var c=this;
            var p= $.Deferred();
            if(this.definition)
                p.resolve(this.definition);
            else
                Siviglia.Model.metaLoader.getModel(this.modelName).then(
                    function(d){
                        c.definition=d;
                        p.resolve(d);
                    },function(error){throw error;});
            return p;
        },
        getMemoryDataSource:function(dsName,params)
        {
            var c=this;
            var p=$.Deferred();
            this.getDefinition().then(function(def){
                        $.when(Siviglia.Model.loader.getMemoryDataSource(c,dsName,params,null)).then(
                            function(data)
                            {
                                p.resolve(data);
                            },
                            function(error)
                            {
                                throw error;
                                p.reject(error);
                            });

            });
            return p;
        },
        getDataSource:function(dsName,params,options,controller)
        {
            // model,dsname,params,controller
            var c=this;
            var p=$.Deferred();
            var t={};
            for(var k in params){t[k]=params[k];}
            for(var k in options){t[k]=options[k];}
            this.getDefinition().then(function(def){
                var ds=new Siviglia.Data.FrameworkDataSource(c.modelName,dsName,params,controller);
                ds.addListener("LOADED",null, function(data) {p.resolve(data);});
                ds.addListener("LOAD_ERROR",null,function(){p.reject();});
                ds.addListener("INVALID_DATA",null,function(){p.reject()});
            });
            return p;
        },
        getRawDataSource:function(dsName,params)
        {
            var c=this;
            var p=$.Deferred();
            Siviglia.Model.loader.getRawDataSource(c.modelName,dsName,params).then(function(data)
            {
                p.resolve(data);
            },
            function(error)
            {
                throw error;
                p.reject(error);
            });
            return p;
        },
        getFormDefinition:function(actName)
        {
            var c=this;
            var n=this.getDefinition();
            return n.then(
                function(d){
                    return Siviglia.Model.metaLoader.getForm(c.modelName,actName);
                },
                function(error)
                {
                    throw error;
                }
            );
        },
        getView:function(viewName,params,targetNode,framework)
        {
            var p=$.Deferred();
            var frameworkInstance=Siviglia.Model.Framework;
            if(typeof framework!="undefined")
                frameworkInstance=new Siviglia.Model.Frameworks[framework](Siviglia.Model.config);

            var self = this;
            this.getDefinition().then(function(definition){
                var mName=new Siviglia.Model.ModelName(self.modelName);
                var context=mName.getContext();
                if(context[mName.model]["views"] && context[mName.model]["views"][viewName])
                {
                    var d=document.createElement("div");
                    if(targetNode)
                    {
                        targetNode.appendChild(d);
                    }
                    var c=context[mName.model]["views"][viewName];
                    var newInstance=new c(params,d);
                    if(typeof framework !="undefined")
                        newInstance.framework=frameworkInstance;
                    p.resolve(newInstance);
                }
                    frameworkInstance.getViewInstance(mName,viewName,params,targetNode).then(
                    function(i)
                    {
                        i.framework=frameworkInstance;
                        p.resolve(i);
                    },
                    function()
                    {
                        p.reject();
                    }
                )
            });
            return p;
        },
        getLayer:function()
        {
            return this.getDefinition().then(function(d){
                var m=Siviglia.Model.ModelName(d);
                return m.namespace;},
                function(error)
                {throw error;}
            );
        },
        getPrefix:function()
        {
            return when(this.getDefinition(),function(d){
                if(d.isPrivate!="1")
                    return d.layer;
                return d.layer+"/"+ d.parentObject+"/objects/";
            });
        },
        getClassName:function()
        {
            if(this.definition.isPrivate)
                return this.definition.parentObject+"\\"+this.modelName;
        },
        getDataSourceDefinition:function(dsName)
        {
            return Siviglia.Model.metaLoader.getDataSource(this.modelName,dsName);
        },
        add:function(data,actionName)
        {
            return Siviglia.Model.loader.doAction(null,data,this.modelName,actionName).then(function(r){
                if(r.error==0)
                    this.instances.add(r.data)
                return r;
            });
        },
        callForm:function(indexes,data,actionName)
        {
            var c=this;
            var myIndexes={};

            return Siviglia.Model.loader.doAction(indexes,data,this.modelName,actionName);
        },
        update:function(indexes,data,actionName)
        {
            var c=this;
            var myIndexes={};
            var p=$.Deferred();
            Siviglia.Model.loader.doAction(indexes,data,this.modelName,actionName).then(function(r){
                if(r.error==0)
                {
                    p.resolve(r);
                    // this.instances.remove(r[c.definition.INDEXFIELDS[0]]);
                    // this.instances.add(r.data);
                }
                else
                    p.reject(r);
                return p;
            },
            function(error){
                p.reject(error)
                return p;
            })
            return p;
        },
        save:function(instance)
        {
            p=$.Deferred();
            var c=this;
            var i=this.definition.INDEXFIELDS;
            var myIndexes={};
            var targetAction='Edit';
            if(instance.editAction)
                targetAction=instance.editAction;
            for(var k=0;k<i.length;k++)
            {
                if(instance.getField(i[k]).getType().hasValue())
                {
                    myIndexes[i[k]]=instance.get(i[k]);
                }
                else
                {
                    myIndexes=null;
                    targetAction='Add';
                    break;
                }
            }
            var params={};
            for(k in instance.fields)
            {
                params[k]=instance.get(k);
            }
            Siviglia.Model.loader.doAction(myIndexes,params,this.modelName,targetAction).then(function(r){
                if(r.error==0)
                {
                    //this.instances.remove(r[c.definition.INDEXFIELDS[0]]);
                    //this.instances.add(r.data);

                    instance.__onSaved(r);
                    p.resolve(r);
                }
                else
                    p.reject(r);
                },
                function(error){
                    p.reject(error)
                }
            )
            return p;
        },
        remove:function(indexes)
        {
            var c=this;
            Siviglia.Model.loader.doRemove(this.definition,indexes);
        },
        getLoader:function()
        {
            return Siviglia.Model.loader;
        }
    }
        }

    }
});


