import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { LocalStorageService } from "angular-web-storage";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { ToastrService } from "ngx-toastr";
import { DataService } from "src/app/service/data.service";
import { TodoService } from "src/app/service/todo.service";
import { WidgetDataService } from "src/app/service/widget-data.service";

@Component({
  selector: "app-chores-widget-format",
  templateUrl: "./chores-widget-format.component.html",
  styleUrls: ["./chores-widget-format.component.scss"]
})
export class ChoresWidgetFormatComponent implements OnInit {
  @Output() closeChoresModalEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() activeLayout: any;
  @Input() category: string;
  @Input() todoWidgetObject: any;

  @Output() updateWidgetStatusEventEmiter = new EventEmitter<any>();

  todoFormatData: any;
  todoFormatFormGroup: FormGroup;

  scrolling = "Off";
  todoCurrentFormatSetting: any;
  isEventCountDropDownVisible: boolean = false;
  isDp_event = false;

  //calendar widget api call moed
  widgetData: any;
  private widgetSettings = [];
  activeMirrorDetail: any;
  private widgetLayoutDetails: any;
  calenderWidget: any;
  selected_plan: any;
  week_range = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  eventRangeSelection = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  dayRangeSelection = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30
  ];

  calendarToggle: boolean = false;

  requestData = {
    showEndDate: false,
    numberOfEvent: 5,
    scrolling: "Off",
    task_duration: "all_task",
    isPastEventEnabled: true,
    numberOfDays: 5,
    isOverDueTaskVisible: true,
    isTaskAutoComplete: true
  };

  constructor(
    private formBuilder: FormBuilder,
    private _todoService: TodoService,
    private storage: LocalStorageService,
    private _dataService: DataService,
    private toastr: ToastrService,
    private loadingSpinner: Ng4LoadingSpinnerService,
    private widgetDataService: WidgetDataService
  ) {}

  ngOnChanges(changes: any) {
    if (changes.todoWidgetObject != undefined) {
      if (changes.todoWidgetObject.currentValue != undefined) {
        this._dataService.getWidgetSettingsLayout().subscribe((data) => {
          this.widgetLayoutDetails = data;
          this.widgetSettings = data.widgetSetting;
        });
        this.todoWidgetObject = changes.todoWidgetObject.currentValue;
        this.todoCurrentFormatSetting =
          this.todoWidgetObject.data.todowidgetformat;
        this.initializeTodoFormat(this.todoCurrentFormatSetting);
      }
    }
  }

  initializeTodoFormat(todoFormatData) {
    this.activeMirrorDetail = this.storage.get("activeMirrorDetails");

    if (todoFormatData != undefined && todoFormatData != null) {
      this.scrolling = todoFormatData
        ? todoFormatData.scrolling
        : this.requestData.scrolling;

      this.isEventCountDropDownVisible = todoFormatData
        ? todoFormatData.task_duration == "next_x_days" ||
          todoFormatData.task_duration == "next_x_event"
        : false;

      this.isDp_event = todoFormatData
        ? todoFormatData.task_duration == "next_x_days" ||
          todoFormatData.task_duration == "Today"
        : false;

      this.todoFormatFormGroup = this.formBuilder.group({
        showEndDate: [
          todoFormatData ? todoFormatData.showEndDate : false,
          Validators.requiredTrue
        ],

        taskEditEnable: [
          todoFormatData ? todoFormatData.taskEditEnable : false,
          Validators.requiredTrue
        ],

        showCompletedTask: [
          todoFormatData ? todoFormatData.showCompletedTask : false,
          Validators.requiredTrue
        ],

        numberOfEvent: [
          todoFormatData.numberOfEvent ? todoFormatData.numberOfEvent : 5,
          Validators.required
        ],

        numberOfDays: [
          todoFormatData.numberOfDays ? todoFormatData.numberOfDays : 5,
          Validators.required
        ],

        task_duration: [
          todoFormatData.task_duration ? todoFormatData.task_duration : "Today",
          Validators.required
        ],

        isPastEventEnabled: [
          todoFormatData ? todoFormatData.isPastEventEnabled : true,
          Validators.required
        ],

        isOverDueTaskVisible: [
          todoFormatData ? todoFormatData.isOverDueTaskVisible : false,
          Validators.required
        ],

        isTaskAutoComplete: [
          todoFormatData ? todoFormatData.isTaskAutoComplete : false,
          Validators.required
        ]
      });

      this.widgetDataService.widgetFormState[
        this.category
      ].settings.initialValue = {
        ...this.todoFormatFormGroup.value,
        ...this.getChoresSettingsAdditionalProps()
      };
    }
  }

  ngOnInit() {
    if (this.todoWidgetObject == undefined) {
      this.todoCurrentFormatSetting = this.requestData;
    } else {
      this.todoCurrentFormatSetting =
        this.todoWidgetObject.data.calendarwidgetformat;
    }
    this.initializeTodoFormat(this.todoCurrentFormatSetting);

    this._dataService.getWidgetSettingsLayout().subscribe((data) => {
      this.widgetLayoutDetails = data;
      this.widgetData = data.widgetSetting;
    });
  }

  dismissModel() {
    this.closeChoresModalEvent.emit(true);
  }

  updateTaskDuration(newDuration) {
    this.todoFormatFormGroup.controls["task_duration"].setValue(newDuration);
    this.isEventCountDropDownVisible =
      this.todoFormatFormGroup.controls["task_duration"].value ==
        "next_x_days" ||
      this.todoFormatFormGroup.controls["task_duration"].value ==
        "next_x_event";
    this.isDp_event =
      this.todoFormatFormGroup.controls["task_duration"].value ==
        "next_x_days" ||
      this.todoFormatFormGroup.controls["task_duration"].value == "Today";
  }

  onChoresSettingsSave(): void {
    this.updateWidgetStatusEventEmiter.emit();
  }

  getChoresSettingsAdditionalProps() {
    return {
      scrolling: this.scrolling,
      id: this.todoCurrentFormatSetting.id || null
    };
  }

  todoWidgetFormatUpdate() {
    let payload = {
      userMirrorId: this.activeMirrorDetail.id,
      todoWidgetSettingModel: this.todoFormatFormGroup.value,
      widgetSettingId: this.todoWidgetObject.widgetSettingId
    };

    if (this.todoCurrentFormatSetting != undefined) {
      payload.todoWidgetSettingModel["id"] = this.todoCurrentFormatSetting.id;
    }
    payload.todoWidgetSettingModel["scrolling"] = this.scrolling;
    this.loadingSpinner.show();
    this._todoService.updateToDoWidgetFormat(payload).subscribe(
      (res: any) => {
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId === this.todoWidgetObject.widgetSettingId
            ) {
              element.data.todowidgetformat = res.object;
              this.todoWidgetObject.data.todowidgetformat = res.object;
            }
          });
        });

        this.todoCurrentFormatSetting =
          this.todoWidgetObject.data.todowidgetformat;
        this.storage.set("selectedwidget", this.todoWidgetObject);
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this.storage.set("widgetsSetting", this.widgetSettings);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.loadingSpinner.hide();
        this.toastr.success("Todo format updated Successfully");
        this.dismissModel();
      },
      (error: any) => {
        this.toastr.error(error.error.message);
        this.loadingSpinner.hide();
      }
    );
  }
}
