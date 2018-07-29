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
                               * @param params
                               */
                              getFromSource:function(source,controller,params)
                              {
                                  var path=Siviglia.issetOr(source["PATH"],null);
                                  if(path!=null)
                                      return new Siviglia.Data.PathDefinedDataSource(source,controller);

                                  var values=Siviglia.issetOr(source["VALUES"],null);
                                  if(values!=null)
                                      return new Siviglia.Data.ArrayDataSource(source["VALUES"],controller);
                                  var datasource=Siviglia.issetOr(source["DATASOURCE"],null);
                                  if(datasource!=null)
                                      return new Siviglia.Data.FrameworkDataSource(datasource["MODEL"],datasource["NAME"],params,controller);
                                  var url=Siviglia.issetOr(source["URL"],null);
                                  if(url!=null)
                                      return new Siviglia.Data.RemoteDataSource({url:url,params:params},controller);

                                  // En otro caso, suponemos que el source es un array.
                                  return new Siviglia.Data.ArrayDataSource(source,controller);

                              }
                          }
                    },
                /*
                    DataSource base:
                    Recibe como parametro un fetcher (ver mas abajo), que es la clase que se encarga de
                    obtener los datos.
                    Lanza eventos sobre la carga del datasource.

                 */
                /*

                 this.path=null;
                 if(Siviglia.isString(str))
                 this.path=str;
                 else
                 this.path=JSON.stringify(str);
                 this.pstring=null;
                 this.refWidget=refWidget;
                 this.params=params;
                 },
                 destruct:function(){
                 this.listener.destruct();
                 if(this.pstring)
                 this.pstring.destruct();
                 },
                 methods:{
                 listen:function()
                 {
                 if(!this.pstring)
                 this.pstring=new Siviglia.Utils.ParametrizableString(this.refWidget.view,this.listener,this.path,this.params);
                 },
                 onListener:function()
                 {
                 this.fireEvent("CHANGE",this.listener.getValue());
                 }
                 }
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
                        construct:function(source,controller)
                        {
                            this.source=this.processSource(source);
                            this.listener=new Siviglia.model.Listener(this,null,controller,Siviglia.model.Root,Siviglia.model.Root.context);
                            this.controller=controller;
                            this.pstring=null;
                        },
                        destruct:function()
                        {
                            this.listener.destruct();
                        },
                        methods:
                            {
                                processSource:function(source)
                                {
                                    return source;
                                },
                                fetch:function()
                                {
                                    if(!this.pstring)
                                        this.pstring = new Siviglia.Utils.ParametrizableString(this.controller, this.listener, this.source, this.params);
                                },
                                _dofetch:function(source)
                                {

                                },
                                onData:function(data)
                                {
                                    this.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOADED,{data:data});
                                    this.fireEvent(Siviglia.Data.BaseDataSource.CHANGE,{data:data});
                                },
                                onListener:function()
                                {
                                    source=this.listener.getValue();
                                    this._dofetch(source);
                                }
                            }
                    },
                    ArrayDataSource:{
                        inherits:"BaseDataSource",
                        construct:function(valsArray)
                        {
                            this.valsArray=valsArray;
                        },
                        methods:
                            {
                                fetch:function()
                                {
                                    this.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOADED,valsArray);
                                    this.fireEvent(Siviglia.Data.BaseDataSource.CHANGE,valsArray);
                                }
                            }
                    },
                    ObjectDefinedDataSource:
                        {
                            inherits:"BaseDataSource",
                            methods:
                                {
                                    processSource:function(sourceString)
                                    {
                                        return JSON.stringify(sourceString);
                                    },
                                    onListener:function()
                                    {
                                        var source=this.listener.getValue();
                                        this._dofetch(JSON.parse(source));
                                    }

                                }

                        },
                /**
                 * Un PathDefinedDataSource, no utiliza una parametrizable string.Su resultado no es una string, es el valor de la
                 * variable apuntada por el path.
                 * Es decir, una url, por ejemplo del tipo : "http://www.a.com/[%/*a%]" , resuelve a una string.
                 * Un path del tipo "/*a", resuelve al objeto "a".
                 */
                PathDefinedDataSource:
                        {
                           inherits:"BaseDataSource",
                            methods:
                                {
                                    fetch:function()
                                    {
                                        this.listener.pathRootObject.getPath(this.source["PATH"], this.listener, this.listener.pathRootObject.context);
                                    },
                                    // Su valor, es el que haya resuelto el listener de la parametrizable string.
                                    onListener:function()
                                    {
                                        var data=this.listener.getValue();
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
                    construct:function(def,controller)
                    {
                        this.ObjectDefinedDataSource(def,controller);
                        this.transport=new Siviglia.Model.Transport();
                    },
                    methods:
                        {
                            _dofetch:function(def)
                            {
                                var m=this;
                                var parameters=def.parameters;
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
                        construct:function(model,dsname,params,controller)
                        {
                            this.model=model;
                            this.dsname=dsname;
                            this.params=params;
                            this.definition=null;
                            this.processor=processor || null;
                            // Se construye una definicion compatible con RemoteDataSource
                            this.RemoteDataSource({url:this.getUrl(params)},controller);
                        },
                        methods:
                            {
                                setMetaData:function(metadata)
                                {
                                    this.metaData=definition;
                                },
                                onData:function(data)
                                {
                                    if(this.isLoadValid(data))
                                    {
                                        if(data.definition)
                                            this.setMetaData(data.definition);
                                        var root=this.getRootDataNode(data);
                                        this.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOADED,root);
                                        this.fireEvent(Siviglia.Data.BaseDataSource.CHANGE,root);

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
                                    if(this.isLoadValid(data))
                                    {
                                        if(data.definition)
                                            this.setMetaData(data.definition);
                                        var root=this.getRootDataNode(data);
                                        var m=this;
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