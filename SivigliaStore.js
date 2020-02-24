Siviglia.Utils.buildClass(
    {
        context:'Siviglia.Data',
        classes:
            {
                SourceFactory:
                    {
                      methods:
                          {
                              /**
                               * Devuelve un SimpleListener, al que ponerle listeners de CHANGE, y hacerle "listen"
                               * @param source
                               * @param controller
                               * @param contextStack : stack de contextos.
                               */
                              getFromSource:function(source,controller,contextStack)
                              {
                                  var typeMap={
                                      "Array":"ArrayDataSource",
                                      "DataSource":"FrameworkDataSource",
                                      "Url":"RemoteDataSource",
                                      "Path":"PathDefinedDataSource",
                                      "TypedDataSource:":"TypedFrameworkDataSource"
                                  };
                                  var type=typeMap[source.TYPE];
                                  if(typeof type=="undefined")
                                      throw new Exception("Unknown source type:"+source.TYPE);
                                  return new Siviglia.Data[type](source,controller,contextStack);
                              }
                          }
                    },
                /*
                    DataSource base:
                    Recibe como parametro un fetcher (ver mas abajo), que es la clase que se encarga de
                    obtener los datos.
                    Lanza eventos sobre la carga del datasource.

                 */

                BaseDataSource:
                    {
                        inherits:"Siviglia.Dom.EventManager",
                        constants:{
                            EVENT_START_LOAD:"START_FETCHING",
                            EVENT_LOADED:"LOADED",
                            EVENT_LOADING:"LOADING",
                            EVENT_LOAD_ERROR:"LOAD_ERROR",
                            EVENT_INVALID_DATA:"INVALID_DATA",
                            CHANGE:"CHANGE"
                        },
                        construct:function(source,controller,stack)
                        {
                            this.source=this.processSource(source);
                            this.plainCtx=new Siviglia.Path.BaseObjectContext(source,"#",stack);
                            this.stack=stack;
                            this.controller=controller;
                            this.pstring=null;
                            this.EventManager();
                        },
                        destruct:function()
                        {
                            if(this.plainCtx) {
                                this.stack.removeContext(this.plainCtx);
                                this.plainCtx.destruct();
                            }
                            if(this.pstring)
                                this.pstring.destruct();
                        },
                        methods:
                            {
                                processSource:function(source)
                                {
                                    return source;
                                },
                                fetch:function()
                                {
                                    if(!this.pstring) {
                                        var parametrized=JSON.stringify(this.source);
                                        this.pstring = new Siviglia.Path.ParametrizableString(parametrized, this.stack);
                                        this.pstring.addListener("CHANGE",this,"onListener");
                                    }
                                    this.pstring.parse();
                                },
                                _dofetch:function(source)
                                {

                                },
                                onData:function(data)
                                {
                                    this.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOADED,{data:data});
                                    this.fireEvent(Siviglia.Data.BaseDataSource.CHANGE,{data:data});
                                },
                                onListener:function(event,param)
                                {
                                    source=param.value;
                                    this._dofetch(source);
                                },
                                getLabelField:function()
                                {
                                    return this.source["LABEL"];
                                },
                                getValueField:function()
                                {
                                    return this.source["VALUE"];
                                },
                                addContext:function(ctx)
                                {
                                    this.stack.addContext(ctx);
                                }
                            }
                    },
                    ArrayDataSource:{
                        inherits:"BaseDataSource",
                        construct:function(source,controller,stack)
                        {

                            this.BaseDataSource(source,controller,stack);

                            if(typeof source["DATA"] != "undefined")
                                this._initializeValues(source["DATA"]);
                            else {
                                if (typeof source["VALUES"] !== "undefined") {
                                    this.valsArray=[];
                                    for(var k=0;k<source["VALUES"].length;k++)
                                        this.valsArray.push({"VALUE":k,"LABEL":source[k]});
                                    source["LABEL"]="LABEL";
                                    source["VALUE"]="VALUE";
                                }
                            }
                            this.source=source;
                        },
                        methods:
                            {
                                _initializeValues:function(data)
                                {
                                    this.valsArray=data;
                                },
                                resolvePath:function(path)
                                {
                                    if(path==null)
                                        return this._initializeValues([]);

                                    var source=this.source["DATA"];
                                    if(path[0]=="/")
                                        path=path.substr(1);
                                    var parts=path.split("/");
                                    for(var k=0;k<parts.length;k++)
                                        source=source[parts[k]];
                                    this._initializeValues(source);
                                },
                                onChanged:function(evName,data)
                                {
                                    console.log("---SOURCE-CHANGED: ---"+this.source["PATH"]);
                                    if(data.valid!==false)
                                        this.valsArray=data.value;
                                    else
                                        this.valsArray=null;
                                    data.value=this.valsArray;
                                    this.fireEvent("CHANGE",data);

                                },
                                fetch:function()
                                {
                                    if(typeof this.source["PATH"]!=="undefined")
                                    {
                                        if(!this.pstring) {
                                            var plainCtx = new Siviglia.Path.BaseObjectContext(this.source["DATA"], "/", this.stack);
                                            this.pstring = new Siviglia.Path.PathResolver(this.stack, this.source["PATH"]);
                                            this.pstring.addListener("CHANGE", this, "onChanged");
                                        }
                                        try {
                                            this.valsArray = this.pstring.getPath();
                                        }
                                        catch(e)
                                        {
                                            this.valsArray=null;
                                        }
                                    }
                                    else {
                                        this.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOADED, {value:this.valsArray});
                                        this.fireEvent(Siviglia.Data.BaseDataSource.CHANGE, {value:this.valsArray});
                                    }
                                }
                            }
                    },
                /*
                En el objectDefinedDataSource, el parametro source es un objeto de la
                complejidad que sea.El asunto es que ese objeto, se procesa y se convierte en una simple
                cadena, en processSource.
                Asi, cuanlquier referencia a un path dentro de la definicion, sera resuelta, y luego, en
                el _dofetch, y en el onListener, se deshace el cambio, volviendo a ser el objeto de la complejidad inicial.
                 */
                    ObjectDefinedDataSource:
                        {
                            inherits:"BaseDataSource",
                            methods:
                                {
                                    processSource:function(source)
                                    {
                                        return source;
                                    },
                                    onListener:function(evName, params)
                                    {
                                        var source=params.value;
                                        this._dofetch(JSON.parse(source));
                                    }

                                }

                        },
                /**
                 * Un PathDefinedDataSource, no utiliza una parametrizable string.Su resultado no es una string, es el valor de la
                 * variable apuntada por el path.
                 * Es decir, una url, por ejemplo del tipo : "http://www.a.com/[%/*a%]" , resuelve a una string.
                 * Un path del tipo "*a", resuelve al objeto "a".
                 */
                PathDefinedDataSource:
                        {
                           inherits:"BaseDataSource",
                            methods:
                                {
                                    fetch:function()
                                    {
                                        var source=this.source["PATH"];
                                        if(source[0]!="#")
                                            source="#"+source;
                                        if(!this.pstring) {
                                            this.pstring = new Siviglia.Path.ParametrizableString(this.source, this.stack);
                                            this.pstring.addListener("CHANGE",this,"onListener");
                                        }
                                        this.pstring.parse();
                                    },
                                    // Su valor, es el que haya resuelto el listener de la parametrizable string.
                                    onListener:function(event,params)
                                    {
                                        var data=params.value;
                                        this.onData(data);
                                    }
                                }
                        },
                /*
                 Simple fetcher de una url.
                 La definicion de la url debe ser un objeto del tipo:
                 {
                    url:"....",
                    params:{"xx:"...","yy":"..."..}
                    options:{...}
                 }
                 Esto, a traves de ObjectDefinedDataSource, se convierte a Json, y se establecen los listeners,
                 para escuchar los posibles parametros.
                 Cuando los parametros se han resuelto, se llama a _dofetch.
                 */
                RemoteDataSource: {
                    inherits:'ObjectDefinedDataSource',
                    construct:function(source,controller,stack)
                    {
                        this.ObjectDefinedDataSource(source,controller,stack);
                        this.transport=new Siviglia.Model.Transport();
                    },
                    methods:
                        {
                            _dofetch:function(def)
                            {
                                if(typeof def=="string")
                                    def=JSON.parse(def);
                                var m=this;
                                var parameters=def.PARAMS;
                                var options=def.options;
                                var allP={};
                                if(parameters)
                                {
                                    for(var k in parameters)
                                        allP[k]=parameters[k];
                                }
                                if(options)
                                {
                                    for(var k in options)
                                        allP[k]=options[k];
                                }
                                var baseUrl=def.url;
                                if(typeof def.params!=="undefined")
                                {
                                    var url=new URL(baseUrl);
                                    var search=url.searchParams;
                                    for(var k in def.params)
                                        search.append(k,def.params[k]);
                                    baseUrl=url.toString();
                                }

                                this.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOADING);
                                this.transport.doGet(baseUrl).then(function(data){

                                    m.onData(data);
                                },function(e){

                                    m.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOAD_ERROR);
                                });
                            }

                        }
                },
                    /*
                        FrameworkDataSource
                        Sobreescribe RemoteDataSource para crear una definicion compatible con RemoteDataSource,
                         cargar la metadata del Ds.

                     */
                    FrameworkDataSource:{
                        inherits:'RemoteDataSource',
                        construct:function(source,controller,stack)
                        {

                            this.model=source["MODEL"];
                            this.dsname=source["DATASOURCE"];
                            this.dsParams=typeof source["PARAMS"]=="undefined"?null:source["PARAMS"];
                            this.params={};
                            this.definition=null;
                            this.controller=controller || null;
                            // Se construye una definicion< compatible con RemoteDataSource
                            source.url=this.getUrl(this.dsParams);
                            this.RemoteDataSource(source,controller,stack);
                        },
                        methods:
                            {
                                processSource:function(source)
                                {
                                    if(typeof source.params=="undefined")
                                        source.params={}
                                    return source;
                                },
                                setMetaData:function(metadata)
                                {
                                    this.metaData=metadata;
                                },
                                onData:function(data)
                                {
                                    if(this.isLoadValid(data))
                                    {
                                        if(data.definition)
                                            this.setMetaData(data.definition);
                                        var root=this.getRootDataNode(data);
                                        this.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOADED,{value:root});
                                        this.fireEvent(Siviglia.Data.BaseDataSource.CHANGE,{value:root});

                                    }
                                    else
                                    {
                                        m.fireEvent(Siviglia.Data.BaseDataSource.EVENT_INVALID_DATA);
                                    }
                                },
                                isLoadValid:function(data)
                                {
                                    return data.error==0;
                                },
                                getRootDataNode:function(data)
                                {
                                    return data.data;
                                },
                                getUrl:function(params)
                                {
                                    var mName=new Siviglia.Model.ModelName(this.model);
                                    var p=this.params || {};
                                    if(this.options) {
                                        var o = this.options.ordering;
                                        var cp = this.options.currentPage;
                                        var ps = this.options.pagination;
                                        if (o) {
                                            for (var i = 0; i < o.length; i++) {
                                                var sort = o[i];
                                                var suff = (i > 0 ? i : '');
                                                p["__sort" + suff] = sort.attribute;
                                                p["__sortDir" + suff] = sort.descending ? 'DESC' : 'ASC';
                                            }
                                        }
                                        if(ps) {
                                            p["__count"] = ps;
                                            if(cp)
                                                p["__start"]=cp*ps;
                                        }
                                    }
                                    name=this.dsname.replace('Ds','');
                                    return mName.getDatasourceUrl(name,null,params)
                                }
                            }
                    },
                    /*
                        Procesador de tipos: convierte los datos de un datasource, a datos tipados.
                     */
                    TypedFrameworkDataSource:{
                        inherits:'FrameworkDataSource',
                        methods:
                            {
                                onData:function(data)
                                {

                                    var m=this;
                                    if(this.isLoadValid(data))
                                    {
                                        if(data.definition)
                                            this.setMetaData(data.definition);
                                        var root=this.getRootDataNode(data);
                                        $.when(this.process(data.definition,root)).then(function(data) {
                                            m.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOADED, data);
                                            m.fireEvent(Siviglia.Data.BaseDataSource.CHANGE, data);
                                        });

                                    }
                                    else
                                    {
                                        m.fireEvent(Siviglia.Data.BaseDataSource.EVENT_INVALID_DATA);
                                    }
                                },

                                process:function(definition,data)
                                {
                                    var nData=[];
                                    var sPromises=[];
                                    var lp=$.Deferred();
                                    for(var k=0;k<data.length;k++)
                                    {
                                        var np=$.Deferred();
                                        (function(f,p) {
                                            var ni = new Siviglia.types.DefinedObject(definition, data[k]);
                                            ni.mainPromise.then(function(i){
                                                nData[f]=i;
                                                p.resolve();
                                            });
                                            sPromises.push(p);
                                        })(k,np);
                                    }
                                    $.when.apply($,sPromises).then(function(){lp.resolve(nData)});
                                    return lp;
                                }
                            }
                    }
            }
    }
);
