define(["dojo/_base/declare"],
    function(declare)
    {
        StdActions=declare(null,
        {
            actions: {
                'ps_product/ps_specific_price': {
                    'FIELDS': {
                        'id_product': {
                            'LABEL': 'Productos',
                            'ACTIONS': [
                                {
                                    'ACTION': 'CreatePromotionAction',
                                    'LABEL': 'Crear promoción',
                                    'PARAMSVIEW': 'views/CreatePromotionParamsView'
                                },
                                {
                                    'ACTION': 'DeletePromotionAction',
                                    'LABEL': 'Borrar promoción',
                                    'PARAMSVIEW': null
                                }
                            ]
                        }
                    }
                }
            }
        });

        stdActions=new StdActions();

        return declare([],
        {
            getActions:function(objectContext, definition)
            {
                var result=[];
                var fields = definition.FIELDS;

                //Primero sacamos las del contexto
                if (stdActions.actions[objectContext] !== undefined) {
                    var aoc = stdActions.actions[objectContext];
                    for (var k in fields) {
                        if (aoc['FIELDS'][k] !== undefined) {
                            var aux = {
                                FIELD: k,
                                MODEL: objectContext,
                                LABEL: aoc['FIELDS'][k].LABEL,
                                ACTIONS: aoc['FIELDS'][k].ACTIONS
                            };
                            result.push(aux);
                        }
                    }
                }

                //Sacamos el resto de acciones de los otros objetos (distintos al objectContext)
                for (var k in stdActions.actions) {
                    if (k === objectContext) {
                        continue;
                    }

                    for (var j in fields) {
                        if (stdActions.actions[k]['FIELDS'][j] !== undefined) {
                            var aux = {
                                FIELD: j,
                                MODEL: k,
                                LABEL: stdActions.actions[k]['FIELDS'][j].LABEL,
                                ACTIONS: stdActions.actions[k]['FIELDS'][j].ACTIONS
                            };
                            result.push(aux);
                        }
                    }
                }

                return result;
            }
        });
    });
