import {SurveyObjectProperty} from "./objectProperty";
import {editorLocalization,defaultStrings} from "./editorLocalization";
import {EditorUrl} from "./config";
import * as Survey from "survey-knockout";

export class SurveyObjectEditor {
    private selectedObjectValue: any;
    public propertyEditorOptions: any = null;
    public koProperties: any;
    public koActiveProperty: any;
    public koHasObject: any;
    public onPropertyValueChanged: Survey.Event<(sender: SurveyObjectEditor, options: any) => any, any> = new Survey.Event<(sender: SurveyObjectEditor, options: any) => any, any>();
    public onCanShowPropertyCallback: (object: any, property: Survey.JsonObjectProperty) => boolean;


    constructor(propertyEditorOptions: any = null) {
        this.setOptions(propertyEditorOptions);
        this.koProperties = ko.observableArray();
        this.koActiveProperty = ko.observable();
        this.koHasObject = ko.observable();
    }


    public get selectedObject(): any { return this.selectedObjectValue; }
    public set selectedObject(value: any) {
        if (this.selectedObjectValue == value) return;
        this.koHasObject(value != null);
        this.selectedObjectValue = value;
        this.updateProperties();
        this.updatePropertiesObject();
    }
    public setOptions(propertyEditorOptions: any) {
        this.propertyEditorOptions = propertyEditorOptions;
    }
    public getPropertyEditor(name: string) {
        var properties = this.koProperties();
        for (var i = 0; i < properties.length; i++) {
            if (properties[i].name == name) return properties[i];
        }
        return null;
    }
    public changeActiveProperty(property: SurveyObjectProperty) {
        this.koActiveProperty(property);
    }
    public ObjectChanged() {
        this.updatePropertiesObject();
    }
    public updateProperties() {
        if (!this.selectedObject || !this.selectedObject.getType) {
            this.koProperties([]);
            this.koActiveProperty(null);
            return;
        }
        var properties = Survey.JsonObject.metaData.getProperties(this.selectedObject.getType());
        properties.sort((a, b) => {
            if (a.name == b.name) return 0;
            if (a.name > b.name) return 1;
            return -1;
        });
        var objectProperties = [];
        var self = this;
        var propEvent = (property: SurveyObjectProperty, newValue: any) => {
            var properties = Survey.JsonObject.metaData.getProperties(this.selectedObject.getType());
            for (var i = 0; i < properties.length; i++) {
                if (!this.canShowProperty(properties[i])) continue;
                var objectProperty = new SurveyObjectProperty(properties[i], propEvent, this.propertyEditorOptions);
                var locName = this.selectedObject.getType() + '_' + properties[i].name;
                objectProperty.displayName = editorLocalization.getPropertyName(locName);
                var title = editorLocalization.getPropertyTitle(locName);
                if (!title) title = objectProperty.displayName;
                objectProperty.title = title;
                //匹配数组中是否包含newValue字符串
                if (EditorUrl.refrtker_arry.toString().indexOf(newValue) > -1 && properties[i].name == "referKey") {
                        objectProperty.choices = EditorUrl.refer_Key;
                        for (var j = 0; j < objectProperties.length; j++) {
                            if (objectProperties[j].name == "referKey") {
                                objectProperty.object = objectProperties[j].object;
                                objectProperties.splice(j, 1, objectProperty);
                                //objectProperties.push(objectProperty);
                            }
                        }
                }
              /* if(newValue==EditorUrl.refrtker_value && properties[i].name == "referKey"){
                    objectProperty.choices = [];
                    for (var j = 0; j < objectProperties.length; j++) {
                        if (objectProperties[j].name == "referKey") {
                            objectProperty.object = objectProperties[j].object;
                            objectProperties.splice(j, 1, objectProperty);
                            //objectProperties.push(objectProperty);
                        }
                    }
                }*/

            }
                this.koProperties(objectProperties);
                this.koActiveProperty(this.getPropertyEditor("name"));

            self.onPropertyValueChanged.fire(this, { property: property.property, object: property.object, newValue: newValue });
        };
        for (var i = 0; i < properties.length; i++) {
            if (!this.canShowProperty(properties[i])) continue;
            var objectProperty = new SurveyObjectProperty(properties[i], propEvent, this.propertyEditorOptions);
            var locName = this.selectedObject.getType() + '_' + properties[i].name;
            objectProperty.displayName = editorLocalization.getPropertyName(locName);
            var title = editorLocalization.getPropertyTitle(locName);
            if (!title) title = objectProperty.displayName;
            objectProperty.title = title;
            if(objectProperty.name=="referKey" && this.selectedObject.referKey==undefined){
                objectProperty.choices=EditorUrl.refrtker_value;
            }
            objectProperties.push(objectProperty);
        }
        this.koProperties(objectProperties);
        this.koActiveProperty(this.getPropertyEditor("name"));
    }
    protected canShowProperty(property: Survey.JsonObjectProperty): boolean {
        var name = property.name;
        //过滤问题属性
        var contshowproperties =["questionId","promptMessage","score","totalScore","isScore","isTk","tkText","clearInvisibleValues","completeText","completedHtml","cookieName","goNextPageAutomatic","locale","pageNextText","pagePrevText","questionTitleLocation","questionTitleTemplate","sendResultOnPageNext","showPageTitles","showProgressBar","showTitle","storeOthersAsComment","surveyPostId","title","visible","visibleIf","commentText","hasComment","indent","otherErrorText","startWithNewLine","hr","cols","size","optionsCaption","mode"];
        if(contshowproperties.indexOf(name)>=0) return false;
        if (name == 'questions' || name == 'pages') return false;
        if (this.onCanShowPropertyCallback) return this.onCanShowPropertyCallback(this.selectedObject, property);
        return true;
    }
    protected updatePropertiesObject() {
        var properties = this.koProperties();
        for (var i = 0; i < properties.length; i++) {
            properties[i].object = this.selectedObject;
        }
    }
}