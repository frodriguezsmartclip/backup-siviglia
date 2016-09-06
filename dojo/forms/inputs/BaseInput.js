define(["dojo/_base/declare", "dojo/when", "dojo/Deferred"],
    function (declare, when, deferred) {

        return declare([], {

            sivInitialize:function(definition,value,params)
            {
              this.definition=definition;
              this.validator=this.sivValidate;
              if(value!==null)
                this.set("value",value);
              this.sivParams=params;
            },
            showError:function(type,message,exception)
            {
                if(exception && exception.params)
                {
                    for(var k in exception.params)
                    {
                        message=message.replace('%'+k+'%',exception.params[k]);
                    }
                }
                this.set(type,message);
                dijit.showTooltip(
                    message,
                    this.domNode,
                    this.get("tooltipPosition"),
                    !this.isLeftToRight()
                );
            },
            clearErrors:function()
            {
                dijit.hideTooltip(this.domNode);
            },
            getValue:function()
            {
                return this.get("value");
            },
            sivValidate:function(value,params)
            {
                return true;
            },
            setValue:function(val,notify)
            {
                this.set("value",val,notify);
            },
            refresh:function()
            {

            },
            setInputWrapper:function(obj)
            {
                this.inputWrapper=obj;
            },
            getPath:function(path,obj,key)
            {
                if(this.inputWrapper)
                {
                    return this.inputWrapper.getPath(path,obj,key);
                }
                obj[key]=path;
                return path;
            }
        });
    }
);

