import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { ModalDirective } from "angular-bootstrap-md";
import { LocalStorageService } from "angular-web-storage";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { ToastrService } from "ngx-toastr";
import { CalendarService } from "src/app/service/calendar.service";
import { CommonFunction } from "src/app/service/common-function.service";
import { DataService } from "src/app/service/data.service";
import { StripePaymentService } from "src/app/service/stripe-payment.service";
import { WidgetService } from "src/app/service/widget.service";
import { SubscriptionUtil } from "src/app/util/subscriptionUtil";
import { WidgetBgSettingComponent } from "../widget-bg-setting/widget-bg-setting.component";
import { WidgetDataService } from "src/app/service/widget-data.service";
import { MealplanWidgetFormatComponent } from "../mealplan-widget-format/mealplan-widget-format.component";

@Component({
  selector: "app-meal-plan",
  templateUrl: "./meal-plan.component.html",
  styleUrls: ["./meal-plan.component.scss"],
})
export class MealPlanComponent implements OnInit {
  @ViewChild("calendarQuantityAlert", { static: true })
  commonAlertModal: ModalDirective;

  @ViewChild("icloudAlert", { static: true })
  icloudAlertModal: ModalDirective;

  @ViewChild("icsCalendarAlert", { static: true })
  icsCalendarAlertModal: ModalDirective;

  @ViewChild(WidgetBgSettingComponent, { static: false })
  widgetBgSettingComponent: WidgetBgSettingComponent;

  @ViewChild(MealplanWidgetFormatComponent, { static: false })
  mealPlanWidgetFormatComponent: MealplanWidgetFormatComponent;

  @Input() category: string;
  @Input() activeLayout: any;
  @Output() updateWidgetStatusEventEmiter = new EventEmitter<any>();
  @Input() mealSettingModal: any;
  @Input() mealWidgetObject: any;

  calendarEnabled: any = false;
  reminderEnabled: any = false;
  selectedCaledarView: any = "Month View";
  accountList = [];
  calendarList = [];
  previouslyAddedCalendars = [];
  selectedCalendarCount: any;
  countList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  calendarViewLabel: string;
  backupNewsPerIteration: any;
  private widgetSettings: any;
  private widgetLayoutDetails: any;
  mealPlanWidget: any;
  settingDisplayflag: any;
  activeMirrorDetails: any;
  upgradeNeeded = false;

  //family calendar
  selectedUserMirrorCalendar: any;
  photocalendarFormGroup: FormGroup;
  backgroundColor: any = "#000000";
  forgroundColor: any = "#ffffff";
  isPhotoCalendar: boolean = true;
  isEventNameVisible: boolean = true;
  imageResolution = "Stretch";
  accountId: any;
  account: any;
  photoCalendarIndex = 0;
  accountIndex = 0;
  defaultCalendarWidget: any;
  mealWidgetFormat: any;

  //background widget setting
  widgetType: any;
  widgetBgSetting: any;
  newBgSetting: any;
  //icloud related data
  icloudData: any;
  isAnySourceAdded: boolean = false;
  widgetSettingId: any;

  constructor(
    private _widgetService: WidgetService,
    private storage: LocalStorageService,
    private _dataService: DataService,
    private toastr: ToastrService,
    private loadingSpinner: Ng4LoadingSpinnerService,
    private commonFunction: CommonFunction,
    private route: Router,
    private _paymentService: StripePaymentService,
    private subscriptionUtil: SubscriptionUtil,
    private _calendarService: CalendarService,
    private widgetDataService: WidgetDataService
  ) {}

  ngOnInit() {
    if (this.mealWidgetObject != undefined) {
      this.defaultCalendarWidget = this.mealWidgetObject;
      this.mealWidgetFormat = this.mealWidgetObject.data;
    }
  }

  setCalendarIterationCount(count: any) {
    this.selectedCalendarCount = count;
  }

  initializeCallendarDetail(calendarWidget: any) {
    this.mealPlanWidget = calendarWidget;
    this.activeMirrorDetails = this.storage.get("activeMirrorDetails");
    this.setDisplayflag();
    this.accountList = calendarWidget.data.addedCalendarAccount;
    this.previouslyAddedCalendars = calendarWidget.data.selectedCalendar;

    const previousCalendarsIds = [...this.previouslyAddedCalendars].map(
      (calendar) => calendar.id
    );

    this.widgetDataService.widgetFormState[
      this.category
    ].calendars.initialValue = previousCalendarsIds;

    if (this.accountList.length > 0) {
      this.isAnySourceAdded = true;
    }
  }

