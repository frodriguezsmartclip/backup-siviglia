<html>
<head>
    <script src="../jquery.min.js"></script>
    <script src="../Siviglia.js"></script>
    <script src="../SivigliaTypes.js"></script>
    <script src="../jqwidgets/jqx-all.js"></script>
    <link rel="stylesheet" href="../jqwidgets/styles/jqx.base.css">
    <link rel="stylesheet" href="../jqwidgets/styles/jqx.light.css">
    <script>
        Siviglia.Utils.buildClass(
            {
                context:"Test",
                classes:
                    {
                        "ComboType":
                            {
                                inherits:"Siviglia.types.BaseType",
                                methods:
                                    {
                                        loadSource:function(params)
                                        {
                                            return $.when([
                                                {"a":1,"message":"Opcion 1"},
                                                {"a":2,"message":"Opcion 2"},
                                                {"a":3,"message":"Opcion 3"},
                                                {"a":4,"message":"Opcion 4"},
                                                {"a":5,"message":"Opcion 5"},
                                                {"a":6,"message":"Opcion 6"},
                                                {"a":7,"message":"Opcion 7"}
                                            ]);
                                        }
                                    }
                            },
                        "ComboType2a":
                            {
                                inherits:"Siviglia.types.BaseType",
                                methods:
                                    {
                                        loadSource:function(params)
                                        {
                                            return $.when([
                                                {"val":"one","label":"Sel one"},
                                                {"val":"two","label":"Sel two"}
                                            ]);
                                        }
                                    }
                            },
                        "ComboType2b":
                            {
                                inherits:"Siviglia.types.BaseType",
                                methods:
                                    {
                                        loadSource:function(params)
                                        {
                                            var data={"one":[
                                                {"a":1,"message":"Opcion 1"},
                                                {"a":2,"message":"Opcion 2"},
                                            ],
                                                "two":[
                                                    {"a":10,"message":"xxOpcion 1"},
                                                    {"a":11,"message":"xxOpcion 2"},
                                                ]};
                                            return $.when(data[params.mysource])
                                        }
                                    }
                            },
                        "ComboType2c":
                            {
                                inherits:"Siviglia.types.BaseType",
                                methods:
                                    {
                                        loadSource:function(params)
                                        {
                                            var data={
                                                1:[{"a":20,"message":"Third - 1 - 1"},{"a":21,"message":"Third - 1 - 2"}],
                                                2:[{"a":22,"message":"Third - 2 - 1"},{"a":23,"message":"Third - 2 - 2"}],
                                                10:[{"a":24,"message":"Third - 3 - 1"},{"a":25,"message":"Third - 3 - 2"}],
                                                11:[{"a":26,"message":"Third - 4 - 1"},{"a":27,"message":"Third - 4 - 2"}]
                                            };
                                            return $.when(data[params.mysource])
                                        }
                                    }
                            },
                        "SimpleWidget":{
                            inherits: "Siviglia.UI.Widget,Siviglia.Dom.EventManager",
                            methods: {
                                preInitialize: function (params) {


                                    this.factory=new Siviglia.types._TypeFactory();
                                    this.self=this;
                                    /* STRING **************************/
                                    this.stringType=this.factory.getType(
                                        {
                                            TYPE:"String",
                                            MINLENGTH:3,
                                            LABEL:"Hola",
                                            HELP:"La ayuda"
                                        }
                                    );
                                    this.stringType.setValue("abcde");

                                    /* ENUM **************************/
                                    this.enumType=this.factory.getType({
                                        TYPE:"Enum",
                                        VALUES:["One","Two","Three"],
                                        LABEL:"MiEnum"
                                    })
                                    this.enumType.setValue("Two");

                                    /* INTEGER **************************/
                                    this.integerType=this.factory.getType({
                                        TYPE:"Integer"
                                    })
                                    this.integerType.setValue(10);

                                    /* DECIMAL **************************/
                                    this.decimalType=this.factory.getType({
                                        TYPE:"Decimal",
                                        NINTEGERS:5,
                                        NDECIMALS:2
                                    })
                                    this.decimalType.setValue(8.3);
                                    /* TEXT ******************************/
                                    this.textType=this.factory.getType({
                                        TYPE:"Text"
                                    });
                                    this.textType.setValue("Esta es una prueba");

                                    /* BOOLEAN ***************************/
                                    this.booleanType=this.factory.getType({
                                        TYPE:"Boolean"
                                    });
                                    this.booleanType.setValue(true);

                                    /* COMBO *****************************/
                                    this.comboType=new Test.ComboType('ComboType',{},null);

                                    /* JOINED COMBOS *********************/
                                    this.comboType2a=new Test.ComboType2a('ComboType',{},null);
                                    this.comboType2a.setValue("one");


                                    this.comboType2b=new Test.ComboType2b('ComboType',{},null);

                                    this.comboType2c=new Test.ComboType2c('ComboType',{},null);


                                },
                                initialize: function (params) {
                                },
                                show:function()
                                {
                                    console.dir(this.comboType2b);
                                }
                            }
                        }
                    }
            }
        );

        var t1={
            "TYPE":"Container",
            "FIELDS":{
                "Uno":{
                    "TYPE":"String",
                    "MINLENGTH":4
                },
                "Dos":{
                    "TYPE":"Integer",
                    "MIN":10
                }
            }
        };
        var f=new Siviglia.types._TypeFactory();
        var instance=f.getType(t1);
        instance.set({"Uno":"lalas","Dos":12});
        instance.validate({"Uno":"lalaa","Dos":15});
        f.addNamedType("EXAMPLE",t1);
        var ins=f.getType({"TYPE":"Dictionary","VALUETYPE":"EXAMPLE"});
        ins.set({
            "Primera":{"Uno":"lalas","Dos":12},
            "Segunda":{"Dos":22,"Uno":"wannn"}
        });
        ins.removeItem("Segunda");
    </script>
