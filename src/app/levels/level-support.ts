/*
 * support code for the level-exercise
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
  return null; // TODO
}
