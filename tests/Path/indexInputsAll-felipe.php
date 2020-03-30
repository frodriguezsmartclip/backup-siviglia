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


                                    this.factory=Siviglia.types.TypeFactory;
                                    this.self=this;
                                    this.typeCol=[];
                                   
                                    this.simpleContainer=new Siviglia.types.Container(
                                        {
                                            "TYPE":"Container",
                                            "FIELDS":{
                                                "Field1":{
                                                    "LABEL":"Label Field 1",
                                                    "TYPE":"String"
                                                },
                                                "Field2":{
                                                    "LABEL":"Label Field 2",
                                                    "TYPE":"Integer"
                                                }
                                            },
                                            "LAYOUT": "Siviglia.inputs.jqwidgets.ContainerLayout"
                                        }
                                    );

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

        // var t1={
        //     "TYPE":"Container",
        //     "FIELDS":{
        //         "Uno":{
        //             "TYPE":"String",
        //             "MINLENGTH":4
        //         },
        //         "Dos":{
        //             "TYPE":"Integer",
        //             "MIN":10
        //         }
        //     }
        // };
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
<?php include_once("../../jQuery/JqxWidgets-felipe.html");?>
<!-- declaracion del widget -->
<div style="display:none">
    <div data-sivWidget="Test.SimpleWidget" data-widgetParams="" data-widgetCode="Test.SimpleWidget">

        <div data-sivView="Siviglia.inputs.jqwidgets.Container" data-sivParams='{"type":"/*simpleContainer"}'></div>

    </div>
</div>

<!-- uso del widget -->
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
