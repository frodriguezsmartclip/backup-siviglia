Siviglia.Utils.buildClass({
    context: 'Siviglia.Common',
    classes:{
        /*
         Simple clase que ejecuta una query que retorna N resultados, y pagina entre ellos (no hace sub-llamadas)
         parametros:
         paginatorClass: clase de paginador, en caso de que se necesite.
         Se puede usar pasando un parametro "data", o sobreescribiendo el metodo getUrl
         La sobreescritura del metodo es necesaria para manejar los criterios de ordenacion, filtrado y agrupacion.
         El estado consiste en:
              paginator:{
                paginatorLength:7,
                elemsPerPage:20,
                useEllipsis:false,
                currentPage:0,
                totalRows:xxx,
              },
              sorting:{
                <fieldName>:<type>
              },

         */
        'SimplePaginatedDataSource': {
            inherits: 'Siviglia.UI.Widget,Siviglia.Dom.EventManager',
            methods: {
                preInitialize: function (params) {
                    var h = $.Deferred();
                    this.params=params;
                    this.controller = params.controller;
                    var m = this;
                    this.status={};
                    this.initializeStatus();
                    if(this.hasDataView())
                    {
                        var viewClass=Siviglia.Utils.stringToContextAndObject(params.dataViewClass);
                        this.dataView=new (viewClass.context[viewClass.object])(params.dataViewLayout,
                            this.getViewParams(),
                            {},
                            $("<div></div>"),
                            Siviglia.model.Root
                        );
                    }
                    if(this.hasPaginator())
                    {
                        var paginatorClass=Siviglia.Utils.stringToContextAndObject(params.paginatorClass)
                        this.paginator=new (paginatorClass.context[paginatorClass.object])(params.paginatorLayout,
                            this.getPaginatorParams(),
                            {},
                            $("<div></div>"),
                            Siviglia.model.Root
                        );
                        this.paginator.addListener("GOTO_PAGE",this,"onGotoPage");
                    }
                    this.fetch().then(function(){h.resolve()});
                    return h;
                },
                initialize:function(params)
                {
                    if(this.paginator)
                        this.paginatorNode.append(this.paginator.rootNode);
                    if(this.dataView)
                        this.dataViewNode.append(this.dataView.rootNode);
                },

                getUrl:function()
                {
                    return this.params.url;
                },
                initializeStatus:function()
                {
                    if(this.hasPaginator())
                    {
                        this.status.paginator={
                            paginatorLength:7,
                            elemsPerPage:20,
                            useEllipsis:false,
                            currentPage:0
                        };
                    }
                },
                getPaginatorParams:function() {
                    var v = this.status.paginator;
                    v.controller = this;
                    return v;
                },
                getViewParams:function()
                {
                    return {
                        controller:this
                    };
                },
                fetch:function()
                {
                    var h= $.Deferred();
                    var m=this;
                    if(this.params.data)
                    {
                        this.handleData(this.params.data);
                        h.resolve();
                    }
                    else {
                        $.get(this.getUrl()).then(function (d) {
                            if (d.success == false) {
                                m.controller.showError("Error obteniendo lista de repositorios");
                                h.reject();
                            }
                            m.handleData(d);
                            h.resolve();
                        }, function (e) {
                            m.controller.showError("Error ajax obteniendo la lista de repositorios");
                        });
                    }
                    return h;
                },
                handleData:function(data) {
                    this.data = this.preProcess(data.data);
                    this.fireDataEvents();
                },
                fireDataEvents:function()
                {
                    // Un primer evento para hacer setup del paginador
                    var param={currentPage:this.status.paginator.currentPage,total: this.status.totalRows}
                    if(this.hasPaginator())
                        this.fireEvent("DATA_LOADED",param);
                    // Un segundo evento para mostrar datos
                    if(this.hasDataView())
                        this.fireEvent("DATA_READY",param);
                },
                preProcess:function(data)
                {
                    this.status.totalRows=data.length;
                    return data;
                },
                onGotoPage:function(evName,index)
                {
                    this.status.paginator.currentPage=index;
                    this.fireDataEvents();
                    this.notifyPathListeners();
                },
                hasPaginator:function()
                {
                    return typeof this.params.paginatorClass != "undefined";
                },
                hasDataView:function()
                {
                    return typeof this.params.dataViewClass != "undefined";
                },
                getStartingRow:function()
                {
                    return this.status.paginator.currentPage*this.status.paginator.elemsPerPage;
                },
                getLastRow:function()
                {
                    return this.getStartingRow()+this.status.paginator.elemsPerPage;
                },
                getData:function(key)
                {
                    var base=this.data;
                    if(typeof key != "undefined")
                        base=this.data[key];
                    return base.slice(this.getStartingRow(),this.getLastRow());
                },
                getStatus:function()
                {
                    return this.status;
                }
            }
        },
        /*
                Objeto rowConfiguration:
                {
                    headerCellClass
                    headerCellLayout
                    fields:
                    {
                        <key>:{
                            label:'',
                            classes:'',
                            render:<function>
                            show:true,
                            sortable:true,
                            filtrable:true,
                            groupable:true,
                            continuous:true,
                            continuousStep:x,
                        }
                    }
                }


         */
        'SimpleDataView':
        {
            inherits:'Siviglia.UI.Widget,Siviglia.Dom.EventManager',
            methods:{
                preInitialize:function(params)
                {
                    var h= $.Deferred();

                    this.controller=params.controller;
                    this.headerCells={};
                    var m=this;
                    this.controller.addListener("DATA_READY",null,function(){
                        m.data= m.preProcess(m.controller.getData(params.dataKey));
                        m.notifyPathListeners();
                        h.resolve();
                    });
                    this.config=this.params.config;
                    this.refreshVisibleColumns();
                    return h;
                },
                refreshVisibleColumns:function()
                {
                    this.visibleRows=[];
                    for(var k in this.config.fields)
                    {
                        if(this.config.fields[k].show)
                            this.visibleRows.push(k);
                    }
                    this.notifyPathListeners();
                },
                initialize:function(params)
                {

                },
                preProcess:function(data)
                {
                    return data;
                },
                // Recibe un elemento de "data"
                renderCell:function(node,params)
                {
                    var field=this.visibleRows[params.index];
                    var data=params.data[field];
                    var fconf=this.params.config.fields[field];
                    if(!fconf)
                    {
                        return node.html(data);
                    }
                    if(fconf.classes) {
                        fconf.classes.split(" ").map(function (i, v) {
                            node.addClass(i)
                        });
                    }
                    if(fconf.render)
                    {
                        return fconf.render(node,field,data);
                    }
                    node.html(data);
                },
                // Recibe un elemento de la configuracion del listado.
                renderHeaderCell:function(node,params)
                {
                    var fName=params.value;
                    var fconf=this.config.fields[fName];
                    if(!this.headerCells[fName]) {
                        params.controller=this;
                        params.conf=fconf;
                        var headerClass,headerLayout;
                        if(typeof this.config.headerCellClass !="undefined")
                            headerClass=this.config.headerCellClass;
                        else
                            headerClass='Siviglia.Common.SimpleGridHeaderCell';
                        if(typeof this.config.headerCellLayout  != "undefined")
                            headerLayout=this.config.headerCellLayout;
                        else
                            headerLayout=headerClass;

                        var tClass = Siviglia.Utils.stringToContextAndObject(headerClass);
                        var headerNode = new (tClass.context[tClass.object])(headerLayout,
                            params,
                            {},
                            $("<span></span>"),
                            Siviglia.model.Root
                        );
                        this.headerCells[fName]=headerNode;
                        node.append(headerNode.rootNode);
                    }

                    if(fconf.sortable)
                    {
                        var status=this.controller.getStatus();
                        this.headerCells[fName].setSortDirecion(typeof status.sorting[fName]=="undefined"?null:status.sorting[fName]);
                    }

                },
                addRowClasses:function(node,params)
                {
                }
            }
        },
        'Paginator':{
            /*
             Construye un array, 'buttonConfig', que contiene los diferentes tipos de botones, y los indices
             a las paginas.
             Espera a que el controlador sea capaz de lanzar un evento 'DATA_LOADED', y dispara eventos 'GOTO_PAGE'
             */
            inherits:'Siviglia.UI.Widget,Siviglia.Dom.EventManager',
            methods:
            {
                preInitialize:function(params)
                {
                    var h= $.Deferred();
                    this.controller=params.controller;
                    this.pageLength=params.paginatorLength;
                    this.elemsPerPage=params.elemsPerPage;
                    this.useEllipsis=params.useEllipsis || false;
                    var m=this;
                    this.controller.addListener("DATA_LOADED",null,function(evType,data){
                        m.bounds=data;
                        m.refresh();
                        h.resolve();
                    });
                    return h;
                },
                initialize:function(params)
                {

                },
                refresh:function()
                {
                    if(this.bounds.total < this.elemsPerPage)
                    {
                        this.rootNode.css({"display":"none"});
                        return;
                    }
                    var currentPage=this.bounds.currentPage;
                    this.rootNode.css({"display":"block"});
                    var nPages = this.bounds.total / this.elemsPerPage;
                    if (nPages != parseInt(nPages))
                        nPages = Math.ceil(nPages);
                    this.nPages = nPages;
                    if (nPages == 0) {
                        this.rootNode.css({"display":"none"});
                        return;
                    }
                    var start=currentPage;
                    var halfP = Math.ceil(this.pageLength / 2);
                    if (nPages < this.pageLength || currentPage < halfP) {
                        if (nPages > this.pageLength)
                            ellipsis = true;
                        start = 0;
                    }
                    else {
                        if (currentPage + halfP > nPages)
                            start = Math.max(0, nPages - this.pageLength);
                        else {
                            start = Math.max(0, currentPage - Math.floor(this.pageLength / 2));
                        }
                    }

                    var previousClass=(currentPage > 0?'display':'noDisplay');
                    var nextClass=(currentPage + 1 < nPages)?'display':'noDisplay';
                    this.startingItemIndex=currentPage * this.elemsPerPage;
                    this.lastItemIndex=this.startingItemIndex + parseInt(this.elemsPerPage);

                    this.buttonConfig=[
                        {"type":"firstPage","index":0,"class":previousClass},
                        {"type":"previousPage","index":currentPage-1,"class":previousClass}
                    ];
                    var extraClass;
                    var cPage=start;

                    for (var k = 0; k < this.pageLength && start + k < nPages; k++) {
                        if (this.useEllipsis && k == this.pageLength - 2
                            && cPage+2 < nPages
                        ) {
                            this.buttonConfig.push({"type":"ellipsis","class":"display"});
                            cPage = nPages - 1;
                            continue;
                        }

                        extraClass = (cPage == currentPage ? 'currentPage' : '');
                        this.buttonConfig.push({"type":"button","class":extraClass,"label":cPage+1,"index":cPage,"class":"display"});
                        cPage++;
                    }

                    this.buttonConfig.push({"type":"nextPage","index":currentPage+1,"class":nextClass});
                    this.buttonConfig.push({"type":"lastPage","index":nPages-1,"class":nextClass});
                    this.notifyPathListeners();
                },
                gotoPage:function(pageNum)
                {
                    // Se itera sobre los botones de tipo "pagina", buscando cual es el activo.
                    // Esto es asi, porque aunque se haga click en un boton "especial" (anterior, siguiente,etc),
                    // el boton que se activa es el de la pagina actual, en vez de ese boton "especial".

                    this.bounds.currentPage=pageNum;
                    this.refresh();
                    for(var k=0;k<this.buttonConfig.length;k++)
                    {
                        var c=this.buttonConfig[k];
                        if(c.type!="button")
                            continue;

                        if(c.index==pageNum)
                        {
                            c.node.toggleClass("active");
                        }
                        else
                            c.node.removeClass("active");
                    }

                    this.fireEvent("GOTO_PAGE",pageNum);
                },
                getDefaultLabel:function(conf)
                {
                    switch(conf.type)
                    {
                        case 'nextPage':
                        {
                            return {'title':'Siguiente','label':'&triangleright;',sp:1};
                        }break;
                        case 'lastPage':
                        {
                            return {'title':'Ultima','label':'&raquo;',aria:"Last",sp:1};
                        }break;
                        case 'previousPage':
                        {
                            return {'title':'Anterior','label':'&triangleleft;',aria:"Previous",sp:1};

                        }break;
                        case 'firstPage':
                        {
                            return {'title':'Ultimo','label':'&laquo;',aria:"First",sp:1};
                        }break;
                        case 'ellipsis':
                        {
                            return {'title':'','label':'...',sp:1}
                        }break;
                        default:
                        {
                            return {'title':'Pagina '+conf.label,'label':conf.label,sp:0};
                        }
                    }
                }
            }
        },
        NumberedPaginator:
        {
            inherits:'Siviglia.Common.Paginator',
            methods:{
                renderButton:function(node,param)
                {
                    var conf=param.conf;

                        node.css({'visibility':(node.class="display")?'visible':'hidden'});

                        var l = this.getDefaultLabel(conf);
                        if (conf.type == "ellipsis") {
                            node.addClass("disabled");
                            node.html('<a class="paginatorButton" href="#" aria-label="'+l.label+'">'+ l.label+'</a>');
                            return;
                        }

                        if (param.conf.type=="button" && param.conf.index == this.bounds.currentPage) {
                            node.addClass("active");
                        }

                        var t = '<a class="paginatorButton" href="#" aria-label="' + conf.label + '">';
                        if (l.sp)
                            t += '<span aria-hidden="true">';
                        t += l.label;
                        if (l.sp)
                            t += '</span>';
                        t += '</a>';
                        var cont = $(t);
                        var m = this;
                        cont.on("click", function () {
                            m.gotoPage(conf.index)
                        });
                    param.conf.node=node;
                    node.html('');
                    node.append(cont);
                }
            }
        },
        SimpleGridHeaderCell:
        {
            inherits:'Siviglia.UI.Widget',
            methods:
            {
                preInitialize:function(params)
                {
                    this.config=params.conf;
                    this.controller=params.controller;
                    this.sortDirection=null;
                },
                toggleSort:function()
                {
                    if(this.config.sortable)
                    {

                    }
                },
                setSortDirection:function(dir)
                {
                    this.sortDirection=dir;
                    this.notifyPathListeners();
                }

            }
        }
    }
});/**
 * Created by JoseMaria on 26/04/2016.
 */
