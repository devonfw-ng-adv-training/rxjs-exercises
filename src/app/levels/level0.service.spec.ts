import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import {Level0Service} from './level0.service';
import {asyncScheduler, Observable, of, scheduled} from 'rxjs';

describe('LevelBasicsService', () => {
  let service: Level0Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Level0Service);
  });

  it('deliverSomeValues should return expected values', fakeAsync(() => {
    const obs$ = service.deliverSomeValues();
    expect(obs$).toBeInstanceOf(Observable);
    const actualValues = [];
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValues.push(v),
      e => gotError = true,
      () => gotComplete = true);
    tick();
    expect(actualValues).toEqual([1, 1, 2, 3, 5, 8, 13]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

  it('subscribeAndSetValue should store the last value of the given observable', fakeAsync(() => {
    service.subscribeAndSetValue(scheduled(of(17), asyncScheduler));
    tick();
    expect(service.resultValueForTest).toBe(17);
    service.subscribeAndSetValue(scheduled(of(1, 2, 3), asyncScheduler));
    tick();
    expect(service.resultValueForTest).toBe(3);
  }));

});
