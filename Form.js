function hideCajaBoletin(){}
Siviglia.Utils.buildClass(
    {
        context:'Siviglia.Forms',
        classes:
        {
            InputFactory:{
                construct:function(framework)
                {
                    this.frameworkInstance=Siviglia.Model.Framework;
                    if(typeof framework!="undefined")
                        this.frameworkInstance=new Siviglia.Model.Frameworks[framework](Siviglia.Model.config);
                    this.currentForm=null;
                },
                methods:
                {

                    parseNode: function (node,formdef,model,form,pathRoot) {
                        var m=this;
                        this.currentForm=form;
                        var promises=[];
                        var groupedPromise= $.Deferred();
                        var inputs={};
                        $("[data-siviglia-input-definition]",node).each(
                            function (index,node) {
                                var p = $.Deferred();
                                var type = node.getAttribute("data-siviglia-input-type");
                                var name = node.getAttribute("data-siviglia-name");
                                var params;
                                var def=null;
                                if(formdef)
                                {
                                    var q;
                                    if((q=formdef["INPUTS"]) && (q=q[name]) && (q=q["PARAMS"]))
                                        params=q;
                                    if((q=formdef["INPUTS"]) && (q=q[name]) && (q=q["TYPE"]))
                                        type=q;
                                    def=formdef["FIELDS"][name];
                                }
                                if(!def)
                                {
                                    var definition = node.getAttribute("data-siviglia-input-definition");
                                    def = $.parseJSON(definition.replace(/\\/g,'\\\\'));
                                }
                                var val=null;

                                if (def["MODEL"] && model) {
                                    typeObj = model.getField(def["FIELD"]).getType();
                                    val = typeObj.getValue();
                                    if (!type)
                                        type = typeObj.definition["TYPE"];
                                }
                                else {
                                    if(!type)
                                        var type = def["TYPE"];
                                    var typeObj = new Siviglia.types[def["TYPE"]](def,null);
                                    val = typeObj.getValue();
                                }

                                if (!params)
                                {
                                    params = node.getAttribute("data-siviglia-input-params");
                                    if(params)
                                        params = $.parseJSON(params.replace(/\\/g,'\\\\'));

                                }

                                var p1= $.Deferred();
                                var r = m.getInput(null,name, type, typeObj, def, val,  params, node,pathRoot).then(function (i) {
                                    inputs[name]=i;
                                    p1.resolve(i);
                                })

                                promises.push(p1);
                            }
                        );
                        $.when.apply($, promises).then(function(){
                            groupedPromise.resolve(inputs);
                        })
                        return groupedPromise;

                    },
                    // Si model es null, field es el nombre del campo.
                    // def es la definicion del tipo, en caso de hacer un input directamente desde el tipo.
                    // Si type es nulo, se usa la informacion del modelo.
                    // params son los parametros del input.
                    getInput:function(model,field,inputtype,type,def,value,params,node,pathRoot)
                    {
                        if(model && !model.substr && !type)
                        {
                            type=model.getField(def["FIELD"]).getType();
                        }

                        if(type)
                        {
                            if(type.substr) // Type es una cadena.
                            {
                                type = new Siviglia.types[def["TYPE"] || def["type"]](def,value);
                            }
                            return this.__getInput(field,inputtype,type,def,value,params,node,pathRoot);
                        }
                        if(model && model.substr)
                        {
                            //model es una cadena.Hay que obtener su definicion.
                            var v=new SivModel(model);
                            var m=this;
                            var p= $.Deferred();
                            $.when(v.getDefinition()).then(function(d){
                                typeDef= d.FIELDS[field];
                                type = new Siviglia.types[typeDef["TYPE"]](typeDef,value);
                                m.__getInput(field,inputtype,type,def,value,params,node).then(function(i){
                                    p.resolve(i);
                                })
                            });
                            return p;
                        }
                    },
                    getInputDefinition:function(name)
                    {

                    },
                    __getInput: function (name, inputtype, typeObj, def, val, params, node,pathRoot) {
                        var p = $.Deferred();
                        if (!inputtype)
                            inputtype = typeObj.getDefaultInput();
                        var m = this;
                       this.frameworkInstance.loadInput(inputtype).then(
                            function (inp) {
                                var b = new Siviglia.Forms.InputWrapper(name, inp, def, m.currentForm, typeObj, typeObj.isNull(val) ? null : typeObj.getValue(), params, node,pathRoot);
                                p.resolve(b);
                            },
                            function (err) {
                                alert("Error");
                                alert(err)
                            }
                        );
                        return p;
                    }
                }
            },
            BaseForm:{
                inherits:'Siviglia.Dom.EventManager',
                construct:function(definition,model,framework)
                {
                    this.definition=definition;
                    this.model=model;
                    this.SivigliaRoot=new Siviglia.model.PathRoot();
                    this.frameworkInstance=Siviglia.Model.Framework;
                    if(typeof framework!="undefined")
                        this.frameworkInstance=new Siviglia.Model.Frameworks[framework](Siviglia.Model.config);

                },
                methods:
                {
                    setNode:function(node)
                    {
                        this.node=node;
                    },
                    initialize: function () {
                        var m = this;
                        var counter = 0;
                        var promises = [];
                        this.inputs = [];
                        var factory=new Siviglia.Forms.InputFactory();
                        var p= $.Deferred();
                        factory.parseNode(this.node,this.definition,this.model,this,this.SivigliaRoot).then(function(inputs){
                            for(var k in inputs)
                            {
                                var inp = inputs[k].getInput();
                                m[k] = inputs[k];
                                m.inputs[k]=inputs[k];
                                inputs[k].startup();
                            }
                            p.resolve(inputs);
                            m.fireEvent("FORM_INITIALIZED",{});
                        });
                        return p;
                    },
                    removeInput: function (inputName) {
                        this.inputs[inputName] = null;
                        this[inputName] = null;
                    },
                    refreshFromModel: function () {
                        for (var k in this.inputs)
                            this.inputs[k].refreshFromModel(this.model);
                    },
                    addInput:function(fieldName, definition, params, node, val,pathRoot)
                    {
                        var p = $.Deferred();
                        if (!definition) {
                            var typeObj = this.model.getField(fieldName).getType();
                            var val = typeObj.getValue();
                            var type = typeObj.definition["TYPE"];
                        }
                        else {
                            var type = definition["TYPE"];
                            var typeObj = new Siviglia.types[type](definition);
                            if (val)
                                typeObj.setValue(val);
                        }

                        if (!params) {
                            if (this.definition["INPUTS"] && this.definition["INPUTS"][fieldName] && this.definition["INPUTS"][fieldName]["PARAMS"]) {
                                params = m.definition["INPUTS"][name]["PARAMS"];
                            }
                        }
                        var m = this;
                        var f=new InputFactory();
                        f.getInput(null,fieldName,type,typeObj,typeObj.definition, val, params, node,pathRoot).then(function (i) {
                            var inp = i.getInput();
                            m.inputs[fieldName]=inp;
                            m[fieldName] = i;
                            p.resolve(i);
                        })
                        return p;
                    },

                    reset:function()
                    {
                        for(var k in this.inputs)
                        {
                            if(k in this.definition.INDEXFIELDS)
                                continue;
                            this.inputs[k].setValue(null);
                        }
                    },
                    clearErrors:function()
                    {
                        for(var k in this.inputs)
                        {
                            if(k in this.definition.INDEXFIELDS)
                                continue;
                            this.inputs[k].clearErrors();
                        }
                        $(".SivFormOkNode",this.node).html("");
                        $(".SivFormErrorNode",this.node).html("");
                    },
                    parseErrors:function(e)
                    {
                        if (e.error == 1) {
                            if (e.action.fieldErrors) {
                                for (var k in e.action.fieldErrors) {
                                    if (this[k])
                                    {
                                        var text=this.decodeServerError(k, e.action.fieldErrors[k]);
                                        this[k].addError('invalidMessage',text);
                                        this.fireEvent("FIELD_ERROR",{field:k,text:text,code: e.action.fieldErrors[k]});
                                    }
                                    else {
                                        // No existe un input para este campo.
                                        var text = '';
                                        for (var c in e.action.fieldErrors[k]) {
                                            var typeErrorText = Siviglia.i18n.es.base.getErrorFromServerException(c,e.action.fieldErrors[k][c]);
                                            if (!typeErrorText) {
                                                text += k + ': ' + c + '<br>';
                                            }
                                            else {
                                                text += k + ': ' + typeErrorText;
                                            }
                                        }
                                        this.fireEvent("GENERAL_ERROR",text);
                                    }
                                }
                            }
                            var isArray=toString.call(e.action.globalErrors) === "[object Array]";
                            if (e.action.globalErrors && !isArray)
                            {
                                this.decodeGlobalServerErrors(e.action.globalErrors)
                            }
                        }
                        else
                        {
                            if(e.message)
                                this.fireEvent("GENERAL_ERROR",e.message + e.response.text);
                        }
                    },
                    decodeGlobalServerErrors:function(ex)
                    {
                        var nErrors=0;
                        for(var k in ex)
                        {
                            nErrors++;
                            var parts= k.split("::");
                            var exName=parts[1];
                            var message='';
                            if (this.definition.ERRORS &&
                                this.definition.ERRORS["GLOBAL"] &&
                                this.definition.ERRORS["GLOBAL"][exName])
                                message=this.definition.ERRORS["GLOBAL"][exName]["txt"];
                            else
                                message=exName;
                            this.fireEvent("GLOBAL_ERROR",{index:k,message:message,data:ex[k]});
                        }
                    },
                    decodeServerError: function (field, exception) {
                        this[field].clearErrors();
                        var exName="";
                        for(var k in exception)
                            exName=k;
                        var errDef=this.definition.FIELDS[field]["ERRORS"];
                        if(!errDef)
                        {
                            var h;
                            if((h=this.definition.ERRORS) && (h= h.FIELDS) && (h=h[field]))
                            {
                                errDef=h;
                            }
                        }
                        if(errDef && errDef[k])
                             return errDef[k]["txt"];


                        var msg = Siviglia.i18n.es.base.getErrorFromServerException(k, exception[k]);
                        if (msg) {
                            return msg;
                        }
                        return "Unknown error";
                    },
                    decodeJsError: function (field, ex) {
                        this[field].clearErrors();
                        var errDef=this.definition.FIELDS[field]["ERRORS"];
                        if(!errDef)
                        {
                            var h;
                            if((h=this.definition.ERRORS) && (h= h.FIELDS) && (h=h[field]))
                            {
                                errDef=h;
                            }
                        }
                        if(errDef)
                        {
                                // Es un error que viene de js.No tenemos el mismo namespace de clase en la excepcion.Se convierte
                                var source=ex.getName();
                                if(errDef[source])
                                     return errDef[source]["txt"];

                        }


                            var msg = Siviglia.i18n.es.base.getErrorFromJsException(ex);
                            if (msg) {
                                return  msg;
                            }
                            return "Unknown Error";

                    },
                    mapInputsToModel:function()
                    {
                        var m=this;
                        var valid=true;
                        for(var k in this.inputs)
                        {
                            try {
                                this.inputs[k].mapTo(this.model);
                            }catch (e) {
                                this.fireEvent("FIELD_ERROR",{field:k})
                                valid = false;
                            }
                        }
                        return valid;
                    },
                    validateForm: function () {
                        var p = new $.Deferred();
                        var errored=false;
                        for(var k in this.inputs)
                        {
                            try{
                                this.inputs[k].sivValidate();
                            }
                            catch(e)
                            {
                                errored=true;
                            }
                        }
                        if(!errored)
                            p.resolve();
                        else
                            p.reject();
                        return p;
                    },
                    setValidationCallback:function(f)
                    {
                        this.validateForm=f;
                    },
                    submit: function (evt) {
                        var curDef;
                        var value;
                        var k;
                        var p = $.Deferred();
                        var m1=this;
                        var data = {};
                        var valid = true;
                        $.when(this.validateForm()).then(function(f){
                        for (var k in m1.definition.FIELDS) {
                            try {
                                  if (m1[k]) {
                                        if(m1[k].isEnabled())
                                        {
                                            data[k] = m1[k].getValue();
                                        }
                                  }
                            } catch (e) {
                                m1.fireEvent("FIELD_ERROR",{field:k});
                                valid = false;
                            }
                        }
                        if (valid == false)
                        {
                            p.reject(null);
                            return p;
                        }
                        if (m1.definition.INDEXFIELDS) {
                            var index = {};
                            for (var k in m1.definition.INDEXFIELDS)
                                index[k] = m1.model.get(k);
                            var savePromise=m1.model.modelMeta.update(index, data, m1.definition.ACTION.ACTION);
                        }
                        else
                            var savePromise=m1.model.modelMeta.add(data, m1.definition.ACTION.ACTION);
                            m1.fireEvent("SAVE_START");

                        savePromise.then(
                                function (r) {
                                    m1.fireEvent("SAVE_END");
                                    if (r.error) {
                                        m1.parseErrors(r);
                                        m1.fireEvent("SAVE_NO_OK");
                                        p.reject(r);
                                        return;
                                    }
                                    m1.fireEvent("SAVE_OK");
                                    p.resolve(r);
                                },
                                function (r) {
                                    m1.fireEvent("SAVE_END");
                                    m1.parseErrors(r);
                                    m1.fireEvent("SAVE_NO_OK");
                                    p.reject(r);
                                 }
                            );
                        },
                            function(){
                                p.reject();
                            }
                        );
                        return p;

                    }
                }
            },
            FormListener:{
                inherits:'Siviglia.model.Listener',
                methods:{
                    onChange:function()
                    {
                        this.pathRootObject.__getPath(this.obj,this.path,this.index,this.context,this.pathRootObject,this);
                    }
                }
            },
            InputWrapperPathElement:{
                inherits:'Siviglia.model.PathResolver',
                construct:function(inputWrapper)
                {
                    this.iW=inputWrapper;
                    this.listenersByPath=[];
                    var v=this;
                    this.paused=false;
                    this.iW.on("change",function(){
                        v.changeListener();
                    });
                    this.PathResolver();
                },
                methods:{
                    changeListener:function(){this.notifyPathListeners();},
                    __getPathProperty:function(path,index,context,currentObject,listener,index)
                    {

                        var nP= [];
                        var defVal=null;
                        for(var k=index+1;k<path.length;k++)
                            nP.push(path[k]);
                        var prop=nP.join("/");
                        var defVal;
                        switch(nP[0])
                        {
                            case "input":
                            {
                                defVal=this.getDefaultValue(nP[1]);
                                f=nP[1].substr(0,1).toUpperCase()+nP[1].substr(1).replace(/\?.*/,'');
                                obj={value:this.iW.input[f]()};
                                index++;
                            }break;
                            case "type":
                            {
                                defVal=this.getDefaultValue(nP[1]);
                                nP[1]=nP[1].replace(/\?.*/,'');
                                switch(nP[1])
                                {
                                    case "value":
                                    {
                                        obj={value:this.iW.type.getValue()}
                                        index++;
                                    }break;
                                }
                            }break;
                            case "value":
                            {
                                defVal=this.getDefaultValue(nP[0]);
                                obj={value:this.iW.input.get("value")};
                            }break;
                        }
                        if(obj.value==null || typeof(obj.value)=="undefined")
                            obj.value=defVal;
                        listener.setValue(obj.value);
                        if(!listener.initialized)
                        {

                            listener.setPath(path,index,currentObject,context);
                            currentObject.addPathListener(listener);
                        }
                        return obj.value;
                    },
                    getDefaultValue:function(str)
                    {
                        var res=str.match(/\?.*/);
                        if(res)
                        {
                            return res[0].substr(1);
                        }
                        return null;
                    },
                    value:function()
                    {
                        return this.iW.type.getValue();
                    },
                    getPath:function(path,obj,property)
                    {
                        path=""+path;
                        // Si no es un path, se devuelve tal cual.
                        if(path.substr(0,1)!='/')
                        {
                            obj[property]=path;
                            return path;
                        }
                        var p;
                        if(!this.listenersByPath[path])
                        {
                            var newListener=new Siviglia.Forms.FormListener(this,path,this,this.iW.pathRoot,this.iW.pathRoot.context,""+path);
                            this.listenersByPath[path]={listener:newListener,obj:obj,property:property};
                            p= this.iW.pathRoot.getPath(path,this.listenersByPath[path].listener,this.iW.pathRoot.context);
                        }
                        else
                        {
                            p= this.listenersByPath[path].listener.getValue();
                        }
                        // Si el path que espera este input, proviene de este mismo inpuyt, no lo deshabilitamos.
                        // Esto ocurre cuando en un combo, el ds que rellena el autocompletado, esta esperando que se teclee algo en el
                        // campo de texto.Si el campo de texto esta vacio, el listener devolvera vacio.Pero no podemos deshabilitar el input
                        if((typeof p == "undefined" || p===null) && this.listenersByPath[path].listener.resolvedObject!=this)
                        {
                            // Si no esta establecido, se deshabilita el input
                            this.iW.input.set("disabled",true);
                        }
                        else
                            this.iW.input.set("disabled",false);
                        return p;
                    },
                    onListener:function(obj,listenerName)
                    {
                        var p=this.listenersByPath[listenerName];
                        p.obj[p.property]=obj.value;
                        this.iW.input.refresh({});
                    },
                    onPathNotFound:function()
                    {
                        console.debug("NOT FOUND!!");
                        console.dir(arguments);
                    },
                    destroyListeners:function()
                    {
                        for(var k in this.listenersByPath)
                        {
                            var v=this.listenersByPath[k];
                            v.listener.destruct();
                        }
                        this.listenersByPath={};
                    }
                }
            },
            InputWrapper:
            {
                construct:function(name, inp, def, m, typeObj, val, params, node, pathRoot) {

                    this.name = name;
                    this.input = new inp({}, node);
                    this.input._onChangeActive=false;
                    this.type = typeObj;
                    this.form = m;
                    if(pathRoot)
                    {
                        this.pathRoot=pathRoot;
                        this.pathListener=new Siviglia.Forms.InputWrapperPathElement(this)
                        this.pathRoot.addElement(name,this.pathListener);
                    }

                    this.definition = typeObj.getDefinition();
                    this.definition["NAME"]=this.name;
                    this.input.setInputWrapper(this);
                    this.input.sivInitialize(this.definition, val, params);
                    this.input._onChangeActive=true;

                    this.sivDefinition = def;
                    this.value = val;
                    this.params = params;

                    this.errorMessage = '';
                    this.enabled=true;
                    if (!this.definition['TYPE']) {
                        var r = null;
                        if (this.definition['REQUIRED'])
                            r = true;
                        // No existe el tipo.Esperemos que exista el modelo.Suponemos que es el actual
                        if (this.definition['MODEL']) {
                            this.definition = m.model.modelMeta.definition.FIELDS[curF['FIELD']];
                        }
                        if (r)
                            this.definition['REQUIRED'] = true;
                    }
                },
                methods:
                {
                    getValue:function () {
                        if (this.sivValidate(this.input.get('value'), null)) {
                            return this.type.serialize();
                        }
                        return false;
                    },
                    getPath:function(path,obj,key)
                    {
                        if(this.pathListener)
                            return this.pathListener.getPath(path,obj,key);
                        return path;
                    },
                    setValue:function (val) {
                        var cVal=this.form.__nochecks;
                        this.form.__nochecks=true;
                        this.input.setValue(val,false);
                        if(val!==null)
                            this.type.__rawSet(val);
                        else
                            this.type.setValue(null,false);
                        this.form.__nochecks=cVal;
                    },
                    on:function(event,callback)
                    {
                        var m=this;
                        this.form.frameworkInstance.addInputEventListener(
                            this.input,event,function(){
                                if (m.form.__nochecks === true && event === 'change') return;
                                callback.apply(callback,arguments);
                            }

                        );
                    },
                    showError:function (type, message) {
                        if(this.form.onInputFieldError)
                        this.form.onInputFieldError(this.name,this.input.getValue());
                        this.input.showError(type, message);
                    },
                    addError:function (type, message) {
                        this.errorMessage += message;
                        this.showError(type, this.errorMessage);
                    },
                    clearErrors:function () {
                        this.errorMessage = '';
                        this.input.clearErrors();
                    },
                    sivValidate:function () {
                        var sivValue = this.input.getValue();
                        if (this.type.isEmpty(sivValue)  && this.sivDefinition.REQUIRED && this.sivDefinition.REQUIRED != "false") {
                            msg=this.form.decodeJsError(this.name,new Siviglia.types.BaseException(Siviglia.types.BaseException.ERR_UNSET))
                            this.showError('invalidMessage',msg);
                            throw "Invalid";
                        }
                        try {
                            this.type.set(sivValue);
                        } catch (ex) {
                            if (ex.code == 1 && ex.type == "BaseException" && !this.sivDefinition.REQUIRED) {
                                return true;
                            }
                            if (ex) {
                                var msg=this.form.decodeJsError(this.name, ex);
                                this.showError('invalidMessage',msg)
                            }
                            throw "Invalid";
                        }


                        this.input.clearErrors();
                        return true;
                    },
                    getInput:function () {
                        return this.input;
                    },
                    refreshFromModel:function (model)
                    {
                        if (this.sivDefinition["MODEL"]) {
                            var val = model.get(this.sivDefinition["FIELD"]);
                            this.setValue(val)
                        }
                    },

                    mapTo:function(model)
                    {
                        if(this.sivDefinition["MODEL"])
                        {
                            val=this.input.get('value');
                            model.setValue(this.sivDefinition["FIELD"],val);
                        }
                    },
                    getType:function () {
                        return this.type
                    },
                    set:function(property,val)
                    {
                        return this.input.set(property,val);
                    },
                    enable:function(enabled)
                    {
                        this.enabled=enabled;
                    },
                    isEnabled:function()
                    {
                        return this.enabled;
                    },
                    startup:function()
                    {
                        this.input.startup();
                    }
                }
            }

        }
    }
);

