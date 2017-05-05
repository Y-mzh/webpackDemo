var domain = "http://192.168.1.101/";
var urlConfig = {
	"residentsList": domain + "evaapp/v1/eva/residentsList" ,//居民一览
	"getValusByToken":domain+"userapp/api/getValusByToken/",//根据token获取当前用户信息
	"updateUserToken":domain+"userapp/api/updateUserToken"
};



//统一调用后台地址方法
function requestData(url, typ, suc, err, param) {
	
	$.ajax({
		url: url,

		data: param,

		type: typ,

		dataType: 'json',

		success: function(data) {

			suc&&suc(data);

		},

		error: function(data) {
			err(data)
		}

	})
}

//获取浏览器地址信息
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	var r = window.location.search.substr(1).match(reg); //匹配目标参数
	if(r != null)
		return unescape(r[2]);
	return null; //返回参数值
}

//搜索功能
function searchArr(arr, attr1, attr2, value) {
	var newArr = [];
	for(var i = 0; i < arr.length; i++) {
		if(arr[i][attr1].indexOf(value) != -1 || arr[i][attr2].indexOf(value) != -1) {
			newArr.push(arr[i])
		}
	}
	return newArr;
}

//去重
function removeR(arr, str) {
	for(var i = 0; i < arr.length; i++) {
		for(var j = i + 1; j < arr.length; j++) {
			if(arr[i][str] == arr[j][str]) {
				arr.splice(i, 1);
			}
		}
	}
	return arr;
};