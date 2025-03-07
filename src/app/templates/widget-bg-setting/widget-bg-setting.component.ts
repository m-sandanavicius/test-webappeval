import {
  AfterViewInit,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
} from "@angular/core";
import { Component, OnInit } from "@angular/core";
import {
  Fonts,
  SupportedFontSize,
  text_alignment,
} from "src/app/util/static-data";

@Component({
  selector: "app-widget-bg-setting",
  templateUrl: "./widget-bg-setting.component.html",
  styleUrls: ["./widget-bg-setting.component.scss"],
})
export class WidgetBgSettingComponent
  implements OnInit, OnChanges, AfterViewInit
{
  availableFontSize: any[] = SupportedFontSize;
  defaultFontSize: any[] = [{ name: "auto fit", value: "default" }];
  supportedCustomTitleNameModification: any[] = [
    "calendar",
    "todo",
    "count_down",
    "chores",
    "mealplan",
    "clock",
    "quotes",
    "notes",
    "stickynotes",
    "weather",
  ];
  supportedCustomTitleModification: any[] = [
    ...this.supportedCustomTitleNameModification,
    "news",
  ];

  bgSettingOptions = {
    transparency: 5,
    blur: 0,
    shadow: false,
    corner: "square",
    backgroundColor: "#2c82fd",
    isMirrorBackgroundSettingEnabled: true,
    id: "",
    widgetname: "",
    isNameVisible: false,
    titleFontSize: "smallest",
    fontSize: "smallest",

    fontFamily: "Open Sans",
    fontColor: "#212529",

    titleFontFamily: "Open Sans",
    titleFontColor: "#212529",
    titleBackgroundColor: "#FCFCFC",
    titleAlignment: "center",
  };

  @Input() widgetType: any;

  @Input() widgetbgsetting: any;
  @Output() emitbgsettingOptions: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitbgsettingNewsOptions: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingQuotesOptions: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingWeatherOptions: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingCalenderOptions: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitMirrorbgsettingOptions: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingNoteOptions: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingHealthOptions: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingImageOptions: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingVideoOption: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingGoogleMapOption: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingMicrosoftDocOption: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingGoogleDocOption: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingAsanaOption: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingAirtableOption: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingTrelloOption: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingEmbedWebsiteOption: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() emitbgsettingEmbedHtmlOption: EventEmitter<any> =
    new EventEmitter<any>();
  @Output() closeModalEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitbgsettingPdfOption: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitbgsettingTodo: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitbgsettingCountDown: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitbgsettingChores: EventEmitter<any> = new EventEmitter<any>();
  @Output() emitbgsettingMealPlanOptions: EventEmitter<any> =
    new EventEmitter<any>();

  backgroundEffect: string = "Transparency";
  titleFontFamilyOptions: boolean = false;
  fontFamilyOptions: boolean = false;
  availableFontFamilies = [...Fonts];
  availableColorSelection = ["default", "custom color"];
  selectedFontColor: string = "default";
  selectedTitleFontColor: string = "default";
  selectedTitleBGColor: string = "default";
  selectedBGFormat: string = "default";
  availableBGFormatSelection = ["default", "custom format"];
  titleAlignment = [...text_alignment];
  customFontSizeWidget = [
    "calendar",
    "todo",
    "count_down",
    "chores",
    "mealplan",
  ];

  constructor() {
    let defaultFontFamily = {
      id: 0,
      googleFontName: "default",
      googleFontsPath: "",
      fontCategory: "default",
    };
    this.availableFontFamilies.unshift(defaultFontFamily);
  }
  ngAfterViewInit(): void {
    window.scrollTo(0, 0);
  }

  // Method to close dropdown if user clicks outside of the container
  @HostListener("document:click", ["$event"])
  closeDropdown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const dropdownContainer = document.querySelector(
      ".widget-bg-custom-select-container"
    );

    if (dropdownContainer != undefined && !dropdownContainer.contains(target)) {
      this.titleFontFamilyOptions = false;
      this.fontFamilyOptions = false;
    }
  }

  ngOnInit() {}

  toggleOptions(event: Event, type: string): void {
    if (type == "body") {
      this.fontFamilyOptions = !this.fontFamilyOptions;
    } else {
      this.titleFontFamilyOptions = !this.titleFontFamilyOptions;
    }

    event.stopPropagation();
  }

  selectOption(fontFamily: string, type: string): void {
    if (type == "body") {
      this.bgSettingOptions.fontFamily = fontFamily;
      this.fontFamilyOptions = false;
    } else {
      this.bgSettingOptions.titleFontFamily = fontFamily;
      this.titleFontFamilyOptions = false;
    }
  }

  ngOnChanges(changes: any) {
    if (changes.widgetType !== undefined) {
      if (changes.widgetType.currentValue !== undefined) {
        this.widgetType = changes.widgetType.currentValue;
      }
    }

    if (changes.widgetbgsetting !== undefined) {
      if (changes.widgetbgsetting.currentValue !== undefined) {
        this.bgSettingOptions = changes.widgetbgsetting.currentValue;

        if (this.bgSettingOptions.widgetname == undefined) {
          this.bgSettingOptions["widgetname"] = "";
        }

        if (this.bgSettingOptions.isMirrorBackgroundSettingEnabled == true) {
          this.selectedBGFormat = "default";
        } else {
          this.selectedBGFormat = "custom format";
        }

        if (this.bgSettingOptions.titleFontColor != "default") {
          this.selectedTitleFontColor = "custom color";
        }

        if (this.bgSettingOptions.titleBackgroundColor != "default") {
          this.selectedTitleBGColor = "custom color";
        }

        if (this.bgSettingOptions.fontColor != "default") {
          this.selectedFontColor = "custom color";
        }

        if (this.bgSettingOptions.blur == 0) {
          this.backgroundEffect = "Transparency";
        } else {
          this.backgroundEffect = "Blur";
        }
      }
    }
  }

  onGetBackgroundColor() {}

  onBackgroundOptionEmit() {
    if (this.selectedTitleBGColor == "default") {
      this.bgSettingOptions.titleBackgroundColor = "default";
    }

    if (this.selectedTitleFontColor == "default") {
      this.bgSettingOptions.titleFontColor = "default";
    }
    if (this.selectedFontColor == "default") {
      this.bgSettingOptions.fontColor = "default";
    }

    if (this.selectedBGFormat == "default") {
      this.bgSettingOptions.isMirrorBackgroundSettingEnabled = true;
    } else {
      this.bgSettingOptions.isMirrorBackgroundSettingEnabled = false;
    }

    if (this.backgroundEffect == "Transparency") {
      this.bgSettingOptions.blur = 0;
    } else {
      this.bgSettingOptions.transparency = 0;
    }

    if (this.bgSettingOptions.widgetname.trim() == "") {
      this.bgSettingOptions.isNameVisible = false;
    }

    if (this.widgetType.toLowerCase() === "calendar") {
      this.emitbgsettingCalenderOptions.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "clock") {
      this.emitbgsettingOptions.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "weather") {
      this.emitbgsettingWeatherOptions.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "news") {
      this.emitbgsettingNewsOptions.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "quotes") {
      this.emitbgsettingQuotesOptions.emit(this.bgSettingOptions);
    } else if (
      this.widgetType.toLowerCase() === "stickynotes" ||
      this.widgetType.toLowerCase() === "notes"
    ) {
      this.emitbgsettingNoteOptions.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "health") {
      this.emitbgsettingHealthOptions.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "image") {
      this.emitbgsettingImageOptions.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "video") {
      this.emitbgsettingVideoOption.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "google_map") {
      this.emitbgsettingGoogleMapOption.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "google_doc") {
      this.emitbgsettingGoogleDocOption.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "microsoft_office_doc") {
      this.emitbgsettingMicrosoftDocOption.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "asana") {
      this.emitbgsettingAsanaOption.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "trello") {
      this.emitbgsettingTrelloOption.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "airtable") {
      this.emitbgsettingAirtableOption.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "embed_website") {
      this.emitbgsettingEmbedWebsiteOption.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "embed_html") {
      this.emitbgsettingEmbedHtmlOption.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "pdf") {
      this.emitbgsettingPdfOption.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "todo") {
      this.emitbgsettingTodo.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "count_down") {
      this.emitbgsettingCountDown.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "chores") {
      this.emitbgsettingChores.emit(this.bgSettingOptions);
    } else if (this.widgetType.toLowerCase() === "mealplan") {
      this.emitbgsettingMealPlanOptions.emit(this.bgSettingOptions);
    }
  }

  dismissModel() {
    this.closeModalEvent.emit(true);
  }
}
