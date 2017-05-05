import * as ko from "knockout";
import {SurveyPropertyItemsEditor} from "./propertyItemsEditor";
import {SurveyPropertyEditorBase} from "./propertyEditorBase";
import * as Survey from "survey-knockout";

export class SurveyPropertyItemValuesEditor extends SurveyPropertyItemsEditor {
    koActiveView: any;
    koItemsText: any;
    changeToTextViewClick: any;
    changeToFormViewClick: any;
    constructor() {
        super();
        /** 批量编辑功能  开始
         * create by itw_mazh
         */
        var self = this;
        this.koActiveView = ko.observable("form");
        this.koItemsText = ko.observable("");
        this.koActiveView.subscribe(function (newValue) {
            if (newValue == "form") self.updateItems(self.koItemsText());
            else self.koItemsText(self.getItemsText());
        });
        this.changeToTextViewClick = function () { self.koActiveView("text"); };
        this.changeToFormViewClick = function () { self.koActiveView("form"); };
        /** 批量编辑功能  结束*/
    }
    public get editorType(): string { return "itemvalues"; }
    public hasError(): boolean {
        var result = false;
        for (var i = 0; i < this.koItems().length; i++) {
            var item = this.koItems()[i];
            item.koHasError(!item.koValue());
            result = result || item.koHasError();
        }
        return result;
    }
    protected createNewEditorItem(): any { return { koValue: ko.observable(), koText: ko.observable(), koScore:ko.observable("0"),koIsScore:ko.observable(false),koIsTk:ko.observable(false),koTkText:ko.observable(), koHasError: ko.observable(false) }; }
    protected createEditorItem(item: any) {
        var itemValue = item;
        var itemText = null;
        var itemScore = null;
        var itemIsScore = null;
        var itemIsTk = null;
        var itemtkText = null;
        if (item.value) {
            itemValue = item.value;
            itemText = item.text;
            itemScore = item.score;
            itemIsScore =item.isScore;
            itemIsTk = item.isTk;
            itemtkText = item.tkText;
        }
        return { koValue: ko.observable(itemValue), koText: ko.observable(itemText), koScore:ko.observable(itemScore),koIsScore:ko.observable(itemIsScore), koHasError: ko.observable(false),koIsTk:ko.observable(itemIsTk),koTkText:ko.observable(itemtkText) };
    }
    protected createItemFromEditorItem(editorItem: any) {
        var alwaySaveTextInPropertyEditors = this.options && this.options.alwaySaveTextInPropertyEditors;
        var text = editorItem.koText();
        if (!alwaySaveTextInPropertyEditors && editorItem.koText() == editorItem.koValue()) {
            text = null;
        }
        return { value: editorItem.koValue(), text: text,score:editorItem.koScore(),isScore:editorItem.koIsScore(),isTk:editorItem.koIsTk(),tkText:editorItem.koTkText() };
    }

    /**
     * 以下方法是实现选项批量编辑功能  开始
     * create by itw_mazh
     */

    protected onBeforeApply() {
        if (this.koActiveView() != "form") {
            this.updateItems(this.koItemsText());
        }
        super.onBeforeApply();
    }

    /**
     * 单个编辑功能
     * 从批量编辑那获取值放入到对应的文本框中
     * create by itw_mazh
     * @param text
     */
    protected updateItems(text: string) {
        var items = [];
        var item:any;
        if (text) {
            var texts = text.split("\n");
            for (var i = 0; i < texts.length; i++) {
                    if (!texts[i]) continue;
                    //判断当前值是否有|
                    var str: string = texts[i].toString();
                    var index = str.indexOf(Survey.ItemValue.Separator);
                    if (index > -1) {

                    } else {
                        //生成随机数
                        var itemV = Math.random().toString(16);
                        //把随机数和名称拼接一起
                        var iscore: string = "0";//设置分数为默认值0
                        var textsi = itemV += Survey.ItemValue.Separator + texts[i] + Survey.ItemValue.Separator + iscore;
                        texts[i] = textsi;
                    }
                    var valueItem = new Survey.ItemValue(texts[i]);
                    //判断选项编辑和批量编辑id是否
                        item = {
                            value: valueItem.value,
                            text: (valueItem.hasText ? valueItem.text : ""),
                            score: valueItem["score"],
                        };
                    items.push(item);
            }
        }
        this.koItems(this.getItemsFromValue(items));
    }

    /**
     * 批量编辑功能
     * 从文本框中获取所有值放入到批量编辑框中
     * create by itw_mazh
     * @returns {string}
     */
    protected getItemsText(): string {
        var texthiddem = [];//存放隐藏域的值
        var text = [];
        var items = this.koItems();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var itemText = item.koValue();
            if (this.isValueEmpty(item.koValue())){
                itemText = Math.random().toString(16);
            }
            if (item.koText()){
                itemText = item.koText()+Survey.ItemValue.Separator+item.koScore();
                text.push(itemText);
            }
        }
        return text.join("\n");
    }

    /**
     * 校验值是否为空
     * create by itw_mazh
     * @param val
     */
    protected isValueEmpty(val: any) {
        return !val;
    }

                                        /**实现选项批量编辑功能  结束*/

}

SurveyPropertyEditorBase.registerEditor("itemvalues", function (): SurveyPropertyEditorBase { return new SurveyPropertyItemValuesEditor(); });