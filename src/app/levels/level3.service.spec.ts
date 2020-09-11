import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import {Level3Service} from './level3.service';
import {createTimeBasedObservable} from '../support-code/level-support';
import {Observable} from 'rxjs';

describe('Level3Service', () => {
  let service: Level3Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Level3Service);
  });

  it('callTwoBackendsAndReturnTheCombinedResult should return the values as expected', fakeAsync(() => {
    const obs$ = service.callTwoBackendsAndReturnTheCombinedResult(
      createTimeBasedObservable([
        {time: 1000, value: 'a'}
      ]),
      createTimeBasedObservable([
        {time: 2000, value: 5}
      ]));
    expect(obs$).toBeInstanceOf(Observable);
    let actualValue;
    let gotError = false;
    let gotComplete = false;
    obs$.subscribe(
      v => actualValue = v,
      e => gotError = true,
      () => gotComplete = true);
    tick(1900);
    // no result expected yet
    expect(actualValue).toBeUndefined();
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeFalsy('expecting no complete yet');
    tick(200);
    expect(actualValue).toEqual(['a', 5]);
    expect(gotError).toBeFalsy('expecting no errors');
    expect(gotComplete).toBeTruthy('expecting a complete');
  }));

});
