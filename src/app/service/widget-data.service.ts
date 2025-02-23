import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class WidgetDataService {
  widgetFormState = {
    clock: {
      settings: {
        initialValue: {},
      },
      format: {
        initialValue: {},
      },
    },
  };

  isFormValueChanged(initialFormValue: any, currentFormValue: any): boolean {
    return Object.keys(initialFormValue).some(
      (key) => initialFormValue[key] !== currentFormValue[key]
    );
  }
}
