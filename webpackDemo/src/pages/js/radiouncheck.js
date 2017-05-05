
/**
 * Created by itw_liuzq on 2017/2/21.
 */
//$(function(){
/*    function uncheck(obj)
    {
        var radio=obj;
        if (radio.tag==1)
        {
            radio.checked=false;
            radio.tag=0;
            console.log("0");
        }
        else
        {
            radio.checked=true;
            radio.tag=1
            console.log("1");
        }
    }
    $("input[type='radio']").click(function(){
        uncheck(this);
    })
    
    $(document).on("click",$("input[type='radio']"),function(){
    	uncheck(this);
    })*/
    window.onload = function(){
    	$(".bzwh").click(function(){
            $(this).parent().find(".tsmessage").fadeIn();
        })
        $(".gbts").click(function(){
            $(this).parent().fadeOut();
        })
    }
        
//})

