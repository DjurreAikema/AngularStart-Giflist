import {Component, input, InputSignal} from '@angular/core';
import {Gif} from "../../shared/interfaces";
import {GifPlayerComponent} from "./gif-player.component";

@Component({
  selector: 'app-gif-list',
  standalone: true,
  imports: [
    GifPlayerComponent
  ],
  template: `
    @for (gif of gifs(); track gif.permalink) {
      <div>
        <app-gif-player [src]="gif.src" [thumbnail]="gif.thumbnail"/>
      </div>
    }
  `,
  styles: ``
})
export class GifListComponent {

  gifs: InputSignal<Gif[]> = input.required<Gif[]>();

}
