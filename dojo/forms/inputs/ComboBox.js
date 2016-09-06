define(["dojo/_base/declare", "dojo/when", "dojo/Deferred", "dijit/_WidgetBase", "Siviglia/forms/inputs/BaseInput", "dijit/form/ComboBox", "dojox/data/QueryReadStore"],
    function (declare, when, deferred, WidgetBase, BaseInput, ComboBox, QueryReadStore) {
        // Modificacion de QueryReadStore para los comboboxes
        var ComboBoxReadStore = declare([QueryReadStore], {
            constructor: function (params) {
                this.inherited(arguments);
                this.__fetch = this.constructor._meta.bases[1].prototype.fetch;
                this.idField=params._identifier;
                this.searchField=params.searchField;
                this.bidirSearch=params.bidir || false;
                this.preOptions = params.preOptions;
            },
            getIdField:function()
            {
                return this.idField;
            },
            setSearchField: function (f) {
                this.searchField = f;
                this.paramField = 'dyn' + f;
            },
            _filterResponse: function (data) {
                var j=0;
                for (var k in this.preOptions) {
                    var p={};
                    p[this.idField]=k;
                    p[this.searchField]=this.preOptions[k];
                    data.data.splice(j,0,p);
                    j++;
                }

                var ret = {items: data.data};
                if (!data.indexField)
                    ret.identifier = this.idField;
                if(!data.label)
                    ret.label=this.searchField;
                return ret;
            },
            fetch: function (request) {

                if(!request.serverQuery)
                {
                    request.serverQuery = {};
                    request.serverQuery[this.paramField] = request.query[this.searchField].substr(0, request.query[this.searchField].length - 1)+'%';
                    if(this.bidirSearch)
                        request.serverQuery[this.paramField]='%'+request.serverQuery[this.paramField];
		        }

		if(!request.serverQuery.__start)
                    request.serverQuery.__start=0;
		if(!request.serverQuery.__count)
                    request.serverQuery.__count=150;
                return this.inherited("fetch", arguments);
            }
        });

        // Modificacion de ComboBox para que almacene no la cadena usada para busqueda, sino el id asociado a esa cadena.
        return declare([ComboBox, BaseInput], {
            innerValue: null,
            autoComplete:true,
            sivInitialize: function (definition,value,params) {
                this.params=params;
                if (params.NULL_RELATION) {
                    this.nullValue = params.NULL_RELATION[0];
                }
                else {
                    this.nullValue = null;
                }
                this.innerValue=value;
                this.preOptions={};
                if (Siviglia.types.isArray(params.PRE_OPTIONS)) {
                    for(var k= 0;k<params.PRE_OPTIONS.length;k++) {
                        this.preOptions[k]=params.PRE_OPTIONS[k];
                    }
                }
                else {
                    this.preOptions = params.PRE_OPTIONS;
                }
                this.definition=definition;
                this.params=params;

                this.dataSourceParams={};
                if(params.DATASOURCE.PARAMS)
                {

                    for(var k in params.DATASOURCE.PARAMS)
                    {

                        var paramValue=this.getPath(params.DATASOURCE.PARAMS[k],this.dataSourceParams,k);
                    }

                }
                this.refresh();
            },
            refresh:function()
            {

                var params=this.params;
                var model = params.DATASOURCE.OBJECT;
                var remoteDs = params.DATASOURCE.NAME;
                path = model.replace('\\', '/');
                var dsname = remoteDs.replace('Ds', '');
                var url = Siviglia.config.baseUrl + path + '/' + dsname + '?output=json';
                var extraParams=[];
                for(var k in this.dataSourceParams)
                {
                    extraParams.push(k+"="+encodeURIComponent(this.dataSourceParams[k]))
                }
                url+="&"+extraParams.join("&");
                var nLabels = params.LABEL.length;
                var biDirSearch=false;
                if(params.BIDIR)
                    biDirSearch=true;
                var nStore = new ComboBoxReadStore({url: url, requestMethod: 'get', _identifier: params.VALUE, searchField: params.LABEL[0],bidir:biDirSearch, preOptions: this.preOptions});
                nStore.setSearchField(params.LABEL[0]);
                this.set("store",nStore);
                this.set("autoComplete",false);
                this.set("searchAttr",params.LABEL[0]);
                this.set("labelAttr", params.LABEL[0]);
                this.set("valueField", params.VALUE);


                this.inputInitializer(this.definition, this.innerValue,params);
                if(this.innerValue) {
                    this.setValue(this.innerValue);
                }
                else
                    this.setValue(this.nullValue);
            },

            setValue: function(value, priorityChange)
            {
                if (priorityChange===false)
                    priorityChange=null;

                if (value===null && this.params.NULL_RELATION)
                    return this.setValue(this.nullValue,priorityChange);

                var v=new deferred();
                var n=this;
                var vf=this.valueField;
                var sQ={};
                sQ[this.valueField]=value;

                if (value===this.nullValue)
                    return;

                this.store.fetch({serverQuery:sQ,onComplete:function(it){
                    if (!n.params.NULL_RELATION) {
                        n.set('item',it[0],priorityChange);
                        v.resolve(it[0].i)
                    }
                    else {
                        if (it[1] !== undefined) {
                            n.set('item',it[1],priorityChange);
                            v.resolve(it[1].i)
                        }
                    }
                }});
                return v.promise;
            },
            inputInitializer:function(definition,value,params)
            {
                 this.sivDefinition=definition;
                 this.set('required',definition.REQUIRED?true:false);
                 this.set("value",value,null);

            },
            _getValueAttr:function()
            {
                return this.getValue();
            },
            getValue:function()
            {
                var it=this.get("item");
                if(!it || !it.i) return it;
                var result =  parseInt(it.i[this.store.getIdField()]);
                if (result===this.nullValue) {
                    return null;
                }

                return result;
            },
            validator:function(value,params)
            {
                return true;
            },
            labelFunc:function(item,store)
            {

                return item.i[this.labelAttr || this.searchAttr];
            }

        });
    });


