import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class WidgetDataService {
  widgetFormState = {
    clock: {
      settings: {
        initialValue: {}
      },
      format: {
        initialValue: {}
      }
    },
    weather: {
      settings: {
        initialValue: {},
        currentValue: {}
      },
      format: {
        initialValue: {},
        currentValue: {}
      }
    },
    quotes: {
      settings: {
        initialValue: {}
      },
      format: {
        initialValue: {}
      }
    },
    news: {
      settings: {
        initialValue: {}
      },
      format: {
        initialValue: {}
      }
    },
    count_down: {
      settings: {
        initialValue: {}
      },
      format: {
        initialValue: {}
      }
    },
    notes: {
      settings: {
        initialValue: {}
      },
      format: {
        initialValue: {}
      }
    },
    calendar: {
      calendars: {
        initialValue: {}
      },
      settings: {
        initialValue: {}
      },
      format: {
        initialValue: {}
      }
    },
    chores: {
      chores: {
        initialValue: {}
      },
      settings: {
        initialValue: {}
      },
      format: {
        initialValue: {}
      }
    },
    todo: {
      todos: {
        initialValue: {}
      },
      settings: {
        initialValue: {}
      },
      format: {
        initialValue: {}
      }
    },
    mealplan: {
      calendars: {
        initialValue: {}
      },
      settings: {
        initialValue: {}
      },
      format: {
        initialValue: {}
      }
    }
  };

  isFormValueChanged(initialFormValue: any, currentFormValue: any): boolean {
    return Object.keys(initialFormValue).some(
      (key) => initialFormValue[key] !== currentFormValue[key]
    );
  }
}
