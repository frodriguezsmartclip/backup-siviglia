<html>
<!--
    Igual que testDatasource.html, pero se incluye integracion con JqxGrid.
-->
<head>
    <script src="/node_modules/jquery/dist/jquery.js"></script>
    <script src="../../Siviglia.js"></script>
    <script src="../../SivigliaTypes.js"></script>
    <script src="../../SivigliaStore.js"></script>
    <script src="../../Model.js"></script>
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
            locale: 'es-ES',
            // Si el mapper es XXX, debe haber:
            // 1) Un gestor en /lib/output/html/renderers/js/XXX.php
            // 2) Un Mapper en Siviglia.Model.XXXMapper
            // 3) Las urls de carga de modelos seria /js/XXX/model/zzz/yyyy....
            mapper:'Siviglia'

        };
        Siviglia.Model.initialize(Siviglia.config);
    </script>

</head>
<body>
<?php include_once(__DIR__."/../../jQuery/JqxWidgets.html"); ?>
<div style="display:none">

    <div data-sivWidget="Test.ListViewer" data-widgetCode="Test.ListViewer">
        <div style="width:250px;float:left" data-sivView="Siviglia.inputs.jqwidgets.Form" data-sivParams='{"value":"/*modelSelector"}'></div>
        <div style="float:left">
            <div data-sivView="Siviglia.model.web.Page.views.List" data-sivParams='{"model":"/*modelSelector/model"}'></div>
        </div>
    </div>

</div>

<div data-sivView="Test.ListViewer"></div>

<script>
    Siviglia.Utils.buildClass({
        "context":"Test",
        "classes":{
            ListViewer:{
                "inherits":"Siviglia.UI.Expando.View",
                "methods":{
                    preInitialize:function(params)
                    {
                        this.modelSelector=new Siviglia.model.BaseTypedObject(
                            {
                                "FIELDS":{
                                    "model":{
                                        "LABEL":"Select Model",
                                        "TYPE":"String",
                                        "SOURCE":{
                                            "TYPE":"DataSource",
                                            "MODEL":"/model/reflection/Model",
                                            "DATASOURCE":"ModelList",
                                            "LABEL":"smallName",
                                            "VALUE":"smallName"
                                        }
                                    }
                                }
                            }
                        )
                    },
                    initialize:function(params){}
                }
            },
        }
    })

</script>
<script>
    var parser=new Siviglia.UI.HTMLParser();
    parser.parse($(document.body));
</script>
</body>
</html>
