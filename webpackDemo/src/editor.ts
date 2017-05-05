import {editorLocalization,defaultStrings} from "./editorLocalization";
import {SurveyObjectEditor} from "./objectEditor";
import {SurveyPagesEditor} from "./pagesEditor";
import {SurveyEmbedingWindow} from "./surveyEmbedingWindow";
import {SurveyObjects} from "./surveyObjects";
import {SurveyVerbs} from "./objectVerbs";
import {SurveyJSONEditor} from "./surveyJSONEditor";
import {SurveyTextWorker} from "./textWorker"
import {SurveyUndoRedo, UndoRedoItem} from "./undoredo";
import {SurveyHelper, ObjType} from "./surveyHelper";
import {DragDropHelper} from "./dragdrophelper";
import {SurveyJSON5} from "./json5";
import {html as templateEditorHtml} from "./templateEditor.ko.html";
import {html as templatePageHtml} from "./template_page.html";
import {html as templateQuestionHtml} from "./template_question.html";
import * as Survey from "survey-knockout";
import {EditorUrl} from "./config";

export class SurveyEditor {
    public static defaultNewSurveyText: string = "{ pages: [ { name: '试卷1'}]}";
    private renderedElement: HTMLElement;
    private surveyjs: HTMLElement;
    private surveyjsExample: HTMLElement;

    private jsonEditor: SurveyJSONEditor;
    private selectedObjectEditor: SurveyObjectEditor;
    private pagesEditor: SurveyPagesEditor;
    private surveyEmbeding: SurveyEmbedingWindow;
    private surveyObjects: SurveyObjects;
    private surveyVerbs: SurveyVerbs;
    private undoRedo: SurveyUndoRedo;
    private surveyValue: Survey.Survey;
    private saveSurveyFuncValue: (no: number, onSaveCallback: (no: number, isSuccess: boolean) => void) => void;
    private options: any;
    private stateValue: string = "";
    private dragDropHelper: DragDropHelper = null;
    private showJSONEditorTabValue: boolean;
    private showTestSurveyTabValue: boolean;
    private showEmbededSurveyTabValue: boolean;

    public surveyId: string = null;
    public surveyPostId: string = null;
    public questionTypes: string[];
    public koCopiedQuestions: any;
    public generateValidJSONChangedCallback: (generateValidJSON: boolean) => void;
    public alwaySaveTextInPropertyEditors: boolean = false;
    public onCanShowProperty: Survey.Event<(sender: SurveyEditor, options: any) => any, any> = new Survey.Event<(sender: SurveyEditor, options: any) => any, any>();

