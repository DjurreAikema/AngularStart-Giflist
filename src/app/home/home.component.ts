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
    <app-search-bar [subredditFormControl]="redditService.subredditFormControl"/>

    @if (redditService.loading()) {
      <mat-progress-spinner mode="indeterminate" diameter="50"/>
    } @else {
      <app-gif-list class="grid-container" [gifs]="redditService.gifs()"
                    infiniteScroll (scrolled)="redditService.pagination$.next(redditService.lastKnownGif())"/>
    }
  `,
  styles: [`
    mat-progress-spinner {
      margin: 2rem auto;
    }
  `],
})
export default class HomeComponent {

  public redditService: RedditService = inject(RedditService);

}
