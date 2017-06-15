{
    "ROOT"
:
    {
        "LABEL"
    :
        "Website",
            "TYPE"
    :
        "CONTAINER",
            "LAYOUT"
    :
        "MenuLayout",

            "FIELDS"
    :
        {
            /* "userProfiles": {
             "TYPE": "ARRAY",
             "LABEL": "Perfiles de usuario"
             },*/
            "system"
        :
            {
                "HANDLER"
            :
                "Editor.SystemHandler",
                    "TYPE"
            :
                "CONTAINER",
                    "IGNOREKEY"
            :
                true,
                    "LABEL"
            :
                "Config",
                    //"LOAD_URL":"?ds=config",
                    "LOAD_URL"
            :
                "loader.php?load=website",
                    "SAVE_URL"
            :
                "?action=changeConfig",
                    "FIELDS"
            :
                {
                    "PROJECTPATH"
                :
                    {
                        "TYPE"
                    :
                        "STRING", "LABEL"
                    :
                        "Path del proyecto", "READONLY"
                    :
                        true, "NODELETE"
                    :
                        true
                    }
                ,
                    "WEBPATH"
                :
                    {
                        "NODELETE"
                    :
                        true, "TYPE"
                    :
                        "STRING", "LABEL"
                    :
                        "Url del proyecto", "HELP"
                    :
                        "Esta url debe apuntar a la carpeta /html del proyecto"
                    }
                ,
                    "SERIALIZERS"
                :
                    {
                        "TYPE"
                    :
                        "CONTAINER",
                            "LABEL"
                    :
                        "Bases de datos",
                            "FIELDS"
                    :
                        {
                            "app"
                        :
                            {
                                "TYPE"
                            :
                                "TYPESWITCH",
                                    "LABEL"
                            :
                                "App Database",
                                    TYPE_FIELD
                            :
                                'TYPE',
                                    ALLOWED_TYPES
                            :
                                ['MYSQL', 'Cassandra']
                            }
                        ,

                            "web"
                        :
                            {
                                "TYPE"
                            :
                                "TYPESWITCH",
                                    "LABEL"
                            :
                                "Web Database",
                                    TYPE_FIELD
                            :
                                'TYPE',
                                    ALLOWED_TYPES
                            :
                                ['MYSQL', 'Cassandra']
                            }
                        }
                    }
                }
            }
        ,
            "Website"
        :
            {
                "TYPE"
            :
                "CONTAINER",
                    "LABEL"
            :
                "Web",
                    "LAYOUT"
            :
                "MenuItem",
                    "FIELDS"
            :
                {
                    "objects"
                :
                    {
                        "HANDLER"
                    :
                        "Editor.ObjectHandler",
                            "TYPE"
                    :
                        "DICTIONARY",
                            "LABEL"
                    :
                        "Objetos de web",
                            "LOAD_URL"
                    :
                        "loader.php?load=webObjects",
                            "VALUETYPE"
                    :
                        "OBJECTMODEL",
                            "LAYOUT"
                    :
                        "ObjEditorLayout"
                    }
                }

            }
        ,
            "Application"
        :
            {
                "TYPE"
            :
                "CONTAINER",
                    "LABEL"
            :
                "Application",
                    "LAYOUT"
            :
                "MenuItem",
                    "FIELDS"
            :
                {
                    "objects"
                :
                    {
                        "HANDLER"
                    :
                        "Editor.ObjectHandler",
                            "TYPE"
                    :
                        "DICTIONARY",
                            "LABEL"
                    :
                        "Objetos de Aplicacion",
                            "LOAD_URL"
                    :
                        "loader.php?load=appObjects",
                            "VALUETYPE"
                    :
                        "OBJECTMODEL",
                            "LAYOUT"
                    :
                        "ObjEditorLayout"
                    }
                }
            }
        ,

            "preferences"
        :
            {
                "Label"
            :
                "Users",
                    "HANDLER"
            :
                "Editor.SystemPreferences",
                    "TYPE"
            :
                "CONTAINER",
                    "IGNOREKEY"
            :
                true,
                    "LABEL"
            :
                "Preferences",
                    //"LOAD_URL":"?ds=preferences",                    
                    "SAVE_URL"
            :
                "?action=preferences",
                    "FIELDS"
            :
                {
                    "REQUIRE_UNIQUE_EMAIL"
                :
                    {
                        "TYPE"
                    :
                        "BOOLEAN", "LABEL"
                    :
                        "Emails are unique?", "HELP"
                    :
                        "Require unique emails on sign-up"
                    }
                ,
                    "PLAINTEXT_PASSWORDS"
                :
                    {
                        "TYPE"
                    :
                        "SELECTOR", "OPTIONS"
                    :
                        {
                            "Plain Text"
                        :
                            1, "MD5"
                        :
                            2, "CRYPT"
                        :
                            3
                        }
                    ,
                        "DEFAULT"
                    :
                        3, "LABEL"
                    :
                        "Password encryption"
                    }
                ,
                    "ATTEMPTS_BEFORE_LOCKOUT"
                :
                    {
                        "TYPE"
                    :
                        "INTEGER", "LABEL"
                    :
                        "Attempts before freeze", "DEFAULT"
                    :
                        0
                    }
                ,
                    "REQUIRE_ACCOUNT_VALIDATION"
                :
                    {
                        "TYPE"
                    :
                        "BOOLEAN", "LABEL"
                    :
                        "Requires account validation", "DEFAULT"
                    :
                        false
                    }
                ,
                    "LOGIN_ON_CREATE"
                :
                    {
                        "TYPE"
                    :
                        "BOOLEAN", "LABEL"
                    :
                        "Autolog user after sign-up", "DEFAULT"
                    :
                        true
                    }
                ,
                    "NOT_ALLOWED_NICKS"
                :
                    {
                        "TYPE"
                    :
                        "ARRAY", "LABEL"
                    :
                        "Not allowed nicks (regexps)"
                    }
                }
            }
        }

    }
,
    "MYSQL"
:
    {
        "TYPE"
    :
        "CONTAINER",
            "FIELDS"
    :
        {
            "ADDRESS"
        :
            {
                "TYPE"
            :
                "CONTAINER",
                    "LABEL"
            :
                "Storage definition",
                    "FIELDS"
            :
                {
                    "host"
                :
                    {
                        "TYPE"
                    :
                        "STRING", "LABEL"
                    :
                        "Host"
                    }
                ,
                    "user"
                :
                    {
                        "TYPE"
                    :
                        "STRING", "LABEL"
                    :
                        "User name"
                    }
                ,
                    "password"
                :
                    {
                        "TYPE"
                    :
                        "STRING", "LABEL"
                    :
                        "Password"
                    }
                ,
                    "database"
                :
                    {
                        "TYPE"
                    :
                        "CONTAINER", "LABEL"
                    :
                        "Database", "FIELDS"
                    :
                        {
                            "NAME"
                        :
                            {
                                "TYPE"
                            :
                                "STRING", "LABEL"
                            :
                                "Database name"
                            }
                        }
                    }
                }
            }
        }
    }
,
    "Cassandra"
:
    {
        "TYPE"
    :
        "CONTAINER",
            "FIELDS"
    :
        {
            "ADDRESS"
        :
            {
                "TYPE"
            :
                "CONTAINER",
                    "LABEL"
            :
                "Storage definition",
                    "FIELDS"
            :
                {
                    "host"
                :
                    {
                        "TYPE"
                    :
                        "STRING", "LABEL"
                    :
                        "Host"
                    }
                ,
                    "user"
                :
                    {
                        "TYPE"
                    :
                        "STRING", "LABEL"
                    :
                        "User name"
                    }
                ,
                    "password"
                :
                    {
                        "TYPE"
                    :
                        "STRING", "LABEL"
                    :
                        "Password"
                    }
                ,
                    "database"
                :
                    {
                        "TYPE"
                    :
                        "CONTAINER", "LABEL"
                    :
                        "Database", "FIELDS"
                    :
                        {
                            "NAME"
                        :
                            {
                                "TYPE"
                            :
                                "STRING", "LABEL"
                            :
                                "Database name"
                            }
                        }
                    }
                }
            }
        }
    }
,

    "OBJECTMODEL"
:
    {
        "TYPE"
    :
        "CONTAINER",
            "LABEL"
    :
        "Model Object",
            "DONT_DRAW_KEYS"
    :
        true,
            "FIELDS"
    :
        {
            "DEFINITION"
        :
            {
                "LABEL"
            :
                "Definition",
                    "TYPE"
            :
                "CONTAINER",
                    "DONT_DRAW_KEYS"
            :
                true,
                    "LOAD_URL"
            :
                "loader.php?load=modelDefinition",
                    "FIELDS"
            :
                {
                    "INDEXFIELDS"
                :
                    {
                        "LABEL"
                    :
                        "Indexes",
                            "TYPE"
                    :
                        "ARRAY",
                            "SOURCE"
                    :
                        "../FIELDS"
                    }
                ,
                    "FIELDS"
                :
                    {
                        "LABEL"
                    :
                        "Fields",
                            "TYPE"
                    :
                        "DICTIONARY",
                            "VALUETYPE"
                    :
                        "FIELDDEFINITION"
                    }

                }
            }

        }

    }
,

    "FIELDDEFINITION"
:
    {
        "LABEL"
    :
        "Field",
            "TYPE"
    :
        "TYPESWITCH",
            TYPE_FIELD
    :
        'TYPE',
            ALLOWED_TYPES
    :
        ['AutoIncrement', 'UUID', 'Integer', 'String', 'Boolean', 'DateTime', 'Enum', 'Relationship', 'Timestamp', 'Decimal',
            'Text', 'Email', 'IP', 'Login', 'UserId', 'Password', 'Money', 'City', 'Phone', 'State', 'Street']

    }
,
    "AutoIncrement"
:
    {
        "LABEL"
    :
        "Auto increment",
            "TYPE"
    :
        "CONTAINER",
            "FIELDS"
    :
        {
            "LABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Label"
            }
        ,
            "SHORTLABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Short label"
            }
        ,
            "DESCRIPTIVE"
        :
            {
                "TYPE"
            :
                "BOOLEAN", "LABEL"
            :
                "Descriptive"
            }
        }
    }
