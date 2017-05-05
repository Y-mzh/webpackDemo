/**
 * Created by itw_wanghr on 2017/2/14.
 * 配置文件类
 */

export class EditorUrl {
    public static host_ip:string = Window['host_Ip'];
    /** 从图标进入编辑页面并发布的url */
    static publish_url:string = EditorUrl.host_ip+"/emrapp/v1/formTemplate/publish/";
    /** 从版本号进入编辑页面并发布的url */
    public static publish_evapreVer_url:string = EditorUrl.host_ip+"/emrapp/v1/previousTemplate/publish/";
    /** 从图标进入编辑页面并保存的url */
    static save_url:string = EditorUrl.host_ip+"/emrapp/v1/formTemplate";
    /** 从版本号进入编辑页面并保存的url */
    public static save_evapreVer_url:string = EditorUrl.host_ip+"/emrapp/v1/previousTemplate";


    /**
     * 这是配置客户信息读取的数据
     * Created by itw_mazh on 2017/03/03.
     */
    public static customer_con = [{name:"客户",code:"56"}];
    /**
     * 配置引用类型数组
     * 作用是用来对比选择当前值是否被包含在数组中
     * @type {(string|string)[]}
     */
    public static refrtker_arry = ["客户","居民"]
    /**
     * 配置引用字段默认值
     */
    public  static refrtker_value=["请选择"];

    /**
     * 配置点击引用类型显示对应的引用字段
     * Created by itw_mazh on 2017/03/15.
     * @type {(string|string|string)[]}
     */
    public static refer_Key = ["请选择","name","SexName"];




}
