define(
    ["dojo/_base/declare", "dijit/_WidgetBase","dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "Siviglia/views/NotificatedMixin",
        "dojo/text!./templates/TabsView.html","dojo/promise/all","dojo/when",
        "dojo/Deferred", "dojo/dom-construct","dojo/on","dojo/aspect","dijit/layout/ContentPane",
        "dijit/registry","dijit/form/Button", "dijit/layout/TabContainer"

    ],
    function(declare,widgetBase,Templated,WidgetsInTemplate,Notificated,template,all,when,deferred,dom,on,aspect,ContentPane,registry) {
        return declare([widgetBase,Templated,WidgetsInTemplate,Notificated], {
            templateString: template,
            _widgetsInTemplate: true,
            errors: [],
            model:null,
            idInstance: null,
            params:null,
            notificationsContainer: 'showNotificationsContainer',
            constructor:function(params)
            {
                this.params=params;
                this.idInstance=params.id;
            },
            postCreate: function() {
                this.inherited(arguments);

                var m=new Siviglia.Model.Model(this.tabsCollection.model);
                var self=this;
                m.load(this.idInstance).then(function(i){
                    self.model=i;
                    self.showFirstTab();
                    self.setTitle();
                    self.setMainTitle();
                    if (self.hasNotifications) {
                        self.showNotifications();
                    }
                });

                this.createDomElements();
                this.initialize();
                this.tabs.watch("selectedChildWidget", dojo.hitch(this,"onChangedTab"));
            },
            createDomElement:function(name,title)
            {
                var pane=new ContentPane({
                    id: name+'Pane',
                    title: title,
                    dojoAttachPoint: name+'Pane',
                    dojoProps: 'selected:true'
                });
                pane.placeAt('tabsWrapper');
                pane.startup();
            },
            createDomElements:function()
            {
                for(var n=0;n<this.tabsCollection.items.length;n++) {
                    this.createDomElement(this.tabsCollection.items[n].name,this.tabsCollection.items[n].title);
                }
            },
            initialize: function (refocus)
            {
                for(var n=0;n<this.tabsCollection.items.length;n++) {
                    this.tabsCollection.items[n].view=null;
                }
            },
            onChangedTab:function(name,oval,nval)
            {
                var attachPoint='';

                for(var n=0;n<this.tabsCollection.items.length;n++) {
                    attachPoint=this.tabsCollection.items[n].name+'Pane';
                    if(attachPoint===nval.dojoAttachPoint) {
                        this.showTab(this.tabsCollection.items[n].name);
                    }
                }
            },
            showTab:function(tabName)
            {
                var fName='';
                var paneName='';
                var outerThis=null;
                var outerIndex=0;

                for(var n=0;n<this.tabsCollection.items.length;n++) {
                    if(this.tabsCollection.items[n].name===tabName) {
                        paneName=this.tabsCollection.items[n].name+'Pane';
                        outerThis=this;
                        outerIndex=n;

                        if(this.tabsCollection.items[n].view)
                            return;

                        fName=this.tabsCollection.items[n].callback;
                        this[fName]().then(function(v){
                            outerThis.tabsCollection.items[outerIndex].view=v;
                            registry.byId(paneName).domNode.appendChild(v.domNode);
                            v.startup();
                        });
                    }
                }
            },
            showFirstTab:function()
            {
                this.showTab(this.tabsCollection.items[0].name);
            },
            setTitle:function()
            {
                if(this.popupWindow)
                    this.popupWindow.setTitle(this.model.get(this.titleField));
            },
            setMainTitle:function()
            {
                this.mainTitle.innerHTML = this.mainTitleContent;
            },
            setPreTabsContent:function(node)
            {
                this.preTabs.appendChild(node);
            },
            setPostTabsContent:function(node)
            {
                this.postTabs.appendChild(node);
            },
            addTab:function(newTab)
            {
                this.createDomElement(newTab.name, newTab.title);
                this.tabsCollection.items.push(newTab);
            }
        });
    });