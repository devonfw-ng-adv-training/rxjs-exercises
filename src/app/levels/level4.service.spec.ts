import {fakeAsync, flush, TestBed} from '@angular/core/testing';

import {Backend, Level6Service} from './level6.service';
import {createTimeBasedObservable} from '../support-code/level-support';
import {Observable, of} from 'rxjs';
import {databaseOfBrightStars} from '../support-code/database-of-bright-stars';
import {delay, tap} from 'rxjs/operators';
import {Level4Service} from './level4.service';

describe('Level4Service', () => {
  let service: Level4Service;
  let backend: Backend;
  /**
   * will respond just like backend but with a delay for each request as specified by the value for the
   * request index in the given parameter
   */
  let backendWithDelays: (delayForResponse: number[]) => Backend;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Level4Service);
    backend = {
      getAutocompleteValues(input: string): Observable<Array<string>> {
        return of(databaseOfBrightStars.filter(value => value.startsWith(input)));
      }
    };
    backendWithDelays = (delayForResponse: number[]) => {
      let requestIndex = 0;
      return {
        getAutocompleteValues(input: string): Observable<Array<string>> {
          const delayTime = requestIndex < delayForResponse.length ? delayForResponse[requestIndex] : delayForResponse[delayForResponse.length];
          requestIndex++;
          return backend.getAutocompleteValues(input).pipe(delay(delayTime), tap(() => console.log('backend call end for', input, 'with delay', delayTime)));
        }
      }
    }
  });

  it('getAutocompleteList - simple single value', fakeAsync(() => {
    const obs$ = service.getAutocompleteList(of('Alg'), backend);
    expect(obs$).toBeInstanceOf(Observable);
    let actualValues = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    flush();
    expect(actualValues).toEqual([['Algieba', 'Algol']]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('getAutocompleteList - two requests with much time in between', fakeAsync(() => {
    const obs$ = service.getAutocompleteList(
      createTimeBasedObservable([
        {time: 0, value: 'Alg'},
        {time: 1000, value: 'Be'},
        {time: 2000, value: 'Cap'}
      ]), backend);
    expect(obs$).toBeInstanceOf(Observable);
    let actualValues = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    flush();
    expect(actualValues).toEqual([
      ['Algieba', 'Algol'],
      ['Bellatrix', 'Betelgeuse'],
      ['Capella', 'Caph']]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('getAutocompleteList - ignore outdated responses', fakeAsync(() => {
    const obs$ = service.getAutocompleteList(
      createTimeBasedObservable([
        {time: 0, value: 'Veg'},
        {time: 1000, value: 'Bet'}
      ], 3000), backendWithDelays([2000, 500]));
    // meaning: the request for 'Bet' will come before the answer for 'Veg' is given back to the service
    expect(obs$).toBeInstanceOf(Observable);
    let actualValues = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    flush();
    expect(actualValues).toEqual([['Betelgeuse']]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

});
