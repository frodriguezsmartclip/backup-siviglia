define(['dojo/_base/declare',
    'dijit/_Widget',
    'dijit/_Templated','dojo/on'
],function(declare,_Widget,_Templated,on){

    return declare([ _Widget, _Templated], {
        widgetsInTemplate:false,
        templateString:'<div class="ColumnList"></div>',
        modelName:null,
        dsName:null,
        dsParams:null,
        label:null,
        labelFunc:null,
        identifier:null,
        selected:null,
        selectedNode:null,
        width:0,
        height:0,
        offset:0,
        autoSelectFirst:true,
        selectedCallback:null,
        loadCallback:null,
        postCreate:function()
        {
            this.selected=null;

            this.reset();
        },
        reset:function()
        {
            this.domNode.innerHTML='';
            var mod=new Siviglia.Model.Model(this.modelName);
            var m=this;
            mod.getMemoryDataSource(this.dsName,this.dsParams).then(
                function(st)
                {
                    var c=0;
                    st.query().forEach(
                        function(it){
                            var d=document.createElement("div");
                            d.className="ColumnListItem";
                            if(m.labelFunc)
                                d.innerHTML= m.labelFunc(it);
                            else
                                d.innerHTML=it[m.label];

                            on(d,"click",function(){m.setSelected(d,it)});
                            if(m.autoSelectFirst && c==0)
                                m.setSelected(d,it);
                            m.domNode.appendChild(d);
                            c++;
                        }
                    );
                    if(m.loadCallback)
                        m.loadCallback(st);
                    m.onLoaded();

            },
            function(err)
            {

            });
        },
        onLoaded:function()
        {},
        setSelected:function(node,it)
        {
            if(this.selectedNode!=null)
                this.selectedNode.className="ColumnListItem";
            this.selectedNode=node;
            this.selectedNode.className="ColumnListItem ColumnListSelected";
            this.selected=it;
            if(this.selectedCallback)
            {
                this.selectedCallback(it);
            }

        },
        getSelected:function()
        {
            return this.selected;
        }

    });
});
