define(["dojo/_base/declare", 'Siviglia/forms/inputs/Select', 'Siviglia/forms/inputs/BaseInput','dojo/store/Memory'],
    function (declare, Select,BaseInput,Memory) {
        return dojo.declare([Select,BaseInput], {
            stateStore:null,
            sivInitialize: function (definition,value,params) {
                var vals=definition['VALUES'];
                var conv=[];
                this.addOption({value:"-1",label:"Seleccionar"});
                for(var k=0;k<vals.length;k++)
                {
                    this.addOption({value:""+k,label:vals[k]});
                    if(value!==undefined)
                    {
                        if((typeof value)=="string")
                        {
                            if(value==vals[k])
                            this.set("value",k);
                        }
                        else
                        {
                            if(value==k)
                                this.set("value",k);
                        }
                    }
                }
                if(value==null || typeof value=="undefined")
                {
                if(definition.DEFAULT && definition.DEFAULT!='NULL')
                    this.set("value",definition.DEFAULT);
                }
                this.startup();
            },
            getValue: function () {
                var val=this.get('value');
                if(val=="-1")
                    return null;
                return parseInt(this.get('value'));

            }
        });
    }
);
