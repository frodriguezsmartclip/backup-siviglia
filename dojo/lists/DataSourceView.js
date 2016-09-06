define(
    ["dojo/_base/declare", "dijit/_WidgetBase",
        "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
        "dojo/when", "dojo/promise/all", "dojo/Deferred", "dojo/dom-construct", "dojo/on","Siviglia/lists/Grid",
        "Siviglia/lists/DataTransforms","Siviglia/lists/DataActions","dojo/aspect","dojo/dom-construct","dojox/charting/StoreSeries",
        "dojox/charting/Chart","dojox/charting/plot2d/Lines","dojox/charting/axis2d/Default",
        "dojox/charting/themes/Algae","Siviglia/views/ActionExecuteView","dojo/store/Memory","dijit/form/Button","dijit/form/Select","dijit/form/FilteringSelect",
        "dijit/form/RadioButton","dijit/form/CheckBox","dijit/registry","dojo/query"
    ],
    function(declare,widgetBase,Templated,WidgetsInTemplate,when,all,deferred,dom,on,Grid,dataTransforms,
             dataActions,aspect,domConstruct,StoreSeries,Chart,Lines,DefaultAxis,chartTheme,ActionExecuteView,Memory,Button,Select,
             FilteringSelect,RadioButton,CheckBox,registry,query)
    {
        return declare([widgetBase,Templated,WidgetsInTemplate],
        {
            templateString:'',
            modelName:null,
            datasource:null,
            dsForm:null,
            definition:null,
            dsParams:{},
            defaultParams:{},
            sortField:null,
            sortFieldDirection:null,
            maxRowsPerPage:20,
            initialState:{},
            showFilters:true,
            activeDataGroupMember: null,
            activeDataGroup: null,
            constructor:function(params)
            {
                if (params.templateType === 'onlyGrid') {
                    this.templateString = '<div class="SivDatasource"><div class="SivDatasourceGrid" data-dojo-attach-point="mainGrid" style="position:relative;height:270px"></div>';
                }
            },
            postCreate:function()
            {
                var self = this;

                //Set default params
                if (! $.isEmptyObject(this.defaultParams)) {
                    this.dsParams = this.defaultParams;
                }
                else {
                    /*
                    if (! this.dsParams) {
                        this.dsParams={};
                    }
                    */

                    //NOTA: Al crear el DS por primera vez es necesario poner todos los parámetros a vacío, porque si no
                    //coge los parámetros del DS que hubiéramos ejecutado antes (si son coincidentes).
                    //El código de más arriba es anterior, creo que para corregir algún bug, pero no es correcto, por lo que se ha comentado.
                    //Si vuelve a reproducirse el problema por el que se puso el anterior código, es necesario
                    //pensarlo bien antes de volver a ponerlo, para no romper este comportamiento.
                    this.dsParams={};
                }
                if(this.tabs)
                {
                    this.tabs.startup();
                }

                this.mode='Listado';
                this.model=new Siviglia.Model.Model(this.modelName);
                var m=this;
                this.model.getDataSourceDefinition(this.datasource).then(function(d){
                    m.definition= d;
                    m.sivInitialize();
                });

                if (this.lineSelector !== undefined) {
                    this.lineSelector.set("value",this.maxRowsPerPage);
                }

                if (this.downloadCSVLink) {
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
                }

            },
            sivInitialize:function()
            {
                if(this.showFilters) {
                    var m=this;
                    this.dsForm=new Siviglia.Forms.DataSourceForm(this,this.domNode);
                    this.dsForm.addListener('FORM_INITIALIZED',this,"onFormInitialize");
                    this.dsForm.initialize();
                }
                else {
                    query(".SivDatasourceFilters",this.domNode).style.display='none';
                    this.onFormInitialize();
                }
            },


            onFormInitialize:function()
            {

                var m1=new Siviglia.Model.Model(this.modelName);
                var dataSourceParams={};
                if(!this.showFilters)
                {
                    dataSourceParams=this.dsParams || {};
                }
                dataSourceParams.__count=this.maxRowsPerPage;
                this.curGrid=new Grid({model:m1,dataSourceName:this.datasource,dataSourceParams:dataSourceParams});

                var opts={maxRowsPerPage:this.maxRowsPerPage,columns:{}};

                // Por cada una de las columnas, vemos si hay transformaciones.
                // El objeto de transformacion va a ser un objeto disponible en la aplicacion.
                var transforms=new dataTransforms();
                var m=this;
                for(var k in this.definition["FIELDS"])
                {
                    if(this.fieldDefinition[k])
                    {
                        if(this.fieldDefinition[k].display==false)
                            continue;
                    }

                    var f=(this['show_'+k] || transforms.getTransform(this.definition["FIELDS"][k]));
                    if(f)
                    {
                        opts.columns[k]={renderCell:(function(f){ return function(){
                            f.apply(m,
                                    Array.prototype.slice.call(arguments))}}(f))};
                    }
                    else
                        opts.columns[k]={};
                    opts.columns[k]["label"]=(this.definition["FIELDS"][k]["LABEL"] || k);
                    opts.columns[k]["display"]=true;
                }
                this.columnDefinition=opts.columns;

                //Si se han extrablecido extracolumns se las pasamos al grid
                if (this.extraColumns) {
                    opts.extraColumns=this.extraColumns;
                }

                var iniParams = {};
                if (this.defaultParams) {
                    iniParams = this.defaultParams;
                }
                if (this.dsParams) {
                    iniParams = this.dsParams;
                }
                this.curGrid.sivInitialize(this.mainGrid, opts, dataSourceParams);

                this.curGrid.domNode.style.position='absolute';
                this.curGrid.domNode.style.top='0px';
                this.curGrid.domNode.style.bottom='0px';
                this.curGrid.domNode.style.left='0px';
                this.curGrid.domNode.style.right='0px';
                this.curGrid.domNode.style.height='auto';
                var m=this;
                aspect.after( this.curGrid, 'renderRow', function(row, args) {
                    m.onRow(row,args);
                    return row;
                });

                this.own(this.curGrid);
                this.updateXLSLink(this.defaultParams);
                if(this.tabs) {
                    this.tabs.startup();
                }

                if (this.showSetColumnsWrapper) {
                    this.initializeColumns();
                }
            },
            onRow:function(row,args)
            {

            },
            resize:function()
            {
                if(this.tabs)
                {
                    this.tabs.resize();
                }
            },
            setParam:function(name,value)
            {
                this.dsParams[name]=value;
                var actualParams={};
                for(var k in this.dsParams)
                {
                    if(typeof this.dsParams[k]!=="undefined" && this.dsParams[k]!==null && this.dsParams[k]!==false)
                        actualParams[k]=this.dsParams[k];
                }
                this.dsParams=actualParams;
                if(this.mode=='Listado') {
                    this.curGrid.sivInitialize(this.mainGrid,{maxRowsPerPage:this.maxRowsPerPage,
                        columns:this.columnDefinition}, actualParams);
                }
                else {
                    this.setGroupingMethod();
                }

                this.updateXLSLink(this.dsParams)
            },
            updateXLSLink:function(params)
            {
                if(!(this.downloadXLSLink || this.downloadCSVLink)) {
                    return;
                }
                var path=this.model.modelName.replace('\\','/');
                var indexF = null;
                if(this.definition.ROLE=='view') {
                    indexF = this.model.definition.INDEXFIELDS[0];
                    path=(path+'/'+this.dsParams[indexF]);
                }
                var name=this.datasource.replace('Ds','');
                var query='';

                for(var k in params) {
                    query+='&'+k+'='+encodeURIComponent(params[k]);
                }

                var cols = [];
                for (var j in this.curGrid.opts.columns) {
                    if (this.curGrid.opts.columns[j].display) {
                        cols.push(this.curGrid.opts.columns[j].label);
                    }
                }

                this.downloadXLSLink.href=top.Siviglia.config.baseUrl+"/"+path+'/'+name+'?output=xlsx'+query+'&output_params[columns]='+cols;
                if(this.downloadCSVLink) {
                    this.downloadCSVLink.href=top.Siviglia.config.baseUrl+"/"+path+'/'+name+'?output=csv'+query+'&output_params[columns]='+cols;
                }
            },
            dataGroupInitialize:function()
            {
                var self=this;
                if (registry.byId('objectSelector').get('value')) {
                    var object = registry.byId('objectSelector').get('value');

                    if (this.dataGroupSelect) {
                        this.dataGroupSelect.destroyRecursive(false);
                    }

                    var disabled = true;
                    if (registry.byId('groupNameSelector2').checked) {
                        disabled = false;
                    }

                    var m = new Siviglia.Model.Model('data_group');
                    m.getMemoryDataSource('FullList', {object: object, id_user: 1}).then(function(data) {
                        var groupStore = self.createGroupStore(data.data);
                        var filteringSelect = new FilteringSelect({
                            id: "dataGroupSelect",
                            name: "dataGroupSelect",
                            value: "",
                            store: groupStore,
                            searchAttr: "name",
                            disabled: disabled,
                            required: true
                        }, "dataGroupSelect");
                        filteringSelect.startup();
                        self.groupSelectorWrapper.appendChild(filteringSelect.domNode);
                        self.dataGroupSelect = filteringSelect;
                    });
                }

                registry.byId('groupNameSelector1').on('change', function(isChecked){
                    if (isChecked) {
                        registry.byId('dataGroupSelect').setDisabled(true);
                        self.groupName.setDisabled(false);
                    }
                });
                registry.byId('groupNameSelector2').on('change', function(isChecked){
                    if (isChecked) {
                        registry.byId('dataGroupSelect').setDisabled(false);
                        self.groupName.setDisabled(true);
                    }
                });
            },
            createGroupStore:function(data)
            {
                var aux = [];
                for (var k=0;k<data.length;k++) {
                    aux.push({id:data[k].id_group, name: data[k].name});
                }
                return new Memory({
                    data: aux
                });
            },
            createGroupMemberStore:function(data)
            {
                var aux = [];
                for (var k=0;k<data.length;k++) {
                    aux.push({id:data[k].id_group_member, name: data[k].name});
                }
                return new Memory({
                    data: aux
                });
            },
            normalizeObjectName:function(str)
            {
                var find = '\\'.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
                return str.replace(new RegExp(find, 'g'), '/').replace('/backoffice/', '');
            },
            showActionsDialog:function()
            {
                var self = this;
                var dActions = new dataActions();
                var actions = dActions.getActions(this.objectContext, this.definition);
                if (actions) {
                    if (this.actionButtons === undefined) {
                        this.actionButtons = [];
                    }
                    if (this.actionParamsView) {
                        this.actionParamsView.destroyRecursive(false);
                    }
                    if (this.actionExecuteView) {
                        this.actionExecuteView.destroyRecursive(false);
                    }

                    var node = document.createElement('div');
                    this.actionsDialogContentWrapper.innerHTML = '';

                    for (var k=0;k<actions.length;k++) {
                        var title = domConstruct.toDom('<div style="font-weight: bold;border-bottom: 1px solid #999999;margin-bottom: 8px;">'+actions[k]['LABEL']+'</div>');
                        node.appendChild(title);

                        var buttonsContainer = document.createElement('div');
                        for (var j=0;j<actions[k]['ACTIONS'].length;j++) {
                            var allActions = actions[k]['ACTIONS'];
                            var curAction = actions[k]['ACTIONS'][j];

                            var actButton = new Button({
                                label: curAction['LABEL'],
                                extra: {
                                    objectNum: k,
                                    actionNum: j,
                                    field: actions[k].FIELD,
                                    model: actions[k].MODEL
                                },
                                onClick: function() {
                                    var actionSelected = actions[this.extra.objectNum]['ACTIONS'][this.extra.actionNum];
                                    self.selectedAction(actionSelected, this.extra.model, this.extra.field);
                                }
                            });
                            actButton.startup();
                            buttonsContainer.appendChild(actButton.domNode);
                            self.actionButtons.push(actButton);
                        }
                        node.appendChild(buttonsContainer);
                    }
                }

                this.actionsDialogContentWrapper.appendChild(node);
                this.executeActionDialog.show();
            },
            selectedAction:function(action, model, field)
            {
                var self = this;

                action.MODEL = model; //Metemos el model en la action para recogerlo después

                //Destruimos los botones de acción
                if (this.actionButtons.length>0) {
                    for (var k=0;k<this.actionButtons.length;k++) {
                        this.actionButtons[k].destroyRecursive(false);
                    }
                }

                if (action.PARAMSVIEW) {
                    //Destruimos la vista de parámetros
                    if (this.actionParamsView) {
                        this.actionParamsView.destroyRecursive(false);
                    }

                    var m=new Siviglia.Model.Model(model);
                    m.getView(action.PARAMSVIEW).then(function(v) {
                        v.startup();

                        //Botones detro de la vista
                        v.on('ACTION CANCELLED', function() {
                            self.executeActionDialog.hide();
                        });
                        v.on('ACTION SELECTED', function(params) {
                            self.selectedActionExecute(action, params);
                        });

                        self.actionParamsView = v;
                        self.actionsDialogContentWrapper.innerHTML = '';
                        self.actionsDialogContentWrapper.appendChild(v.domNode);
                    });
                }
                else {
                    self.selectedActionExecute(action, {});
                }
            },
            selectedActionExecute:function(action, params)
            {
                var self = this;

                //Destruimos la vista de parámetros
                if (this.actionParamsView) {
                    this.actionParamsView.destroyRecursive(false);
                }

                var data = {
                    selectionItems: this.curGrid['_total'],
                    dataGroupName: this.activeDataGroupName,
                    dataGroupMemberName: this.activeDataGroupMemberName
                };

                when(this.getDataGroupMemberNumItems(), function(num) {
                    data.dataGroupMemberItems = num;
                    when(self.getDataGroupNumItems(), function(num) {
                        data.dataGroupItems = num;

                        var actionExecuteView = new ActionExecuteView({activeDataGroupMember: self.activeDataGroupMember, data: data, params: params});
                        actionExecuteView.startup();

                        //Botones dentro de la vista
                        actionExecuteView.on('ACTION CANCELLED', function() {
                            self.executeActionDialog.hide();
                        });

                        actionExecuteView.on('ACTION SELECTED', function(resp) {
                            var actionCallParams = {};

                            switch(resp.params.scope) {
                                case 1:
                                    actionCallParams.id_group_member = self.activeDataGroupMember ? self.activeDataGroupMember : 0;
                                    break;
                                case 2:
                                    actionCallParams.id_group = self.activeDataGroup ? self.activeDataGroup : 0;
                                    break;
                                case 3:
                                    actionCallParams.model_name = self.modelName;
                                    actionCallParams.datasource = self.datasource;
                                    actionCallParams.ds_params = self.dsParams;
                                    break;
                                default:
                                    throw new Error('Unsupported scope');
                            }

                            //ParamsView params
                            if (params.params !== undefined) {
                                for (var w in params.params) {
                                    actionCallParams[w] = params.params[w];
                                }

                            }

                            var actModel = new Siviglia.Model.Model(action.MODEL);
                            actModel.callForm({}, actionCallParams, action.ACTION).then(function(actCallResp) {
                                if (actCallResp.result == 1) {
                                    //Guardar la acción en la tabla de data_group_actions
                                    if (resp.params.scope != 3 && resp.params.cronValue > 0) {
                                        var idGroupMember = 0;
                                        if (resp.params.scope == 1) { //Sobre subgrupo
                                            idGroupMember = self.activeDataGroupMember;
                                        }
                                        var actionParams = {
                                            id_group: self.activeDataGroup,
                                            id_group_member: idGroupMember,
                                            object: action.MODEL,
                                            action: action.ACTION,
                                            params: params.params,
                                            cron_type: resp.params.cronValue
                                        };

                                        var dgaModel = new Siviglia.Model.Model('data_group/data_group_action');
                                        dgaModel.callForm({}, actionParams, 'AddAction').then(function(response) {
                                            if (response.result == 1) {
                                                alert('Se ha ejecutado la acción correctamente y se ha guardado la planificación');
                                            }
                                        });
                                    }
                                    else {
                                        alert('Acción ejecutada correctamente');
                                    }
                                }
                                self.executeActionDialog.hide();
                            });
                        });

                        self.actionExecuteView = actionExecuteView;
                        self.actionsDialogContentWrapper.innerHTML = '';
                        self.actionsDialogContentWrapper.appendChild(actionExecuteView.domNode);
                    });
                });
            },
            getDataGroupMemberNumItems:function()
            {
                var d = new deferred();

                if (this.activeDataGroupMember) {
                    var dataGroupMemberModel = new Siviglia.Model.Model('data_group/data_group_member');
                    dataGroupMemberModel.getMemoryDataSource('FullView', {id_group_member: this.activeDataGroupMember}).then(function(data) {
                        var data = data.data[0];
                        var destModel = Siviglia.Model.Model(data.object);
                        var oParams = new Siviglia.types.PHPVariable('type:PHPVariable', data.params);
                        var params = oParams.value;
                        destModel.getMemoryDataSource(data.datasource, params).then(function(innerdata) {
                            d.resolve(innerdata.data.length);
                        });
                    });
                }
                else {
                    return 0;
                }

                return d;
            },
            getDataGroupNumItems:function()
            {
                var d = new deferred();

                if (this.activeDataGroup) {
                    var dataGroupModel = new Siviglia.Model.Model('data_group');
                    dataGroupModel.getMemoryDataSource('CountMemberItems', {id_group: this.activeDataGroup}).then(function(data) {
                        var numItems = data.data[0]['num_items'];
                        d.resolve(numItems);
                    });
                }
                else {
                    return 0;
                }

                return d;
            },
            showChooseSelectionDialog:function()
            {
                var self = this;

                if (this.CSdataGroupMemberSelect) {
                    this.CSdataGroupMemberSelect.destroyRecursive(false);
                }
                var m = new Siviglia.Model.Model('data_group/data_group_member');
                var params = {
                    datasource: this.datasource,
                    id_user: 1
                };
                if (this.objectContext) {
                    params.object_context = this.objectContext;
                }
                m.getMemoryDataSource('FullList', params).then(function(data) {
                    if (data.data.length) {
                        var groupMemberStore = self.createGroupMemberStore(data.data);
                        var filteringSelect = new FilteringSelect({
                            id: "CSdataGroupMemberSelect",
                            name: "CSdataGroupMemberSelect",
                            value: "",
                            store: groupMemberStore,
                            searchAttr: "name",
                            required: true
                        }, "CSdataGroupMemberSelect");
                        filteringSelect.startup();
                        self.CSdataGroupMemberSelectorWrapper.appendChild(filteringSelect.domNode);
                        self.CSdataGroupMemberSelect = filteringSelect;
                        self.CSdataGroupMemberSelectorContainer.style.display='block';
                        self.CSdataGroupMemberSelectorEmpty.style.display='none';
                    }
                    else {
                        self.chooseSelectionButton.setDisabled(true);
                        self.CSdataGroupMemberSelectorContainer.style.display='none';
                        self.CSdataGroupMemberSelectorEmpty.style.display='block';
                    }
                    self.chooseSelectionDialog.show();
                });
            },
            chooseSelection:function()
            {
                var self = this;

                if (this.chooseSelectionForm.validate()) {
                    var idGroupMember = registry.byId('CSdataGroupMemberSelect').get('value');

                    //Load the saved datasource and put the params
                    var dataGroupMemberModel = new Siviglia.Model.Model('data_group/data_group_member');
                    dataGroupMemberModel.getMemoryDataSource('FullView', {id_group_member: idGroupMember}).then(function(data) {
                        var data = data.data[0];

                        //Set the selected values for actions
                        self.activeDataGroup = data.id_group;
                        self.activeDataGroupMember = idGroupMember;
                        self.activeDataGroupName = data.data_group_name;
                        self.activeDataGroupMemberName = data.data_group_member_name;

                        //Set the loaded params
                        var oParams = new Siviglia.types.PHPVariable('type:PHPVariable', data.params);
                        var params = oParams.value;
                        self.setLoadedParams(params);
                        self.chooseSelectionDialog.hide();
                    });
                }
            },
            setLoadedParams:function(params)
            {
                this.dsParams = [];
                for (k in params) {
                    this.setParam(k, params[k]);
                }
                this.curGrid.refresh();
            },
            showSaveSelectionDialog:function()
            {
                var self= this;

                if (this.saveSelectionDialog !== undefined) {
                    // Si ya tenemos información de las claves primarias ponemos el selector de objetos involucrados.
                    // Si no hubiera ningún objeto, indicamos que el DS no se puede guardar como selección
                    if (! registry.byId('objectSelector')) {
                        when(this.getSelectableObjects(), function(selectableObjects) {
                            if (selectableObjects.length>0) {
                                var options = [];
                                for (var k=0;k<selectableObjects.length;k++) {
                                    options.push({label: selectableObjects[k], value: selectableObjects[k]});
                                }
                                var select = new Select({
                                    name: 'objectSelector',
                                    id: 'objectSelector',
                                    options: options
                                });
                                select.on('change', function() {
                                    self.dataGroupInitialize();
                                });
                                select.startup();
                                self.objectSelectorWrapper.appendChild(select.domNode);
                                self.dataGroupInitialize();
                                self.saveSelectionDialog.show();
                            }
                            else {
                                alert('Este DS no soporta guardado de selección');
                            }
                        });
                    }
                    else {
                        self.saveSelectionDialog.show();
                    }
                }
                else {
                    alert('Este DS no soporta guardado de selección');
                }
            },
            getSelectableObjects:function()
            {
                var selectableObjects=[];
                if (this.dataObjects !== undefined) {
                    for(var k in this.dataObjects) {
                        if (this.haveAllIndexes(this.dataObjects[k], this.definition.FIELDS)) {
                            selectableObjects.push(this.dataObjects[k].MODEL.replace('\\', '/'));
                        }
                    }

                    return selectableObjects;
                }
                else {
                    var d = new deferred();
                    this.getSelectableObjectsFromRemote().then(function(data) {
                        d.resolve(data);
                    });

                    return d;
                }
            },
            getSelectableObjectsFromRemote:function()
            {
                var d = new deferred();

                var self = this;
                var result=[];
                var index=[];
                var promises=[];
                var d = new deferred();
                var fields = this.definition.FIELDS;
                for (k in fields) {
                    field = fields[k];
                    if (field.MODEL !== undefined) {
                        var mName = this.normalizeObjectName(field.MODEL);
                        if ($.inArray(mName, index) === -1) {
                            index.push(mName);
                            (function(d1, mName){
                                var model=new Siviglia.Model.Model(mName);
                                model.getDefinition().then(function(data) {
                                    var aux = {
                                        MODEL: mName,
                                        INDEXFIELDS: data.INDEXFIELDS
                                    };
                                    if (self.haveAllIndexes(aux, self.definition.FIELDS)) {
                                        result.push(mName.replace('\\', '/'));
                                    }
                                    d1.resolve();
                                });
                                promises.push(d1);
                            })(new deferred(), mName);
                        }
                    }
                }

                all(promises).then(function() {
                    d.resolve(result);
                });

                return d;
            },
            haveAllIndexes:function(object, fields)
            {
                if (object.INDEXFIELDS !== undefined && object.INDEXFIELDS.length>0) {
                    var found = false;
                    for (var k=0;k<object.INDEXFIELDS.length;k++) {
                        for (var j in fields) {
                            if (j == object.INDEXFIELDS[k]) {
                                found = true;
                            }
                        }
                    }
                    return found;
                }
                else {
                    return false;
                }
            },
            doRefresh:function()
            {
                this.curGrid.refresh();
            },
            saveSelection:function()
            {
                var self = this;

                if (this.saveSelectionForm.validate()) {
                    var params = {
                        object: registry.byId('objectSelector').get('value'),
                        group_member_name: this.groupMemberName.get('value'),
                        params: this.dsParams,
                        type: 'datasource',
                        datasource: this.datasource,
                        object_context: this.objectContext
                    };

                    if (registry.byId('groupNameSelector1').checked) {
                        params.id_group = 0;
                        params.group_name = this.groupName.get('value');
                    }
                    else {
                        params.group_name = '';
                        params.id_group = registry.byId('dataGroupSelect').get('value');
                    }

                    var m = new Siviglia.Model.Model('data_group/data_group_member');
                    m.callForm({}, params, 'AddAction').then(function(response) {
                        self.saveSelectionDialog.hide();
                        alert('Selección guardada correctamente');

                        //Guardamos el dataGroupMember y el dataGroup activos
                        self.activeDataGroupMember = response.data[0].id_group_member;
                        self.activeDataGroup = response.data[0].id_group;
                        self.activeDataGroupMemberName = self.groupMemberName.get('value');
                    });
                }
            },
            initializeColumns:function()
            {
                this.columnsCheck = [];
                var cols = this.curGrid.opts.columns;
                var columnCheck = null;

                for (var k in cols) {
                    columnCheck = new CheckBox({
                        name: k,
                        value: 1,
                        checked: true
                    });
                    columnCheck.startup();
                    this.columnsCheck.push(columnCheck);
                    var d = document.createElement("span");
                    d.innerHTML = k+'&nbsp;&nbsp;';
                    this.setColumnsContainer.appendChild(columnCheck.domNode);
                    this.setColumnsContainer.appendChild(d);
                }
            },
            showSetColumns:function()
            {
                if (this.showSetColumnsWrapper.style.display==='none') {
                    this.showSetColumnsWrapper.style.display='block';
                }
                else {
                    this.showSetColumnsWrapper.style.display='none';
                }
            },
            setColumns:function()
            {
                var cols = [];
                for(var k=0;k<this.columnsCheck.length;k++) {
                    var aux = {};
                    aux.name = this.columnsCheck[k].get('name');
                    aux.display = this.columnsCheck[k].checked;
                    cols.push(aux);
                }
                this.curGrid.setColumnsDisplay(cols);
                this.showSetColumnsWrapper.style.display='none';
            },
            setColumnsDisplay:function(cols)
            {
                this.curGrid.setColumnsDisplay(cols);
            },
            toggleColumns:function(cols, display)
            {
                var realCols = [];
                for(var k=0;k<cols.length;k++) {
                    var aux = {};
                    aux.name = cols[k];
                    aux.display = display;
                    realCols.push(aux);
                }
                this.curGrid.setColumnsDisplay(realCols);
            },
            setLines:function()
            {
                if(this.mainGrid)
                {
                var lines=this.lineSelector.get("value");
                if(lines!=this.maxRowsPerPage)
                {
                this.maxRowsPerPage=lines;
                this.curGrid.sivInitialize(this.mainGrid,{maxRowsPerPage:this.maxRowsPerPage,columns:this.columnDefinition},this.dsParams);
                }
                this.mainGrid.style.height=(270+(lines-10)*20)+'px';
                }
            },
            setChartVariable:function(variable,value)
            {

                    this.currentChartVariable=variable;
                    this.currentChartValue=value;
                    this.model=new Siviglia.Model.Model(this.modelName);
                    dsParams={__group:variable,__groupParam:value,output:'json'};

                    for(var k in this.dsParams)
                    {
                            dsParams[k]=this.dsParams[k];
                    }
                    m=this;
                    this.updateXLSLink(dsParams);
                    this.model.getMemoryDataSource(this.datasource,dsParams).then(function(s){m.redrawChart(s)},function(e){alert("Error obteniendo datos")});
            },
            setChartVariableValue:function(it)
            {
              console.dir(it);
            },
            redrawChart:function(s)
            {
                if(this.chart)
                {
                    this.chart.destroy(false);
                    this.chart=null;
                }
                if(!this.chart)
                {
                    this.chart=new Chart(this.chartContainer,
                        {
                        title: "Production(Quantity)",
                        titlePos: "bottom",
                        titleGap: 25,
                        titleFont: "normal normal normal 15pt Arial",
                        titleFontColor: "orange"
                    });
                    this.chart.setTheme(chartTheme);
                    this.chart.addPlot("default", {type: "Lines", hAxis: "x", vAxis: "y"});
                    var gType=this.definition["FIELDS"][this.currentChartVariable];
                    var axisType='Default';
                    switch(gType["GROUPING"])
                    {
                        case 'CONTINUOUS':
                        {
                        this.chart.addAxis("x",{plot:"default",type:axisType});
                        this.chart.addAxis("y", {vertical: true,plot:"default"});
                        }break;
                        case 'DISCRETE':
                        {
                            s.query().each(function(it){console.dir(it)});
                        }break;
                        case 'DATE':
                        {
                            switch(this.currentChartValue)
                            {
                                case 'MONTHYEAR':
                                case 'DATE':
                                {
                                    this.chart.addAxis("x",{fixUpper: "major", fixLower:"minor",plot:"default",type:axisType,
                                    natural:true,labelFunc:function(text, value, precision){
                                            console.debug("AQUI");
                                            var t=new Date(value);
                                            //console.dir(t);
                                            return t.getDate()+"/"+ t.getMonth()+"/"+(1900+ t.getYear());
                                        }});
                                    this.chart.addAxis("y", {vertical: true, fixUpper: "major",fixLower:"minor",plot:"default"});
                                }break;
                            }
                        }
                    }


                    this.objStores={};
                    var cAdd=null;

                    //for(var k=0;k<this.addable.length && k<1;k++)
                    //{
                        this.chart.addSeries(this.currentChartVariable,this.createStoreSeries(s,this.currentChartVariable));

                    //}
                    this.chart.render();
                }
            },
            createStoreSeries:function(store,field)
            {
                this.objStores[field]=new StoreSeries(store,{query:null},function(item,st){

                   var o= {
                       y:item["N"],
                       x:item["x"],

                       tooltip:item[field]
                   }
                    return o;
                });
                return this.objStores[field];
            },
            enableChart:function()
            {},
            showListado:function()
            {
                this.mode='Listado';
            },
            showCharts:function()
            {
                var m=this;
                this.mode='Charts';
                this.setGroupingMethod();
            },
            setGroupingMethod:function()
            {
                var m=this;
                var selected=dojo.query("[name=groupingField]").filter(function(radio){
                    var v=radio.value;
                    tInput="chart"+v+"Input";
                    if(radio.checked)
                    {
                        m[tInput].set("disabled",false);
                        cV=m[tInput].get("value");
                        if(cV!="")
                        {
                            m.setChartVariable(v,cV);
                        }
                    }
                    else
                    {
                        m[tInput].set("disabled",true);
                    }

                    return radio.checked;
                });
            }

        });
    }
);
