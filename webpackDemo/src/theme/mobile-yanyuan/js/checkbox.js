
 //$(function(){
        //var arrCheckbox = $(".sv_q_checkbox input[type='checkbox']");
        //var arrSpan = $(".sv_q_checkbox").children("span");
        //
        //for(var i = 0 ; i < arrCheckbox.length; i++ ){
        //    $(arrCheckbox[i]).attr("data-labelauty",$(arrSpan[i]).html());
        //    $(arrSpan[i]).hide();
        //}
        //var arrCheckbox = $(".sv_q_radiogroup input[type='radio']");
        //var arrSpan = $(".sv_q_radiogroup").children("span");
        //
        //for(var i = 0 ; i < arrCheckbox.length; i++ ){
        //    $(arrCheckbox[i]).attr("data-labelauty",$(arrSpan[i]).html());
        //    $(arrSpan[i]).hide();
        //}
        // $(".sv_q_other").parent().css("display","inline-block");
        // //$(".sv_q_other").children("input").css("display","block");
        //$(".sv_q_other").parent().addClass("sv_q_chk_ipt");
        //$(".sv_q_other").children("input").addClass("sv_q_other_input");


    //})

    window.onload = function(){
        setTimeout(function(){
            //$(":input[type='checkbox']").labelauty();
            //$(":input[type='radio']").labelauty();


//移动端日期选择

            var currYear = (new Date()).getFullYear();
            var opt={};
            opt.date = {preset : 'date'};
            opt.datetime = {preset : 'datetime'};
            opt.time = {preset : 'time'};
            opt.default = {
                theme: 'android-ics light', //皮肤样式
                display: 'modal', //显示方式
                mode: 'scroller', //日期选择模式
                dateFormat: 'yyyy-mm-dd',
                lang: 'zh',
                showNow: true,
                nowText: "今天",
                startYear: currYear - 60, //开始年份
                endYear: currYear + 10 //结束年份
            };

            $(":input[type='date']").mobiscroll($.extend(opt['date'], opt['default']));

        },50);

		/*
        var arrCheckbox = $(".sv_q_checkbox input[type='checkbox']");
        var arrSpan = $(".sv_q_checkbox").children("span");

<<<<<<< .mine
        function uncheck(obj)
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
            console.log(this);
        })
=======
        for(var i = 0 ; i < arrCheckbox.length; i++ ){
            $(arrCheckbox[i]).attr("data-labelauty",$(arrSpan[i]).html());
            $(arrSpan[i]).hide();
        }
        var arrCheckbox = $(".sv_q_radiogroup input[type='radio']");
        var arrSpan = $(".sv_q_radiogroup").children("span");
>>>>>>> .r35850

<<<<<<< .mine
=======
        for(var i = 0 ; i < arrCheckbox.length; i++ ){
            $(arrCheckbox[i]).attr("data-labelauty",$(arrSpan[i]).html());
            $(arrSpan[i]).hide();
        }
        $(".sv_q_other").parent().css("display","inline-block");
        $(".sv_q_other").parent().addClass("sv_q_chk_ipt");
        $(".sv_q_other").children("input").addClass("sv_q_other_input");
*/

        $(".bzwh").click(function(){
            $(this).parent().find(".tsmessage").fadeIn();
        })
        $(".gbts").click(function(){
            $(this).parent().fadeOut();
        })

    }