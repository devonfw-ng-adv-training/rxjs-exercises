import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TodoModule } from '../../todo.module';
import { TodoService } from './todo.service';
import { Todo } from './todo';

describe('TodoService', () => {

  let sut: TodoService;
  let httpController: HttpTestingController;
  const TODOS: Todo[] = [
    {id: 1, title: 'Angular', description: 'Learn Angular and have fun.', userId: 1},
    {id: 2, title: 'Clean Up', description: 'Clean up your home.', userId: 1},
    {id: 3, title: 'Taxes', description: 'Go make your tax statement.', userId: 1},
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TodoModule, HttpClientTestingModule],
    });
    sut = TestBed.get(TodoService);
    httpController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('can get todos', fakeAsync(() => {
    let result: Todo[]|undefined;

    sut.getTodos().subscribe(p => result = p);
    const request = httpController.expectOne('/api/todos');
    expect(request.request.method).toBe('GET');
    request.flush(TODOS);
    tick();

    expect(result).toBeDefined();
    expect((result as Todo[]).length).toBe(3);
  }));

});
