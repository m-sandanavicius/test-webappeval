import { Injectable } from "@angular/core";
import { LocalStorageService } from "angular-web-storage";
import { ToastrService } from "ngx-toastr";
import { LayoutRequest } from "../util/static-data";
import { DataService } from "./data.service";
import { WidgetService } from "./widget.service";
// import * as mimeTypes from "mime-types";
import mime from "mime";
import { transition } from "@angular/animations";
import { mergeMap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class CommonFunction {
  constructor(
    private layoutRequest: LayoutRequest,
    private _widgetService: WidgetService,
    private _dataService: DataService,
    private storage: LocalStorageService,
    private toastr: ToastrService
  ) {}

  createWidgetSettingObject(
    originalList: any,
    deviceHeight: any,
    deviceWidth: any
  ) {
    let filteredList = [];
    originalList.forEach((element) => {
      let localObj = {};
      localObj["pinned"] = element.pinned;
      localObj["xPos"] = element.xPos;
      localObj["yPos"] = element.yPos;
      localObj["height"] = element.height;
      localObj["width"] = element.width;
      localObj["minHeight"] = element.minHeight;
      localObj["minWidth"] = element.minWidth;
      localObj["deviceHeight"] = deviceHeight;
      localObj["deviceWidth"] = deviceWidth;
      localObj["viewType"] = element.viewType;
      localObj["status"] = element.status;
      localObj["goalPriority"] = element.goalPriority;
      localObj["id"] = element.widgetSettingId;
      localObj["zindex"] = element.zindex;
      element.widgetBackgroundSettingModel
        ? (localObj["backgroundSetting"] = element.widgetBackgroundSettingModel)
        : (localObj["backgroundSetting"] = null);
      localObj["widget"] = {
        id: element.contentId
      };
      filteredList.push(localObj);
    });
    return filteredList;
  }

  getGenericWidgetSettingModelList(widgetData: any, activeMirrorDetail: any) {
    let genericWidgetSettingModelList = [];
    let clockgreeting = this.storage.get("clockgreeting");
    widgetData.forEach((element) => {
      for (let i = 0; i < element.widgets.length; i++) {
        if (element.pageNumber !== 1 && element.widgets[i].pinned) {
          element.widgets.splice(i, 1);
          i--;
        }
      }

      // this is used to create page wise object which we need to send on backend for update
      let pageWidgetSettingModel = {
        widgets: this.createWidgetSettingObject(
          element.widgets,
          this.layoutRequest.payload.deviceHeight,
          this.layoutRequest.payload.deviceWidth
        ),
        userMirror: {
          userRole: activeMirrorDetail.userRole,
          mirror: {
            id: activeMirrorDetail.mirror.id
          },
          clockMessageStatus: clockgreeting != null ? clockgreeting : false
        },
        mirrorPage: {
          delay: element.delay,
          isTilled: element.isTilled,
          pageNumber: element.pageNumber,
          isBackgroundImage: element.isBackgroundImage,
          transition: element.transition,
          isAutoPageRotation: element.isAutoPageRotation
        }
      };
      genericWidgetSettingModelList.push(pageWidgetSettingModel);
    });
    return genericWidgetSettingModelList;
  }

  updateWidgetSettings(bgsettingOptions, payload) {
    if (bgsettingOptions && bgsettingOptions.id) {
      this._widgetService.updateWidgetBgSetting(payload).subscribe((res) => {
        this.getLayoutAPICall();
      });
    } else if (bgsettingOptions) {
      delete payload["widgetBackgroundSettingModel"]["id"];
      this._widgetService.addWidgetBgSetting(payload).subscribe((res) => {
        this.getLayoutAPICall();
      });
    }
  }

  updateWidgetSettings$(bgsettingOptions, payload) {
    if (bgsettingOptions && bgsettingOptions.id) {
      return this._widgetService
        .updateWidgetBgSetting(payload)
        .pipe(mergeMap((res) => this.getLayoutAPICall$()));
    } else if (bgsettingOptions) {
      delete payload["widgetBackgroundSettingModel"]["id"];
      return this._widgetService
        .addWidgetBgSetting(payload)
        .pipe(mergeMap((res) => this.getLayoutAPICall$()));
    }
  }

  getLayoutAPICall$() {
    let layoutRequestPayload: any = this.storage.get("layoutrequest");
    return this._widgetService.getwidgetLayoutSettings(
      layoutRequestPayload.payload
        ? layoutRequestPayload.payload
        : layoutRequestPayload
    );
  }

  getLayoutAPICall() {
    let layoutRequestPayload: any = this.storage.get("layoutrequest");
    this._widgetService
      .getwidgetLayoutSettings(
        layoutRequestPayload.payload
          ? layoutRequestPayload.payload
          : layoutRequestPayload
      )
      .subscribe(
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

  getFileMimeType(fileName: string): string {
    mime.define(
      {
        "image/jpeg": ["jfif"]
      },
      { force: true }
    );

    let mimeType = mime.getType(fileName);
    if (mimeType != null) {
      return mime.getType(fileName);
    } else {
      return "unknown/unknown";
    }
  }
}