,
    "UUID"
:
    {
        "LABEL"
    :
        "UUID",
            "TYPE"
    :
        "CONTAINER",
            "FIELDS"
    :
        {
            "LABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Label"
            }
        ,
            "SHORTLABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Short label"
            }
        ,
            "DESCRIPTIVE"
        :
            {
                "TYPE"
            :
                "BOOLEAN", "LABEL"
            :
                "Descriptive"
            }
        }
    }
,
    "Integer"
:
    {
        "LABEL"
    :
        "Integer",
            "TYPE"
    :
        "CONTAINER",
            "FIELDS"
    :
        {
            "LABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Label"
            }
        ,
            "SHORTLABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Short label"
            }
        ,

            "MIN"
        :
            {
                "TYPE"
            :
                "STRING",
                    "LABEL"
            :
                "Min value",
                    "REQUIRED"
            :
                "n"
            }
        ,
            "MAX"
        :
            {
                "TYPE"
            :
                "STRING",
                    "LABEL"
            :
                "Max value",
                    "REQUIRED"
            :
                "n"
            }
        ,
            "DESCRIPTIVE"
        :
            {
                "TYPE"
            :
                "BOOLEAN", "LABEL"
            :
                "Descriptive"
            }
        ,
            "ISLABEL"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Is label?"
            }
        ,
            "REQUIRED"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Required"
            }
        ,
            "DEFAULT"
        :
            {
                "TYPE"
            :
                "STRING",
                    "LABEL"
            :
                "Default value",
                    "REQUIRED"
            :
                "n"
            }
        }
    }
