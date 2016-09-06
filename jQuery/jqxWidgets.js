/**
 * Created by JoseMaria on 10/03/15.
 */
Siviglia.Utils.buildClass({
    context:'Siviglia.Model.jQuery.jqxWidgets',
        classes:{
            TypeMapper:
            {
                construct:function(definition)
                {
                    this.definition=definition;
                },
                methods:
                {
                    getMap:function(d)
                    {
                        var p= $.Deferred();
                        var self=this;
                        var t=new Siviglia.types._TypeFactory();
                        t.getTypeNames(d).then(function(r){
                            var result=[];
                            for(var k in r)
                                result.push({"name":k,type:self.mapType(r[k].TYPE)})
                            p.resolve(result);

                        });
                        return p;
                    },
                    mapType:function(typeName)
                    {
                        switch(typeName)
                        {
                            case "String":{return "string";}break;
                            case "Decimal":
                            case "Integer":{return "integer";}break;
                            default:{return "string"}
                        }
                    }
                }
            },
            Utils:
            {
                methods:
                {
                    getDynamicDataAdapter:function(caller,modelName,dsName,params,adapterParams)
                    {
                        var baseUrl='';


                                var adapter=null;
                                var source={
                                    datatype:'json',
                                    root:"data"
                                };
                                source.url=Siviglia.Model.loader.getDatasourceUrl(modelName,dsName,params);
                                var oldParams=null;
                                var changing=false;
                                var loaded=false;

                                var onParamsChanged=function(nparams,dontRefresh)
                                {
                                    if(changing)
                                        return;
                                    changing=true;
                                    if(!nparams)
                                        nparams=params;
                                    else
                                        params=nparams;

                                    var newParams={};
                                    var dirty=false;
                                    var uncomplete=false;
                                    // contamos el numero de parametros que tiene el datasource
                                    var counter=0;
                                    for(var k in nparams)
                                    {
                                        counter++;
                                        newParams[k]=caller.getPath(""+nparams[k],newParams,k);
                                        if(oldParams)
                                        {
                                            if(typeof(oldParams[k])=="undefined" || (oldParams[k]!=newParams[k]))
                                            {
                                                console.debug(nparams[k]+" --- > COMPARING "+k+":"+oldParams[k]+","+newParams[k]);
                                                dirty=true;
                                            }
                                        }
                                        if(typeof(newParams[k])=="undefined" || newParams[k]==null)
                                            uncomplete=true;
                                        counter++;
                                    }

                                    // Si no teniamos parametros antiguos, o si no tenemos parametros, y
                                    // aun no se ha cargado, se poner dirty a true.
                                    // Esto sirve para que cuando un ds no tiene ningun parametro, se cargue
                                    // la primera vez
                                    if(!oldParams || (counter==0 && !loaded))
                                        dirty=true;


                                    source.url=Siviglia.Model.loader.getDatasourceUrl(modelName,dsName,newParams);
                                    source.localdata=null;
                                    if(dirty && !dontRefresh && !uncomplete)
                                    {
                                        console.debug("--Params changed--");
                                        loaded=true;
                                        adapter.dataBind();
                                    }
                                    if(uncomplete)
                                    {
                                        // Si no estamos completos, hay que devolver un array vacio.
                                        source.url=null;
                                        source.localdata={data:[],count:0};
                                        adapter.dataBind();
                                    }
                                    changing=false;
                                    oldParams=newParams;
                                };

                                // sobreescribimos el onListener del caller, para que tambien llame a onParamsChanged
                                var oldFunc=caller.onListener;
                                caller.onListener=function(){
                                        onParamsChanged();
                                        oldFunc.apply(caller,arguments);
                                }
                                var adParams=adapterParams || {};
                                adParams.beforeLoadComplete=function(loaded,original)
                                {
                                    if(!original.definition)
                                        return;
                                    if(!adapter.map)
                                    {
                                        d=original.definition;
                                        if(d.INDEXFIELDS)
                                            adapter._source.id=this.dataSourceDefinition["INDEXFIELDS"][0];
                                        var mapper=new Siviglia.Model.jQuery.jqxWidgets.TypeMapper(null);
                                        mapper.getMap(d["FIELDS"]).then(function(map){
                                            adapter._source.datafields=map;
                                        });
                                        adapter.map=1;
                                    }
                                };
                                adParams.formatData=function(d)
                                {
                                    var params={};
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
                                };
                                adParams.beforeprocessing=function (data) {
                                    source.totalrecords = data.count;
                                };
                                adapter=new $.jqx.dataAdapter(source, adParams);
                                // Cuando se crea, no se hace automaticamente el dataBind, ya que los widgets lo estan haciendo.
                                onParamsChanged(params,true);
                                adapter.onParamsChanged=onParamsChanged;
                              return adapter;
                    }
                }
            }
    }
});
