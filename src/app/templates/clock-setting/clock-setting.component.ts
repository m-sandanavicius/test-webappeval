import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { DataService } from "src/app/service/data.service";
import { CommonFunction } from "src/app/service/common-function.service";
import { LocalStorageService } from "angular-web-storage";
import * as moment_t from "moment-timezone";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { ClockService } from "src/app/service/clock.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { WidgetDataService } from "src/app/service/widget-data.service";
import { WidgetBgSettingComponent } from "../widget-bg-setting/widget-bg-setting.component";

@Component({
  selector: "app-clock-setting",
  templateUrl: "./clock-setting.component.html",
  styleUrls: ["./clock-setting.component.scss"],
})
export class ClockSettingComponent implements OnInit, OnChanges {
  @ViewChild(WidgetBgSettingComponent, { static: false })
  widgetBgSettingComponent: WidgetBgSettingComponent;

  @Input() clockSettingModal: any;
  @Input() category: string;
  @Input() activeLayout: any;
  @Input() clockWidgetObject: any;
  @Input() changeDetector: any;
  @Output() updateClockEventEmiter = new EventEmitter();

  clockEnabled: boolean;
  greetingsEnabled: boolean = false;
  activeMirrorDetail: any;
  widgetData = null;
  widgetSettingDetails: any;
  clockWidgetData: any;
  activeMirrorDetails: any;
  settingDisplayflag: any;
  clock24hrFormat: boolean = false;
  defaultClockWidget: void;

  //background widget setting
  widgetType: any;
  widgetBgSetting: any;
  newBgSetting: any;

  currentTimezone: any;
  current_time = "01-01-1970 12:12";
  availableTimeZoneList = moment_t.tz.names();

  clockFormGroup: FormGroup;
  widgetSettings: any;
  widgetLayoutDetails: any;

  constructor(
    private toastr: ToastrService,
    private loadingSpinner: Ng4LoadingSpinnerService,
    private _dataService: DataService,
    private commonFunction: CommonFunction,
    private storage: LocalStorageService,
    private _clockService: ClockService,
    private formBuilder: FormBuilder,
    private widgetDataService: WidgetDataService
  ) {
    this.activeMirrorDetails = this.storage.get("activeMirrorDetails");
    this.clockFormGroup = this.formBuilder.group({
      timeZoneId: [
        this.activeMirrorDetails.timeZoneId,
        Validators.requiredTrue,
      ],
      isGreetingMessage: [false, Validators.requiredTrue],
    });
  }

  ngOnInit() {}

  createClockForm(clockWidget: any): void {
    this.clockFormGroup = this.formBuilder.group({
      timeZoneId: [
        clockWidget
          ? clockWidget.timeZoneId
          : this.activeMirrorDetails.timeZoneId,
        Validators.requiredTrue,
      ],
      isGreetingMessage: [
        clockWidget ? clockWidget.isGreetingMessage : false,
        Validators.requiredTrue,
      ],
    });

    this.widgetDataService.widgetFormState[
      this.category
    ].settings.initialValue = {
      ...this.clockFormGroup.value,
    };
  }

  ngOnChanges(changes: any): void {
    if (
      changes.changeDetector != null &&
      changes.changeDetector.currentValue != undefined
    ) {
      if (this.clockWidgetObject) {
        let timeZoneId =
          this.clockWidgetObject.data.clockWidgetDetail.timeZoneId;
        this.mapCurrentlySelectedTimezone(timeZoneId);
        this.setBackgroundWidgetDetail();
      }
    }

    if (
      changes.clockWidgetObject != null &&
      changes.clockWidgetObject.currentValue != undefined
    ) {
      this._dataService.getWidgetSettingsLayout().subscribe((data) => {
        this.widgetLayoutDetails = data;
        this.widgetSettings = data.widgetSetting;
      });

      this.activeMirrorDetails = this.storage.get("activeMirrorDetails");
      let timeZoneId = this.clockWidgetObject.data.clockWidgetDetail.timeZoneId;
      this.mapCurrentlySelectedTimezone(timeZoneId);
      this.initializeClockData(this.clockWidgetObject);
    }
  }

  initializeClockData(clockWidget): void {
    this.clockWidgetData = clockWidget.data.clockWidgetDetail;
    this.createClockForm(this.clockWidgetData);
  }

  mapCurrentlySelectedTimezone(timeZoneId): void {
    this.currentTimezone = timeZoneId;
    let date = new Date();
    let dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZoneId,
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    let timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZoneId,
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    this.current_time =
      dateFormatter.format(date) + ", " + timeFormatter.format(date);
  }

  setBackgroundWidgetDetail(): void {
    this.widgetType = this.category;
    let widgetData = this.storage.get("selectedwidget");
    if (widgetData != null) {
      this.widgetBgSetting = widgetData.widgetBackgroundSettingModel;
      this.widgetDataService.widgetFormState[
        this.category
      ].format.initialValue = {
        ...this.widgetBgSetting,
      };
    }
    this.activeMirrorDetails = this.storage.get("activeMirrorDetails");
  }

  dismissModel(): void {
    this.clockSettingModal.hide();
  }

  selectTimezone(): void {
    this.mapCurrentlySelectedTimezone(this.clockFormGroup.value.timeZoneId);
  }

  save(): void {
    // Checks if need to save settings form
    const settingsForm =
      this.widgetDataService.widgetFormState[this.category].settings;

    const isSettingsFormChanged = this.widgetDataService.isFormValueChanged(
      settingsForm.initialValue,
      this.clockFormGroup.value
    );

    if (isSettingsFormChanged) {
      this.saveClockSettings();
      settingsForm.initialValue = this.clockFormGroup.value;
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

    this.clockSettingModal.hide();
  }

  saveBackgroundSettings(event): void {
    this.newBgSetting = event;
    const payload = {
      userMirrorId: this.activeMirrorDetails.mirror.id,
      mastercategory: [this.clockWidgetObject.widgetMasterCategory],
      widgetBackgroundSettingModel: this.newBgSetting,
    };
    this.commonFunction.updateWidgetSettings(this.newBgSetting, payload);
    this.clockSettingModal.hide();
  }

  saveClockSettings(): void {
    let payload = this.clockFormGroup.value;
    payload["id"] = this.clockWidgetData.id;
    payload["widgetSetting"] = {
      id: this.clockWidgetObject.widgetSettingId,
    };

    this.loadingSpinner.show();
    this._clockService.updateClockSetting(payload).subscribe(
      (res: any) => {
        this.loadingSpinner.hide();
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId === this.clockWidgetObject.widgetSettingId
            ) {
              element.data.clockWidgetDetail = res.object;
            }
          });
        });
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.clockSettingModal.hide();
      },
      (err: any) => {
        this.loadingSpinner.hide();
        this.toastr.error(err.error.message, "Error");
      }
    );
  }
}
