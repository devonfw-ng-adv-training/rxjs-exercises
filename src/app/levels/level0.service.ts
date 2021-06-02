import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

/**
 * a simple service to be implemented so that the test is successful
 */
@Injectable({
  providedIn: 'root'
})
export class Level0Service {

  private resultValue: any;

  constructor() {
  }

  get resultValueForTest(): any {
    return this.resultValue;
  }

  /**
   * return an observable that produces the values 1, 1, 2, 3, 5, 8, 13 in order
   */
  deliverSomeValues(): Observable<number> {
    return null; // TODO
  }

  /**
   * subscribe to the given observable and store the value(s) it produces in
   * <code>this.resultValue</code>.
   */
  subscribeAndSetValue(inputObservable$: Observable<number>): void {
    return null; // TODO
  }

}
