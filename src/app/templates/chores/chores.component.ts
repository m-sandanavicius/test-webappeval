import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { LocalStorageService } from "angular-web-storage";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { ToastrService } from "ngx-toastr";
import { CustomSortPipe } from "src/app/pipes/custom-sort.pipe";
import { CommonFunction } from "src/app/service/common-function.service";
import { DataService } from "src/app/service/data.service";
import { IframilyService } from "src/app/service/iframily.service";
import { TodoService } from "src/app/service/todo.service";
import { WidgetDataService } from "src/app/service/widget-data.service";
import { WidgetBgSettingComponent } from "../widget-bg-setting/widget-bg-setting.component";
import { ChoresWidgetFormatComponent } from "../chores-widget-format/chores-widget-format.component";

@Component({
  selector: "app-chores",
  templateUrl: "./chores.component.html",
  styleUrls: ["./chores.component.scss"]
})
export class ChoresComponent implements OnInit {
  @ViewChild(WidgetBgSettingComponent, { static: false })
  widgetBgSettingComponent: WidgetBgSettingComponent;

  @ViewChild(ChoresWidgetFormatComponent, { static: false })
  choresWidgetFormatComponent: ChoresWidgetFormatComponent;

  @Input() choresWidgetObject: any;
  @Input() choresSettingModal: any;
  @Input() activeLayout: any;
  @Input() category: string;
  @Input() choresTaskCredentials: any;

  //comon veriables
  private widgetSettings: any;
  private widgetLayoutDetails: any;
  private widgetSettingId: number;
  private choresWidgetFormat: any;
  isAnySourceAdded: boolean = false;

  //background widget setting
  widgetType: any;
  widgetBgSetting: any;
  newBgSetting: any;

  //account
  accountList = [];
  labelList = [];
  previouslyAddedProjects = [];
  activeMirrorDetails: any;

  constructor(
    private toastr: ToastrService,
    private _todoService: TodoService,
    private _dataService: DataService,
    private commonFunction: CommonFunction,
    private storage: LocalStorageService,
    private loadingSpinner: Ng4LoadingSpinnerService,
    private _customSortPipe: CustomSortPipe,
    private widgetDataService: WidgetDataService
  ) {}

  ngOnChanges(changes: any) {
    if (
      this.choresTaskCredentials !== null &&
      this.choresTaskCredentials.type == "chores"
    ) {
      let payload = {
        userMirrorModel: {
          mirror: {
            id: this.choresTaskCredentials.mirrorDetails.mirror.id
          },
          userRole: this.choresTaskCredentials.mirrorDetails.userRole
        },
        widgetSettingId: this.choresWidgetObject.widgetSettingId,
        authorizationCode: this.choresTaskCredentials.code,
        type: "chores"
      };
      this.updateTodoistCredential(payload);
    }

    if (changes.choresWidgetObject != undefined) {
      if (changes.choresWidgetObject.currentValue != undefined) {
        this.widgetSettingId = this.choresWidgetObject.widgetSettingId;
        this._dataService.getWidgetSettingsLayout().subscribe((data) => {
          this.widgetLayoutDetails = data;
          this.widgetSettings = data.widgetSetting;
          this.widgetBgSetting =
            changes.choresWidgetObject.currentValue.widgetBackgroundSettingModel;
        });
        this.choresWidgetFormat =
          this.choresWidgetObject.data.choresWidgetformat;
        this.initializeChores(this.choresWidgetObject);
      }
    }
  }

  ngOnInit() {}

  initializeChores(choresWidgetObject: any) {
    this.accountList = choresWidgetObject.data.addedTodoTaskAccount;
    let projects = choresWidgetObject.data.selected_project;
    if (this.accountList.length > 0) {
      this.isAnySourceAdded = true;
    }
    this.accountList.forEach((element) => {
      projects.forEach((project) => {
        if (element.id == project.todoAccountId) {
          if (element.projectList == undefined) {
            element["projectList"] = [];
          }
          element.projectList.push(project);
        }
      });
      element["labelList"] = [{ color: "", labelName: "", orderNumber: 1 }];
    });
    this.previouslyAddedProjects = choresWidgetObject.data.selected_labels;

    const previousChoresIds = [...this.previouslyAddedProjects].map(
      (chore) => chore.id
    );

    this.widgetDataService.widgetFormState[this.category].chores.initialValue =
      previousChoresIds;
  }

