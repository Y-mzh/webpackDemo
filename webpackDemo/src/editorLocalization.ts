export var editorLocalization = {
    currentLocale: "",
    locales: {},
    getString: function (strName: string, locale: string = null) {
        if (!locale) locale = this.currentLocale;
        var loc = locale ? this.locales[this.currentLocale] : defaultStrings;
        if (!loc) loc = defaultStrings;
        var path = strName.split('.');
        var obj = loc;
        for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]];
            if (!obj) {
                if (loc === defaultStrings) return path[i]=="newQuestionName"?"":path[i];
                return this.getString(strName, "en");
            }
        }
        return obj;
    },
    getPropertyName: function (strName: string, local: string = null) {
        var obj = this.getProperty(strName, local);
        if (obj["name"]) return obj["name"];
        return obj;
    },
    getPropertyTitle: function (strName: string, local: string = null) {
        var obj = this.getProperty(strName, local);
        if (obj["title"]) return obj["title"];
        return "";
    },
    getProperty: function (strName: string, local: string = null) {
        var obj = this.getString("p." + strName, local);
        if (obj !== strName) return obj;
        var pos = strName.indexOf('_');
        if (pos < -1) return obj;
        strName = strName.substr(pos + 1);
        return this.getString("p." + strName, local);
    },
    getLocales: function (): Array<string> {
        var res = [];
        res.push("");
        for (var key in this.locales) {
            res.push(key);
        }
        return res;
    }
};

export var defaultStrings = {
    //survey templates
    survey: {
        dropQuestion: "请在这里添加试题控件.",
        copy: "Copy",
        addToToolbox: "Add to toolbox"
    },
    cn:{
        isRequired:"是否必填",
        questionStartIndex:"问题编号",
        totalScore:"总分",
        requiredText:"必填提示字符",
        showNavigationButtons:"是否显示导航按钮",
        showPageNumbers:"是否显示问卷页码",
        showQuestionNumbers:"是否将答案分卷编号",
        surveyId:"评估ID",
        triggers:"逻辑设置",
        name:"名称",
        choices:"选项",
        choicesByUrl:"引用选项",
        choicesOrder:"选项排序",
		hasOther:"其它",
		otherText:"其它显示文本",
		colCount:"每行选项数",
		required:"是否必填",
		validators:"校验规则",
		rows:"行数",
		inputType:"输入类型",
		text:"显示文字",
		width:"宽度",
        questionId:"ID",
        items:"输入项目",
        itemSize:"输入项目长度",
        addRowText:"添加按钮文本",
        cellType:"单元类型",
        columnColCount:"每列选项数",
        columnMinWidth:"每列最小宽度",
        columns:"列",
        horizontalScroll:"是否有滚动条",
        minRowCount:"最小行数",
        removeRowText:"删除按钮文本",
        rowCount:"行数",
        referType:"引用类型",
        referKey:"引用字段"
    },
    //questionTypes
    qt: {

        text: "输入框",
        checkbox: "多选",
        radiogroup: "单选",
        hasnotradiogroup:"有无单选",
        whetherradiogroup:"是否单选",
         comment: "注释文本",
         hr:"分割线",

       /* dropdown: "下拉",*/


       /* file: "File",
        html: "Html",
        matrix: "Matrix (single choice)",
        matrixdropdown: "Matrix (multiple choice)",
        matrixdynamic: "Matrix (dynamic rows)",*/
        multipletext: "多输入框",
        matrixdynamic:"动态输入框"
       
       /* rating: "Rating",*/
        
       
        
        
    },
    //Strings in Editor
    ed: {
        newPageName: "试卷",
        newQuestionName: "新建问题",
        newQuerstionHrName:"分割线",
        designer: "设置",
        testSurvey: "预览",
        testSurveyAgain: "Test Survey Again",
        testSurveyWidth: "Survey width: ",
        embedSurvey: "Embed Survey",
        saveSurvey: "Save Survey",
        jsonEditor: "JSON Editor",
        undo: "Undo",
        redo: "Redo",
        options: "Options",
        generateValidJSON: "Generate Valid JSON",
        generateReadableJSON: "Generate Readable JSON",
        toolbox: "Toolbox",
        delSelObject: "Delete selected object",
        correctJSON: "Please correct JSON.",
        surveyResults: "Survey Result: "
    },
    //Property Editors
    pe: {
        apply: "应用",
        reset: "重置",
        close: "关闭",
        delete: "删除",
        addNew: "新增",
        removeAll: "删除全部",
        edit: "Edit",
        empty: "<empty>",
        testService: "Test the service",

        value: "选项编号",
        text: "选项值",
        score:"分数",
        isscore:"不计分",
        istk:"填空",
        required: "Required?",
        hasOther: "Has Other Item",
        name: "Name",
        title: "Title",
        cellType: "Cell Type",
        colCount: "Column Count",

        editProperty: "Edit property '{0}'",
        items: "[ Items: {0} ]",

        enterNewValue: "Please, enter the value.",
        noquestions: "There is no any question in the survey.",
        createtrigger: "Please create a trigger",
        triggerOn: "On ",
        triggerMakePagesVisible: "Make pages visible:",
        triggerMakeQuestionsVisible: "Make questions visible:",
        triggerCompleteText: "Complete the survey if succeed.",
        triggerNotSet: "The trigger is not set",
        triggerRunIf: "Run if",
        triggerSetToName: "Change value of: ",
        triggerSetValue: "to: ",
        triggerIsVariable: "Do not put the variable into the survey result.",
        verbChangeType: "更改试题类型为",
        verbChangePage: "移动试卷到",
        fastEntry: "批量编辑",
        formEntry: "选项编辑"
    },
    //Operators
    op: {
        empty: "is empty",
        notempty: "is not empty",
        equal: "equals",
        notequal: "not equals",
        contains: "contains",
        notcontains: "not contains",
        greater: "greater",
        less: "less",
        greaterorequal: "greater or equals",
        lessorequal: "Less or Equals"
    },
    //Embed window
    ew: {
        knockout: "Use Knockout version",
        react: "Use React version",
        bootstrap: "For bootstrap framework",
        standard: "No bootstrap",
        showOnPage: "Show survey on a page",
        showInWindow: "Show survey in a window",
        loadFromServer: "Load Survey JSON from server",
        titleScript: "Scripts and styles",
        titleHtml: "HTML",
        titleJavaScript: "JavaScript"
    },
    //Properties
    p: {
        name: "name",
        title: { name: "title", title: "Leave it empty, if it is the same as 'Name'" },
        survey_title: { name: "title", title: "It will be shown on every page." },
        page_title: { name: "title", title: "Page title" }
    }
};

editorLocalization.locales["en"] = defaultStrings;