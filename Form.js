function hideCajaBoletin(){}
Siviglia.Utils.buildClass(
    {
        context:'Siviglia.Forms',
        classes:
        {
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
