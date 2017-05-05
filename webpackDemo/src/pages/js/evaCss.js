/**
 * Created by itw_zhangyg on 2017/1/10.
 */

//固定新建一栏，隐藏登录信息
	var msgOffset = $(".msg").offset().top;
	$(window).scroll(function(){
	    var srcollPos = $(window).scrollTop();
	    if(srcollPos >= msgOffset) {
	        $(".msg").addClass("fixed");
	    }else{
	        $(".msg").removeClass("fixed");
	    }
	});
//下拉框必填提示符颜色
	function bttsfInit(){
	    $("#bttsf").onchange = function(){
	        var x = this.selectedIndex,
	            os = this.$("option");
	        for(var i = 0 ; i < os.length; i++){
	            os[i].style.color="black";
	        }
	        os[x].style.color = "red";
	    }
	}
	window.onload = bttsfInit;