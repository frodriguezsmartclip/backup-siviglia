
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
            construct:function(type,def,val)
            {
                this.type=type;
                this.definition=def;
                this.valueSet=false;
                this.flags=0;
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
                setFlags:function(flags){this.flags|=flags;},
                getFlags:function(){return this.flags;},
                setValue:function(val){
                    if(this.isNull(val))
                    {
                        this.valueSet=false;this.value=null;
                    }
                    else
                    {this.valueSet=true;this.value=val}
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
                       this.value=type.getValue();
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
                    if(val==null)
                    {
                        this.valueSet=false;
                        this.value=null;
                        return;
                    }
                    if(typeof val=="object" && val!==null)
                    {
                        return this.copy(val);
                    }
                    this.validate(val);
                    return this.setValue(val);
                },
                is_set:function(){
                    if(this.valueSet)
                        return true;
                    return this.flags & this.TYPE_SET_ON_SAVE || this.flags & this.TYPE_SET_ON_ACCESS;
                },
                clear:function(){this.valueSet=true;this.value=null;},
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
                serialize:function(){return this.getValue();}
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
                setValue:function(val){if(this.isNull(val)){this.valueSet=false;this.value=null;}else{this.valueSet=true;this.value=parseInt(val)}},
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
                setValue:function(val)
                {

                    this.validate(val);
                        if(this.definition.TRIM) 
                            val=val.trim();
                        //if(!('ALLOWHTML' in this.definition) || this.definition.ALLOWHTML==false)
                        //    val=escape(val);

                        if(val==='null' || val==='NULL')
                            val = null;

                    this.BaseType$setValue(val);
                    
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
                setValue:function(val)
                {
                    this.valueSet=true;
                    if(val===true || val==="1" || val==="true")
                    {
                        this.value=true;
                    }
                    else
                        this.value=false;
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
                    setValue:function(val)
                    {
                        var c=this.validate(val);
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
                        this.valueSet=true;
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
                setValue:function(val)
                {
                    var c=this.validate(val);
                    this.dateValue=c;
                    // Y-m-D H:M:S
                    var M=c.getMonth()+1;
                    var D=c.getDate();

                    M=(M<10)?('0'+M):M;
                    D=(D<10)?('0'+D):D;
                    this.valueSet=true;
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
                setValue:function(val)
                {
                    this.validate(val);
                    if(this.isNull(val)) 
                    {
                        this.valueSet=false;
                        this.value=null;
                        return;
                    }          
                    this.valueSet=true;
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
                }      
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
                    setValue:function(val)
                    {
                        this.localValidate(val);                        
                        this.valueSet=true;
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
                    setValue:function(val)
                    {
                        if(val===null)
                        {
                            this.value=null;
                            this.valueSet=false;
                            return;
                        }

                        this.validate(val);
                        if(Siviglia.types.isObject(val)) {
                            // Se supone que es un Big.
                            val=val.toString();
                        }
                        this.BaseType$setValue(val);                        
                        if(this.valueSet) 
                            this.innerValue=new Big(val);
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
                        var obj=this.definition.OBJECT;
                        var target;
                        if('FIELD' in this.definition)
                            target=this.definition['FIELD'];
                        else
                            target=this.definition['FIELDS'][0];
                        return Siviglia.types.TypeFactory.getRelationFieldTypeInstance(obj,target);                        
                    }
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
        DefinedObject:{
            construct:function(definition,value)
            {
                this.mainPromise=$.Deferred();
                this.typePromises=[];
                this.__definition=definition;
                this.__value=Siviglia.issetOr(value,null);
                this.fields={};
                var m=this;
                if(Siviglia.isset(definition.FIELDS))
                {
                    var factory=new Siviglia.types._TypeFactory();
                    for(var k in definition.FIELDS)
                    {
                        this.typePromises[k]=factory.getTypeFromDef(definition.FIELDS[k],this.__value?Siviglia.issetOr(this.__value[k],null):null);

                        (function(l){
                            m.typePromises[l].then(function(obj){
                                m[l]=obj;
                                m.fields[l]=m[l];
                        })
                        })(k);
                    }
                }
                $.when.apply(this.typePromises).then(function(){m.mainPromise.resolve();},function(){m.mainPromise.reject()})
            },
            methods:
            {
                then:function(f)
                {
                    this.mainPromise.then(f);
                },
                getPromise:function()
                {
                    return this.mainPromise;
                },
                getInputFor:function(field,node)
                {

                }
            }
        },
        _TypeFactory:{
            construct:function(config,callback)
            {

            },
            methods:
            {
                loadModels:function(models)
                {
                    var p= $.Deferred();
                    Siviglia.Model.metaLoader.getMultiple(models).then(function(f){p.resolve(f);})
                    return p;
                },
                getTypeNames:function(fields)
                {
                    var p= $.Deferred();

                    // Nos tenemos que asegurar de que todas las dependencias se cargan primero.
                    var requiredModels={};
                    var result={};
                    var pendingFields=[];
                    for(var k in fields)
                    {
                        result[k]=fields[k];
                        var q=fields[k]["MODEL"] || fields[k]["OBJECT"];
                        if(!q)
                        {
                                continue;
                        }
                        pendingFields.push(k);
                        if(requiredModels[q])
                            continue;
                        requiredModels[q]={type:'Model',model:q};
                    }

                    var reqs=[];
                    for(var k in requiredModels)
                        reqs.push(requiredModels[k]);

                    if(reqs.length == 0)
                    {
                        p.resolve(result);
                        return p;
                    }
                    this.loadModels(reqs).then(function(m){
                        var mi={};
                        for(var k=0;k< m.length;k++)
                            mi[m[k].model]=m[k];

                        for(var k=0;k<pendingFields.length;k++)
                        {
                            var cf=pendingFields[k];
                            var pM=fields[cf]["MODEL"] || fields[cf]["OBJECT"];
                            var pF=fields[cf]["FIELD"];
                            if(!pF && fields[cf]["FIELDS"])
                            {
                                // TODO : Daria problemas con relaciones de varios campos.
                                for(var j in fields[cf]["FIELDS"])
                                    pF=fields[cf]["FIELDS"][j];
                            }
                            var def=mi[pM].definition["FIELDS"][pF];
                            if(fields[cf].TYPE && fields[cf].TYPE=="Relationship")
                                result[cf]["RELATED_TYPE"]=def;
                            else
                                result[cf]=def;
                        }
                        p.resolve(result);
                    });

                    return p;
                },
                getTypeFromDef:function(def,val)
                {
                    if(!('TYPE' in def)) 
                    {
                        var p= $.Deferred();
                        if(('MODEL' in def) && ('FIELD' in def))
                        {
                            var m=this;
                            this.getModelField(def['MODEL'],def['FIELD']).then(function(d){
                                p.resolve(m.getTypeFromDef(def,val));
                            });
                        }
                        else
                        {
                            console.debug("Campo no encontrado");
                            console.dir(def);
                            p.resolve(null);
                        }
                        return p;
                    }
                    var type=def['TYPE'];
                    if(!Siviglia.types[def['TYPE']]) { console.debug("TIPO NO EXISTE");console.dir(def);}
                    return $.when(new Siviglia.types[def['TYPE']](def,val));
                },
                getModelField:function(model,field)
                {
                    var m=new Siviglia.Model.Model(model);
                    var p= $.Deferred();
                    p.getDefinition().then(function(d){
                        p.resolve(d.FIELDS[field]);
                    })
                    return p;
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