  checkIfCalendarIdExist(
    addedCalendarList: any,
    calendarId: any,
    calendarAccountId: any
  ) {
    for (let i = 0; i < addedCalendarList.length; i++) {
      if (addedCalendarList[i].calendarId == calendarId) {
        if (
          typeof calendarAccountId === "string" &&
          calendarAccountId.includes("icloud")
        ) {
          return addedCalendarList[i];
        } else if (
          addedCalendarList[i].calendarAccountId == calendarAccountId ||
          addedCalendarList[i].icalAccountId == calendarAccountId
        ) {
          return addedCalendarList[i];
        }
      }
    }
  }

  mapExistingCalendarList(
    addedCalendarList: any,
    newCaledarList: any,
    calendarAccountId: any,
    calendarType
  ) {
    let calendarNames = [];
    newCaledarList.forEach((element) => {
      let matchedElement = this.checkIfCalendarIdExist(
        addedCalendarList,
        element.calendarId,
        calendarAccountId
      );
      if (matchedElement != null || matchedElement != undefined) {
        element["active"] = true;
        element["isPhotoCalendar"] = matchedElement.isPhotoCalendar
          ? matchedElement.isPhotoCalendar
          : false;

        element["backgroundColor"] =
          calendarType == "ics"
            ? matchedElement.backgroundColor
            : element.backgroundColor;
        element["forgroundColor"] =
          calendarType == "ics"
            ? matchedElement.forgroundColor
            : element.forgroundColor;
        element["customBackgroundColor"] =
          calendarType == "ics"
            ? matchedElement.customBackgroundColor
            : element.customBackgroundColor;
        element["customForgroundColor"] =
          calendarType == "ics"
            ? matchedElement.customForgroundColor
            : element.customForgroundColor;

        element["id"] = matchedElement.id;
        element["isEventNameVisible"] = matchedElement.isEventNameVisible
          ? matchedElement.isEventNameVisible
          : true;
        element["imageResolution"] = matchedElement.imageResolution
          ? matchedElement.imageResolution
          : "Stretch";
        if (element.icalAccountId != null) {
          if (matchedElement.etag == undefined || matchedElement.etag == null) {
            matchedElement["etag"] = element.etag;
          }
        }
      } else {
        element["active"] = false;
      }
    });
    return newCaledarList;
  }

  updateCalendarColour(calendarId, accountId, color) {
    var calendar = null;
    for (let index = 0; index < this.previouslyAddedCalendars.length; index++) {
      calendar = this.previouslyAddedCalendars[index];
      if (
        calendar.calendarId == calendarId &&
        calendar.icalAccountId == accountId
      ) {
        calendar.backgroundColor = color;
        calendar.forgroundColor = color;
        calendar.customBackgroundColor = color;
        calendar.customForgroundColor = color;
        break;
      }
    }
    if (calendar != null) {
      this.loadingSpinner.show();
      this._calendarService
        .updateCalendarColor(calendar, accountId, this.widgetSettingId)
        .subscribe(
          (res: any) => {
            this.loadingSpinner.hide();
          },
          (err: any) => {
            this.loadingSpinner.hide();
            console.log("Something went wrong while requesting calendar list");
            //this.toastr.error("Something went wrong while requesting calendar list");
          }
        );
    }
  }

  changeCalendarStatus(
    accountIndex: number,
    calendarIndex: number,
    calendarId,
    accountId
  ) {
    if (this.accountList[accountIndex].calendarList[calendarIndex].active) {
      this.accountList[accountIndex].calendarList[calendarIndex].active = false;
      let removeCalendarIndex = this.previouslyAddedCalendars.findIndex(
        (calendar) => {
          return (
            calendarId === calendar.calendarId &&
            (calendar.calendarAccountId != undefined
              ? calendar.calendarAccountId === accountId
              : true)
          );
        }
      );
      this.previouslyAddedCalendars.splice(removeCalendarIndex, 1);
    } else {
      this.accountList[accountIndex].calendarList[calendarIndex].active = true;
      let requestObject =
        this.accountList[accountIndex].calendarList[calendarIndex];
      let customData = {
        calendarId: calendarId,
        backgroundColor: requestObject.backgroundColor,
        forgroundColor: requestObject.forgroundColor,
        calendarName: requestObject.calendarName,
        etag: requestObject.etag,
        isCustomEtag:
          requestObject.isCustomEtag == null
            ? false
            : requestObject.isCustomEtag,
      };

      if (
        this.accountList[accountIndex].calendarType.includes("ical") ||
        this.accountList[accountIndex].calendarType.includes("ics") ||
        this.accountList[accountIndex].calendarType.includes("mealplan")
      ) {
        customData["icalAccountId"] = accountId;
      } else {
        customData["calendarAccountId"] = accountId;
      }

      if (typeof accountId === "string" && accountId.includes("icloud")) {
        customData["calendarAccountId"] = null;
      }
      this.previouslyAddedCalendars.push(customData);
    }
  }

