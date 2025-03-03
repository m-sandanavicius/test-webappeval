import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { WidgetService } from "src/app/service/widget.service";
import { DataService } from "src/app/service/data.service";
import { CommonFunction } from "src/app/service/common-function.service";
import {
  LayoutRequest,
  WidgetBackgroundSetting
} from "src/app/util/static-data";
import { LocalStorageService } from "angular-web-storage";
import { WidgetDataService } from "src/app/service/widget-data.service";
import { WidgetBgSettingComponent } from "../widget-bg-setting/widget-bg-setting.component";

@Component({
  selector: "app-news-setting",
  templateUrl: "./news-setting.component.html",
  styleUrls: ["./news-setting.component.scss"]
})
export class NewsSettingComponent implements OnInit {
  @ViewChild(WidgetBgSettingComponent, { static: false })
  widgetBgSettingComponent: WidgetBgSettingComponent;

  @Input() newsSettingModal: any;
  @Input() category: string;
  @Input() activeLayout: any;
  @Input() newsChangeDetector: any;
  @Output() updateWidgetStatusEventEmiter = new EventEmitter();
  @Output() updateNewsCountEventEmiter = new EventEmitter<number>();

  newsCategoryList: any;
  activeMirrorDetail: any;
  widgetData = null;
  selectedNewsWidgets = [];
  headlineCountList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  selectedHeadLineCount: number = 5;
  backupNewsPerIteration: number;
  newsWidget: any;
  settingDisplayflag: any;
  activeMirrorDetails: any;
  skeepedList = [
    "cnbc",
    "daily-mail",
    "independent",
    "metro",
    "mirror",
    "the-economist",
    "the-guardian-au",
    "the-guardian-uk",
    "the-new-york-times",
    "the-telegraph",
    "wirtschafts-woche"
  ];

  //background widget setting
  widgetType: any;
  widgetBgSetting: any;
  newBgSetting: any;

  constructor(
    private toastr: ToastrService,
    private _widgetService: WidgetService,
    private _dataService: DataService,
    private commonFunction: CommonFunction,
    private layoutRequest: LayoutRequest,
    private storage: LocalStorageService,
    private widgetDataService: WidgetDataService
  ) {}

  ngOnInit() {}

  ngOnChanges(changes) {
    if (
      (changes.category && changes.category.currentValue === "news") ||
      (changes.newsChangeDetector != null &&
        changes.newsChangeDetector.currentValue != undefined)
    ) {
      this.setBackgroundWidgetDetail();
      this._dataService.getWidgetSettingsLayout().subscribe((data) => {
        this.selectedNewsWidgets = [];
        this.widgetData = data.widgetSetting;
        this.selectedHeadLineCount = data.newsCountPerIteration;
        this.backupNewsPerIteration = data.newsCountPerIteration;
        this.newsCategoryList = data.newsSourceList.filter(
          (d) => !this.skeepedList.includes(d.type)
        );
        this.createSelectedItemsArray(this.widgetData, this.newsCategoryList);
      });
    }
  }

  setBackgroundWidgetDetail() {
    this.widgetType = this.category;
    let widgetData = this.storage.get("selectedwidget");
    if (widgetData != null) {
      this.widgetBgSetting = widgetData.widgetBackgroundSettingModel;

      this.widgetDataService.widgetFormState[
        this.category
      ].format.initialValue = {
        ...this.widgetBgSetting
      };
    }
    this.activeMirrorDetails = this.storage.get("activeMirrorDetails");
  }

  setHeadLineCount(headlineCount: any) {
    this.selectedHeadLineCount = headlineCount;
  }

  createSelectedItemsArray(widgetPageList: any, newsCategoryList: any) {
    widgetPageList.forEach((widgetPageData) => {
      widgetPageData.widgets.forEach((element) => {
        if (element.widgetMasterCategory === "News") {
          this.newsWidget = element;
          this.activeMirrorDetails = this.storage.get("activeMirrorDetails");
          this.setDisplayflag();
        }
        if (
          element.widgetMasterCategory === "News" &&
          element.status === "on"
        ) {
          this.selectedNewsWidgets.push(element.contentId);
        }
      });
    });

    this.widgetDataService.widgetFormState[this.category].settings.initialValue[
      "initialSelectedNewsWidgets"
    ] = [...this.selectedNewsWidgets];
    console.log(
      this.widgetDataService.widgetFormState[this.category].settings
        .initialValue
    );

    newsCategoryList.forEach((element) => {
      if (this.selectedNewsWidgets.includes(element.id)) {
        element["status"] = "on";
      } else {
        element["status"] = "off";
      }
    });
    this.newsCategoryList = newsCategoryList;
    this.storage.set("selectedNewsWidgetId", this.selectedNewsWidgets);
  }

