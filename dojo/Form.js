define(
    ["dojo/_base/declare", "dojo/promise/all",
        "dojo/when", "dojo/Deferred", "dijit/form/Form","dojo/on","dojo/Evented"
    ],
    function (declare, all, when, Deferred, Form,on,Evented) {

        return declare([Evented,Siviglia.Forms.BaseForm], {
            model:{},
            definition:null,
            endPoint: null,
            value: null,
            title: "UUP",
            formClass: '',
            description: '',
            inputs: {},
            //sivForm: null,
            postMixInProperties: function () {
                this.inherited(arguments);
                this.addListener('GENERAL_ERROR',this,"_onGeneralError");
                this.addListener('FIELD_ERROR',this,"_onFieldError");
                this.addListener("GLOBAL_ERROR",this,"_onGlobalError"); //{index:k,message:message,data:ex[k]});
                this.addListener("SAVE_OK",this,"_onSaveOk"); //{index:k,message:message,data:ex[k]});
                this.addListener("SAVE_NO_OK",this,"_onSaveNoOk");
                this.addListener("SAVE_START",this,"_onSaveStart");
            },
            postCreate: function ()
            {
                return this.initialize();
            },
            initialize: function () {
                this.setNode(this.domNode);
                if (this.definition.TITLE)
                    this.title = this.definition.TITLE;
                else {
                    switch (this.definition.ROLE) {
                        case 'Add':
                        {
                            this.title = 'Nuevo ' + this.model.modelMeta.definition.LABEL;
                            this.formClass = 'formAdd';
                        }
                            break;
                        case 'Edit':
                        {
                            this.title = 'Edit';
                            this.formClass = 'formEdit ' + this.model.modelMeta.definition.label;
                        }
                            break;
                    }
                }
                return this.inherited(arguments);

            },
            formatError:function(message,exceptionKey,exceptionVal)
            {
                if (exceptionVal) {
                    for(var p in exceptionVal.params) {
                        message = message.replace('{'+p+'}', exceptionVal.params[p]);
                    }
                }

                var d=document.createElement('div');
                d.className="SivFormErrorNodeItem";
                d.innerHTML=message;
                return d;
            },
            showServerError: function (e) {
                this.showErrorMessage(e);
            },
            _onGeneralError:function(event,params){
                this.showErrorMessage(params);
            },
            _onFieldError:function(event,params){
                this.onFieldError(params.field,params.code,params.text);
            },
            _onGlobalError:function(event,params){
                this.onServerError(params.index,params.message,params.data);
            },
            _onSaveStart:function(event,params){
                if(this.SivFormErrorNode)
                {
                    this.SivFormErrorNode.innerHTML='';
                }
            },
            _onSaveNoOk:function(event,params)
            {
                this.emit("ServerValidateError");
            },
            _onSaveOk:function(event,params){
                this.showOkMessage("Guardado");
                this.emit("Saved",{field:k});
            },
            onServerError:function(exName,message,data)
            {
                if(this.SivFormErrorNode)
                {
                    var node=this.formatError(message,exName,data);
                    this.SivFormErrorNode.appendChild(node);
                    this.SivFormErrorNode.style.display='block';
                    this.SivFormErrorNode.className = "SivErrorNode";
                }
            },
            onInputFieldError:function(name, value)
            {

            },
            onFieldError: function (field, code,text) {

            },
            showOkMessage: function (text, timeout) {
                this.clearErrors();
                var p = new Deferred();
                if (this.SivFormOkNode) {
                    this.SivFormOkNode.style.display = 'block';
                    this.SivFormOkNode.className = "SivFormOkNode";
                    this.SivFormOkNode.innerHTML = text;
                    if (!timeout)
                        timeout = 3000;
                    var m = this;

                    setTimeout(function () {
                        if(m.SivFormOkNode)
                            m.SivFormOkNode.style.display = 'none';
                        p.resolve();
                    }, timeout);
                }
                else
                    p.resolve();
                return p;
            },
            showErrorMessage: function (text) {
                if (this.SivFormErrorNode) {
                    this.SivFormErrorNode.style.display = 'block';
                    this.SivFormErrorNode.className = "SivErrorNode";
                    this.SivFormErrorNode.innerHTML = '';
                    this.SivFormErrorNode.appendChild(this.formatError(text));
                }
            },
            clearErrors: function () {
                if (this.SivFormErrorNode)
                {
                    this.SivFormErrorNode.innerHTML='';
                    this.SivFormErrorNode.style.display = 'none';
                }
                for (k in this.definition.FIELDS) {
                    if (this[k])
                        this[k].clearErrors();
                }
            },
            /*validateForm: function () {
                return this.sivForm.validateForm();
                var p = new Deferred();
                p.resolve();
                return p;
            },*/
            getInput:function(f)
            {
                return this.inputs[f];
            }
        });
    }
);