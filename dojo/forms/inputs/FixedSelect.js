define(["dojo/_base/declare", 'dijit/form/Select', 'Siviglia/forms/inputs/BaseInput','dojo/store/Memory'],
    function (declare, Select, BaseInput,Memory) {
        return declare([Select, BaseInput],
            {
                sivInitialize: function (definition,value,params) {

                    var model = params.DATASOURCE.OBJECT;

                    var b=new Siviglia.Model.Model(params.DATASOURCE.OBJECT);
                    var m=this;
                    b.getMemoryDataSource(params.DATASOURCE.NAME,params.DATASOURCE.PARAMS).then(
                        function(st)
                        {
                            var newOpts=[]
                            st.query().forEach(function(it)
                                {
                                    newOpts.push(
                                        {
                                            label:it[params.LABEL[0]],
                                            value:it[params.VALUE]
                                        }
                                    )
                                }
                            )
			    m.options=newOpts;	
                            m.set("name",params.LABEL[0]);
                            m.set("labelAttr",params.LABEL[0]);
                            m.set("placeHolder",(params["PRE_OPTION"]?params["PRE_OPTION"]:'Selecciona una opcion'));
//                            m.setStore(newStore);
                            //m.inputInitializer(definition, value,params);
                            if(value)
                                m.setValue(value);
                            // No hay otra forma de hacerlo!!
                            m.set("style",{width:'150px'});
                            m.startup();
                        }
                    )
                },
                onChange:function(){},
               getValue: function () {
                    return parseInt(this.get('value'));
                }});
    }
);
/*
 EnumInput:function(name,f,form,value)
 {
 var p=new Deferred();
 require(['dijit/form/Select'],function(t){
 var vals=[];
 for(var k in f.VALUES) {
 vals.push({'label':f.VALUES[k],'value':k})
 }

 input=new t({name:name,options:vals});
 input.inputInitializer=inputInitializer;
 input.sivigliaValue=integerCastConverter;
 input.validator=inputValidator;
 input.inputInitializer(f,form,value);
 p.resolve(input);
 });
 return p.promise;
 }*/
