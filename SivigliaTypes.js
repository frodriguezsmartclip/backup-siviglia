
array_contains = function (haystack, needle) {

    for (var i = 0; i < haystack.length; i++) {
        if (haystack[i] == needle) return true;
    }
    return false;

}
array_compare = function (total, partial, storeEq) {
    if (!total)return [];
    if (!partial)return [];
    var k, j;
    var found = false;
    var result = [];
    for (k = 0; k < total.length; k++) {
        found = false;
        for (j = 0; j < partial.length; j++) {
            if (total[k] == partial[j]) {
                found = true;
                break;
            }
        }
        if ((found && storeEq ) || (!found && !storeEq))
            result[result.length] = total[k];
    }
    return result;
}
array_intersect = function (total, partial) {
    if (!total)return [];
    if (!partial)return [];
    return array_compare(total, partial, true);
}
Siviglia.Utils.buildClass(
    {
        context:'Siviglia.model',
        classes:{
            BaseTypedObject:{
                inherits:'Siviglia.Dom.EventManager',
                construct:function(defOrUrl,value)
                {
                    this.__type__="BaseTypedObject";
                    this.__definedPromise=$.Deferred();
                    this.__fields={};
                    this.parent=null;
                    if(typeof value=="undefined")
                        this.__value={};
                    else
                        this.__value=value;
                    if(typeof defOrUrl!="string")
                        this.__loadDefinition(defOrUrl);
                    else
                    {
                        var Cache=Siviglia.globals.Cache;
                        var cacheKey="Definition."+defOrUrl;
                        var cached=Cache.get(cacheKey);

                        if(typeof cached!="undefined") {
                            this.__loadDefinition(cached);
                        }
                        else
                        {
                            var m = this;
                            $.getJSON(defOrUrl).then(function (r) {
                                Cache.add(cacheKey,r);
                                m.__loadDefinition(r);
                            });
                        }

                    }
                },
                destruct: function () {
                    for(var k in this.__fields)
                        this.__fields[k].destruct();
                    this.EventManager$destruct();
                },
                methods:{
                    __loadDefinition:function(d)
                    {
                        this.__definition=d;
                        var m=this;

                        this.__iterateOnFieldDefinitions(function(name,def){
                            m.__addField(name,def,m.__value!=null?m.__value[name]:null);
                        });
                        m.__definedPromise.resolve(m);

                    },
                    setParent:function(obj)
                    {
                        this.parent=obj;
                    },
                    getParent:function()
                    {
                        return this.parent;
                    },
                    ready:function()
                    {
                        return this.__definedPromise;
                    },

                    __iterateOnFieldDefinitions:function(cb)
                    {
                        for(var k in this.__definition["FIELDS"])
                        {
                            cb.apply(this,[k,this.__definition.FIELDS[k]]);
                        }
                    },
                    __iterateOnFields:function(cb)
                    {
                        for(var k in this.__fields)
                        {
                            cb.apply(this,[k,this.__fields[k]]);
                        }
                    },
                    // OJO
                    // Aqui no podemos hacer lo "esperable" de crear un objeto,
                    // iterar sobre los campos, e ir pidiendo getValue a cada campo..
                    // Si hicieramos eso, el __getValue retornaria un objeto distinto
                    // al que se uso para hacer el __setValue, por lo que tendríamos 2 objetos js
                    // diferentes, y se quiere evitar eso.
                    getValue:function()
                    {
                        return this.__value;
                    },
                    setValue:function(v)
                    {
                        var m=this;
                        // Limpiamos el valor interno.
                        this.__value=v;
                        this.__iterateOnFields(function(name,field)
                        {
                            if(Siviglia.isset(v[name]))
                                m[name] = v[name];
                            else
                                m[name] = null;
                        });
                        this.valueSet=true;
                    },
                    __validate:function(val)
                    {
                        for(var k in this.__definition.FIELDS)
                        {
                            var cd=this.__definition.FIELDS[k];
                            var c=this.__fields[k];
                            if(cd.REQUIRED && (typeof val[k]=="undefined" || val[k]==null))
                                throw new Siviglia.types.BaseTypeException(ERR_UNSET,{field:k});
                            c.validate(val[k]);
                        }
                        return true;
                    },
                    __onChange:function()
                    {
                        this.fireEvent("CHANGE",{data:this});
                    },

                    __addField:function(name,def,value)
                    {
                        var m=this;
                        var instance=Siviglia.types.TypeFactory.getType(this,def,value);

                            // CREAR EL GETTER Y EL SETTER PARA LA INSTANCIA DEL TIPO.
                            m.__fields[name]=new Siviglia.model.ModelField(m,name,instance)
                            m.__onChange();
                    },
                    __removeField:function(name)
                    {
                        this.__fields[name].destruct();
                        delete this.__fields[name];
                        delete this.__value[name];
                        delete this[name];
                        delete this["_"+name];
                        this.__onChange();
                    },
                    __fieldExists:function(name)
                    {
                        return typeof this.__fields[name]!=="undefined";
                    },
                    __getField:function(name)
                    {
                        return this.__fields[name];
                    },
                    __isEmpty:function()
                    {
                        return this.__value==null;
                    }
                }
            },
            ModelField:
                {
                    construct:function(parent,name,typeInstance)
                    {
                        this.__type__="ModelField";
                        this.parent=parent;
                        Object.defineProperty(this,"parent",{enumerable:false});
                        this.name=name;
                        this.type=typeInstance;
                        var m=this;
                        if(parent.__isEmpty())
                            parent.setValue({});

                        var propSpec={
                            set: function (x) {
                                m.type.setValue(x)
                              //  m.parent.__onChange();
                            },
                            get: function () {
                                return m.type.getValue();
                            },
                            enumerable: true,
                            configurable: true
                        };
                        Object.defineProperty(this.parent, name, propSpec);
                        Object.defineProperty(this.parent.__value, name, propSpec);
                        Object.defineProperty(this.parent, "_"+name, {
                            get: function () {
                                return m.type;
                            },
                            enumerable: false,
                            configurable: true
                        });
                    },
                    destruct:function()
                    {
                        this.type.destruct();
                    },
                    methods:{
                        validate:function(v)
                        {
                            return this.type.validate(v);
                        },
                        getType:function()
                        {
                            return this.type;
                        }
                    }
                }
        }
    }
);

