<html>
<head>
    <script src="../jquery.min.js"></script>
    <script src="../Siviglia.js"></script>
    <script src="../SivigliaTypes.js"></script>
    <script src="../jqwidgets/jqx-all.js"></script>
    <script src="../Model.js"></script>
    <script src="../SivigliaStore.js"></script>
    <link rel="stylesheet" href="../jqwidgets/styles/jqx.base.css">
    <link rel="stylesheet" href="../jqwidgets/styles/jqx.light.css">
    <script>
        $(document).ready(function(){
        Siviglia.Utils.buildClass(
            {
                context:"Test",
                classes:
                    {
                        "SimpleWidget":{
                            inherits: "Siviglia.inputs.jqwidgets.Form",
                            methods: {
                                preInitialize: function (params) {
                                    this.Form$preInitialize({definition:{
                                        "type1":{"KEYMAP":{
                                                "TheDate":{
                                                    "TYPE":"Date"
                                                },
                                                "TheString":{
                                                    "TYPE":"String"
                                                },
                                                "TheContainer":
                                                    {
                                                        "TYPE":"Container",
                                                        "FIELDS":{
                                                            "A":{
                                                                "TYPE":"String"
                                                            }
                                                        }
                                                    }
                                            },
                                            "TYPE":"FixedDictionary",
                                            "description":"Esta es la descripcion"}
                                        }});

                                },
                                initialize: function (params) {
                                    this.inputHolder.append(this.__widgets["type1"].rootNode);
                                }
                            }
                        }
                    }
            }
        );
        });

    </script>
</head>
<body>
<?php include_once("../jQuery/JqxWidgets.html");?>
<div style="display:none">
    <div sivWidget="Test.SimpleWidget" widgetParams="" widgetCode="Test.SimpleWidget">
        <div data-sivId="inputHolder"></div>
    </div>
</div>
<div data-sivView="Test.SimpleWidget"></div>

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
