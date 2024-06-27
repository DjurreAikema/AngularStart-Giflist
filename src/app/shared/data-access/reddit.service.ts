import {computed, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {Gif, RedditPost, RedditResponse} from "../interfaces";
import {catchError, EMPTY, map, Observable} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {HttpClient} from "@angular/common/http";

export interface GifState {
  gifs: Gif[];
}

@Injectable({
  providedIn: 'root'
})
export class RedditService {

  private http: HttpClient = inject(HttpClient);

  // --- State
  private state: WritableSignal<GifState> = signal<GifState>({
    gifs: [],
  });


  // --- Selectors
  gifs: Signal<Gif[]> = computed(() => this.state().gifs);


  // --- Sources
  private gifsLoaded$: Observable<Gif[]> = this.fetchFromReddit('gifs');


  // --- Reducers
  constructor() {
    // gifsLoaded$ reducer
    this.gifsLoaded$.pipe(takeUntilDestroyed()).subscribe((gifs) =>
      this.state.update((state) => ({
        ...state,
        gifs: [...state.gifs, ...gifs],
      }))
    );
  }


  // --- Functions
  private fetchFromReddit(subreddit: string): Observable<Gif[]> {
    return this.http.get<RedditResponse>(
      `https://www.reddit.com/r/${subreddit}/hot/.json?limit=100`
    ).pipe(
      catchError((err) => EMPTY),
      map((response) => this.convertRedditPostsToGifs(response.data.children))
    );
  }

  private convertRedditPostsToGifs(posts: RedditPost[]): Gif[] {
    const defaultThumbnails = ['default', 'none', 'nsfw'];

    return posts
      .map((post) => {
        const thumbnail = post.data.thumbnail;
        const modifiedThumbnail = defaultThumbnails.includes(thumbnail)
          ? `/assets/${thumbnail}.png`
          : thumbnail;

        const validThumbnail =
          modifiedThumbnail.endsWith('.jpg') ||
          modifiedThumbnail.endsWith('.png');

        return {
          src: this.getBestSrcForGif(post),
          author: post.data.author,
          name: post.data.name,
          permalink: post.data.permalink,
          title: post.data.title,
          thumbnail: validThumbnail ? modifiedThumbnail : `/assets/default.png`,
          comments: post.data.num_comments,
        };
      }).filter((post): post is Gif => post.src !== null);
  }

  private getBestSrcForGif(post: RedditPost): string | null {
    // If the source is in .mp4 format, leave unchanged
    if (post.data.url.indexOf('.mp4') > -1) {
      return post.data.url;
    }

    // If the source is in .gifv or .webm formats, convert to .mp4 and return
    if (post.data.url.indexOf('.gifv') > -1) {
      return post.data.url.replace('.gifv', '.mp4');
    }

    if (post.data.url.indexOf('.webm') > -1) {
      return post.data.url.replace('.webm', '.mp4');
    }

    // If the URL is not .gifv or .webm, check if media or secure media is available
    if (post.data.secure_media?.reddit_video) {
      return post.data.secure_media.reddit_video.fallback_url;
    }

    if (post.data.media?.reddit_video) {
      return post.data.media.reddit_video.fallback_url;
    }

    // If media objects are not available, check if a preview is available
    if (post.data.preview?.reddit_video_preview) {
      return post.data.preview.reddit_video_preview.fallback_url;
    }

    // No useable formats available
    return null;
  }
}
