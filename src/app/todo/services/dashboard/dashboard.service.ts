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

  /**
   * The purpose of this method is to return all todos with their associated user object.
   * The todos are returned by the TodoService, the corresponding users by id from the UserService.
   * But: While a user may have multiple todos, a user object should only be requested once.
   * And the list of todos should be returned in the same order as they are received from the TodoService.
   */
  getTodosWithUsers(): Observable<TodoWithUser[]> {
    // TODO call todoService to receive todos,
    // TODO and call userService after for every user id (but not twice for the same one)
    // TODO build TodoWithUser objects
    // TODO TodoWithUser objects should be in the same order as the Todos that were received from the service
    return EMPTY;
  }

}
