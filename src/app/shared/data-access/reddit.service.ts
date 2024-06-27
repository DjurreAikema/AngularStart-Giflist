import {computed, inject, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {Gif, RedditPost, RedditResponse} from "../interfaces";
import {catchError, concatMap, debounceTime, distinctUntilChanged, EMPTY, expand, map, Observable, startWith, Subject, switchMap} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {FormControl} from "@angular/forms";

export interface GifState {
  gifs: Gif[];
  error: string | null;
  loading: boolean;
  lastKnownGif: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class RedditService {

  private http: HttpClient = inject(HttpClient);
  subredditFormControl: FormControl<string> = new FormControl();

  // --- State
  private state: WritableSignal<GifState> = signal<GifState>({
    gifs: [],
    error: null,
    loading: true,
    lastKnownGif: null,
  });


  // --- Selectors
  gifs: Signal<Gif[]> = computed(() => this.state().gifs);
  loading: Signal<boolean> = computed(() => this.state().loading);
  error: Signal<string | null> = computed(() => this.state().error);
  lastKnownGif: Signal<string | null> = computed(() => this.state().lastKnownGif);


  // --- Sources
  pagination$: Subject<string | null> = new Subject<string | null>();

  private subredditChanged$: Observable<string> = this.subredditFormControl.valueChanges.pipe(
    debounceTime(500),
    distinctUntilChanged(),
    startWith('gifs'),
    map((subreddit: string): string => (subreddit.length ? subreddit : 'gifs'))
  );

  private gifsLoaded$: Observable<any> = this.subredditChanged$.pipe(
    switchMap((subreddit: string) =>
      this.pagination$.pipe(
        startWith(null),
        concatMap((lastKnownGif: string | null) =>
          this.fetchFromReddit(subreddit, lastKnownGif, 20).pipe(
            expand((response, index) => {
              const {gifs, gifsRequired, lastKnownGif} = response;
              const remainingGifsToFetch = gifsRequired - gifs.lenght;
              const maxAttempts = 15;

              const shouldKeepTrying =
                remainingGifsToFetch > 0
                && index < maxAttempts
                && lastKnownGif !== null

              return shouldKeepTrying
                ? this.fetchFromReddit(subreddit, lastKnownGif, remainingGifsToFetch)
                : EMPTY;
            })
          )
        )
      )
    )
  );

  private error$: Subject<string | null> = new Subject<string | null>();


  // --- Reducers
  constructor() {
    // subredditChanged$ reducer
    this.subredditChanged$.pipe(takeUntilDestroyed()).subscribe(() =>
      this.state.update((state) => ({
        ...state,
        loading: true,
        gifs: [],
        lastKnownGif: null,
      }))
    );

    // gifsLoaded$ reducer
    this.gifsLoaded$.pipe(takeUntilDestroyed()).subscribe((response) =>
      this.state.update((state) => ({
        ...state,
        gifs: [...state.gifs, ...response.gifs],
        loading: false,
        lastKnownGif: response.lastKnownGif,
      }))
    );

    // error$ reducer
    this.error$.pipe(takeUntilDestroyed()).subscribe((error) =>
      this.state.update((state) => ({
        ...state,
        error,
      }))
    );
  }


  // --- Functions
  private fetchFromReddit(subreddit: string, after: string | null, gifsRequired: number): Observable<any> {
    return this.http.get<RedditResponse>(
      `https://www.reddit.com/r/${subreddit}/hot/.json?limit=100` +
      (after ? `&after=${after}` : ``)
    ).pipe(
      catchError((err) => {
        this.handleError(err);
        return EMPTY;
      }),
      map((response) => {
        const posts = response.data.children;
        const lastKnownGif = posts.length
          ? posts[posts.length - 1].data.name
          : null;

        return {
          gifs: this.convertRedditPostsToGifs(posts),
          gifsRequired,
          lastKnownGif,
        };
      })
    );
  }

  private convertRedditPostsToGifs(posts: RedditPost[]): Gif[] {
    const defaultThumbnails = ['default', 'none', 'nsfw'];

    return posts.map((post) => {
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

  private handleError(err: HttpErrorResponse): void {
    // Handle specific error cases
    if (err.status === 404 && err.url) {
      this.error$.next(`Failed to load gifs for /r/${err.url.split('/')[4]}`);
      return;
    }

    // Generic error if no cases match
    this.error$.next(err.statusText);
  }
}
