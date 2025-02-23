import { TestBed } from "@angular/core/testing";

import { WidgetDataService } from "./widget-data.service";

describe("WidgetDataService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: WidgetDataService = TestBed.get(WidgetDataService);
    expect(service).toBeTruthy();
  });
});
