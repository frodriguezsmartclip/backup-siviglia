<html>
<head>
    <script src="../jquery.min.js"></script>
    <script src="../Siviglia.js"></script>
    <script src="../SivigliaTypes.js"></script>
    <script src="../jqwidgets/jqx-all.js"></script>
    <script src="../Model.js"></script>
    <script src="../SivigliaStore.js"></script>
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="../ionicons/css/ionicons.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

    <!-- Optional theme -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">

    <!-- Latest compiled and minified JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
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
                                        "type1":{
                                            "TYPE":"Container",
                                            "FIELDS":{
                                                "MyDict":{
                                                    "TYPE":"Dictionary",
                                                    "VALUETYPE":{
                                                        "TYPE":"String"
                                                    },
                                                    "description":"Esta es la descripcion"
                                                },
                                                "MyString":{
                                                    "TYPE":"String"
                                                }
                                            }}
                                        }});
                                },
                                initialize: function (params) {
                                    this.inputHolder.append(this.__widgets["type1"].rootNode);
                                }
                            }
                        }
                    }
            }
        );});

    </script>
</head>
<body>
<?php include_once("../jQuery/JqxWidgets.html");?>
<div style="display:none">
    <div sivWidget="Test.SimpleWidget" widgetParams="" widgetCode="Test.SimpleWidget">
        <div sivId="inputHolder"></div>
    </div>
</div>
<div sivView="Test.SimpleWidget"></div>

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