import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import {Level1Service} from './level1.service';
import {Observable, of} from 'rxjs';

describe('Level1Service', () => {
  let service: Level1Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Level1Service);
  });

  it('square should return the squared values from the input', fakeAsync(() => {
    const obs$ = service.square(of(1, 4, 5, 17));
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: number[] = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    tick();
    expect(actualValues).toEqual([1, 16, 25, 17 * 17]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('first3ValuesGreaterThan10 should return the expected values', fakeAsync(() => {
    const obs$ = service.first3ValuesGreaterThan10(of(3, 17, 2, 6, 19, 12, 103, 56, 2, 7));
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: number[] = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    tick();
    expect(actualValues).toEqual([17, 19, 12]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('first3ValuesGreaterThan10OnlyWhenDifferent should return the expected values', fakeAsync(() => {
    const obs$ = service.first3ValuesGreaterThan10OnlyWhenDifferent(of(3, 17, 17, 2, 17, 103, 17, 77, 7));
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues: number[] = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    tick();
    expect(actualValues).toEqual([17, 103, 17]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

});
