import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {distinctUntilChanged, filter, map, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Level1Service {

  constructor() {
  }

  /**
   * return an observable that squares the value from the input observable
   */
  square(inputObservable$: Observable<number>): Observable<number> {
    return inputObservable$.pipe(
      map(v => v * v)
    );
  }

  /**
   * return an observable that produces the first 3 values from the input observable that are greater than 10
   */
  first3ValuesGreaterThan10(inputObservable$: Observable<number>): Observable<number> {
    return inputObservable$.pipe(
      filter(v => v > 10),
      take(3)
    );
  }

  /**
   * return an observable that produces values from the input observable that are greater than 10
   * but only report three values and only report a value if it is different from the previously reported value
   */
  first3ValuesGreaterThan10OnlyWhenDifferent(inputObservable$: Observable<number>): Observable<number> {
    return inputObservable$.pipe(
      filter(v => v > 10),
      distinctUntilChanged(),
      take(3)
    );
  }

}
