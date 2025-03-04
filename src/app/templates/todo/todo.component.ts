import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { LocalStorageService } from "angular-web-storage";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { ToastrService } from "ngx-toastr";
import { CommonFunction } from "src/app/service/common-function.service";
import { DataService } from "src/app/service/data.service";
import { IframilyService } from "src/app/service/iframily.service";
import { TodoService } from "src/app/service/todo.service";
import { WidgetBgSettingComponent } from "../widget-bg-setting/widget-bg-setting.component";
import { WidgetDataService } from "src/app/service/widget-data.service";
import { TodoWidgetFormatComponent } from "../todo-widget-format/todo-widget-format.component";

@Component({
  selector: "app-todo",
  templateUrl: "./todo.component.html",
  styleUrls: ["./todo.component.scss"]
})
export class TodoComponent implements OnInit, OnChanges {
  @ViewChild(WidgetBgSettingComponent, { static: false })
  widgetBgSettingComponent: WidgetBgSettingComponent;

  @ViewChild(TodoWidgetFormatComponent, { static: false })
  todoWidgetFormatComponent: TodoWidgetFormatComponent;

  @Input() todoWidgetObject: any;
  @Input() todoSettingModal: any;
  @Input() activeLayout: any;
  @Input() category: string;
  @Input() todoTaskCredentials: any;

  //comon veriables
  private widgetSettings: any;
  private widgetLayoutDetails: any;
  private widgetSettingId: number;
  private todoWidgetFormat: any;
  isAnySourceAdded: boolean = false;

  //background widget setting
  widgetType: any;
  widgetBgSetting: any;
  newBgSetting: any;

  //account
  accountList = [];
  projectList = [];
  previouslyAddedProjects = [];
  activeMirrorDetails: any;

  constructor(
    private toastr: ToastrService,
    private _todoService: TodoService,
    private _dataService: DataService,
    private commonFunction: CommonFunction,
    private storage: LocalStorageService,
    private _iframily: IframilyService,
    private formBuilder: FormBuilder,
    private loadingSpinner: Ng4LoadingSpinnerService,
    private widgetDataService: WidgetDataService
  ) {}

  ngOnChanges(changes: any) {
    if (
      this.todoTaskCredentials !== null &&
      this.todoTaskCredentials.type == "googletask"
    ) {
      if (this.todoTaskCredentials.code.includes("access_denied")) {
        this.storage.remove("googleTaskAuthCode");
        this.todoTaskCredentials = null;
      } else {
        let payload = {
          userMirrorModel: {
            mirror: {
              id: this.todoTaskCredentials.mirrorDetails.mirror.id
            },
            userRole: this.todoTaskCredentials.mirrorDetails.userRole
          },
          widgetSettingId: this.todoWidgetObject.widgetSettingId,
          authorizationCode: this.todoTaskCredentials.code
        };
        this.updateGoogleCredential(payload);
      }
    } else if (
      this.todoTaskCredentials !== null &&
      this.todoTaskCredentials.type == "outlookTask"
    ) {
      let payload = {
        userMirrorModel: {
          mirror: {
            id: this.todoTaskCredentials.mirrorDetails.mirror.id
          },
          userRole: this.todoTaskCredentials.mirrorDetails.userRole
        },
        widgetSettingId: this.todoWidgetObject.widgetSettingId,
        authorizationCode: this.todoTaskCredentials.code
      };
      this.updateOutlookCredential(payload);
    } else if (
      this.todoTaskCredentials !== null &&
      this.todoTaskCredentials.type == "todoist"
    ) {
      let payload = {
        userMirrorModel: {
          mirror: {
            id: this.todoTaskCredentials.mirrorDetails.mirror.id
          },
          userRole: this.todoTaskCredentials.mirrorDetails.userRole
        },
        widgetSettingId: this.todoWidgetObject.widgetSettingId,
        authorizationCode: this.todoTaskCredentials.code
      };
      this.updateTodoistCredential(payload);
    }

    if (changes.todoWidgetObject != undefined) {
      if (changes.todoWidgetObject.currentValue != undefined) {
        this.widgetSettingId = this.todoWidgetObject.widgetSettingId;
        this._dataService.getWidgetSettingsLayout().subscribe((data) => {
          this.widgetLayoutDetails = data;
          this.widgetSettings = data.widgetSetting;
          this.widgetBgSetting =
            changes.todoWidgetObject.currentValue.widgetBackgroundSettingModel;
        });
        this.todoWidgetFormat = this.todoWidgetObject.data.todowidgetformat;
        this.initializeToDo(this.todoWidgetObject);
      }
    }
  }

  ngOnInit() {}

  initializeToDo(todoWidgetObject: any) {
    this.accountList = todoWidgetObject.data.addedTodoTaskAccount;
    if (this.accountList.length > 0) {
      this.isAnySourceAdded = true;
    }
    this.previouslyAddedProjects = todoWidgetObject.data.selected_project;

    const previousTodosIds = [...this.previouslyAddedProjects].map(
      (chore) => chore.id
    );

    this.widgetDataService.widgetFormState[this.category].todos.initialValue =
      previousTodosIds;
  }

