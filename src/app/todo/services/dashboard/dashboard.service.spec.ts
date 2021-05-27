import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import {TodoModule} from '../../todo.module';
import {DashboardService} from './dashboard.service';
import {Todo} from '../todo/todo';
import {User} from '../user/user';
import {TodoWithUser} from './todo-with-user';
import {HttpClient} from '@angular/common/http';
import {asyncScheduler, Observable, of} from 'rxjs';
import {observeOn} from 'rxjs/operators';

const TODOS: Todo[] = [
  {id: 1, title: 'Angular', description: 'Learn Angular and have fun.', userId: 1},
  {id: 2, title: 'Clean Up', description: 'Clean up your home.', userId: 1},
  {id: 3, title: 'Taxes', description: 'Go make your tax statement.', userId: 1},
  {id: 4, title: 'Magic Stuff', description: 'Do magic stuff.', userId: 2},
  {id: 5, title: 'Other Stuff', description: 'Do other stuff.', userId: 3},
  {id: 6, title: 'Go ahead', description: 'Make it work.', userId: 3}
];
const USER_1: User = {id: 1, name: 'Max Mustermann'};
const USER_2: User = {id: 2, name: 'Averell Dalton'};
const USER_3: User = {id: 3, name: 'Superman'};
const USERS_BY_ID = {
  1: USER_1,
  2: USER_2,
  3: USER_3
};
const EXPECTED_USERS = [USER_1, USER_1, USER_1, USER_2, USER_3, USER_3];

/**
 * Because the HttpTestingController is a bit limited when it comes do different order or structure of calls,
 * we use a mock class. This avoids limiting the implementations which fulfill the test cases.
 */
class MockHttpClient {

  todoCallCount: number;
  userCallCounts: { [id: number]: number };
  private todoListResponse: Todo[];

  constructor() {
    this.reset();
  }

  reset() {
    this.todoListResponse = TODOS;
    this.todoCallCount = 0;
    this.userCallCounts = {};
    Object.keys(USERS_BY_ID).forEach(id => this.userCallCounts[id] = 0);
  }

  respondWithTodos(todoList: Todo[]) {
    this.todoListResponse = todoList;
  }

  get(url: string): Observable<any> {
    if (url === '/api/todos') {
      this.todoCallCount++;
      return of(this.todoListResponse).pipe(observeOn(asyncScheduler));
    }
    if (url.startsWith('/api/users/')) {
      const userId = url.substring('/api/users/'.length);
      const user = USERS_BY_ID[userId];
      if (user) {
        this.userCallCounts[userId]++;
        return of(user).pipe(observeOn(asyncScheduler));
      }
    }
    throw new Error('Unexpected request to URL ' + url);
  }

}

