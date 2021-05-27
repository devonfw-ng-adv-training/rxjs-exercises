import { HttpErrorResponse } from '@angular/common/http';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { databaseOfBrightStars } from '../support-code/database-of-bright-stars';
import { createTimeBasedObservable } from '../support-code/level-support';

import { Backend, Level8Service } from './level8.service';

describe('Level8Service', () => {
  let service: Level8Service;
  let backend: Backend;
  /**
   * will respond just like backend but with a delay for each request as specified by the value for the
   * request index in the given parameter
   */
  let backendWithDelays: (delayForResponse: number[]) => Backend;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Level8Service);
    backend = {
      getAutocompleteValues(input: string): Observable<Array<string>> {
        return of(
          databaseOfBrightStars.filter((value) => value.startsWith(input))
        );
      },
    };
    backendWithDelays = (delayForResponse: number[]) => {
      let requestIndex = 0;
      return {
        getAutocompleteValues(input: string): Observable<Array<string>> {
          const delayTime =
            requestIndex < delayForResponse.length
              ? delayForResponse[requestIndex]
              : delayForResponse[delayForResponse.length];
          requestIndex++;
          return backend.getAutocompleteValues(input).pipe(
            delay(delayTime),
            tap(() =>
              console.log(
                'backend call end for',
                input,
                'with delay',
                delayTime
              )
            )
          );
        },
      };
    };
  });

  it('getAutocompleteList - simple single value', fakeAsync(() => {
    const obs$ = service.getAutocompleteList(of('Alg'), backend);
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: Array<Array<string>> = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      (v) => actualValues.push(v),
      (e) => (gotError = true),
      () => (gotComplete = true)
    );
    flush();
    expect(actualValues).toEqual([['Algieba', 'Algol']]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('getAutocompleteList - two requests with much time in between', fakeAsync(() => {
    const obs$ = service.getAutocompleteList(
      createTimeBasedObservable([
        { time: 0, value: 'Alg' },
        { time: 1000, value: 'Be' },
        { time: 2000, value: 'Cap' },
      ]),
      backend
    );
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: Array<Array<string>> = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      (v) => actualValues.push(v),
      (e) => (gotError = true),
      () => (gotComplete = true)
    );
    flush();
    expect(actualValues).toEqual([
      ['Algieba', 'Algol'],
      ['Bellatrix', 'Betelgeuse'],
      ['Capella', 'Caph'],
    ]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('getAutocompleteList - not enough characters v2', fakeAsync(() => {
    const obs$ = service.getAutocompleteList(
      createTimeBasedObservable([
        { time: 0, value: '' },
        { time: 1000, value: 'G' },
        { time: 2000, value: 'Ga' },
        { time: 3000, value: 'G' },
      ]),
      backend
    );
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: Array<Array<string>> = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      (v) => actualValues.push(v),
      (e) => (gotError = true),
      () => (gotComplete = true)
    );
    flush();
    expect(actualValues).toEqual([[], ['Gacrux'], []]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('getAutocompleteList - not enough characters', fakeAsync(() => {
    const obs$ = service.getAutocompleteList(
      createTimeBasedObservable([
        { time: 0, value: '' },
        { time: 1000, value: 'G' },
        { time: 2000, value: 'Ga' },
        { time: 3000, value: 'G' },
        { time: 4000, value: 'F' },
        { time: 5000, value: 'Fo' },
      ]),
      backend
    );
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: Array<Array<string>> = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      (v) => actualValues.push(v),
      (e) => (gotError = true),
      () => (gotComplete = true)
    );
    flush();
    expect(actualValues).toEqual([[], ['Gacrux'], [], ['Fomalhaut']]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('getAutocompleteList - skip rapid input', fakeAsync(() => {
    const obs$ = service.getAutocompleteList(
      createTimeBasedObservable([
        { time: 0, value: 'Ald' },
        { time: 100, value: 'Ga' },
        { time: 200, value: 'De' },
        { time: 300, value: 'Mi' },
        { time: 400, value: 'Min' },
        // rest period
        { time: 1000, value: 'Pol' },
        { time: 1100, value: 'Ras' },
        { time: 1200, value: 'Re' },
        { time: 1300, value: 'Ri' },
        { time: 1400, value: 'Pro' },
      ]),
      backend
    );
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: Array<Array<string>> = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      (v) => actualValues.push(v),
      (e) => (gotError = true),
      () => (gotComplete = true)
    );
    flush(100); // detail note: some implementations require more iterations - see https://github.com/angular/zone.js/pull/831
    expect(actualValues).toEqual([['Mintaka'], ['Procyon']]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('getAutocompleteList - ignore outdated responses', fakeAsync(() => {
    const obs$ = service.getAutocompleteList(
      createTimeBasedObservable(
        [
          { time: 0, value: 'Veg' },
          { time: 800, value: 'Bet' },
        ],
        3000
      ),
      backendWithDelays([900, 500])
    );
    // meaning: the request for 'Bet' will come before the answer for 'Veg' is given back to the service
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: Array<Array<string>> = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      (v) => actualValues.push(v),
      (e) => (gotError = true),
      () => (gotComplete = true)
    );
    flush();
    expect(actualValues).toEqual([['Betelgeuse']]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('getAutocompleteList - handle backend timeout', fakeAsync(() => {
    const obs$ = service.getAutocompleteList(
      createTimeBasedObservable(
        [
          // Note: huge input delays to make sure switchMap would return the values if they came
          { time: 0, value: 'Veg' }, // answer will be late
          { time: 5000, value: 'Bet' }, // answer will be on time
          { time: 10000, value: 'Can' }, // answer will be late
        ],
        20000
      ),
      backendWithDelays([1100, 500, 2000])
    );
    // meaning: the request for 'Bet' will come before the answer for 'Veg' is given back to the service
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: Array<Array<string>> = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      (v) => actualValues.push(v),
      (e) => (gotError = true),
      () => (gotComplete = true)
    );
    flush();
    expect(actualValues).toEqual([[], ['Betelgeuse'], []]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('getAutocompleteList - handle backend status 429 - retry after 1000ms', fakeAsync(() => {
    const errors: HttpErrorResponse[] = [
      new HttpErrorResponse({
        status: 500,
      }),
      new HttpErrorResponse({
        status: 429,
      }),
    ];
    const errorBackend: Backend = {
      getAutocompleteValues: (input: string): Observable<string[]> =>
        new Observable((subscriber) => {
          const error = errors.pop();
          if (error) {
            subscriber.error(error);
          }
          subscriber.next(
            databaseOfBrightStars.filter((value) => value.startsWith(input))
          );
        }),
    };
    const obs$ = service.getAutocompleteList(of('Bet'), errorBackend);
    expect(obs$).toBeInstanceOf(Observable);

    const actualValues: Array<Array<string>> = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      (v) => actualValues.push(v),
      () => (gotError = true),
      () => (gotComplete = true)
    );
    tick(999);
    expect(errors.length).toEqual(1);
    tick(1);
    expect(actualValues).toEqual([[]]); // an empty array should have been emitted by default
    expect(errors).toEqual([]); // all errors should have been emitted
    expect(gotError).toBeFalse(); // error should have been caught
    expect(gotComplete).toBeTrue();
  }));
});
