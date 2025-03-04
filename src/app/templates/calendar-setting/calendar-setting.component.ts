import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ViewChild,
  ElementRef
} from "@angular/core";
import { WidgetService } from "src/app/service/widget.service";
import { LocalStorageService } from "angular-web-storage";
import { DataService } from "src/app/service/data.service";
import { ToastrService } from "ngx-toastr";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { CommonFunction } from "src/app/service/common-function.service";
import { FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { StripePaymentService } from "src/app/service/stripe-payment.service";
import { SubscriptionUtil } from "src/app/util/subscriptionUtil";
import { ModalDirective } from "ngx-bootstrap/modal";
import { CalendarService } from "src/app/service/calendar.service";
import { MangoMirrorConstants } from "src/app/util/constants";
import { WidgetBgSettingComponent } from "../widget-bg-setting/widget-bg-setting.component";
import { WidgetDataService } from "src/app/service/widget-data.service";
import { CalendarWidgetFormatComponent } from "../calendar-widget-format/calendar-widget-format.component";

@Component({
  selector: "app-calendar-setting",
  templateUrl: "./calendar-setting.component.html",
  styleUrls: ["./calendar-setting.component.scss"]
})
export class CalendarSettingComponent implements OnInit, OnChanges {
  @ViewChild("calendarQuantityAlert", { static: true })
  commonAlertModal: ModalDirective;

  @ViewChild("icloudAlert", { static: true })
  icloudAlertModal: ModalDirective;

  @ViewChild("icsCalendarAlert", { static: true })
  icsCalendarAlertModal: ModalDirective;

  @ViewChild("myIdentifier", { static: false }) divHello: ElementRef;

  @ViewChild(WidgetBgSettingComponent, { static: false })
  widgetBgSettingComponent: WidgetBgSettingComponent;

  @ViewChild(CalendarWidgetFormatComponent, { static: false })
  calendarWidgetFormatComponent: CalendarWidgetFormatComponent;

  @Input() calendarSettingModal: any;
  @Input() category: string;
  @Input() activeLayout: any;
  @Input() userCredentials: any;
  @Input() calendarWidgetObject: any;
  @Output() updateWidgetStatusEventEmiter = new EventEmitter<any>();

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
  calenderWidget: any;
  settingDisplayflag: any;
  activeMirrorDetails: any;
  isIclouDataAvailable: boolean = false;
  isIcloudCalendarAvailable: boolean = false;
  isIcloudReminderAvailable: boolean = false;
  isAppleCalendarBlockOn: boolean = false;
  upgradeNeeded = false;

  //family calendar
  selectedUserMirrorCalendar: any;
  photocalendarFormGroup: FormGroup;
  backgroundColor: any = "#000000";
  forgroundColor: any = "#ffffff";
  isPhotoCalendar: boolean = true;
  isEventNameVisible: boolean = true;
  imageResolution = "Stretch";
  isFamilyCalendarSeleted = false;
  currentFamilyCalendar: any;
  accountId: any;
  account: any;
  photoCalendarIndex = 0;
  accountIndex = 0;
  outlookRefreshToken: any;
  defaultCalendarWidget: any;
  calendarWidgetFormat: any;

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
    if (this.calendarWidgetObject != undefined) {
      this.defaultCalendarWidget = this.calendarWidgetObject;
      this.calendarWidgetFormat = this.calendarWidgetObject.data;
    }
  }

  setCalendarIterationCount(count: any) {
    this.selectedCalendarCount = count;
  }

  initializeCallendarDetail(calendarWidget: any) {
    this.calenderWidget = calendarWidget;
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
    this.accountList.forEach((element) => {
      if (element.calendarType == "icloud") {
        element.id = element.id + "_icloud";
        this.isIclouDataAvailable = true;
      }
    });
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
            : requestObject.isCustomEtag
      };

      if (
        this.accountList[accountIndex].calendarType.includes("ical") ||
        this.accountList[accountIndex].calendarType.includes("ics")
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
    if (
      this.userCredentials !== null &&
      this.userCredentials.type == "google" &&
      this.category == "calendar"
    ) {
      if (
        this.userCredentials.code.includes("access_denied") ||
        this.userCredentials.code.includes(
          MangoMirrorConstants.GOOGLE_PERMISSION_ERROR
        )
      ) {
        if (
          this.userCredentials.code.includes(
            MangoMirrorConstants.GOOGLE_PERMISSION_ERROR
          )
        ) {
          this.toastr.error(
            MangoMirrorConstants.GOOGLE_PERMISSION_ERROR_MESSAGE,
            "Error",
            { timeOut: 5000 }
          );
        }
        this.storage.remove("googleAuthCode");
        this.storage.remove("auth_google_calendar");
        this.userCredentials = null;
      } else {
        let payload = {
          userMirrorModel: {
            mirror: {
              id: this.userCredentials.mirrorDetails.mirror.id
            },
            userRole: this.userCredentials.mirrorDetails.userRole
          },
          widgetSettingId: this.calendarWidgetObject.widgetSettingId,
          authorizationCode: this.userCredentials.code
        };
        this.updateGoogleCalendarCredentials(payload);
      }
    } else if (
      this.userCredentials !== null &&
      this.userCredentials.type == "outlook"
    ) {
      let payload = {
        userMirrorModel: {
          mirror: {
            id: this.userCredentials.mirrorDetails.mirror.id
          },
          userRole: this.userCredentials.mirrorDetails.userRole
        },
        widgetSettingId: this.calendarWidgetObject.widgetSettingId,
        authorizationCode: this.userCredentials.code
      };
      this.updateOutlookCalendarCredentials(payload);
    }

    if (changes.calendarWidgetObject != undefined) {
      if (changes.calendarWidgetObject.currentValue != undefined) {
        this.widgetSettingId = this.calendarWidgetObject.widgetSettingId;
        this._dataService.getWidgetSettingsLayout().subscribe((data) => {
          this.widgetLayoutDetails = data;
          this.widgetSettings = data.widgetSetting;
          this.widgetBgSetting =
            changes.calendarWidgetObject.currentValue.widgetBackgroundSettingModel;

          this.widgetDataService.widgetFormState[
            this.category
          ].format.initialValue = {
            ...this.widgetBgSetting
          };
        });
        this.calendarWidgetFormat =
          this.calendarWidgetObject.data.calendarwidgetformat;
        this.initializeCallendarDetail(this.calendarWidgetObject);
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
        "plus_monthly"
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
        ...this.widgetBgSetting
      };
    }
    this.activeMirrorDetails = this.storage.get("activeMirrorDetails");
  }

  updateGoogleCalendarCredentials(payload) {
    this.storage.remove("auth_google_calendar");
    this.loadingSpinner.show();
    payload.isWriteAccess = false;
    this._widgetService.updateGoogleCredentials(payload).subscribe(
      (res: any) => {
        this.storage.remove("googleAuthCode");
        let data = {
          id: res.object.userCalendarAccountModel.id,
          calendarType: "google",
          sourceAccount: res.object.userCalendarAccountModel.sourceAccount,
          isWriteAccess: false,
          calendarList: res.object.selectedCalendar
        };
        this.accountList.push(data);

        if (
          res.object.selectedCalendar != undefined ||
          res.object.selectedCalendar != null
        ) {
          res.object.selectedCalendar.forEach((element) => {
            this.previouslyAddedCalendars.push(element);
          });
        }
        this.addCalendarAccountToExistingWidget(
          this.calendarWidgetObject.widgetSettingId,
          data
        );
        this.widgetLayoutDetails["addedCalendarAccounts"] = this.accountList;
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("selectedwidget", this.calendarWidgetObject);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this.userCredentials = null;
        this.loadingSpinner.hide();
      },
      (err: any) => {
        this.storage.remove("googleAuthCode");
        if (
          err.error.message ===
          "This Account is already Added, Please add another account."
        ) {
          this.toastr.error(err.error.message, "Error");
        } else {
          this.toastr.error(
            "Something went wrong while trying to add calendar account",
            "Error"
          );
        }
        this.loadingSpinner.hide();
      }
    );
  }

  getCalendarList(accountIndex: any) {
    delete this.accountList[accountIndex]["calendarList"];
    let accountDetails = { ...this.accountList[accountIndex] };
    this.accountList[accountIndex]["isCalendarRequestSent"] = true;
    this.accountList[accountIndex]["isCalendarAccessFailed"] = false;

    delete accountDetails["isCalendarRequestSent"];
    delete accountDetails["isCalendarAccessFailed"];
    setTimeout(() => {
      const element = document.getElementById("collapse" + accountIndex);
      if (element) {
        const isCollapsed = !element.classList.contains("show");
        if (isCollapsed == true) {
          this.accountList[accountIndex]["isCalendarRequestSent"] = false;
          return;
        }

        this._widgetService.getCalendarList(accountDetails).subscribe(
          (res: any) => {
            this.accountList[accountIndex]["isCalendarRequestSent"] = false;
            if (
              accountDetails.calendarType == "google" ||
              accountDetails.calendarType == "outlook"
            ) {
              this.previouslyAddedCalendars = this.previouslyAddedCalendars
                .map((currentSelectedObject) => {
                  // Find the matching object in res.object
                  const matchedObject = res.object.find(
                    (currentCalendar) =>
                      currentCalendar.calendarId ===
                        currentSelectedObject.calendarId &&
                      currentSelectedObject.calendarAccountId ===
                        accountDetails.id
                  );

                  // If a match is found, update specific properties
                  if (matchedObject) {
                    return {
                      ...currentSelectedObject,
                      backgroundColor: matchedObject.backgroundColor, // Update specific property
                      forgroundColor: matchedObject.forgroundColor, // Update specific property
                      calendarName: matchedObject.calendarName // Update specific property
                    };
                  }

                  // Return the original object if no match
                  return currentSelectedObject;
                })
                .filter(
                  (currentSelectedObject) =>
                    !(
                      currentSelectedObject.calendarAccountId ===
                        accountDetails.id &&
                      !res.object.some(
                        (currentCalendar) =>
                          currentCalendar.calendarId ===
                          currentSelectedObject.calendarId
                      )
                    )
                );
            } else {
              this.previouslyAddedCalendars =
                this.previouslyAddedCalendars.filter(
                  (currentSelectedObject) =>
                    !(
                      currentSelectedObject.icalAccountId ===
                        accountDetails.id &&
                      !res.object.some(
                        (currentCalendar) =>
                          currentCalendar.calendarId ===
                          currentSelectedObject.calendarId
                      )
                    )
                );
            }

            if (accountDetails.calendarType == "icloud" && res.object != null) {
              res.object.forEach((element) => {
                if (element.type == "reminder") {
                  this.isIcloudReminderAvailable = true;
                } else {
                  this.isIcloudCalendarAvailable = true;
                }
              });
            }

            this.accountList[accountIndex]["calendarList"] =
              this.mapExistingCalendarList(
                this.previouslyAddedCalendars,
                res.object,
                this.accountList[accountIndex].id,
                this.accountList[accountIndex].calendarType
              );
          },
          (err: any) => {
            if (err.error.message == "Calendar account authentication failed") {
              this.accountList[accountIndex]["isCalendarAccessFailed"] = true;
            }
            this.accountList[accountIndex]["isCalendarRequestSent"] = false;
          }
        );
      }
    }, 500);
  }

  changeCaledarView(label: string, view: any) {
    this.calendarViewLabel = label;
    this.selectedCaledarView = view;
  }

  setDisplayflag() {
    this.settingDisplayflag = true;
  }

  backToCalendar() {
    this.isFamilyCalendarSeleted = false;
  }

  updatecalendarWidgetStatus(event) {
    this.updateWidgetStatusEventEmiter.emit(event);
  }

  saveCalendarSettings() {
    this._dataService
      .getActiveMirrorDetails()
      .subscribe((data) => (this.activeMirrorDetails = data));

    let payload = {
      userMirrorModel: {
        id: this.activeMirrorDetails.id
      },
      widgetSettingId: this.calendarWidgetObject.widgetSettingId,
      selectedCalendar: this.previouslyAddedCalendars
    };
    this.loadingSpinner.show();
    this._calendarService.updateCalendarList(payload).subscribe(
      (res: any) => {
        this.loadingSpinner.hide();
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId ===
              this.calendarWidgetObject.widgetSettingId
            ) {
              element.data.selectedCalendar = res.object;
            }
          });
        });
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.calendarSettingModal.hide();
      },
      (err: any) => {
        this.loadingSpinner.hide();
        this.toastr.error(err.error.message, "Error");
      }
    );

    if (this.isFamilyCalendarSeleted) {
      this.isFamilyCalendarSeleted = false;
    } else {
      this.calendarSettingModal.hide();
    }
  }

  save(): void {
    // Checks if need to save settings form
    const settingsForm =
      this.widgetDataService.widgetFormState[this.category].settings;

    const isSettingsFormChanged = this.widgetDataService.isFormValueChanged(
      settingsForm.initialValue,
      {
        ...this.calendarWidgetFormatComponent.calendarFormatFormGroup.value,
        ...this.calendarWidgetFormatComponent.getCalendarSettingsAdditionalProps()
      }
    );

    if (isSettingsFormChanged) {
      console.log("saving calendar settings...");
      this.calendarWidgetFormatComponent.oncalendarFormatEmit();
      settingsForm.initialValue =
        this.calendarWidgetFormatComponent.calendarFormatFormGroup.value;
    }

    // Checks if need to save format form
    const formatForm =
      this.widgetDataService.widgetFormState[this.category].format;

    const isFormatFormChanged = this.widgetDataService.isFormValueChanged(
      formatForm.initialValue,
      this.widgetBgSettingComponent.bgSettingOptions
    );

    if (isFormatFormChanged) {
      console.log("saving calendar format...");
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
      console.log("saving calendars form...");
      this.saveCalendarSettings();
    }

    this.calendarSettingModal.hide();
  }

  saveBackgroundSettings(event) {
    this.newBgSetting = event;
    const calenderBgPayload = {
      userMirrorId: this.activeMirrorDetails.id,
      mastercategory: [this.calenderWidget.widgetMasterCategory],
      widgetBackgroundSettingModel: this.newBgSetting
    };
    this.commonFunction.updateWidgetSettings(
      this.newBgSetting,
      calenderBgPayload
    );
    this.calendarSettingModal.hide();
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
            if (calendarType.includes("ical") || calendarType.includes("ics")) {
              if (
                this.previouslyAddedCalendars[i].calendarAccountId ==
                  undefined &&
                this.previouslyAddedCalendars[i].icalAccountId === accountId
              ) {
                this.previouslyAddedCalendars.splice(i, 1);
                i--;
              }
            } else if (
              this.previouslyAddedCalendars[i].icalAccountId == undefined &&
              this.previouslyAddedCalendars[i].calendarAccountId === accountId
            ) {
              this.previouslyAddedCalendars.splice(i, 1);
              i--;
            }
          }

          let selectedWidget = this.storage.get("selectedwidget");
          this.widgetSettings.forEach((widgetPageData) => {
            widgetPageData.widgets.forEach((element) => {
              if (element.contentId === 3) {
                element.data.addedCalendarAccount = this.accountList;
                element.data.userMirrorCalendarList =
                  this.previouslyAddedCalendars;
                let selectedCalendar = element.data.selectedCalendar;
                for (let i = 0; i < selectedCalendar.length; i++) {
                  if (
                    calendarType.includes("ical") ||
                    calendarType.includes("ics")
                  ) {
                    if (
                      selectedCalendar[i].calendarAccountId == undefined &&
                      selectedCalendar[i].icalAccountId === accountId
                    ) {
                      selectedCalendar.splice(i, 1);
                      i--;
                    }
                  } else if (
                    selectedCalendar[i].icalAccountId == undefined &&
                    selectedCalendar[i].calendarAccountId === accountId
                  ) {
                    selectedCalendar.splice(i, 1);
                    i--;
                  }
                }

                element.data.selectedCalendar = selectedCalendar;
                if (selectedWidget.widgetSettingId == element.widgetSettingId) {
                  this.storage.set("selectedwidget", element);
                }
              }
            });
          });

          this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
          this.widgetLayoutDetails.addedCalendarAccounts = this.accountList;
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

  addCalendarAccountToExistingWidget(widgetSettingId, calendarAccountObject) {
    this.widgetSettings.forEach((widgetPageData) => {
      widgetPageData.widgets.forEach((element) => {
        if (element.contentId === 3) {
          if (element.widgetSettingId === widgetSettingId) {
            element.data.addedCalendarAccount = this.accountList;
            element.data.selectedCalendar = this.previouslyAddedCalendars;
            this.calendarWidgetObject = element;
          } else {
            delete calendarAccountObject.calendarList;
            element.data.addedCalendarAccount.push(calendarAccountObject);
          }
        }
      });
    });
  }

  addGoogleAccount() {
    let isValidRequest = this.checkCalendarSources("google");
    if (!isValidRequest) {
      this.commonAlertModal.show();
      //this.calendarSettingModal.hide();
      return;
    }
    let data = { type: "calendar" };
    this.storage.set("auth_google_calendar", data);
    this._widgetService.addNewGoogleAccount(false).subscribe(
      (res: any) => {
        window.location = res.url;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  dismissModel() {
    this.calendarSettingModal.hide();
  }

  openFamilyAccount(
    accountIndex: number,
    calendarIndex: number,
    calendarId,
    account
  ) {
    this.isFamilyCalendarSeleted = true;
    this.account = account;
    this.accountId = account.id;
    this.photoCalendarIndex = calendarIndex;
    this.accountIndex = accountIndex;

    let index = this.previouslyAddedCalendars.findIndex((calendar) => {
      return (
        calendarId === calendar.calendarId &&
        calendar.calendarAccountId === this.accountId
      );
    });
    this.currentFamilyCalendar = this.previouslyAddedCalendars[index];
    this.initializephotocalendarFormGroup(this.currentFamilyCalendar);
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

  saveFamilyCalendar() {
    let widgetsettingObject = {
      id: this.calendarWidgetObject.widgetSettingId
    };

    this.currentFamilyCalendar.customBackgroundColor = this.backgroundColor;
    this.currentFamilyCalendar.customForgroundColor = this.forgroundColor;
    this.currentFamilyCalendar.imageResolution = this.imageResolution;
    this.currentFamilyCalendar.isEventNameVisible = this.isEventNameVisible;
    this.currentFamilyCalendar.isPhotoCalendar = this.isPhotoCalendar;
    this.currentFamilyCalendar.widgetSetting = widgetsettingObject;

    let payload = {
      userMirrorId: this.activeMirrorDetails.id,
      widgetSettingId: this.calendarWidgetObject.widgetSettingId,
      selectedCalendarModel: this.currentFamilyCalendar
    };

    this.loadingSpinner.show();
    this._widgetService.updatePhotoCalendarSetting(payload).subscribe(
      (res: any) => {
        let index = this.previouslyAddedCalendars.findIndex((calendar) => {
          return (
            this.currentFamilyCalendar.calendarId === calendar.calendarId &&
            calendar.calendarAccountId === this.accountId
          );
        });

        this.previouslyAddedCalendars.splice(index, 1);
        this.previouslyAddedCalendars.push(res.object);
        this.loadingSpinner.hide();
        this.toastr.success("Calendar format updated Successfully");
        this.backToCalendar();
      },
      (error: any) => {
        this.toastr.error(error.error.message);
        this.loadingSpinner.hide();
      }
    );
  }

  updateOutlookCalendarCredentials(payload) {
    this.loadingSpinner.show();
    payload.isWriteAccess = false;
    this._widgetService.updateOutlookCredentials(payload).subscribe(
      (res: any) => {
        this.storage.remove("outlookAuthCode");
        let data = {
          id: res.object.userCalendarAccountModel.id,
          calendarType: "outlook",
          isWriteAccess: false,
          sourceAccount: res.object.userCalendarAccountModel.sourceAccount,
          calendarList: res.object.selectedCalendar
        };
        this.accountList.push(data);

        if (
          res.object.selectedCalendar != undefined ||
          res.object.selectedCalendar != null
        ) {
          res.object.selectedCalendar.forEach((element) => {
            this.previouslyAddedCalendars.push(element);
          });
        }

        this.addCalendarAccountToExistingWidget(
          this.calendarWidgetObject.widgetSettingId,
          data
        );

        this.widgetLayoutDetails["addedCalendarAccounts"] = this.accountList;
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("selectedwidget", this.calendarWidgetObject);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this.userCredentials = null;
        this.loadingSpinner.hide();
      },
      (err: any) => {
        if (
          err.error.message ===
          "This Account is already Added, Please add another account."
        ) {
          this.toastr.error(err.error.message, "Error");
        } else {
          this.toastr.error(
            "Something went wrong while trying to add calendar account",
            "Error"
          );
        }
        this.storage.remove("outlookAuthCode");
        this.loadingSpinner.hide();
      }
    );
  }

  addNewOutlookAccount() {
    let isValidRequest = this.checkCalendarSources("outlook");
    if (!isValidRequest) {
      this.commonAlertModal.show();
      return;
    }

    let data = { type: "calendar" };
    this.storage.set("auth_outlook_calendar", data);

    this._widgetService.addNewOutlookAccount(false).subscribe(
      (res: any) => {
        window.location = res.url;
      },
      (err: any) => {
        console.log(err);
      }
    );
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

    this.addCalendarAccountToExistingWidget(
      this.calendarWidgetObject.widgetSettingId,
      data
    );

    this.widgetLayoutDetails["addedCalendarAccounts"] = this.accountList;
    this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
    this.storage.set("selectedwidget", this.calendarWidgetObject);
    this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
    this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
  }

  openIcsDataModal() {
    this.icsCalendarAlertModal.show();
  }

  updatedIcsCalendarData($event) {}
}
