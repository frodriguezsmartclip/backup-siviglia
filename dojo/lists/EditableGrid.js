define(
    ["dojo/_base/declare", "dojo/promise/all",
        "dojo/when", "dojo/Deferred","Siviglia/lists/Grid","dgrid/selector","dgrid/editor"
    ],
    // Las opciones aniadidas en sivInitialize son: selectionMode : [single/multiple/Extended].Por defecto, single.
    //
    function(declare,all,when,deferred,Grid,selector,editor)
    {
        return declare([Grid],{
            setupGrid:function()
            {
                 this.set("selectionMode",this.opts.selectMultiple || 'single');


            },
            sivInitialize:function(node,opts)
            {
                var m=this;
                this.opts=opts || {};

                this.keepScrollPosition=( opts && opts.keepScrollPosition ) || true;
                this.model.getDataSourceDefinition(this.dataSourceName).then(
                    function(def)
                    {
                        var store=m.model.getDataSource(m.dataSourceName).then(
                            function(store)
                            {
                                if(m.preProcessStore)
                                    m.preProcessStore(store);

                                m.model.getDefinition().then(function(objDef){
                                var cols=m.parseColumns(def,objDef)
                                all(cols).then(function(l){
                                    var curF,i=0,curReq;
                                    c={};
                                    for(var myk in def.FIELDS) {
                                        curF=def.FIELDS[myk];
                                        // Todo: comprobar si este campo es de otro modelo.
                                        if(!curF.TYPE)
                                            curF=objDef.FIELDS[myk];
                                        c[myk]=editor({label: curF.LABEL,field:myk,editorArgs:{definition: curF}},l[i],"dblclick");
                                        i++;
                                    }

                                    m.set("columns",c);
                                    m.set("loadingMessage","Loading...");
                                    m.set("noDataMessage","No results.")
                                    m.set("store",store);
                                    m.set('minRowsPerPage',( opts && opts.minRowsPerPage ) || 200);
                                    if(m.setupGrid)
                                        m.setupGrid();
                                    node.appendChild(m.domNode);
                                });
                                });

                            }
                        );
                    }
                )
            },
            parseColumns:function(d,objDef)
            {

                 var c={};
                    c._selector=selector({label:''});
                    listeners=[];
                    var curF;
                    for(var k in d.FIELDS)
                    {
                        curF = d.FIELDS[k];
                        if(!d.TYPE)
                            curF=this.model.definition.FIELDS[k];
                        listeners.push(this.loadInput(curF));

                    }
                return listeners;

            },
            loadInput:function(field)
            {
                var p = new deferred();
                require(["Siviglia/forms/inputs/"+field["TYPE"]],function(t){p.resolve(t);});
                return p.promise;
            }
        });
    }
);