Siviglia.Utils.buildClass(
{
    context:'Siviglia.types',
    classes:{
        BaseException:
        {
            constants:
            {
                ERR_UNSET:1,
                ERR_INVALID:2,
                ERR_TYPE_NOT_FOUND:3,
                ERR_INCOMPLETE_TYPE:4,
                ERR_SERIALIZER_NOT_FOUND:7,
                ERR_TYPE_NOT_EDITABLE:8
            },
            construct:function(code,params,type)
            {
                this.type=type || 'BaseException';
                this.code=code;
                this.params=params;
            },
            methods:
            {
                getName:function()
                {
                    var srcObject=Siviglia.types[this.type];
                    for(var k in srcObject)
                    {
                        if(srcObject[k]==this.code)
                        return k;
                    }
                    return null;
                }
            }
        },
        BaseType:
        {
            inherits:'Siviglia.Dom.EventManager',
            construct:function(type,def,val)
            {
                this.__type__="BaseType";
                this.type=type;
                this.definition=def;
                this.definition["TYPE"]=type;
                this.parent=null;
                this.valueSet=false;
                this.flags=0;
                this.source=null;
                this.sourceFactory=null;
                if(val)this.setValue(val);
            },
            constants:
            {
                TYPE_SET_ON_SAVE:0x1,
                TYPE_SET_ON_ACCESS:0x2,
                TYPE_IS_FILE:0x4,
                TYPE_REQUIRES_SAVE:0x8,
                TYPE_NOT_EDITABLE:0x10,
                TYPE_NOT_MODIFIED_ON_NULL:0x20,
                TYPE_REQUIRES_UPDATE_ON_NEW:0x40
            },
            methods:
            {
                // Los tipos por defecto solo devuelven una promesa resuelta.

                getParent:function()
                {
                    return this.parent;
                },
                setParent:function(parent)
                {
                    this.parent=parent;
                },
                ready:function(){
                   var d=$.Deferred();
                   d.resolve();
                   return d;
                },
                setFlags:function(flags){this.flags|=flags;},
                getFlags:function(){return this.flags;},
                setValue:function(val){
                    if(val==this.value)
                        return;
                    if(this.isNull(val))
                    {
                        this.valueSet=false;
                        this.value=null;
                        this.onChange()
                        return;
                    }
                    try{
                        if(this.validate(val)) {
                            this._setValue(val);
                            this.valueSet = true;
                            this.onChange()
                        }
                    }catch(e)
                    {
                        throw e;
                    }
                },
                _setValue:function(v)
                {
                    this.value=v;
                },
                validate:function(val)
                {
                    return true;
                },
                localValidate:function(val){return this.validate(val);},
                postValidate:function(val){return true;},
                hasValue:function(){
                   return (this.valueSet &&  typeof this.value!="undefined" && this.value!==null) || this.hasDefaultValue() || this.flags & this.TYPE_SET_ON_SAVE || this.flags & this.TYPE_SET_ON_ACCESS;
                },
                hasOwnValue:function(){return this.valueSet;},
                copy:function(type)
                {
                   if(type.hasValue())
                   {
                       this.valueSet=true;
                       this.setValue(type.getValue());
                   }
                   else
                   {
                       this.valueSet=false;
                       this.value=null;
                   }
                },
                isNull:function(val)
                {
                   return typeof val=='undefined' || val===null || val==="NULL";
                },
                isEmpty:function(val)
                {
                    return this.isNull(val) || val=="";
                },
                equals:function(val)
                {
                    if(this.isNull(this.value) || this.isNull(val))
                        return this.value===val;
                    return this.value==val;
                },
                // Funcion para utilizar en sort
                compare:function(val,direction)
                {
                    //  a signed integer where a negative return value means x < y, positive means x > y and 0 means x = 0.
                    var n1=this.isNull(this.value);
                    var n2=this.isNull(val.value);
                    if(n1 && !n2)
                        return -1;
                    if(n1 && n2 || this.value===val.value)
                        return 0;
                    if(!n1 && n2)
                        return 1;
                    if(this.value > val.value)
                        return direction=="ASC"?1:-1;
                    return direction=="ASC"?-1:1;
                },
                __rawSet:function(val){this.value=val;this.valueSet=(val!==null);},
                set:function(val){

                    return this.setValue(val);
                },
                is_set:function(){
                    if(this.valueSet)
                        return true;
                    return this.flags & this.TYPE_SET_ON_SAVE || this.flags & this.TYPE_SET_ON_ACCESS;
                },
                unset:function(){
                    if(!this.valueSet)
                        return;
                    this.valueSet=false;this.value=null;this.onChange()},
                clear:function(){
                    if(this.valueSet==true && this.value==null)
                        return;
                    this.valueSet=true;this.value=null;this.onChange()},
                isEditable:function(){return !(this.flags & this.TYPE_NOT_EDITABLE);},
                get:function(){if(!this.valueSet)
                    throw new Siviglia.types.BaseException('BaseType',Siviglia.types.BaseException.ERR_UNSET);
                    return this.value;
                },
                getValue:function(){
                    if(this.valueSet) return this.value;
                    if(this.hasDefaultValue())
                        return this.getDefaultValue();
                    return null;
                },
                hasDefaultValue:function(){return 'DEFAULT' in this.definition;},
                getDefaultValue:function(){return this.definition.DEFAULT;},
                getRelationshipType:function(){return $.when(this);},
                getDefinition:function(){return this.definition;},
                serialize:function(){return this.getValue();},
                onChange:function()
                {
                    this.fireEvent("CHANGE",{data:this});
                },
                setController:function(controller)
                {
                    this.controller=controller;
                },
                hasSource:function()
                {
                    return typeof this.definition["SOURCE"]!=="undefined";

                },
                getSource:function()
                {
                    if(!this.hasSource())
                        return null;
                    if(this.source!==null)
                        return this.source;
                    var factory=new Siviglia.Data.SourceFactory();
                    var stack=new Siviglia.Path.ContextStack();
                    var plainCtx=new Siviglia.Path.BaseObjectContext(this,"#",stack);


                    this.source=factory.getFromSource(this.definition["SOURCE"],
                        this,
                        stack
                        );
                    return this.source;

                },
                getSourceLabel:function(){
                    var s=this.getSource();
                    if(s==null)
                        throw "No source";
                    return s.getSource().getLabelField();},
                getSourceValue:function(){
                    var s=this.getSource();
                    if(s==null)
                        throw "No source";
                    return s.getSource().getValueField();
                    },
                intersect:function(val){
                    return val;
                },
                getField:function(f)
                {
                    // Un campo basico no tiene subcampos:
                    throw "Cant get field "+f+" from simple type.";
                }
            }
        },
        IntegerException:
        {
            inherits:'BaseException',
            constants:
            {
                ERR_TOO_SMALL:100,
                ERR_TOO_BIG:101,
                ERR_NOT_A_NUMBER:102
            },
            construct:function(code,params){this.BaseException(code,params,'IntegerException');}
        },
        Integer:
        {
            inherits:'BaseType',
            construct:function(def,value)
                {
                    this.BaseType('Integer',def,value);
                },
            methods:
            {
                get:function(){if(!this.valueSet)
                    throw new Siviglia.types.BaseException('BaseType',Siviglia.types.BaseException.ERR_UNSET);
                    return parseInt(this.value);
                },
                getValue:function(){
                    if(this.valueSet) return parseInt(this.value);
                    if(this.hasDefaultValue())
                        return this.getDefaultValue();
                    return null;
                },
                _setValue:function(val){
                    this.value=parseInt(val);
                },
                validate:function(val)
                {

                    if((isNaN(val) || val===""))
                    {
                        if(this.definition.REQUIRED)
                            throw new Siviglia.types.BaseException(Siviglia.types.BaseException.ERR_UNSET);
                        else
                        {
                            this.valueSet=false;
                            return true;
                        }
                    }
                    if(Siviglia.types.isString(val))
                        val=val.trim();

                    this.BaseType$validate(val);
                    var asStr=''+val;
                    if(!asStr.match(/^\d+$/))
                        throw new Siviglia.types.IntegerException(Siviglia.types.IntegerException.ERR_NOT_A_NUMBER);

                    if('MIN' in this.definition && val < parseInt(this.definition.MIN))
                            throw new Siviglia.types.IntegerException(Siviglia.types.IntegerException.ERR_TOO_SMALL);
                    if('MAX' in this.definition && val > parseInt(this.definition.MAX))
                            throw new Siviglia.types.IntegerException(Siviglia.types.IntegerException.ERR_TOO_BIG);

                    return true;
                }
            }

        },
        StringException:
        {
            inherits:'BaseException',
            constants:{
                ERR_TOO_SHORT:100,
                ERR_TOO_LONG:101,
                ERR_INVALID_CHARACTERS:102
            },
            construct:function(code,params){
                this.BaseException(code,params,'StringException');}
        },
        String:
        {
            inherits:'BaseType',
            construct:function(def,value)
            {
                this.BaseType('String',def,value);
            },
            methods:
            {
                validate:function(val)
                {
                    if(this.isNull(val) || val==="")
                    {
                        if(this.definition.REQUIRED)
                            throw new Siviglia.types.BaseException(Siviglia.types.BaseException.ERR_UNSET);
                        else
                        {
                            return true;
                        }
                    }
                    val=''+val;
                    if(!this.BaseType$validate(val)) return false;
                    var c=val.length;
                    if('MINLENGTH' in this.definition && c < this.definition["MINLENGTH"])
                        throw new Siviglia.types.StringException(Siviglia.types.StringException.ERR_TOO_SHORT,{min: this.definition['MINLENGTH'],cur:c});

                    if('MAXLENGTH' in this.definition && c > this.definition["MAXLENGTH"])
                        throw new Siviglia.types.StringException(Siviglia.types.StringException.ERR_TOO_LONG,{max: this.definition['MAXLENGTH'],cur:c});

                    if('REGEXP' in this.definition) {
                        if(!this.regex)
                        {
                            var s=this.definition["REGEXP"];
                            var regParts=s.match(/^\/(.*?)\/([gim]*)$/);
                            if (regParts) {
                                this.regex = new RegExp(regParts[1], regParts[2]);
                            } else {
                                this.regex = new RegExp(s);
                            }


                        }
                        if(!val.match(this.regex)) {
                            throw new Siviglia.types.StringException(Siviglia.types.StringException.ERR_INVALID_CHARACTERS);
                        }
                    }
                    return true;
                },
                _setValue:function(val)
                {
                    if(this.definition.TRIM)
                        val=val.trim();
                    this.value=val;
                }
            }
        },
        AutoIncrement:
        {
            inherits:'Integer',
            construct:function(def,value)
            {
                this.Integer({'TYPE':'AutoIncrement','MIN':0,'MAX':9999999999},value);
                this.setFlags(Siviglia.types.BaseType.TYPE_SET_ON_SAVE);
            },
            methods:
            {
                validate:function(val){return true;},
                getRelationshipType:function(){return $.when(new Siviglia.types.Integer({MIN:0,MAX:9999999999}));}
            }
        },
        Boolean:
        {
            inherits:'BaseType',
            construct:function(def,val)
            {
                this.BaseType('Boolean',def,val);
            },
            methods:
            {
                _setValue:function(val)
                {
                    this.value= (val===true || val==="1" || val==="true");
                }
            }
        },
        DateTimeException:
        {
            inherits:'BaseException',
            constants:
            {
                ERR_START_YEAR:100,
                ERR_END_YEAR:101,
                ERR_WRONG_HOUR:102,
                ERR_WRONG_SECOND:103,
                ERR_STRICTLY_PAST:104,
                ERR_STRICTLY_FUTURE:105
            },
            construct:function(code,params){this.BaseException(code,params,'DateTimeException');}
        },
        DateTime:
        {
            inherits:'BaseType',
            construct:function(def,value)
                {
                    this.BaseType('DateTime',def,value);
                },
            methods:
            {

                    getValue:function()
                    {
                        if(this.valueSet)
                        {
                            if(this.dateValue)
                                return this.dateValue;
                            this.dateValue=new Date(Date.parse(this.value));
                            return this.dateValue;
                        }
                        if('DEFAULT' in this.definition && this.definition['DEFAULT']=='NOW')
                        {
                            this.dateValue=new Date();
                            this.setValue(this.dateValue);
                        }
                        return null;
                    },
                    validate:function(value)
                    {
                        if(this.isNull(value) || value==="")
                            throw new Siviglia.types.BaseException(Siviglia.types.BaseException.ERR_UNSET);

                        var ex=Siviglia.types;
                        // Si es un objeto, debe ser un objeto Date de js
                        if(!Siviglia.types.isObject(value)) {
                            var v=Date.parse(value.replace(/-/g,'/'));
                            odate=new Date();
                            odate.setTime(v);
                            if(odate=='Invalid date')
                            {
                                throw new ex.DateTimeException(ex.BaseException.ERR_INVALID);
                            }
                        }
                        else
                            odate=value;

                        var year=odate.getFullYear(),
                            month=odate.getMonth(),
                            day=odate.getDate(),
                            hour=odate.getHours(),
                            minute=odate.getMinutes(),
                            seconds=odate.getSeconds();

                        if(isNaN(year))
                        {
                            throw new ex.DateTimeException(ex.BaseException.ERR_INVALID);
                        }

                        var ex=Siviglia.types;

                        if('STARTYEAR' in this.definition && parseInt(this.definition.STARTYEAR) > year)
                                throw new ex.DateTimeException(
                                    ex.DateTimeException.ERR_START_YEAR,
                                    {min:this.definition.STARTYEAR,cur:year});
                        if('ENDYEAR' in this.definition && parseInt(this.definition.ENDYEAR) < year)
                                throw new ex.DateTimeException(
                                    ex.DateTimeException.ERR_END_YEAR,
                                    {max:this.definition.ENDYEAR,cur:year});
                        cur=new Date();
                        if('STRICTLYPAST' in this.definition && cur < odate)
                            throw new ex.DateTimeException(
                                    ex.DateTimeException.ERR_STRICTLY_PAST);
                        if('STRICTLYFUTURE' in this.definition && cur > odate)
                            throw new ex.DateTimeException(
                                    ex.DateTimeException.ERR_STRICTLY_FUTURE);
                        return odate;
                    },
                    _setValue:function(val)
                    {
                        this.dateValue=c;
                        // Y-m-D H:M:S
                        var M=c.getMonth()+1;
                        var D=c.getDate();
                        var H=c.getHours();
                        var m=c.getMinutes();
                        var s=c.getSeconds();
                        M=(M<10)?('0'+M):M;
                        D=(D<10)?('0'+D):D;
                        H=(H<10)?('0'+H):H;
                        m=(m<10)?('0'+m):m;
                        s=(s<10)?('0'+s):s;
                        this.value=c.getFullYear()+'-'+M+'-'+D+' '+H+':'+m+':'+s;
                    },
                    serialize:function()
                    {
                        return this.value;
                    },
                    format:function(format)
                    {
                        moment.locale('es');
                        return moment(this.getValue()).format(format);
                    }

            }
        },
        Date:
        {
            inherits:'BaseType',
            construct:function(def,value)
            {
                this.BaseType('Date',def,value);
            },
            methods:
            {

                getValue:function()
                {
                    if(this.valueSet)
                    {
                        if(this.dateValue)
                            return this.dateValue;
                        this.dateValue=new Date(Date.parse(this.value));
                        return this.dateValue;
                    }
                    if('DEFAULT' in this.definition && this.definition['DEFAULT']=='NOW')
                    {
                        this.dateValue=new Date();
                        this.setValue(this.dateValue);
                    }
                    return null;
                },
                validate:function(value)
                {
                    if(this.isNull(value) || value==="")
                        throw new Siviglia.types.BaseException(Siviglia.types.BaseException.ERR_UNSET);

                    var ex=Siviglia.types;
                    // Si es un objeto, debe ser un objeto Date de js
                    if(!Siviglia.types.isObject(value)) {
                        var v=Date.parse(value.replace(/-/g,'/'));
                        odate=new Date();
                        odate.setTime(v);
                        if(odate=='Invalid date')
                        {
                            throw new ex.DateTimeException(ex.BaseException.ERR_INVALID);
                        }
                    }
                    else
                        odate=value;

                    var year=odate.getFullYear(),
                        month=odate.getMonth(),
                        day=odate.getDate(),
                        hour=0;
                        minute=0;
                        seconds=0;

                    if(isNaN(year))
                    {
                        throw new ex.DateTimeException(ex.BaseException.ERR_INVALID);
                    }

                    var ex=Siviglia.types;

                    if('STARTYEAR' in this.definition && parseInt(this.definition.STARTYEAR) > year)
                        throw new ex.DateTimeException(
                            ex.DateTimeException.ERR_START_YEAR,
                            {min:this.definition.STARTYEAR,cur:year});
                    if('ENDYEAR' in this.definition && parseInt(this.definition.ENDYEAR) < year)
                        throw new ex.DateTimeException(
                            ex.DateTimeException.ERR_END_YEAR,
                            {max:this.definition.ENDYEAR,cur:year});
                    cur=new Date();
                    if('STRICTLYPAST' in this.definition && cur < odate)
                        throw new ex.DateTimeException(
                            ex.DateTimeException.ERR_STRICTLY_PAST);
                    if('STRICTLYFUTURE' in this.definition && cur > odate)
                        throw new ex.DateTimeException(
                            ex.DateTimeException.ERR_STRICTLY_FUTURE);
                    return odate;
                },
                _setValue:function(val)
                {
                    this.dateValue=c;
                    // Y-m-D H:M:S
                    var M=c.getMonth()+1;
                    var D=c.getDate();
                    M=(M<10)?('0'+M):M;
                    D=(D<10)?('0'+D):D;
                    this.value=c.getFullYear()+'-'+M+'-'+D;
                }
            }
        },
        Enum:
        {
            inherits:'BaseType',
            construct:function(def,val)
            {
                this.BaseType('Enum',def,val);
            },
            methods:
            {
                validate:function(val)
                {
                    var v=this.definition.VALUES;
                    if(this.isNull(val) || val==="")
                        throw new Siviglia.types.BaseException(Siviglia.types.BaseException.ERR_UNSET);

                    if(Siviglia.types.isString(val) && val!=parseInt(val)) {
                        var idx=this.findIndexOf(val);
                        if(idx>-1) return true;
                    }
                    else
                    {
                        if(val<v.length && val>=0)
                            return true;
                    }

                    throw new Siviglia.types.BaseException(Siviglia.types.BaseException.ERR_INVALID,{val:val});
                },
                _setValue:function(val)
                {
                    if(Siviglia.types.isString(val) && val!=parseInt(val))
                    {
                        this.value=this.findIndexOf(val);
                    }
                    else
                        this.value=parseInt(val);
                },
                findIndexOf:function(str)
                {
                    var v=this.definition.VALUES;
                    for(var k=0;k<v.length;k++)
                    {
                        if(v[k]==str)
                            return k;
                    }
                    return -1;

                },
                getLabels:function()
                {
                    return this.definition["VALUES"];
                },
                getDefaultValue:function()
                {
                    if('DEFAULT' in this.definition)
                        return this.findIndexOf(this.definition.DEFAULT);
                    return null;
                },
                getLabel:function()
                {
                    if(!this.hasOwnValue()) {
                        if('DEFAULT' in this.definition)
                            return this.definition.defaultCharset;
                        return null;
                    }
                    return this.definition.VALUES[this.value];
                },
                hasSource:function()
                {
                    return true;
                },
                getSource:function(controller)
                {
                    var s=new Siviglia.Data.SourceFactory();
                    return s.getFromSource(this.definition,controller,{});
                },

            }
         },
        State:{
             inherits:'Enum'

         },
            /* START */
            FileException:{
                inherits:'BaseException',
                constants:{
                 ERR_FILE_TOO_SMALL:100,
                 ERR_FILE_TOO_BIG:101,
                 ERR_INVALID_FILE:102,
                 ERR_NOT_WRITABLE_PATH:103,
                 ERR_FILE_DOESNT_EXISTS:105,
                 ERR_CANT_MOVE_FILE:106,
                 ERR_CANT_CREATE_DIRECTORY:107,
                 ERR_UPLOAD_ERR_PARTIAL:108,
                 ERR_UPLOAD_ERR_CANT_WRITE:109,
                 ERR_UPLOAD_ERR_INI_SIZE:110,
                 ERR_UPLOAD_ERR_FORM_SIZE:111
                },
                construct:function(code,message)
                {
                    this.BaseException(code,message,'FileException');
                }
            },
            File:
            {
                inherits:'BaseType',
                construct:function(def,val)
                {
                    this.BaseType('File',def,val);
                    this.setFlags(Siviglia.types.BaseType.TYPE_IS_FILE |
                                  Siviglia.types.BaseType.TYPE_REQUIRES_UPDATE_ON_NEW |
                                  Siviglia.types.BaseType.TYPE_REQUIRES_SAVE |
                                  Siviglia.types.BaseType.TYPE_NOT_MODIFIED_ON_NULL);
                },
                methods:
                {
                    localValidate:function(val)
                    {
                        if(this.isNull(val) || val==="")
                            throw new Siviglia.types.BaseException(Siviglia.types.BaseException.ERR_UNSET);

                        if ( window.File && window.FileList && window.FileReader) {
                            size=val.fileSize;
                            if('MINSIZE' in this.definition && size/1024 < this.definition.MINSIZE)
                                throw new Siviglia.types.FileException(Siviglia.types.FileException.ERR_FILE_TOO_SMALL,
                                                                       {min:this.definition.MINSIZE,cur:size});
                            if('MAXSIZE' in this.definition && size/1024 > this.definition.MAXSIZE )
                                throw new Siviglia.types.FileException(Siviglia.types.FileException.ERR_FILE_TOO_BIG,
                                                                       {max:this.definition.MAXSIZE,cur:size});
                            if('EXTENSIONS' in this.definition) {
                                var reg=".*\\.("+this.definition.EXTENSIONS.join('|')+")";
                                var c=new RegExp(reg);
                                if(!val.fileName.match(reg))
                                    throw new Siviglia.types.FileException(Siviglia.types.FileException.ERR_INVALID_FILE,
                                                                           {allowed:this.definition.EXTENSIONS}
                                                                           );
                            }
                        }
                        return true;
                    },
                    setLocalValue:function(val)
                    {
                        this.localValue=val;
                    },
                    _setValue:function(val)
                    {
                        this.localValidate(val);
                        this.value=val;
                    }
                }
            },
            City:
            {
                inherits:'String',
                construct:function(definition,value)
                {
                    this.String({TYPE:'City',MAXLENGTH:100,MINLENGTH:2},value);
                }
            },
            Name:
            {
              inherits:'String',
                construct:function(definition,value)
                {
                    this.String({TYPE:'Name',MAXLENGTH:100,MINLENGTH:2},value);
                }
            },
            HashKey:
            {
              inherits:'String',
                 construct:function(definition,value)
                 {
                    this.String({TYPE:'HashKey',MAXLENGTH:100,MINLENGTH:2},value);
                 }
            },
            Email:
            {
                inherits:'String',
                construct:function(definition,value)
                {
                    this.String({
                        'TYPE':'Email',
                        "MINLENGTH":8,
                        "MAXLENGTH":50,
                        "REGEXP":'^[^@]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$',
                        "ALLOWHTML":false,
                        "TRIM":true
                    },value);
                },
                methods:
                {
                    validate:function(val)
                    {
                        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val))
                            throw new Siviglia.types.BaseException(Siviglia.types.BaseException.ERR_INVALID);
                        return this.String$validate(val);

                    }
                }
            },
            ImageException:
            {
                inherits:'FileException',
                constants:{
                    ERR_NOT_AN_IMAGE:120,
                    ERR_TOO_SMALL:121,
                    ERR_TOO_WIDE:122,
                    ERR_TOO_SHORT:123,
                    ERR_TOO_TALL:124
                },
                construct:function(code,param)
                {
                    this.BaseException(code,param,'ImageException');
                }
            },
            Image:
            {
                inherits:'File',
                construct:function(def,val)
                {
                    if(!('EXTENSIONS' in def))
                        def.EXTENSIONS=['jpg','gif','jpeg','png'];
                    this.File(def,val);
                },
                methods:
                {
                    localValidate:function(val)
                    {
                        if(this.isNull(val) || val==="")
                            throw new Siviglia.types.BaseException(Siviglia.types.BaseException.ERR_UNSET);

                        if ( window.File && window.FileList && window.FileReader && window.Blob ) {
                            // Se pueden hacer cosas con HTML5, como copiarlo a un canvas y saber el tamanio real de la imagen,
                            // recortarla, etc.
                        }
                        return true;
                    },
                    hasThumbnail:function(){return 'THUMBNAIL' in this.definition;},
                    getThumbnailWidth:function(){return this.definition.THUMBNAIL.WIDTH;},
                    getThumbnailHeight:function(){return this.definition.THUMBNAIL.HEIGHT;},
                    hasDescription:function(){return 'DESCRIPTION' in this.definition;},
                    getDescription:function(){return this.definition.DESCRIPTION;},
                    getThumbnailPath:function(){
                        var prefix='th_';
                        if('PREFIX' in this.definition.THUMBNAIL)
                            prefix=this.definition.THUMBNAIL.PREFIX;
                        var parts=this.value.split('/');
                        parts[parts.length-1]=prefix+parts[parts.length-1];
                        return parts.join('/');
                    }
                }
            },
            IP:
            {
                inherits:'String',
                construct:function(def,val)
                {
                    this.String({'TYPE':'IP','MAXLENGTH':15},val);
                }
            },
            Login:
            {
                inherits:'String',
                construct:function(def,val)
                {
                    this.String({'TYPE':'Login','MINLENGTH':4,'MAXLENGTH':15,'REGEXP':'^[a-zA-Z\d_]{3,15}$/i','TRIM':true},val);
                }
            },
            /* aaa */
            Decimal:
            {
                /*
                Api basica de Big : cmp,div,minus,mod, plus, pow, round, sqrt, times, toExponential, toFixed,
                toPrecision, toString, valueOf */
                inherits:'BaseType',
                construct:function(def,val)
                {
                    // def tiene NDECIMALS y NINTEGERS
                    this.BaseType('Decimal',def,val);
                },
                methods:
                {
                    _setValue:function(val)
                    {
                        if(Siviglia.types.isObject(val)) {
                            // Se supone que es un Big.
                            val=val.toString();
                        }
                        this.value=val;

                    }
                }
            },
            Money:
            {
                inherits:'Decimal',
                construct:function(def,val)
                {
                    this.Decimal({TYPE:'Money',NDECIMALS:4,NINTEGERS:15},val);
                }
            },
            Password:
            {
                inherits:'String',
                construct:function(def,val)
                {
                    this.String({TYPE:'Password',MINLENGTH:6,MAXLENGTH:16,REGEXP:'/^[a-z\d_]{6,32}$/i',TRIM:true},val);
                }
            },
            Phone:
            {
                inherits:'String',
                construct:function(def,val)
                {
                    this.String({TYPE:'Phone',MINLENGTH:7,MAXLENGTH:20,REGEXP:'^(\\+?\\-? *[0-9]+)([,0-9 ]*)([0-9 ])*$'});
                }
            },
            Relationship:
            {
                inherits:'BaseType',
                construct:function(definition,value)
                {
                    this.BaseType('Relationship',definition,value);
                },
                methods:
                {
                    get:function(){if(!this.valueSet)
                        throw new Siviglia.types.BaseException('BaseType',Siviglia.types.BaseException.ERR_UNSET);
                        return parseInt(this.value);
                    },
                    getValue:function(){
                        if(this.valueSet) return parseInt(this.value);
                        if(this.hasDefaultValue())
                            return this.getDefaultValue();
                        return null;
                    },
                    getRelationshipType:function()
                    {
                        var obj=this.definition.MODEL;
                        var target;
                        if('FIELD' in this.definition)
                            target=this.definition['FIELD'];
                        else
                            target=this.definition['FIELDS'][0];
                        return Siviglia.types.TypeFactory.getRelationFieldTypeInstance(obj,target);
                    },
                    hasSource:function()
                    {
                        return true;
                    },
                    getSource:function(controller,params)
                    {
                        var s=new Siviglia.Data.SourceFactory();
                        return s.getFromSource(this.definition,controller,params);
                    },
                    getSourceLabel:function(){return this.definition.SEARCHFIELD;},
                    getSourceValue:function(){return this.definition.FIELD;},
                    getSearchField:function()
                    {
                        return this.definition.SEARCHFIELD;
                    },
                    getValueField:function()
                    {
                        if('FIELD' in this.definition)
                            target=this.definition['FIELD'];
                        else
                            target=this.definition['FIELDS'][0];
                        return target;
                    },
                    // Devuelve parametros fijos que son necesarios para
                    // establecer la relacion.Se aplican al datasource.
                    getFixedParameters:function()
                    {
                        return Siviglia.issetOr(this.definition["CONDITIONS"],null);
                    },

                }
            },
            Street:
            {
                inherits:'String',
                construct:function(def,val)
                {
                    this.String({'TYPE':'Street',MINLENGTH:2,MAXLENGTH:200},val)
                }
            },
            Text:
            {
                inherits:'BaseType',
                construct:function(def,val)
                {
                    this.BaseType('Text',def,val);
                }
            },

            Timestamp:
            {
                inherits:'DateTime',
                construct:function(def,value)
                {
                    this.DateTime({TYPE:'Timestamp',DEFAULT:'NOW'},value);
                    this.flags|=Siviglia.types.BaseType.TYPE_NOT_EDITABLE;
                }
            },
            UUID:
            {
                inherits:'BaseType',
                construct:function(def,value)
                {
                    this.BaseType('UUID',def,value);
                }
            },
        BaseKeyContainerType: {
            inherits: 'BaseType',
            construct:function(name,def,value)
            {
                this.factory=new Siviglia.types._TypeFactory();
                this.BaseType(name,def,value);
            },
            methods: {
                isContainer: function () {
                    return true;
                }
            }
        },
            Container:{
              inherits:'BaseType',
                construct:function(def,value)
                {

                    this.innerBaseTypedObject=new Siviglia.model.BaseTypedObject(def,value);
                    this.innerBaseTypedObject.setParent(this);
                    this.keysHolder=new Siviglia.Dom.EventManager();
                    var m=this;
                    for(var k1 in def["FIELDS"])
                    {
                        (function(k){
                        Object.defineProperty(m,"_"+k,{
                            get:function()
                            {
                                return m.innerBaseTypedObject.__getField(k).getType();
                            },
                            set:function(v){},
                            enumerable:false,
                            configurable:true
                        });
                        // Al ser un container, la propiedad _[[KEYS]],en teoria, no cambia.
                        // Otra cosa es que queramos que, por ejemplo, en el array de KEYS solo
                        // aparezcan las claves que no son null.En ese caso si que serian dinamicos
                        // Es por eso
                        Object.defineProperty(m,k,{
                            get:function()
                            {
                                return m.innerBaseTypedObject[k];
                            },
                            set:function(v){
                                m.innerBaseTypedObject[k]=v;
                                return v;
                            },
                            enumerable:true,
                            configurable:true
                        });
                        })(k1);
                    }


                    Object.defineProperty(this,"[[KEYS]]",{
                        get:function()
                        {
                            return m.getKeys();
                        },
                        set:function(v){},
                        enumerable:false,
                        configurable:true
                    });
                    // Al ser un container, la propiedad _[[KEYS]],en teoria, no cambia.
                    // Otra cosa es que queramos que, por ejemplo, en el array de KEYS solo
                    // aparezcan las claves que no son null.En ese caso si que serian dinamicos
                    // Es por eso
                    Object.defineProperty(this,"_[[KEYS]]",{
                        get:function()
                        {
                            return m.keysHolder;
                        },
                        set:function(v){},
                        enumerable:false,
                        configurable:true
                    });

                    this.BaseType('Container',def,value)
                },
                methods:{
                    ready:function()
                    {
                        return this.innerBaseTypedObject.ready();
                    },
                    getKeys: function () {
                        var res=[];
                        for (var k in this.definition["FIELDS"]){
                                res.push(k);
                        }
                        return res;
                    },
                    validate:function(val)
                    {
                       return this.innerBaseTypedObject.__validate(val);
                    },
                    getValue:function()
                    {
                        if(!this.valueSet)
                            return null;
                        return this.innerBaseTypedObject.getValue();
                    },
                    _setValue:function(val)
                    {

                        this.innerBaseTypedObject.setValue(val);

                    }
                }
            },
            Dictionary:{
                inherits:'BaseKeyContainerType',
                construct:function(def,value)
                {
                    this.sampleType=Siviglia.types.TypeFactory.getType(this,def["VALUETYPE"],null);
                    this.innerBaseTypedObject=new Siviglia.model.BaseTypedObject({"FIELDS":{}},{});
                    this.innerBaseTypedObject.setParent(this);
                    this.keysHolder=new Siviglia.Dom.EventManager();
                    var m=this;
                    Object.defineProperty(this,"[[KEYS]]",{
                        get:function()
                        {
                            return m.getKeys();
                        },
                        set:function(v){},
                        enumerable:false,
                        configurable:true
                    });
                    // Al ser un container, la propiedad _[[KEYS]],en teoria, no cambia.
                    // Otra cosa es que queramos que, por ejemplo, en el array de KEYS solo
                    // aparezcan las claves que no son null.En ese caso si que serian dinamicos
                    // Es por eso
                    Object.defineProperty(this,"_[[KEYS]]",{
                        get:function()
                        {
                            return m.keysHolder;
                        },
                        set:function(v){},
                        enumerable:false,
                        configurable:true
                    });
                    this.buildProxy({});
                    this.BaseKeyContainerType('Dictionary',def,value)
                },
                methods:{
                    ready:function()
                    {
                        return this.sampleType.ready();
                    },

                    validate:function(val)
                    {
                        for(var k in val)
                        {
                            this.sampleType.validate(val);
                        }
                        return true;
                    },
                    copy:function(val)
                    {
                        this.setValue(val);
                    },
                    getKeys: function () {
                        var res=[];
                        for (var k in this.proxy){
                                res.push(k);
                        }
                        return res;
                    },
                    _setValue:function(val)
                    {
                        if(this.innerBaseTypedObject)
                            this.innerBaseTypedObject.destruct();
                        this.innerBaseTypedObject = new Siviglia.model.BaseTypedObject({"FIELDS": {}}, {});
                        this.innerBaseTypedObject.setParent(this);
                        this.buildProxy(val);
                    },
                    buildProxy:function(val)
                    {
                        var m=this;

                        this.proxy=new Proxy(val,{

                            get:function(target,prop,receiver)
                            {
                                return m.innerBaseTypedObject[prop];
                            },
                            set:function(target,prop,value)
                            {
                                if(!m.innerBaseTypedObject.__fieldExists(prop)) {
                                    m.innerBaseTypedObject.__addField(prop, m.definition.VALUETYPE, value);
                                    Object.defineProperty(target,prop,{
                                        get:function()
                                        {
                                            return m.innerBaseTypedObject[prop];
                                        },
                                        set:function(v){m.innerBaseTypedObject[prop]=v;},
                                        enumerable:true,
                                        configurable:true
                                    });

                                    m.onChange();

                                    m.keysHolder.fireEvent("CHANGE",{value:m.getKeys()});
                                }
                                else {
                                    m.innerBaseTypedObject[prop] = value;
                                    m.onChange();
                                }
                            },
                            deleteProperty:function(target,prop)
                            {
                                m.innerBaseTypedObject.__removeField(prop);
                                delete target[prop];
                                m.keysHolder.fireEvent("CHANGE",{value:m.getKeys()});
                                m.onChange();
                            }
                        })
                        for(var k in val)
                            this.proxy[k]=val[k];

                    },
                    getValue:function()
                    {
                        if(!this.valueSet)
                            return null;
                        return this.proxy;
                    },
                    getValueInstance:function(val)
                    {
                        return this.factory.getType(null,this.definition["VALUETYPE"],Siviglia.issetOr(val,null));
                    },
                    intersect:function(val) {
                        if (!this.valueSet)
                            return val;
                        if (val.length == 0)
                            return val;
                        var keys = this.getKeys()
                        return array_compare(val, keys, false);
                    }
                }
            },

        TypeSwitcherException:{
            inherits:'BaseException',
            constants: {
                ERR_TYPE_NOT_SET:140,
                ERR_INVALID_TYPE:141,
            },
            construct:function(code,param)
            {
                this.BaseException(code,param,'TypeSwitcherException');
            }
        },
        TypeSwitcher: {
            inherits: 'BaseType',

            construct: function (definition, value) {
                this.subNode = null;
                this.BaseType("TypeSwitcher", definition, value);
                this.currentType = null;
            },
            destruct: function () {
                this.subNode.destruct();
            },
            methods: {
                _setValue: function (val) {
                    this.receivedValue = val;
                    if (this.subNode)
                        this.subNode.destruct();
                    var subType=this.getTypeFromValue(val);
                    this.currentType = subType;
                    var m=this;
                    var def={
                        set:function(value)
                        {
                            var curType;
                            var target=value;
                            if(value==null)
                                target=m.definition.IMPLICIT_TYPE;
                            curType=Siviglia.types.TypeFactory.getType(this,m.definition.ALLOWED_TYPES[target], null)
                            if(m.subNode!==null)
                                m.subNode.destruct();
                            m.subNode=curType;
                            m.currentType=target;

                            if(m.value!==null)
                            {
                                if(m.definition.CONTENT_FIELD)
                                    m.value[m.definition.CONTENT_FIELD]=m.subNode;
                                else
                                    m.value=m.subNode;
                            }

                            m.onChange();
                        },
                        get:function()
                        {
                            return m.currentType;
                        }
                    };
                    Object.defineProperty(val,this.definition.TYPE_FIELD,def);
                    this.subNode=Siviglia.types.TypeFactory.getType(this,m.definition.ALLOWED_TYPES[this.currentType], null);
                    this.value=val;
                    var target=val;
                    if(this.definition.CONTENT_FIELD)
                    {
                        target=val[this.definition.CONTENT_FIELD];
                        Object.defineProperty(val,this.definition.CONTENT_FIELD,{
                            get:function()
                            {
                                return m.subNode.getValue();
                            }
                        });
                        Object.defineProperty(val,"_"+this.definition.CONTENT_FIELD,{
                            get:function()
                            {
                                return m.subNode;
                            }
                        });

                    }
                    this.subNode.setValue(target);
                },
                validate:function(val)
                {
                    var cType=Siviglia.issetOr(val[this.definition.TYPE_FIELD],null);
                    if(cType==null)
                        throw new Siviglia.types.TypeSwitcherException(Siviglia.types.TypeSwitcherException.ERR_INVALID_TYPE);
                    if(!this.isValidType(cType))
                        throw new Siviglia.types.TypeSwitcherException(Siviglia.types.TypeSwitcherException.ERR_INVALID_TYPE);
                    if(!this.subNode)
                        throw new Siviglia.types.TypeSwitcherException(Siviglia.types.TypeSwitcherException.ERR_TYPE_NOT_SET);
                    if(this.subNode)
                    this.subNode.validate(val);
                },
                getTypeFromValue:function(val)
                {
                    var typeField = Siviglia.issetOr(this.definition.TYPE_FIELD,null);
                    if(typeField!=null)
                        return val[typeField];
                    if(this.definition.IMPLICIT_TYPE)
                        return this.definition.IMPLICIT_TYPE;
                    throw new Siviglia.types.TypeSwitcherException(Siviglia.types.TypeSwitcherException.ERR_INVALID_TYPE);
                },
                getValue: function () {
                    if(!this.valueSet)
                        return null;
                    return this.value;
                },
                isValidType:function(v)
                {
                    var list=this.getAllowedTypes();
                    for(var k=0;k<list.length;k++)
                    {
                        if(v==list[k].VALUE)
                            return true;
                    }
                    return false;
                },
                getAllowedTypes: function () {
                    var result = [];

                    if(Siviglia.isset(this.definition.ALLOWED_TYPE_DEFINITIONS))
                    {
                        for (var k in this.definition.ALLOWED_TYPE_DEFINITIONS) {
                            var n = this.definition.ALLOWED_TYPE_DEFINITIONS[k];
                            result.push({LABEL: n.LABEL || n, VALUE: k});
                        }
                    }
                    if(Siviglia.isset(this.definition.ALLOWED_TYPES)) {
                        for (var k = 0; k < this.definition.ALLOWED_TYPES.length; k++) {
                            var n = this.definition.ALLOWED_TYPES[k];
                            result.push({LABEL: n, VALUE: n});
                        }
                    }
                    return result;
                },
                getCurrentType: function () {

                    if(Siviglia.isset(this.definition.TYPE_FIELD)) {
                        var typeField = this.definition.TYPE_FIELD;
                        return this.receivedValue[typeField];
                    }
                        return this.currentType;
                }
            }
        },
        Array: {
            inherits: 'BaseType',
            construct: function (definition, value) {
                var m=this;
                this.children=[];
                this.BaseType("Array", definition, value);
            },
            methods: {
                _setValue: function (val) {
                  var m=this;
                  this.value=val;
                  if(this.value!==null) {
                      this.proxy = new Proxy(val, {
                          apply: function (target, thisArg, argumentsList) {
                              var curVal = JSON.stringify(target);
                              var out=target.apply(thisArg, argumentsList);
                              var newVal = JSON.stringify(target);
                              if (curVal != newVal) {
                                  try {
                                      m.updateChildren(target);
                                  } catch (e) {

                                  }
                              }
                              return out;
                          },
                          get:function(target,prop,receiver)
                          {

                              if(prop=="length")
                                  return val.length;
                              if(!isNaN(prop)) {
                                  prop=parseInt(prop);
                                  return m.children[prop].getValue();
                              }
                              return val[prop];
                          },
                          set:function(target,prop,value,receiver)
                          {

                              if(prop=="length")
                              {
                                  val.length=value;
                                  return value;
                              }
                              if(!isNaN(prop)) {
                                  prop = parseInt(prop);
                                  if(typeof m.children[prop]==undefined)
                                  {
                                      instance = m.getValueInstance();
                                      instance.setValue(value);
                                      m.children.push(instance);
                                      val.push(value);
                                  }
                                  else {
                                      m.children[prop].setValue(value);
                                      val[prop]=value;
                                  }
                              }
                          }

                      });
                      this.value=val;
                      this.updateChildren(val);
                  }
                },
                updateChildren:function(val)
                {
                    if (this.children) {
                        for (var k = 0; k < this.children.length; k++)
                            this.children[k].destruct();
                    }
                    this.children = [];
                    var instance;
                    for (var k = 0; k < val.length; k++) {
                        instance = this.getValueInstance();
                        instance.setValue(val[k]);
                        this.children.push(instance);
                    }
                    this.onChange();
                },
                getValue:function()
                {
                    return this.proxy;
                },
                getKeys: function () {
                    if (!this.children) return [];
                    var res = [];
                    for (var k = 0; k < this.children.length; k++) res.push(k);
                    return res;
                },
                hasSource: function()
                {
                    return Siviglia.isset(this.definition["SOURCE"]);
                },
                getSource:function(controller,params)
                {
                    var s=new Siviglia.Data.SourceFactory();
                    return s.getFromSource(this.definition.SOURCE,controller,params);
                },
                getSourceLabel:function(){return "[[VALUE]]";},
                getSourceValue:function(){return "[[VALUE]]";},
                getValueInstance: function (value,key) {

                    return Siviglia.types.TypeFactory.getType(this,this.definition["VALUETYPE"],null);
                },
                intersect:function(val)
                {
                    if (!this.valueSet)
                        return val;
                    if (val.length == 0)
                        return val;
                    var keys = this.getKeys()
                    return array_compare(val, this.value, false);

                }
            }
        },


            PHPVariable:
            {
                inherits:'BaseType',
                construct:function(def,value)
                {
                    this.BaseType('PHPVariable',def,value?this.unserialize(value):null);
                },
                methods:
                {
                    getHTMLTree:function(object)
                    {
                        if(!object)
                            object=this.getValue();
                            var json="<ul>";
                            for(var prop in object){
                                var value = object[prop];
                                if(value===null)
                                {
                                    json += "<li class='PHPVariable listItem'><span class='PHPVariable label'>"+prop+"</span><span class='PHPVariable value'>[null]</span></li>";
                                    continue;
                                }
                                switch (typeof(value)){
                                    case "object":
                                        var token = Math.random().toString(36).substr(2,16);
                                        json += "<li class='PHPVariable listItem'><a class='PHPVariable listContainer listContainerClose' href='#"+token+'\' onclick="$(this).toggleClass(\'listContainerClose\');$(\'#'+token+"').toggleClass('PHPVariableHidden');\">"+prop+" :</a>";
                                        json += "<div class='PHPVariable subContainer PHPVariableHidden' id='"+token+"' >"+this.getHTMLTree(value)+"</div></li>";
                                        break;
                                    default:
                                        json += "<li><span class='PHPVariable label'>"+prop+"</span><span class='PHPVariable value'>"+value+"</span></li>";
                                }
                            }
                            return json+"</ul>";
                    },
                    unserialize:function(val)
                    {
                        if (val === undefined) return;

                        var that = this,
                        utf8Overhead = function(chr) {
                                 // http://phpjs.org/functions/unserialize:571#comment_95906
                                 var code = chr.charCodeAt(0);
                                 if (code < 0x0080) {
                                        return 0;
                                 }
                                 if (code < 0x0800) {
                                      return 1;
                                 }
                                 return 2;
                            };
                            error = function(type, msg, filename, line) {
                                throw new that.window[type](msg, filename, line);
                            };
                            read_until = function(data, offset, stopchr) {
                                var i = 2,
                                    buf = [],
                                    chr = data.slice(offset, offset + 1);

                                while (chr != stopchr) {
                                    if ((i + offset) > data.length) {
                                        error('Error', 'Invalid');
                                    }
                                    buf.push(chr);
                                    chr = data.slice(offset + (i - 1), offset + i);
                                    i += 1;
                                }
                                return [buf.length, buf.join('')];
                            };
                            read_chrs = function(data, offset, length) {
                                var i, chr, buf;

                                buf = [];
                                for (i = 0; i < length; i++) {
                                    chr = data.slice(offset + (i - 1), offset + i);
                                    buf.push(chr);
                                    length -= utf8Overhead(chr);
                                }
                                return [buf.length, buf.join('')];
                            };
                            _unserialize = function(data, offset) {
                                var dtype, dataoffset, keyandchrs, keys, contig,
                                    length, array, readdata, readData, ccount,
                                    stringlength, i, key, kprops, kchrs, vprops,
                                    vchrs, value, chrs = 0,
                                    typeconvert = function(x) {
                                        return x;
                                    };

                                if (!offset) {
                                    offset = 0;
                                }
                                dtype = (data.slice(offset, offset + 1))
                                    .toLowerCase();

                                dataoffset = offset + 2;

                                switch (dtype) {
                                    case 'i':
                                        typeconvert = function(x) {
                                            return parseInt(x, 10);
                                        };
                                        readData = read_until(data, dataoffset, ';');
                                        chrs = readData[0];
                                        readdata = readData[1];
                                        dataoffset += chrs + 1;
                                        break;
                                    case 'b':
                                        typeconvert = function(x) {
                                            return parseInt(x, 10) !== 0;
                                        };
                                        readData = read_until(data, dataoffset, ';');
                                        chrs = readData[0];
                                        readdata = readData[1];
                                        dataoffset += chrs + 1;
                                        break;
                                    case 'd':
                                        typeconvert = function(x) {
                                            return parseFloat(x);
                                        };
                                        readData = read_until(data, dataoffset, ';');
                                        chrs = readData[0];
                                        readdata = readData[1];
                                        dataoffset += chrs + 1;
                                        break;
                                    case 'n':
                                        readdata = null;
                                        break;
                                    case 's':
                                        ccount = read_until(data, dataoffset, ':');
                                        chrs = ccount[0];
                                        stringlength = ccount[1];
                                        dataoffset += chrs + 2;

                                        readData = read_chrs(data, dataoffset + 1, parseInt(stringlength, 10));
                                        chrs = readData[0];
                                        readdata = readData[1];
                                        dataoffset += chrs + 2;
                                        if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {
                                            error('SyntaxError', 'String length mismatch');
                                        }
                                        break;
                                    case 'a':
                                        readdata = {};

                                        keyandchrs = read_until(data, dataoffset, ':');
                                        chrs = keyandchrs[0];
                                        keys = keyandchrs[1];
                                        dataoffset += chrs + 2;

                                        length = parseInt(keys, 10);
                                        contig = true;

                                        for (i = 0; i < length; i++) {
                                            kprops = _unserialize(data, dataoffset);
                                            kchrs = kprops[1];
                                            key = kprops[2];
                                            dataoffset += kchrs;

                                            vprops = _unserialize(data, dataoffset);
                                            vchrs = vprops[1];
                                            value = vprops[2];
                                            dataoffset += vchrs;

                                            if (key !== i)
                                                contig = false;

                                            readdata[key] = value;
                                        }

                                        if (contig) {
                                            array = new Array(length);
                                            for (i = 0; i < length; i++)
                                                array[i] = readdata[i];
                                            readdata = array;
                                        }

                                        dataoffset += 1;
                                        break;
                                    default:
                                        error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
                                        break;
                                }
                                return [dtype, dataoffset - offset, typeconvert(readdata)];
                            };

                            return _unserialize((val + ''), 0)[2];
                    }
                }
            }
        }


});