  ngOnChanges(changes: any) {
    if (changes.mealWidgetObject != undefined) {
      if (changes.mealWidgetObject.currentValue != undefined) {
        this.category = "mealplan";
        this.widgetSettingId = this.mealWidgetObject.widgetSettingId;
        this._dataService.getWidgetSettingsLayout().subscribe((data) => {
          this.widgetLayoutDetails = data;
          this.widgetSettings = data.widgetSetting;
          this.widgetBgSetting =
            changes.mealWidgetObject.currentValue.widgetBackgroundSettingModel;
        });
        this.mealWidgetFormat = this.mealWidgetObject.data.calendarwidgetformat;
        this.initializeCallendarDetail(this.mealWidgetObject);
      }
    }
    this.checkIfUpgradeRequired();
  }

  checkIfUpgradeRequired() {
    let subscriptionData = this.storage.get("subscriptionObject");
    this.upgradeNeeded =
      subscriptionData != null &&
      subscriptionData != undefined &&
      subscriptionData.stripeSubscriptionId != undefined &&
      [
        "com.chakra.smartmirror.us.monthly",
        "com.chakra.smartmirror.us.yearly",
        "com.chakra.mangomirror.us.monthly",
        "com.chakra.mangomirror.us.yearly",
        "plus_yearly",
        "plus_monthly",
      ].includes(subscriptionData.productId);
  }

