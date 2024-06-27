import {Component, computed, effect, ElementRef, input, InputSignal, Signal, signal, viewChild, WritableSignal} from '@angular/core';
import {toObservable} from "@angular/core/rxjs-interop";
import {fromEvent, map, merge, Observable, Subject, switchMap} from "rxjs";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {connect} from "ngxtension/connect";

interface GifPlayerState {
  playing: boolean;
  status: 'initial' | 'loading' | 'loaded'
}

@Component({
  selector: 'app-gif-player',
  standalone: true,
  imports: [
    MatProgressSpinner
  ],
  template: `
    @if (status() === 'loading') {
      <mat-progress-spinner mode="indeterminate" diameter="50"/>
    }
    <div class="preload-background"
         [style.background]="'url(' + thumbnail() + ') 50% 50% / cover no-repeat'"
         [class.blur]="status() !== 'loaded' && !['/assets/nsfw.png', '/assets/default.png'].includes(thumbnail())"
    >

      <video (click)="togglePlay$.next()"
             [src]="src()" [loop]="true" [muted]="true"
             playsinline preload="none" #gifPlayer
      ></video>

    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        max-height: 80vh;
      }

      .preload-background {
        width: 100%;
        height: auto;
      }

      .blur {
        filter: blur(10px) brightness(0.6);
        transform: scale(1.1);
      }

      video {
        width: 100%;
        max-height: 80vh;
        height: auto;
        margin: auto;
        background: transparent;
      }

      mat-progress-spinner {
        position: absolute;
        top: 2em;
        right: 2em;
        z-index: 1;
      }
    `,
  ],
})
export class GifPlayerComponent {

  src: InputSignal<string> = input.required<string>();
  thumbnail: InputSignal<string> = input.required<string>();

  videoElement = viewChild.required<ElementRef<HTMLVideoElement>>('gifPlayer');
  videoElement$ = toObservable(this.videoElement);

  // --- State
  state: WritableSignal<GifPlayerState> = signal<GifPlayerState>({
    playing: false,
    status: 'initial'
  });

  // --- Selectors
  playing: Signal<boolean> = computed(() => this.state().playing);
  status: Signal<'initial' | 'loading' | 'loaded'> = computed(() => this.state().status);

  // --- Sources
  togglePlay$: Subject<void> = new Subject<void>()
  videoLoadStart$: Observable<Event> = this.togglePlay$.pipe(
    switchMap(() => this.videoElement$),
    switchMap(({nativeElement}) => fromEvent(nativeElement, 'loadstart')),
  );
  videoLoadComplete$: Observable<Event> = this.videoElement$.pipe(
    switchMap(({nativeElement}) => fromEvent(nativeElement, 'loadeddata')),
  );

  // --- Reducers
  constructor() {
    const nextState$ = merge(
      // videoLoadStart$ reducer
      this.videoLoadStart$.pipe(map(() => ({status: 'loading' as const}))),
      // videoLoadComplete$ reducer
      this.videoLoadComplete$.pipe(map(() => ({status: 'loaded' as const}))),
    );

    connect(this.state)
      .with(nextState$)
      // togglePlay$ reducer
      .with(this.togglePlay$, (state) => ({playing: !state.playing}));


    // --- Effects
    effect(() => {
      const {nativeElement: video} = this.videoElement();
      const playing = this.playing();
      const status = this.status();

      if (!video) return;

      if (playing && status === 'initial') {
        video.load();
      }

      if (status === 'loaded') {
        playing ? video.play() : video.pause();
      }
    });
  }
}
