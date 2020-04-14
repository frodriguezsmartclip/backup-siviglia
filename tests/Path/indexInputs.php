<html>
<head>
    <script src="/node_modules/jquery/dist/jquery.js"></script>
    <script src="../../Siviglia.js"></script>
    <script src="../../SivigliaTypes.js"></script>
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
            locale: 'es-ES',
            // Si el mapper es XXX, debe haber:
            // 1) Un gestor en /lib/output/html/renderers/js/XXX.php
            // 2) Un Mapper en Siviglia.Model.XXXMapper
            // 3) Las urls de carga de modelos seria /js/XXX/model/zzz/yyyy....
            mapper:'Siviglia'
            //jsFramework:'dojo'
        };
        Siviglia.Model.initialize(Siviglia.config);




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
        <div class="type">
            <div class="label">Cadena</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"stringType"}'></div>
        </div>
        <div class="type">
            <div class="label">Enum</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"enumType"}'></div>
        </div>
        <div class="type">
            <div class="label">Entero</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"integerType"}'></div>
        </div>
        <div class="type">
            <div class="label">Decimal</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"decimalType"}'></div>
        </div>
        <div class="type">
            <div class="label">Texto</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"textType"}'></div>
        </div>
        <div class="type">
            <div class="label">Boolean</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"booleanType"}'></div>
        </div>
        <div class="type">
            <div class="label">Combo con source Array</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"comboType"}'></div>
        </div>
        <div class="type">
            <div class="label">Combo enlazado 1, con source Array</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"comboType2a"}'></div>
        </div>
        <div class="type">
            <div class="label">Combo enlazado 2 (dependiente) con source Array</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"comboType2b"}'></div>
        </div>
        <div class="type">
            <div class="label">Combo enlazado 3 (dependiente de 2) con source Array</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"comboType2c"}'></div>
        </div>
        <div class="type">
            <div class="label">String con source DATASOURCE (MODEL LIST)</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"modelSelector"}'></div>
        </div>
        <div class="type">
            <div class="label">String con source DATASOURCE enlazado (MODEL FIELDS)</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"fieldSelector"}'></div>
        </div>
        <div class="type">
            <div class="label">Container</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"simpleContainer"}'></div>
        </div>
        <div class="type">
            <div class="label">Diccionario simple</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"simpleDictionary"}'></div>
        </div>
        <div class="type">
            <div class="label">Array (elementos complejos:container)</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"simpleArray"}'></div>
        </div>
        <div class="type">
            <div class="label">Array (elementos simples:String)</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"simpleArray2"}'></div>
        </div>
        <div class="type">
            <div class="label">Type Switcher</div>
            <div class="inputContainer" data-sivCall="getInputFor" data-sivParams='{"key":"simpleTypeSwitcher"}'></div>
        </div>


    </div>
</div>
<div data-sivView="Test.SimpleWidget"></div>
<script>
    Siviglia.Utils.buildClass(
        {
            context: "Test",
            classes:
                {
                    "SimpleWidget": {
                        inherits: "Siviglia.inputs.jqwidgets.Form",
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
                                            "LABEL":"EnumType",
                                            TYPE: "Enum",
                                            VALUES: ["One", "Two", "Three"],
                                            LABEL: "MiEnum"
                                        },
                                        integerType: {
                                            LABEL:"IntegerType",
                                            TYPE: "Integer",
                                            MAX: 1000
                                        },
                                        decimalType: {
                                            LABEL:"DecimalType",
                                            TYPE: "Decimal",
                                            NINTEGERS: 5,
                                            NDECIMALS: 2
                                        },
                                        textType: {
                                            LABEL:"textType",
                                            TYPE: "Text"
                                        },
                                        booleanType: {
                                            LABEL:"BooleanType",
                                            TYPE: "Boolean"
                                        },
                                        comboType: {
                                            LABEL:"ComboType",
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
                                            "LABEL":"Combo2",
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
                                            "LABEL":"ComboType2B",
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
                                                "PATH": "/{%#../comboType2a%}"

                                            }
                                        },

                                        comboType2c:
                                            {
                                                "LABEL":"ComboType2c",
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
                                                    "PATH": "/{%#../comboType2b%}"
                                                }
                                            },

                                        modelSelector:
                                            {
                                                "LABEL":"ModelSelector",
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
                                                "LABEL":"FieldSelector",
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
                                                "LABEL":"SimpleContainer",
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
                                                LABEL:"SimpleDictionary",
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
                                            "LABEL":"SimpleArray",
                                            "TYPE":"Array",
                                            "ELEMENTS":{
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
                                        simpleArray2:{
                                            "LABEL":"SimpleArray",
                                            "TYPE":"Array",
                                            "ELEMENTS":{
                                                "LABEL": "Field 1",
                                                "TYPE": "String"
                                                }
                                        },
                                        simpleTypeSwitcher:
                                            {
                                                "LABEL":"TypeSwitcher",
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
                                this.Form$preInitialize({bto:this.typedObj});
                            },
                            initialize: function (params) {
                            },
                            show: function () {

                                console.dir(this.typedObj.getValue());
                            }
                        }
                    }
                }
        }
    );
    $(document).ready(function () {
        //var remoteRoot=new Siviglia.model.RemotePath("http://127.0.0.1/buscando");
        var parser = new Siviglia.UI.HTMLParser();
        //parser.addContext("/",obj1);
        parser.parse($(document.body));
    });
</script>
</body>
</html>
