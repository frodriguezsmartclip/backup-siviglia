<html>
<head>
    <script src="../jquery.min.js"></script>
    <script src="../Siviglia.js"></script>
    <script src="../SivigliaTypes.js"></script>
    <script src="../jqwidgets/jqx-all.js"></script>
    <link rel="stylesheet" href="../jqwidgets/styles/jqx.base.css">
    <link rel="stylesheet" href="../jqwidgets/styles/jqx.light.css">
    <script>
        Siviglia.Utils.buildClass(
            {
                context:"Test",
                classes:
                    {
                        "ComboType":
                            {
                                inherits:"Siviglia.types.BaseType",
                                methods:
                                    {
                                        loadSource:function(params)
                                        {
                                            return $.when([
                                                {"a":1,"message":"Opcion 1"},
                                                {"a":2,"message":"Opcion 2"},
                                                {"a":3,"message":"Opcion 3"},
                                                {"a":4,"message":"Opcion 4"},
                                                {"a":5,"message":"Opcion 5"},
                                                {"a":6,"message":"Opcion 6"},
                                                {"a":7,"message":"Opcion 7"}
                                            ]);
                                        }
                                    }
                            },
                        "SimpleWidget":{
                            inherits: "Siviglia.UI.Widget,Siviglia.Dom.EventManager",
                            methods: {
                                preInitialize: function (params) {
                                    this.a=20;
                                },
                                initialize: function (params) {
                                    this.theSimpleListener=new Test.SimpleListener(this);
                                    var m=this;
                                    setTimeout(function(){m.a=50;m.notifyPathListeners()},2000);
                                },
                                show:function()
                                {
                                    console.dir(this.comboType2b);
                                }
                            }
                        },
                        "SimpleListener":{
                            construct:function(widget)
                            {
                                this.sl=new Siviglia.model.SimpleListener(widget,"[%/*a%]",{});
                                this.sl.addListener("CHANGE",this,"dolog");
                                this.sl.listen();
                            },
                            methods:
                                {
                                    dolog:function(params)
                                    {
                                        console.dir(arguments);
                                    }
                                }
                        }
                    }
            }
        );

    </script>
</head>
<body>
<?php include_once("../jQuery/JqxWidgets.html");?>
<div style="display:none">
    <div sivWidget="Test.SimpleWidget" widgetParams="" widgetCode="Test.SimpleWidget">

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