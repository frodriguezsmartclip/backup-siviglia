Siviglia.Utils.buildClass(
    {
        context:'Siviglia.Data',
        classes:
            {
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
                            EVENT_INVALID_DATA:"INVALID_DATA"
                        },
                        construct:function(fetcher)
                        {
                            this.localPromise=null;
                            this.fetcher=fetcher;
                        },
                        methods:
                            {
                                fetch:function(parameters,options)
                                {
                                    if(this.localPromise)
                                        return this.localPromise;
                                    this.localPromise=$.Deferred();
                                    var m=this;
                                    this.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOADING);
                                    $.when(this.fetcher.fetch(parameters,options)).then(function(data){
                                        m.onData(data);
                                    },function(e){
                                        m.fireEvent(Siviglia.Data.BaseDataSource.LOAD_ERROR);
                                        m.localPromise.reject();
                                        m.localPromise=null;
                                    });
                                    return this.localPromise;
                                },
                                onData:function(data)
                                {
                                    this.localPromise.resolve(data);
                                    this.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOADED);
                                    this.localPromise=null;
                                }
                            }
                    },
                    /*
                        FrameworkDataSource
                        Sobreescribe DataSource para post-procesar los datos, obteniendo su definicion, y los posibles errores.

                     */
                    FrameworkDataSource:{
                        inherits:'BaseDataSource',
                        construct:function(fetcher,processor)
                        {
                            this.definition=null;
                            this.processor=processor || null;
                            this.BaseDataSource(fetcher);
                        },
                        methods:
                            {
                                setDefinition:function(definition)
                                {
                                    this.definition=definition;
                                },
                                onData:function(data)
                                {
                                    if(this.isLoadValid(data))
                                    {
                                        if(data.definition)
                                            this.setDefinition(data.definition);
                                        var root=this.getRootDataNode(data);
                                        var m=this;
                                        $.when(this.processData(root)).then(function(processed){
                                            m.localPromise.resolve(processed);
                                            m.fireEvent(Siviglia.Data.BaseDataSource.EVENT_LOADED);
                                        });
                                    }
                                    else
                                    {
                                        m.fireEvent(Siviglia.Data.BaseDataSource.INVALID_DATA);
                                    }
                                },
                                processData:function(data)
                                {
                                    if(this.processor)
                                        return this.processor.process(this.definition,data);
                                    return data;
                                },
                                isLoadValid:function(data)
                                {
                                    return data.error==0;
                                },
                                getRootDataNode:function(data)
                                {
                                    return data.data;
                                }
                            }
                    },
                    /*
                        Procesador de tipos: convierte los datos de un datasource, a datos tipados.
                     */
                    TypeProcessor:{
                        methods:
                            {
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
                    },
                    /*
                        Simple fetcher de una url.
                     */
                    RemoteDataSourceFetcher: {
                            construct:function(url)
                            {
                                this.url=url;
                            },
                            methods:
                                {
                                    fetch:function()
                                    {
                                        var baseUrl=this.getUrl();
                                        var transport=new Siviglia.Model.Transport();
                                        return transport.doGet(baseUrl);
                                    },
                                    getUrl:function()
                                    {
                                        return this.url;
                                    }
                                }
                        },
                    /*
                        Fetcher de una url del framework
                     */
                    FrameworkDataSourceFetcher:
                    {
                        inherits:'RemoteDataSourceFetcher',
                        construct:function(model,name)
                        {
                            this.model=model;
                            this.name=name;
                            this.params=null;
                            this.options=null;
                            this.RemoteDataSourceFetcher(null);
                        },
                        methods:
                            {
                                fetch:function(parameters,options)
                                {
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
                                    this.params=parameters;
                                    this.options=options;
                                    var baseUrl=this.getUrl(allP);
                                    var transport=new Siviglia.Model.Transport();
                                    return transport.doGet(baseUrl);
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
                                    name=this.name.replace('Ds','');
                                    return mName.getDatasourceUrl(name,null,params)
                                }
                            }
                    }
            }
    }
);