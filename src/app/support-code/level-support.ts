/*
 * support code for the level-exercise, does not have to be modified
 */

import {Observable} from 'rxjs';

export interface TimedValue<T> {
  time: number;
  value: T;
}

/**
 * create an observable that returns the given values at the expected time (starting now).
 * The optional completeTime is the time when the complete is sent. A value sooner than the largest timed value means
 * the complete happens immediately after the last value.
 */
export function createTimeBasedObservable<T>(timedValues: TimedValue<T>[], completeTime = 0): Observable<T> {
  return new Observable<T>(subscriber => {
    const timeouts = [];
    let countNext = 0;
    const maxTime = Math.max(...timedValues.map(timedValue => timedValue.time));
    timedValues.forEach(timedValue => {
      timeouts.push(setTimeout(() => {
        subscriber.next(timedValue.value);
        countNext++;
        if (countNext === timedValues.length && completeTime <= maxTime) {
          subscriber.complete();
        }
      }, timedValue.time));
      if (completeTime > maxTime) {
        timeouts.push(setTimeout(() => subscriber.complete(), completeTime));
      }
    });
    return () => {
      timeouts.forEach(clearTimeout);
    }
  });
}
