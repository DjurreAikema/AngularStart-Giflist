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
      <button class="main-button-warning clear-button" (click)="subredditFormControl().reset()">
        <mat-icon>close</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: [`
    mat-toolbar {
      height: 80px;
      background-color: transparent;
    }

    mat-form-field {
      width: 100%;
      padding-top: 20px;
    }

    input {
      color: white !important;
      font-size: 18px !important;
      font-weight: 500 !important;
    }

    .clear-button {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;

      margin-left: 10px;
      padding: 10px;
    }
  `,],
})
export class SearchBarComponent {

  subredditFormControl: InputSignal<FormControl> = input.required<FormControl>();

}