    koIsShowDesigner: any;
    koViewType: any;
    koCanDeleteObject: any;
    koObjects: any; koSelectedObject: any;
    koShowSaveButton: any;
    koGenerateValidJSON: any; koShowOptions: any; koTestSurveyWidth: any;
    selectDesignerClick: any; selectEditorClick: any; selectTestClick: any; selectEmbedClick: any;
    putPublishClick: any;		//发布表单模板
    getitemChange:any;
    generateValidJSONClick: any; generateReadableJSONClick: any;
    doUndoClick: any; doRedoClick: any;
    deleteObjectClick: any;
    koState: any;
    runSurveyClick: any; embedingSurveyClick: any;
    saveButtonClick: any;
    draggingQuestion: any; clickQuestion: any;
    draggingCopiedQuestion: any; clickCopiedQuestion: any;
    dragEnd: any;
    saveEditorClick: any;
    constructor(renderedElement: any = null, options: any = null) {

        this.koShowOptions = ko.observable();
        this.koGenerateValidJSON = ko.observable();
        this.setOptions(options);
        this.koCopiedQuestions = ko.observableArray();
        this.koCanDeleteObject = ko.observable(false);

        var self = this;

        this.koState = ko.observable();
        this.koShowSaveButton = ko.observable(false);
        this.koTestSurveyWidth = ko.observable("100%");
        this.saveButtonClick = function () { self.doSave(); };
        this.koObjects = ko.observableArray();
        this.koSelectedObject = ko.observable();
        this.koSelectedObject.subscribe(function (newValue) { self.selectedObjectChanged(newValue != null ? newValue.value : null); });
        this.koGenerateValidJSON.subscribe(function (newValue) {
            if (!self.options) self.options = {};
            self.options.generateValidJSON = newValue;
            if (self.generateValidJSONChangedCallback) self.generateValidJSONChangedCallback(newValue);
        });
        this.surveyObjects = new SurveyObjects(this.koObjects, this.koSelectedObject);
        this.undoRedo = new SurveyUndoRedo();

        this.surveyVerbs = new SurveyVerbs(function () { self.setModified(); });

        this.selectedObjectEditor = new SurveyObjectEditor(this.options);
        this.selectedObjectEditor.onCanShowPropertyCallback = function (object: any, property: Survey.JsonObjectProperty) {
            return self.onCanShowObjectProperty(object, property);
        }
        this.selectedObjectEditor.onPropertyValueChanged.add((sender, options) => {
            self.onPropertyValueChanged(options.property, options.object, options.newValue);
        });
        this.pagesEditor = new SurveyPagesEditor(() => { self.addPage(); }, (page: Survey.Page) => { self.surveyObjects.selectObject(page); },
            (indexFrom: number, indexTo: number) => { self.movePage(indexFrom, indexTo); }, (page: Survey.Page) => { self.deleteCurrentObject(); });
        this.surveyEmbeding = new SurveyEmbedingWindow();

        this.koViewType = ko.observable("designer");
        this.koIsShowDesigner = ko.computed(function () { return self.koViewType() == "designer"; });
        this.selectDesignerClick = function () { self.showDesigner(); };
        this.selectEditorClick = function () { self.showJsonEditor(); };
        this.saveEditorClick = function () { self.getSaveEditor(); };
        this.selectTestClick = function () { self.showTestSurvey(); };
        this.putPublishClick = function () { self.putPublish() };		//发布表单模板
        this.getitemChange = function(){
            self.getitemv();
        }
        this.selectEmbedClick = function () { self.showEmbedEditor(); };
        this.generateValidJSONClick = function () { self.koGenerateValidJSON(true); };
        this.generateReadableJSONClick = function () { self.koGenerateValidJSON(false); };
        this.runSurveyClick = function () { self.showLiveSurvey(); };
        this.embedingSurveyClick = function () { self.showSurveyEmbeding(); };
        this.deleteObjectClick = function () { self.deleteCurrentObject(); };
        this.draggingQuestion = function (questionType, e) { self.doDraggingQuestion(questionType, e); };
        this.clickQuestion = function (questionType) { self.doClickQuestion(questionType); };
        this.draggingCopiedQuestion = function (item, e) { self.doDraggingCopiedQuestion(item.json, e); };
        this.clickCopiedQuestion = function (item) { self.doClickCopiedQuestion(item.json); };
        this.dragEnd = function (item, e) { self.dragDropHelper.end(); };

        this.doUndoClick = function () { self.doUndoRedo(self.undoRedo.undo()); };
        this.doRedoClick = function () { self.doUndoRedo(self.undoRedo.redo()); };

        this.jsonEditor = new SurveyJSONEditor();

        if (renderedElement) {
            this.render(renderedElement);
        }
        
    }
    protected setOptions(options: any) {
        this.options = options;
        this.questionTypes = this.getQuestionTypes();
        this.showJSONEditorTabValue = options && typeof (options.showJSONEditorTab) !== 'undefined' ? options.showJSONEditorTab : true;
        this.showTestSurveyTabValue = options && typeof (options.showTestSurveyTab) !== 'undefined' ? options.showTestSurveyTab : true;
        this.showEmbededSurveyTabValue = options && typeof (options.showEmbededSurveyTab) !== 'undefined' ? options.showEmbededSurveyTab : false;
        this.koShowOptions(options && typeof (options.showOptions) !== 'undefined' ? options.showOptions : false);
        this.koGenerateValidJSON(this.options && this.options.generateValidJSON);
        if (this.selectedObjectEditor) this.selectedObjectEditor.setOptions(options);
    }
    public get survey(): Survey.Survey {
        return this.surveyValue;
    }
    public render(element: any = null, options: any = null) {
        if (options) this.setOptions(options);
        var self = this;
        if (element && typeof element == "string") {
            element = document.getElementById(element);
        }
        if (element) {
            this.renderedElement = element;
        }
        element = this.renderedElement;
        if (!element) return;
        element.innerHTML = templateEditorHtml;
        self.applyBinding();
    }
    public loadSurvey(surveyId: string) {
        var self = this;
        new Survey.dxSurveyService().loadSurvey(surveyId, function (success: boolean, result: string, response: any) {
            if (success && result) {
                self.text = JSON.stringify(result);
                console.log(JSON.stringify(result));
                console.debug(JSON.stringify(result));
                alert(JSON.stringify(result))
            }
        });
    }
    public get text() {
        if (this.koIsShowDesigner()) return this.getSurveyTextFromDesigner();
        return this.jsonEditor.text;
    }
    public set text(value: string) {
        var textWorker = new SurveyTextWorker(value);
        if (textWorker.isJsonCorrect) {
            this.initSurvey(new Survey.JsonObject().toJsonObject(textWorker.survey));
            this.showDesigner();
            this.setUndoRedoCurrentState(true);
        } else {
            this.setTextValue(value);
            this.koViewType("editor");
        }
    }
    public get state(): string { return this.stateValue; }
    protected setState(value: string) {
        this.stateValue = value;
        this.koState(this.state);
    }
    saveNo: number = 0;
    protected doSave() {
        this.setState("saving");
        if (this.saveSurveyFunc) {
            this.saveNo++;
            var self = this;
            this.saveSurveyFunc(this.saveNo,
                function doSaveCallback(no: number, isSuccess: boolean) {
                    self.setState("saved");
                    if (self.saveNo == no) {
                        if (isSuccess) self.setState("saved");
                        //else TODO
                    }
                });
        }
    }
    protected setModified() {
        this.setState("modified");
        this.setUndoRedoCurrentState();
    }
    private setUndoRedoCurrentState(clearState: boolean = false) {
        if (clearState) {
            this.undoRedo.clear();
        }
        var selObj = this.koSelectedObject() ? this.koSelectedObject().value : null;
        this.undoRedo.setCurrent(this.surveyValue, selObj ? selObj.name : null);
    }
    public get saveSurveyFunc() { return this.saveSurveyFuncValue; }
    public set saveSurveyFunc(value: any) {
        this.saveSurveyFuncValue = value;
        this.koShowSaveButton(value != null);
    }
    public get showOptions() { return this.koShowOptions(); }
    public set showOptions(value: boolean) { this.koShowOptions(value); }
    public get showJSONEditorTab() { return this.showJSONEditorTabValue; }
    public set showJSONEditorTab(value: boolean) { this.showJSONEditorTabValue = value; }
    public get showTestSurveyTab() { return this.showTestSurveyTabValue; }
    public set showTestSurveyTab(value: boolean) { this.showTestSurveyTabValue = value; }
    public get showEmbededSurveyTab() { return this.showEmbededSurveyTabValue; }
    public set showEmbededSurveyTab(value: boolean) { this.showEmbededSurveyTabValue = value; }

