import {
  Component,
  OnInit,
  OnChanges,
  ViewChild,
  ElementRef,
  NgZone,
  Output,
  Input,
  EventEmitter,
  AfterViewInit
} from "@angular/core";
import { WidgetService } from "src/app/service/widget.service";
import { LocalStorageService } from "angular-web-storage";
import { DataService } from "src/app/service/data.service";
import { MapsAPILoader } from "@agm/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { ProfileService } from "src/app/service/profile.service";
import { CommonFunction } from "src/app/service/common-function.service";
import { WidgetBackgroundSetting } from "src/app/util/static-data";
import { WeatherService } from "src/app/service/weather.service";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { WidgetDataService } from "src/app/service/widget-data.service";
import { WidgetBgSettingComponent } from "../widget-bg-setting/widget-bg-setting.component";

@Component({
  selector: "app-weather-setting",
  templateUrl: "./weather-setting.component.html",
  styleUrls: ["./weather-setting.component.scss"]
})
export class WeatherSettingComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @ViewChild(WidgetBgSettingComponent, { static: false })
  widgetBgSettingComponent: WidgetBgSettingComponent;

  @Input() weatherSettingModal: any;
  @Input() category: string;
  @Input() activeLayout: any;
  @Input() weatherWidgetObject: any;

  // @Output() updateWeatherStatusEventEmiter = new EventEmitter<any>();

  autocompleteInput: string;
  currentLocation: boolean = true;
  isLocationAccess: boolean = false;
  weatherType: string;

  public searchControl: FormControl;
  initAddress: any;

  latitude: number;
  longitude: number;
  address: string = "";
  oldAddress: any;
  private geoCoder;

  activeMirrorDetail: any;
  widgetSettings: any;
  backupNewsPerIteration: any;
  measureUnitData: any;
  widgetLayoutDetails: any;
  private autocomplete: any;

  @ViewChild("search", { static: true })
  public searchElementRef: ElementRef;
  weatherWidget: any;
  settingDisplayflag: any;
  activeMirrorDetails: any;

  //background widget setting
  widgetType: any;
  widgetBgSetting: any;
  newBgSetting: any;
  weatherWidgetData: any;

  fg: FormGroup;
  WeatherType = WeatherType;
  initialAddress: string;

  constructor(
    private _weatherService: WeatherService,
    private storage: LocalStorageService,
    private _dataService: DataService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private toastr: ToastrService,
    private _profileService: ProfileService,
    private commonFunction: CommonFunction,
    private loadingSpinner: Ng4LoadingSpinnerService,
    private widgetDataService: WidgetDataService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.fg = this.formBuilder.group({
      weatherType: [],
      temperatureUnit: [""]
    });
  }

  ngAfterViewInit() {
    this.searchControl = new FormControl();

    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();
      this.autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement
      );

      this.autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult =
            this.autocomplete.getPlace();

          //verify result
          if (
            place == null ||
            place.geometry === undefined ||
            place.geometry === null
          ) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.address = place.formatted_address;
          let location = {
            latitude: this.latitude,
            longitude: this.longitude,
            locationName: this.address
          };
          this.storage.set("location", location);
        });
      });
    });
  }

  selectWeatherLocation(event: any) {
    if (event.target.value == "true") {
      this.currentLocation = false;
    } else {
      this.currentLocation = true;
    }
  }

  // Get Current Location Coordinates
  setCurrentLocation() {
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.latitude = position.coords.latitude;
            this.longitude = position.coords.longitude;
            let location = {
              latitude: this.latitude,
              longitude: this.longitude,
              address: this.address
            };
            this.storage.set("location", location);
            this.getAddress(this.latitude, this.longitude);
            this.isLocationAccess = true;
          },
          (error) => {
            this.isLocationAccess = false;
            console.warn(`ERROR(${error.code}): ${error.message}`);
          }
        );
      }
    } catch (error) {
      console.log(error);
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

  ngOnChanges(changes: any) {
    if (
      changes.weatherWidgetObject &&
      changes.weatherWidgetObject.currentValue != undefined
    ) {
      this._dataService.getWidgetSettingsLayout().subscribe((data) => {
        this.widgetLayoutDetails = data;
        this.widgetSettings = data.widgetSetting;
      });
      let locationDetails =
        this.weatherWidgetObject.data.weatherWidgetDetail.location;
      if (locationDetails != null && locationDetails != undefined) {
        // this.storage.set("location", locationDetails);
        this.address = locationDetails.locationName;
        this.initialAddress = locationDetails.locationName;
      }
      this.weatherWidgetData =
        this.weatherWidgetObject.data.weatherWidgetDetail;
      this.weatherType =
        this.weatherWidgetObject.data.weatherWidgetDetail.weatherType;

      this.widgetDataService.widgetFormState.weather.settings.currentValue[
        "weatherType"
      ] = this.weatherWidgetObject.data.weatherWidgetDetail.weatherType;

      this.fg.controls.weatherType.setValue(
        this.weatherWidgetObject.data.weatherWidgetDetail.weatherType
      );

      // set initial value of settings form
      this.widgetDataService.widgetFormState.weather.settings.initialValue = {
        ...this.fg.value
      };
    }
    this.setBackgroundWidgetDetail();
    let userData = this.storage.get("userDetails");
    this.measureUnitData = {
      temperatureUnit: {
        unit: userData.temperatureUnit,
        measure: ["Celsius", "Fahrenheit"],
        activeUnit: userData.temperatureUnit
      }
    };
  }

  getAddress(latitude, longitude) {
    let data = {
      location: {
        lat: latitude,
        lng: longitude
      }
    };

    this.geoCoder.geocode(data, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          this.address =
            results[0].address_components[0].long_name +
            " , " +
            results[0].address_components[1].long_name;
        } else {
          window.alert("No results found");
        }
        let localLocationData = this.storage.get("location");
        localLocationData.address = this.address;
        this.storage.set("location", localLocationData);
      } else {
        window.alert("Geocoder failed due to: " + status);
      }
    });
  }

  setDisplayFlagAndData(element) {
    this.activeMirrorDetails = this.storage.get("activeMirrorDetails");
    this.widgetBgSetting = element.widgetBackgroundSettingModel;
  }

  save(): void {
    // Checks if need to save settings form
    const settingsForm =
      this.widgetDataService.widgetFormState.weather.settings;

    const isSettingsFormChanged = this.widgetDataService.isFormValueChanged(
      settingsForm.initialValue,
      this.fg.value
    );
    const { locationName } = this.storage.get("location");

    if (isSettingsFormChanged || this.initialAddress !== locationName) {
      this.saveWeatherchanges();
      settingsForm.initialValue = this.fg.value;
    }

    // Checks if need to save format form
    const formatForm = this.widgetDataService.widgetFormState.weather.format;

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

    this.weatherSettingModal.hide();
  }

  saveBackgroundSettings(event): void {
    this.newBgSetting = event;
    const weatherBgPayload = {
      userMirrorId: this.activeMirrorDetails.id,
      mastercategory: ["weather"],
      widgetBackgroundSettingModel: this.newBgSetting
    };
    this.commonFunction.updateWidgetSettings(
      this.newBgSetting,
      weatherBgPayload
    );
    this.weatherSettingModal.hide();
  }

  saveWeatherchanges(): void {
    var location = this.storage.get("location");
    if (location == undefined) {
      location = this.weatherWidgetData.location;
    }
    let payload = {};
    payload["id"] = this.weatherWidgetData.id;
    payload["widgetSetting"] = {
      id: this.weatherWidgetObject.widgetSettingId
    };
    payload["weatherType"] = this.weatherType;
    if (location != null) {
      let locationData = {
        locationName: location.locationName,
        longitude: location.longitude,
        latitude: location.latitude,
        language: location.language
      };
      if (location.id != undefined) {
        locationData["id"] = location.id;
      }
      payload["location"] = locationData;
    }
    this.loadingSpinner.show();
    this._weatherService.updateWeatherSetting(payload).subscribe(
      (res: any) => {
        this.loadingSpinner.hide();
        this.widgetSettings.forEach((widgetPageData) => {
          widgetPageData.widgets.forEach((element) => {
            if (
              element.widgetSettingId ===
              this.weatherWidgetObject.widgetSettingId
            ) {
              element.data.weatherWidgetDetail = res.object.weatherWidgetDetail;
              element.displayName = res.object.displayName;
              element.widgetBackgroundSettingModel.widgetname =
                res.object.weatherWidgetDetail.location.locationName;
              this.storage.set("selectedwidget", element);
              delete res.object.weatherWidgetDetail.location.lastAccessTime;
              this.storage.set(
                "location",
                res.object.weatherWidgetDetail.location
              );
              this.setBackgroundWidgetDetail();
            }
          });
        });
        this.widgetLayoutDetails.widgetSetting = this.widgetSettings;
        this.storage.set("activeWidgetDetails", this.widgetLayoutDetails);
        this._dataService.setWidgetSettingsLayout(this.widgetLayoutDetails);
        this.weatherSettingModal.hide();
      },
      (err: any) => {
        this.loadingSpinner.hide();
        this.toastr.error(err.error.message);
      }
    );
  }

  onUnitMeasureChanges(newUnit: string): void {
    this.measureUnitData.temperatureUnit.activeUnit = newUnit;
    let payload: any = {
      temperatureUnit: this.measureUnitData.temperatureUnit.activeUnit
    };
    this.fg.get("temperatureUnit").setValue(newUnit);

    this._profileService.updateUnitMeasuresAPI(payload).subscribe(
      (res: any) => {
        this.toastr.success(res.message, "Success");
        let userData = this.storage.get("userDetails");
        userData.temperatureUnit = payload.temperatureUnit;
        this.storage.set("userDetails", userData);
      },
      (err: any) => {
        this.toastr.error("Something went wrong, Please try again.", "Error");
      }
    );
  }

  setWeatherType(weatherType: string): void {
    this.fg.controls.weatherType.setValue(weatherType);
  }

  dismissModel() {
    this.weatherSettingModal.hide();
  }
}

enum WeatherType {
  TodayWeather = "Today's Weather",
  WeatherForecast24Hours = "24 Hour Weather Forecast",
  WeatherForecast5Days = "5 Day Weather Forecast"
}
