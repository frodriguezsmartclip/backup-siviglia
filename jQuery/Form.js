Siviglia.Utils.buildClass(
    {
        "context": "Siviglia.Forms.JQuery",
        classes: {
            Form: {
                inherits: "Siviglia.Forms.BaseForm",
                methods: {
                    initialize: function () {
                        this.BaseForm$initialize();
                        this.SivFormErrorNode=null;
                        this.SivFormOkNode=null;
                        var errNode=$(".SivFormErrorNode",this.node);
                        if(errNode.length > 0)
                            this.SivFormErrorNode=errNode[0];
                        var okNode=$(".SivFormOkNode",this.node);
                        if(okNode.length > 0)
                            this.SivFormOkNode=okNode[0];

                        this.addListener('GENERAL_ERROR', this, "_onGeneralError");
                        this.addListener('FIELD_ERROR', this, "_onFieldError");
                        this.addListener("GLOBAL_ERROR", this, "_onGlobalError"); //{index:k,message:message,data:ex[k]});
                        this.addListener("SAVE_OK", this, "_onSaveOk"); //{index:k,message:message,data:ex[k]});
                        this.addListener("SAVE_NO_OK", this, "_onSaveNoOk");
                        this.addListener("SAVE_START", this, "_onSaveStart");
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

                    },
                    formatError: function (message, exceptionKey, exceptionVal) {
                        if (exceptionVal) {
                            for (var p in exceptionVal.params) {
                                message = message.replace('{' + p + '}', exceptionVal.params[p]);
                            }
                        }
                        var d = document.createElement('div');
                        d.className = "SivFormErrorNodeItem";
                        d.innerHTML = message;
                        return d;
                    },
                    showServerError: function (e) {
                        this.showErrorMessage(e);
                    },
                    _onGeneralError: function (event, params) {
                        this.showErrorMessage(params);
                    },
                    _onFieldError: function (event, params) {
                        this.onFieldError(params.field, params.code, params.text);
                    },
                    _onGlobalError: function (event, params) {
                        this.onServerError(params.index, params.message, params.data);
                    },
                    _onSaveStart: function (event, params) {
                        if (this.SivFormErrorNode) {
                            this.SivFormErrorNode.innerHTML = '';
                        }
                    },
                    _onSaveNoOk: function (event, params) {
                    },
                    _onSaveOk: function (event, params) {
                        this.showOkMessage("Guardado");
                    },
                    onServerError: function (exName, message, data) {

                        if (this.SivFormErrorNode) {
                            var node = this.formatError(message, exName, data);
                            this.SivFormErrorNode.appendChild(node);
                            this.SivFormErrorNode.style.display = 'block';
                            this.SivFormErrorNode.className = "SivErrorNode";
                        }
                    },
                    onInputFieldError: function (name, value) {

                    },
                    onFieldError: function (field, code, text) {

                    },
                    showOkMessage: function (text, timeout) {
                        this.clearErrors();
                        var p = new $.Deferred();
                        if (this.SivFormOkNode) {
                            this.SivFormOkNode.style.display = 'block';
                            this.SivFormOkNode.className = "SivFormOkNode";
                            this.SivFormOkNode.innerHTML = text;
                            if (!timeout)
                                timeout = 3000;
                            var m = this;

                            setTimeout(function () {
                                if (m.SivFormOkNode)
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
                        if (this.SivFormErrorNode) {
                            this.SivFormErrorNode.innerHTML = '';
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
                    getInput: function (f) {
                        return this.inputs[f];
                    }
                }
            }
        }
    }
);