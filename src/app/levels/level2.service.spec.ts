import {fakeAsync, flush, TestBed, tick} from '@angular/core/testing';

import {Level2Service} from './level2.service';
import {Observable, of} from 'rxjs';
import {createTimeBasedObservable} from '../support-code/level-support';

describe('Level2Service', () => {
  let service: Level2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Level2Service);
  });

  it('sourceBasedOrder should return the as expected (simple check)', fakeAsync(() => {
    const obs$ = service.sourceBasedOrder(of('1a', '1b', '1c'), of('2a', '2b', '2c'));
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: string[] = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    tick();
    expect(actualValues).toEqual(['1a', '1b', '1c', '2a', '2b', '2c']);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('sourceBasedOrder should return the as expected (time based check)', fakeAsync(() => {
    const obs$ = service.sourceBasedOrder(
      createTimeBasedObservable([
        {time: 1000, value: '1a'},
        {time: 3000, value: '1b'},
        {time: 5000, value: '1c'}
      ]),
      // note: using concat the subscription on the second observable happens after the first one completes,
      // so the 2a actually is sent at time 7000ms if that implementation is used
      createTimeBasedObservable([
        {time: 2000, value: '2a'},
        {time: 4000, value: '2b'},
        {time: 6000, value: '2c'}
      ]));
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: string[] = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    flush();
    expect(actualValues).toEqual(['1a', '1b', '1c', '2a', '2b', '2c']);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('timeBasedOrder should return the as expected (simple check)', fakeAsync(() => {
    const obs$ = service.timeBasedOrder(of('1a', '1b', '1c'), of('2a', '2b', '2c'));
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: string[] = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    tick();
    expect(actualValues).toEqual(['1a', '1b', '1c', '2a', '2b', '2c']);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('timeBasedOrder should return the as expected (time based check)', fakeAsync(() => {
    const obs$ = service.timeBasedOrder(
      createTimeBasedObservable([
        {time: 1000, value: '1a'},
        {time: 3000, value: '1b'},
        {time: 5000, value: '1c'}
      ]),
      createTimeBasedObservable([
        {time: 2000, value: '2a'},
        {time: 4000, value: '2b'},
        {time: 6000, value: '2c'}
      ]));
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: string[] = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    flush();
    expect(actualValues).toEqual(['1a', '2a', '1b', '2b', '1c', '2c']);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

});
