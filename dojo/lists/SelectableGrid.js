define(
    ["dojo/_base/declare", "dojo/promise/all",
        "dojo/when", "dojo/Deferred","dojo/require","Siviglia/lists/Grid","dgrid/selector"
    ],
    // Las opciones aniadidas en sivInitialize son: selectionMode : [single/multiple/Extended].Por defecto, single.
    //
    function(declare,all,when,deferred,require,Grid,selector)
    {
        return declare([Grid],{
            setupGrid:function()
            {
                 this.set("selectionMode",this.opts.selectMultiple || 'single');

            },
            parseColumns:function(d)
            {
                var c={};
                c._selector=selector({label:'Select'});
                for(var k in d.FIELDS)
                {
                    c[k]={label:k,sortable:true}
                }
                return c;
            }
        });
    }
);