    protected onCanShowObjectProperty(object: any, property: Survey.JsonObjectProperty): boolean {
        var options = { obj: object, property: property, canShow: true };
        this.onCanShowProperty.fire(this, options);
        return options.canShow;
    }

    private setTextValue(value: string) {
        this.jsonEditor.text = value;
    }
    public addPage() {
        var name = SurveyHelper.getNewPageName(this.survey.pages);
        var page = <Survey.Page>this.surveyValue.addNewPage(name);
        this.addPageToUI(page);
        this.setModified();
    }
    public getitemv(){
        alert("a");
    }

    public getLocString(str: string) { return editorLocalization.getString(str); }
    protected getQuestionTypes(): string[] {
        //根据defaultStrings.qt里的顺序进行显示
        var allTypes = new Array<string>();

        for(var key in defaultStrings.qt){
            allTypes.push(key);
        }

        //最开始的逻辑   现在要和defaultStrings.qt里的顺序一致
        //  var allTypes = Survey.QuestionFactory.Instance.getAllTypes();
        // //过滤问题控件，不显示问题控件
        // var glData = ["dropdown","matrix","matrixdropdown","rating"];
        // for(var i=0;i<glData.length;i++){
        //     var index = allTypes.indexOf(glData[i]);
        //     if(index>-1){
        //         //index位置开始，删除1个
        //         allTypes.splice(index,1);
        //     }
        // }
        // //问题控件排序
        // allTypes.sort(function(a:string,b:string){
        //     var cnNameA = editorLocalization.getString("qt."+a);
        //     var cnNameB = editorLocalization.getString("qt."+b);
        //     //localeCompare对字符串进行排序
        //     return cnNameA.localeCompare(cnNameB);
        // });
        if (!this.options || !this.options.questionTypes || !this.options.questionTypes.length) return allTypes;
        var result = [];
        for (var i = 0; i < this.options.questionTypes.length; i++) {
            var questionType = this.options.questionTypes[i];
            if (allTypes.indexOf(questionType) > -1) {
                result.push(questionType);
            }
        }
        return result;
    }
    private movePage(indexFrom: number, indexTo: number) {
        var page = <Survey.Page>this.survey.pages[indexFrom];
        this.survey.pages.splice(indexFrom, 1);
        this.survey.pages.splice(indexTo, 0, page);
        this.pagesEditor.survey = this.survey;
        this.surveyObjects.selectObject(page)
        this.setModified();
    }
    private addPageToUI(page: Survey.Page) {
        this.pagesEditor.survey = this.surveyValue;
        this.surveyObjects.addPage(page);
    }
    private onQuestionAdded(question: Survey.QuestionBase) {
        var page = <Survey.Page>this.survey.getPageByQuestion(question);
        question.titleFlag = "．";
        this.surveyObjects.addQuestion(page, question);
        this.survey.render();
    }
    private onQuestionRemoved(question: Survey.QuestionBase) {
        this.surveyObjects.removeObject(question);
        this.survey.render();
    }
    private onPropertyValueChanged(property: Survey.JsonObjectProperty, obj: any, newValue: any) {
        var isDefault = property.isDefaultValue(newValue);
        obj[property.name] = newValue;
        if (property.name == "name") {
            this.surveyObjects.nameChanged(obj);
            if (SurveyHelper.getObjectType(obj) == ObjType.Page) {
                this.pagesEditor.changeName(<Survey.Page>obj);
            }
        }
        this.setModified();
        this.survey.render();
    }
    private doUndoRedo(item: UndoRedoItem) {
        this.initSurvey(item.surveyJSON);
        if (item.selectedObjName) {
            var selObj = this.findObjByName(item.selectedObjName);
            if (selObj) {
                this.surveyObjects.selectObject(selObj);
            }
        }
        this.setState(this.undoRedo.koCanUndo() ? "modified" : "saved");
    }
    private findObjByName(name: string): Survey.Base {
        var page = this.survey.getPageByName(name);
        if (page) return page;
        var question = <Survey.QuestionBase>this.survey.getQuestionByName(name);
        if (question) return question;
        return null;
    }
    private canSwitchViewType(newType: string): boolean {
        if (newType && this.koViewType() == newType) return false;
        if (this.koViewType() != "editor") return true;
        if (!this.jsonEditor.isJsonCorrect) {
            alert(this.getLocString("ed.correctJSON"));
            return false;
        }
        this.initSurvey(new Survey.JsonObject().toJsonObject(this.jsonEditor.survey));
        return true;
    }
    private showDesigner() {
        if (!this.canSwitchViewType("designer")) return;
        this.koViewType("designer");
    }
    private showJsonEditor() {
        if (this.koViewType() == "editor") return;
        this.jsonEditor.show(this.getSurveyTextFromDesigner());
        this.koViewType("editor");
    }
    private showTestSurvey() {
        if (!this.canSwitchViewType(null)) return;
        this.showLiveSurvey();
        this.koViewType("test");
    }
    private putPublish(){		//发布表单模板
    	var pvalue = eval('(' +this.getSurveyTextFromJson()+ ')');
        //获得评估的id
        var sessionStorage = window.sessionStorage;
        var evaId;
        var savetype = "";//发布类型
        if(sessionStorage["template"] != undefined){
			 var evaFlag = eval('(' + sessionStorage["template"] + ')').evaFlag;
             savetype = JSON.parse(sessionStorage["template"]).savetype;
			 if(evaFlag == 0){//新建
				 evaId = eval('(' + sessionStorage["template"] + ')').evaId;
			 }else{//读取
				 evaId = eval('(' + sessionStorage["template"] + ')').id;
			 }
        }
        var ajson = {};
        var content = {};
        content["pages"] = pvalue.pages;
        ajson["content"] = content;
        ajson["id"] = evaId;
        var xmlhttp = new XMLHttpRequest();
        //判断当前保存类型是从那点击的 evaformEdit从图标进入的
        if(savetype=="evaformEdit"){
            xmlhttp.open("PUT", EditorUrl.publish_url+evaId, true);
        }
        //evaformpreVer从版本号进入的
        if(savetype=="evaformpreVer"){
            xmlhttp.open("PUT", EditorUrl.publish_evapreVer_url+evaId, true);
        }
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(JSON.stringify(ajson));
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
            	if(xmlhttp.status == 200){
            		var response = xmlhttp.response;
	                var msgdata = eval('(' + response + ')');
	                if (msgdata["code"] == 'emr10016') {
	                    console.log(msgdata["msg"]);
	                	alert("文档无内容，不可发布");
	                }else if(msgdata["code"] == 0){
	                	alert("发布成功！");
	                }else{
	                	alert("发布失败！");
	                }
	            }else if(xmlhttp.status != 200){
	            	alert("服务器故障，联系管理员！");
	            }
            }
        };
    }
    private showEmbedEditor() {
        if (!this.canSwitchViewType("embed")) return;
        this.showSurveyEmbeding();
        this.koViewType("embed");
    }
    //查看json和保存、发布用的
    private getSurveyTextFromJson() {
        var json = new Survey.JsonObject().toJsonObject(this.survey);
        if (this.options && this.options.generateValidJSON) return JSON.stringify(json, null, 1);
        var newValueObject = EditorUrl.customer_con; //读取配置文件定义的数据
        var pages = json.pages; //获取问卷的问题
        var pagesquestion=[] ; //接收问卷的问题
        //获取当前问卷的json
        for (var i = 0;i<pages.length;i++){
            if(pages[i].questions!=undefined){
                for(var j = 0;j<pages[i].questions.length;j++){
                    pagesquestion.push(pages[i].questions[j]);
                }
            }
        }
        //循环对比然后把json中referType的值改变
        if(pagesquestion.length>0){
            for (var qkey in pagesquestion){
                for(var nkey in newValueObject){
                    if(pagesquestion[qkey].referType==newValueObject[nkey].name){
                        pagesquestion[qkey].referType = newValueObject[nkey].code;
                    }
                }
            }
        }
        return new SurveyJSON5().stringify(json, null, 1);
    }

    private getSurveyTextFromDesigner() {
        var json = new Survey.JsonObject().toJsonObject(this.survey);
        if (this.options && this.options.generateValidJSON) return JSON.stringify(json, null, 1);
        return new SurveyJSON5().stringify(json, null, 1);
    }
    private selectedObjectChanged(obj: Survey.Base) {
        var canDeleteObject = false;
        this.selectedObjectEditor.selectedObject = obj;
        this.surveyVerbs.obj = obj;
        var objType = SurveyHelper.getObjectType(obj);
        if (objType == ObjType.Page) {
            this.survey.currentPage = <Survey.Page>obj;
            canDeleteObject = this.survey.pages.length > 1;
        }
        if (objType == ObjType.Question) { 
        	//设置标识，标识是左侧区域的点击，从而不用移动到视图区域
        	var scrollFlag = 0;      	
        	//传入点击后的函数
            this.survey["setselectedQuestion"](obj,scrollFlag);
            canDeleteObject = true;
            this.survey.currentPage = this.survey.getPageByQuestion(this.survey["selectedQuestionValue"]);
        } else {
            this.survey["setselectedQuestion"](null);
        }
        this.koCanDeleteObject(canDeleteObject);      
        
    }
    private applyBinding() {
        if (this.renderedElement == null) return;
        ko.cleanNode(this.renderedElement);
        ko.applyBindings(this, this.renderedElement);
        this.surveyjs = document.getElementById("surveyjs");
        if (this.surveyjs) {
            var self = this;
            this.surveyjs.onkeydown = function (e) {
                if (!e) return;
                if (e.keyCode == 46) self.deleteQuestion();
                if (e.keyCode == 38 || e.keyCode == 40) {
                    self.selectQuestion(e.keyCode == 38);
                }
            };
        }
        this.surveyjsExample = document.getElementById("surveyjsExample");

        this.initSurvey(new SurveyJSON5().parse(SurveyEditor.defaultNewSurveyText));
        this.setUndoRedoCurrentState(true);
        this.surveyValue.mode = "designer";
        if(this.surveyValue["setDesignMode"])this.surveyValue["setDesignMode"](true);
        this.surveyValue.render(this.surveyjs);

        this.jsonEditor.init();
    }
    private initSurvey(json: any) {

        var newValueObject = EditorUrl.customer_con; //读取配置文件定义的数据
        var pages = json.pages; //获取问卷的问题
        var pagesquestion=[] ; //接收问卷问题的数组
        //获取当前问卷的json
        for (var i = 0;i<pages.length;i++){
            if(pages[i].questions!=undefined){
                for(var j = 0;j<pages[i].questions.length;j++){
                    pagesquestion.push(pages[i].questions[j]);
                }
            }
        }
        //循环对比然后把json中referType的值改变
        if(pagesquestion.length>0){
            for (var qkey in pagesquestion){
                for(var nkey in newValueObject){
                    if(pagesquestion[qkey].referType==newValueObject[nkey].code){
                        pagesquestion[qkey].referType = newValueObject[nkey].name;
                    }
                }
            }
        }

    	//<--add by itw_biys 2017-01-19---start-->
    	/*
    	 * 添加这段代码起因:为了将创建评估的数据放置到json以及右侧属性区域中显示,优化,若是让他只是第一次走的话,可以走过之后往sessionStory中加一个属性
    	 */
    	//对json数据进行处理,增加评估创建的部分属性
        var evabttsf;
        var evafjbh;
        var evastbh;
        //var evaId;
        //对评估信息进行读取,优先从外层读取,外层没有在读取content中的评估信息
        var sess= eval('(' + sessionStorage["template"] + ')');
        //获得评估的id
        /*var evaFlag = sess.evaFlag;
    	 if(evaFlag == 0){//新建
    		 evaId = sess.evaId;
    	 }else{//读取
    		 evaId = sess.id;
    	 }*/
        evabttsf = sess.requiredText;
        evafjbh = sess.showQuestionNumbers;
        evastbh = sess.questionStartIndex;
        if(evabttsf == undefined && evafjbh == undefined && evastbh == undefined){
        	//针对第一次读取评估,并将评估信息放到sessionStorage中,保证sessionStorage中的评估信息是最新的,不影响页面的刷新
        	if(sess.content != undefined){
        		evabttsf = sess.content["requiredText"];
	        	evafjbh = sess.content["showQuestionNumbers"];
	        	evastbh = sess.content["questionStartIndex"];
	        	//属性放置sessionStorage(刚读取,原来没有放)
	        	sess.requiredText=evabttsf;
	        	sess.showQuestionNumbers=evafjbh;
	        	sess.questionStartIndex=evastbh;
	        	sessionStorage["template"]=JSON.stringify(sess);
        	}
        }
        //赋值
        json["requiredText"] = evabttsf;
        //json["surveyId"] = evaId;
        if (evafjbh == true || evafjbh == "onPage") {
            json["showQuestionNumbers"] = "onPage";
        } else if (evafjbh == false || evafjbh == "on") {
            json["showQuestionNumbers"] = "on";
        }
        if (evastbh == "A.B.C.D.") {
            json["questionStartIndex"] = "A";
        } else {
            json["questionStartIndex"] = evastbh;
        }
      //<--add by itw_biys 2017-01-19---end -->
        var self = this;
        this.surveyValue = new Survey.Survey();
        this.dragDropHelper = new DragDropHelper(<Survey.ISurvey>this.survey, function () { self.setModified() });
        this.surveyValue["dragDropHelper"] = this.dragDropHelper;
        this.surveyValue["setJsonObject"](json); //TODO
        if (this.surveyValue.isEmpty) {
            this.surveyValue = new Survey.Survey(new SurveyJSON5().parse(SurveyEditor.defaultNewSurveyText));
        }
        this.survey.mode = "designer";
        if(this.survey["setDesignMode"])this.survey["setDesignMode"](true);
        this.survey.render(this.surveyjs);
        this.surveyObjects.survey = this.survey;
        this.pagesEditor.survey = this.survey;
        this.pagesEditor.setSelectedPage(<Survey.Page>this.survey.currentPage);
        this.surveyVerbs.survey = this.survey;
        this.surveyValue["onSelectedQuestionChanged"].add((sender: Survey.Survey, options) => { self.surveyObjects.selectObject(sender["selectedQuestionValue"]); });
        this.surveyValue["onCopyQuestion"].add((sender: Survey.Survey, options) => { self.copyQuestion(self.koSelectedObject().value); });
        this.surveyValue["onSaveJson"].add((sender: Survey.Survey, options) => { self.getSaveJson(); });
        this.surveyValue["onFastCopyQuestion"].add((sender: Survey.Survey, options) => { self.fastCopyQuestion(self.koSelectedObject().value); });//复制问题
        this.surveyValue["onDeleteCurrentObject"].add((sender: Survey.Survey, options) => { self.deleteCurrentObject(); });
        this.surveyValue.onProcessHtml.add((sender: Survey.Survey, options) => { options.html = self.processHtml(options.html); });
        this.surveyValue.onCurrentPageChanged.add((sender: Survey.Survey, options) => { self.pagesEditor.setSelectedPage(<Survey.Page>sender.currentPage); });
        this.surveyValue.onQuestionAdded.add((sender: Survey.Survey, options) => { self.onQuestionAdded(options.question); });
        this.surveyValue.onQuestionRemoved.add((sender: Survey.Survey, options) => { self.onQuestionRemoved(options.question); });
    }
    private processHtml(html: string): string {
        if (!html) return html;
        var scriptRegEx = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
        while (scriptRegEx.test(html)) {
            html = html.replace(scriptRegEx, "");
        }
        return html;
    }
    private doDraggingQuestion(questionType: any, e) {
        if(questionType==="hr"){
            this.dragDropHelper.startDragNewQuestion(e, questionType, this.getNewQuestionTypeName(questionType));
        }else{
            this.dragDropHelper.startDragNewQuestion(e, questionType, this.getNewQuestionName());
        }
    }
    private doDraggingCopiedQuestion(json: any, e) {
        this.dragDropHelper.startDragCopiedQuestion(e, this.getNewQuestionName(), json);
    }
    private doClickQuestion(questionType: any) {
        if(questionType==="hr"){
            this.doClickQuestionCore(Survey.QuestionFactory.Instance.createQuestion(questionType,this.getNewQuestionTypeName(questionType)));
        }else{
            this.doClickQuestionCore(Survey.QuestionFactory.Instance.createQuestion(questionType, this.getNewQuestionName()));
        }
    }
    //复制问题实现
    private doClickCopiedQuestion(json: any) {
        var name = this.getNewQuestionName();
        var question = Survey.QuestionFactory.Instance.createQuestion(json["type"], name);
        new Survey.JsonObject().toObject(json, question);
        question.name = name;
        this.doClickQuestionCore(question);
    }
    private getNewQuestionTypeName(questionType): string {
        if(questionType==="hr"){
            return SurveyHelper.getNewQuestionTypeName(questionType,this.survey.getAllQuestions());
        }else{
            return SurveyHelper.getNewQuestionName(this.survey.getAllQuestions());
        }
    }
    private getNewQuestionName(): string {
        return SurveyHelper.getNewQuestionName(this.survey.getAllQuestions());
    }
    private doClickQuestionCore(question: Survey.QuestionBase) {
        //将问题添加到试卷
        var page = this.survey.currentPage;
        var index = -1;
        if (this.survey["selectedQuestionValue"] != null) {
            index = page.questions.indexOf(this.survey["selectedQuestionValue"]) + 1;
        }
        page.addQuestion(question, index);
        this.setModified();
    }
    private deleteQuestion() {
        var question = this.getSelectedObjAsQuestion();
        if (question) {
            this.deleteCurrentObject();
        }
    }
    private selectQuestion(isUp: boolean) {
        var question = this.getSelectedObjAsQuestion();
        if (question) {
            this.surveyObjects.selectNextQuestion(isUp)
        }
    }
    private getSelectedObjAsQuestion(): Survey.QuestionBase {
        var obj = this.koSelectedObject().value;
        if (!obj) return null;
        return SurveyHelper.getObjectType(obj) == ObjType.Question ? <Survey.QuestionBase>(obj): null;
    }
    private deleteCurrentObject() {
        this.deleteObject(this.koSelectedObject().value);
    }
    public copyQuestion(question: Survey.QuestionBase) {
        var objType = SurveyHelper.getObjectType(question);
        if (objType != ObjType.Question) return;
        var json = new Survey.JsonObject().toJsonObject(question);
        json.type = question.getType();
        var item = this.getCopiedQuestionByName(question.name);
        if (item) {
            item.json = json;
        } else {
            this.koCopiedQuestions.push({ name: question.name, json: json });
        }
        if (this.koCopiedQuestions().length > 3) {
            this.koCopiedQuestions.splice(0, 1);
        }
    }
    
    /*
     * create by itw_biys
     */
    public getSaveEditor(){//调用后台接口,保存数据
        var pvalue = eval('(' +this.getSurveyTextFromJson()+ ')');
        //获得评估的id
        var sessionStorage = window.sessionStorage;
        var evaId;
        var savetype = "";//保存类型
        if(sessionStorage["template"] != undefined){
         	 var evaFlag = eval('(' + sessionStorage["template"] + ')').evaFlag;
             savetype = JSON.parse(sessionStorage["template"]).savetype;
         	 if(evaFlag == 0){//新建
         		 evaId = eval('(' + sessionStorage["template"] + ')').evaId;
         	 }else{//读取
         		 evaId = eval('(' + sessionStorage["template"] + ')').id;
         	 }
         }else{
          	alert("无法获得新建评估编号!");
          	return;
         }
        var a = {};
        var content = {};
        content["pages"] = pvalue.pages;
        content["showQuestionNumbers"] = pvalue.showQuestionNumbers != undefined? pvalue.showQuestionNumbers:"off";
        content["requiredText"] = pvalue.requiredText !=undefined? pvalue.requiredText:"*";
        content["questionStartIndex"] = pvalue.questionStartIndex != undefined? pvalue.questionStartIndex:"1";
        a["content"] = content;
        a["id"] = evaId;
        var xmlhttp = new XMLHttpRequest();
        //判断当前保存类型是从那点击的 evaformEdit从图标进入的
        if(savetype=="evaformEdit"){
            xmlhttp.open("PUT", EditorUrl.save_url, true);
        }
        //evaformpreVer从版本号进入的
        if(savetype=="evaformpreVer"){
            xmlhttp.open("PUT", EditorUrl.save_evapreVer_url, true);
        }
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(JSON.stringify(a));
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
            	if(xmlhttp.status == 200){
            		var response = xmlhttp.response;
	                var msgdata = eval('(' + response + ')');
	                if (msgdata["code"] != 0) {
	                    console.log(msgdata["msg"]);
	                    alert(msgdata["msg"]);
	                }else{
	                	alert("保存成功!");
	                }
            	}else {
	                alert("更新失败!");
	            }
            }
        };
    }
    /*
     * create by itw_biys
     */
    public getSaveJson(){//调用后台接口,保存数据
        var pvalue = eval('(' +this.getSurveyTextFromJson()+ ')');
        //获得评估的id
        var sessionStorage = window.sessionStorage;
        var evaId;
        if(sessionStorage["template"] != undefined){
         	 var evaFlag = eval('(' + sessionStorage["template"] + ')').evaFlag;
         	 if(evaFlag == 0){//新建
         		 evaId = eval('(' + sessionStorage["template"] + ')').evaId;
         	 }else{//读取
         		 evaId = eval('(' + sessionStorage["template"] + ')').id;
         	 }
         }else{
          	alert("无法获得新建评估编号!");
          	return;
         }
        var a = {};
        var content = {};
        content["pages"] = pvalue.pages;
        content["showQuestionNumbers"] = pvalue.showQuestionNumbers != undefined? pvalue.showQuestionNumbers:"off";
        content["requiredText"] = pvalue.requiredText !=undefined? pvalue.requiredText:"*";
        content["questionStartIndex"] = pvalue.questionStartIndex != undefined? pvalue.questionStartIndex:"1";
        a["content"] = content;
        a["id"] = evaId;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("PUT", EditorUrl.save_url, true);
        xmlhttp.setRequestHeader("Content-Type", "application/json");
        xmlhttp.send(JSON.stringify(a));
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4) {
            	if(xmlhttp.status == 200){
            		var response = xmlhttp.response;
	                var msgdata = eval('(' + response + ')');
	                if (msgdata["code"] != 0) {
	                    console.log(msgdata["msg"]);
	                    alert(msgdata["msg"]);
	                }
            	}else {
	                alert("更新失败!");
	            }
            }
        };
    }

    public fastCopyQuestion(question: Survey.QuestionBase) {
        var json = new Survey.JsonObject().toJsonObject(question);
        //复制时改变questionId和选项value值  whr
        if(json["questionId"]) json["questionId"] = ""+new Date().getTime();
        if(json["choices"]!=undefined) {
            for(var i=0;i<json["choices"].length;i++){
                if(json["choices"][i]["value"]) json["choices"][i]["value"] = Math.random().toString(16);
            }
        }
        json.type = question.getType();
        this.doClickCopiedQuestion( json );
    }

    private getCopiedQuestionByName(name: string) {
        var items = this.koCopiedQuestions();
        for (var i = 0; i < items.length; i++) {
            if (items[i].name == name) return items[i];
        }
        return null;
    }
    private deleteObject(obj: any) {
        this.surveyObjects.removeObject(obj);
        var objType = SurveyHelper.getObjectType(obj);
        if (objType == ObjType.Page) {
            this.survey.removePage(obj);
            this.pagesEditor.removePage(obj);
            this.setModified();
        }
        if (objType == ObjType.Question) {
            this.survey.currentPage.removeQuestion(obj);
            this.survey["setselectedQuestion"](null);
            this.surveyObjects.selectObject(this.survey.currentPage);
            this.setModified();
        }
        this.survey.render();
    }
    private showLiveSurvey() {
        if (!this.surveyjsExample) return;
        var json = this.getSurveyJSON();
        if (json != null) {
            if (json.cookieName) {
                delete json.cookieName;
            }
            var survey = new Survey.Survey(json);
            var self = this;
            var surveyjsExampleResults = document.getElementById("surveyjsExampleResults");
            var surveyjsExamplereRun = document.getElementById("surveyjsExamplereRun");
            if (surveyjsExampleResults) surveyjsExampleResults.innerHTML = "";
            if (surveyjsExamplereRun) surveyjsExamplereRun.style.display = "none";
            survey.onComplete.add((sender: Survey.Survey) => { if (surveyjsExampleResults) surveyjsExampleResults.innerHTML = this.getLocString("ed.surveyResults") + JSON.stringify(survey.data); if (surveyjsExamplereRun) surveyjsExamplereRun.style.display = ""; });
            survey.render(this.surveyjsExample);
        } else {
            this.surveyjsExample.innerHTML = this.getLocString("ed.correctJSON");
        }
    }
    private showSurveyEmbeding() {
        var json = this.getSurveyJSON();
        this.surveyEmbeding.json = json;
        this.surveyEmbeding.surveyId = this.surveyId;
        this.surveyEmbeding.surveyPostId = this.surveyPostId;
        this.surveyEmbeding.generateValidJSON = this.options && this.options.generateValidJSON;
        this.surveyEmbeding.show();
    }
    private getSurveyJSON(): any {
        if (this.koIsShowDesigner()) return new Survey.JsonObject().toJsonObject(this.survey);
        if (this.jsonEditor.isJsonCorrect) return new Survey.JsonObject().toJsonObject(this.jsonEditor.survey);
        return null;
    }
    private createAnnotations(text: string, errors: any[]): AceAjax.Annotation[] {
        var annotations = new Array<AceAjax.Annotation>();
        for (var i = 0; i < errors.length; i++) {
            var error = errors[i];
            var annotation: AceAjax.Annotation = { row: error.position.start.row, column: error.position.start.column, text: error.text, type: "error" };
            annotations.push(annotation);
        }
        return annotations;
    }
}

