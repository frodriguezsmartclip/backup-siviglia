<html>
<head>
    <script src="/node_modules/jquery/dist/jquery.js"></script>
    <script src="../../Siviglia.js"></script>
    <script src="../../SivigliaStore.js"></script>
    <script src="../../Model.js"></script>
    <style type="text/css">
        .estilo1 {
            color: red
        }

        .estilo2 {
            color: blue
        }
    </style>
    <script src="../../SivigliaTypes.js"></script>


    <script src="../../../jqwidgets/jqx-all.js"></script>
    <script src="../../../jqwidgets/globalization/globalize.js"></script>
    <link rel="stylesheet" href="../../../jqwidgets/styles/jqx.base.css">
    <link rel="stylesheet" href="../../../jqwidgets/styles/jqx.light.css">
    <script>

        var Siviglia = Siviglia || {};
        Siviglia.config = {
            baseUrl: 'http://editor.adtopy.com/',
            staticsUrl: 'http://statics.adtopy.com/',
            metadataUrl:'http://metadata.adtopy.com/',
            jsFramework: 'jquery',
            locale: 'es-ES',
            mapper: 'BackofficeMapper',
            datasourcePrefix: 'datasource/'
            //jsFramework:'dojo'
        };
        Siviglia.Model.initialize(Siviglia.config);


        Siviglia.Utils.buildClass(
            {
                context: "Test",
                classes:
                    {
                        "SimpleWidget": {
                            inherits: "Siviglia.UI.Expando.View,Siviglia.Dom.EventManager",
                            methods: {
                                preInitialize: function (params) {


                                    this.factory = Siviglia.types.TypeFactory;
                                    this.self = this;
                                    this.typeCol = [];
                                    /* STRING **************************/
                                    this.typedObj = new Siviglia.model.BaseTypedObject({
                                        "FIELDS": {
                                            "stringType":
                                                {
                                                    TYPE: "String",
                                                    MINLENGTH: 3,
                                                    LABEL: "Hola",
                                                    HELP: "La ayuda"
                                                },
                                            enumType: {
                                                TYPE: "Enum",
                                                VALUES: ["One", "Two", "Three"],
                                                LABEL: "MiEnum"
                                            },
                                            integerType: {
                                                TYPE: "Integer",
                                                MAX: 1000
                                            },
                                            decimalType: {
                                                TYPE: "Decimal",
                                                NINTEGERS: 5,
                                                NDECIMALS: 2
                                            },
                                            textType: {
                                                TYPE: "Text"
                                            },
                                            booleanType: {
                                                TYPE: "Boolean"
                                            },
                                            comboType: {
                                                "TYPE": "Integer",
                                                "SOURCE": {
                                                    "TYPE": "Array",
                                                    "DATA": [
                                                        {"a": 1, "message": "Opcion 1"},
                                                        {"a": 2, "message": "Opcion 2"},
                                                        {"a": 3, "message": "Opcion 3"},
                                                        {"a": 4, "message": "Opcion 4"},
                                                        {"a": 5, "message": "Opcion 5"},
                                                        {"a": 6, "message": "Opcion 6"},
                                                        {"a": 7, "message": "Opcion 7"}
                                                    ],
                                                    "LABEL": "message",
                                                    "VALUE": "a"
                                                }
                                            },
                                            comboType2a: {
                                                "TYPE": "String",
                                                "SOURCE": {
                                                    "TYPE": "Array",
                                                    "DATA": [
                                                        {"val": "one", "label": "Sel one"},
                                                        {"val": "two", "label": "Sel two"}
                                                    ],
                                                    "LABEL": "label",
                                                    "VALUE": "val"
                                                }
                                            },

                                            comboType2b: {
                                                "TYPE": "Integer",
                                                "SOURCE": {
                                                    "TYPE": "Array",
                                                    "DATA":
                                                        {
                                                            "one": [
                                                                {"a": 1, "message": "Opcion 1"},
                                                                {"a": 2, "message": "Opcion 2"},
                                                            ],
                                                            "two": [
                                                                {"a": 10, "message": "xxOpcion 1"},
                                                                {"a": 11, "message": "xxOpcion 2"},
                                                            ]
                                                        }
                                                    ,
                                                    "LABEL": "message",
                                                    "VALUE": "a",
                                                    "PATH": "/{%*comboType2a%}"

                                                }
                                            },

                                            comboType2c:
                                                {
                                                    "TYPE": "Integer",
                                                    "SOURCE": {
                                                        "TYPE": "Array",
                                                        "DATA":
                                                            {
                                                                1: [{"a": 20, "message": "Third - 1 - 1"}, {
                                                                    "a": 21,
                                                                    "message": "Third - 1 - 2"
                                                                }],
                                                                2: [{"a": 22, "message": "Third - 2 - 1"}, {
                                                                    "a": 23,
                                                                    "message": "Third - 2 - 2"
                                                                }],
                                                                10: [{"a": 24, "message": "Third - 3 - 1"}, {
                                                                    "a": 25,
                                                                    "message": "Third - 3 - 2"
                                                                }],
                                                                11: [{"a": 26, "message": "Third - 4 - 1"}, {
                                                                    "a": 27,
                                                                    "message": "Third - 4 - 2"
                                                                }]
                                                            }
                                                        ,
                                                        "LABEL": "message",
                                                        "VALUE": "a",
                                                        "PATH": "/{%*comboType2b%}"
                                                    }
                                                },

                                            modelSelector:
                                                {
                                                    "TYPE": "String",
                                                    "SOURCE": {
                                                        "TYPE": "DataSource",
                                                        "MODEL": "/model/reflection/Model",
                                                        "DATASOURCE": "ModelList",
                                                        "LABEL": "smallName",
                                                        "VALUE": "smallName"
                                                    }
                                                },

                                            fieldSelector:
                                                {
                                                    "TYPE": "String",
                                                    "SOURCE": {
                                                        "TYPE": "DataSource",
                                                        "MODEL": "/model/reflection/Model",
                                                        "DATASOURCE": "FieldList",
                                                        "PARAMS": {
                                                            "model": "[%#../modelSelector%]"
                                                        },
                                                        "LABEL": "NAME",
                                                        "VALUE": "FIELD"
                                                    }
                                                },

                                            simpleContainer:
                                                {
                                                    "TYPE": "Container",
                                                    "FIELDS": {
                                                        "Field1": {
                                                            "LABEL": "Field 1",
                                                            "TYPE": "String"
                                                        },
                                                        "Field2": {
                                                            "LABEL": "Field 2",
                                                            "TYPE": "Integer"
                                                        }
                                                    }
                                                },

                                            simpleDictionary:
                                                {
                                                    "TYPE": "Dictionary",
                                                    "VALUETYPE": {
                                                        "TYPE": "Container",
                                                        "FIELDS": {
                                                            "Field1": {
                                                                "LABEL": "Field 1",
                                                                "TYPE": "String"
                                                            },
                                                            "Field2": {
                                                                "LABEL": "Field 2",
                                                                "TYPE": "Integer"
                                                            }
                                                        }
                                                    }
                                                },
                                            simpleArray:{
                                                "TYPE":"Array",

                                            },
                                            simpleTypeSwitcher:
                                                {
                                                    "TYPE": "TypeSwitcher",
                                                    "TYPE_FIELD": "TYPE",
                                                    "ALLOWED_TYPES": {
                                                        "TYPE_ONE": {
                                                            "TYPE": "String"
                                                        },
                                                        "TYPE_TWO": {
                                                            "TYPE": "Container",
                                                            "FIELDS": {
                                                                "Field1": {
                                                                    "LABEL": "Field 1",
                                                                    "TYPE": "String"
                                                                },
                                                                "Field2": {
                                                                    "LABEL": "Field 2",
                                                                    "TYPE": "Integer"
                                                                }
                                                            }
                                                        }
                                                    }
                                                }


                                        }
                                    });
                                    this.typedObj.stringType = "abcde";
                                    this.typedObj.enumType = "Two";
                                    this.typedObj.integerType = 10;
                                    this.typedObj.decimalType = 8.3;
                                    this.typedObj.textType = "Esta es una prueba";
                                    this.typedObj.booleanType = true;
                                    this.typedObj.simpleContainer={Field1:"LALA",Field2:25}
                                    this.typedObj.simpleDictionary={
                                        aa:{Field1:"LALA1",Field2:35},
                                        bb:{Field1:"LALA2",Field2:45}
                                    }


                                    /* COMBO *****************************/

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
                                show: function () {
                                    for (var k = 0; k < this.typeCol.length; k++)
                                        console.dir(this.typeCol[k].getValue());
                                }
                            }
                        }
                    }
            }
        );

        var t1 = {
            "TYPE": "Container",
            "FIELDS": {
                "Uno": {
                    "TYPE": "String",
                    "MINLENGTH": 4
                },
                "Dos": {
                    "TYPE": "Integer",
                    "MIN": 10
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
<?php include_once("../../jQuery/JqxWidgets.html"); ?>

<div style="display:none">
    <div data-sivWidget="Test.SimpleWidget" data-widgetParams="" data-widgetCode="Test.SimpleWidget">
        <!--<div data-sivView="Siviglia.inputs.jqwidgets.Dictionary" data-sivParams='{"type":"/*typedObj/_simpleDictionary"}'>
        </div>
        <div data-sivView="Siviglia.inputs.jqwidgets.Container" data-sivParams='{"type":"/*typedObj/_simpleContainer"}'>
        </div>-->
        <div data-sivView="Siviglia.inputs.jqwidgets.ComboBox" data-sivParams='{"type":"/*typedObj/_modelSelector"}'>
        </div>
        <div data-sivView="Siviglia.inputs.jqwidgets.ComboBox" data-sivParams='{"type":"/*typedObj/_fieldSelector"}'>
        </div>
        <input type="button" data-sivEvent="click" data-sivCallback="show" value="show">
    </div>
</div>
<div data-sivView="Test.SimpleWidget"></div>
<script>
    $(document).ready(function () {
        //var remoteRoot=new Siviglia.model.RemotePath("http://127.0.0.1/buscando");
        var parser = new Siviglia.UI.HTMLParser();
        //parser.addContext("/",obj1);
        parser.parse($(document.body));
    });
</script>
</body>
</html>
