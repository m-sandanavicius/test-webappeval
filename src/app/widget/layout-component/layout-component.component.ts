import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  ElementRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "src/app/service/data.service";
import { WidgetService } from "src/app/service/widget.service";
import { ToastrService } from "ngx-toastr";
import { ModalDirective } from "ngx-bootstrap/modal";
import { LocalStorageService } from "angular-web-storage";
import { CommonFunction } from "src/app/service/common-function.service";
import { LayoutRequest, PlanHirarchy } from "src/app/util/static-data";
import { environment } from "src/environments/environment";
import { StripePaymentService } from "src/app/service/stripe-payment.service";
import { FormControl } from "@angular/forms";
import { SubscriptionRequiredWidget } from "../../util/static-data";
import { WidgetsUtil } from "src/app/util/widgetsUtil";
import { SubscriptionUtil } from "src/app/util/subscriptionUtil";
import * as introJs from "intro.js";
import * as $ from "jquery";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { takeUntil } from "rxjs/operators";
import { Observable, Subject, Subscription } from "rxjs";
import { MangoMirrorConstants } from "src/app/util/constants";
import { DragulaService } from "ng2-dragula";

declare var StripeCheckout: any;

@Component({
  selector: "app-layout-component",
  templateUrl: "./layout-component.component.html",
  styleUrls: ["./layout-component.component.scss"],
})
export class LayoutComponentComponent implements OnInit {
  // introJS = introJs();

  private onDestroy = new Subject();
  private isKeyTrue$: Observable<boolean>;

  largeScreen: boolean;
  unpinnedWidgets: any;
  isPinAvailable = false;
  startIndex = 0;
  endIndex = 0;
  activeLayout = 0;
  mirrorName = "Display Name #1";
  inBounds = true;
  userMirrorDetails: any;
  viewdisplayurl: any = "#";
  isActivated = true;
  selectedWidgetId = 0;
  category: any;
  widgetUpdateTimeOut = null;
  widgetActivateTimeOut = null;
  lastXPos = 0;
  lastYPos = 0;
  lastWidgetHeight = 0;
  lastWidgetWidth = 0;
  updatedWidgetSetting = [];
  isWidgetSelected = null;
  selectedPageLayoutIndex: any;
  selectedWidgetIndex: any;
  selectedWidgetContentId: any;
  selectedWidgetSettingId: any;
  changeLayoutStatus = null;
  delayInterval: any;
  updatedNewsCount = null;
  updatedCalendarCount = null;
  calendarViewType = null;
  stripeHandler: any;
  activeSubscription: any;
  userCredentials = null;
  googlePhotoCredentials = null;
  imageWidgetGooglePhotoCredentials = null;
  calendarPayload = null;
  weatherPayload = null;
  quotesPayload = null;

  backgroundImagePayload = null;
  editedNotesSettingModal = null;
  subscriptionWidgetList = [...SubscriptionRequiredWidget];
  subscriptionStatus;
  isDirty = false;
  gotoUrl: boolean = false;
  currentPlanHirarchy: number = 0;
  planHirarchy = PlanHirarchy;
  todoTaskCredentials = null;
  choresTaskCredentials = null;
  @ViewChild("widgetsCategory", { static: true })
  widgetsCategoryModal: ModalDirective;
  @ViewChild("clockSetting", { static: true })
  clockSettingModal: ModalDirective;
  @ViewChild("calendarSetting", { static: true })
  calendarSettingModal: ModalDirective;
  @ViewChild("weatherSetting", { static: true })
  weatherSettingModal: ModalDirective;
  @ViewChild("quoteSetting", { static: true })
  quoteSettingModal: ModalDirective;
  @ViewChild("newsSetting", { static: true })
  newsSettingModal: ModalDirective;
  @ViewChild("timePicker", { static: true })
  timePickerModal: ModalDirective;
  @ViewChild("notesSetting", { static: true })
  notesSettingModal: ModalDirective;
  @ViewChild("confirmDeletePage", { static: true })
  confirmDeletePageModal: ModalDirective;
  @ViewChild("confirmDeleteWidget", { static: true })
  confirmDeleteWidgetModal: ModalDirective;
  @ViewChild("confirmPinWidget", { static: true })
  confirmPinwidgetModal: ModalDirective;
  @ViewChild("confirmUnpinWidget", { static: true })
  confirmUnpinwidgetModal: ModalDirective;
  @ViewChild("upgradeSubscription", { static: true })
  upgradeSubscriptionModal: ModalDirective;
  @ViewChild("backgroundImage", { static: true })
  backgroundImageModal: ModalDirective;
  @ViewChild("healthSetting", { static: true })
  healthSettingModal: ModalDirective;
  @ViewChild("imageSetting", { static: true })
  imageSettingModal: ModalDirective;
  @ViewChild("gifSetting", { static: true })
  gifSettingModal: ModalDirective;
  @ViewChild("confirmViewDisplayWidget", { static: true })
  confirmViewDisplayWidgetModal: ModalDirective;
  @ViewChild("commonAlert", { static: true })
  commonAlertModal: ModalDirective;

  @ViewChild("videoSetting", { static: true })
  videoSettingModal: ModalDirective;
  @ViewChild("asanaSetting", { static: true })
  asanaSettingModal: ModalDirective;
  @ViewChild("trelloSetting", { static: true })
  trelloSettingModal: ModalDirective;
  @ViewChild("googleMapSetting", { static: true })
  googleMapSettingModal: ModalDirective;
  @ViewChild("airtableSetting", { static: true })
  airtableSettingModal: ModalDirective;
  @ViewChild("googleDocSetting", { static: true })
  googleDocSettingModal: ModalDirective;
  @ViewChild("microsoftOfficeDocSetting", { static: true })
  microsoftOfficeDocSettingModal: ModalDirective;
  @ViewChild("embedWebsiteSetting", { static: true })
  embedWebsiteSettingModal: ModalDirective;
  @ViewChild("embedHtmlSetting", { static: true })
  embedHtmlSettingModal: ModalDirective;
  @ViewChild("pdfSetting", { static: true })
  pdfSettingModal: ModalDirective;
  @ViewChild("todoSetting", { static: true })
  todoSettingModal: ModalDirective;
  @ViewChild("countDownSetting", { static: true })
  countDownSettingModal: ModalDirective;
  @ViewChild("choresSetting", { static: true })
  choresSettingModal: ModalDirective;
  @ViewChild("mealSetting", { static: true })
  mealSettingModal: ModalDirective;

  //lmd variables
  lmdHeight = undefined;
  lmdWidth = undefined;

  // widget layout details
  private widgetLayoutDetails: any;
  pageSize = 0;
  widgetSettings = [];
  private newsWidgetList = [];
  private userLevelStickynotes = [];
  private healthWidgetList = [];
  // private duplicateWidgetSettingList = [];

  autocompleteInput: string;
  queryWait: boolean;
  todayWeatherEnabled: boolean = false;
  onedayWeatherEnabled: boolean = false;
  weekdayWeatherEnabled: boolean = false;
  public searchControl: FormControl;
  height: number = 0;
  layoutParentBoundary: number = 0;

  latitude: number;
  longitude: number;
  zoom: number;
  address: string = "";
  operation: any;

  @ViewChild("search", { static: true })
  public searchElementRef: ElementRef;

  // multiwidget setting
  calendarWidgetObject: any;
  clockWidgetObject: any;
  changeDetector: boolean;
  newsChangeDetector: boolean;
  quotesWidgetObject: any;
  notesWidgetObject: any;
  imageWidgetObject: any;
  gifWidgetObject: any;
  todoWidgetObject: any;
  countDownWidgetObject: any;
  choresWidgetObject: any;
  mealWidgetObject: any;
  weatherWidgetObject: any;

  //common alert
  commonAlertType: string = "";
  commonAlertHeader: string = "";
  commonAlertData: any;

  // sprint 18 iframely
  microsoftOfficeWidgetObject: any;
  googleDocWidgetObject: any;
  airTableWidgetObject: any;
  googleMapWidgetObject: any;
  trelloWidgetObject: any;
  asanaWidgetObject: any;
  videoWidgetObject: any;
  deviceType: string = null;
  embedWebsiteWidgetObject: any;
  embedHtmlWidgetObject: any;
  pdfWidgetObject: any;
  isInitializationDone: boolean = false;
  timePickerObject: any;
  draggedIndex: number;

