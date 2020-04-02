<html>
<head>
    <script src="/node_modules/jquery/dist/jquery.js"></script>
    <script src="../../Siviglia.js"></script>
    <script src="../../SivigliaStore.js"></script>
    <script src="../../SivigliaTypes.js"></script>
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
            metadataUrl:'http://metadata.adtopy.com/',
            locale:'es-ES',
            mapper:'Siviglia'
        };
        Siviglia.Model.initialize(Siviglia.config);


        Siviglia.Utils.buildClass(
            {
                context:"Test",
                classes:
                    {
                        "SimpleWidget":{
                            inherits: "Siviglia.UI.Expando.View,Siviglia.Dom.EventManager",
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
                                                    "model": "[%#../modelSelector%]"
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
                                    this.simpleTypeSwitcher=new Siviglia.types.TypeSwitcher(
                                        {
                                            "TYPE":"TypeSwitcher",
                                            "TYPE_FIELD":"TYPE",
                                            "ALLOWED_TYPES":{
                                                "TYPE_ONE":{
                                                    "TYPE":"String"
                                                },
                                                "TYPE_TWO":{
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
                                        }
                                    );
                                    this.simpleArray=new Siviglia.types.Array(
                                        {
                                            "TYPE":"Array",
                                            "ELEMENTS":{
                                                "TYPE":"String"
                                            }

                                        }
                                    );
                                    this.simpleArray.setValue([
                                        "uno","dos","tres"
                                    ]);
                                    this.complexArray=new Siviglia.types.Array(
                                        {
                                            "TYPE":"Array",
                                            "ELEMENTS":{
                                                "TYPE":"Container",
                                                "FIELDS":{
                                                    "f1":{"TYPE":"String"},
                                                    "f2":{"TYPE":"Integer"}
                                                }
                                            }

                                        }
                                    );
                                    this.complexArray.setValue([{f1:"aa",f2:22}]);

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
    <div data-sivWidget="Test.SimpleWidget" data-widgetParams="" data-widgetCode="Test.SimpleWidget">


        <!--<div data-sivView="Siviglia.inputs.jqwidgets.String" data-sivParams='{"type":"/*stringType"}'>
        </div>

        <div data-sivView="Siviglia.inputs.jqwidgets.Enum" data-sivParams='{"type":"/*enumType"}'>
        </div>-->

<!--        <div data-sivView="Siviglia.inputs.jqwidgets.Integer" data-sivParams='{"type":"/*integerType"}'>
        </div>

        <div data-sivView="Siviglia.inputs.jqwidgets.Decimal" data-sivParams='{"type":"/*decimalType"}'>
        </div>

        <div data-sivView="Siviglia.inputs.jqwidgets.Text" data-sivParams='{"type":"/*textType"}'>
        </div>

        <div data-sivView="Siviglia.inputs.jqwidgets.Boolean" data-sivParams='{"type":"/*booleanType"}'>
        </div>

        <div data-sivView="Siviglia.inputs.jqwidgets.ComboBox" data-sivParams='{"type":"/*comboType","inputParams":{"searchField":"message","valueField":"a"}}'>
        </div>
        <div data-sivView="Siviglia.inputs.jqwidgets.ComboBox" data-sivParams='{"type":"/*modelSelector"}'>
        </div>
        <div data-sivView="Siviglia.inputs.jqwidgets.ComboBox" data-sivParams='{"type":"/*fieldSelector"}'>
        </div>-->
        <!--<div data-sivView="Siviglia.inputs.jqwidgets.Container" data-sivParams='{"type":"/*simpleContainer"}'>
        </div>-->
        <!--<div data-sivView="Siviglia.inputs.jqwidgets.Dictionary" data-sivParams='{"type":"/*simpleDictionary"}'>
        </div>-->
        <!--<div data-sivView="Siviglia.inputs.jqwidgets.TypeSwitcher" data-sivParams='{"type":"/*simpleTypeSwitcher"}'>
        </div>-->
        <!--<div data-sivView="Siviglia.inputs.jqwidgets.Array" data-sivParams='{"type":"/*simpleArray"}'>
        </div>-->
        <!--<div data-sivView="Siviglia.inputs.jqwidgets.Array" data-sivParams='{"type":"/*complexArray"}'>
        </div>-->

        <div data-sivView="Siviglia.inputs.jqwidgets.ComboBox" data-sivParams='{"type":"/*comboType2a","inputParams":{"searchField":"label","valueField":"val"}}'>
        </div>
        <div data-sivView="Siviglia.inputs.jqwidgets.ComboBox" data-sivParams='{"type":"/*comboType2b","inputParams":{"searchField":"message","valueField":"a"},"sourceParams":{"mysource":"/*comboType2a"}}'>
        </div>
        <div data-sivView="Siviglia.inputs.jqwidgets.ComboBox" data-sivParams='{"type":"/*comboType2c","inputParams":{"searchField":"message","valueField":"a"},"sourceParams":{"mysource":"/*comboType2b"}}'>
        </div>
        <input type="button" data-sivEvent="click" data-sivCallback="show" value="show">
    </div>
</div>
<div data-sivView="Test.SimpleWidget"></div>
<script>
    $(document).ready(function(){
    //var remoteRoot=new Siviglia.model.RemotePath("http://127.0.0.1/buscando");
        var parser=new Siviglia.UI.HTMLParser();
        //parser.addContext("/",obj1);
        parser.parse($(document.body));
    });
</script>
</body>
</html>