</head>
<body>
<?php include_once("../jQuery/JqxWidgets.html");?>
<div style="display:none">
    <div sivWidget="Test.SimpleWidget" widgetParams="" widgetCode="Test.SimpleWidget">
<!--
        <div sivView="Siviglia.inputs.jqwidgets.String" sivParams='{"type":"/*stringType"}'>
        </div>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.Enum" sivParams='{"type":"/*enumType"}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.Integer" sivParams='{"type":"/*integerType"}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.Decimal" sivParams='{"type":"/*decimalType"}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.Text" sivParams='{"type":"/*textType"}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.Boolean" sivParams='{"type":"/*booleanType"}'>
        </div>-->
        <div sivView="Siviglia.inputs.jqwidgets.ComboBox" sivParams='{"type":"/*comboType","inputParams":{"searchField":"message","valueField":"a"}}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.ComboBox" sivParams='{"type":"/*comboType2a","inputParams":{"searchField":"label","valueField":"val"}}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.ComboBox" sivParams='{"type":"/*comboType2b","inputParams":{"searchField":"message","valueField":"a"},"sourceParams":{"mysource":"/*comboType2a/getValue"}}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.ComboBox" sivParams='{"type":"/*comboType2c","inputParams":{"searchField":"message","valueField":"a"},"sourceParams":{"mysource":"/*comboType2b/getValue"}}'>
        </div>
        <input type="button" sivEvent="click" sivCallback="show" value="show">
    </div>
</div>
<div sivView="Test.SimpleWidget"></div>
<script>
    $(document).ready(function(){
    //var remoteRoot=new Siviglia.model.RemotePath("http://127.0.0.1/buscando");
    var tmp=new Siviglia.UI.Dom.Expando.ExpandoManager(
        Siviglia.model.Root,
        //remoteRoot,
        Siviglia.model.Root.context
        //remoteRoot.context
     );
    tmp.parse($(document.body),null,null,true);
    });
</script>
</body>
</html>