  private dragSubscription: Subscription;
  private dropSubscription: Subscription;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private _dataService: DataService,
    private _widgetService: WidgetService,
    private _paymentService: StripePaymentService,
    private storage: LocalStorageService,
    private commonFunction: CommonFunction,
    private layoutRequest: LayoutRequest,
    private loadingSpinner: Ng4LoadingSpinnerService,
    private activeRouter: ActivatedRoute,
    private _widgetUtil: WidgetsUtil,
    private _subscriptionUtil: SubscriptionUtil,
    private dragulaService: DragulaService
  ) {
    try {
      this.dragulaService.createGroup("pagecontainer", {
        direction: "horizontal", // Make it horizontal
        moves: (el, container, handle) => true, // Allow dragging from any element
      });
    } catch (error) {
      console.log(error);
    }

    // Handle the drag and drop events
    this.dragSubscription = this.dragulaService
      .drag("pagecontainer")
      .subscribe(({ name, el }) => {
        this.draggedIndex = Array.from(el.parentElement.children).indexOf(el);
      });

    this.dropSubscription = this.dragulaService
      .drop("pagecontainer")
      .subscribe(({ name, el, target, source, sibling }) => {
        const droppedIndex = Array.from(target.children).indexOf(el);
        const movedItem = this.widgetSettings[this.draggedIndex];
        this.widgetSettings.splice(this.draggedIndex, 1); // Remove the item from the original position
        this.widgetSettings.splice(droppedIndex, 0, movedItem); // Insert the item into the new position
        this.activeLayout = droppedIndex;
        this.updateLayoutSequence();
      });
  }

  updateLayoutSequence() {
    let payload = {
      displayPages: [],
      userMirrorModel: { id: this.userMirrorDetails.id },
    };

    let displayPages = [];
    this.widgetSettings.forEach((widget, index) => {
      widget.pageNumber = index + 1; // Updating index in sequential order starting from 1
      let page = {};
      page["id"] = widget.pageId;
      page["isBackgroundImage"] = widget.isBackgroundImage;
      page["isAutoPageRotation"] = widget.isAutoPageRotation;
      page["transition"] = widget.transition;
      page["isTilled"] = widget.isTilled;
      page["pageNumber"] = index + 1;
      displayPages.push(page);
    });

    payload.displayPages = displayPages;

    this.loadingSpinner.show();
    this._widgetService.updateLayoutSequence(payload).subscribe(
      (res: any) => {
        this.loadingSpinner.hide();
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
      },
      (err: any) => {
        this.toastr.error(err.error.message);
        this.loadingSpinner.hide();
      }
    );
  }

  ngOnInit() {
    // this.introJS.setOptions({
    //   steps: [
    //   {
    //   element: document.querySelector('#nav-container'),
    //   intro: ' <img style="width: 100%;" src="../.././assets/icons/product_tour_widget.gif"/> This is a widget. It can be moved and resized',

    //   },
    //   {
    //   element: document.querySelector('#add-widgets'),
    //   intro: 'Click here to add other widgets',
    //   },
    //   ],
    //   }).start();

    // this.introJS.start();
    $("body").addClass("widget-global-layout");

    // $(document).ready(function () {
    //   if (window.innerWidth < 480) {
    //     this.height = this.layoutRequest.payload.deviceHeight - 20;
    //     this.layoutParentBoundary = this.layoutRequest.payload.deviceHeight + 75;
    //   }
    // });

    //   $(".parent-style-box").mouseover(function(){
    //     console.log("dun")
    //      $("body").addClass("widget-global-layout");
    //   });

    //   $(".parent-style-box").mouseout(function(){
    //     console.log("dun1")
    //     $("body").removeClass("widget-global-layout");
    //   });

    // });

    let calculatedLayout = this.storage.get("lmdValues");
    if (calculatedLayout != undefined) {
      this.lmdHeight = calculatedLayout.height + 10;
      this.lmdWidth = calculatedLayout.width + 10;
    }

    if (this.layoutRequest.payload.deviceWidth < 450) {
      this.largeScreen = false;
    } else {
      this.largeScreen = true;
    }

    let subscriptionData = this.storage.get("subscriptionObject");
    if (subscriptionData != null && subscriptionData != undefined) {
      for (let index = 0; index < this.planHirarchy.length; index++) {
        if (
          this.planHirarchy[index].planList.includes(subscriptionData.productId)
        ) {
          this.currentPlanHirarchy = this.planHirarchy[index].hirarchy;
          break;
        }
      }
    }

    this.height = this.layoutRequest.payload.deviceHeight;
    // this.layoutParentBoundary = 80 * window.innerHeight/100;
    this.layoutParentBoundary = this.layoutRequest.payload.deviceHeight + 50;

    this._dataService.getActiveMirrorDetails().subscribe((mirrorDetails) => {
      if (mirrorDetails === undefined || mirrorDetails === null) {
        this.userMirrorDetails = this.storage.get("activeMirrorDetails");
        this._dataService.setActiveMirrorDetails(this.userMirrorDetails);
      } else {
        this.userMirrorDetails = mirrorDetails;
      }
    });
    this._dataService
      .getWidgetSettingsLayout()
      .subscribe((widgetLayoutDetails) => {
        if (widgetLayoutDetails === undefined || widgetLayoutDetails === null) {
          this.widgetLayoutDetails = this.storage.get("activeWidgetDetails");
          this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        } else {
          this.widgetLayoutDetails = widgetLayoutDetails;
        }

        this._dataService.setAddedCalendarAccountList(
          this.widgetLayoutDetails.addedCalendarAccounts
        );

        this.widgetSettings = this.widgetLayoutDetails.widgetSetting;
        this.pageSize = this.widgetSettings.length;
        this.newsWidgetList = this.widgetLayoutDetails.newsSourceList;
        this.healthWidgetList = this.widgetLayoutDetails.healthWidget;
        this.newsWidgetList = this.widgetLayoutDetails.newsSourceList;
        if (this.isInitializationDone == false) {
          if (this.pageSize >= 5) {
            this.endIndex = 4;
          } else {
            this.endIndex = this.pageSize - 1;
          }
        }
        this.addPinnedWidgetToAllPages();
        this.getUnpinnedWidgetsList();
      });
    let queryParam = window.location.search;
    if (
      queryParam.includes("?calendar=true") ||
      queryParam.includes("?googlePhotos=true") ||
      queryParam.includes("?googletask=true")
    ) {
      let code = "";
      let scope = "";
      this.activeRouter.queryParams.subscribe((params) => {
        code = params["code"];
        scope = params["scope"];
      });

      let layoutRequest = this.storage.get("layoutrequest");
      this.layoutRequest.payload.deviceHeight =
        layoutRequest.payload.deviceHeight;
      this.layoutRequest.payload.deviceWidth =
        layoutRequest.payload.deviceWidth;
      if (queryParam.includes("?calendar=true")) {
        let requestType = this.storage.get("auth_google_calendar");
        if (requestType.type == "calendar") {
          if (
            scope.includes(
              "https://www.googleapis.com/auth/calendar.readonly"
            ) &&
            scope.includes(
              "https://www.googleapis.com/auth/calendar.events.readonly"
            )
          ) {
            this.storage.set("googleAuthCode", code);
          } else {
            this.storage.set(
              "googleAuthCode",
              MangoMirrorConstants.GOOGLE_PERMISSION_ERROR
            );
          }
          this.category = "calendar";
        } else {
          if (
            scope.includes(
              "https://www.googleapis.com/auth/calendar.readonly"
            ) &&
            scope.includes("https://www.googleapis.com/auth/calendar.events")
          ) {
            this.storage.set("googleAuthCode", code);
          } else {
            this.storage.set(
              "googleAuthCode",
              MangoMirrorConstants.GOOGLE_PERMISSION_ERROR
            );
          }

          this.category = "gesture";
          this.router.navigateByUrl("mirrors/setting");
          return;
        }
      } else if (queryParam.includes("?googlePhotos=true")) {
        if (queryParam.includes("image")) {
          this.category = "image";
        } else {
          this.category = "background image";
        }
        this.storage.set("googlePhotosAuthCode", code);
      } else if (queryParam.includes("?googletask=true")) {
        this.category = "todo";
        this.storage.set("googleTaskAuthCode", code);
      }
      this.router.navigateByUrl("widgets/layout");
    } else if (
      window.location.pathname.includes("outlookcalendar") ||
      window.location.pathname.includes("outlookTodoTask")
    ) {
      let authorizationCode = "";
      this.activeRouter.queryParams.subscribe((params) => {
        authorizationCode = params["code"];
      });

      let layoutRequest = this.storage.get("layoutrequest");
      this.layoutRequest.payload.deviceHeight =
        layoutRequest.payload.deviceHeight;
      this.layoutRequest.payload.deviceWidth =
        layoutRequest.payload.deviceWidth;

      if (window.location.pathname.includes("outlookcalendar")) {
        let requestType = this.storage.get("auth_outlook_calendar");
        this.storage.set("outlookAuthCode", authorizationCode);
        if (requestType.type == "calendar") {
          this.category = "calendar";
        } else {
          this.category = "gesture";
          this.router.navigateByUrl("mirrors/setting");
          return;
        }
      } else {
        this.category = "todo";
        this.storage.set("outlookTaskAuthCode", authorizationCode);
      }
      this.router.navigateByUrl("widgets/layout");
    } else if (window.location.pathname.includes("TodoIst")) {
      let authorizationCode = "";
      let todoistState = "";
      this.activeRouter.queryParams.subscribe((params) => {
        authorizationCode = params["code"];
        todoistState = params["state"];
      });

      let layoutRequest = this.storage.get("layoutrequest");
      this.layoutRequest.payload.deviceHeight =
        layoutRequest.payload.deviceHeight;
      this.layoutRequest.payload.deviceWidth =
        layoutRequest.payload.deviceWidth;
      let selectedWidget = this.storage.get("selectedwidget");
      if (selectedWidget.contentType == "chores") {
        this.category = "chores";
        this.storage.set("choresTodoistTaskAuthCode", authorizationCode);
        this.storage.set("choresTodoistState", todoistState);
      } else {
        this.category = "todo";
        this.storage.set("todoistTaskAuthCode", authorizationCode);
        this.storage.set("todoistState", todoistState);
      }

      this.router.navigateByUrl("widgets/layout");
    }
    this.deviceType = this.storage.get("device-type");
    this.buildPortalUrl();
    this.isInitializationDone = true;
  }

  ngOnDestroy() {
    if (this.dragSubscription) {
      this.dragSubscription.unsubscribe();
    }
    if (this.dropSubscription) {
      this.dropSubscription.unsubscribe();
    }
    this.dragulaService.destroy("pagecontainer");
    $("body").removeClass("widget-global-layout");
    this.onDestroy.next();
  }

  ngAfterViewInit() {
    this.buildPortalUrl();
    // this.deviceType = this.storage.get("device-type");
    let widgets = this.storage.get("widgets");
    if (widgets != null && widgets != undefined) {
      this._dataService.setWidgetsList(widgets);
    }

    this.height = this.layoutRequest.payload.deviceHeight;
    this.layoutParentBoundary = this.layoutRequest.payload.deviceHeight + 50;

    if (this.storage.get("googleAuthCode") !== null) {
      this.userCredentials = {
        mirrorDetails: this.userMirrorDetails,
        code: this.storage.get("googleAuthCode"),
        type: "google",
      };
      if (this.category != "gesture") {
        this.category = "calendar";
        this.calendarWidgetObject = this.storage.get("selectedwidget");
        this.calendarSettingModal.show();
      }
    } else if (this.storage.get("googleTaskAuthCode") !== null) {
      this.todoTaskCredentials = {
        mirrorDetails: this.userMirrorDetails,
        code: this.storage.get("googleTaskAuthCode"),
        type: "googletask",
      };
      this.category = "todo";
      this.todoWidgetObject = this.storage.get("selectedwidget");
      this.todoSettingModal.show();
    } else if (this.storage.get("googlePhotosAuthCode") !== null) {
      this.imageWidgetObject = this.storage.get("selectedwidget");
      if (
        this.imageWidgetObject != null &&
        this.imageWidgetObject.contentType == "image"
      ) {
        this.imageWidgetGooglePhotoCredentials = {
          mirrorDetails: this.userMirrorDetails,
          code: this.storage.get("googlePhotosAuthCode"),
        };
        this.category = "image";
        this.imageSettingModal.show();
      } else {
        this.googlePhotoCredentials = {
          mirrorDetails: this.userMirrorDetails,
          code: this.storage.get("googlePhotosAuthCode"),
        };
        this.category = "background image";
        this.openWidgetCategorySettingModal("background image", null, false);
      }
    } else if (this.storage.get("outlookAuthCode") !== null) {
      this.userCredentials = {
        mirrorDetails: this.userMirrorDetails,
        code: this.storage.get("outlookAuthCode"),
        type: "outlook",
      };

      if (this.category != "gesture") {
        this.category = "calendar";
        this.calendarWidgetObject = this.storage.get("selectedwidget");
        this.calendarSettingModal.show();
      }
    } else if (this.storage.get("outlookTaskAuthCode") !== null) {
      this.todoTaskCredentials = {
        mirrorDetails: this.userMirrorDetails,
        code: this.storage.get("outlookTaskAuthCode"),
        type: "outlookTask",
      };
      this.category = "todo";
      this.todoWidgetObject = this.storage.get("selectedwidget");
      this.todoSettingModal.show();
    } else if (this.storage.get("todoistTaskAuthCode") !== null) {
      this.todoTaskCredentials = {
        mirrorDetails: this.userMirrorDetails,
        code: this.storage.get("todoistTaskAuthCode"),
        type: "todoist",
      };
      this.category = "todo";
      this.todoWidgetObject = this.storage.get("selectedwidget");
      this.todoSettingModal.show();
    } else if (this.storage.get("choresTodoistTaskAuthCode") !== null) {
      this.choresTaskCredentials = {
        mirrorDetails: this.userMirrorDetails,
        code: this.storage.get("choresTodoistTaskAuthCode"),
        type: "chores",
      };
      this.category = "chores";
      this.choresWidgetObject = this.storage.get("selectedwidget");
      this.choresSettingModal.show();
    }
  }

  openTimePicker(widgetSetting) {
    this.timePickerObject = {
      delay: widgetSetting.delay,
      transition:
        widgetSetting.transition != null ? widgetSetting.transition : "fade",
      isAutoPageRotation: widgetSetting.isAutoPageRotation,
    };

    // this.delayInterval = widgetSetting.delay;
    this.timePickerModal.show();
  }

  openStripeCheckoutPopup(event: any) {
    this.intializeStripeHandler(event);
  }

  intializeStripeHandler(event: any) {
    let payload = { stripeTokenId: event.data.stripeTokenId };
    if (event.operation === "create") {
      payload["productId"] = event.data.productId;
    }

    this.loadingSpinner.show();
    this._paymentService.activateSubscriptionAPI(payload).subscribe(
      (res: any) => {
        this.storage.set("subscriptionObject", res.object);
        var productId = res.object.productId;
        let subscriptionDetail = {
          isLifeTimeSubscriptionAvailable: false,
          isSubscriptionAvailable: false,
        };
        if (productId == "free") {
          subscriptionDetail.isLifeTimeSubscriptionAvailable = true;
        } else {
          subscriptionDetail.isLifeTimeSubscriptionAvailable = false;
        }
        var subscriptionDate = new Date(res.object.expiryDate);
        var result =
          subscriptionDate.getTime() -
          new Date(
            new Date().getTime() - new Date().getTimezoneOffset() * 1000
          ).getTime();
        if (result >= 1) {
          subscriptionDetail.isSubscriptionAvailable = true;
        } else {
          subscriptionDetail.isSubscriptionAvailable = false;
        }

        this.storage.set("subscriptionDetails", subscriptionDetail);
        this._dataService.setSubscriptionDetails("data");
        this.upgradeSubscriptionModal.hide();
        this.widgetsCategoryModal.show();
        this.loadingSpinner.hide();
      },
      (err: any) => {
        this.toastr.error(err.error.message);
        this.loadingSpinner.hide();
      }
    );
  }

  // updateSubscription(payload: any) {
  //   this._paymentService.updateSubscriptionAPI(payload).subscribe(
  //     (res: any) => {
  //       let subscriptionDetail = this.storage.get("subscriptionDetails");
  //       if (subscriptionDetail.productId.includes(".monthly")) {
  //         subscriptionDetail.productId = subscriptionDetail.productId.replace(
  //           ".monthly",
  //           ".yearly"
  //         );
  //       } else if (subscriptionDetail.productId.includes(".yearly")) {
  //         subscriptionDetail.productId = subscriptionDetail.productId.replace(
  //           ".yearly",
  //           ".monthly"
  //         );
  //       }
  //       this.storage.set("subscriptionDetails", subscriptionDetail);
  //       this.upgradeSubscriptionModal.hide();
  //     },
  //     (err: any) => {
  //       this.toastr.error(err.error.message);
  //     }
  //   );
  // }

  @HostListener("window:popstate")
  onPopstate() {
    this.stripeHandler.close();
  }

  addPinnedWidgetToAllPages() {
    let data = [];
    let pageCounter = 0;
    this.widgetSettings.forEach((page) => {
      page.widgets.forEach((widget) => {
        if (widget.pinned) {
          for (let index = 0; index < this.widgetSettings.length; index++) {
            if (
              pageCounter !== index &&
              !data.includes(widget.widgetSettingId)
            ) {
              if (
                !this.checkIfWidgetAlreadyAvailable(
                  index,
                  widget.widgetSettingId
                )
              ) {
                this.widgetSettings[index].widgets.push(widget);
              }
            }
          }
          data.push(widget.widgetSettingId);
        }
      });
      pageCounter++;
    });
  }

  checkIfWidgetAlreadyAvailable(pageCounter, widgetSettingId) {
    for (
      let index = 0;
      index < this.widgetSettings[pageCounter].widgets.length;
      index++
    ) {
      if (
        this.widgetSettings[pageCounter].widgets[index].widgetSettingId ==
        widgetSettingId
      ) {
        return true;
        break;
      }
    }
    return false;
  }

  gotoMirrorList() {
    this.router.navigateByUrl("mirrors");
  }

  gotoMirrorSetting() {
    this.router.navigateByUrl("mirrors/setting");
  }

  getWidgetSettings(layoutRequestData: any) {
    this._widgetService.getwidgetLayoutSettings(layoutRequestData).subscribe(
      (res: any) => {
        this.widgetLayoutDetails = res.object;
        this.widgetSettings = this.widgetLayoutDetails.widgetSetting;
        this.pageSize = this.widgetSettings.length;
        this.newsWidgetList = this.widgetLayoutDetails.newsSourceList;
        this.healthWidgetList = this.widgetLayoutDetails.healthWidget;
        this.newsWidgetList = this.widgetLayoutDetails.newsSourceList;
        this._dataService.setWidgetSettingsLayout(res.object);
      },
      (err: any) => {
        this.toastr.error(err.error.message, "Error");
      }
    );
  }

  changeSelectedWidget(widget: any) {
    this.selectedWidgetId = widget.widgetSettingId;
  }

  onDragBegin($event) {
    if (this.widgetUpdateTimeOut) {
      clearTimeout(this.widgetUpdateTimeOut);
    }
    this.lastXPos =
      $event.getBoundingClientRect().left -
      $event.parentNode.getBoundingClientRect().left;
    this.lastYPos =
      $event.getBoundingClientRect().top -
      $event.parentNode.getBoundingClientRect().top;
  }

  onDragEnd($event, widgetSettingId) {
    this.selectedWidgetId = widgetSettingId;
    let xPos =
      $event.getBoundingClientRect().left -
      $event.parentNode.getBoundingClientRect().left;
    let yPos =
      $event.getBoundingClientRect().top -
      $event.parentNode.getBoundingClientRect().top;
    if (
      xPos - this.lastXPos > 1 ||
      xPos - this.lastXPos < -1 ||
      yPos - this.lastYPos > 1 ||
      yPos - this.lastYPos < -1
    ) {
      this.changeLayoutStatus = "Saving...";
      if (this.widgetUpdateTimeOut) {
        clearTimeout(this.widgetUpdateTimeOut);
      }
      this.widgetSettings.forEach((widgetPage) => {
        widgetPage.widgets.forEach((widget) => {
          if (widget.widgetSettingId === widgetSettingId) {
            widget.xPos = xPos;
            widget.yPos = yPos;
          }
        });
      });
      this.updateLayout();
    } else {
      if (this.isDirty == true) {
        this.updateLayout();
      }
    }
  }

  onResizeStart($event) {
    if (this.widgetUpdateTimeOut) {
      clearTimeout(this.widgetUpdateTimeOut);
    }
    this.lastWidgetHeight = $event.size.height;
    this.lastWidgetWidth = $event.size.width;
  }

  onResizeStop($event, widgetSettingId) {
    var element = document.getElementById($event.host.id);
    this.selectedWidgetId = widgetSettingId;
    if (
      $event.size.height - this.lastWidgetHeight > 1 ||
      $event.size.height - this.lastWidgetHeight < -1 ||
      $event.size.width - this.lastWidgetWidth > 1 ||
      $event.size.width - this.lastWidgetWidth < -1
    ) {
      this.changeLayoutStatus = "Saving...";
      this.widgetSettings.forEach((widgetPage) => {
        widgetPage.widgets.forEach((widget) => {
          if (widget.widgetSettingId === widgetSettingId) {
            widget.height = $event.size.height;
            widget.width = $event.size.width;
            if ($event.position.left != widget.xPos) {
              widget.xPos = widget.xPos + $event.position.left;
              element.style.left = "0";
            }
            if ($event.position.top != widget.yPos) {
              widget.yPos = widget.yPos + $event.position.top;
              element.style.top = "0";
            }
          }
        });
      });
      this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
      this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
      this.updateLayout();
    } else {
      if (this.isDirty == true) {
        this.updateLayout();
      }
    }
  }

  updateBackgroundImageStatus(index: number, status: boolean) {
    let payloadData = {
      calendarFlag: false,
      isLayoutBackgroundUpdated: true,
      userMirrorModel: {
        mirror: {
          id: this.userMirrorDetails.mirror.id,
        },
        userRole: this.userMirrorDetails.userRole,
      },
    };

    let backgroundImageData = this.widgetLayoutDetails.backgroundImageDetails;
    if (backgroundImageData == undefined) {
      this.toastr.error(
        "please make sure you add some sources for background image."
      );
      return;
    }

    this.widgetLayoutDetails.widgetSetting.forEach((element) => {
      if (element.pageNumber === index + 1) {
        if (
          backgroundImageData.isAppleImage == true ||
          backgroundImageData.isGoogleImage == true ||
          backgroundImageData.isUnsplashImage == true ||
          backgroundImageData.isDefaultUnsplashImage == true ||
          backgroundImageData.isImageUrlEnable == true ||
          backgroundImageData.isS3Enabled == true
        ) {
          element.isBackgroundImage = !status;
        } else {
          element.isBackgroundImage = false;
          return;
        }
      }
    });
    payloadData.userMirrorModel["backgroundImageStatus"] = true;

    if (
      this.widgetLayoutDetails.unsplashCollectionKeyList == undefined ||
      this.widgetLayoutDetails.unsplashCollectionKeyList.length == 0
    ) {
      backgroundImageData["unsplashCollectionKeyList"] = ["Nature"];
    } else {
      backgroundImageData["unsplashCollectionKeyList"] =
        this.widgetLayoutDetails.unsplashCollectionKeyList;
    }

    payloadData.userMirrorModel["backgroundImage"] = backgroundImageData;
    this.backgroundImagePayload = payloadData;
    this.widgetSettings = this.widgetLayoutDetails.widgetSetting;
    this.updateWidgetSettingAPI(true);
  }

  getUpdateLayoutRequestData(): any {
    this.updatedWidgetSetting = [];
    let payload = {
      userMirrorModel: {
        mirror: {
          id: this.userMirrorDetails.mirror.id,
        },
        userRole: this.userMirrorDetails.userRole,
      },
    };
    payload["calendarFlag"] = false;
    this.widgetSettings.forEach((element) => {
      let widgets = this.commonFunction.createWidgetSettingObject(
        element.widgets,
        this.layoutRequest.payload.deviceHeight,
        this.layoutRequest.payload.deviceWidth
      );
      let mirrorPageDetail = {
        delay: element.delay,
        isTilled: element.isTilled,
        pageNumber: element.pageNumber,
        isBackgroundImage: element.isBackgroundImage,
      };
      let data = {
        widgets: widgets,
        userMirror: payload.userMirrorModel,
        mirrorPage: mirrorPageDetail,
      };
      this.updatedWidgetSetting.push(data);
    });

    payload["genericWidgetSettingModelList"] = this.updatedWidgetSetting;
    return payload;
  }

  updateLayout() {
    this.isDirty = true;
    this.widgetUpdateTimeOut = setTimeout(() => {
      this.widgetUpdateTimeOut = null;
      this.updateWidgetSettingAPI(true);
    }, 2000);
  }

  openWidgetCategorySettingModal(
    category: string,
    widget: any,
    isEditing: boolean
  ) {
    let existingCalendars = 0;
    let sourceCategory = category;
    this.storage.set("selectedwidget", widget);
    let weatherCategoryList = [
      "weather",
      "24 Hour Weather Forecast",
      "5 Day Weather Forecast",
    ];
    let subscription = this.storage.get("subscriptionDetails");
    let currentSubscription = this.storage.get("subscriptionObject");
    let tempCategory = category.toLowerCase();
    if (tempCategory === "stickynotes") {
      tempCategory = "notes";
    }
    if (subscription != undefined && subscription.isSubscriptionAvailable) {
      let indexOfCategory = this.subscriptionWidgetList.findIndex(
        (item) => tempCategory === item.toLowerCase()
      );
      let requireHirarchy =
        this._widgetUtil.getWidgetRequiredHirarchy(category);
      if (indexOfCategory > -1 && this.currentPlanHirarchy < requireHirarchy) {
        category = "subscription";
      }
    } else {
      let requireHirarchy =
        this._widgetUtil.getWidgetRequiredHirarchy(tempCategory);
      if (requireHirarchy > 0) {
        category = "subscription";
      }
    }
    if (subscription.isSubscriptionAvailable) {
      if (category.toLowerCase() === "calendar") {
        existingCalendars = this._widgetUtil.getExistingWidgetCount(
          category.toLowerCase()
        );
        if (existingCalendars > 1 && this.currentPlanHirarchy <= 1) {
          category = "subscription";
        }
      }
    }

    if (weatherCategoryList.indexOf(category) !== -1) {
      category = "weather";
    }

    if (
      category == "Apple Health" ||
      category == "Fitbit" ||
      category == "Health"
    ) {
      category = "health";
    }

    if (
      category == "Iframily" ||
      category == "CountDown" ||
      category == "Meal Plan"
    ) {
      category = widget.contentType;
    }

    category = category.toLowerCase();
    this.category = category;
    switch (category) {
      case "clock":
        if (isEditing == true) {
          this.category = "clock";
          this.clockWidgetObject = widget;
          this.changeDetector = !this.changeDetector;
          this.clockSettingModal.show();
        } else {
          this.clockWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "news":
        this.newsChangeDetector = !this.newsChangeDetector;
        this.widgetsCategoryModal.hide();
        this.newsSettingModal.show();
        break;
      case "quotes":
        if (isEditing == true) {
          this.category = "quotes";
          this.quotesWidgetObject = widget;
          this.quoteSettingModal.show();
        } else {
          this.quotesWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "calendar":
        if (isEditing == true) {
          this.category = "calendar";
          this.calendarWidgetObject = widget;
          this.calendarSettingModal.show();
        } else {
          let isPlanUpgradeRequired =
            this._widgetUtil.checkCalendarSubscriptionUpgradeStatus(
              this.category,
              this.currentPlanHirarchy
            );
          if (isPlanUpgradeRequired) {
            if (subscription.isSubscriptionAvailable) {
              this._subscriptionUtil.redirectToStripeCustomerPortal();
            } else {
              this.router.navigate(["plans-and-payments"]);
            }
          } else {
            this.calendarWidgetObject = this.createWidgetSetting(category);
          }
        }
        break;
      case "weather":
        if (isEditing == true) {
          this.category = "weather";
          this.weatherWidgetObject = widget;
          this.weatherSettingModal.show();
        } else {
          this.weatherWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "background image":
        this.widgetsCategoryModal.hide();
        this.backgroundImageModal.show();
        break;
      case "notes":
        if (isEditing == true) {
          this.category = "notes";
          this.notesWidgetObject = widget;
          this.notesSettingModal.show();
        } else {
          this.createWidgetSetting(category);
        }
        break;
      case "stickynotes":
        if (isEditing == true) {
          this.category = "notes";
          this.notesWidgetObject = widget;
          this.notesSettingModal.show();
        } else {
          this.notesWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "health":
        this.widgetsCategoryModal.hide();
        this.healthSettingModal.show();
        break;
      case "subscription":
        let currentSubscription = this.storage.get("subscriptionObject");
        if (
          currentSubscription == null ||
          currentSubscription == undefined ||
          currentSubscription.productId == "FreeTrial" ||
          currentSubscription.productId == null ||
          currentSubscription.productId == undefined
        ) {
          this.router.navigate(["plans-and-payments"]);
        } else {
          if (!subscription.isSubscriptionAvailable) {
            this.loadingSpinner.show();
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
          } else {
            var value =
              this._widgetUtil.getWidgetRequiredHirarchy(tempCategory);
            let planData =
              this._subscriptionUtil.getPlanDetailByHirarchy(value);
            let currentDataPlan =
              this._subscriptionUtil.getPlanDetailByHirarchy(
                this.currentPlanHirarchy
              );
            let data = {
              planName: planData.commonName,
              widgetName: sourceCategory,
              currentPlan:
                currentDataPlan != null ? currentDataPlan.commonName : null,
            };
            this.commonAlertData = data;
            this.commonAlertHeader = "Update Plan";
            this.commonAlertType = "upgradeplan";

            if (sourceCategory.toLowerCase() === "calendar") {
              if (existingCalendars > 1 && this.currentPlanHirarchy <= 1) {
                data.planName = "Pro";
                this.commonAlertType = "calendarWidgetLimit";
              }
            }
            this.commonAlertModal.show();
          }
        }
        break;
      case "image":
        if (isEditing == true) {
          this.category = "image";
          this.imageWidgetObject = widget;
          this.imageSettingModal.show();
        } else {
          this.imageWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "video":
        if (isEditing == true) {
          this.category = "video";
          this.videoWidgetObject = widget;
          this.videoSettingModal.show();
        } else {
          this.videoWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "google_map":
        if (isEditing == true) {
          this.category = "google_map";
          this.googleMapWidgetObject = widget;
          this.googleMapSettingModal.show();
        } else {
          this.googleMapWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "asana":
        if (isEditing == true) {
          this.category = "asana";
          this.asanaWidgetObject = widget;
          this.asanaSettingModal.show();
        } else {
          this.asanaWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "pdf":
        if (isEditing == true) {
          this.category = "pdf";
          this.pdfWidgetObject = widget;
          this.pdfSettingModal.show();
        } else {
          this.pdfWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "airtable":
        if (isEditing == true) {
          this.category = "airtable";
          this.airTableWidgetObject = widget;
          this.airtableSettingModal.show();
        } else {
          this.airTableWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "microsoft_office_doc":
        if (isEditing == true) {
          this.category = "microsoft_office_doc";
          this.microsoftOfficeWidgetObject = widget;
          this.microsoftOfficeDocSettingModal.show();
        } else {
          this.microsoftOfficeWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "google_doc":
        if (isEditing == true) {
          this.category = "google_doc";
          this.googleDocWidgetObject = widget;
          this.googleDocSettingModal.show();
        } else {
          this.googleDocWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "embed_website":
        if (isEditing == true) {
          this.category = "embed_website";
          this.embedWebsiteWidgetObject = widget;
          this.embedWebsiteSettingModal.show();
        } else {
          this.embedWebsiteWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "embed_html":
        if (isEditing == true) {
          this.category = "embed_html";
          this.embedHtmlWidgetObject = widget;
          this.embedHtmlSettingModal.show();
        } else {
          this.embedHtmlWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "gif":
        if (isEditing == true) {
          this.category = "gif";
          this.gifWidgetObject = widget;
          this.gifSettingModal.show();
        } else {
          this.gifWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "todo":
        if (isEditing == true) {
          this.category = "todo";
          this.todoWidgetObject = widget;
          this.todoSettingModal.show();
        } else {
          this.todoWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "count_down":
        if (isEditing == true) {
          this.category = "count_down";
          this.countDownWidgetObject = widget;
          this.countDownSettingModal.show();
        } else {
          this.countDownWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "chores":
        if (isEditing == true) {
          this.category = "chores";
          this.choresWidgetObject = widget;
          this.choresSettingModal.show();
        } else {
          this.choresWidgetObject = this.createWidgetSetting(category);
        }
        break;
      case "mealplan":
        if (isEditing == true) {
          this.category = "mealplan";
          this.mealWidgetObject = widget;
          this.mealSettingModal.show();
        } else {
          this.mealWidgetObject = this.createWidgetSetting(category);
        }
        break;
      default:
        break;
    }
  }

  getPinnedWidgetsList() {
    let pinnedWidgetList = [];
    this.widgetSettings[0].widgets.forEach((element) => {
      if (element.pinned) {
        pinnedWidgetList.push(element);
      }
    });
    return pinnedWidgetList;
  }

  addNewLayoutScreen() {
    this.category = undefined;
    let widgetsList = this.getPinnedWidgetsList();
    let topIndex = this.widgetSettings.length - 1;
    // if (this.widgetSettings[topIndex].widgets.length === 0) {
    //   return;
    // } else {
    let userMirrorModel = {
      mirror: {
        id: this.userMirrorDetails.mirror.id,
      },
      userRole: this.userMirrorDetails.userRole,
    };
    let data = {
      widgets: widgetsList,
      delay: 30,
      isBackgroundImage: false,
      isAutoPageRotation: true,
      transition: "fade",
      isTilled: true,
      pageNumber: this.widgetSettings.length + 1,
      userMirror: userMirrorModel,
    };
    this.widgetSettings.push(data);
    this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
    this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
    this.changeLayout(data.pageNumber - 1);
    this.updateWidgetSettingAPI(true);
    // }
  }

  changeLayout(index: any) {
    this.category = undefined;
    if (index >= 0 && index < this.widgetSettings.length) {
      this.activeLayout = index;
      if (
        this.widgetSettings.length <= 5 ||
        (this.widgetSettings.length > 5 && index < 3)
      ) {
        this.startIndex = 0;
        this.endIndex = 4;
      } else {
        let endPageDifference = this.widgetSettings.length - 1 - index;
        if (endPageDifference >= 2) {
          this.startIndex = index - 2;
          this.endIndex = index + 2;
        } else {
          this.startIndex = index - 2 - (2 - endPageDifference);
          this.endIndex = index + endPageDifference;
        }
      }
    }
  }

  setNewsHeadLineCount(event: any) {
    if (event !== null && event !== undefined) {
      this.updatedNewsCount = event;
    } else {
      this.updatedNewsCount = null;
    }
  }

  openPinWidgetConfirmationModal(contentId: any, widgetSettingId: any) {
    this.selectedWidgetContentId = contentId;
    this.selectedWidgetSettingId = widgetSettingId;
    this.confirmPinwidgetModal.show();
  }

  pinnedWidgetStatus(status: any) {
    if (!status) {
      return;
    }
    let pinnedWidget;
    let alreadyInPageIndex;
    let isDataFound = false;
    if (this.widgetSettings.length === 1) {
      for (let i = 0; i < this.widgetSettings[0].widgets.length; i++) {
        if (this.selectedWidgetContentId == 49) {
          if (
            this.widgetSettings[0].widgets[i].widgetSettingId ===
            this.selectedWidgetSettingId
          ) {
            isDataFound = true;
          }
        } else {
          if (
            this.widgetSettings[0].widgets[i].contentId ===
            this.selectedWidgetContentId
          ) {
            isDataFound = true;
          }

          if (isDataFound === true) {
            this.widgetSettings[0].widgets[i].pinned = true;
            break;
          }
        }
      }
    } else if (this.widgetSettings.length > 1) {
      for (let i = 0; i < this.widgetSettings.length; i++) {
        for (let j = 0; j < this.widgetSettings[i].widgets.length; j++) {
          if (this.selectedWidgetContentId == 49) {
            if (
              this.widgetSettings[i].widgets[j].widgetSettingId ===
              this.selectedWidgetSettingId
            ) {
              isDataFound = true;
            }
          } else {
            if (
              this.widgetSettings[i].widgets[j].widgetSettingId ===
              this.selectedWidgetSettingId
            ) {
              isDataFound = true;
            }
          }

          if (isDataFound === true) {
            this.widgetSettings[i].widgets[j].pinned = true;
            pinnedWidget = JSON.stringify(this.widgetSettings[i].widgets[j]);
            alreadyInPageIndex = i;
            break;
          }
        }
        if (isDataFound === true) {
          break;
        }
      }
      for (let index = 0; index < this.widgetSettings.length; index++) {
        if (index !== alreadyInPageIndex) {
          this.widgetSettings[index].widgets.push(JSON.parse(pinnedWidget));
        }
      }
    }
    this.updateWidgetSettingAPI(true);
  }

  openUnpinConfirmationModal(contentId: any, widgetSettingId: any) {
    this.selectedWidgetContentId = contentId;
    this.selectedWidgetSettingId = widgetSettingId;
    this.confirmUnpinwidgetModal.show();
  }

  confirmedUnpinWidget(event) {
    this.unpinnedWidgetStatus(this.selectedWidgetContentId, true);
  }

  unpinnedWidgetStatus(widgetContentId: any, isCallFromUpdate: boolean) {
    if (this.widgetSettings.length === 1) {
      for (let i = 0; i < this.widgetSettings[0].widgets.length; i++) {
        if (widgetContentId == 49) {
          if (
            this.widgetSettings[0].widgets[i].widgetSettingId ===
            this.selectedWidgetSettingId
          ) {
            this.widgetSettings[0].widgets.splice(i, 1);
            break;
          }
        } else {
          if (
            this.widgetSettings[0].widgets[i].widgetSettingId ===
            this.selectedWidgetSettingId
          ) {
            if (widgetContentId == 3) {
              let widgetSetting = {
                widgetSettingId: this.selectedWidgetSettingId,
              };
              this.removeWidgetSetting(widgetSetting, 0, true);
            } else {
              this.widgetSettings[0].widgets[i].status = "off";
              this.widgetSettings[0].widgets[i].pinned = false;
            }
            break;
          }
        }
      }
    } else if (this.widgetSettings.length > 1) {
      for (let i = 0; i < this.widgetSettings.length; i++) {
        for (let j = 0; j < this.widgetSettings[i].widgets.length; j++) {
          if (widgetContentId == 49) {
            if (
              this.widgetSettings[i].widgets[j].widgetSettingId ===
              this.selectedWidgetSettingId
            ) {
              this.widgetSettings[i].widgets.splice(j, 1);
              break;
            }
          } else {
            if (
              this.widgetSettings[i].widgets[j].widgetSettingId ===
              this.selectedWidgetSettingId
            ) {
              this.widgetSettings[i].widgets[j].pinned = false;
              this.widgetSettings[i].widgets[j].status = "off";
              if (i !== 0) {
                this.widgetSettings[i].widgets.splice(j, 1);
              }
              if (widgetContentId != 3) {
                break;
              }
            }
          }
        }
      }
      if (widgetContentId == 3) {
        let widgetSetting = { widgetSettingId: this.selectedWidgetSettingId };
        this.removeWidgetSetting(widgetSetting, 0, true);
      }
    }
    if (isCallFromUpdate && widgetContentId != 3) {
      this.updateWidgetSettingAPI(true);
    }
  }

  openWidgetDeleteConfirmationModal(index: any) {
    this.selectedWidgetIndex = index;
    this.confirmDeleteWidgetModal.show();
  }

  openPageDeleteConfirmationModal(index: any) {
    this.selectedPageLayoutIndex = index;
    this.confirmDeletePageModal.show();
  }

  deleteWidget(status: any) {
    this.category = "";
    if (!status) {
      return;
    }

    let widget =
      this.widgetSettings[this.activeLayout].widgets[this.selectedWidgetIndex];

    if (
      widget.contentType == "calendar" ||
      widget.contentType == "image" ||
      widget.contentType == "gif" ||
      widget.widgetMasterCategory == "Iframily" ||
      widget.contentType == "todo" ||
      widget.contentType == "count_down" ||
      widget.contentType == "chores" ||
      widget.contentType == "clock" ||
      widget.contentType == "quotes" ||
      widget.contentType == "notes" ||
      widget.contentType == "stickynotes" ||
      widget.contentType == "weather"
    ) {
      this.removeWidgetSetting(widget, this.activeLayout, widget.pinned);
    } else {
      this.widgetSettings[this.activeLayout].widgets[
        this.selectedWidgetIndex
      ].status = "off";

      if (this.widgetSettings.length === 1) {
        this.widgetSettings[0].widgets[this.selectedWidgetIndex].pinned = false;
        if (widget.contentId == 49) {
          this.widgetSettings[this.activeLayout].widgets.splice(
            this.selectedWidgetIndex,
            1
          );
        }
      } else {
        if (widget.pinned) {
          let pageIndex = 0;
          this.widgetSettings.forEach((page) => {
            for (let i = 0; i < page.widgets.length; i++) {
              if (
                widget.contentId === 49 &&
                page.widgets[i].widgetSettingId === widget.widgetSettingId
              ) {
                page.widgets.splice(i, 1);
              } else {
                if (
                  page.widgets[i].widgetSettingId === widget.widgetSettingId &&
                  pageIndex !== 0
                ) {
                  page.widgets.splice(i, 1);
                } else if (
                  page.widgets[i].widgetSettingId === widget.widgetSettingId &&
                  pageIndex === 0
                ) {
                  this.widgetSettings[0].widgets[i].status = "off";
                  this.widgetSettings[0].widgets[i].pinned = false;
                }
              }
            }
            pageIndex++;
          });
        } else {
          if (widget.contentId !== 49) {
            if (this.activeLayout != 0) {
              this.widgetSettings[0].widgets.push(
                this.widgetSettings[this.activeLayout].widgets[
                  this.selectedWidgetIndex
                ]
              );
              this.widgetSettings[this.activeLayout].widgets.splice(
                this.selectedWidgetIndex,
                1
              );
            }
          } else {
            this.widgetSettings[this.activeLayout].widgets.splice(
              this.selectedWidgetIndex,
              1
            );
          }
        }
      }

      this.updateWidgetSettingAPI(true);
    }
  }

  deleteLayoutPage(status: any) {
    if (!status) {
      return;
    }
    let widgetIndex = 0;
    if (this.widgetSettings.length > 1) {
      for (
        let widgetIndex = 0;
        widgetIndex <
        this.widgetSettings[this.selectedPageLayoutIndex].widgets.length;
        widgetIndex++
      ) {
        var element =
          this.widgetSettings[this.selectedPageLayoutIndex].widgets[
            widgetIndex
          ];
        if (element.contentId === 3 && element.status === "on") {
          this.calendarPayload = this.getDeleteCalendarPayload();
        }
        if (element.status === "on" && !element.pinned) {
          element.status = "off";
          if (element.contentId === 49) {
            this.widgetSettings[this.selectedPageLayoutIndex].widgets.splice(
              widgetIndex,
              1
            );
            widgetIndex--;
          }
        } else if (element.status === "on" && element.pinned) {
          this.widgetSettings[this.selectedPageLayoutIndex].widgets.splice(
            widgetIndex,
            1
          );
          widgetIndex--;
        }
      }

      if (this.selectedPageLayoutIndex !== 0) {
        this.widgetSettings[0].widgets = this.widgetSettings[0].widgets.concat(
          this.widgetSettings[this.selectedPageLayoutIndex].widgets
        );
        this.widgetSettings.splice(this.selectedPageLayoutIndex, 1);
        this.changeLayout(this.selectedPageLayoutIndex - 1);
      } else if (this.selectedPageLayoutIndex === 0) {
        this.widgetSettings[1].widgets = this.widgetSettings[1].widgets.concat(
          this.widgetSettings[0].widgets
        );
        this.widgetSettings.splice(0, 1);
        this.activeLayout = 0;
      }
    } else if (this.widgetSettings.length === 1) {
      this.widgetSettings[0].widgets.forEach((element) => {
        if (element.contentId === 3 && element.status === "on") {
          this.calendarPayload = this.getDeleteCalendarPayload();
        }
        if (element.status === "on") {
          element.status = "off";
          if (element.contentId === 49) {
            this.widgetSettings[this.selectedPageLayoutIndex].widgets.splice(
              widgetIndex,
              1
            );
          }
        }
      });
    }

    // rewrite page number
    this.updatePageNumber();
    this.updateWidgetSettingAPI(true);
  }

  getDeleteCalendarPayload() {
    return {
      userMirrorModel: {
        mirror: {
          id: this.userMirrorDetails.mirror.id,
        },
        userRole: this.userMirrorDetails.userRole,
      },
      calendarFlag: true,
    };
  }

  updateWidgetStatusEventEmiter() {
    this.updateWidgetSettingAPI(true);
  }

  updateWidgetFromCalendarModal(event: any) {
    this.calendarPayload = event.calendarData;
    this.updateWidgetSettingAPI(true);
  }

  updateWidgetFromWeatherModal(event: any) {
    if (
      event.weatherData.location != null ||
      event.weatherData.location != undefined
    ) {
      this.weatherPayload = event.weatherData.location;
    }
    if (event.weatherData.isLayoutChanged) {
      this.updateWidgetSettingAPI(true);
    } else {
      this.updateWidgetSettingAPI(true);
    }
  }

  updateBackgroundImageModal(event: any) {
    if (
      event.backgroundImageData != null ||
      event.backgroundImageData != undefined
    ) {
      this.backgroundImagePayload = event.backgroundImageData;
    }
    this.updateWidgetSettingAPI(true);
  }

  updateImageWidgetData(event: any) {
    if (
      event.backgroundImageData != null ||
      event.backgroundImageData != undefined
    ) {
      this.backgroundImagePayload = event.backgroundImageData;
    }
    this.updateWidgetSettingAPI(true);
  }

  updateDelay() {
    this.updateWidgetSettingAPI(true);
  }

  getWidgetSetting(mirror: any) {
    let layoutRequestData = this.storage.get("layoutrequest");
    this._widgetService.getwidgetLayoutSettings(layoutRequestData).subscribe(
      (res: any) => {
        this._dataService.setWidgetSettingsLayout(res.object);
        this.storage.set("activeWidgetDetails", res.object);
        this.storage.set("widgetsSetting", res.object.widgetSetting);
      },
      (err: any) => {
        this.toastr.error(err.error.message, "Error");
      }
    );
  }

  updateWidgetSettingAPI(isLayoutUpdated: boolean) {
    // this.checkEmptyLayoutPages();
    let payload: any;
    if (this.calendarPayload !== null) {
      payload = this.calendarPayload;
    } else if (this.quotesPayload != null) {
      payload = this.quotesPayload;
    } else if (this.backgroundImagePayload != null) {
      payload = this.backgroundImagePayload;
      var bgImageData = payload.userMirrorModel["backgroundImage"];
      if (
        payload.isLayoutBackgroundUpdated == undefined ||
        payload.isLayoutBackgroundUpdated == false
      ) {
        if (
          bgImageData.isAppleImage == true ||
          bgImageData.isGoogleImage == true ||
          bgImageData.isUnsplashImage == true ||
          bgImageData.isDefaultUnsplashImage == true ||
          bgImageData.isImageUrlEnable == true ||
          bgImageData.isS3Enabled == true
        ) {
          const hasBackgroundImage =
            this.widgetLayoutDetails.widgetSetting.some(
              (element) => element.isBackgroundImage === true
            );

          if (!hasBackgroundImage) {
            this.widgetLayoutDetails.widgetSetting.forEach((element) => {
              element.isBackgroundImage = true;
            });
          }
        } else {
          this.widgetLayoutDetails.widgetSetting.forEach((element) => {
            element.isBackgroundImage = false;
          });
        }
      } else {
        delete payload["isLayoutBackgroundUpdated"];
      }

      this.widgetSettings = this.widgetLayoutDetails.widgetSetting;
    } else {
      this.widgetSettings = this.widgetLayoutDetails.widgetSetting;
      payload = {
        userMirrorModel: {
          mirror: {
            id: this.userMirrorDetails.mirror.id,
          },
          userRole: this.userMirrorDetails.userRole,
        },
      };

      if (this.weatherPayload !== null) {
        payload.userMirrorModel["location"] = this.weatherPayload;
      }
      if (this.updatedNewsCount && this.updatedNewsCount !== null) {
        payload.userMirrorModel["newsCountPerIteration"] =
          this.updatedNewsCount;
      }
    }
    if (this.widgetSettings.length < 1) {
      let counter = 0;
      this.widgetSettings.forEach((element) => {
        if (element.widgets.length === 0) {
          this.widgetSettings.splice(counter, 1);
        }
        counter++;
      });
    }

    if (isLayoutUpdated) {
      payload["genericWidgetSettingModelList"] =
        this.commonFunction.getGenericWidgetSettingModelList(
          this.widgetSettings,
          this.userMirrorDetails
        );
    }

    this.addPinnedWidgetToAllPages();
    this.changeLayoutStatus = "Saving...";

    this.loadingSpinner.show();
    this._widgetService.updateLayoutSettings(payload).subscribe(
      (res: any) => {
        this.changeLayoutStatus = "Saved to Display";
        this.selectedWidgetId = null;
        if (this.calendarPayload != null) {
          this.userMirrorDetails = this.storage.get("activeMirrorDetails");
          this.widgetSettings.forEach((widgetPageData) => {
            widgetPageData.widgets.forEach((element) => {
              if (element.contentId === 3) {
                element.data.userMirrorCalendarList =
                  this.calendarPayload.userMirrorCalendarList;
              }
            });
          });
          this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
          this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
          this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
          this._dataService.setActiveMirrorDetails(this.userMirrorDetails);
        }

        if (this.backgroundImagePayload) {
          this.updateBackgroundImageDetails(
            res.object.refreshWidget.widgets.backgroundImageDetails
          );
        }

        if (isLayoutUpdated || this.backgroundImagePayload) {
          this.widgetSettings = res.object.refreshWidget.widgets.widgetSetting;
          this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
          this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
          this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        }

        this.backgroundImagePayload = null;
        this.weatherPayload = null;
        this.isDirty = false;
        this.loadingSpinner.hide();
        this.getUnpinnedWidgetsList();
        setTimeout(() => {
          this.changeLayoutStatus = null;
        }, 2000);
      },
      (err: any) => {
        this.loadingSpinner.hide();
        this.isDirty = false;
        this.weatherPayload = null;
        this.changeLayoutStatus = null;
        this.toastr.error(err.error.message, "Error");
      }
    );
  }

  updateBackgroundImageDetails(backgroundImageData: any) {
    this.widgetLayoutDetails.backgroundImageDetails = backgroundImageData;
  }

  checkEmptyLayoutPages() {
    let pageIndex = 0;
    let pageRemoved = false;
    this.widgetSettings.forEach((layoutPage) => {
      let removePage = true;
      let pinnedWidgetList = [];
      if (pageIndex === 0) {
        for (let i = 0; i < layoutPage.widgets.length; i++) {
          if (
            layoutPage.widgets[i].status === "on" &&
            !layoutPage.widgets[i].pinned
          ) {
            removePage = false;
          } else if (layoutPage.widgets[i].pinned) {
            pinnedWidgetList.push(i);
          }
        }
      } else if (layoutPage.widgets.length === 0) {
        this.widgetSettings.splice(pageIndex, 1);
        pageRemoved = true;
      } else if (layoutPage.widgets.length > 0) {
        for (let i = 0; i < layoutPage.widgets.length; i++) {
          if (!layoutPage.widgets[i].pinned) {
            removePage = false;
            break;
          }
        }
      }
      if (removePage) {
        if (pageIndex === 0) {
          if (pinnedWidgetList.length !== 0) {
            pinnedWidgetList.forEach((element) => {
              this.widgetSettings[pageIndex].widgets[element].status = "off";
              this.widgetSettings[pageIndex].widgets[element].pinned = false;
              if (this.widgetSettings.length > 1) {
                this.widgetSettings[pageIndex].widgets.splice(element, 1);
                pageRemoved = true;
              }
            });
          }
          if (this.widgetSettings.length > 1) {
            this.widgetSettings[1].widgets =
              this.widgetSettings[1].widgets.concat(
                this.widgetSettings[0].widgets
              );
            this.widgetSettings.splice(pageIndex, 1);
          }
        } else {
          this.widgetSettings.splice(pageIndex, 1);
          pageRemoved = true;
        }
        if (this.activeLayout === pageIndex && pageIndex !== 0) {
          this.activeLayout = pageIndex - 1;
        } else {
          this.activeLayout = 0;
        }
      }
      pageIndex++;
    });
    if (this.widgetSettings.length === 1 && pageRemoved) {
      this.widgetSettings[0].widgets.forEach((element) => {
        element.pinned = false;
      });
    }
    this.updatePageNumber();
  }

  updatePageNumber() {
    let counter = 1;
    this.widgetSettings.forEach((element) => {
      element.pageNumber = counter;
      counter++;
    });
  }

  activateWidget(widget) {
    if (this.widgetActivateTimeOut) {
      clearTimeout(this.widgetActivateTimeOut);
    }
    this.selectedWidgetId = widget.widgetSettingId;
    if (this.unpinnedWidgets[this.activeLayout] > 1) {
      this.isPinAvailable = true;
    } else {
      this.isPinAvailable = false;
    }
    this.widgetActivateTimeOut = setTimeout(() => {
      this.widgetActivateTimeOut = null;
      this.selectedWidgetId = 0;
    }, 3000);
  }

  getUnpinnedWidgetsList() {
    let unpinnedWidgets = [];
    this.widgetSettings.forEach((page) => {
      let count = 0;
      page.widgets.forEach((widget) => {
        if (widget.status === "on" && widget.pinned === false) {
          count++;
        }
      });
      unpinnedWidgets.push(count);
    });
    this.unpinnedWidgets = unpinnedWidgets;
  }
  onViewDisplay() {
    this.confirmViewDisplayWidgetModal.show();
  }
  onAppPortal() {
    this.buildPortalUrl();
    window.open(this.viewdisplayurl, "_blank").focus();
  }

  buildPortalUrl() {
    this.viewdisplayurl =
      environment.portalBaseURL +
      "?major=" +
      this.userMirrorDetails.mirror.major +
      "&minor=" +
      this.userMirrorDetails.mirror.minor +
      "&macaddress=" +
      this.userMirrorDetails.mirror.deviceId;
  }

  viewDisplay() {
    this.confirmViewDisplayWidgetModal.hide();
    this.onAppPortal();
  }

  loadWidget(category) {
    let weatherCategoryList = [
      "weather",
      "24 Hour Weather Forecast",
      "5 Day Weather Forecast",
    ];
    if (weatherCategoryList.indexOf(category) !== -1) {
      category = "weather";
    }

    if (
      category == "Apple Health" ||
      category == "Fitbit" ||
      category == "Health"
    ) {
      category = "health";
    }

    category = category.toLowerCase();
    this.category = category;
    switch (category) {
      case "clock":
        this.changeDetector = !this.changeDetector;
        this.widgetsCategoryModal.hide();
        this.clockWidgetObject = this.storage.get("selectedwidget");
        this.clockSettingModal.show();
        break;
      case "news":
        this.widgetsCategoryModal.hide();
        this.newsSettingModal.show();
        break;
      case "quotes":
        this.widgetsCategoryModal.hide();
        this.quotesWidgetObject = this.storage.get("selectedwidget");
        this.quoteSettingModal.show();
        break;
      case "calendar":
        this.widgetsCategoryModal.hide();
        this.calendarWidgetObject = this.storage.get("selectedwidget");
        this.calendarSettingModal.show();
        break;
      case "weather":
        this.widgetsCategoryModal.hide();
        this.weatherWidgetObject = this.storage.get("selectedwidget");
        this.weatherSettingModal.show();
        break;
      case "background image":
        this.widgetsCategoryModal.hide();
        this.backgroundImageModal.show();
        break;
      case "notes":
        this.widgetsCategoryModal.hide();
        this.notesWidgetObject = this.storage.get("selectedwidget");
        this.notesSettingModal.show();
        break;
      case "stickynotes":
        this.widgetsCategoryModal.hide();
        this.notesWidgetObject = this.storage.get("selectedwidget");
        this.notesSettingModal.show();
        break;
      case "health":
        this.widgetsCategoryModal.hide();
        this.healthSettingModal.show();
      case "image":
        this.widgetsCategoryModal.hide();
        this.imageWidgetObject = this.storage.get("selectedwidget");
        this.imageSettingModal.show();
        break;
      case "video":
        this.widgetsCategoryModal.hide();
        this.videoWidgetObject = this.storage.get("selectedwidget");
        this.videoSettingModal.show();
        break;
      case "google_map":
        this.widgetsCategoryModal.hide();
        this.googleMapWidgetObject = this.storage.get("selectedwidget");
        this.googleMapSettingModal.show();
        break;
      case "asana":
        this.widgetsCategoryModal.hide();
        this.asanaWidgetObject = this.storage.get("selectedwidget");
        this.asanaSettingModal.show();
        break;
      case "pdf":
        this.widgetsCategoryModal.hide();
        this.pdfWidgetObject = this.storage.get("selectedwidget");
        this.pdfSettingModal.show();
        break;
      case "airtable":
        this.widgetsCategoryModal.hide();
        this.airTableWidgetObject = this.storage.get("selectedwidget");
        this.airtableSettingModal.show();
        break;
      case "microsoft_office_doc":
        this.widgetsCategoryModal.hide();
        this.microsoftOfficeWidgetObject = this.storage.get("selectedwidget");
        this.microsoftOfficeDocSettingModal.show();
        break;
      case "google_doc":
        this.widgetsCategoryModal.hide();
        this.googleDocWidgetObject = this.storage.get("selectedwidget");
        this.googleDocSettingModal.show();
        break;
      case "embed_website":
        this.widgetsCategoryModal.hide();
        this.embedWebsiteWidgetObject = this.storage.get("selectedwidget");
        this.embedWebsiteSettingModal.show();
        break;
      case "embed_html":
        this.widgetsCategoryModal.hide();
        this.embedHtmlWidgetObject = this.storage.get("selectedwidget");
        this.embedHtmlSettingModal.show();
        break;
      case "gif":
        this.widgetsCategoryModal.hide();
        this.gifWidgetObject = this.storage.get("selectedwidget");
        this.gifSettingModal.show();
        break;
      case "todo":
        this.widgetsCategoryModal.hide();
        this.todoWidgetObject = this.storage.get("selectedwidget");
        this.todoSettingModal.show();
        break;
      case "count_down":
        this.widgetsCategoryModal.hide();
        this.countDownWidgetObject = this.storage.get("selectedwidget");
        this.countDownSettingModal.show();
        break;
      case "chores":
        this.widgetsCategoryModal.hide();
        this.choresWidgetObject = this.storage.get("selectedwidget");
        this.choresSettingModal.show();
        break;
      case "mealplan":
        this.widgetsCategoryModal.hide();
        this.mealWidgetObject = this.storage.get("selectedwidget");
        this.mealSettingModal.show();
        break;
      default:
        break;
    }
  }

  observeLocalVariableChanges() {
    return new Observable<boolean>((observer) => {
      const intervalId = setInterval(() => {
        if (this.isDirty === false) {
          clearInterval(intervalId);
          observer.next(true);
          observer.complete();
        }
      }, 500);

      return () => {
        clearInterval(intervalId);
        observer.complete();
      };
    }).pipe(takeUntil(this.onDestroy));
  }

  createWidgetSetting(category) {
    if (this.isDirty == true) {
      if (this.widgetUpdateTimeOut) {
        clearTimeout(this.widgetUpdateTimeOut);
      }
      this.widgetUpdateTimeOut = null;
      this.loadingSpinner.show();
      this.updateWidgetSettingAPI(true);
    }
    this.isKeyTrue$ = this.observeLocalVariableChanges();

    this.isKeyTrue$.subscribe(() => {
      setTimeout(() => {
        let userMirrorModel = {
          id: this.userMirrorDetails.id,
        };

        if (category == "clock") {
          userMirrorModel["timeZoneId"] = this.userMirrorDetails.timeZoneId;
        }

        let mirrorPageModel = {
          pageNumber: this.activeLayout + 1,
        };

        let payload = {
          mirrorPageModel: mirrorPageModel,
          widgetSettingModel: {},
          widgetCalendarList: {},
        };

        let widgetSetting = this._widgetUtil.getWidgetSetting(category);
        widgetSetting["userMirror"] = userMirrorModel;
        payload["widgetCalendarList"] = [];
        payload["widgetSettingModel"] = widgetSetting;

        if (category == "weather") {
          let locationdetail = this.storage.get("location");
          if (locationdetail != undefined) {
            payload["location"] = locationdetail;
          }
        }

        this.loadingSpinner.show();
        this._widgetService.addNewWidget(payload).subscribe(
          (res: any) => {
            this.loadingSpinner.hide();
            let data = this.updateWidgets(res.object);
            this.storage.set("selectedwidget", data);
            this.loadWidget(this.category);
          },
          (err: any) => {
            this.loadingSpinner.hide();
            this.toastr.error(err.error.message);
          }
        );
      }, 500);
    });
  }

  updateWidgets(widgetSetting) {
    //let data = this.mapthedata(widgetSettingRequest);
    let data = widgetSetting.widget;
    if (this.widgetSettings.length >= this.activeLayout + 1) {
      for (let i = 0; i < this.widgetSettings.length; i++) {
        if (this.widgetSettings[i].pageNumber == this.activeLayout + 1) {
          this.widgetSettings[i].widgets.push(data);
          break;
        }
      }
    } else {
      let customObject = {
        currentFirmwareVersion: 1.42,
        delay: 10,
        isBackgroundImage: false,
        isTilled: false,
        pageId: widgetSetting.mirrorPage.id,
        pageNumber: this.activeLayout + 1,
        previewStatus: false,
        widgets: [data],
      };
      this.widgetSettings.push(customObject);
    }

    this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
    this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
    this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
    this.storage.set("widgetsSetting", this.widgetLayoutDetails.widgetSetting);
    return data;
  }

  mapthedata(widgetSettingRequest) {
    let data = {
      contentId: widgetSettingRequest.widget.id,
      contentType: widgetSettingRequest.widget.type,
      data: {},
      defaultHeight: 83,
      defaultMinHeight: 59,
      goalPriority: widgetSettingRequest.goalPriority,
      height: widgetSettingRequest.height,
      isSubscribed: true,
      minHeight: widgetSettingRequest.minHeight,
      minWidth: widgetSettingRequest.minWidth,
      pinned: false,
      status: "on",
      viewType: widgetSettingRequest.viewType,
      widgetBackgroundSettingModel: widgetSettingRequest.backgroundSetting,
      widgetMasterCategory: widgetSettingRequest.widget.masterCategory,
      widgetSettingId: widgetSettingRequest.id,
      width: widgetSettingRequest.width,
      xPos: widgetSettingRequest.xPos,
      yPos: widgetSettingRequest.yPos,
      displayName: widgetSettingRequest.widget.displayName,
    };
    return data;
  }

  removeWidgetSetting(widgetSetting, index, ispinnedWidgetDelete) {
    let user = this.storage.get("userDetails");
    let payload = {
      widgetSettingModel: {
        id: widgetSetting.widgetSettingId,
        userMirror: {
          id: this.userMirrorDetails.id,
          user: {
            id: user.id,
          },
          mirror: {
            deviceId: this.userMirrorDetails.mirror.deviceId,
          },
          userRole: this.userMirrorDetails.userRole,
        },
      },
      isCurrentPageDeletionRequired:
        this.widgetSettings[this.activeLayout].widgets.length == 1,
      pageNumber: this.activeLayout + 1,
    };

    this._widgetService.deleteExistingWidget(payload).subscribe(
      (res: any) => {
        this.loadingSpinner.hide();
        if (ispinnedWidgetDelete) {
          this.widgetSettings.forEach((page) => {
            for (let i = 0; i < page.widgets.length; i++) {
              if (
                page.widgets[i].widgetSettingId ===
                widgetSetting.widgetSettingId
              ) {
                page.widgets.splice(i, 1);
              }
            }
          });
        } else {
          this.widgetSettings[this.activeLayout].widgets.splice(
            this.selectedWidgetIndex,
            1
          );
        }
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this.storage.set(
          "widgetsSetting",
          this.widgetLayoutDetails.widgetSetting
        );
      },
      (err: any) => {
        this.toastr.error(err.error.message);
        this.loadingSpinner.hide();
      }
    );
  }

  openStack = function (index) {
    if (this.category == "stack") {
      this.category = undefined;
    } else {
      this.category = "stack";
    }
  };

  ClickedOut = function () {
    this.category = undefined;
  };

  openCategoryModal() {
    this.category = "categorySelection";
    this.widgetsCategoryModal.show();
  }
}