,
    "String"
:
    {
        "LABEL"
    :
        "String",
            "TYPE"
    :
        "CONTAINER",
            "FIELDS"
    :
        {
            "LABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Label"
            }
        ,
            "SHORTLABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Short label"
            }
        ,
            "MINLENGTH"
        :
            {
                "TYPE"
            :
                "STRING",
                    "LABEL"
            :
                "Min Length",
                    "REQUIRED"
            :
                "n"

            }
        ,
            "MAXLENGTH"
        :
            {
                "TYPE"
            :
                "STRING",
                    "LABEL"
            :
                "Max length",
                    "REQUIRED"
            :
                "y",
                    "DEFAULT"
            :
                "15"
            }
        ,
            "REGEXP"
        :
            {
                "TYPE"
            :
                "STRING",
                    "LABEL"
            :
                "Regular expression",
                    "REQUIRED"
            :
                "n"
            }
        ,
            "TRIM"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Trim values"
            }
        ,
            "CHARACTER SET"
        :
            {
                "TYPE"
            :
                "STRING",
                    "LABEL"
            :
                "Character set",
                    "DEFAULT"
            :
                "utf8"
            }
        ,
            "DESCRIPTIVE"
        :
            {
                "TYPE"
            :
                "BOOLEAN", "LABEL"
            :
                "Descriptive"
            }
        ,
            "ISLABEL"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Is label?"
            }
        ,
            "REQUIRED"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Required"
            }
        ,
            "DEFAULT"
        :
            {
                "TYPE"
            :
                "STRING",
                    "LABEL"
            :
                "Default value",
                    "REQUIRED"
            :
                "n"
            }
        }
    }
