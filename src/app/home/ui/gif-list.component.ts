import {Component, input, InputSignal} from '@angular/core';
import {Gif} from "../../shared/interfaces";

@Component({
  selector: 'app-gif-list',
  standalone: true,
  imports: [],
  template: `
    @for (gif of gifs(); track gif.permalink) {
      <div>
        {{ gif.title }}
      </div>
    }
  `,
  styles: ``
})
export class GifListComponent {

  gifs: InputSignal<Gif[]> = input.required<Gif[]>();

}