/* big.js v1.0.1 https://github.com/MikeMcl/big.js/LICENCE */
(function(e){"use strict";function a(e){var t,n,r,i=this;if(!(i instanceof a))return new a(e);if(e instanceof a){i.s=e.s,i.e=e.e,i.c=e.c.slice();return}if(e===0&&1/e<0)e="-0";else if(!o.test(e+=""))throw NaN;i.s=e.charAt(0)=="-"?(e=e.slice(1),-1):1,(t=e.indexOf("."))>-1&&(e=e.replace(".","")),(n=e.search(/e/i))>0?(t<0&&(t=n),t+=+e.slice(n+1),e=e.substring(0,n)):t<0&&(t=e.length);for(n=0;e.charAt(n)=="0";n++);if(n==(r=e.length))i.c=[i.e=0];else{for(;e.charAt(--r)=="0";);i.e=t-n-1,i.c=[];for(t=0;n<=r;i.c[t++]=+e.charAt(n++));}}function f(e,t,n,r){var i=e.c,s=e.e+t+1;if(n!==0&&n!==1&&n!==2)throw"!Big.RM!";n=n&&(i[s]>5||i[s]==5&&(n==1||r||s<0||i[s+1]!=null||i[s-1]&1));if(s<1||!i[0])e.c=n?(e.e=-t,[1]):[e.e=0];else{i.length=s--;if(n)for(;++i[s]>9;)i[s]=0,s--||(++e.e,i.unshift(1));for(s=i.length;!i[--s];i.pop());}return e}function l(e,t,n){var i=t-(e=new a(e)).e,s=e.c;s.length>++t&&f(e,i,a.RM),i=s[0]?n?t:(s=e.c,e.e+i+1):i+1;for(;s.length<i;s.push(0));return i=e.e,n==1||n==2&&(t<=i||i<=r)?(e.s<0&&s[0]?"-":"")+(s.length>1?(s.splice(1,0,"."),s.join("")):s[0])+(i<0?"e":"e+")+i:e.toString()}a.DP=20,a.RM=1;var t=1e6,n=1e6,r=-7,i=21,s=a.prototype,o=/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i,u=new a(1);s.cmp=function(e){var t,n=this,r=n.c,i=(e=new a(e)).c,s=n.s,o=e.s,u=n.e,f=e.e;if(!r[0]||!i[0])return r[0]?s:i[0]?-o:0;if(s!=o)return s;t=s<0;if(u!=f)return u>f^t?1:-1;for(s=-1,o=(u=r.length)<(f=i.length)?u:f;++s<o;)if(r[s]!=i[s])return r[s]>i[s]^t?1:-1;return u==f?0:u>f^t?1:-1},s.div=function(e){var n=this,r=n.c,i=(e=new a(e)).c,s=n.s==e.s?1:-1,o=a.DP;if(o!==~~o||o<0||o>t)throw"!Big.DP!";if(!r[0]||!i[0]){if(r[0]==i[0])throw NaN;if(!i[0])throw s/0;return new a(s*0)}var l,c,h,p,d,v=i.slice(),m=l=i.length,g=r.length,y=r.slice(0,l),b=y.length,w=new a(u),E=w.c=[],S=0,x=o+(w.e=n.e-e.e)+1;w.s=s,s=x<0?0:x,v.unshift(0);for(;b++<l;y.push(0));do{for(h=0;h<10;h++){if(l!=(b=y.length))p=l>b?1:-1;else for(d=-1,p=0;++d<l;)if(i[d]!=y[d]){p=i[d]>y[d]?1:-1;break}if(!(p<0))break;for(c=b==l?i:v;b;){if(y[--b]<c[b]){for(d=b;d&&!y[--d];y[d]=9);--y[d],y[b]+=10}y[b]-=c[b]}for(;!y[0];y.shift());}E[S++]=p?h:++h,y[0]&&p?y[b]=r[m]||0:y=[r[m]]}while((m++<g||y[0]!=null)&&s--);return!E[0]&&S!=1&&(E.shift(),w.e--),S>x&&f(w,o,a.RM,y[0]!=null),w},s.minus=function(e){var t,n,r,i,s=this,o=s.s,u=(e=new a(e)).s;if(o!=u)return e.s=-u,s.plus(e);var f=s.c,l=s.e,c=e.c,h=e.e;if(!f[0]||!c[0])return c[0]?(e.s=-u,e):new a(f[0]?s:0);if(f=f.slice(),o=l-h){t=(i=o<0)?(o=-o,f):(h=l,c);for(t.reverse(),u=o;u--;t.push(0));t.reverse()}else{r=((i=f.length<c.length)?f:c).length;for(o=u=0;u<r;u++)if(f[u]!=c[u]){i=f[u]<c[u];break}}i&&(t=f,f=c,c=t,e.s=-e.s);if((u=-((r=f.length)-c.length))>0)for(;u--;f[r++]=0);for(u=c.length;u>o;){if(f[--u]<c[u]){for(n=u;n&&!f[--n];f[n]=9);--f[n],f[u]+=10}f[u]-=c[u]}for(;f[--r]==0;f.pop());for(;f[0]==0;f.shift(),--h);return f[0]||(f=[h=0]),e.c=f,e.e=h,e},s.mod=function(e){e=new a(e);var t,n=this,r=n.s,i=e.s;if(!e.c[0])throw NaN;return n.s=e.s=1,t=e.cmp(n)==1,n.s=r,e.s=i,t?new a(n):(r=a.DP,i=a.RM,a.DP=a.RM=0,n=n.div(e),a.DP=r,a.RM=i,this.minus(n.times(e)))},s.plus=function(e){var t,n=this,r=n.s,i=(e=new a(e)).s;if(r!=i)return e.s=-i,n.minus(e);var s=n.e,o=n.c,u=e.e,f=e.c;if(!o[0]||!f[0])return f[0]?e:new a(o[0]?n:r*0);if(o=o.slice(),r=s-u){t=r>0?(u=s,f):(r=-r,o);for(t.reverse();r--;t.push(0));t.reverse()}o.length-f.length<0&&(t=f,f=o,o=t);for(r=f.length,i=0;r;i=(o[--r]=o[r]+f[r]+i)/10^0,o[r]%=10);i&&(o.unshift(i),++u);for(r=o.length;o[--r]==0;o.pop());return e.c=o,e.e=u,e},s.pow=function(e){var t=e<0,r=new a(this),i=u;if(e!==~~e||e<-n||e>n)throw"!pow!";for(e=t?-e:e;;){e&1&&(i=i.times(r)),e>>=1;if(!e)break;r=r.times(r)}return t?u.div(i):i},s.round=function(e,n){var r=new a(this);if(e==null)e=0;else if(e!==~~e||e<0||e>t)throw"!round!";return f(r,e,n==null?a.RM:n),r},s.sqrt=function(){var e,t,n,r=this,i=r.c,s=r.s,o=r.e,u=new a("0.5");if(!i[0])return new a(r);if(s<0)throw NaN;s=Math.sqrt(r.toString()),s==0||s==1/0?(e=i.join(""),e.length+o&1||(e+="0"),t=new a(Math.sqrt(e).toString()),t.e=((o+1)/2|0)-(o<0||o&1)):t=new a(s.toString()),s=t.e+(a.DP+=4);do n=t,t=u.times(n.plus(r.div(n)));while(n.c.slice(0,s).join("")!==t.c.slice(0,s).join(""));return f(t,a.DP-=4,a.RM),t},s.times=function(e){var t,n=this,r=n.c,i=(e=new a(e)).c,s=r.length,o=i.length,u=n.e,f=e.e;e.s=n.s==e.s?1:-1;if(!r[0]||!i[0])return new a(e.s*0);e.e=u+f,s<o&&(t=r,r=i,i=t,f=s,s=o,o=f);for(f=s+o,t=[];f--;t.push(0));for(u=o-1;u>-1;u--){for(o=0,f=s+u;f>u;o=t[f]+i[u]*r[f-u-1]+o,t[f--]=o%10|0,o=o/10|0);o&&(t[f]=(t[f]+o)%10)}o&&++e.e,!t[0]&&t.shift();for(f=t.length;!t[--f];t.pop());return e.c=t,e},s.toString=s.valueOf=function(){var e=this,t=e.e,n=e.c.join(""),s=n.length;if(t<=r||t>=i)n=n.charAt(0)+(s>1?"."+n.slice(1):"")+(t<0?"e":"e+")+t;else if(t<0){for(;++t;n="0"+n);n="0."+n}else if(t>0)if(++t>s)for(t-=s;t--;n+="0");else t<s&&(n=n.slice(0,t)+"."+n.slice(t));else s>1&&(n=n.charAt(0)+"."+n.slice(1));return e.s<0&&e.c[0]?"-"+n:n},s.toExponential=function(e){if(e==null)e=this.c.length-1;else if(e!==~~e||e<0||e>t)throw"!toExp!";return l(this,e,1)},s.toFixed=function(e){var n,s=this,o=r,u=i;r=-(i=1/0),e==null?n=s.toString():e===~~e&&e>=0&&e<=t&&(n=l(s,s.e+e),s.s<0&&s.c[0]&&n.indexOf("-")<0&&(n="-"+n)),r=o,i=u;if(!n)throw"!toFix!";return n},s.toPrecision=function(e){if(e==null)return this.toString();if(e!==~~e||e<1||e>t)throw"!toPre!";return l(this,e-1,2)},typeof module!="undefined"&&module.exports?module.exports=a:typeof define=="function"&&define.amd?define(function(){return a}):e.Big=a})(this);

