Siviglia.Utils.buildClass(
    {
        context:"Siviglia.Model",
        classes:{
            Instance:
            {
                inherits:'Siviglia.Dom.EventManager',
                construct:function(model)
                {
                    this.loaded=false;
                    this.rawData=null;
                    this.modelMeta=model;
                    this.fields={};
                    for(var k in model.definition.FIELDS)
                    {
                        this.fields[k]=new Siviglia.Model.Field(k,this,model,model.definition.FIELDS[k]);
                    }
                },
                methods:
                {
                    load:function(val)
                    {
                        this.rawData=val;
                        this.loaded=true;
                        for(var k in val)
                        {
                            if(!this.fields[k])
                            {
                                // TODO: Por ahora asi...Luego habria que obtener realmente los campos..
                                // Si en el datasource "View" vienen campos de otros modelos,hay que cargar realmente esos modelos aqui.
                                this.fields[k]=new Siviglia.Model.Field(k,this,this.modelMeta,{'TYPE':'String'})
                            }
                            this.fields[k].set(val[k]);
                            this.fields[k].reset();
                        }
                    },
                    getIndexFields:function()
                    {
                        return this.definition.INDEXFIELDS;
                    },
                    getRawData:function()
                    {
                        return this.rawData;
                    },
                    getView:function(viewName,targetNode,styles,params,framework)
                    {
                        var t=this;
                        var p=$.Deferred();
                        var mName=new Siviglia.Model.ModelName(this.modelMeta.definition);
                        params=params || {};
                        params.instance=this;
                        var frameworkInstance=Siviglia.Model.Framework;
                        if(typeof framework!="undefined")
                            frameworkInstance=new Siviglia.Model.Frameworks[framework](Siviglia.Model.config);

                        frameworkInstance.getViewInstance(mName,viewName,params,targetNode).then(
                            function(view)
                            {
                                view.framework=frameworkInstance;
                                if(styles)
                                {
                                    for(var h in styles)
                                    {
                                        view.domNode.style[h]=styles[h];
                                    }
                                }
                                p.resolve(view);
                            },
                            function(err)
                            {
                                console.debug("No se encuentra la vista "+fName);
                            }
                        );
                        return p;
                    },
                    getField:function(field)
                    {
                        return this.fields[field];
                    },
                    getValue:function(field)
                    {
                        return this.get(field);
                    },
                    setValue:function(field,val)
                    {
                        this.set(field,val);
                    },
                    get:function(field)
                    {
                        return this.fields[field].get();
                    },
                    set:function(field,val)
                    {
                        this.fields[field].set(val);
                    },
                    getForm:function(formName,params,node,framework)
                    {
                        var t=this;
                        var p=$.Deferred();
                        var mName=new Siviglia.Model.ModelName(this.modelMeta.definition);
                        params.instance=this;
                        t.modelMeta.getFormDefinition(formName).then(function(def){
                            var p1={model:t,params:params,definition:def};
                            var frameworkInstance=Siviglia.Model.Framework;
                            if(typeof framework!="undefined")
                                frameworkInstance=new Siviglia.Model.Frameworks[framework](Siviglia.Model.config);

                            frameworkInstance.getFormInstance(mName,formName,p1,node).then(
                                function(v)
                                {
                                    v.framework=frameworkInstance;
                                    p.resolve(v);
                                }
                            )
                        });
                        return p;
                    },
                    callForm:function(formName,data,disableReload)
                    {
                        var myIndexes={};
                        var f;
                        for(var k=0;k<this.modelMeta.definition.INDEXFIELDS.length;k++)
                        {
                            f=this.modelMeta.definition.INDEXFIELDS[k];
                            if(this.fields[f])
                            {
                                myIndexes[f]=this.fields[f].get();
                            }
                            // Si no tenemos index, pero viene en los datos, lo copiamos
                            if(!myIndexes[f] && data[f])
                                myIndexes[f]=data[f];

                        }
                        var m=this;
                        var p=new $.Deferred();
                        this.modelMeta.callForm(myIndexes,data,formName).then(function(r)
                        {
                            if(r.result==1)
                            {
                                if(Siviglia.typeOf(r.data)=="array")
                                    r.data= r.data[0];
                                if(!disableReload)
                                    m.load(r.data);
                                p.resolve(r.data);
                                if (top.mainController != undefined) {
                                    top.mainController.sendMessage("FORM_PROCESSED",{modelName:m.modelMeta.modelName,model:p,form:formName,result:r});
                                }
                            }
                            else
                                p.reject(r);
                        },
                        function(err)
                        {
                            p.reject(err);
                        }
                    )
                    return p;
                },
                getDataSource:function(dsName,params)
                {
                    return this.modelMeta.getDataSource(dsName,params);
                },
                getMemoryDataSource:function(dsName,params)
                {
                    return this.modelMeta.getMemoryDataSource(dsName,params);
                },
                getRawDataSource:function(dsName,params)
                {
                    return this.modelMeta.getRawDataSource(dsName,params);
                },
                save:function()
                {
                    for(var k in this.fields)
                    {
                        if(this.fields[k].isDirty())
                            return this.modelMeta.save(this);
                    }
                    return $.when(this);
                },
                __onSaved:function(response){
                    if(response.error==0)
                    {
                        for(var k in this.fields)
                            this.fields[k].reset();
                        this.onSaved();
                    }
                    else
                        this.onSaveError(response);
                },
                onSaved:function(response){},
                onSaveError:function(response){}
                }
            }
        }
    }

);
