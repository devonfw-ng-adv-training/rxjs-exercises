import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Level2Service {

  constructor() {
  }

  /**
   * return an observable that combines the values of both input observables so that
   * the values from the input1 come before the values from input2.
   */
  sourceBasedOrder(input1$: Observable<string>, input2$: Observable<string>): Observable<string> {
    return null; // TODO
  }

  /**
   * return an observable that combines the values of both input observables so that
   * the values in the result are in the order of the time they are provided.
   */
  timeBasedOrder(input1$: Observable<string>, input2$: Observable<string>): Observable<string> {
    return null; // TODO
  }

}
