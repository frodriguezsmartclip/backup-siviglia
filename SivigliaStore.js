Siviglia.Utils.buildClass(
    {
        context:'Siviglia.Data',
        classes:
        {
            DataException:
            {
                construct:function(text)
                {
                    console.debug(text);
                }
            },
            /*
                Clase para almacenar el estado bajo el cual se ha obtenido un dataset.
                Incluye el numero de

             */
            DataSetStatus:
            {
                // Se puede llamar con un array, y en ese caso se inicializa a partir de el-
                // Este objeto deberia ser inmutable.
                construct:function(nRows,datasourceStatus)
                {
                    if(Siviglia.Utils.isArray(nRows)) {
                        var obj = nRows;
                        this.nRows=obj.length;
                    }
                    else
                        this.nRows=nRows;
                    this.datasourceStatus=datasourceStatus;

                },
                methods:
                {

                }
            },
            DataSet:
            {
                inherits:'Siviglia.model.PathListener',
                construct:function(data,status,datasource)
                {
                    this.PathListener();
                    this.initialize(data,status,datasource);

                },
                methods:
                {
                    initialize:function(data,status,datasource)
                    {
                        this.data=data.map(function(c){ return new Siviglia.Data.DataObject(c)});
                        this.data=data;
                        this.status=status;
                        this.datasource=datasource;
                        this.notifyPathListeners();
                    },
                    setValue:function(data,status)
                    {
                        this.initialize(data,status,this.datasource);

                    },
                    getDataSource:function()
                    {
                        return this.datasource;
                    },
                    iterate:function(callback)
                    {
                          return this.data.map(callback);
                    },
                    getRow:function(i)
                    {
                        if(i < 0 || i > this.data.length)
                        {
                            throw  new Siviglia.Data.DataException('Index Out of bounds:'+i);
                        }
                        return data[i];
                    },
                    getCount:function()
                    {
                        return this.status.nRows;
                    },
                    getTotalCount:function()
                    {
                        return this.status.totalRows;
                    }
                }
            },
            DataObject:{
                construct:function(data,dataSet)
                {
                    this.initialize(data,dataSet);
                },
                methods:
                {
                    initialize:function(data,dataSet)
                    {
                        this.data=data;
                        this.dataset=dataSet
                    },
                    get:function(field){return this.data[field];}
                }
            },
            TypedDataSet:
            {
                inherits:'DataSet',
                construct:function(data,status,datasource,metadata)
                {
                    this.initialize(data,status,datasource,metadata);
                    this.typedRows=[];

                },
                methods:
                {
                    initialize:function(data,status,datasource,metadata)
                    {
                        this.DataSet$initialize(data,status,datasource);
                        this.metadata=metadata;
                        this.notifyPathListeners();
                    },
                    setValue:function(data,status)
                    {
                        this.DataSet$setValue(data);
                        this.status=status;
                        this.notifyPathListeners();
                    },
                    __typeRow:function(rowIndex)
                    {
                        if(!this.typedRows[rowIndex])
                            this.typedRows[rowIndex]=new Siviglia.data.TypedDataObject(this.data[rowIndex],this,metadata);

                        return this.typedRows[rowIndex];
                    },
                    getRow:function(i)
                    {
                        return this.__typeRow(i);
                    },
                    iterate:function(callback)
                    {
                        return this.__typeRow(i).map(callback);
                    }
                }
            },
            TypedDataObject:
            {
                inherits:'DataObject',
                construct:function(data,dataSet,metadata)
                {
                    this.initialize(data,dataSet,metadata);
                },
                methods:
                {
                    initialize:function(data,dataSet,metadata)
                    {
                        var factory=new Siviglia.types._TypeFactory();
                        this.metadata=metadata;
                        this.dataSet=dataSet;
                        this.data={};
                        // Se mapean las propiedades al objeto.
                        for(var k in metadata)
                            this[k]=factory.getTypeFromDef(this.metadata[k],Siviglia.issetOr(data[k],null));
                    }
                }

            },

            DataSourceStatus:
            {
                constants:
                {
                    STATE_NOT_LOADED:1,
                    STATE_LOADING:2,
                    STATE_LOADED:3,
                    EVENT_STATUS_CHANGED:"DS_STATUS_CHANGED"
                },
                construct:function(datasource,loadStatus,parameters,filters,ordering,grouping)
                {
                    this.datasource=datasource;
                    this.loadStatus=loadStatus;
                    this.parameters=parameters;
                    this.filters=filters;
                    this.ordering=ordering;
                    this.grouping=grouping;
                },
                methods:
                {
                    onChange:function()
                    {
                        this.datasource.fetch(this);
                    }
                }
            },
            // Clase base, no destinada a instanciarse.
            // Las clases derivadas deben implementar el metodo __fetch, que devuelve un objeto conteniendo
            // success y data
            // objeto definition:
            /*
                    {
                        DataClass:'xxxx', // Clase custom de datos.Si no, una de las clases de Siviglia.Data.
                        fieldDefinition:
                            {
                                // (opcional)
                                // Pueden ser varias cosas.
                                // Debe estar definido como un Datasource de Siviglia.
                            },
                         parametersDefinition:
                            {
                                // Definicion de parametros.Igual que un DS de Siviglia.
                            },
                         filters:
                            {
                                // Estructura de filtros.A ser especificada, via objeto json
                            },
                         ordering:{
                                // Array de objetos con {field:xx, dir:ASC|DESC,func:function(a,b)}
                         },
                         grouping:{
                                // Campos de agrupacion.Es un array con {field:xxx, group:{<parametros de agrupacion>}}

                         }
                     }
             */
            // El resultado obtenido, se devuelve en un tipo de dato estandar de Siviglia.Data (dependiendo de si
            // habia metadata o no, si es un array o un objeto, etc),
            DataSource:
            {
                inherits:"Siviglia.Dom.EventManager",
                constants:{
                    EVENT_START_LOAD:"START_FETCHING",
                    EVENT_LOADED:"LOADED",
                    EVENT_FILTERS_SET:"FILTERS_SET",
                    EVENT_LOADING:"LOADING",
                    EVENT_LOAD_ERROR:"LOAD_ERROR",
                    EVENT_INVALID_DATA:"INVALID_DATA"
                },

                construct:function(definition)
                {
                    this.definition          = definition;
                    this.fieldDefinition     = Siviglia.issetOr(definition.FIELDS,null);
                    this.parameterDefinition = Siviglia.issetOr(definition.PARAMS,null);
                    this.paginator           = Siviglia.issetOf(definition.PAGING,null);
                    this.fiters              = Siviglia.issetOr(definition.FILTERS,null);
                    this.ordering              = Siviglia.issetOr(definition.ORDERING,null);
                    this.grouping              = Siviglia.issetOr(definition.GROUPING,null);
                    this.status              = new DataSourceStatus(this,
                                                        Siviglia.Data.DataSourceStatus.STATE_NOT_LOADED,
                                                        this.STATE_LOADING,
                                                        this.parameterDefinition,
                                                        this.filters,
                                                        this.ordering,
                                                        this.grouping
                                                );
                },
                methods:
                {
                    getStatus:function()
                    {
                        return this.status;
                    },
                    setFieldDefinition:function(def)
                    {
                         this.fieldDefinition=def;
                    },
                    getFieldDefinition:function()
                    {
                        return this.fieldDefinition;
                    },
                    getParameters:function()
                    {
                        return this.parameterDefinition;
                    },
                    fetch:function(status)
                    {
                        var newStatus=Siviglia.issetOr(status,null);
                        if(newStatus)
                            this.setStatus(status);
                        var h= $.Deferred();
                        var m=this;
                        this.status.loadStatus=Siviglia.Data.DatasourceStatus.STATE_LOADING;
                        this.fireEvent(Sivilia.Data.DataSource.EVENT_LOADING);

                        $.when(this.__fetch()).then(function(data){
                            m.onData(data);
                        },function(e){
                            m.fireEvent(Siviglia.Data.Datasource.LOAD_ERROR);
                        })
                    },
                    onData:function(data)
                    {
                        if(this.isLoadValid(data))
                        {
                            var root=this.getRootDataNode(data);
                            this.processData(root);
                            this.status.loadStatus=Siviglia.Data.DatasourceStatus.STATE_LOADED;
                            this.fireEvent(Sivilia.Data.DataSource.EVENT_LOADED);

                        }
                        else
                        {
                            m.fireEvent(Siviglia.Data.Datasource.INVALID_DATA);
                        }
                    },
                    processData:function(data)
                    {
                        if(!Siviglia.isArray(data))
                            data=[data];


                            if(!this.dataSet)
                            {
                                if(!this.fieldDefinition)
                                    this.dataSet=new Siviglia.Data.DataSet(data,this.status,this);
                                else
                                    this.dataSet=new Siviglia.Data.TypedDataSet(data,this.status,this,this.fieldDefinition);
                            }
                            else
                                this.dataSet.setValue(data,this.status);

                    },
                    isLoadValid:function(data)
                    {
                        return data.sucess==true;
                    },
                    getRootDataNode:function(data)
                    {
                        return data.data;
                    },
                    setStatus:function(status)
                    {
                        this.status=status;
                        this.fireEvent(Siviglia.Data.DataSource.EVENT_FILTERS_SET,status);
                    }
                }
            },
            JsonDataSource:
            {
                inherits:'DataSource',
                construct:function(data,definition)
                {
                    this.DataSource(definition);
                    this.baseData=data;
                },
                methods:
                {
                    __fetch:function()
                    {
                        var newData=this.baseData;
                        if(this.status.filters)
                        {

                        }
                        if(this.status.ordering)
                        {
                            newData=this.jsSort(newData);
                        }
                        if(this.status.grouping)
                        {

                        }
                        if(this.status.paginator)
                        {
                            var start=this.status.paginator.currentPage*this.status.paginator.elemsPerPage;
                            var end=start+this.status.paginator.elemsPerPage;
                            newData=newData.slice(start,end);
                        }
                        return newData;
                    },
                    jsSort:function(newData)
                    {
                        var o=this.status.ordering;
                        var factory;
                        var haveDef=Siviglia.isset(this.fieldDefinition);
                        if(!haveDef)
                            def={};
                        else
                        {
                            def=this.fieldDefinition;
                            factory=new Siviglia.types._TypeFactory();
                        }
                        var f = function (val1, val2, fieldName,direction,sortIndex) {
                            if(def[fieldName])
                            {
                                var tval1=factory.getTypeFromDef(def[fieldName],val1[fieldName]);
                                var tval2=factory.getTypeFromDef(def[fieldName,val2[fieldName]]);
                                var result=tval1.compare(tval2,direction);
                                sortIndex++;
                                if(sortIndex== o.length);
                                return 0;
                                var t=o[sortIndex];
                                var sortFunc=Siviglia.issetOr(t.func,f);
                                return sortFunc(val1,val2,  t.field,Siviglia.issetOr(t.dir,'ASC'),sortIndex);
                            }
                            //  a signed integer where a negative return value means x < y, positive means x > y and 0 means x = 0.
                            if(val1[fieldName] == val2[fieldName])
                            {
                                sortIndex++;
                                if(sortIndex== o.length);
                                return 0;
                                var t=o[sortIndex];
                                var sortFunc=Siviglia.issetOr(t.func,f);
                                return sortFunc(val1,val2, t.field,Siviglia.issetOr(t.dir,'ASC'),sortIndex);
                            }
                            return o[sortIndex].dir=="ASC"?val1 > val2:val2<val1;
                        };

                        newData.sort(function(val1,val2){
                            return f(val1,val2,o[0].field,Siviglia.issetOr(t.dir,'ASC'),0);
                        });
                        return newData;
                    }
                }
            }
        }
    }
);