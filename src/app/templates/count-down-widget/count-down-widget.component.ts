import { Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbDateStruct, NgbTimeStruct } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageService } from "angular-web-storage";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { ToastrService } from "ngx-toastr";
import { CommonFunction } from "src/app/service/common-function.service";
import { CountDownService } from "src/app/service/count-down.service";
import { DataService } from "src/app/service/data.service";
import { WidgetDataService } from "src/app/service/widget-data.service";
import { WidgetBgSettingComponent } from "../widget-bg-setting/widget-bg-setting.component";

@Component({
  selector: "app-count-down-widget",
  templateUrl: "./count-down-widget.component.html",
  styleUrls: ["./count-down-widget.component.scss"]
})
export class CountDownWidgetComponent implements OnInit, OnChanges {
  @ViewChild(WidgetBgSettingComponent, { static: false })
  widgetBgSettingComponent: WidgetBgSettingComponent;

  @Input() countDownWidget: any;
  @Input() countDownSettingModal: any;
  @Input() activeLayout: any;
  @Input() category: string;

  //background widget setting
  widgetType: any;
  widgetBgSetting: any;
  newBgSetting: any;
  activeMirrorDetail: any;
  widgetData = null;
  widgetSettings: any;
  widgetLayoutDetails: any;

  countDownFormGroup: FormGroup;
  subscriptionAvailable: false;
  bgsettingBackgroundImageOptions: any;
  countDownWidgetData: any;
  selectedDateTime: NgbDateStruct | NgbTimeStruct;

  currentDate: Date = new Date();
  futureDate: Date = new Date();

  constructor(
    private formBuilder: FormBuilder,
    private storage: LocalStorageService,
    private loadingSpinner: Ng4LoadingSpinnerService,
    private toastr: ToastrService,
    private _dataService: DataService,
    private commonFunction: CommonFunction,
    private _countDownService: CountDownService,
    private widgetDataService: WidgetDataService
  ) {}

  ngOnInit() {
    this.createBackgroundForm(this.countDownWidget);
  }

  ngOnChanges(changes: any) {
    if (
      changes.countDownWidget != null &&
      changes.countDownWidget.currentValue != undefined &&
      changes.countDownWidget.currentValue != null
    ) {
      this._dataService.getWidgetSettingsLayout().subscribe((data) => {
        this.widgetLayoutDetails = data;
        this.widgetSettings = data.widgetSetting;
        this.widgetBgSetting =
          changes.countDownWidget.currentValue.widgetBackgroundSettingModel;
        this.countDownWidget = changes.countDownWidget.currentValue;
      });
      this.initializeCountDownData(this.countDownWidget);
    }
  }

  initializeCountDownData(countDownWidget) {
    this.countDownWidgetData = countDownWidget.data.countDownWidget;
    this.createBackgroundForm(this.countDownWidgetData);
  }

  createBackgroundForm(countDownWidget: any) {
    this.futureDate.setDate(this.currentDate.getDate() + 3);
    let isoDate = this.futureDate.toISOString().slice(0, 10);
    let isoTime = this.futureDate.toISOString().slice(11, 16);
    let currentDateTime = isoDate + " " + isoTime;

    this.countDownFormGroup = this.formBuilder.group({
      eventName: [
        countDownWidget ? countDownWidget.eventName : "",
        Validators.required
      ],
      eventTime: [
        countDownWidget ? countDownWidget.eventTime : currentDateTime,
        Validators.required
      ],
      isDayEnabled: [
        countDownWidget ? countDownWidget.isDayEnabled : true,
        Validators.requiredTrue
      ],
      isHourEnabled: [
        countDownWidget ? countDownWidget.isHourEnabled : true,
        Validators.requiredTrue
      ],
      isMinuteEnabled: [
        countDownWidget ? countDownWidget.isMinuteEnabled : true,
        Validators.requiredTrue
      ],
      isSecondEnabled: [
        countDownWidget ? countDownWidget.isSecondEnabled : true,
        Validators.requiredTrue
      ]
    });

    this.widgetDataService.widgetFormState[
      this.category
    ].settings.initialValue = {
      ...this.countDownFormGroup.value
    };
  }

  save(): void {
    // Checks if need to save settings form
    const settingsForm =
      this.widgetDataService.widgetFormState[this.category].settings;

    const isSettingsFormChanged = this.widgetDataService.isFormValueChanged(
      settingsForm.initialValue,
      this.countDownFormGroup.value
    );

    if (isSettingsFormChanged) {
      this.saveCountDownSetting();
      settingsForm.initialValue = this.countDownFormGroup.value;
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

    this.countDownSettingModal.hide();
  }

  saveBackgroundSettings(event) {
    this.newBgSetting = event;
    const imageBgPayload = {
      userMirrorId: this.activeMirrorDetail.id,
      mastercategory: [this.countDownWidget.widgetMasterCategory],
      widgetBackgroundSettingModel: this.newBgSetting
    };
    this.commonFunction.updateWidgetSettings(this.newBgSetting, imageBgPayload);
  }

  saveCountDownSetting() {
    let payload = this.countDownFormGroup.value;
    payload["widgetSetting"] = {
      id: this.countDownWidget.widgetSettingId
    };
    payload["id"] = this.countDownWidgetData.id;

    if (payload.eventTime.trim() == "") {
      this.toastr.error("Countdown Time shound not be empty", "Error");
      return;
    }

    this.loadingSpinner.show();
    this._countDownService.updateCountDownSetting(payload).subscribe(
      (res: any) => {
        this.loadingSpinner.hide();
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId === this.countDownWidget.widgetSettingId
            ) {
              element.data.countDownWidget = res.object;
            }
          });
        });
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
      },
      (err: any) => {
        this.loadingSpinner.hide();
        this.toastr.error(err.error.message, "Error");
      }
    );
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
    this.activeMirrorDetail = this.storage.get("activeMirrorDetails");
  }

  dismissModel() {
    this.countDownSettingModal.hide();
  }
}