Survey.Survey.cssType = "bootstrap";
new Survey.SurveyTemplateText().replaceText(templatePageHtml, "page");
new Survey.SurveyTemplateText().replaceText(templateQuestionHtml, "question");

Survey.Survey.prototype["onCreating"] = function () {
    this.selectedQuestionValue = null;
    this.onSelectedQuestionChanged = new Survey.Event<(sender: Survey.Survey, options: any) => any, any>();
    this.onCopyQuestion = new Survey.Event<(sender: Survey.Survey, options: any) => any, any>();
    this.onSaveJson = new Survey.Event<(sender: Survey.Survey, options: any) => any, any>();
    this.onFastCopyQuestion = new Survey.Event<(sender: Survey.Survey, options: any) => any, any>();
    this.onDeleteCurrentObject = new Survey.Event<(sender: Survey.Survey, options: any) => any, any>();
    var self = this;
    this.copyQuestionClick = function () { self.onCopyQuestion.fire(self); };
    this.fastCopyQuestionClick = function () { self.onFastCopyQuestion.fire(self); };
    this.deleteCurrentObjectClick = function () { self.onDeleteCurrentObject.fire(self); }
    this.koDraggingSource = ko.observable(null);
    this.saveJsonClick = function (){self.onSaveJson.fire(self);};

};
Survey.Survey.prototype["setselectedQuestion"] = function(value: Survey.QuestionBase,scrollFlag) {
    if (value == this.selectedQuestionValue) return;  
    var oldValue = this.selectedQuestionValue;
    this.selectedQuestionValue = value;
    if (oldValue != null) {
        oldValue["onSelectedQuestionChanged"]();
    }
    if (this.selectedQuestionValue != null) {
        this.selectedQuestionValue["onSelectedQuestionChanged"]();
    }
    this.onSelectedQuestionChanged.fire(this, { 'oldSelectedQuestion': oldValue, 'newSelectedQuestion': value });
    //根据传入的滚动标示让当前选中的问题进入视图zyg
    if(scrollFlag == 0){
	    	var objId = value["idValue"];                        //获取对象中问题ID
            var elId = document.getElementById(objId);			 //根据ID获取DOM对象							
            if (!elId || !elId.scrollIntoView) return false;     //如果没有ID或者不支持scrollIntoView这个API，就停止
            var elemIdTop = elId.getBoundingClientRect().top;	 //得到相对视图的位置	
            if (elemIdTop != 0) elId.scrollIntoView();			 //	scrollIntoView()默认参数是true在顶端
	    }   
};
Survey.Survey.prototype["getEditorLocString"] = function (value: string): string {
    return editorLocalization.getString(value);
};