,
    "Boolean"
:
    {
        "LABEL"
    :
        "Boolean",
            "TYPE"
    :
        "CONTAINER",
            "FIELDS"
    :
        {
            "LABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Label"
            }
        ,
            "SHORTLABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Short label"
            }
        ,
            "DESCRIPTIVE"
        :
            {
                "TYPE"
            :
                "BOOLEAN", "LABEL"
            :
                "Descriptive"
            }
        ,
            "ISLABEL"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Is label?"
            }
        ,
            "REQUIRED"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Required"
            }
        ,
            "DEFAULT"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Default value",
                    "REQUIRED"
            :
                "n"
            }
        }
    }
,
    "DateTime"
:
    {
        "LABEL"
    :
        "Date/Time",
            "TYPE"
    :
        "CONTAINER",
            "FIELDS"
    :
        {
            "LABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Label"
            }
        ,
            "SHORTLABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Short label"
            }
        ,
            "DESCRIPTIVE"
        :
            {
                "TYPE"
            :
                "BOOLEAN", "LABEL"
            :
                "Descriptive"
            }
        ,
            "STARTYEAR"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Min allowed year"
            }
        ,
            "ENDYEAR"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Max allowed year"
            }
        ,
            "STRICTYLPAST"
        :
            {
                "TYPE"
            :
                "BOOLEAN", "LABEL"
            :
                "Dates must be in the past"
            }
        ,
            "STRICTLYFUTURE"
        :
            {
                "TYPE"
            :
                "BOOLEAN", "LABEL"
            :
                "Dates must be future"
            }
        ,
            "TIMEZONE"
        :
            {
                "TYPE"
            :
                "SELECTOR", "LABEL"
            :
                "Timezone", "OPTIONS"
            :
                {
                    "Server timezone"
                :
                    "SERVER", "UTC"
                :
                    "UTC", "Dont modify"
                :
                    "CLIENT"
                }
            ,
                "DEFAULT"
            :
                "CLIENT"
            }
        ,
            "ISLABEL"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Is label?"
            }
        ,

            "REQUIRED"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Required"
            }
        ,
            "DEFAULT"
        :
            {
                "TYPE"
            :
                "STRING",
                    "LABEL"
            :
                "Default value",
                    "REQUIRED"
            :
                "n",
                    "HELP"
            :
                "Use NOW to make this field work as a timestamp."
            }
        }

    }
,
    "Enum"
