import { Output, SimpleChanges } from "@angular/core";
import { Input } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { OnChanges } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { LocalStorageService } from "angular-web-storage";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { ToastrService } from "ngx-toastr";
import { DataService } from "src/app/service/data.service";
import { WidgetDataService } from "src/app/service/widget-data.service";
import { WidgetService } from "src/app/service/widget.service";
import {
  schedule_daysToShow,
  calendar_monthview_weeksToShow,
  calendar_weekview_weeksToShow,
  calendar_monthview_selectedMonth,
  calendar_monthview_dateSize,
  text_alignment,
  calendar_wrap_option,
} from "src/app/util/static-data";

@Component({
  selector: "app-calendar-widget-format",
  templateUrl: "./calendar-widget-format.component.html",
  styleUrls: ["./calendar-widget-format.component.scss"],
})
export class CalendarWidgetFormatComponent implements OnInit, OnChanges {
  @Output() closeModalEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() activeLayout: any;
  @Output() updateWidgetStatusEventEmiter = new EventEmitter<any>();
  @Input() category: string;
  @Input() calendarWidgetObject: any;

  calendarFormatData: any;
  calendarFormatFormGroup: FormGroup;
  calendar_monthview_weeksToShow = [...calendar_monthview_weeksToShow];
  calendar_weekview_weeksToShow = [...calendar_weekview_weeksToShow];
  calendar_monthview_selectedMonth = [...calendar_monthview_selectedMonth];
  calendar_wrap_option = [...calendar_wrap_option];
  calendar_monthview_dateSize = [...calendar_monthview_dateSize];
  calendar_monthview_dateAlignment = [...text_alignment];

  schedule_days = schedule_daysToShow;
  allignment = "Verticle";
  scrolling = "Off";
  image_size = "off";
  m_scroll = "Slow";
  calendarType = "List";
  currentTab: any = "List";
  weekStartWith: any = "Sunday";
  m_date_fontsize = "medium";
  m_date_allignment = "right";
  calendarCurrentFormatSetting: any;
  schedule_days_selection: any;
  isTimeSlotSelected: boolean = true;
  isEventCountDropDownVisible: boolean = false;
  isDp_event = false;

