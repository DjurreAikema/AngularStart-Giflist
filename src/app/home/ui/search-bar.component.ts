import {Component, input, InputSignal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <mat-toolbar>
      <mat-form-field appearance="outline">
        <input matInput placeholder="subreddit..." type="text"
          [formControl]="subredditFormControl()"/>
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </mat-toolbar>
  `,
  styles: [
    `
      mat-toolbar {
        height: 80px;
      }

      mat-form-field {
        width: 100%;
        padding-top: 20px;
      }
    `,
  ],
})
export class SearchBarComponent {

  subredditFormControl: InputSignal<FormControl> = input.required<FormControl>();

}
