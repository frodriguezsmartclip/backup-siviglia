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
    <style>
        .test4 {font-family:'Impact'}
        .test2 {font-family:'Verdana'}
        .test  {border:4px solid black}
    </style>
    <script>

        var Siviglia=Siviglia || {};
        Siviglia.config={
            baseUrl:'http://editor.adtopy.com/',
            staticsUrl:'http://statics.adtopy.com/',
            metadataUrl:'http://metadata.adtopy.com/',
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
                            inherits: "Siviglia.UI.Expando.View,Siviglia.Dom.EventManager",
                            methods: {
                                preInitialize: function (params) {

                                    this.bType=new Siviglia.model.BaseTypedObject({
                                        "FIELDS":{
                                            /*str1:{
                                                TYPE:"String",
                                                MINLENGTH:3,
                                                LABEL:"Hola",
                                                HELP:"La ayuda"
                                            },
                                            en1:{
                                                TYPE:"Enum",
                                                VALUES:["One","Two","Three"],
                                                LABEL:"MiEnum"
                                            },
                                            int1:{
                                                LABEL:"Entero",
                                                TYPE:"Integer",
                                                MAX:1000
                                            },
                                            dec1:{
                                                "LABEL":"Decimal",
                                                TYPE:"Decimal",
                                                NINTEGERS:5,
                                                NDECIMALS:2
                                            },
                                            txt1:{
                                                LABEL:"Texto",
                                                TYPE:"Text"
                                            },
                                            bool1:{
                                                TYPE:"Boolean"
                                            },
                                            int2:{
                                                "LABEL":"Sourced Integer",
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
                                            },*/
                                            modelSelector:
                                                {
                                                    "TYPE":"String",
                                                    "SOURCE":{
                                                        "TYPE":"DataSource",
                                                        "MODEL":"/model/reflection/Model",
                                                        "DATASOURCE":"ModelList",
                                                        "LABEL":"smallName",
                                                        "VALUE":"smallName"
                                                    }
                                                },
                                            fieldSelector:
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
                                        },

/*
                                    depStr1:{
                                                "LABEL":"Dependent String 1",
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
                                            },
                                            depStr2:{
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
                                                    //"LABEL_EXPRESSION":"[%/message%]:[%/a%]",
                                                    LABEL:"message",
                                                    "VALUE":"a",
                                                    "PATH":"/{%#../depStr1%}"

                                                }
                                            },*/
                                            cont1:    {
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
                                        },
                                        "INPUTPARAMS":{
                                            "/depStr2":{
                                                "classes":"test"
                                                },
                                            "/cont1/Field1":{
                                                "classes":"test2"
                                            },
                                            "/str1":{
                                                "classes":"test4"
                                            }
                                        }
                                    });
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
    </script>
</head>
<body>
<?php include_once("../../jQuery/JqxWidgets.html");?>
<div style="display:none">
    <div data-sivWidget="Test.SimpleWidget" data-widgetParams="" data-widgetCode="Test.SimpleWidget">


        <div data-sivView="Siviglia.inputs.jqwidgets.Form" data-sivParams='{"value":"/*bType"}'>
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
