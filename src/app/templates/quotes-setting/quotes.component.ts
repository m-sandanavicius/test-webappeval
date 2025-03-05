import { Component, OnInit, Input, OnChanges, ViewChild } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { DataService } from "src/app/service/data.service";
import { CommonFunction } from "src/app/service/common-function.service";
import { LocalStorageService } from "angular-web-storage";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { QuotesService } from "src/app/service/quotes.service";
import { WidgetBgSettingComponent } from "../widget-bg-setting/widget-bg-setting.component";
import { WidgetDataService } from "src/app/service/widget-data.service";

@Component({
  selector: "app-quote-setting",
  templateUrl: "./quotes.component.html",
  styleUrls: ["./quotes.component.scss"]
})
export class QuotesComponent implements OnInit, OnChanges {
  @ViewChild(WidgetBgSettingComponent, { static: false })
  widgetBgSettingComponent: WidgetBgSettingComponent;

  @Input() quoteSettingModal: any;
  @Input() category: string;
  @Input() activeLayout: any;
  @Input() quotesWidgetObject: any;

  quotesCategoryList: Array<any>;
  selectedQuotesCategoryList = [5];
  lastSelectedQuotesCategoryList = [];
  selectedQuotesLength = 2;
  lastSelectedQuotesLength = 2;
  activeMirrorDetail: any;
  private widgetSettings = [];
  quotesWidget: any;
  settingDisplayflag: any;
  activeMirrorDetails: any;

  //background widget setting
  widgetType: any;
  widgetBgSetting: any;
  newBgSetting: any;
  widgetLayoutDetails: any;

  constructor(
    private toastr: ToastrService,
    private _dataService: DataService,
    private _quotesService: QuotesService,
    private commonFunction: CommonFunction,
    private storage: LocalStorageService,
    private loadingSpinner: Ng4LoadingSpinnerService,
    private widgetDataService: WidgetDataService
  ) {}

  ngOnInit() {}

  ngOnChanges(changes: any): void {
    if (
      changes.quotesWidgetObject != null &&
      changes.quotesWidgetObject.currentValue != undefined
    ) {
      this._dataService
        .getActiveMirrorDetails()
        .subscribe((data) => (this.activeMirrorDetail = data));
      this._dataService.getWidgetSettingsLayout().subscribe((data) => {
        this.widgetLayoutDetails = data;
        this.widgetSettings = data.widgetSetting;
        this.quotesCategoryList = data.quotesDetails.quotesCategory;
        // this.quotesLengthList = data.quotesDetails.quotesLength;
      });

      this.setBackgroundWidgetDetail();
      this.activeMirrorDetails = this.storage.get("activeMirrorDetails");
      this.quotesWidget = this.quotesWidgetObject;
      this.selectedQuotesCategoryList = [
        ...this.quotesWidget.data.selectedQuoteCategories
      ];

      this.widgetDataService.widgetFormState[
        this.category
      ].settings.initialValue["selectedQuotesCategoryList"] = [
        ...this.quotesWidget.data.selectedQuoteCategories
      ];

      this.lastSelectedQuotesCategoryList = [
        ...this.quotesWidget.data.selectedQuoteCategories
      ];
      // this.selectedQuotesLength = this.quotesWidget.data.selectedQuoteLength;
      // this.lastSelectedQuotesLength =
      //   this.quotesWidget.data.selectedQuoteLength;
    }
  }

