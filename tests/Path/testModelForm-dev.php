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
    <link rel="stylesheet" href="../../../jqwidgets/styles/jqx.dark.css">
    <!-- aqui meter el enlace al scss del fichero css para las clases semanticas -->
    <!-- <link rel="stylesheet" href="../../../Siviglia/assets/css/style.css"> -->
    <link rel="stylesheet" href="../../../Siviglia/assets/css/main.scss">
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
        <div><div class="form-field-input">Id_Page</div>
            <div class="form-field-type" data-sivCall="getInputFor" data-sivParams='{"key":"id_page"}'></div>
        </div>
        <div><div class="form-field-label">Tag</div>
            <div data-sivCall="getInputFor" data-sivParams='{"key":"tag"}'></div>
        </div>
        <div><div class="form-field-label">Id_site</div>
            <div data-sivCall="getInputFor" data-sivParams='{"key":"id_site"}'></div>
        </div>        
        <div class="form-field-input"><div>Nombre</div>
            <div data-sivCall="getInputFor" data-sivParams='{"key":"name"}'></div>
        </div>
        <div class="form-container"><div class="form-field-input">Id type</div>
            <div data-sivCall="getInputFor" data-sivParams='{"key":"id_type"}'></div>
        </div>
        <div><div>Private</div>
            <div data-sivCall="getInputFor" data-sivParams='{"key":"isPrivate"}'></div>
        </div>
        <div><div>Path</div>
            <div data-sivCall="getInputFor" data-sivParams='{"key":"path"}'></div>
        </div>
        <div><div>Title</div>
            <div data-sivCall="getInputFor" data-sivParams='{"key":"title"}'></div>
        </div>
        <div><div>Description</div>
            <div data-sivCall="getInputFor" data-sivParams='{"key":"description"}'></div>
        </div>
        <div><div>Tags</div>
            <div data-sivCall="getInputFor" data-sivParams='{"key":"tags"}'></div>
        </div>  
        <div><input type="button" data-sivEvent="click" data-sivCallback="submit" value="Guardar"></div>
    </div>
</div>

<div data-sivView="Siviglia.model.web.Page.forms.Edit" data-sivParams='{"id_page":2}'></div>

<script>
    Siviglia.Utils.buildClass({
        "context":"Siviglia.model.web.Page.forms",
        "classes":{
            Edit:{
                "inherits":"Siviglia.inputs.jqwidgets.Form",
                "methods":{
                    preInitialize:function(params)
                    {
                        var p={
                            "keys":params,
                            "model":"/model/web/Page",
                            "form":"Edit"
                        }
                        return this.Form$preInitialize(p);
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
