Siviglia.Utils.buildClass({
    context:'Siviglia.Utils',
    classes:
    {
        ParametrizableStringException:{
            construct:function(message)
            {
                this.message=message;
                console.debug("ParametrizableStringException:"+message);
            }
        },
        ParametrizableString:
        {
            construct:function(source,controller)
            {
                this.controller=controller;
                this.BASEREGEXP=/\[%(?:(?:([^: ,%]*)%\])|(?:([^: ,]*)|([^:]*)):(.*?(?=%\]))%\])/g;
                //this.BODYREGEXP=/{\%(?:(?<simple>[^%:]*)|(?:(?<complex>[^:]*):(?<predicates>.*?(?=\%}))))\%}/;
                this.BODYREGEXP=/\{%(?:([^%:]*)|(?:([^:]*):(.*?(?=%\}))))%\}/;
                //this.PARAMREGEXP=/(?<func>[^|$ ]+)(?:\||$|(?: (?<params>[^|$]+)))/;
                this.PARAMREGEXP=/([^|$ ]+)(?:\||$|(?: ([^|$]+)))/g;
                //this.SUBPARAMREGEXP=/('[^']*')|([^ ]+)/g;
                this.SUBPARAMREGEXP=/('[^']*')|([^ ]+)/g;
                this.source=source;
            },
            methods:
            {
                parse:function(params)
                {
                    if(typeof params=="undefined")
                        params={};
                    var m=this;
                    var r=this.BASEREGEXP;
                    var res;
                    while(res=r.exec(this.source)) {
                        this.source.replace(r[0], this.parseTopMatch(r,params));
                    }
                },
                parseTopMatch:function(match,params)
                {
                    // Match simple
                    if(typeof match[1]!=="undefined")
                    {
                        try {
                            return this.getValue(match[1],params);
                        }catch (e)
                        {
                            throw new Siviglia.Utils.ParametrizableStringException("Parameter not found:"+match[1]);
                        }
                    }
                    var t=typeof match[2]!=="undefined"?match[2]:null;
                    var t1=typeof match[3]!=="undefined"?match[3]:null;
                    var mustInclude=false;
                    var exists=false;
                    var body='';
                    if(t)
                    {
                        try
                        {
                            this.getValue(t.substr(1),params);
                            exists=true;
                        }catch (e) {}

                        if(t.substr(0,1)=="!" && !exists)
                            mustInclude=true;
                        else
                            mustInclude=exists;

                    }
                    else
                        mustInclude=this.parseComplexTag(t1,params);
                    if(mustInclude)
                    {
                        var m=this;
                        var f2=function(m2) {
                        return m.parseBody(m2,params);
                        };
                        return match[4].replace(this.BODYREGEXP,f2);
                    }
                    return '';
                },
                getValue:function(path,params)
                {
                    var o=Siviglia.Utils.stringToContextAndObject(path, params, params, 1);
                    return o.context[o.object];
                },
                parseBody:function(match,params)
                {
                    //this.BODYREGEXP=/{\%(?:(?<simple>[^%:]*)|(?:(?<complex>[^:]*):(?<predicates>.*?(?=\%}))))\%}/;
                    var v=typeof match[1]!=="undefined"?match[1]:null;
                    if(v)
                    {
                        try {
                            return this.getValue(v, params);
                        }catch(e)
                        {
                            throw new Siviglia.Utils.ParametrizableStringException("Parameter not found:"+v);
                        }
                    }
                    var complex=(typeof match[2]!="undefined")?match[2]:null;
                    var cVal=null;
                    try {
                        cVal=this.getValue(v, params);
                    }catch(e) {}
                    var r=this.PARAMREGEXP;
                    var res;
                    while(res= r.exec(match[2]))
                    {
                        //this.PARAMREGEXP=/(?<func>[^|$ ]+)(?:\||$|(?: (?<params>[^|$]+)))/;
                        var func=typeof res[1]=="undefined"?null:res[1];
                        var args=typeof res[2]=="undefined"?null:res[2];
                        if(func=="default" && cVal==null)
                        {
                            cVal=args.replace(/^'|$'/,'');
                            continue;
                        }
                        if(! args)
                        {
                            if(cVal==null)
                            {
                                throw new Siviglia.Utils.ParametrizableStringException("Parameter not found:"+v);
                            }
                            cVal=this.controller[func](cVal);
                            continue;
                        }
                    }


                }
            }
        }
    }
})


    static function parseBody($match,$params)
{
        if($args=="")
        {
            if($cVal===null)
            {
                throw new ParametrizableStringException(ParametrizableStringException::ERR_MISSING_REQUIRED_VALUE,array("param"=>$v));
            }
            $cVal=$func($cVal);
            continue;
        }
        // Hay varios parametros.Hacemos otra regex para obtenerlos.
        preg_match_all(ParametrizableString::SUBPARAMREGEXP,$args,$matches2);
        $pars=array();
        $nPars=count($matches2[0]);
        for($j=0;$j<$nPars;$j++)
        {
            $arg=$matches2[1][$j]?trim($matches2[1][$j],"'"):$matches2[2][$j];
            if($arg=="@@")
                $pars[]=$cVal;
            else
                $pars[]=$arg;
        }
        $cVal=call_user_func_array($func,$pars);
    }
    return $cVal;
}
    static function parseComplexTag($format,$params)
{
    $parts=explode(",",$format);
    $nParts=count($parts);
    for($k=0;$k<$nParts;$k++)
    {
        $cf=$parts[$k];
        $sParts=explode(" ",$cf);
        $negated=$sParts[0][0]=="!";
        if($negated)
            $tag=substr($sParts[0],1);
        else
            $tag=$sParts[0];

        if(count($sParts)==1)
        {
            // Solo esta el tag.En caso de que este negado, y exista, devolvemos false.
            if($negated)
            {
                if(isset($params[$tag]))
                {
                    return false;
                }
                // Si no esta el tag,y esta negado, continuamos, no hay que procesar mas nada
                continue;
            }
        }
        // Si no esta el tag actual, lanzamos excepcion.
        if(!isset($params[$tag]))
            throw new ParametrizableStringException(ParametrizableStringException::ERR_MISSING_REQUIRED_PARAM,array("param"=>$tag));

        $result=false;
        switch($sParts[1])
        {
            case "is":{
                $fName="is_".$sParts[2];
                $result=$fName($params[$tag]);
            }break;
            case "!=":{
                $result=($params[$tag]!=$sParts[2]);
            }break;
            case "==":{
                $result=($params[$tag]==$sParts[2]);
            }break;
            case ">":{
                $result=($params[$tag]>$sParts[2]);
            }break;
            case "<":{
                $result=($params[$tag]<$sParts[2]);
            }break;
        }
        if($negated)
            $result=!$result;
        if(!$result)
            return false;
    }
    return true;
}

    static function getParametrizedStringArray($sourceArray,$params,$unusedReplacement="")
{
    $result=array();
    foreach($sourceArray as $key=>$value)
    {
        $result[$key]=ParametrizableString::getParametrizedString($value,$params,$unusedReplacement);
    }
    return $result;
}
    static function applyRecursive(& $sourceArray,$params)
{
    foreach($sourceArray as $key=>$value)
{
    if(is_array($value))
    ParametrizableString::applyRecursive($sourceArray[$key],$params);
    else
    $sourceArray[$key]=ParametrizableString::getParametrizedString($value,$params);
}
}

}/**
 * Created by JoseMaria on 27/04/2016.
 */