  customFindIndex(widgetsArray: any, contentId: any) {
    for (let i = 0; i < widgetsArray.length; i++) {
      let widgetIndex = widgetsArray[i].widgets.findIndex(
        (element) => element.contentId === contentId
      );
      if (widgetIndex !== -1) {
        return { pageIndex: i, widgetIndex: widgetIndex };
      }
    }
  }

  changeNewsSetting(category: any, index: any) {
    let selectedIndex = this.customFindIndex(this.widgetData, category.id);
    let categoryIndex = this.newsCategoryList.findIndex(
      (element) => element.id === category.id
    );
    if (category.status === "off") {
      /** Local displaying object changes. */
      this.newsCategoryList[categoryIndex].status = "on";
      this.selectedNewsWidgets.push(category.id);
      /** Data service object changes. */
      this.widgetData[0].widgets[selectedIndex.widgetIndex].status = "on";
      this.widgetData[this.activeLayout].widgets.push(
        this.widgetData[0].widgets[selectedIndex.widgetIndex]
      );
      this.widgetData[0].widgets.splice(selectedIndex.widgetIndex, 1);
    } else if (category.status === "on") {
      /** Local displaying object changes. */
      this.newsCategoryList[categoryIndex].status = "off";
      this.selectedNewsWidgets.splice(
        this.selectedNewsWidgets.indexOf(category.id),
        1
      );
      /** Data service object changes. */
      this.widgetData[selectedIndex.pageIndex].widgets[
        selectedIndex.widgetIndex
      ].status = "off";
      this.widgetData[0].widgets.push(
        this.widgetData[selectedIndex.pageIndex].widgets[
          selectedIndex.widgetIndex
        ]
      );
      this.widgetData[selectedIndex.pageIndex].widgets.splice(
        selectedIndex.widgetIndex,
        1
      );
    }
  }

  isChangeFound() {
    let oldSelectedObject = this.storage.get("selectedNewsWidgetId");
    this.selectedNewsWidgets.sort();
    if (
      JSON.stringify(oldSelectedObject.sort()) !==
      JSON.stringify(this.selectedNewsWidgets)
    ) {
      return true;
    } else {
      return false;
    }
  }

  setDisplayflag() {
    this.settingDisplayflag = true;
  }

  save(): void {
    // Checks if need to save settings form
    const settingsForm =
      this.widgetDataService.widgetFormState[this.category].settings;
    const initialNewsIds =
      settingsForm.initialValue["initialSelectedNewsWidgets"];

    const initialNewsIdsSet = new Set(initialNewsIds);
    const currentNewsIdSet = new Set(this.selectedNewsWidgets);
    const isSameNews =
      initialNewsIdsSet.size === currentNewsIdSet.size &&
      initialNewsIds.every((quote) => currentNewsIdSet.has(quote));

    console.log(isSameNews);

    if (!isSameNews) {
      console.log("saving settings...");
      this.saveNewsSettings();
    }

    // Checks if need to save format form
    const formatForm =
      this.widgetDataService.widgetFormState[this.category].format;

    const isFormatFormChanged = this.widgetDataService.isFormValueChanged(
      formatForm.initialValue,
      this.widgetBgSettingComponent.bgSettingOptions
    );

    if (isFormatFormChanged) {
      console.log("saving format");
      this.saveBackgroundSettings(
        this.widgetBgSettingComponent.bgSettingOptions
      );
      formatForm.initialValue = this.widgetBgSettingComponent.bgSettingOptions;
    }

    // this.newsSettingModal.hide();
  }

  saveNewsSettings(): void {
    this._dataService
      .getActiveMirrorDetails()
      .subscribe((data) => (this.activeMirrorDetail = data));
    console.log(this.activeMirrorDetail);
    console.log(this.selectedHeadLineCount);
    this.updateNewsCountEventEmiter.emit(this.selectedHeadLineCount);
    this.updateWidgetStatusEventEmiter.emit();
    // this.newsSettingModal.hide();
  }

  saveBackgroundSettings(event): void {
    this.newBgSetting = event;
    const newsBgPayload = {
      userMirrorId: this.activeMirrorDetails.id,
      mastercategory: [this.newsWidget.widgetMasterCategory],
      widgetBackgroundSettingModel: this.newBgSetting
    };
    this.commonFunction.updateWidgetSettings(this.newBgSetting, newsBgPayload);
    // this.newsSettingModal.hide();
  }

  dismissModel() {
    // this.newsSettingModal.hide();
  }
}
