import { Injectable } from '@angular/core';
import {Observable, combineLatest} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import { UserService } from '../user/user.service';
import { TodoService } from '../todo/todo.service';
import { TodoWithUser } from './todo-with-user';
import { User } from '../user/user';
import {Todo} from '../todo/todo';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private userService: UserService,
    private todoService: TodoService
  ) {}

  getTodosWithUsers(): Observable<TodoWithUser[]> {
    return this.todoService.getTodos().pipe(
      switchMap((todos: Todo[]) => {
        const userIds: number[] = [... new Set(todos.map( (todo: Todo) => todo.userId))];
        const userRequests: Observable<User>[] = userIds.map( (userId: number) => this.userService.getUser(userId));
        const usersRequest: Observable<User[]> = combineLatest(userRequests);
        return usersRequest.pipe(
          map((users: User[]) => {
            const usersById: { [userid: number]: User } = {};
            users.forEach((user: User) => usersById[user.id] = user);
            return usersById;
          }),
          map( (usersById: { [userid: number]: User }) => {
            return todos.map( (todo: Todo) => {
              return { todo: todo, user: usersById[todo.userId]};
            });
          })
        );
      })
    );
  }

}
