import {computed, Injectable, Signal, signal, WritableSignal} from '@angular/core';
import {Gif} from "../interfaces";
import {Observable, of} from "rxjs";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

export interface GifState {
  gifs: Gif[];
}

@Injectable({
  providedIn: 'root'
})
export class RedditService {

  //--- State
  private state: WritableSignal<GifState> = signal<GifState>({
    gifs: [],
  });


  // --- Selectors
  gifs: Signal<Gif[]> = computed(() => this.state().gifs);


  // --- Sources
  gifsLoaded$: Observable<Gif[]> = of([
    {
      src: '',
      author: '',
      name: '',
      permalink: '',
      title: 'test gif',
      thumbnail: '',
      comments: 0,
    }
  ]);


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
}