  saveTodoSettings() {
    this._dataService
      .getActiveMirrorDetails()
      .subscribe((data) => (this.activeMirrorDetails = data));

    let payload = {
      userMirrorModel: {
        id: this.activeMirrorDetails.id
      },
      widgetSettingId: this.todoWidgetObject.widgetSettingId,
      selectedTodoProject: this.previouslyAddedProjects
    };
    this.loadingSpinner.show();
    this._todoService.updateSelectedProject(payload).subscribe(
      (res: any) => {
        this.loadingSpinner.hide();
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId === this.todoWidgetObject.widgetSettingId
            ) {
              element.data.selected_project = res.object;
            }
          });
        });
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.todoSettingModal.hide();
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
        ...this.todoWidgetFormatComponent.todoFormatFormGroup.value,
        ...this.todoWidgetFormatComponent.getTodoSettingsAdditionalProps()
      }
    );

    if (isSettingsFormChanged) {
      this.todoWidgetFormatComponent.todoWidgetFormatUpdate();
      settingsForm.initialValue =
        this.todoWidgetFormatComponent.todoFormatFormGroup.value;
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

    // Checks if need to save todos form/tab
    const initialTodosIds =
      this.widgetDataService.widgetFormState[this.category].todos.initialValue;
    const initialTodosIdsSet = new Set(initialTodosIds);
    const currentTodosIdsSet = new Set(
      this.previouslyAddedProjects.map((todo) => todo.id)
    );

    const isSame =
      initialTodosIdsSet.size === currentTodosIdsSet.size &&
      initialTodosIds.every((item) => currentTodosIdsSet.has(item));

    if (!isSame) {
      this.saveTodoSettings();
    }

    this.todoSettingModal.hide();
  }

  saveBackgroundSettings(event) {
    this.newBgSetting = event;
    const calenderBgPayload = {
      userMirrorId: this.activeMirrorDetails.id,
      mastercategory: [this.todoWidgetObject.widgetMasterCategory],
      widgetBackgroundSettingModel: this.newBgSetting
    };
    this.commonFunction.updateWidgetSettings(
      this.newBgSetting,
      calenderBgPayload
    );
  }

  changeSelectedProjectStatus(
    accountIndex: number,
    projectIndex: number,
    projectId,
    accountId
  ) {
    if (this.accountList[accountIndex].projectList[projectIndex].active) {
      this.accountList[accountIndex].projectList[projectIndex].active = false;
      this.removeAddedProjectId(projectId, accountId);
    } else {
      this.accountList[accountIndex].projectList[projectIndex].active = true;
      let requestObject =
        this.accountList[accountIndex].projectList[projectIndex];
      let customData = {
        projectId: projectId,
        backgroundColor: requestObject.backgroundColor,
        forgroundColor: requestObject.forgroundColor,
        todoAccountId: requestObject.todoAccountId,
        etag: requestObject.etag,
        projectName: requestObject.projectName
      };
      this.previouslyAddedProjects.push(customData);
    }
  }

  removeAddedProjectId(projectId, accountId) {
    for (let i = 0; i < this.previouslyAddedProjects.length; i++) {
      if (
        this.previouslyAddedProjects[i].projectId == projectId &&
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
        for (let i = 0; i < this.previouslyAddedProjects.length; i++) {
          if (this.previouslyAddedProjects[i].todoAccountId === accountId) {
            this.previouslyAddedProjects.splice(i, 1);
            i--;
          }
        }
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (element.contentId === 208) {
              element.data.addedTodoTaskAccount = this.accountList;
              element.data.selected_project = this.previouslyAddedProjects;
            }
          });
        });
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this.loadingSpinner.hide();
        this.toastr.success("Account removed successfully");
      },
      (err: any) => {
        this.toastr.error(err.error.message);
        this.loadingSpinner.hide();
      }
    );
  }

  getTodoProjectList(accountIndex: any) {
    delete this.accountList[accountIndex]["projectList"];
    let accountDetails = this.accountList[accountIndex];
    this.loadingSpinner.show();
    this._todoService.getLatestTodoProjectList(accountDetails).subscribe(
      (res: any) => {
        this.accountList[accountIndex]["projectList"] =
          this.mapExistingProjectList(
            res.object,
            this.accountList[accountIndex].id
          );
        this.loadingSpinner.hide();
      },
      (err: any) => {
        this.toastr.error(err.error.message);
        this.loadingSpinner.hide();
      }
    );
  }

  checkIfprojectIdExist(projectId, accountId) {
    for (let i = 0; i < this.previouslyAddedProjects.length; i++) {
      if (this.previouslyAddedProjects[i].projectId == projectId) {
        if (this.previouslyAddedProjects[i].todoAccountId == accountId) {
          return this.previouslyAddedProjects[i];
        }
      }
    }
  }

  mapExistingProjectList(newProjects, accountId) {
    newProjects.forEach((element) => {
      let matchedElement = this.checkIfprojectIdExist(
        element.projectId,
        accountId
      );
      if (matchedElement != null || matchedElement != undefined) {
        element["active"] = true;
        element["backgroundColor"] = matchedElement.backgroundColor;
        element["forgroundColor"] = matchedElement.forgroundColor;
        element["id"] = matchedElement.id;
        element["projectName"] = matchedElement.projectName;
        element.etag = matchedElement["etag"];
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

  addGoogleAccount() {
    this._todoService.addGoogleTodoAccount().subscribe(
      (res: any) => {
        window.location = res.url;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  updateColour(projectId, accountId, color) {
    var project = null;
    for (let index = 0; index < this.previouslyAddedProjects.length; index++) {
      if (
        this.previouslyAddedProjects[index].projectId == projectId &&
        this.previouslyAddedProjects[index].todoAccountId == accountId
      ) {
        project = this.previouslyAddedProjects[index];
        project.backgroundColor = color;
        project.forgroundColor = color;
        break;
      }
    }
    if (project != null) {
      this.loadingSpinner.show();
      this._todoService
        .updateProjectColor(project, this.widgetSettingId)
        .subscribe(
          (res: any) => {
            this.loadingSpinner.hide();
          },
          (err: any) => {
            this.loadingSpinner.hide();
          }
        );
    }
  }

  updateGoogleCredential(payload: any) {
    this.loadingSpinner.show();
    this._todoService.updateGoogleTodoCredentials(payload).subscribe(
      (res: any) => {
        this.storage.remove("googleTaskAuthCode");
        let data = {
          id: res.object.todoAccountDetailModel.id,
          accountType: "google",
          sourceAccount: res.object.todoAccountDetailModel.sourceAccount,
          projectList: res.object.selectedTodoProject
        };

        this.accountList.push(data);

        if (
          res.object.selectedTodoProject != undefined ||
          res.object.selectedTodoProject != null
        ) {
          res.object.selectedTodoProject.forEach((element) => {
            this.previouslyAddedProjects.push(element);
          });
        }

        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId === this.todoWidgetObject.widgetSettingId
            ) {
              element.data.addedTodoTaskAccount = this.accountList;
              element.data.selected_project = this.previouslyAddedProjects;
              this.todoWidgetObject = element;
            }
          });
        });

        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("selectedwidget", this.todoWidgetObject);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this.todoTaskCredentials = null;
        this.loadingSpinner.hide();
      },
      (err: any) => {
        this.storage.remove("googleTaskAuthCode");
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

  addOutlookAccount() {
    this._todoService.addOutlookTodoAccount().subscribe(
      (res: any) => {
        window.location = res.url;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  updateOutlookCredential(payload: any) {
    this.loadingSpinner.show();
    this._todoService.updateOutlookTaskCredentials(payload).subscribe(
      (res: any) => {
        this.storage.remove("outlookTaskAuthCode");
        let data = {
          id: res.object.todoAccountDetailModel.id,
          accountType: "outlook",
          sourceAccount: res.object.todoAccountDetailModel.sourceAccount,
          projectList: res.object.selectedTodoProject
        };

        this.accountList.push(data);

        if (
          res.object.selectedTodoProject != undefined ||
          res.object.selectedTodoProject != null
        ) {
          res.object.selectedTodoProject.forEach((element) => {
            this.previouslyAddedProjects.push(element);
          });
        }

        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId === this.todoWidgetObject.widgetSettingId
            ) {
              element.data.addedTodoTaskAccount = this.accountList;
              element.data.selected_project = this.previouslyAddedProjects;
              this.todoWidgetObject = element;
            }
          });
        });

        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("selectedwidget", this.todoWidgetObject);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this.todoTaskCredentials = null;
        this.loadingSpinner.hide();
      },
      (err: any) => {
        this.storage.remove("outlookTaskAuthCode");
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
        this.loadingSpinner.hide();
        this.storage.remove("todoistTaskAuthCode");
        let data = {
          id: res.object.todoAccountDetailModel.id,
          accountType: "todoist",
          sourceAccount: res.object.todoAccountDetailModel.sourceAccount,
          projectList: res.object.selectedTodoProject
        };

        this.accountList.push(data);

        if (
          res.object.selectedTodoProject != undefined ||
          res.object.selectedTodoProject != null
        ) {
          res.object.selectedTodoProject.forEach((element) => {
            this.previouslyAddedProjects.push(element);
          });
        }

        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId === this.todoWidgetObject.widgetSettingId
            ) {
              element.data.addedTodoTaskAccount = this.accountList;
              element.data.selected_project = this.previouslyAddedProjects;
              this.todoWidgetObject = element;
            }
          });
        });

        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("selectedwidget", this.todoWidgetObject);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this.todoTaskCredentials = null;
      },
      (err: any) => {
        this.storage.remove("todoistTaskAuthCode");
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
    this.todoSettingModal.hide();
  }
}
