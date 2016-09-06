define(["dojo/_base/declare", "dijit/Calendar", 'dijit/form/_DateTimeTextBox', 'Siviglia/forms/inputs/BaseInput'],
    function (declare, Calendar, _DateTimeTextBox, BaseInput) {
        return declare([_DateTimeTextBox, BaseInput],
            {
                popupClass: Calendar,

                getValue: function () {
                    val = this.get('value');
                    if (val != null)
                    {
                        var v=val.getMonth()+1;
                        if(v<10)
                            v='0'+v;
                        return val.getFullYear() + "-" + v + "-" + val.getDate() + " " + val.getHours() + ":" + val.getMinutes() + ":" + val.getSeconds();
                    }
                    return null;
                },
                _setValueAttr:function(value, /*Boolean?*/ priorityChange, /*String?*/ displayedValue, /*item?*/ item)
                {
                    if(value=="Invalid Date")
                        return;
                    if(typeof value == "object")
                    {

                    }
                    else
                    {
                        var p=value.split(" ");
                        value=new Date(Date.parse(p[0]))
                    }
                    this.inherited(arguments);
                }

            });
    }
);
/*
 DateTimeInput:function(name,f,form,value)
 {
 var p = new Deferred();
 //dijit.form.ValidationTextBox
 require(["dijit/form/DateTextBox"],function(t)
 {
 var input=new t({name:name});
 input.inputInitializer=inputInitializer;
 input.sivigliaValue=dateValueConverter;
 input.validator=inputValidator;
 input.inputInitializer(f,form,value);
 p.resolve(input);
 });


 return p.promise;
 },
 */