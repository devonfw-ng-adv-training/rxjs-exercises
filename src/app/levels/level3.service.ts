import {Injectable} from '@angular/core';
import {forkJoin, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Level3Service {

  constructor() {
  }

  /**
   * return an observable that requests data from both given backends in parallel and returns the combined
   * result as an array when it is available.
   */
  callTwoBackendsAndReturnTheCombinedResult(backend1$: Observable<string>, backend2$: Observable<number>): Observable<[string, number]> {
    return null; // TODO
  }

}
