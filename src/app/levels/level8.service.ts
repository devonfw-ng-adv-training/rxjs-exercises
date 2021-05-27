import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Backend {
  getAutocompleteValues(input: string): Observable<Array<string>>;
}

@Injectable({
  providedIn: "root",
})
export class Level8Service {
  constructor() {}

  /**
   * return an observable that produces an autocomplete list for the stream of inputs based on the
   * given backend with the following requirements:
   * <UL>
   *   <LI>return an empty list if not at least 2 characters have been given
   *       (instead of returning nothing - since it is not nice to display old results)</LI>
   *   <LI>when the source changes rapidly (<500ms), do not load the data</LI>
   *   <LI>do not return data if there is already a new input value before the previous input has been processed</LI>
   *   <LI>do not return the same value twice in a row (hint: use _.isEqual(a,b) to compare arrays)</LI>
   *   <LI>return an empty list if the backend does not respond within 1000ms.</LI>
   *   <LI>when the backend returns with a 429 HttpErrorResponse, retry after 1000ms<./LI>
   *   <LI>when the backend returns any other error, resort to an empty array.</LI>
   * </UL>
   */
  getAutocompleteList(
    inputObservable$: Observable<string>,
    backend: Backend
  ): Observable<Array<string>> {
    return null;
  }
}
