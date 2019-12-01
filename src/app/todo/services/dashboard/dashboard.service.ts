import { Injectable } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { UserService } from '../user/user.service';
import { TodoService } from '../todo/todo.service';
import { TodoWithUser } from './todo-with-user';
import { User } from '../user/user';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private userService: UserService,
    private todoService: TodoService
  ) {}

  getTodosWithUsers(): Observable<TodoWithUser[]> {
    // TODO call todoService to receive todos,
    // TODO and call userService after for every user id
    // TODO build TodoWithUser objects
    return EMPTY;
  }

}