Siviglia.Utils.buildClass(
{
    context:'Siviglia.types',
    classes:{
        _TypeFactory:{
            construct:function(config,callback)
            {

            },
            methods:
            {
                // Si el tipo es custom, su namespace es:
                // Siviglia.types.model.web.User.MiTipo

                getType:function(parent,def,val)
                {
                    var typePromise=$.Deferred();
                    var type=def['TYPE'];
                    if(type[0]=="/")
                        type=type.substr(1);
                    var typeDotted=type.replace(/[\\|/]/g,".");
                    var fullTypeDotted="Siviglia.types."+typeDotted;
                    var ctx=Siviglia.Utils.stringToContextAndObject(fullTypeDotted);
                    if(!ctx.object)
                    {
                        // Se mira si es un tipo custom definido por un paquete.En ese caso, el nombre
                        // tendria la forma /models/xxx/types/yyyy

                        throw "Unknown Type : "+def["TYPE"];
                    }
                    var newType=new ctx.context[ctx.object](def,val);
                    newType.setParent(parent);
                    return newType;
                },
                getRelationFieldTypeInstance:function(model,field)
                {
                    var p= $.Deferred();
                    this.getTypeFromDef(this.getModelField(model,field)).then(function(t){p.resolve(t.getRelationshipType())});
                    return p;
                }
            }
        }
    }
});
Siviglia.types.TypeFactory= new Siviglia.types._TypeFactory();
Siviglia.i18n=(Siviglia.i18n || {});
Siviglia.i18n.es=(Siviglia.i18n.es || {});
Siviglia.i18n.es.base=(Siviglia.i18n.es.base || {});
Siviglia.i18n.es.base.errors={
        Base:{1:'Por favor, complete este campo.',2:'Campo no válido'},
        Integer:{100:'Valor demasiado pequeño',101:'Valor demasiado grande',102:'Debes introducir un número'},
        String:{100:'El campo debe tener al menos %min% caracteres',
                101:'El campo debe tener un máximo de %max% caracteres',
                102:'Valor incorrecto'},
        DateTime:{
                100:'La fecha debe ser posterior a %min%',
                101:'La fecha debe ser anterior a %max%',
                104:'La fecha debe ser pasada',
                105:'La fecha debe ser futura'
        },
        File:{
                100:'El fichero debe tener un tamaño mínimo de %min% Kb',
                101:'El fichero debe tener un tamaño máximo de %max% Kb',
                102:'Tipo de fichero incorrecto',
                103:'Error al guardar el fichero',
                105:'Error al guardar el fichero',
                106:'Error al guardar el fichero',
                107:'Error al guardar el fichero',
                108:'Error al guardar el fichero',
                109:'Error al guardar el fichero',
                110:'Error al guardar el fichero',
                111:'Error al guardar el fichero'
        },
        Image:{
                120:'El fichero no es una imagen',
                121:'La imagen debe tener al menos %min% pixeles de ancho',
                122:'La imagen debe tener un máximo de %max% píxeles de ancho',
                123:'La imagen debe tener un mínimo de %min% píxeles de altura',
                124:'La imagen debe tener un máximo de %max% píxeles de altura'
        },
        TypeSwitcher:
            {
                140:'Tipo no definido'
            }
    };
Siviglia.i18n.es.base.getErrorFromServerException=function(exName,exValue)
{
    var messages=[];

        var parts= exName.split('\\');
        var lastPart=parts[parts.length-1]
        var parts=lastPart.split("::");
        var src=parts[0].replace(/TypeException$/, '').replace(/TypedException$/,'')
        var p=null;
        for(var j in exValue)
        {
            p=Siviglia.i18n.es.base.errors[src];
            if(!p)
                return null;
            var errM = Siviglia.i18n.es.base.errors[src][j];
            if(!errM)
                return null;
            messages.push(errM);
        }

    return errM;
}

Siviglia.i18n.es.base.getErrorFromJsException=function(ex)
{
    var src=ex.type.replace(/Exception$/, '');
    var p=Siviglia.i18n.es.base.errors[src];
        if(!p)
            return null;
    var str=Siviglia.i18n.es.base.errors[src][ex.code];
    if(ex.params)
    {
        for(var k in ex.params)
        {
            str=str.replace("%"+k+"%",ex.params[k]);
        }
    }
    return str;

}
