import {Component, inject} from '@angular/core';
import {GifListComponent} from "./ui/gif-list.component";
import {RedditService} from "../shared/data-access/reddit.service";
import {InfiniteScrollDirective} from "ngx-infinite-scroll";
import {SearchBarComponent} from "./ui/search-bar.component";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    GifListComponent,
    InfiniteScrollDirective,
    SearchBarComponent,
    MatProgressSpinner,
  ],
  template: `
    <app-search-bar class="search-bar" [subredditFormControl]="redditService.subredditFormControl"/>

    <div class="gif-container">
      @if (redditService.loading()) {
        <mat-progress-spinner mode="indeterminate" diameter="50"/>
      } @else {
        <app-gif-list [gifs]="redditService.gifs()"
                      infiniteScroll [infiniteScrollContainer]="'.gif-container'" [fromRoot]="true"
                      (scrolled)="redditService.pagination$.next(redditService.lastKnownGif())"/>
      }
    </div>
  `,
  styles: [`
    :host {
      height: 100%;
      width: 100%;
      max-width: 900px;
      margin: auto;

      display: grid;
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: 80px minmax(0, 1fr);

      justify-items: stretch;
      align-items: stretch;
    }

    mat-progress-spinner {
      margin: 2rem auto;
    }

    .gif-container {
      overflow-x: hidden;
      overflow-y: scroll;
    }
  `],
})
export default class HomeComponent {

  public redditService: RedditService = inject(RedditService);

}
