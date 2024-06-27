import {Component, inject} from '@angular/core';
import {GifListComponent} from "./ui/gif-list.component";
import {RedditService} from "../shared/data-access/reddit.service";
import {InfiniteScrollDirective} from "ngx-infinite-scroll";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    GifListComponent,
    InfiniteScrollDirective,
  ],
  template: `
    <app-gif-list class="grid-container" [gifs]="redditService.gifs()"
                  infiniteScroll (scrolled)="redditService.pagination$.next(redditService.lastKnownGif())"/>
  `,
  styles: ``
})
export default class HomeComponent {

  public redditService: RedditService = inject(RedditService);

}