describe('DashboardService', () => {

  let sut: DashboardService;
  let httpMock: MockHttpClient;

  beforeEach(() => {
    httpMock = new MockHttpClient();
    TestBed.configureTestingModule({
      imports: [TodoModule],
      providers: [{provide: HttpClient, useValue: httpMock}]
    });
    sut = TestBed.inject(DashboardService);
  });

  afterEach(() => {
  });

  /**
   * This is the complete test for everything - some partial tests are below.
   * Consult Guidance.md for more information if you need help.
   */
  it('(final) can get todos with users and each user is only requested once', fakeAsync(() => {
    let result: TodoWithUser[] | undefined;

    sut.getTodosWithUsers().subscribe(p => result = p, e => console.log('ERROR', e));
    tick();

    expect(httpMock.todoCallCount).toBe(1);
    expect(httpMock.userCallCounts[1]).toBe(1);
    expect(httpMock.userCallCounts[2]).toBe(1);
    expect(httpMock.userCallCounts[3]).toBe(1);

    expect(result).toBeDefined();
    expect((result as TodoWithUser[]).length).toBe(6);
    // User 1
    expect((result as TodoWithUser[])[0].todo).toBe(TODOS[0]);
    expect((result as TodoWithUser[])[0].user).toBe(EXPECTED_USERS[0]);
    expect((result as TodoWithUser[])[1].todo).toBe(TODOS[1]);
    expect((result as TodoWithUser[])[1].user).toBe(EXPECTED_USERS[1]);
    expect((result as TodoWithUser[])[2].todo).toBe(TODOS[2]);
    expect((result as TodoWithUser[])[2].user).toBe(EXPECTED_USERS[2]);
    // User 2
    expect((result as TodoWithUser[])[3].todo).toBe(TODOS[3]);
    expect((result as TodoWithUser[])[3].user).toBe(EXPECTED_USERS[3]);
    // User 3
    expect((result as TodoWithUser[])[4].todo).toBe(TODOS[4]);
    expect((result as TodoWithUser[])[4].user).toBe(EXPECTED_USERS[4]);
    expect((result as TodoWithUser[])[5].todo).toBe(TODOS[5]);
    expect((result as TodoWithUser[])[5].user).toBe(EXPECTED_USERS[5]);
  }));

  /**
   * This is the complete test for everything - some partial tests are below.
   * Consult Guidance.md for more information if you need help.
   */
  it('(final different order) can get todos with users and each user is only requested once', fakeAsync(() => {
    let result: TodoWithUser[] | undefined;

    const todoDifferentOrder: Todo[] = [];
    const expectedUsersDifferentOrder: User[] = [];
    [0,3,1,5,2,4].forEach((i) => {
      todoDifferentOrder.push(TODOS[i]);
      expectedUsersDifferentOrder.push(EXPECTED_USERS[i]);
    });
    httpMock.respondWithTodos(todoDifferentOrder);

    sut.getTodosWithUsers().subscribe(p => result = p, e => console.log('ERROR', e));
    tick();

    expect(httpMock.todoCallCount).toBe(1);
    expect(httpMock.userCallCounts[1]).toBe(1);
    expect(httpMock.userCallCounts[2]).toBe(1);
    expect(httpMock.userCallCounts[3]).toBe(1);

    expect(result).toBeDefined();
    expect((result as TodoWithUser[]).length).toBe(6);
    expect((result as TodoWithUser[])[0].todo).toBe(todoDifferentOrder[0]);
    expect((result as TodoWithUser[])[0].user).toBe(expectedUsersDifferentOrder[0]);
    expect((result as TodoWithUser[])[1].todo).toBe(todoDifferentOrder[1]);
    expect((result as TodoWithUser[])[1].user).toBe(expectedUsersDifferentOrder[1]);
    expect((result as TodoWithUser[])[2].todo).toBe(todoDifferentOrder[2]);
    expect((result as TodoWithUser[])[2].user).toBe(expectedUsersDifferentOrder[2]);
    expect((result as TodoWithUser[])[3].todo).toBe(todoDifferentOrder[3]);
    expect((result as TodoWithUser[])[3].user).toBe(expectedUsersDifferentOrder[3]);
    expect((result as TodoWithUser[])[4].todo).toBe(todoDifferentOrder[4]);
    expect((result as TodoWithUser[])[4].user).toBe(expectedUsersDifferentOrder[4]);
    expect((result as TodoWithUser[])[5].todo).toBe(todoDifferentOrder[5]);
    expect((result as TodoWithUser[])[5].user).toBe(expectedUsersDifferentOrder[5]);
  }));

  /**
   * Like (final) but allows multiple calls for the same user to the backend
   */
  it('(multiple calls allowed) can get todos with users and users may be requested multiple times', fakeAsync(() => {
    let result: TodoWithUser[] | undefined;

    sut.getTodosWithUsers().subscribe(p => result = p);
    tick();

    expect(httpMock.todoCallCount).toBe(1);
    expect(httpMock.userCallCounts[1]).toBeGreaterThanOrEqual(1);
    expect(httpMock.userCallCounts[2]).toBeGreaterThanOrEqual(1);
    expect(httpMock.userCallCounts[3]).toBeGreaterThanOrEqual(1);

    expect(result).toBeDefined();
    expect((result as TodoWithUser[]).length).toBe(6);
    // User 1
    expect((result as TodoWithUser[])[0].todo).toBe(TODOS[0]);
    expect((result as TodoWithUser[])[0].user).toBe(USER_1);
    expect((result as TodoWithUser[])[1].todo).toBe(TODOS[1]);
    expect((result as TodoWithUser[])[1].user).toBe(USER_1);
    expect((result as TodoWithUser[])[2].todo).toBe(TODOS[2]);
    expect((result as TodoWithUser[])[2].user).toBe(USER_1);
    // User 2
    expect((result as TodoWithUser[])[3].todo).toBe(TODOS[3]);
    expect((result as TodoWithUser[])[3].user).toBe(USER_2);
    // User 3
    expect((result as TodoWithUser[])[4].todo).toBe(TODOS[4]);
    expect((result as TodoWithUser[])[4].user).toBe(USER_3);
    expect((result as TodoWithUser[])[5].todo).toBe(TODOS[5]);
    expect((result as TodoWithUser[])[5].user).toBe(USER_3);
  }));

  /**
   * Like (multiple calls allowed) but does not check for user information in the result - only the Todo objects are expected
   */
  it('(only todos) can get todos without users', fakeAsync(() => {
    let result: TodoWithUser[] | undefined;

    sut.getTodosWithUsers().subscribe(p => result = p);
    tick();

    expect(httpMock.todoCallCount).toBe(1);

    expect(result).toBeDefined();
    expect((result as TodoWithUser[]).length).toBe(6);
    // User 1
    expect((result as TodoWithUser[])[0].todo).toBe(TODOS[0]);
    expect((result as TodoWithUser[])[1].todo).toBe(TODOS[1]);
    expect((result as TodoWithUser[])[2].todo).toBe(TODOS[2]);
    // User 2
    expect((result as TodoWithUser[])[3].todo).toBe(TODOS[3]);
    // User 3
    expect((result as TodoWithUser[])[4].todo).toBe(TODOS[4]);
    expect((result as TodoWithUser[])[5].todo).toBe(TODOS[5]);
  }));

  /**
   * tests only for one todo and one user, and only one call to the user service is expected
   */
  it('(one todo with user) can get todo with user but only one todo is tested', fakeAsync(() => {
    let result: TodoWithUser[] | undefined;

    httpMock.respondWithTodos([TODOS[0]]);

    sut.getTodosWithUsers().subscribe(p => result = p);
    tick();

    expect(httpMock.todoCallCount).toBe(1);
    expect(httpMock.userCallCounts[1]).toBeGreaterThanOrEqual(1);

    expect(result).toBeDefined();
    expect((result as TodoWithUser[]).length).toBe(1);
    // User 1
    expect((result as TodoWithUser[])[0].todo).toBe(TODOS[0]);
    expect((result as TodoWithUser[])[0].user).toBe(USER_1);
  }));

  /**
   * tests only for one todo and no user
   */
  it('(one todo only) can get one todo', fakeAsync(() => {
    let result: TodoWithUser[] | undefined;

    httpMock.respondWithTodos([TODOS[0]]);

    sut.getTodosWithUsers().subscribe(p => result = p);
    tick();

    expect(httpMock.todoCallCount).toBe(1);
    expect(httpMock.userCallCounts[1]).toBeGreaterThanOrEqual(0);

    expect(result).toBeDefined();
    expect((result as TodoWithUser[]).length).toBe(1);
    // User 1
    expect((result as TodoWithUser[])[0].todo).toBe(TODOS[0]);
  }));


});