Siviglia.Utils.buildClass(
    {
        context:'Siviglia.Forms',
        classes:
        {
            DataSourceForm:
            {
                inherits:'BaseForm',
                construct:function(parent,domNode)
                {
                    this.parent=parent;
                    this.domNode=domNode;
                    this.BaseForm(null,null);
                },
                methods:
                {
                    initialize:function()
                    {
                        this.changingParam=false;
                        this.definition={'FIELDS':{}};
                        for(var k in this.parent.definition["PARAMS"])
                        {
                            this.definition["FIELDS"][k]=this.parent.definition["PARAMS"][k];
                        }
                        var m=this;
                        this.setNode(this.domNode);
                        this.BaseForm$initialize().then(function(f){
                            // Se pone a este objeto como listener de cualquier cambio.
                            for(var k in m.inputs)
                            {
                                m.addInputCallback(k,m.inputs[k].getInput())
                            }
                        });
                    },
                    addInputCallback:function(name,input)
                    {

                        var m=this;
                        input.on("change",function(){
                            m.setParam(name,input.getValue());
                        })
                    },
                    setParam:function(name,value)
                    {
                        // Se busca si este parametro esta mapeado a cualquier otro.
                        var mappings=this.parent.inputMappings;
                        for(var k in mappings)
                        {
                            var l=mappings[k].length;
                            for(var j=0;j< l;j++)
                            {
                                if(mappings[k][j]==name)
                                {
                                    this.parent.setParam(k,value);
                                    // Ponemos a null el resto.
                                    for(var h=0;h<l;h++)
                                    {
                                        if(mappings[k][h]!=name)
                                        {
                                            this.inputs[mappings[k][h]].setValue(null);
                                        }
                                    }
                                    return;
                                }
                            }
                        }
                        this.parent.setParam(name,value);
                    }
                }
            }
        }
    }
);