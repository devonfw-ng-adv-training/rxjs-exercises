import { Injectable } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';

import { UserService } from '../user/user.service';
import { TodoService } from '../todo/todo.service';
import { TodoWithUser } from './todo-with-user';

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
    // TODO and call userService after for every user id (but not twice for the same one)
    // TODO build TodoWithUser objects
    return EMPTY;
  }

}
