define(
    ["dojo/_base/declare", "dojo/promise/all",
        "dojo/when", "dojo/Deferred","dojo/require","dojo/_base/array","dgrid/Grid", "dgrid/extensions/Pagination", "dgrid/Keyboard",
        "dojo/Evented", "dgrid/extensions/ColumnHider","dgrid/extensions/ColumnResizer","dgrid/extensions/DijitRegistry"
    ],
    function(declare,all,when,deferred,require,array,Grid,Pagination,Keyboard,Evented)
    {
        return declare([Grid,Pagination,Keyboard,Evented],{
            model:null,
            dataSourceName:null,
            dataSourceParams:null,
            sivInitialize:function(node,opts,dataSourceParams)
            {
                var m=this;
                this.opts=opts || {};
                this.rowsPerPage=( opts && opts.maxRowsPerPage ) || 10;
                this.keepScrollPosition=(opts && opts.keepScrollPosition) || true;
                if(dataSourceParams) {
                    this.dataSourceParams=dataSourceParams;
                }

                this.model.getDataSourceDefinition(this.dataSourceName).then(
                    function(def)
                    {
                        m.model.getDataSource(m.dataSourceName, m.dataSourceParams).then(
                            function(store)
                            {
                                if(m.preProcessStore) {
                                    m.preProcessStore(store);
                                }
                                m.set("store",store,dataSourceParams);
                                if(m.dsDef) {
                                   return;
                                }
                                m.dsDef=def;

                                var cols=m.parseColumns(def);
                                if(cols) {
                                    m.set("columns",cols);
                                }
                                m.set("loadingMessage","Loading...");
                                m.set("noDataMessage","No results.")

                                if(m.setupGrid) {
                                    m.setupGrid();
                                }
                                node.appendChild(m.domNode);
                                m.emit('GRID INITIALIZED', {});
                            }
                        );
                    }
                );
            },
            parseColumns:function(d)
            {
                c={};
                var n=0;
                for(var k in d.FIELDS) {
                    if(this.opts.extraColumns && this.opts.extraColumns[n]) {
                        c[this.opts.extraColumns[n].NAME]=this.opts.extraColumns[n];
                        n++;
                    }
                    if(this.opts.columns && this.opts.columns[k]) {
                        if (this.opts.columns[k].display === false) continue;
                        c[k]=this.opts.columns[k];
                    }
                    else {
                        c[k]={label:k};
                    }
                    c[k].sortable=true;
                    n++;
                }
                if(this.opts.extraColumns && this.opts.extraColumns[n]) {
                    c[this.opts.extraColumns[n].NAME]=this.opts.extraColumns[n];
                }
                return c;
            },
            toggleColumns:function(cols, value)
            {
                for(var k in this.opts.columns) {
                    if (array.indexOf(cols, this.opts.columns[k].label) !== -1) {
                        this.opts.columns[k]["display"]=value;
                    }
                }
                this.set("columns", this.parseColumns(this.dsDef));
            },
            setColumnsDisplay:function(cols)
            {
                if (!this.opts.columns) {
                    this.opts.columns = this.columns;
                }

                for(var j=0;j<cols.length;j++) {
                    for(var k in this.opts.columns) {
                        if (cols[j].name === k) {
                            this.opts.columns[k]["display"]=cols[j].display;
                            break;
                        }
                    }
                }
                this.set("columns", this.parseColumns(this.dsDef));
            },
            reload:function()
            {
                //this.store.query({});
               // this._lastScrollTop=this.scrollTop;
                this.refresh();
            }
        });
    }
);
