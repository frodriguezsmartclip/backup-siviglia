define(
    ["dojo/_base/declare",
        "dojo/Deferred", "dojo/query","Siviglia/views/Parseable","dojo/Evented"
    ],
    function (declare, Deferred,  query, Parseable, Evented) {
        return declare([Parseable, Evented], {
            model:null,
            params:null,
            datasource:null,
            getDatasourceCallback:null,
            postCreate:function()
            {
                var m=this;
                this.refresh(this.data);
                this.inherited(arguments);
            },

            refresh:function(data)
            {
                var m=this;
                if(data)
                {
                    this.parseNode(data);
                }
                else
                {
                    this.model.getRawDataSource(this.datasource,this.params).then(
                        function(data){
                            m.parseNode(data);
                            //Emitimos un evento para poder controlar cuando se ha parseado.
                            m.emit('AFTER PARSE NODE', {});

                            //TODO: sustituir este callback por escuchar el evento anterior
                            if (m.afterParseNodeCallback) {
                                m[m.afterParseNodeCallback]();
                            }
                        },
                        function(err){
                            alert("Datos no encontrados")
                        }
                    );
                }
            }
        });
    });
