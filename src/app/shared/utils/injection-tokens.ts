import {InjectionToken} from "@angular/core";

export const WINDOW: InjectionToken<Window> = new InjectionToken<Window>('The window object', {
  factory: () => window,
});