:
    {
        "LABEL"
    :
        "Enum",
            "TYPE"
    :
        "CONTAINER",
            "FIELDS"
    :
        {
            "LABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Label"
            }
        ,
            "SHORTLABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Short label"
            }
        ,
            "DESCRIPTIVE"
        :
            {
                "TYPE"
            :
                "BOOLEAN", "LABEL"
            :
                "Descriptive"
            }
        ,
            "ISLABEL"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Is label?"
            }
        ,
            "REQUIRED"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Required"
            }
        ,
            "VALUES"
        :
            {
                "TYPE"
            :
                "ARRAY",
                    "LABEL"
            :
                "Values"
            }
        ,
            "DEFAULT"
        :
            {
                "TYPE"
            :
                "STRING",
                    "LABEL"
            :
                "Default value",
                    "SOURCE"
            :
                "../VALUES",
                    "REQUIRED"
            :
                "n"
            }
        }
    }
,
    "Relationship"
:
    {
        "LABEL"
    :
        "Relationship",
            "CUSTOMTYPE"
    :
        "SivRelationship",
            TYPE_FIELD
    :
        'MULTIPLICITY',
            ALLOWED_TYPES
    :
        ['1:N', 'MultipleRelationship']
    }
,
    "1:N"
:
    {
        "LABEL"
    :
        "Simple Relationship",
            "CUSTOMTYPE"
    :
        "SivSimpleRelationship",
            "FIELDS"
    :
        {
            "LABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Label"
            }
        ,
            "SHORTLABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Short label"
            }
        ,
            "DESCRIPTIVE"
        :
            {
                "TYPE"
            :
                "BOOLEAN", "LABEL"
            :
                "Descriptive"
            }
        ,
            "ISLABEL"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Is label?"
            }
        ,
            "REQUIRED"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Required"
            }
        ,
            "OBJECT"
        :
            {
                "CUSTOMTYPE"
            :
                "SivObjectSelector", "LABEL"
            :
                "Objeto2"
            }
        ,
            "FIELDS"
        :
            {
                "CUSTOMTYPE"
            :
                "SivFieldSelector",
                    "PAINTER"
            :
                "ArrayPainter",
                    "LABEL"
            :
                "Field",
                    "SOURCE"
            :
                "/@../OBJECT@/DEFINITION/FIELDS",
                    "HELP"
            :
                "Choose the layer/object/field this "
            }
        }
    }
,
    "MultipleRelationship"
:
    {
        "LABEL"
    :
        "Multiple Relationship",
            "TYPE"
    :
        "CONTAINER",
            "FIELDS"
    :
        {
            "LABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Label"
            }
        ,
            "SHORTLABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Short label"
            }
        ,
            "DESCRIPTIVE"
        :
            {
                "TYPE"
            :
                "BOOLEAN", "LABEL"
            :
                "Descriptive"
            }
        ,
            "ISLABEL"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Is label?"
            }
        ,
            "REQUIRED"
        :
            {
                "TYPE"
            :
                "BOOLEAN",
                    "LABEL"
            :
                "Required"
            }
        ,
            "FIELD"
        :
            {
                "TYPE"
            :
                "OBJECTARRAY",
                    "LABEL"
            :
                "Fields",
                    "VALUETYPE"
            :
                "MultipleRelationshipField"
            }
        ,
            "DEFAULT"
        :
            {
                "TYPE"
            :
                "STRING",
                    "LABEL"
            :
                "Default value",
                    "SOURCE"
            :
                "../VALUES",
                    "REQUIRED"
            :
                "n"
            }
        }
    }
,
    "MultipleRelationshipField"
:
    {
        "LABEL"
    :
        "Fields in Relation",
            "CUSTOMTYPE"
    :
        "SivMultipleRelationshipField",
            "FIELDS"
    :
        {
            "LOCAL"
        :
            {
                "LABEL"
            :
                "Local field",
                    "TYPE"
            :
                "STRING",
                    "SOURCE"
            :
                "../../../../FIELDS"
            }
        ,
            "REMOTE"
        :
            {
                "LABEL"
            :
                "Remote field",
                    "CUSTOMTYPE"
            :
                "ObjectFieldPath",
                    "SOURCE"
            :
                "/@/@/objects/@../objects@/FIELDS"

            }
        }
    }
