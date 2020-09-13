import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {debounceTime, filter, switchMap} from 'rxjs/operators';

export interface Backend {
  getAutocompleteValues(input: string): Observable<Array<string>>;
}

@Injectable({
  providedIn: 'root'
})
export class Level4Service {

  constructor() {
  }

  /**
   * return an observable that produces an autocomplete list for the stream of inputs based on the
   * given backend with the following requirements:
   * <UL>
   *   <LI>do not return data if there is already a new input value before the previous input has been processed</LI>
   * </UL>
   */
  getAutocompleteList(inputObservable$: Observable<string>, backend: Backend): Observable<Array<string>> {
    return null; // TODO
  }

}
