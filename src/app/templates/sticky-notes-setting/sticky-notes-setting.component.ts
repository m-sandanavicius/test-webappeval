import { Component, OnInit, Input, OnChanges, ViewChild } from "@angular/core";
import { AngularEditorConfig } from "@kolkov/angular-editor";
import { DataService } from "src/app/service/data.service";
import { LocalStorageService } from "angular-web-storage";
import { CommonFunction } from "src/app/service/common-function.service";
import { NotesService } from "src/app/service/notes.service";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { ToastrService } from "ngx-toastr";
import { WidgetDataService } from "src/app/service/widget-data.service";
import { WidgetBgSettingComponent } from "../widget-bg-setting/widget-bg-setting.component";

@Component({
  selector: "app-sticky-notes-setting",
  templateUrl: "./sticky-notes-setting.component.html",
  styleUrls: ["./sticky-notes-setting.component.scss"]
})
export class StickyNotesSettingComponent implements OnInit, OnChanges {
  @ViewChild(WidgetBgSettingComponent, { static: false })
  widgetBgSettingComponent: WidgetBgSettingComponent;

  @Input() notesSettingModal: any;
  @Input() category: string;
  @Input() activeLayout: any;
  @Input() notesWidgetObject: any;

  notesBodyContent = undefined;
  widgetSettings = [];
  settingDisplayflag: any;
  activeMirrorDetails: any;

  //background widget setting
  widgetType: any;
  widgetBgSetting: any;
  newBgSetting: any;
  widgetLayoutDetails: any;
  oldData: any;

  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: "5rem",
    sanitize: false,
    placeholder: "Enter text here...",
    translate: "no",
    defaultParagraphSeparator: "p",
    toolbarHiddenButtons: [
      [
        "redo",
        "undo",
        "subscript",
        "superscript",
        "indent",
        "outdent",
        "heading",
        "justifyFull",
        "link",
        "unlink",
        "insertVideo",
        "insertImage",
        "fontSize",
        "fontName",
        "heading"
      ]
    ]
  };

  constructor(
    private _dataService: DataService,
    private storage: LocalStorageService,
    private toastr: ToastrService,
    private _notesService: NotesService,
    private commonFunction: CommonFunction,
    private loadingSpinner: Ng4LoadingSpinnerService,
    private widgetDataService: WidgetDataService
  ) {}

  ngOnInit() {}

  ngOnChanges(change: any) {
    if (
      change.notesWidgetObject &&
      change.notesWidgetObject.currentValue != undefined
    ) {
      this._dataService.getWidgetSettingsLayout().subscribe((data) => {
        this.widgetLayoutDetails = data;
        this.widgetSettings = data.widgetSetting;
      });

      if (this.notesWidgetObject != undefined) {
        if (this.notesWidgetObject.data != null) {
          this.oldData = this.notesWidgetObject.data;

          this.widgetDataService.widgetFormState[
            this.category
          ].settings.initialValue =
            this.notesWidgetObject.data.notesWidgetDetail.notesData || "";
        }
        this.setBackgroundWidgetDetail();
        this.openTextEditorToAddNewNote();
      }
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

  openTextEditorToAddNewNote() {
    if (this.notesWidgetObject != null) {
      if (
        this.notesWidgetObject.data.notesWidgetDetail.notesData != undefined
      ) {
        this.notesBodyContent =
          this.notesWidgetObject.data.notesWidgetDetail.notesData;
      } else {
        this.notesBodyContent = undefined;
      }
    } else {
      this.notesBodyContent = undefined;
    }
  }

  save(): void {
    // Checks if need to save settings form
    const settingsForm =
      this.widgetDataService.widgetFormState[this.category].settings;

    if (this.notesBodyContent !== settingsForm.initialValue) {
      this.saveNotesSetting();
      settingsForm.initialValue = this.notesBodyContent;
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

    this.notesSettingModal.hide();
  }

  saveNotesSetting() {
    let payload = {
      id: this.notesWidgetObject.data.notesWidgetDetail.id,
      notesData: this.notesBodyContent,
      widgetSetting: {
        id: this.notesWidgetObject.widgetSettingId
      }
    };

    this.loadingSpinner.show();
    this._notesService.updateNotesSetting(payload).subscribe(
      (res: any) => {
        this.loadingSpinner.hide();
        this.toastr.success(res.message, "Success");
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId === this.notesWidgetObject.widgetSettingId
            ) {
              element.data.notesWidgetDetail = res.object;
            }
          });
        });
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
      },
      (err: any) => {
        this.loadingSpinner.hide();
        this.toastr.error(err.error.message, "Error");
      }
    );
  }

  saveBackgroundSettings(event) {
    this.newBgSetting = event;
    const stickyBgPayload = {
      userMirrorId: this.activeMirrorDetails.id,
      mastercategory: [this.notesWidgetObject.widgetMasterCategory],
      widgetBackgroundSettingModel: this.newBgSetting
    };
    this.commonFunction.updateWidgetSettings(
      this.newBgSetting,
      stickyBgPayload
    );
  }

  setDisplayflag() {
    this.settingDisplayflag = true;
  }

  dismissModel() {
    if (this.notesWidgetObject.data != undefined) {
      this.notesWidgetObject.data = this.oldData;
    }
    this.notesSettingModal.hide();
  }

  dismissModal() {
    this.notesSettingModal.hide();
  }
}
