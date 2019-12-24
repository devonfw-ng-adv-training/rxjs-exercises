import { Injectable } from '@angular/core';
import {Observable, combineLatest, forkJoin, Subject} from 'rxjs';
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
    return this.getTodosWithUsersMixture();
  }

  getTodosWithUsersMixture(): Observable<TodoWithUser[]> {
    return this.todoService.getTodos().pipe(
      switchMap((todos: Todo[]) => {
        const userIds: number[] = [... new Set(todos.map( (todo: Todo) => todo.userId))];
        const userRequests: Observable<User>[] = userIds.map( (userId: number) => this.userService.getUser(userId));
        const usersRequest: Observable<User[]> = forkJoin(userRequests);
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

  /**
   * a solution with imperative programming
   */
  getTodosWithUsersImperative(): Observable<TodoWithUser[]> {
    // this will be our actual result
    const resultSubject = new Subject<TodoWithUser[]>();
    // this is the array where we store the actual results
    const result: TodoWithUser[] = [];
    // this will cache the user data we already loaded
    const userCache: {[userId: number]: User} = {};
    // this will store the Todos where the user object has not been loaded yet, but it has already been requested
    const pendingToDosByUserId: {[userId: number]: Todo[]} = {};

    this.todoService.getTodos().subscribe( (todos: Todo[]) => {
      todos.forEach((todo: Todo) => {
        if (userCache[todo.userId]) {
          const todoWithUser: TodoWithUser = { todo, user: userCache[todo.userId]};
          result.push(todoWithUser);
          if (result.length == todos.length) {
            resultSubject.next(result);
          }
        } else {
          // we don't have the user yet, store the Todo for later
          let firstTodoForUserId = false;
          if (!pendingToDosByUserId[todo.userId]) {
            pendingToDosByUserId[todo.userId] = [];
            firstTodoForUserId = true;
          }
          pendingToDosByUserId[todo.userId].push(todo);
          // and if it was the first for the user id, request it
          if (firstTodoForUserId) {
            this.userService.getUser(todo.userId).subscribe((user: User) => {
              // store in cache
              userCache[user.id] = user;
              // fill all queued todos
              pendingToDosByUserId[user.id].forEach((previousTodo: Todo) => {
                const todoWithUser: TodoWithUser = {todo: previousTodo, user};
                result.push(todoWithUser);
              });
              delete pendingToDosByUserId[user.id];
              // do I have now everything?
              if (result.length == todos.length) {
                resultSubject.next(result);
              }
            });
          }
        }
      })
    });
    // The following happens way before the todos and their users are requested!
    // TODO TodoWithUser objects should be in the same order as the Todos that were received from the service
    return resultSubject.asObservable();
  }

}
