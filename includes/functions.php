<?php

function str_have($str, $have)
{
    if(strpos($str, $have) !== false)
        return true;
    else
        return false;
}

?>