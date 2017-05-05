/**
 * Created by itw_zhangyg on 2017/1/10.
 */
$(function(){
    initPage();
});

/*根据后台数据，初始化表单*/
function initPage(){
	 /*
    1.获取数据   ajax
    2.渲染页面在html中
     */
    var myData;
    //获取数据
    if(myData){
        return false;
    }
    //1.获取数据  ajax
    $.ajax({
        url:urlObj.evaluate.listEva,
        type:'get',
        data:{},
        dataType:'json',
        success:function(data){
        	//当请求一次做一次记录
            myData = data.data;
            console.log(data.data);
            //将数据转为模板引擎，并包装数据
            var templateEva = _.template($('#template_xjpg').html());
            var htmlEva = templateEva({model:myData});
            //2.渲染页面在html中
            $('#xjEva').html(htmlEva);  
        }
    })
    //给新建评估   评估类型下拉框赋值
	$.ajax({
		url:urlObj.evaluate.queryEvaType,
		type:'get',
		dataType:'json',
		success:function(data){	
			for(var i =0; i < data.data.length; i++){
				$("#evaType").append("<option>" + data.data[i].name + "</option>")				
			}
		}
	})
}
/*新建评估弹出框*/
$("#xinjianpg").on('click',function(){
	//初始化数据
	$("#evaName").val("");                   //清空用户名
	$(".evafjbh").removeAttr("checked");     //清除选中状态
	//$(".nameTips p").css('display','none');  //清除提示信息
	if($("#evabtn").hasClass('disabled')){   //清除按钮状态
		$("#evabtn").removeClass('disabled');
	}
 	//打开模态框
	$("#newEvaluate").modal("show");
	
})
/*新建评估名称校验*/
$("#evaName").on('blur',function(){
	var evaname = $("#evaName").val();
	$.ajax({
        url:urlObj.evaluate.newEvaNameCheck + evaname,
        type:'get',
        data:{},
        dataType:'json',
        success:function(data){
        	console.log(data);
        	if(data.code != 0){
        		alert(data.msg);
        		//$(".nameTips p").text(data.msg).fadeIn();
        		$("#evabtn").addClass('disabled');
        		return false;
        	}else{
        		//$(".nameTips p").fadeOut();
        		$("#evabtn").removeClass('disabled');
        	} 
        }
    })
})
/*新建评估*/
$("#evabtn").on('click',function(){
	//缓存外部this
	var _this = $(this);
	//禁止重复提交
	if(_this.hasClass('disabled')){
		return false;
	}
	//获取表单数据
	var evaformData = {
			name:$("#evaName").val(),
			type:$("#evaType").val()
	}
	console.log(evaformData);
	//发起请求
	$.ajax({
		type:'post',
		url:urlObj.evaluate.newEva,
		datatype:'json',
		contentType:'application/json',
		data:JSON.stringify(evaformData),
		//发起请求前 调用
		beforeSend:function(){
			if($("#evaName").val() == ""){
				alert("名字不能为空");
				//$(".nameTips p").text("名字不能为空").fadeIn();
				//终止发起请求
	    		return false;
			}else{
				//$(".nameTips p").fadeOut();
			}
			console.log(_this);
			_this.addClass('disabled');
		},
		success:function(info){
			console.log(info);
			//传入下一个页面数据
			var nextPageData = {
					type:$("#evaType").val(),
					evaname:$("#evaName").val(),
					requiredText:$("#bttsf").val(),
					evasjbh:$('.evasjbh').val(),
					questionStartIndex:$('.evastbh').val(),
					showQuestionNumbers:$('.evafjbh').is(':checked'),
					evaxxbh:$('.evaxxbh').val(),
					evaId:info.data.id,
					evaFlag:0,
					savetype:"evaformEdit", //从图标进入编辑页面类型
					id:info.data.id
			}
			console.log(nextPageData);
			//不刷新展示新建评估
			initPage()
			//新建成功后将数据放入sessionStorage传数据
			sessionStorage.setItem('template',JSON.stringify(nextPageData));
			//跳转
			location.href = './main.html';
			
		},
		complete:function(){
			console.log(2);
			_this.removeClass("disabled");
			$("#newEvaluate").modal("hide");
		}
	})
})
//删除表单评估
function evaformDelete(evaformId){
	confirm("文档是否删除？",function(flag){
		if(flag){
			$.ajax({
				type:'put',
				url:urlObj.evaluate.deleteEva + evaformId,
				datatype:'json',
				success:function(info){
					if(info.code == 0){
						//刷新页面
						initPage();
					}
				}
			})
		}
	}) 
	
}
//发布表单模板
function evaformPublish(evaformId){
		$.ajax({
			type:'put',
			url:urlObj.evaluate.publishEva + evaformId,
			datatype:'json',
			success:function(info){
				console.log(info);
				if(info.code == 0){
					//刷新页面
					initPage();			
				}else if(info.code == 'emr10016'){
					alert("文档无内容，不可发布");
				}
			}
		})
}
//复制模板
function evaformCopy(evaformId){
	$.ajax({
		type:'post',
		url:urlObj.evaluate.copyEva + evaformId,
		datatype:'json',
		success:function(info){
			if(info.code == 0){
				//刷新页面
				initPage();
			}	
		}
	})
}
//编辑模板
function evaformEdit(evaformId){
	$.ajax({
		type:'get',
		url:urlObj.evaluate.editEva + evaformId,
		datatype:'json',
		success:function(info){
			if(info.code == 0){
				//将数据放入sessionStorage传数据
				var evaEditData = info.data;
				info.data['evaFlag'] = 1;
				info.data.id = evaformId;
				info.data.savetype="evaformEdit"; //从图标进入编辑页面类型
				sessionStorage.setItem('template',JSON.stringify(info.data));
				//跳转
				location.href = './main.html';
			}	
		}
	})
}
//修改名称
function evaformName(evaformId,keyCode){
	if(keyCode == 13){
		var evaname = $("#" + evaformId).text();
		$.ajax({
			type:'put',
			url:urlObj.evaluate.editEvaName + evaformId + "?name=" + evaname,
			datatype:'json',
			success:function(info){
				if(info.code == 0){
					initPage();				
					alert(info.msg);
				}else{	
					//initPage();
					$("#" + evaformId).addClass("bloTop_name_focus");
					alert(info.msg);
				}
			}
		})
	}	
}
//删除字符串左右两端的空格
function trim(str){
	return str.replace(/(^\s*)|(\s*$)/g,"");
}
//修改名称input聚焦
var eva_Name;  //聚焦时的评估名称
function evaFocus(evaformId){
	eva_Name = trim($("#" + evaformId).text());
	$("#" + evaformId).addClass("bloTop_name_focus");
	$.ajax({
		type:'get',
		url:urlObj.evaluate.queryEva + evaformId,
		datatype:'json',
		success:function(info){
			$("#" + evaformId).text(info.data.name);
		}
	})
	
}
//修改名称input离焦
function evaBlur(evaformId){
	var evaname = trim($("#" + evaformId).text());
	if(evaname == eva_Name){
		$("#" + evaformId).removeClass("bloTop_name_focus");
		return;
	}
	$.ajax({
		type:'put',
		url:urlObj.evaluate.editEvaName + evaformId + "?name=" + evaname,
		datatype:'json',
		success:function(info){
			if(info.code == 0){
				initPage();				
				alert(info.msg);
			}else{	
				//initPage();
				$("#" + evaformId).addClass("bloTop_name_focus");
				alert(info.msg);
			}
		}
	})
	//initPage();
}
//编辑上一版本
function evaformpreVer(previousPublishId){
	if(previousPublishId == null || previousPublishId == "") return;
	$.ajax({
		type:'get',
		url:urlObj.evaluate.queryPreTemp + previousPublishId,
		datatype:'json',
		success:function(info){
			if(info.code == 0){
				//将数据放入sessionStorage传数据
				var evaEditData = info.data;
				info.data['evaFlag'] = 2;
				info.data["savetype"]="evaformpreVer"; //从版本号进入编辑页面类型
				sessionStorage.setItem('template',JSON.stringify(info.data));
				//跳转
				location.href = './main.html';
			}	
		}
	})
}
//升级版本
function evaformUpdate(evaformId){
	$.ajax({
		type:'put',
		url:urlObj.evaluate.updateEva + evaformId,
		datatype:'json',
		success:function(info){
			if(info.code == 0){
				alert("升级成功");
				initPage();
			}
		}
	})
}