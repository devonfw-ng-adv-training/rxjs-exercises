import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TodoModule } from '../../todo.module';
import { DashboardService } from './dashboard.service';
import { Todo } from '../todo/todo';
import { User } from '../user/user';
import { TodoWithUser } from './todo-with-user';
import { Type } from '@angular/core';

describe('DashboardService', () => {

  let sut: DashboardService;
  let httpController: HttpTestingController;
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TodoModule, HttpClientTestingModule],
    });
    sut = TestBed.get(DashboardService);
    httpController = TestBed.get(HttpTestingController as Type<HttpTestingController>);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('can get todos with users', fakeAsync(() => {
    let result: TodoWithUser[]|undefined;

    sut.getTodosWithUsers().subscribe(p => result = p);
    const request = httpController.expectOne('/api/todos');
    expect(request.request.method).toBe('GET');
    request.flush(TODOS);
    const userRequest1 = httpController.expectOne('/api/users/' + 1);
    const userRequest2 = httpController.expectOne('/api/users/' + 2);
    const userRequest3 = httpController.expectOne('/api/users/' + 3);
    userRequest1.flush(USER_1);
    userRequest2.flush(USER_2);
    userRequest3.flush(USER_3);
    expect(userRequest1.request.method).toBe('GET');
    expect(userRequest2.request.method).toBe('GET');
    expect(userRequest3.request.method).toBe('GET');
    tick();

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
    expect((result as TodoWithUser[])[3].user).toBe(USER_2);
    expect((result as TodoWithUser[])[3].todo).toBe(TODOS[3]);
    // User 3
    expect((result as TodoWithUser[])[4].user).toBe(USER_3);
    expect((result as TodoWithUser[])[4].todo).toBe(TODOS[4]);
    expect((result as TodoWithUser[])[5].user).toBe(USER_3);
    expect((result as TodoWithUser[])[5].todo).toBe(TODOS[5]);
  }));

});
