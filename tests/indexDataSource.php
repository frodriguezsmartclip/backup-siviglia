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
        Siviglia.Utils.buildClass(
            {
                context:"Test",
                classes:
                    {
                        "SimpleWidget":{
                            inherits: "Siviglia.UI.Widget,Siviglia.Dom.EventManager",
                            methods: {
                                preInitialize: function (params) {
                                    this.a="data1";

                                    var curlocation=document.location.href.split("/");
                                    curlocation.pop();
                                    var curDir=curlocation.join("/");

                                    this.remoteDs=new Siviglia.Data.RemoteDataSource({url:curDir+"/data/[%/*a%].json"},this.view);
                                    var p=$.Deferred();
                                    var m=this;
                                    this.initialized=false;
                                    this.remoteDs.addListener("CHANGE",function(event,data){
                                        m.data=data.data;
                                        if(m.initialized)
                                            return m.notifyPathListeners();

                                        m.initialized=true;
                                        p.resolve();
                                    });
                                    this.remoteDs.fetch();
                                    return p;
                                },
                                initialize: function (params) {
                                    var m=this;
                                    setTimeout(function(){m.a="data2";m.notifyPathListeners()},2000);
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
        <div sivLoop="/*data" contextIndex="current">
            <div>
                <span sivValue="/@current/a"></span>--<span sivValue="/@current/b"></span>
            </div>
        </div>

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