Survey.Page.prototype["onCreating"] = function () {
    var self = this;
    this.dragEnterCounter = 0;
    this.koDragging = ko.observable(-1);
    this.koDraggingQuestion = ko.observable(null);
    this.koDraggingBottom = ko.observable(false);
    this.koDragging.subscribe(function (newValue) {
        if (newValue < 0) {
            self.dragEnterCounter = 0;
            self.koDraggingQuestion(null);
            self.koDraggingBottom(false);
        }
        else {
            var question = newValue >= 0 && newValue < self.questions.length ? self.questions[newValue] : null;
            self.koDraggingQuestion(question);
            self.koDraggingBottom(newValue == self.questions.length);
        }
    });
    this.koDraggingQuestion.subscribe(function (newValue) { if (newValue) newValue.koIsDragging(true); });
    this.koDraggingQuestion.subscribe(function (oldValue) { if (oldValue) oldValue.koIsDragging(false); }, this, "beforeChange");
    this.dragEnter = function (e) { e.preventDefault(); self.dragEnterCounter++; self.doDragEnter(e); };
    this.dragLeave = function (e) { self.dragEnterCounter--; if (self.dragEnterCounter === 0) self.doDragLeave(e); };
    this.dragDrop = function (e) { self.doDrop(e); };
};
Survey.Page.prototype["doDrop"] = function (e) {
    var dragDropHelper = this.data["dragDropHelper"];
    if (dragDropHelper) {
        dragDropHelper.doDrop(e);
    }
};
Survey.Page.prototype["doDragEnter"] = function(e) {
    if (this.questions.length > 0 || this.koDragging() > 0) return;
    var dragDropHelper = this.data["dragDropHelper"];
    if (dragDropHelper && dragDropHelper.isSurveyDragging(e)) {
        this.koDragging(0);
    }
};
Survey.Page.prototype["doDragLeave"] = function (e) {
    var dragDropHelper = this.data["dragDropHelper"];
    if (dragDropHelper) {
        dragDropHelper.doLeavePage(e);
    }
};

Survey.QuestionBase.prototype["onCreating"] = function () {
    var self = this;
    this.dragDropHelperValue = null;
    this.koIsDragging = ko.observable(false);
    this.koIsDraggingSource = ko.observable(false);
    this.dragDropHelper = function () {
        if (self.dragDropHelperValue == null) {
            self.dragDropHelperValue = self.data["dragDropHelper"];
        }
        return self.dragDropHelperValue;
    };
    this.dragOver = function (e) { self.dragDropHelper().doDragDropOver(e, self); };
    this.dragDrop = function (e) { self.dragDropHelper().doDrop(e, self); };
    this.dragStart = function (e) { self.dragDropHelper().startDragQuestion(e, self.name); };
    this.dragEnd = function (e) { self.dragDropHelper().end(); };
    this.koIsSelected = ko.observable(false);
    this.koOnClick = function () {
        if (self.data == null) return;
        //标示，标识是右侧下拉点击
        var scrollFlag = 1;
            //传入函数
        self.data["setselectedQuestion"](this,scrollFlag);
    }
};

Survey.QuestionBase.prototype["onSelectedQuestionChanged"] = function() {
    if (this.data == null) return;
    this.koIsSelected(this.data["selectedQuestionValue"] == this);
};
