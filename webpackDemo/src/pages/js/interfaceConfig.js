/**
 * 配置调用后台连接地址
 * 
 * @author t-zhangyangang
 */
var baseUrl =Window['host_Ip']+"/";
var baseUrl_eva = "emrapp/v1/formTemplate/"
var urlObj = {
		evaluate:{
			//查询表单模板列表           
			listEva:baseUrl + "emrapp/v1/formTemplates/",
			//新建评估
			newEva:baseUrl + baseUrl_eva,
			//删除评估
			deleteEva:baseUrl + baseUrl_eva,
			//编辑评估
			editEva:baseUrl + baseUrl_eva,
			//查询评估
			queryEva:baseUrl + baseUrl_eva,
			//查询评估类型数据
			queryEvaType:baseUrl + "masterwor/master/v1/86/basecodeinfos",
			//新建评估名称校验
			newEvaNameCheck:baseUrl + baseUrl_eva + "checkName?name=",
			//发布评估模板
			publishEva:baseUrl + baseUrl_eva + "publish/",
			//复制评估模板
			copyEva:baseUrl + baseUrl_eva + "copy/",
			//修改评估名称
			editEvaName:baseUrl + baseUrl_eva + "name/",
			//升级评估模板
			updateEva:baseUrl + "emrapp/v1/version/",
			//查询上一版本
			queryPreTemp:baseUrl + "emrapp/v1/previousTemplate/"
		}
		
}