  redirectToPaymentPage() {
    if (this.upgradeNeeded == true) {
      this._paymentService.getStripePortalSession().subscribe(
        (res: any) => {
          let result = res.object;
          window.location.href = result.portalUrl;
          this.loadingSpinner.hide();
        },
        (err: any) => {
          this.toastr.error(err.error.message);
          this.loadingSpinner.hide();
        }
      );
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
        ...this.widgetBgSetting,
      };
    }
    this.activeMirrorDetails = this.storage.get("activeMirrorDetails");
  }

  getCalendarList(accountIndex: any) {
    delete this.accountList[accountIndex]["calendarList"];
    let accountDetails = this.accountList[accountIndex];
    this._widgetService.getCalendarList(accountDetails).subscribe(
      (res: any) => {
        this.accountList[accountIndex]["calendarList"] =
          this.mapExistingCalendarList(
            this.previouslyAddedCalendars,
            res.object,
            this.accountList[accountIndex].id,
            this.accountList[accountIndex].calendarType
          );
      },
      (err: any) => {
        console.log("Something went wrong while requesting calendar list");
      }
    );
  }

  changeCaledarView(label: string, view: any) {
    this.calendarViewLabel = label;
    this.selectedCaledarView = view;
  }

  setDisplayflag() {
    this.settingDisplayflag = true;
  }

  save(): void {
    // Checks if need to save settings form
    const settingsForm =
      this.widgetDataService.widgetFormState[this.category].settings;

    const isSettingsFormChanged = this.widgetDataService.isFormValueChanged(
      settingsForm.initialValue,
      {
        ...this.mealPlanWidgetFormatComponent.calendarFormatFormGroup.value,
        ...this.mealPlanWidgetFormatComponent.getMealPlanSettingsAdditionalProps(),
      }
    );

    if (isSettingsFormChanged) {
      this.mealPlanWidgetFormatComponent.oncalendarFormatEmit();
      settingsForm.initialValue =
        this.mealPlanWidgetFormatComponent.calendarFormatFormGroup.value;
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

    // Checks if need to save calendars form/tab
    const initialCalendarsIds =
      this.widgetDataService.widgetFormState[this.category].calendars
        .initialValue;
    const initialCalendarsIdsSet = new Set(initialCalendarsIds);
    const currentCalendarsIdsSet = new Set(
      this.previouslyAddedCalendars.map((calendar) => calendar.id)
    );

    const isSame =
      initialCalendarsIdsSet.size === currentCalendarsIdsSet.size &&
      initialCalendarsIds.every((item) => currentCalendarsIdsSet.has(item));

    if (!isSame) {
      this.saveCalendarSettings();
    }

    this.mealSettingModal.hide();
  }

  saveCalendarSettings() {
    this._dataService
      .getActiveMirrorDetails()
      .subscribe((data) => (this.activeMirrorDetails = data));

    let payload = {
      userMirrorModel: {
        id: this.activeMirrorDetails.id,
      },
      widgetSettingId: this.mealWidgetObject.widgetSettingId,
      selectedCalendar: this.previouslyAddedCalendars,
    };
    this.loadingSpinner.show();
    this._calendarService.updateCalendarList(payload).subscribe(
      (res: any) => {
        this.loadingSpinner.hide();
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId === this.mealWidgetObject.widgetSettingId
            ) {
              element.data.selectedCalendar = res.object;
            }
          });
        });
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.mealSettingModal.hide();
      },
      (err: any) => {
        this.loadingSpinner.hide();
        this.toastr.error(err.error.message, "Error");
      }
    );

    this.mealSettingModal.hide();
  }

  saveBackgroundSettings(event) {
    this.newBgSetting = event;
    const calenderBgPayload = {
      userMirrorId: this.activeMirrorDetails.id,
      mastercategory: [this.mealPlanWidget.widgetMasterCategory],
      widgetBackgroundSettingModel: this.newBgSetting,
    };
    this.commonFunction.updateWidgetSettings(
      this.newBgSetting,
      calenderBgPayload
    );
    this.mealSettingModal.hide();
  }

  removeAccount(accountId: any, calendarType: string) {
    this.loadingSpinner.show();
    this._widgetService
      .deleteCalendarAccount(accountId, calendarType)
      .subscribe(
        (res: any) => {
          for (let i = 0; i < this.accountList.length; i++) {
            if (this.accountList[i].id === accountId) {
              this.accountList.splice(i, 1);
            }
          }
          if (this.accountList.length < 1) {
            this.isAnySourceAdded = false;
          }

          for (let i = 0; i < this.previouslyAddedCalendars.length; i++) {
            if (
              calendarType.includes("ical") ||
              calendarType.includes("ics") ||
              calendarType.includes("mealplan")
            ) {
              if (
                this.previouslyAddedCalendars[i].icalAccountId === accountId
              ) {
                this.previouslyAddedCalendars.splice(i, 1);
                i--;
              }
            } else if (
              this.previouslyAddedCalendars[i].calendarAccountId === accountId
            ) {
              this.previouslyAddedCalendars.splice(i, 1);
              i--;
            }
          }

          this.widgetSettings.forEach((widgetPageData) => {
            widgetPageData.widgets.forEach((element) => {
              if (element.contentId === 3) {
                element.data.addedCalendarAccount = this.accountList;
                element.data.userMirrorCalendarList =
                  this.previouslyAddedCalendars;
              }
            });
          });
          this.widgetLayoutDetails.addedCalendarAccounts = this.accountList;
          this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
          this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
          this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
          this.storage.set(
            "userMirrorCalendarList",
            this.previouslyAddedCalendars
          );

          this.loadingSpinner.hide();
          this.toastr.success("Account removed successfully");
        },
        (err: any) => {
          console.log(err);
          this.toastr.error(err.error.message);
          this.loadingSpinner.hide();
        }
      );
  }

  dismissModel() {
    this.mealSettingModal.hide();
  }

  initializephotocalendarFormGroup(photoCalendar) {
    this.backgroundColor = photoCalendar.customBackgroundColor
      ? photoCalendar.customBackgroundColor
      : "#000000";
    this.forgroundColor = photoCalendar.customForgroundColor
      ? photoCalendar.customForgroundColor
      : "#ffffff";
    this.isPhotoCalendar = photoCalendar.isPhotoCalendar
      ? photoCalendar.isPhotoCalendar
      : false;
    this.isEventNameVisible = photoCalendar.isEventNameVisible
      ? photoCalendar.isEventNameVisible
      : false;
    this.imageResolution = photoCalendar.imageResolution
      ? photoCalendar.imageResolution
      : "Stretch";
  }

  checkCalendarSources(source: String): boolean {
    let currentHirarchy = this.subscriptionUtil.getCurrentPaymentHirarchy();
    if (currentHirarchy >= 2) {
      return true;
    } else {
      if (this.accountList.length > 0) {
        if (
          this.accountList[0].calendarType.toLowerCase() == source.toLowerCase()
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }
  }

  redirectToHomePage() {
    this.route.navigate(["mirrors"]);
  }

  openIcloudDataModal() {
    this.icloudAlertModal.show();
  }

  updatedIcloudData($event) {
    let data = $event.icloudCredentials;
    this.accountList.push(data);

    if (data.calendarList != undefined || data.calendarList != null) {
      data.calendarList.forEach((element) => {
        this.previouslyAddedCalendars.push(element);
      });
    }

    this.widgetSettings.forEach((widgetPageData) => {
      widgetPageData.widgets.forEach((element) => {
        if (element.widgetSettingId === this.mealWidgetObject.widgetSettingId) {
          element.data.addedCalendarAccount = this.accountList;
          element.data.selectedCalendar = this.previouslyAddedCalendars;
          this.mealWidgetObject = element;
        }
      });
    });

    if (this.accountList.length > 0) {
      this.isAnySourceAdded = true;
    }
    this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
    this.storage.set("selectedwidget", this.mealWidgetObject);
    this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
    this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
  }

  openIcsDataModal() {
    this.icsCalendarAlertModal.show();
  }

  updatedIcsCalendarData($event) {}
}
