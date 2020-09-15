import {fakeAsync, flush, tick} from '@angular/core/testing';
import {Observable} from 'rxjs';
import {createTimeBasedObservable} from './level-support';

describe('level-support', () => {

  it('createTimeBasedObservable should produce the values in order', fakeAsync(() => {
    const obs$ = createTimeBasedObservable([
      {time: 0, value: 1},
      {time: 1000, value: 2},
      {time: 2000, value: 3}]);
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: number[] = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    expect(actualValues).toEqual([], 'before first macrotask');
    tick(100);
    expect(actualValues).toEqual([1], 'at about 100ms');
    tick(800);
    expect(actualValues).toEqual([1], 'at about 900ms');
    tick(200);
    expect(actualValues).toEqual([1, 2], 'at about 1100ms');
    tick(800);
    expect(actualValues).toEqual([1, 2], 'at about 1900ms');
    tick(200);
    expect(actualValues).toEqual([1, 2, 3], 'at about 2100ms');
    flush();
    expect(actualValues).toEqual([1, 2, 3], 'at the end');
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));


  it('createTimeBasedObservable should handle a delayed complete', fakeAsync(() => {
    const obs$ = createTimeBasedObservable([
        {time: 0, value: 1},
        {time: 1000, value: 2}],
      3000);
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: number[] = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    expect(actualValues).toEqual([], 'before first macrotask');
    tick(100);
    expect(actualValues).toEqual([1], 'at about 100ms');
    tick(800);
    expect(actualValues).toEqual([1], 'at about 900ms');
    tick(200);
    expect(actualValues).toEqual([1, 2], 'at about 1100ms');
    tick(800);
    expect(actualValues).toEqual([1, 2], 'at about 1900ms');
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeFalsy('expecting no complete yet');
    tick(200);
    expect(actualValues).toEqual([1, 2], 'at about 2100ms');
    flush();
    expect(actualValues).toEqual([1, 2], 'at the end');
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('createTimeBasedObservable should stop producing values when unsubscribed', fakeAsync(() => {
    const obs$ = createTimeBasedObservable([
      {time: 0, value: 1},
      {time: 1000, value: 2},
      {time: 2000, value: 3}]);
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: number[] = [];
    let gotError = false;
    let gotComplete = false;
    const subscription = obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    expect(actualValues).toEqual([], 'before first macrotask');
    tick(900);
    expect(actualValues).toEqual([1], 'at about 900ms');
    tick(200);
    expect(actualValues).toEqual([1, 2], 'at about 1100ms');
    tick(800);
    expect(actualValues).toEqual([1, 2], 'at about 1900ms');
    subscription.unsubscribe();
    tick(200);
    expect(actualValues).toEqual([1, 2], 'at about 2100ms');
    flush();
    expect(actualValues).toEqual([1, 2], 'at the end');
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeFalsy('expecting no complete');
  }));

});
