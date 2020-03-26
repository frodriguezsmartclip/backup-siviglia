// Nombres de modelos: App.<layer>.<objetoPadre>.Model
Siviglia.globals = {};
Siviglia.Model={};

Siviglia.Utils.buildClass({
        context: "Siviglia",
        classes: {
            Cache: {
                construct: function () {
                    this.cache = {};
                },
                methods:
                    {
                        add: function (type, key, value) {
                            if (typeof this.cache[type] == "undefined")
                                this.cache[type] = {};
                            this.cache[type][key] = value;
                        },
                        get: function (type, key) {
                            if (typeof this.cache[type] == "undefined")
                                return null;
                            return this.cache[key];

                        },
                        delete: function (type, key) {
                            this.cache[type][key] = null;
                        }
                    }
            }
        }
    }
);
var Cache = new Siviglia.Cache();
Siviglia.globals.Cache = Cache;


Siviglia.Model.initialize = function (config) {

    Siviglia.Model.config = config;
    Siviglia.Model.mapper = new Siviglia.Model[config.mapper + "Mapper"](config);
    Siviglia.Model.loader = new Siviglia.Model.Loader();
}

Siviglia.Utils.buildClass({
    context: 'Siviglia.Model',
    classes: {
        ModelDescriptor: {
            construct: function (mname) {
                if (typeof mname == "string") {
                    var objPath = mname.replace('\\', '/').split("/");
                    if (objPath[0] == "")
                        objPath = objPath.splice(1);
                    if (objPath[0] != "model")
                        objPath.unshift("model");
                    this.namespace = objPath[1];
                    var l = objPath.length;
                    this.model = objPath[l - 1];
                    objPath.shift();
                    objPath.shift();
                    objPath.pop();
                    this.parentModel = objPath.length == 0 ? null : objPath;
                } else {
                    var src = mname;
                    if (src.definition)
                        src = mname.definition;

                    this.model = src.name;
                    this.parentModel = src.parentObject;

                    this.namespace = src.layer;
                }
                this.parentModelStr = this.parentModel ? this.parentModel.join("/") + "/" : "";
                this.config = Siviglia.Model.mapper.config;
            },
            methods: {
                getObjectPath: function () {
                    return Siviglia.Model.mapper.getObjectPath(this);
                },
                getObjectUrl: function () {
                    return Siviglia.Model.mapper.getObjectUrl(this);
                },
                getCanonical: function () {
                    return '/model/' + this.namespace + '/' + this.parentModelStr + this.model;
                },
                getCanonicalDotted: function () {
                    return this.getCanonical().substr(1).replace(/\//g, '.');
                },
                getDatasourceUrl: function (datasource, id, params) {
                    return Siviglia.Model.mapper.getDatasourceUrl(this, datasource, id, params);
                },
                getJSModelPath: function () {
                    return Siviglia.Model.mapper.getJSModelPath(this);
                },
                getActionUrl: function (actionName) {
                    return Siviglia.Model.mapper.getActionUrl(this, actionName);
                },
                getModelNamespace: function () {
                    var s = this.getCanonicalDotted();
                    return s[0].toUpperCase() + s.substr(1);
                },
                getModelMetaPath:function(model){
                    var m=this.getCanonical();
                    return Siviglia.Model.mapper.getModelMetaPath(m);
                }

            }
        },
        SivigliaMapper: {
            construct: function (config) {
                this.config = config;
            },
            methods: {
                getMetaPath: function (options) {
                    return this.config.metadataUrl;
                },
                getModelMetaPath: function (model) {
                    return this.getMetaPath() + model + "/definition";
                },
                getModel: function (spec) {
                    var m = new Siviglia.Model.ModelDescriptor(spec);
                    return this.config.baseUrl + "/js/" + this.config.mapper + "/" + this.getObjectPath(m) + "/Model.js";
                },
                getDatasourceUrl: function (model, datasource, id, params) {
                    var query = (params !== null) ? $.param(params) : "";
                    return this.config.baseUrl + "datasource/" + model.getCanonical() + '/' + (id ? id + '/' : '') + datasource + '?output=json' + "&" + query;
                },
                getJSModelUrl: function (model) {
                    var m = new Siviglia.Model.ModelDescriptor(model);
                    return this.config.baseUrl + "/js/" + this.config.mapper + m.getCanonical() + "/Model.js";
                },
                getActionUrl: function (model, actionName) {
                    return this.config.baseUrl + '/action';
                }
            }
        },
        Transport: {
            methods:
                {
                    doGet: function(url) {
                        var h = $.Deferred();
                        $.ajax({
                            async: true,
                            dataType: 'json',
                            data: '',
                            type: 'GET',
                            url: url,
                            success: function (response) {

                                if (response.success || !response.error)
                                    return h.resolve(response);

                                h.reject(response);
                                if (response.error == 2) {
                                    alert("La sesion ha expirado.Debe hacer login de nuevo.");
                                    document.location.reload();
                                }
                            },
                            error: function (error) {
                                if (error.error && error.error == 2) {
                                    alert("La sesion ha expirado.Debe hacer login de nuevo.")
                                    document.location.reload();
                                    return;
                                }
                                h.reject(error);
                            }
                        });
                        return h;
                    },
                    doSyncGet: function(url) {
                        var h = $.Deferred();
                        var result={};
                        $.ajax({
                            async: false,
                            dataType: 'json',
                            data: '',
                            type: 'GET',
                            url: url,
                            success: function (response) {

                                result={error:0,data:response};

                            },
                            error: function (error) {
                                result={error:error,data:null};
                            }
                        });
                        return result;
                    },

                    doPost: function (url, data) {
                        var h = $.Deferred();
                        $.ajax({
                            async: true,
                            dataType: 'json',
                            data: data,
                            type: 'POST',
                            url: url,
                            success: function (response) {
                                if (response.success || !response.error)
                                    return h.resolve(response);
                                h.reject(response);
                            },
                            error: function (error) {
                                h.reject(error);
                            }
                        });
                        return h;
                    }
                }
        },
        Loader: {
            construct: function (config) {
                this.config = config;
                this.transport = new Siviglia.Model.Transport();
            },
            methods:
                {
                    getModelDefinition:function(model)
                    {
                        var cached=Siviglia.globals.Cache.get("ModelDefinition",model);
                        if(cached)
                        {
                            return cached;
                        }
                        // La cargamos de remoto, pero de forma sincrona
                        // primero hay que componer la URL de destino, que es:
                        var dsc=new Siviglia.Model.ModelDescriptor(model);
                        var url=dsc.getModelMetaPath();
                        var result=this.transport.doSyncGet(url);
                        if(result.error==0) {
                            Siviglia.globals.Cache.add("ModelDefinition", model, result.data);
                            return result.data;
                        }
                        return null;
                    },
                    getModel: function (model, id, datasource) {


                        // Se ve si existe el objeto.
                        var instance = this._getInstanceForModel(model);
                        var m=this;
                        var h=$.Deferred();
                        var p = $.Deferred();

                        // Si la clase para este modelo ya existe, resolvemos la primera promesa.
                        if (instance != null)
                            h.resolve(instance);
                        else
                        {
                            // Si la clase para este modelo no existe, se intenta cargar de remoto.

                            var url=Siviglia.Model.mapper.getJSModelUrl(model);
                            Siviglia.Utils.load([url]).then(function(){
                                // Se vuelve a intentar encontrar la clase para este modelo.Ahora deberia existir.
                                instance=m._getInstanceForModel(model);
                                if(instance==null)
                                {
                                    // Si aqui la instancia esta a nula, es que la clase cargada no era la correcta.
                                    console.error("La clase para el modelo "+model+" no tiene el nombre correcto");
                                    h.reject();
                                }
                                Siviglia.globals.Cache.add("ModelDefinition",model,instance.__getDefinition());
                                // Aqui se resuelve la primera promesa
                                h.resolve(instance);
                            },function(){h.reject()});
                        }

                        // Se espera a que la primera promesa se resuelva.
                        h.then(function(instance){
                            // Si no se paso ningun id para este modelo, resolvemos la segunda promesa.
                            if(typeof id=="undefined")
                                p.resolve(instance);
                            else
                            {
                                // Si habia un id, se carga el datasource con los datos del modelo.
                                m._loadModel(instance,id,datasource).then(function(){
                                    // Y una vez cargado , se resuelve la segunda promesa.
                                    p.resolve(instance);
                                },function(){p.reject()});
                            }


                        },
                            function()
                            {
                                p.reject();
                            }
                            );
                        // Se retorna la segunda promesa.
                        return p;
                    },

                    _getInstanceForModel: function (model) {
                        var mName = new Siviglia.Model.ModelDescriptor(model);
                        var namespaced = mName.getModelNamespace();
                        var obj = Siviglia.Utils.stringToContextAndObject(namespaced);
                        if (typeof obj.context[obj.object] == "undefined") {

                            console.log("No existe localmente la clase " + namespaced + " para el modelo " + model);
                            return null;
                        }
                        return new obj.context[obj.object]();
                    },
                    /*
                       Esta funcion se llama cuando se sabe que la clase js del modelo
                       ya existe, sea porque se ha cargado, sea porque existia en la cache.
                     */
                    _loadModel: function (instance, id, datasource) {
                        var h = $.Deferred();

                        // Se ve si existe el objeto.
                        var m = this;
                        if (typeof datasource == "undefined")
                            datasource = "View";
                        // Se obtiene, del modelo, los campos indice.

                        var indexes = instance.getIndexFields();
                        var params = {};
                        if (indexes.length == 1)
                            params[indexes[0]] = id;
                        else {
                            for (var k = 0; k < indexes.length; k++) {
                                params[indexes[k]] = id[k];
                            }
                        }
                        m.getDataSource(instance.getName(), datasource, params).then(function (r) {
                            if (r.data.length != 1) {
                                h.reject();
                            }
                            instance.setValue(r.data[0]);
                            h.resolve(instance);
                        });
                        return h;
                    },
                    /*
                        El formato de options es:
                        {sort:[{attribute:, descending:(true/false)}],page:,pagination:}}
                     */
                    getDataSource: function (model, name, params, options) {
                        // Un datasource va a ser simplemente un BaseTypedObject con una definicion fija
                        // de datos, total de elementos, criterios de ordenacion, etc,etc.
                        var mName = new Siviglia.Model.ModelDescriptor(model);
                        var location = mName.getDatasourceUrl(name, null, params);
                        var transport = new Siviglia.Model.Transport();
                        var h = $.Deferred();
                        transport.doGet(location).then(
                            function (response) {
                                if (response.error) {
                                    h.reject(error);
                                }
                                var result = new Siviglia.Model.Datasource(model, params, response);
                                h.resolve(result);
                            },
                            function (error) {
                                h.reject(error);
                                throw error;
                            });
                        return h;

                    },
                    doAction: function (keys, data, objectName, actionName) {
                        var mName = new Siviglia.Model.ModelDescriptor(objectName);

                        var actionFormat = {
                            "MODEL": objectName,
                            "FORM": actionName,
                            "FIELDS": data

                        };
                        if (keys) {
                            actionFormat["KEYS"] = keys;
                        }
                        var nd = new Date();
                        var p = $.Deferred();
                        var url = mName.getActionUrl(actionName);
                        var transport = new Siviglia.Model.Transport();
                        transport.doPost(url + '?output=json&nc=' + nd.getTime(),
                            {json: JSON.stringify(actionFormat)},
                            function (response) {
                                p.resolve(response);
                                return response;
                            },
                            function (error) {
                                p.reject(error);
                                throw error;
                            }
                        );
                        return p;
                    }
                }
        },
        Datasource:
            {
                inherits: 'Siviglia.model.BaseTypedObject',
                construct: function (model, params, response) {
                    var meta = response.definition;
                    var paramsDef = meta.PARAMS;
                    var fieldsDef = meta.FIELDS;
                    // Se construye la definicion de este objeto.
                    // La definicion consiste en:
                    // Los parametros, como un container
                    // Los parametros de entrada/salida, como campos.
                    // Estos parametros son el count, la paginacion, los criterios de ordenacion,etc
                    // los datos, que son un array de contenedores con los datos de respuesta.
                    var definition = {
                        "FIELDS": {
                            "params": {
                                "TYPE": "Container",
                                "FIELDS": paramsDef
                            },
                            "settings": {
                                "TYPE":"Container",
                                "FIELDS": {
                                    "__sort": {"TYPE": "String"},
                                    "__sortDir": {"TYPE": "Enum", "VALUES": ["ASC", "DESC"], "DEFAULT": "ASC"},
                                    "__sort1": {"TYPE": "String"},
                                    "__sortDir1": {"TYPE": "Enum", "VALUES": ["ASC", "DESC"], "DEFAULT": "ASC"},
                                    "__group": {"TYPE": "String", "MAXLENGTH": 30},
                                    "__groupParam": {"TYPE": "String", "MAXLENGTH": 30},
                                    "__groupMin": {"TYPE": "String", "MAXLENGTH": 30},
                                    "__groupMax": {"TYPE": "String", "MAXLENGTH": 30},
                                    "__accumulated": {"TYPE": "Boolean"},
                                    "__partialAccumul": {"TYPE": "Boolean"},
                                    "__autoInclude": {"TYPE": "String"}
                                }
                            },
                            "data": {
                                "TYPE": "Array",
                                "ELEMENTS": {
                                    "TYPE": "Container",
                                    "FIELDS": fieldsDef
                                }
                            },
                            "count": {"TYPE": "Integer"},
                            "start": {"TYPE": "Integer"},
                            "end": {"TYPE": "Integer"}
                        }
                    };
                    this.BaseTypedObject(definition);
                    this["*params"]._setValue(params);
                    this["*data"]._setValue(response.data);
                }
            },

        Instance:
            {
                inherits: 'Siviglia.model.BaseTypedObject',
                construct:function(name,definition)
                {
                    this._name=name;
                    this._descriptor=new Siviglia.Model.ModelDescriptor(name);
                    this.BaseTypedObject(definition);
                },
                methods:
                    {
                        getName:function(){
                            return this._name;
                        },
                        getIndexFields: function () {
                            return this.__definition.INDEXFIELDS;
                        },
                        callForm: function (formName, data) {
                            var myIndexes = {};
                            var f;
                            for (var k = 0; k < this.__definition.INDEXFIELDS.length; k++) {
                                f = this.__definition.INDEXFIELDS[k];
                                myIndexes[f]=this["*f"].getValue();
                            }
                            var m = this;
                            if(typeof data=="undefined")
                                data=this.getValue();

                            var p = new $.Deferred();
                            Siviglia.Model.loader.doAction(myIndexes,data,this._name,formName).then(
                                function(r)
                                {
                                    this.fireEvent("FORM_SAVED",{form:formName,data:data});
                                    p.resolve();
                                },
                                function(e)
                                {
                                    console.log("ERROR GUARDANDO FORM");
                                    p.reject(e);
                                }
                            )
                            return p;
                        },
                        getDataSource: function (dsName, params) {
                            return Siviglia.Model.loader.getDataSource(this._name,dsName, params);
                        },
                        save: function (instance,actionName) {
                            var p = $.Deferred();
                            var m = this;
                            var i = this.__getDefinition().INDEXFIELDS;
                            var myIndexes = {};
                            var targetAction = Siviglia.issetOr(actionName,'Edit');


                            var vals=this.getPlainValue();
                            for (var k = 0; k < i.length; k++) {
                                if (!this["*"+i[k]].isEmpty()) {
                                    myIndexes[i[k]] = this[i[k]];
                                } else {
                                    myIndexes = null;
                                    targetAction = 'Add';
                                    break;
                                }
                                delete vals[i[k]];
                            }


                            Siviglia.Model.loader.doAction(myIndexes, vals, this._name, targetAction).then(
                                function (r) {
                                    if (r.error == 0) {
                                        m._setValue(r.data);
                                        p.resolve(r);
                                    } else
                                        p.reject(r);
                                },
                                function (error) {
                                    p.reject(error)
                                }
                            )
                            return p;
                        }
                    }
            },


        ModelFactory:
            {
                methods:
                    {
                        create: function (model) {
                            return Siviglia.Model.loader.getModel(model, null, null);
                        },
                        load: function (model,id, nocache, datasource) {
                            return Siviglia.Model.loader.getModel(model,id)
                        }
                    }
            }

    }
});


