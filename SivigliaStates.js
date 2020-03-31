

Siviglia.Utils.buildClass(
    {
        context: 'Siviglia.states',
        classes:
        {
            StatedDefinitionException:{
                construct:function(message)
                {
                    this.message=message;
                }
            },

            StatedDefinition:
            {
                construct: function()
                {
                    //code construct
                    this.model=null;
                    this.definition=null;
                    this.stateField=null;
                    this.onlyDefault=null;
                    this.stateFieldObj=null;
                    this.stateType=null;
                    this.oldState=null;
                    this.newState=null;
                    this.newStateLabel=null;
                    this.oldStateLabel=null;
                    this.changingState=null;
                },
                methods:
                {
                    setOldState: function(state)
                    {
                        // code
                        this.oldState = state;
                        this.oldStateLabel = this.getStateLabel(state);
                    },

                    setNewState: function(state)
                    {
                        this.newState = state;
                        this.newStateLabel = this.getStateLabel(state); 
                    },

                    getNewState: function(state)
                    {
                        if(this.newState)
                            return this.newState;
                        return this.stateType.getValue();
                    },

                    getOldState: function(state)
                    {
                        if(this.oldState)
                            return this.oldState;
                        return this.stateType.getValue();
                    },

                    reset: function()
                    {
                        this.oldState = null;
                        this.oldStateLabel = null;
                        this.newState = null;
                        this.newStateLabel = null;
                    },

                    disable: function()
                    {
                        this.hasState = false;
                    },

                    enable: function()
                    {
                        this.hasState = isset(this.definition["STATES"] ? true : false);
                        if (this.hasState)
                        {
                            this.stateField = this.definition["STATES"]["FIELD"];
                            this.stateFieldObj = this.model.__getField(this.stateField);
                            this.stateType = this.stateFieldObj.getType();
                        }
                    },

                    getCurrentState: function(){
                        if (!this.hasState)
                            return null;
                        
                        if (this.stateType.hasOwnValue())
                            return this.stateType.getValue();
                        return this.getDefaultState();
                    },

                    getStateField: function()
                    {
                        if (this.hasState)
                            return this.definition["STATES"]["FIELD"];
                        return null;
                    },

                    hasStates: function()
                    {
                        return this.hasState;
                    },

                    getDefaultState: function()
                    {
                        if (!this.hasState)
                            return null;
                        if (this.stateType.getDefaultState()!==null)
                            return this.stateType.getDefaultState();

                        if (this.definition["STATES"]["DEFAULT_STATE"])
                        {
                            //code to do and array_search & array_keys
                        }
                        return 0;
                    },

                    getStateFieldObj: function()
                    {
                        return this.stateFieldOjb;
                    },

                    getStateId: function(name)
                    {
                        return this.stateType.getValueFromLabel(name);
                    },

                    isFinalState: function(label)
                    {
                        if (!typeof label === 'string')
                            label = this.getStateLabel(label);
                            return this._io (this.definition["STATES"]["STATES"][label], "FINAL"); 
                        //return this._io (this.definition["STATES"]["STATES"][label], "FINAL", false); 
                    },

                    _isset: function(checkvar)
                    {
                        if (typeof checkvar !== 'undefined' && checkvar !== null)
                            return false;
                        else
                            return true;
                    },

                    _io: function(arr, key)
                    {
                       return this._isset(arr[key])
                    },

                    getStateLabel: function(id)
                    {
                        if (!isNaN(id))
                            return id;
                        var labels = this.stateType.getLabels();
                        return labels;
                    },

                    getCurrentStateLabel: function()
                    {
                        return this.getStateLabel(this.getCurrentState);
                    },

                    checkState: function()
                    {
                        if (!this.hasState)
                            return true;
                        if (this.newState === null)
                            return true;
                        
                        if ( !this._isset(this.definition["STATES"]["STATES"][this.newStateLabel]) ||
                             !this._isset(this.definition["STATES"]["STATES"][this.newStateLabel]["FIELDS"]) ||
                             !this._isset(this.definition["STATES"]["STATES"][this.newStateLabel]["FIELDS"]["REQUIRED"]) ) 
                             return true;
                        var st = this.definition["STATES"]["STATES"][this.newStateLabel]["FIELDS"]["REQUIRED"];
                        st.forEach(element => {
                            var field  = this.model.__getField(element);
                            try
                            {
                                return (!this._isset(field)); // ~
                            }
                            catch(err){
                                throw new Siviglia.States.StatedDefinitionException("Error. Required Field" + array("field", element));
                                //throw err;                                
                            }

                            //if (!field._is_set())
                        });
                    },

                    isRequired: function(fieldName)
                    {
                        if(this.hasState === false)
                        return this.model.__getField(fieldName).isDefinedAsRequired();
                            //return this.model.__getField(fieldName)._isset(this.definition["REQUIRED"]);

                        return this.isRequiredForState(fieldName, this.getNewState());
                    },

                    isEditable: function(fieldName)
                    {
                        if (this.hasState === false)
                            return true;
                        if (fieldName == this.stateField)
                            return true;

                        return this.isEditableInState(fieldName, this.getCurrentStateLabel());
                    },

                    isFixed: function(fieldName)
                    {
                        if (this.hasState === false)
                            return false;
                    
                        return this.isFixedInState(fieldName, this.getNewState());
                    },

                    isFixedInState: function(fieldName, stateName)
                    {
                        if (!this.hasState)
                            return true;
                        
                        return this.existsFieldInStateDefinition(stateName, fieldName, "FIXED");
                    },

                    isEditableInState: function(fieldName, stateName)
                    {
                        if (!this.hasState)
                            return true;
                        if (fieldName === this.stateField)
                            return true;

                        var res = this.existsFieldInStateDefinition(stateName, fieldName, "EDITABLE", true);

                        return res;
                    },

                    isRequiredForState: function(fieldName, stateName)
                    {
                        if (!this.hasState)
                            return this.model.__getField(fieldName).isRequired();

                        if (this.existsFieldInStateDefinition(stateName, fieldName, "REQUIRED"))
                            return true;
                        return this.model.__getField(fieldName).isDefinedAsRequired();
                    },

                    isDefinedAsRequired: function()
                    {
                        return this._isset(this.definition["REQUIRED"]) && this.definition["REQUIRED"];
                    },

                    existsFieldInStateDefinition: function(stateName, fieldName, group, defResult = false)
                    {
                        var st = this.definition["STATES"]["STATES"][stateName];
                        if (!this._isset(st["FIELDS"]))
                            return defResult;

                        if (!this._isset(st["FIELDS"][group]))
                            return false;
                        
                            return this.in_array(fieldName, st["FIELDS"][group]) || this.in_array("*",st["FIELDS"][group]);
                    },

                    in_array:function(needle, haystack, argStrict)
                    {
                        //   example 3: in_array(1, ['1', '2', '3'])
                        //   example 3: in_array(1, ['1', '2', '3'], false)
                        //   returns 3: true
                        //   returns 3: true
                        //   example 4: in_array(1, ['1', '2', '3'], true)
                        //   returns 4: false
                        var key = ''
                        var strict = !!argStrict

                        if (strict) {
                            for (key in haystack) {
                            if (haystack[key] === needle) {
                                return true
                            }
                            }
                        } else {
                            for (key in haystack) {
                            if (haystack[key] == needle) { // eslint-disable-line eqeqeq
                                return true
                            }
                            }
                        }

                        return false
                    },

                    isChangingState: function()
                    {
                        return this.changingState;
                    },

                    changeState: function(next)
                    {
                        var orig = next;
                        if (typeof next === 'string')
                        {
                            try {
                                next = this.getStateId(next);
                            } catch (error) {
                                throw new Siviglia.States.StatedDefinitionException("Error. Unknown state" + array("state",orig));
                            }
                        }

                        if (next === false)
                            throw new Siviglia.States.StatedDefinitionException("Error. Unknown state" + array("state",orig));
                        this.changingState = true;

                        if (next === this.newState)
                            return;

                        if (this.newState)
                            throw new Siviglia.States.StatedDefinitionException("Error. Double state change" + array("current".this.getCurrentState(), "new".next, "middle".this.newState));

                        this.setOldState(this.getOldState());

                        if (this.isFinalState(this.oldState()))
                        {
                            this.changingState = false;
                            throw new Siviglia.States.StatedDefinitionException("Error. Cant change final state" + array("current".oldStateLabel, "new".newStateLabel));
                        }

                        var actualState = this.oldState;

                        if (this.oldState === next && this.oldState !== null)
                        {
                            this.changingState = false;
                            return true;
                        }

                        this.setNewState(next);

                        var newId = this.newState;
                        if (!this._isset(this.definition["STATES"]["STATES"][this.newStateLabel]))
                        {
                            this.model.__getField(this.stateField.set(newId));  // mriar el set
                            this.changingState = false;
                            return;
                        }

                        var definition = this.definition["STATES"]["STATES"][this.newStateLabel];

                        if (this._isset(definition["FIELDS"]["REQUIRED"]))
                        {
                            var f = this.definition["FIELDS"]["REQUIRED"];
                            for (var index = 0; index < count(f); index++) 
                            {
                                //if (!this.model.{"*".f[index]}.hasValue() ) // falla
                                    throw new Siviglia.States.StatedDefinitionException("Error. Required field" + array("field",f[index]));
                            }
                        }

                        if (this._isset(this.definition["ALLOW_FROM"]))
                        {
                            //if array_search
                            if (this.array_search(this.oldStateLabel, this.definition["ALLOW_FROM"]) === false)
                            {
                                if (this._isset(this.definition["REJECT_TO"][this.newStateLabel]))
                                {
                                    this.executeCallbacks("REJECT_TO", this.newStateLabel, this.oldStateLabel);
                                    this.changingState = false;
                                    throw new Siviglia.States.StatedDefinitionException("Error. Rejected change state", array("current".actualState, "new".next) )
                                }else
                                {
                                    this.changingState = false;
                                    throw new Siviglia.States.StatedDefinitionException("Error. Rejected change state", array("current".actualState, "new".next) )
                                }
                            }
                        }

                        try {
                            var result = this.executeCallbacks("TESTS", this.newStateLabel, this.oldStateLabel);
                        } catch (error) {
                            this.changingState = false;
                            throw error;
                        }

                        if (!result)
                        {
                            throw new Siviglia.States.StatedDefinitionException("Error. Cant change state", array("current".actualState, "new".next) )
                        }

                        this.executeCallbacks("ON_LEAVE", this.oldStateLabel, this.newStateLabel);
                        this.executeCallbacks("ON_ENTER", this.newStateLabel, this.oldStateLabel);
                        this.model.__getField(this.stateField).set(newId);
                        this.changingState = false;
                    },

                    array_search: function (needle, haystack, argStrict) 
                    {
                        var strict = !!argStrict
                        var key = ''
                      
                        if (typeof needle === 'object' && needle.exec) {
                          
                          if (!strict) {
                            
                            var flags = 'i' + (needle.global ? 'g' : '') +
                              (needle.multiline ? 'm' : '') +
                              
                              (needle.sticky ? 'y' : '')
                            needle = new RegExp(needle.source, flags)
                          }
                          for (key in haystack) {
                            if (haystack.hasOwnProperty(key)) {
                              if (needle.test(haystack[key])) {
                                return key
                              }
                            }
                          }
                          return false
                        }
                      
                        for (key in haystack) {
                          if (haystack.hasOwnProperty(key)) {
                            if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) { // eslint-disable-line eqeqeq
                              return key
                            }
                          }
                        }
                      
                        return false
                    },                    

                    executeCallbacks: function(type, state, refState)
                    {
                        if (!this._isset(this.definition["STATES"]["LISTENER_TAGS"]))
                            return true;
                        if (!this._isset(this.definition["STATES"]["STATES"][state]["LISTENERS"][type]))
                            return true;
                        
                        // new no reconoce dicha ruta ?
                        var cbConnection = new \lib\model\states\CallBackCollection(this.definition["STATES"]["LISTENER_TAGS"]);

                        var def = this.definition["STATES"]["STATES"][state]["LISTENERS"][type];
                        var callbacks = this.getStatedDefinition(def, refState);

                        var result = cbConnection.apply(callbacks, this.model, type == "TEST" ? "TEST" : "LINEAR");

                        return result;
                    },


                    getStateTransitions: function (stateId)
                    {
                        if (!this.hasState)
                            return null;

                        if (this._isset(this.definition["STATES"]["STATES"][this.getStateLabel(stateId)]["ALLOW_FROM"]))
                        {
                            var allowed = this.definition["STATES"]["STATES"][this.getStateLabel(stateId)]["ALLOW_FROM"];
                            var result = [];

                            allowed.forEach(element => {
                                result[] = this.getStateId(element);
                            });

                            return result;
                        }

                        return null;
                    },

                    canTranslateTo: function(newStateId)
                    {
                        var currentState = this.getCurrentState();
                        var transitions = this.getStateTransitions(newStateId);
                        if (transitions === null)
                            return true;
                        
                        return in_array (currentState, transitions);
                    },

                    getStatedDefinition: function (statedDef, stateToCheck)
                    {
                        if (this._isset(stateDef["STATES"]))
                        {
                            if (this._isset(stateDef["STATES"][stateToCheck]))
                                return stateDef["STATES"][stateToCheck];
                            
                            if (this._isset(stateDef["STATES"]["*"]))
                                return stateDef["STATES"]["*"];

                            // this is fine?
                            return array();

                            return stateDef;
                        }

                    },

                    getRequiredFields: function (state)
                    {
                        if(this._isset(this.definiton["STATES"]["STATES"][state]["FIELDS"]["REQUIRED"]))
                            return this.definition["STATES"]["STATES"][state]["FIELDS"]["REQUIRED"];
                        return [];
                    }
                                        


                    
                }
            }

        }
})