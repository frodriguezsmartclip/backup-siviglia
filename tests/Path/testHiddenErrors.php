<html>
<!--
  Este ejemplo sirve para testear errores existentes en campos de un tipo, que no estan siendo
  pintados en la pantalla.
  La idea es dejar algun campo requerido vacio, y no visible (porque estamos en otro tab del container,
  porque estamos en otro elemento del array,porque estamos en otro elemento del diccionario).
  Al hacer submit, deben activarse esos elementos de los inputs y hacerse visibles.



-->
<head>
    <script src="/node_modules/jquery/dist/jquery.js"></script>
    <script src="../../Siviglia.js"></script>

    <script src="../../SivigliaTypes.js"></script>
    <script src="../../Model.js"></script>
    <script src="../../SivigliaStore.js"></script>
    <script src="../../Model.js"></script>
    <script src="../../SivigliaTypes.js"></script>
    <script src="../../../jqwidgets/jqx-all.js"></script>
    <script src="../../../jqwidgets/globalization/globalize.js"></script>
    <link rel="stylesheet" href="../../../jqwidgets/styles/jqx.base.css">
    <link rel="stylesheet" href="../../../jqwidgets/styles/jqx.darkblue.css">
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

        };
        $.jqx.theme = "darkblue";
        Siviglia.Model.initialize(Siviglia.config);
    </script>

</head>
<body>
<?php include_once(__DIR__."/../../jQuery/JqxWidgets.html"); ?>
<div style="display:none">
    <div data-sivWidget="Test.HiddenErrors" data-widgetCode="Test.HiddenErrors">
        <div>
            <div>DICTIONARY</div>
            <div data-sivCall="getInputFor" data-sivParams='{"key":"f1"}'></div>
        </div>
        <div>
            <div>ARRAY</div>
            <div data-sivCall="getInputFor" data-sivParams='{"key":"f2"}'></div>
        </div>
        <div><input type="button" data-sivEvent="click" data-sivCallback="submit" value="Guardar"></div>
    </div>
</div>


<div data-sivView="Test.HiddenErrors"></div>


<script>
    Siviglia.Utils.buildClass({
        "context":"Test",
        "classes":{
            HiddenErrors:{
                "inherits":"Siviglia.inputs.jqwidgets.Form",
                "methods":{
                    preInitialize:function(params)
                    {
                        var instance=new Siviglia.model.BaseTypedObject(
                            {
                                "FIELDS":{
                                    "f1":{
                                        "LABEL":"f1",
                                        "TYPE":"Dictionary",
                                        "VALUETYPE":{
                                            "TYPE":"Container",
                                            "FIELDS":{
                                                "Field1":{
                                                    "LABEL":"Field 1",
                                                    "MINLENGTH":2,
                                                    "TYPE":"String",
                                                    "REQUIRED":true
                                                },
                                                "Field2":{
                                                    "LABEL":"Field 2",
                                                    "TYPE":"Integer",
                                                    "REQUIRED":true
                                                }
                                            }
                                        }
                                    },
                                    "f2":{
                                            "LABEL":"f2",
                                            "TYPE":"Array",
                                            "ELEMENTS":{
                                                "LABEL":"OOO",
                                                "TYPE":"Container",
                                                "FIELDS":{
                                                    "f1":{"LABEL":"BBB","TYPE":"String","REQUIRED":true},
                                                }
                                            }

                                    }
                                },
                                INPUTPARAMS:{
                                    "/": {
                                        "INPUT": "TabbedContainer",
                                        "JQXPARAMS":{width:700,height:500,position:top}
                                    }
                                }
                            }
                        );
                        var p={
                            bto:instance
                        };
                        this.Form$preInitialize(p);

                    }
                }
            }
        }
    });
</script>
<script>
    var parser=new Siviglia.UI.HTMLParser();
    parser.parse($(document.body));
</script>
</body>
</html>