  //calendar widget api call moed
  widgetData: any;
  calendarEnabled: any = false;
  reminderEnabled: any = false;
  private widgetSettings = [];
  activeMirrorDetail: any;
  private widgetLayoutDetails: any;
  calenderWidget: any;
  calenderBgSettingOptions: any;
  selected_plan: any;
  week_time_slot_selection = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23,
  ];
  week_range = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  eventRangeSelection = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  dayRangeSelection = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30,
  ];

  calendarToggle: boolean = false;

  requestData = {
    isTimeSlotSelected: true,
    week_days_selection: "current_week",
    day_end_time: 17,
    day_start_time: 9,
    showLocation: true,
    showEndDate: false,
    w_weeksToShow: 2,
    m_weeksToShow: 1,
    m_selectedMonth: 0,
    showWeekDaysOnly: false,
    numberOfEvent: 5,
    word_wrap: "one_line",
    calendarType: "List",
    scrolling: "Off",
    image_size: "Off",
    weekStartWith: "Sunday",
    m_scroll: "Slow",
    schedule_days_selection: "current_week",
    schedule_title: true,
    m_date_fontsize: "small",
    m_date_allignment: "right",
    showLegends: false,
    list_event_type: "Tomorrow",
    isPastEventEnabled: true,
    isConcatEnabled: false,
    list_no_days: 5,
    isInprogressEventEnabled: true,
  };
  default_w_weeksToShow: number = 2;

  constructor(
    private formBuilder: FormBuilder,
    private _widgetService: WidgetService,
    private storage: LocalStorageService,
    private _dataService: DataService,
    private toastr: ToastrService,
    private loadingSpinner: Ng4LoadingSpinnerService,
    private widgetDataService: WidgetDataService
  ) {
    this.selected_plan = "current_week";
  }

  ngOnChanges(changes: any) {
    if (changes.calendarWidgetObject != undefined) {
      if (changes.calendarWidgetObject.currentValue != undefined) {
        this._dataService.getWidgetSettingsLayout().subscribe((data) => {
          this.widgetLayoutDetails = data;
          this.widgetSettings = data.widgetSetting;
        });
        this.calendarWidgetObject = changes.calendarWidgetObject.currentValue;
        this.calendarCurrentFormatSetting =
          this.calendarWidgetObject.data.calendarwidgetformat;
        this.initializeCalendarDetail(this.calendarCurrentFormatSetting);
      }
    }
  }

  ngOnInit() {
    if (this.calendarWidgetObject == undefined) {
      this.calendarCurrentFormatSetting = this.requestData;
    } else {
      this.calendarCurrentFormatSetting =
        this.calendarWidgetObject.data.calendarwidgetformat;
    }
    this.createCalendarFormatForm(this.calendarCurrentFormatSetting);

    this._dataService.getWidgetSettingsLayout().subscribe((data) => {
      this.widgetLayoutDetails = data;
      this.widgetData = data.widgetSetting;
    });
  }

  initializeCalendarDetail(calendarWidgetformat: any) {
    this.calendarCurrentFormatSetting = calendarWidgetformat;
    this.createCalendarFormatForm(this.calendarCurrentFormatSetting);
    this.activeMirrorDetail = this.storage.get("activeMirrorDetails");
  }

  createCalendarFormatForm(calendarFormatData) {
    if (calendarFormatData != undefined && calendarFormatData != null) {
      this.calendarType = calendarFormatData
        ? calendarFormatData.calendarType
        : this.calendarType;
      this.scrolling = calendarFormatData
        ? calendarFormatData.scrolling
        : this.scrolling;
      this.m_scroll = calendarFormatData
        ? calendarFormatData.m_scroll
        : this.m_scroll;
      this.image_size = calendarFormatData
        ? calendarFormatData.image_size
        : this.image_size;

      this.m_date_allignment = calendarFormatData
        ? calendarFormatData.m_date_allignment
        : this.m_date_allignment;

      this.m_date_fontsize = calendarFormatData
        ? calendarFormatData.m_date_fontsize
        : this.m_date_fontsize;

      this.weekStartWith = calendarFormatData
        ? calendarFormatData.weekStartWith
        : this.weekStartWith;

      this.isEventCountDropDownVisible = calendarFormatData
        ? calendarFormatData.list_event_type == "next_x_days" ||
          calendarFormatData.list_event_type == "next_x_event"
        : false;

      this.isDp_event = calendarFormatData
        ? calendarFormatData.list_event_type == "next_x_days" ||
          calendarFormatData.list_event_type == "Today"
        : false;

      this.calendarFormatFormGroup = this.formBuilder.group({
        showLocation: [
          calendarFormatData ? calendarFormatData.showLocation : true,
          Validators.requiredTrue,
        ],
        showEndDate: [
          calendarFormatData ? calendarFormatData.showEndDate : false,
          Validators.requiredTrue,
        ],
        numberOfEvent: [
          calendarFormatData.numberOfEvent
            ? calendarFormatData.numberOfEvent
            : 5,
          Validators.required,
        ],

        list_no_days: [
          calendarFormatData.list_no_days ? calendarFormatData.list_no_days : 5,
          Validators.required,
        ],

        isConcatEnabled: [
          calendarFormatData.isConcatEnabled
            ? calendarFormatData.isConcatEnabled
            : false,
          Validators.required,
        ],

        list_event_type: [
          calendarFormatData.list_event_type
            ? calendarFormatData.list_event_type
            : "Tomorrow",
          Validators.required,
        ],

        // schedule
        schedule_days_selection: [
          calendarFormatData
            ? calendarFormatData.schedule_days_selection
            : "current_week",
          Validators.required,
        ],
        day_start_time: [
          calendarFormatData ? calendarFormatData.day_start_time : 9,
          Validators.required,
        ],
        day_end_time: [
          calendarFormatData ? calendarFormatData.day_end_time : 17,
          Validators.required,
        ],
        showWeekDaysOnly: [
          calendarFormatData ? calendarFormatData.showWeekDaysOnly : false,
          Validators.required,
        ],
        schedule_title: [
          calendarFormatData ? calendarFormatData.schedule_title : true,
          Validators.required,
        ],

        // week month
        w_weeksToShow: [
          calendarFormatData
            ? calendarFormatData.w_weeksToShow
            : this.default_w_weeksToShow,
          Validators.required,
        ],
        m_weeksToShow: [
          calendarFormatData ? calendarFormatData.m_weeksToShow : 1,
          Validators.required,
        ],
        m_selectedMonth: [
          calendarFormatData ? calendarFormatData.m_selectedMonth : 0,
          Validators.required,
        ],
        word_wrap: [
          calendarFormatData ? calendarFormatData.word_wrap : false,
          Validators.required,
        ],
        isPastEventEnabled: [
          calendarFormatData ? calendarFormatData.isPastEventEnabled : true,
          Validators.required,
        ],
        isInprogressEventEnabled: [
          calendarFormatData
            ? calendarFormatData.isInprogressEventEnabled
            : true,
          Validators.required,
        ],
        // m_date_fontsize: [
        //   calendarFormatData ? calendarFormatData.m_date_fontsize : "small",
        //   Validators.required,
        // ],
        showLegends: [
          calendarFormatData ? calendarFormatData.showLegends : false,
          Validators.required,
        ],
        // m_date_allignment: [
        //   calendarFormatData ? calendarFormatData.m_date_allignment : "right",
        //   Validators.required,
        // ],
      });

      this.widgetDataService.widgetFormState["calendar"].settings.initialValue =
        {
          ...this.calendarFormatFormGroup.value,
          ...this.getCalendarSettingsAdditionalProps(),
        };
    }
  }

  getCalendarSettingsAdditionalProps() {
    return {
      calendarType: this.calendarType,
      image_size: this.image_size,
      m_date_allignment: this.m_date_allignment,
      m_date_fontsize: this.m_date_fontsize,
      m_scroll: this.m_scroll,
      scrolling: this.scrolling,
      weekStartWith: this.weekStartWith,
      id: this.calendarCurrentFormatSetting.id || null,
    };
  }

  dismissModel() {
    this.closeModalEvent.emit(true);
  }

  onCalendarSettingsSave(): void {
    this.updateWidgetStatusEventEmiter.emit();
  }

  oncalendarFormatEmit() {
    let payload = {
      userMirrorId: this.activeMirrorDetail.id,
      calendarWidgetFormattingModel: this.calendarFormatFormGroup.value,
      widgetSettingId: this.calendarWidgetObject.widgetSettingId,
    };
    delete payload.calendarWidgetFormattingModel.upNextSetting;

    if (this.calendarCurrentFormatSetting != undefined) {
      payload.calendarWidgetFormattingModel["id"] =
        this.calendarCurrentFormatSetting.id;
    }

    payload.calendarWidgetFormattingModel["calendarType"] = this.calendarType;
    payload.calendarWidgetFormattingModel["scrolling"] = this.scrolling;
    payload.calendarWidgetFormattingModel["image_size"] = this.image_size;
    payload.calendarWidgetFormattingModel["m_scroll"] = this.m_scroll;
    payload.calendarWidgetFormattingModel["weekStartWith"] = this.weekStartWith;

    payload.calendarWidgetFormattingModel["m_date_fontsize"] =
      this.m_date_fontsize;
    payload.calendarWidgetFormattingModel["m_date_allignment"] =
      this.m_date_allignment;
    this.loadingSpinner.show();
    this._widgetService.updateCalendarWidgetFormat(payload).subscribe(
      (res: any) => {
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId ===
              this.calendarWidgetObject.widgetSettingId
            ) {
              element.data.calendarwidgetformat = res.object;
              this.calendarWidgetObject.data.calendarwidgetformat = res.object;
            }
          });
        });

        this.storage.set("selectedwidget", this.calendarWidgetObject);
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this.storage.set("widgetsSetting", this.widgetSettings);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.loadingSpinner.hide();
        this.toastr.success("Calendar format updated Successfully");
        this.dismissModel();
      },
      (error: any) => {
        this.toastr.error(error.error.message);
        this.loadingSpinner.hide();
      }
    );
  }

  changeListEventType(list_event_type) {
    this.calendarFormatFormGroup.controls["list_event_type"].setValue(
      list_event_type
    );
    this.isEventCountDropDownVisible =
      this.calendarFormatFormGroup.controls["list_event_type"].value ==
        "next_x_days" ||
      this.calendarFormatFormGroup.controls["list_event_type"].value ==
        "next_x_event";
    this.isDp_event =
      this.calendarFormatFormGroup.controls["list_event_type"].value ==
        "next_x_days" ||
      this.calendarFormatFormGroup.controls["list_event_type"].value == "Today";
  }
}
