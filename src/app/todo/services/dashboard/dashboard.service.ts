import {Injectable} from '@angular/core';
import {combineLatest, concat, forkJoin, from, GroupedObservable, Observable, of, partition, Subject} from 'rxjs';
import {
  bufferCount,
  concatMap,
  distinct,
  groupBy,
  map,
  mergeMap,
  shareReplay,
  switchMap,
  toArray
} from 'rxjs/operators';

import {UserService} from '../user/user.service';
import {TodoService} from '../todo/todo.service';
import {TodoWithUser} from './todo-with-user';
import {User} from '../user/user';
import {Todo} from '../todo/todo';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private userService: UserService,
    private todoService: TodoService
  ) {
  }

  /**
   * The purpose of this method is to return all todos with their associated user object.
   * The todos are returned by the TodoService, the corresponding users by id from the UserService.
   * But: While a user may have multiple todos, a user object should only be requested once.
   * And the list of todos should be returned in the same order as they are received from the TodoService.
   */
  getTodosWithUsers(): Observable<TodoWithUser[]> {
    // various solutions are available - check methods below
    return this.getTodosWithUsersStreamedMixtureWithShare();
  }

  // TODO: Finish an example with groupBy
  // (first experiments failed because groupBy's result observables were empty in the next macrotask...)
  /**
   * This approach splits the Todos into groups that each have the same user for all Todos in that group.
   * That user is requested and joined with the Todos.
   * Since we loose order but the result should be in the same order as the Todos, we keep track with an index.
   */
  getTodosWithUsersStreams(): Observable<TodoWithUser[]> {
    return this.todoService.getTodos().pipe(
      // add an index so we can sort later into the same order
      map((todos: Todo[]) => todos.map((todo: Todo, index: number) => ({index, todo}))),
      // convert the one array value into a sequence of values that are passed one after another
      switchMap((todosWithIndex: { index: number, todo: Todo }[]) => from(todosWithIndex)),
      // now group by user id
      groupBy((todoWithIndex: { index: number, todo: Todo }) => todoWithIndex.todo.userId),
      // now we have a stream of GroupedObservables that have the individual Todos of the same user
      // process each group individually, merge the results
      mergeMap((grouped: GroupedObservable<number, { index: number, todo: Todo }>) =>
        // TODO: This is the part that doesn't work - for some reason the grouped observables are empty in the next
        // macrotask which is where the data is needed because that is when the user information is loaded.
        // Timing is also tricky because a combineLatest only makes sense if the grouped observable is processed
        // after the user is available, otherwise the pair will only be built for the last Todo of the group.
        combineLatest(partition(
          concat(grouped, this.userService.getUser(grouped.key)),
          userOrTodo => ((userOrTodo as { index: number, todo: Todo }).todo !== undefined)))
      ),
      // this pipe now contains pairs of Todo (with index) and the corresponding User
      // so simply combine them to the TodoWithUser (but keep the index)
      map(([todoWithIndex, user]: [{ index: number, todo: Todo }, User]) => ({
        index: todoWithIndex.index,
        todoWithUser: {todo: todoWithIndex.todo, user}
      })),
      // gather them together into an array again (make one value array out of all sequential values)
      bufferCount(Number.MAX_SAFE_INTEGER),
      // sort them by index so we have the original order again
      map((todoWithUserAndIndexArray: { index: number, todoWithUser: TodoWithUser }[]) =>
        todoWithUserAndIndexArray.sort(
          (a: { index: number; todoWithUser: TodoWithUser }, b: { index: number; todoWithUser: TodoWithUser }) =>
            a.index - b.index)),
      map((todoWithUserAndIndexArray: { index: number, todoWithUser: TodoWithUser }[]) =>
        todoWithUserAndIndexArray.map((todoWithUserAndIndex: { index: number; todoWithUser: TodoWithUser }) =>
          todoWithUserAndIndex.todoWithUser))
      // strip the index
    );
  }

  /**
   * This approach extracts the user ids to load, prepares requests to load them,
   * and executes those requests in parallel. When done, the user information is
   * organized by id and then joined with the Todos to form the TodoWithUser.
   * It is a mixture of reactive and imperative programming.
   */
  getTodosWithUsersMixture(): Observable<TodoWithUser[]> {
    return this.todoService.getTodos().pipe(
      switchMap((todos: Todo[]) => {
        // identify the user ids needed (no duplicates)
        const userIds: number[] = [...new Set(todos.map((todo: Todo) => todo.userId))];
        // create the requests to load those users
        const userRequests: Observable<User>[] = userIds.map((userId: number) => this.userService.getUser(userId));
        // and execute them in parallel
        const usersRequest: Observable<User[]> = forkJoin(userRequests);
        return usersRequest.pipe(
          map((users: User[]) => {
            // organize the users by id for easy access
            const usersById: { [userId: number]: User } = {};
            users.forEach((user: User) => usersById[user.id] = user);
            return usersById;
          }),
          map((usersById: { [userId: number]: User }) => {
            // go through the todos and join them with the users
            return todos.map((todo: Todo) => {
              return {todo: todo, user: usersById[todo.userId]};
            });
          })
        );
      })
    );
  }

  /**
   * This approach converts the Todos array into a stream, loads the user information for each
   * but shareReplay(1) makes sure only one value is loaded, and combines the values again to an array.
   * It is a mixture of reactive and imperative programming.
   */
  getTodosWithUsersStreamedMixtureWithShare(): Observable<TodoWithUser[]> {
    // cache for the observables for getting user data
    const userRequests: { [userId: number]: Observable<User> } = {};
    return this.todoService.getTodos().pipe(
      // convert the one array value into a sequence of values that are passed one after another
      switchMap((todos: Todo[]) => from(todos)),
      // join the user from the shared requests
      concatMap((todo: Todo) => {
        if (!userRequests[todo.userId]) {
          userRequests[todo.userId] = this.userService.getUser(todo.userId).pipe(shareReplay(1));
        }
        return forkJoin([of(todo), userRequests[todo.userId]]);
      }),
      // combine the array values to the TodoWithUser
      map(arrayWithTodoAndUser => ({
        todo: arrayWithTodoAndUser[0],
        user: arrayWithTodoAndUser[1]
      })),
      // and create an array again from the individual values
      toArray()
    );
  }

  /**
   * a solution with imperative programming that gathers the user ids first, requests
   * the users and then merges that information.
   */
  getTodosWithUsersImperativeStepByStep(): Observable<TodoWithUser[]> {
    // this will be our actual result
    const resultSubject = new Subject<TodoWithUser[]>();

    this.todoService.getTodos().subscribe((todos: Todo[]) => {
      // gather the user ids needed
      const userIds: number[] = [...new Set(todos.map((todo: Todo) => todo.userId))];
      // this will cache the user data we already loaded
      const usersById: { [userId: number]: User } = {};
      // count the completed user requests so we know when have loaded all
      let userCount = 0;
      // now request the user data in a loop
      userIds.forEach((userId: number) => {
        this.userService.getUser(userId).subscribe((user: User) => {
          usersById[user.id] = user;
          userCount++;
          // do we have all users? then continue with creating the result
          if (userCount === userIds.length) {
            // go through the todos and join them with the users
            const todosWithUsers = todos.map((todo: Todo) => {
              return {todo: todo, user: usersById[todo.userId]};
            });
            // and send the list to the result observable
            resultSubject.next(todosWithUsers);
            resultSubject.complete();
          }
        });
      });
    });

    // The following happens way before the todos and their users are finished!
    return resultSubject.asObservable();
  }

  /**
   * a solution with imperative programming that mixes calls for users with the todo progression.
   * Since the result should be in the same order as the original Todos, we have to keep track with an index.
   */
  getTodosWithUsersImperativeIteration(): Observable<TodoWithUser[]> {
    // this will be our actual result
    const resultSubject = new Subject<TodoWithUser[]>();
    // this is the array where we store the actual results
    const result: { index: number, todoWithUser: TodoWithUser }[] = [];
    // this will cache the user data we already loaded
    const usersById: { [userId: number]: User } = {};
    // this will store the Todos where the user object has not been loaded yet, but it has already been requested
    const pendingToDosByUserId: { [userId: number]: { index: number, todo: Todo }[] } = {};

    this.todoService.getTodos().subscribe((todos: Todo[]) => {
      todos.forEach((todo: Todo, index: number) => {
        if (usersById[todo.userId]) {
          const todoWithUser: TodoWithUser = {todo, user: usersById[todo.userId]};
          result.push({index, todoWithUser});
          if (result.length == todos.length) {
            // we're finished - sort and send
            result.sort(
              (a: { index: number; todoWithUser: TodoWithUser }, b: { index: number; todoWithUser: TodoWithUser }) => a.index - b.index);
            resultSubject.next(result.map(
              (todoWithIndexAndUser: { index: number; todoWithUser: TodoWithUser }) => todoWithIndexAndUser.todoWithUser));
            resultSubject.complete();
          }
        } else {
          // we don't have the user yet, store the Todo for later
          let firstTodoForUserId = false;
          if (!pendingToDosByUserId[todo.userId]) {
            pendingToDosByUserId[todo.userId] = [];
            firstTodoForUserId = true;
          }
          pendingToDosByUserId[todo.userId].push({index, todo});
          // and if it was the first for the user id, request it
          if (firstTodoForUserId) {
            this.userService.getUser(todo.userId).subscribe((user: User) => {
              // store in cache
              usersById[user.id] = user;
              // fill all queued todos
              pendingToDosByUserId[user.id].forEach((previousTodoWithIndex: { index: number, todo: Todo }) => {
                const todoWithUser: TodoWithUser = {todo: previousTodoWithIndex.todo, user};
                result.push({index: previousTodoWithIndex.index, todoWithUser});
              });
              delete pendingToDosByUserId[user.id];
              // do I have now everything?
              if (result.length == todos.length) {
                // sort and send the list to the result observable
                result.sort(
                  (a: { index: number; todoWithUser: TodoWithUser }, b: { index: number; todoWithUser: TodoWithUser }) => a.index - b.index);
                resultSubject.next(result.map(
                  (todoWithIndexAndUser: { index: number; todoWithUser: TodoWithUser }) => todoWithIndexAndUser.todoWithUser));
                resultSubject.complete();
              }
            });
          }
        }
      })
    });

    // The following happens way before the todos and their users are finished!
    return resultSubject.asObservable();
  }

  /**
   * See Guidance.md for details
   */
  getTodosWithUsersPath1Step1(): Observable<TodoWithUser[]> {
    return this.todoService.getTodos().pipe(
      map((todos: Todo[]) => todos[0]),
      map((todo: Todo) => ({todo, user: {id: -1, name: ''}})),
      map((todoWithUser: TodoWithUser) => [todoWithUser])
    );
  }

  /**
   * See Guidance.md for details
   */
  getTodosWithUsersPath1Step2(): Observable<TodoWithUser[]> {
    return this.todoService.getTodos().pipe(
      map((todos: Todo[]) => todos[0]),
      map((todo: Todo) => ({todo, user: {id: -1, name: ''}})),
      switchMap((todoWithUser: TodoWithUser) =>
        this.userService.getUser(todoWithUser.todo.userId).pipe(
          map((user: User) => ({...todoWithUser, user}))
        )),
      map((todoWithUser: TodoWithUser) => [todoWithUser])
    );
  }

  /**
   * See Guidance.md for details
   */
  getTodosWithUsersPath1Step3(): Observable<TodoWithUser[]> {
    return this.todoService.getTodos().pipe(
      switchMap((todos: Todo[]) => from(todos)),
      map((todo: Todo) => ({todo, user: {id: -1, name: ''}})),
      concatMap((todoWithUser: TodoWithUser) =>
        this.userService.getUser(todoWithUser.todo.userId).pipe(
          map((user: User) => ({...todoWithUser, user}))
        )),
      bufferCount(Number.MAX_SAFE_INTEGER)
    );
  }

  /**
   * See Guidance.md for details
   */
  getTodosWithUsersPath2Step1(): Observable<TodoWithUser[]> {
    return this.todoService.getTodos().pipe(
      map((todos: Todo[]) =>
        todos.map((todo: Todo) => ({todo, user: {id: -1, name: ''}}))),
    );
  }

  /**
   * See Guidance.md for details
   */
  getTodosWithUsersPath2Step2(): Observable<TodoWithUser[]> {
    return this.todoService.getTodos().pipe(
      map((todos: Todo[]) =>
        todos.map((todo: Todo) => ({todo, user: {id: -1, name: ''}}))),
      concatMap((todosWithUser: TodoWithUser[]) => {
        const userRequests: Observable<User>[] =
          todosWithUser.map((todoWithUser: TodoWithUser) => this.userService.getUser(todoWithUser.todo.userId));
        return forkJoin(userRequests).pipe(
          map((users: User[]) =>
            todosWithUser.map((todoWithUser: TodoWithUser, index: number) => ({...todoWithUser, user: users[index]}))
          ));
      })
    );
  }

  getTodosWithUsersShort(): Observable<TodoWithUser[]> {
    return this.todoService.getTodos().pipe(
      switchMap(todos => from(todos).pipe(
        map(todo => todo.userId),
        distinct(),
        mergeMap(userId => this.userService.getUser(userId)),
        toArray(),
        map(users => todos.map(todo => ({ todo, user: users.find(u => u.id === todo.userId) } as TodoWithUser)))
      ))
    );
  }

}