  setBackgroundWidgetDetail(): void {
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

  updateQuotesLength(updatedLength): void {
    this.selectedQuotesLength = updatedLength.id;
  }

  updateCategory(quoteId): void {
    if (this.selectedQuotesCategoryList != undefined) {
      let ifExist = this.checkCategoryExist(quoteId);
      if (ifExist) {
        this.selectedQuotesCategoryList.splice(
          this.selectedQuotesCategoryList.indexOf(quoteId),
          1
        );
      } else {
        this.selectedQuotesCategoryList.push(quoteId);
      }
    }
  }

  checkCategoryExist(quoteId): boolean {
    let isExist: boolean = false;
    if (this.selectedQuotesCategoryList.length > 0) {
      this.selectedQuotesCategoryList.forEach((category) => {
        if (category === quoteId) {
          isExist = true;
        }
      });
    }
    return isExist;
  }

  getSelectedQuotesCategories() {
    let selectedQuotesCategories = [];

    if (this.selectedQuotesCategoryList.length == 0) {
      this.updateCategory("inspiration");
    }

    this.selectedQuotesCategoryList.forEach((categoryId) => {
      selectedQuotesCategories.push({ categoryType: categoryId });
    });

    return selectedQuotesCategories;
  }

  isChangeFound(): boolean {
    this.selectedQuotesCategoryList.sort((a, b) => b - a);
    let lastSelectedQuotesCategory = this.storage.get(
      "lastSelectedQuotesCategoryList"
    );
    if (lastSelectedQuotesCategory === null) {
      this.lastSelectedQuotesCategoryList = [5];
    } else {
      lastSelectedQuotesCategory.sort((a, b) => b - a);
    }

    if (
      JSON.stringify(this.selectedQuotesCategoryList) !=
        JSON.stringify(lastSelectedQuotesCategory) ||
      this.selectedQuotesLength != this.lastSelectedQuotesLength
    ) {
      return true;
    } else return false;
  }

  save(): void {
    // Checks if need to save settings form
    const settingsForm =
      this.widgetDataService.widgetFormState[this.category].settings;
    const initialQuotes =
      settingsForm.initialValue["selectedQuotesCategoryList"];

    const initialQuotesSet = new Set(initialQuotes);
    const currentQuotesSet = new Set(this.selectedQuotesCategoryList);
    const isSameQuotes =
      initialQuotesSet.size === currentQuotesSet.size &&
      initialQuotes.every((quote) => currentQuotesSet.has(quote));

    if (!isSameQuotes) {
      this.saveQuotesSetting();
      settingsForm.initialValue["selectedQuotesCategoryList"] = [
        ...this.selectedQuotesCategoryList
      ];
    }

    // Checks if need to save format form
    const formatForm =
      this.widgetDataService.widgetFormState[this.category].format;

    const isFormatFormChanged = this.widgetDataService.isFormValueChanged(
      formatForm.initialValue,
      this.widgetBgSettingComponent.bgSettingOptions
    );

    if (isFormatFormChanged) {
      this.saveBackgroundSettings(
        this.widgetBgSettingComponent.bgSettingOptions
      );
      formatForm.initialValue = this.widgetBgSettingComponent.bgSettingOptions;
    }

    this.quoteSettingModal.hide();
  }

  saveQuotesSetting(): void {
    let payload = {
      quotesCategories: this.getSelectedQuotesCategories(),
      widgetSetting: {
        id: this.quotesWidgetObject.widgetSettingId
      }
    };

    this.loadingSpinner.show();
    this._quotesService.updateQuotesSetting(payload).subscribe(
      (res: any) => {
        this.loadingSpinner.hide();
        this.toastr.success(res.message, "Success");
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId ===
              this.quotesWidgetObject.widgetSettingId
            ) {
              element.data = res.object;
            }
          });
        });
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.quoteSettingModal.hide();
      },
      (err: any) => {
        this.loadingSpinner.hide();
        this.toastr.error(err.error.message, "Error");
      }
    );
  }

  saveBackgroundSettings(event): void {
    this.newBgSetting = event;
    const quotesBgPayload = {
      userMirrorId: this.activeMirrorDetails.id,
      mastercategory: [this.quotesWidget.widgetMasterCategory],
      widgetBackgroundSettingModel: this.newBgSetting
    };
    this.commonFunction.updateWidgetSettings(
      this.newBgSetting,
      quotesBgPayload
    );

    this.quoteSettingModal.hide();
  }

  dismissModel(): void {
    this.quotesWidget = this.quotesWidgetObject;
    this.selectedQuotesCategoryList = this.lastSelectedQuotesCategoryList;
    this.selectedQuotesLength = this.lastSelectedQuotesLength;
    this.quoteSettingModal.hide();
  }
}
