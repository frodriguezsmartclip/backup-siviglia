<html>
<head>
    <script src="/node_modules/jquery/dist/jquery.js"></script>
    <script src="../../Siviglia.js"></script>
    <script src="../../SivigliaPaths.js"></script>
    <script src="../../SivigliaStore.js"></script>
    <script src="../../Model.js"></script>
    <style type="text/css">
        .estilo1 {color:red}
        .estilo2 {color:blue}
    </style>
    <script src="../../SivigliaTypes.js"></script>


    <script src="../../../jqwidgets/jqx-all.js"></script>
    <script src="../../../jqwidgets/globalization/globalize.js"></script>
    <link rel="stylesheet" href="../../../jqwidgets/styles/jqx.base.css">
    <link rel="stylesheet" href="../../../jqwidgets/styles/jqx.light.css">
    <script>

        var Siviglia=Siviglia || {};
        Siviglia.config={
            baseUrl:'http://editor.adtopy.com/',
            staticsUrl:'http://statics.adtopy.com/',
            jsFramework:'jquery',
            locale:'es-ES',
            mapper:'BackofficeMapper',
            datasourcePrefix:'datasource/'
            //jsFramework:'dojo'
        };
        Siviglia.Model.initialize(Siviglia.config);


        Siviglia.Utils.buildClass(
            {
                context:"Test",
                classes:
                    {
                        "SimpleWidget":{
                            inherits: "Siviglia.UI.Widget,Siviglia.Dom.EventManager",
                            methods: {
                                preInitialize: function (params) {


                                    this.factory=Siviglia.types.TypeFactory;
                                    this.self=this;
                                    this.typeCol=[];
                                    /* STRING **************************/
                                    this.stringType=this.factory.getType(null,
                                        {
                                            TYPE:"String",
                                            MINLENGTH:3,
                                            LABEL:"Hola",
                                            HELP:"La ayuda"
                                        }
                                    );
                                    this.stringType.setValue("abcde");

                                    /* ENUM **************************/
                                    this.enumType=this.factory.getType(null,{
                                        TYPE:"Enum",
                                        VALUES:["One","Two","Three"],
                                        LABEL:"MiEnum"
                                    })
                                    this.enumType.setValue("Two");

                                    /* INTEGER **************************/
                                    this.integerType=this.factory.getType(null,{
                                        TYPE:"Integer",
                                        MAX:1000
                                    })
                                    this.integerType.setValue(10);

                                    /* DECIMAL **************************/
                                    this.decimalType=this.factory.getType(null,{
                                        TYPE:"Decimal",
                                        NINTEGERS:5,
                                        NDECIMALS:2
                                    })
                                    this.decimalType.setValue(8.3);

                                    /* TEXT ******************************/
                                    this.textType=this.factory.getType(null,{
                                        TYPE:"Text"
                                    });
                                    this.textType.setValue("Esta es una prueba");


                                    /* BOOLEAN ***************************/
                                    this.booleanType=this.factory.getType(null,{
                                        TYPE:"Boolean"
                                    });
                                    this.booleanType.setValue(true);


                                    /* COMBO *****************************/
                                    this.comboType=new Siviglia.types.Integer({
                                        "TYPE":"Integer",
                                        "SOURCE": {
                                            "TYPE": "Array",
                                            "DATA":[
                                                {"a":1,"message":"Opcion 1"},
                                                {"a":2,"message":"Opcion 2"},
                                                {"a":3,"message":"Opcion 3"},
                                                {"a":4,"message":"Opcion 4"},
                                                {"a":5,"message":"Opcion 5"},
                                                {"a":6,"message":"Opcion 6"},
                                                {"a":7,"message":"Opcion 7"}
                                            ],
                                            "LABEL":"message",
                                            "VALUE":"a"
                                        }
                                    });


                                    this.comboType2a=new Siviglia.types.String({
                                        "TYPE":"String",
                                        "SOURCE":{
                                            "TYPE":"Array",
                                            "DATA":[
                                                {"val":"one","label":"Sel one"},
                                                {"val":"two","label":"Sel two"}
                                            ],
                                            "LABEL":"label",
                                            "VALUE":"val"
                                        }
                                    });

                                    this.comboType2b=new Siviglia.types.Integer(
                                        {
                                            "TYPE":"Integer",
                                            "SOURCE": {
                                                "TYPE": "Array",
                                                "DATA":
                                                    {"one":[
                                                            {"a":1,"message":"Opcion 1"},
                                                            {"a":2,"message":"Opcion 2"},
                                                        ],
                                                        "two":[
                                                            {"a":10,"message":"xxOpcion 1"},
                                                            {"a":11,"message":"xxOpcion 2"},
                                                        ]
                                                    }
                                                ,
                                                "LABEL":"message",
                                                "VALUE":"a",
                                                "PATH":"/{%*comboType2a%}"

                                            }
                                        }
                                    );


                                    this.comboType2c=new Siviglia.types.Integer(
                                        {
                                            "TYPE":"Integer",
                                            "SOURCE": {
                                                "TYPE": "Array",
                                                "DATA":
                                                    {
                                                        1:[{"a":20,"message":"Third - 1 - 1"},{"a":21,"message":"Third - 1 - 2"}],
                                                        2:[{"a":22,"message":"Third - 2 - 1"},{"a":23,"message":"Third - 2 - 2"}],
                                                        10:[{"a":24,"message":"Third - 3 - 1"},{"a":25,"message":"Third - 3 - 2"}],
                                                        11:[{"a":26,"message":"Third - 4 - 1"},{"a":27,"message":"Third - 4 - 2"}]
                                                    }
                                                ,
                                                "LABEL":"message",
                                                "VALUE":"a",
                                                "PATH":"/{%*comboType2b%}"
                                            }
                                        }
                                    );


                                    this.modelSelector=new Siviglia.types.String(
                                        {
                                            "TYPE":"String",
                                            "SOURCE":{
                                                "TYPE":"DataSource",
                                                "MODEL":"/model/reflection/Model",
                                                "DATASOURCE":"ModelList",
                                                "LABEL":"smallName",
                                                "VALUE":"smallName"
                                            }
                                        }
                                    );

                                    var m=this;
                                    //setTimeout(function(){m.modelSelector='/model/web/Site'},3000);
                                    this.fieldSelector=new Siviglia.types.String(
                                        {
                                            "TYPE":"String",
                                            "SOURCE":{
                                                "TYPE":"DataSource",
                                                "MODEL":"/model/reflection/Model",
                                                "DATASOURCE":"FieldList",
                                                "PARAMS": {
                                                    "model": "[%/*modelSelector%]"
                                                },
                                                "LABEL":"NAME",
                                                "VALUE":"FIELD"
                                            }
                                        }
                                    )

                                    this.simpleContainer=new Siviglia.types.Container(
                                        {
                                            "TYPE":"Container",
                                            "FIELDS":{
                                                "Field1":{
                                                    "LABEL":"Field 1",
                                                    "TYPE":"String"
                                                },
                                                "Field2":{
                                                    "LABEL":"Field 2",
                                                    "TYPE":"Integer"
                                                }
                                            }
                                        }
                                    );


                                    this.simpleDictionary=new Siviglia.types.Dictionary(
                                        {
                                            "TYPE":"Dictionary",
                                            "VALUETYPE":{
                                                "TYPE":"Container",
                                                "FIELDS":{
                                                    "Field1":{
                                                        "LABEL":"Field 1",
                                                        "TYPE":"String"
                                                    },
                                                    "Field2":{
                                                        "LABEL":"Field 2",
                                                        "TYPE":"Integer"
                                                    }
                                                }
                                            }
                                        }
                                    );
                                    this.typeCol.push(this.stringType);
                                    this.typeCol.push(this.enumType);
                                    this.typeCol.push(this.integerType);
                                    this.typeCol.push(this.decimalType);
                                    this.typeCol.push(this.textType);
                                    this.typeCol.push(this.booleanType);
                                    this.typeCol.push(this.comboType);
                                    this.typeCol.push(this.comboType2a);
                                    this.typeCol.push(this.comboType2b);
                                    this.typeCol.push(this.comboType2c);
                                    this.typeCol.push(this.modelSelector);


                                },
                                initialize: function (params) {
                                },
                                show:function()
                                {
                                    for(var k=0;k<this.typeCol.length;k++)
                                        console.dir(this.typeCol[k].getValue());
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
        /*var f=Siviglia.types.TypeFactory;
        var instance=f.getType(null,t1);
        instance.set({"Uno":"lalas","Dos":12});
        instance.validate({"Uno":"lalaa","Dos":15});
        f.addNamedType("EXAMPLE",t1);
        var ins=f.getType(null,{"TYPE":"Dictionary","VALUETYPE":"EXAMPLE"});
        ins.set({
            "Primera":{"Uno":"lalas","Dos":12},
            "Segunda":{"Dos":22,"Uno":"wannn"}
        });
        ins.removeItem("Segunda");*/
    </script>
</head>
<body>
<?php include_once("../../jQuery/JqxWidgets.html");?>
<div style="display:none">
    <div sivWidget="Test.SimpleWidget" widgetParams="" widgetCode="Test.SimpleWidget">

        <!--<div sivView="Siviglia.inputs.jqwidgets.String" sivParams='{"type":"/*stringType"}'>
        </div>

        <div sivView="Siviglia.inputs.jqwidgets.Enum" sivParams='{"type":"/*enumType"}'>
        </div>-->

<!--        <div sivView="Siviglia.inputs.jqwidgets.Integer" sivParams='{"type":"/*integerType"}'>
        </div>

        <div sivView="Siviglia.inputs.jqwidgets.Decimal" sivParams='{"type":"/*decimalType"}'>
        </div>

        <div sivView="Siviglia.inputs.jqwidgets.Text" sivParams='{"type":"/*textType"}'>
        </div>

        <div sivView="Siviglia.inputs.jqwidgets.Boolean" sivParams='{"type":"/*booleanType"}'>
        </div>

        <div sivView="Siviglia.inputs.jqwidgets.ComboBox" sivParams='{"type":"/*comboType","inputParams":{"searchField":"message","valueField":"a"}}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.ComboBox" sivParams='{"type":"/*modelSelector"}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.ComboBox" sivParams='{"type":"/*fieldSelector"}'>
        </div>-->
        <div sivView="Siviglia.inputs.jqwidgets.Container" sivParams='{"type":"/*simpleContainer"}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.Dictionary" sivParams='{"type":"/*simpleDictionary"}'>
        </div>
        <!--
        <div sivView="Siviglia.inputs.jqwidgets.ComboBox" sivParams='{"type":"/*comboType2a","inputParams":{"searchField":"label","valueField":"val"}}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.ComboBox" sivParams='{"type":"/*comboType2b","inputParams":{"searchField":"message","valueField":"a"},"sourceParams":{"mysource":"/*comboType2a"}}'>
        </div>
        <div sivView="Siviglia.inputs.jqwidgets.ComboBox" sivParams='{"type":"/*comboType2c","inputParams":{"searchField":"message","valueField":"a"},"sourceParams":{"mysource":"/*comboType2b"}}'>
        </div>-->
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
