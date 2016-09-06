define(["dojo/_base/declare","dijit/Tooltip", "dijit/_WidgetBase",
    "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin","dijit/_HasDropDown"],
    function(declare,tooltip,WidgetBase,Templated,WidgetsInTemplate,DropDown){

        var popable=declare([WidgetBase,Templated,WidgetsInTemplate,DropDown],
            {
                model:null,
                key:null,
                keyValue:null,
                message:null,
                viewName:null,
                templateString:'<div><div style="text-decoration:underline;cursor:pointer" data-dojo-attach-event="click: setDD" data-dojo-attach-point="valueNode"></div> </div>',
                innerView:null,
                postCreate:function()
                {
                  this.valueNode.innerHTML=this.message;
                },
                isLoaded: function(){
                    // Returns whether or not we are loaded - if our dropdown has an href,
                    // then we want to check that.
                    return this.innerView!=null;
                },
                setDD:function()
                {
                  this.toggleDropDown();
                },
                loadDropDown: function(callback){
                    // Loads our dropdown
                    if(this.isLoaded()){
                        this.dropDown.destroyRecursive(false);
                    }
                        var m=new Siviglia.Model.Model(this.model);
                        var opts={};
                        opts[this.key]=this.keyValue;
                        var p=this;
                        var d=document.createElement("div");
                        m.getView(this.viewName,opts,d).then(function(v){
                            p.innerView=v;
                            p.dropDown=v;
                            p.own(v);
                            p.toggleDropDown();
                        });

                }
            }
        );
    var callManager=function(object, value, node, options,func,fieldModel,fieldKey,tooltipView,extra){
        if(tooltipView)
        {
            var d=document.createElement("div");
            var p=new popable({
                model:fieldModel,
                key:fieldKey,
                keyValue:object[fieldKey],
                message:value,
                viewName:tooltipView
            });
            p.placeAt(d);
            node.appendChild(d);
        }
        else
        {
            var d=document.createElement("a");
            d.onclick=function(){top.mainController[func](object[fieldKey],extra);}
            d.innerHTML=value;
            d.style.textDecoration='underline';
            d.style.cursor='pointer';
            d.className='identifier bag_reference';
            node.appendChild(d);
        }
    };
    var showBag=function(object,value,node,options)
    {
        callManager(object,value,node,options,"showSellerBag","Bag","id_bag","views/TooltipView");
    }
    var showCustomer=function(object,value,node,options)
    {
        callManager(object,value,node,options,"_showUser","ps_customer","id_customer");
    }
    var showCustomerEmail=function(object,value,node,options)
    {
        callManager(object,value,node,options,"_showUser","ps_customer","id_customer");
    }
    var showProduct=function(object,value,node,options)
    {
        callManager(object,value,node,options,"showProduct","ps_product/PercentilProduct","id_product");
    }
    var showOrder=function(object,value,node,options)
    {
        callManager(object,value,node,options,"showOrder","ps_orders","id_order");
    }
    var showManufacturer=function(object,value,node,options)
    {
        var extra = {datasourceView: top.mainController.currentView};
        callManager(object,value,node,options,"showManufacturer","ps_product/ps_manufacturer","id_manufacturer",false,extra);
    }
    var showCarrier=function(object,value,node,options)
    {
        callManager(object,value,node,options,"showCarrier","Shipment/ps_carrier","id_carrier",false);
    }
    var showNotification=function(object,value,node,options)
    {
        var extra = {datasourceView: top.mainController.currentView.datasourceView};
        callManager(object,value,node,options,"showNotification","notification","id_notification",false,extra);
    }
    var showPagoVendedor=function(object,value,node,options)
    {
        callManager(object,value,node,options,"showPagoVendedor","Payment/pagos_vendedores","id_pago_vendedor");
    }
    var editDiscount=function(object,value,node,options)
    {
        callManager(object,value,node,options,"showDiscount","ps_orders/ps_discount","id_discount");
    }

    StdTransforms=declare(null,
    {
        transforms:{
            'Bag':{
                'FIELDS':{
                    'bag_reference':showBag
                }
            },
            'ps_product':{
                'FIELDS':{
                    'reference':showProduct
                }
            },
            'Shipment/ps_carrier':{
                'FIELDS':
                {
                    'name':showCarrier
                }
            },
            'ps_product/ps_manufacturer':{
              'FIELDS':{
                  'name':showManufacturer
              }
            },
            'Payment/pagos_vendedores':{
                'FIELDS':{
                    'id_pago_vendedor':showPagoVendedor
                }
            },
            'notification': {
                'FIELDS':{
                    'id_notification':showNotification
                }
            },
            'ps_orders/ps_discount':{
              'FIELDS':{
                  'id_discount':editDiscount,
                  'name':editDiscount
              }
            },
            '*':{
                'FIELDS':{
                    'id_customer':showCustomer,
                    'id_product':showProduct,
                    'id_order':showOrder,
                    'id_bag':showBag,
                    'id_manufacturer':showManufacturer,
                    'email':showCustomerEmail
                }
            }
        }
    });

    stdTransforms=new StdTransforms();
        return declare(null,{
           getTransform:function(def)
           {
               if(!def["MODEL"])
                return;
               var model=def["MODEL"];
               parts=model.split('\\');
               if(parts[0]=='')
                    parts=parts.splice(1);
               if(parts[0]=="backoffice")
                   parts=parts.splice(1);
               model=parts.join("/");
               if(stdTransforms.transforms[model] && stdTransforms.transforms[model]['FIELDS'][def["FIELD"]])
               {
                   return stdTransforms.transforms[model]['FIELDS'][def["FIELD"]];
               }
               if(stdTransforms.transforms["*"] && stdTransforms.transforms["*"]['FIELDS'][def["FIELD"]])
               {
                   return stdTransforms.transforms["*"]['FIELDS'][def["FIELD"]];
               }
               return null;
           }
        });
    });
