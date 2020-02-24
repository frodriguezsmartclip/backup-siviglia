Siviglia.Utils.buildClass({
        context:'Siviglia.Model.List',
        classes:
        {
            DataSourceView:
            {
                inherits:"Siviglia.UI.Expando.View",
                methods:
                {
                    preInitialize:function(params)
                    {

                    },



                    /*Definition(this.datasource).then(function(d){
                     self.definition= d;
                     var mapper=new Siviglia.Model.jQuery.jqxWidgets.TypeMapper(null);
                     mapper.getMap(d["FIELDS"]).then(function(map){
                     self.initializeGrid(map);
                     })
                     });*/

                    /*if (this.downloadCSVLink) {
                     dojo.connect(this.downloadCSVLink, "onclick", function(e) {
                     if (self.curGrid._total > 3000) {
                     var confirmDownload = confirm('¿Seguro que quieres descargar '+self.curGrid._total+' filas?');
                     if (!confirmDownload) {
                     e.preventDefault();
                     }
                     }
                     });
                     }
                     if (this.downloadXLSLink) {
                     dojo.connect(this.downloadXLSLink, "onclick", function(e) {
                     if (self.curGrid._total > 5000) {
                     var confirmDownload = confirm('¿Seguro que quieres descargar '+self.curGrid._total+' filas?');
                     if (!confirmDownload) {
                     e.preventDefault();
                     }
                     }
                     });
                     }*/

                    sivInitialize:function()
                    {
                        /*if(this.showFilters) {
                         var m=this;
                         this.dsForm=new Siviglia.Forms.DataSourceForm(this,this.domNode);
                         this.dsForm.addListener('FORM_INITIALIZED',this,"onFormInitialize");
                         this.dsForm.initialize();
                         }
                         else {
                         query(".SivDatasourceFilters",this.domNode).style.display='none';
                         this.onFormInitialize();
                         }*/
                    },
                    initialize:function(params)
                    {
                        var self = this;
                        this.defaultParams=params.defaultParams || {};
                        this.dsParams=this.defaultParams;
                        this.model=new Siviglia.Model.Model(this.modelName);
                        //var mName=new Siviglia.Model.ModelName(this.modelName);

                        Siviglia.Model.metaLoader.getDataSource(this.modelName,this.datasource).then(function(d){
                            self.definition=d;
                            self.baseUrl=Siviglia.Model.loader.getDatasourceUrl(self.modelName,self.datasource,params,d);
                            var mapper=new Siviglia.Model.jQuery.jqxWidgets.TypeMapper(null);
                            mapper.getMap(d["FIELDS"]).then(function(mapped){
                                self.dataMap=mapped;
                                self.createGrid();
                                self.dsForm=new Siviglia.Forms.DataSourceForm(self,$(".SivDatasourceFilters",self.view.widgetRoot));
                                self.dsForm.initialize();
                            })
                        });


                    },
                    createGrid:function(){

                        var self=this;

                        this.dataAdapter= this.getAdapter();
                        // Se obtiene el nodo donde mostrar el listado.
                        this.gridNode=$(".SivDatasourceGrid",this.view.widgetRoot);
                        var gridOptions=this.getGridOptions();
                        gridOptions.source=this.dataAdapter;
                        gridOptions.serverProcessing=true;
                        gridOptions.columns=this.createColumns(this.definition);
                        this.gridNode.jqxDataTable(gridOptions);
                    },
                    getAdapter:function()
                    {
                        var self=this;
                        var source={
                            datatype:'json',
                            url:this.baseUrl,
                            datafields:this.dataMap,
                            root:"data",
                            beforeprocessing: function (data) {

                                data.totalrecords = data.count;
                            }
                        };
                        if(this.definition["INDEXFIELDS"])
                            source.id=this.definition["INDEXFIELDS"][0];

                        return new $.jqx.dataAdapter(source, {
                            /* loadServerData: function (serverdata, source, callback) {
                             self.model.getDataSource(self.datasource,serverdata).then(function(ds){
                             ds.query({}).then(function(data){
                             // Se hace el mapeo de campos
                             source.totalrecords=data.count;
                             callback({ records: data.data});
                             })
                             });
                             },*/
                            beforeprocessing: function (data) {
                                source.totalrecords = data.count;
                            },

                            formatData:function(d)
                            {
                                var params={};

                                for(var k in self.dsParams)
                                {
                                    params[k]=self.dsParams[k];
                                }
                                for(var k in d)
                                {
                                    switch(k)
                                    {
                                        case 'sortdatafield':{params.__sort=d[k];}break;
                                        case 'sortorder':{params.__sortDir=d[k].toUpperCase()}break;
                                        case 'pagenum':{params.__start=d[k]*d['pagesize'];}break;
                                        case 'pagesize':{params.__count=d[k];}break;
                                        // recordstartindex - the index in the view's first visible record.
                                        // recordendindex - the index in the view's last visible record
                                        // groupscount - the number of groups in the Grid
                                        //group - the group's name. The group's name for the first group is 'group0', for the second group is 'group1' and so on.
                                        //filterscount - the number of filters applied to the Grid
                                        //filtervalue - the filter's value. The filtervalue name for the first filter is "filtervalue0", for the second filter is "filtervalue1" and so on.
                                        //filtercondition - the filter's condition. The condition can be any of these: "CONTAINS", "DOES_NOT_CONTAIN", "EQUAL", "EQUAL_CASE_SENSITIVE", NOT_EQUAL","GREATER_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN", "LESS_THAN_OR_EQUAL", "STARTS_WITH", "STARTS_WITH_CASE_SENSITIVE", "ENDS_WITH", "ENDS_WITH_CASE_SENSITIVE", "NULL", "NOT_NULL", "EMPTY", "NOT_EMPTY"
                                        //filterdatafield - the filter column's datafield
                                        //filteroperator - the filter's operator - 0 for "AND" and 1 for "OR"
                                    }
                                }
                                return params;
                            },
                            loadComplete: function () {
                                // data is loaded.
                            }
                        });
                    },
                    createColumns:function(d){
                        var columns=[];
                        var c;
                        for(var k in d.FIELDS)
                        {
                            c= d.FIELDS[k];
                            columns.push({text: c.LABEL? c.LABEL:k,dataField:k});
                        }
                        return columns;
                    },
                    getGridOptions:function()
                    {
                        return {
                            pageable: true,
                            altRows: true,
                            height: 400,
                            width: 850,
                            columnsReorder: true,
                        };
                    },
                    setParam:function(name, value)
                    {
                        this.dsParams[name]=value;
                        this.gridNode.jqxDataTable('source',this.getAdapter());
                        this.gridNode.jqxDataTable('refresh');
                    }
                }
            }
        }
    }
);