,


    "EXTERNAL_ALIAS"
:
    {
        "LABEL"
    :
        "Temp", "TYPE"
    :
        "STRING"
    }
,

    "STATE_SPEC"
:
    {
        "TYPE"
    :
        "CONTAINER",
            "LABEL"
    :
        "Especificacion de estado",
            "FIELDS"
    :
        {
            "LABEL"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Nombre del estado"
            }
        ,
            "CALLBACKS"
        :
            {
                "TYPE"
            :
                "CONTAINER", "LABEL"
            :
                "Eventos generados",
                    "FIELDS"
            :
                {
                    "ON_ENTER"
                :
                    {
                        "TYPE"
                    :
                        "OBJECTARRAY",
                            "VALUETYPE"
                    :
                        "CALLBACK_SPEC",
                            "LABEL"
                    :
                        "Eventos de entrada",
                            "DESCRIPTION"
                    :
                        "Objeto/metodo a llamar al entrar en este estado"
                    }
                ,
                    "ON_LEAVE"
                :
                    {
                        "TYPE"
                    :
                        "OBJECTARRAY",
                            "VALUETYPE"
                    :
                        "CALLBACK_SPEC",
                            "LABEL"
                    :
                        "Eventos de salida",
                            "DESCRIPTION"
                    :
                        "Objeto/metodo a llamar al salir de este estado"
                    }
                }
            }
        ,
            "ALLOWED_TRANSITIONS"
        :
            {
                "TYPE"
            :
                "ARRAY", "SOURCE"
            :
                "../..", "LABEL"
            :
                "Transiciones permitidas", "DESCRIPTION"
            :
                "Estados a los que puede ir un objeto que se encuentre en este estado"
            }
        ,
            "PERMISSIONS"
        :
            {
                "TYPE"
            :
                "DICTIONARY", "SOURCE"
            :
                "/userProfiles", "VALUETYPE"
            :
                "PERMISSION_SPEC", "LABEL"
            :
                "Permisos", "DESCRIPTION"
            :
                "Permisos agregados/eliminados de los permisos por defecto, a cada perfil de usuario, cuando el objeto se encuentra en este estado."
            }
        }
    }
,
    "PERMISSION_SPEC"
:
    {
        "TYPE"
    :
        "CONTAINER",
            "LABEL"
    :
        "",
            "FIELDS"
    :
        {
            "ALLOW"
        :
            {
                "TYPE"
            :
                "ARRAY", "SOURCE"
            :
                "../../../PERMISSIONS", "LABEL"
            :
                "Permitir", "DESCRIPTION"
            :
                "Permisos agregados para este perfil de usuario"
            }
        ,
            "DENY"
        :
            {
                "TYPE"
            :
                "ARRAY", "SOURCE"
            :
                "../../../PERMISSIONS", "LABEL"
            :
                "Denegar", "DESCRIPTION"
            :
                "Permisos denegados a este perfil de usuario"
            }
        }
    }
,
    "PERMISSION_SPEC2"
:
    {
        "TYPE"
    :
        "CONTAINER",
            "LABEL"
    :
        "",
            "FIELDS"
    :
        {
            "ALLOW"
        :
            {
                "TYPE"
            :
                "ARRAY", "SOURCE"
            :
                "../../../PERMISSIONS", "LABEL"
            :
                "Permitir", "DESCRIPTION"
            :
                "Permisos agregados para este perfil de usuario"
            }
        ,
            "DENY"
        :
            {
                "TYPE"
            :
                "ARRAY", "SOURCE"
            :
                "../../../PERMISSIONS", "LABEL"
            :
                "Denegar", "DESCRIPTION"
            :
                "Permisos denegados a este perfil de usuario"
            }
        }
    }
,
    "CALLBACK_SPEC"
:
    {
        "TYPE"
    :
        "CONTAINER",
            "LABEL"
    :
        "",
            "FIELDS"
    :
        {
            "OBJECT"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Objeto"
            }
        ,
            "METHOD"
        :
            {
                "TYPE"
            :
                "STRING", "LABEL"
            :
                "Metodo"
            }
        }
    }

}