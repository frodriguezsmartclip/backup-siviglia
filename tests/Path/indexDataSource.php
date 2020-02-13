<html>
<head>
    <script src="/node_modules/jquery/dist/jquery.js"></script>
    <script src="../../Siviglia.js"></script>
    <script src="../../SivigliaPaths.js"></script>
    <script src="../../SivigliaStore.js"></script>
    <script src="../../Model.js"></script>
    <style type="text/css">
        .estilo1 {color:red}
        .estilo2 {color:blue}
    </style>
    <script src="../../SivigliaTypes.js"></script>

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
                                    var stack=new Siviglia.Path.ContextStack();
                                    var plainCtx=new Siviglia.Path.BaseObjectContext(this,"*",stack);

                                    this.remoteDs=new Siviglia.Data.RemoteDataSource({url:curDir+"/data/[%/*a%].json"},this.view,stack);
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
<?php
//include_once("../../jQuery/JqxWidgets.html");
?>
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
