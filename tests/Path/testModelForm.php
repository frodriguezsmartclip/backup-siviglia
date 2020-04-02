<html>
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
    <div data-sivWidget="Siviglia.model.web.Page.forms.Edit" data-widgetCode="Siviglia.model.web.Page.forms.Edit">
        <div data-sivView="Siviglia.inputs.jqwidgets.Form" data-sivParams='{"value":"/*instance"}'></div>
        <div><input type="button" data-sivEvent="click" data-sivCallback="doSubmit" value="Guardar"></div>
    </div>
</div>


<div data-sivView="Siviglia.model.web.Page.forms.Edit" data-sivParams='{"id_page":2}'></div>


<script>
    Siviglia.Utils.buildClass({
        "context":"Siviglia.model.web.Page.forms",
        "classes":{
            Edit:{
                "inherits":"Siviglia.UI.Expando.View",
                "methods":{
                    preInitialize:function(params)
                    {
                        var p=$.Deferred();
                        var m=this;
                        var f=new Siviglia.Model.ModelFactory();
                        f.load("/model/web/Page",params.id_page).then(function(instance){
                            m.instance=instance;
                            p.resolve();
                        })
                        return p;
                    },
                    initialize:function(params){},
                    doSubmit:function()
                    {
                        this.instance.save();
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