  saveChoresSettings() {
    this._dataService
      .getActiveMirrorDetails()
      .subscribe((data) => (this.activeMirrorDetails = data));

    let payload = {
      userMirrorModel: {
        id: this.activeMirrorDetails.id
      },
      widgetSettingId: this.choresWidgetObject.widgetSettingId,
      selectedTodoLabel: this.previouslyAddedProjects
    };
    this.loadingSpinner.show();
    this._todoService.updateSelectedLabels(payload).subscribe(
      (res: any) => {
        this.loadingSpinner.hide();
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId ===
              this.choresWidgetObject.widgetSettingId
            ) {
              element.data.selected_project = res.object;
            }
          });
        });
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.choresSettingModal.hide();
      },
      (err: any) => {
        this.loadingSpinner.hide();
        this.toastr.error(err.error.message, "Error");
      }
    );
  }

  save(): void {
    // Checks if need to save settings form
    const settingsForm =
      this.widgetDataService.widgetFormState[this.category].settings;

    const isSettingsFormChanged = this.widgetDataService.isFormValueChanged(
      settingsForm.initialValue,
      {
        ...this.choresWidgetFormatComponent.todoFormatFormGroup.value,
        ...this.choresWidgetFormatComponent.getChoresSettingsAdditionalProps()
      }
    );

    if (isSettingsFormChanged) {
      this.choresWidgetFormatComponent.todoWidgetFormatUpdate();
      settingsForm.initialValue =
        this.choresWidgetFormatComponent.todoFormatFormGroup.value;
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
    const initialChoresIds =
      this.widgetDataService.widgetFormState[this.category].chores.initialValue;
    const initialChoresIdsSet = new Set(initialChoresIds);
    const currentChoresIdsSet = new Set(
      this.previouslyAddedProjects.map((chore) => chore.id)
    );

    const isSame =
      initialChoresIdsSet.size === currentChoresIdsSet.size &&
      initialChoresIds.every((item) => currentChoresIdsSet.has(item));

    if (!isSame) {
      this.saveChoresSettings();
    }

    this.choresSettingModal.hide();
  }

  saveBackgroundSettings(event): void {
    this.newBgSetting = event;
    const calenderBgPayload = {
      userMirrorId: this.activeMirrorDetails.id,
      mastercategory: [this.choresWidgetObject.widgetMasterCategory],
      widgetBackgroundSettingModel: this.newBgSetting
    };
    this.commonFunction.updateWidgetSettings(
      this.newBgSetting,
      calenderBgPayload
    );
    this.choresSettingModal.hide();
  }

  changeSelectedProjectStatus(
    accountIndex: number,
    projectIndex: number,
    labelId,
    accountId
  ) {
    if (this.accountList[accountIndex].labelList[projectIndex].active) {
      this.accountList[accountIndex].labelList[projectIndex].active = false;
      this.removeAddedProjectId(labelId, accountId);
    } else {
      this.accountList[accountIndex].labelList[projectIndex].active = true;
      let requestObject =
        this.accountList[accountIndex].labelList[projectIndex];
      let customData = {
        labelId: labelId,
        color: requestObject.color,
        todoAccountId: requestObject.todoAccountId,
        labelName: requestObject.labelName,
        orderNumber: requestObject.orderNumber
      };
      this.previouslyAddedProjects.push(customData);
    }
  }

  removeAddedProjectId(labelId, accountId) {
    for (let i = 0; i < this.previouslyAddedProjects.length; i++) {
      if (
        this.previouslyAddedProjects[i].labelId == labelId &&
        this.previouslyAddedProjects[i].todoAccountId == accountId
      ) {
        this.previouslyAddedProjects.splice(i, 1);
      }
    }
  }

  removeAccount(accountId: any) {
    this.loadingSpinner.show();
    this._todoService.deleteTodoAccount(accountId).subscribe(
      (res: any) => {
        for (let i = 0; i < this.accountList.length; i++) {
          if (this.accountList[i].id === accountId) {
            this.accountList.splice(i, 1);
          }
        }
        if (this.accountList.length == 0) {
          this.isAnySourceAdded = false;
        }
        for (let i = 0; i < this.previouslyAddedProjects.length; i++) {
          if (this.previouslyAddedProjects[i].todoAccountId === accountId) {
            this.previouslyAddedProjects.splice(i, 1);
            i--;
          }
        }
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (element.contentId === 210) {
              element.data.addedTodoTaskAccount = this.accountList;
              element.data.selected_project = this.previouslyAddedProjects;
              if (
                element.widgetSettingId ===
                this.choresWidgetObject.widgetSettingId
              ) {
                this.choresWidgetObject = element;
              }
            }
          });
        });

        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this.storage.set("selectedwidget", this.choresWidgetObject);
        this.loadingSpinner.hide();
        this.toastr.success("Account removed successfully");
      },
      (err: any) => {
        this.toastr.error(err.error.message);
        this.loadingSpinner.hide();
      }
    );
  }

  getTodoLabels(accountIndex: any) {
    let accountDetails = Object.assign({}, this.accountList[accountIndex]);
    delete accountDetails["projectList"];
    delete accountDetails["labelList"];
    let payload = {
      todoAccountDetailModel: accountDetails,
      widgetSettingId: this.choresWidgetObject.widgetSettingId,
      type: "chores"
    };
    this.loadingSpinner.show();
    this._todoService.getLatestTodoLabels(payload).subscribe(
      (res: any) => {
        this.accountList[accountIndex]["labelList"] = this.sortByOrderNumber(
          this.mapExistingProjectList(
            res.object.selected_labels,
            this.accountList[accountIndex].id
          )
        );

        this.accountList[accountIndex]["projectList"] =
          res.object.selected_project;
        this.loadingSpinner.hide();
      },
      (err: any) => {
        this.toastr.error(err.error.message);
        this.loadingSpinner.hide();
      }
    );
  }

  checkIfprojectIdExist(labelId, accountId) {
    for (let i = 0; i < this.previouslyAddedProjects.length; i++) {
      if (this.previouslyAddedProjects[i].labelId == labelId) {
        if (this.previouslyAddedProjects[i].todoAccountId == accountId) {
          return this.previouslyAddedProjects[i];
        }
      }
    }
  }

  sortByOrderNumber(labels) {
    let sortedData = this._customSortPipe.transform(
      labels,
      "asc",
      "orderNumber"
    );
    return sortedData;
  }

  mapExistingProjectList(newProjects, accountId) {
    newProjects.forEach((element) => {
      let matchedElement = this.checkIfprojectIdExist(
        element.labelId,
        accountId
      );
      if (matchedElement != null || matchedElement != undefined) {
        element["active"] = true;
        element["labelId"] = matchedElement.labelId;
        element["id"] = matchedElement.id;
      } else {
        element["active"] = false;
      }
    });
    return newProjects;
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

  // updateColour(projectId, accountId, color) {
  //   var project = null;
  //   for (let index = 0; index < this.previouslyAddedProjects.length; index++) {
  //     if (
  //       this.previouslyAddedProjects[index].projectId == projectId &&
  //       this.previouslyAddedProjects[index].todoAccountId == accountId
  //     ) {
  //       project = this.previouslyAddedProjects[index];
  //       project.backgroundColor = color;
  //       project.forgroundColor = color;
  //       break;
  //     }
  //   }
  //   if (project != null) {
  //     this.loadingSpinner.show();
  //     this._todoService
  //       .updateProjectColor(project, this.widgetSettingId)
  //       .subscribe(
  //         (res: any) => {
  //           this.loadingSpinner.hide();
  //         },
  //         (err: any) => {
  //           this.loadingSpinner.hide();
  //         }
  //       );
  //   }
  // }

  addTodoistAccount() {
    this._todoService.addTodoistAccount().subscribe(
      (res: any) => {
        window.location = res.url;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  updateTodoistCredential(payload: any) {
    this.loadingSpinner.show();
    this._todoService.updateTodoiasCredentials(payload).subscribe(
      (res: any) => {
        this.isAnySourceAdded = true;
        this.loadingSpinner.hide();
        this.storage.remove("choresTodoistTaskAuthCode");
        let data = {
          id: res.object.todoAccountDetailModel.id,
          accountType: "todoist",
          sourceAccount: res.object.todoAccountDetailModel.sourceAccount,
          labelList: res.object.selectedLabels,
          projectList: res.object.selectedTodoProject
        };

        this.accountList.push(data);

        if (
          res.object.selectedLabels != undefined ||
          res.object.selectedLabels != null
        ) {
          res.object.selectedLabels.forEach((element) => {
            this.previouslyAddedProjects.push(element);
          });
        }

        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId ===
              this.choresWidgetObject.widgetSettingId
            ) {
              element.data.addedTodoTaskAccount = this.accountList;
              element.data.selected_labels = this.previouslyAddedProjects;
              this.choresWidgetObject = element;
            }
          });
        });

        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("selectedwidget", this.choresWidgetObject);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this.choresTaskCredentials = null;
      },
      (err: any) => {
        this.storage.remove("choresTodoistTaskAuthCode");
        this.loadingSpinner.hide();
        if (
          err.error.message ===
          "This Account is already Added, Please add another account."
        ) {
          this.toastr.error(err.error.message, "Error");
        } else {
          this.toastr.error(
            "Something went wrong while trying to add the account",
            "Error"
          );
        }
      }
    );
  }

  dismissModel() {
    this.choresSettingModal.hide();
  }
}
