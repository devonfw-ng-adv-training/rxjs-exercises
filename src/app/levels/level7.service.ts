import {Injectable} from '@angular/core';
import {iif, merge, Observable, of, partition} from 'rxjs';
import {debounceTime, distinctUntilChanged, map, share, switchMap, timeoutWith} from 'rxjs/operators';
import isEqual from 'lodash.isequal';

export interface Backend {
  getAutocompleteValues(input: string): Observable<Array<string>>;
}

@Injectable({
  providedIn: 'root'
})
export class Level7Service {

  constructor() {
  }

  /**
   * return an observable that produces an autocomplete list for the stream of inputs based on the
   * given backend with the following requirements:
   * <UL>
   *   <LI>return an empty list if not at least 2 characters have been given
   *       (instead of returning nothing - since it is not nice to display old results)</LI>
   *   <LI>when the source changes rapidly (<500ms), do not load the data</LI>
   *   <LI>do not return data if there is already a new input value before the previous input has been processed</LI>
   *   <LI>do not return the same value twice in a row (hint: use isEqual(a,b) to compare arrays)</LI>
   *   <LI>return an empty list if the backend does not respond within 1000ms.</LI>
   * </UL>
   */
  getAutocompleteList(inputObservable$: Observable<string>, backend: Backend): Observable<Array<string>> {
    return inputObservable$.pipe(
      debounceTime(500),
      switchMap(value =>
        // note: the iif has to be wrapped within an higher order observable
        // since the predicate is evaluated at subscription time
        iif(
          () => value.length >= 2,
          backend.getAutocompleteValues(value).pipe(timeoutWith(1000, of([]))),
          of([]))),
      distinctUntilChanged((oldValue, newValue) => isEqual(oldValue, newValue))
    );
  }

  getAutocompleteListVariation(inputObservable$: Observable<string>, backend: Backend): Observable<Array<string>> {
    const [shortValues$, longValues$] = partition(
      inputObservable$.pipe(share(), debounceTime(500)),
      (value: string) => value.length < 2);
    const longValuesLoaded$ = longValues$.pipe(
      switchMap(y => backend.getAutocompleteValues(y).pipe(timeoutWith(1000, of([])))));
    return merge(
      shortValues$.pipe(map(x => [])),
      longValuesLoaded$
    ).pipe(distinctUntilChanged((x, y) => isEqual(x, y)));
  }

}
