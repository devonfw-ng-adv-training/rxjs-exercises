import { Injectable } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) {}

  getUser(id: number): Observable<User> {
    return this.http.get<User>("/api/users/"+id);
  }

}
