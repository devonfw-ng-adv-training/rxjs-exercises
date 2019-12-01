import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TodoModule } from '../../todo.module';
import { UserService } from './user.service';
import { User } from './user';

describe('TodoService', () => {

  let sut: UserService;
  let httpController: HttpTestingController;
  const USER_1: User = {id: 1, name: 'Max Mustermann'};
  const USER_1337: User = {id: 1337, name: 'Averell Dalton'};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TodoModule, HttpClientTestingModule],
    });
    sut = TestBed.get(UserService);
    httpController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('can get user with id 1', fakeAsync(() => {
    let result: User|undefined;

    sut.getUser(1).subscribe(p => result = p);
    const request = httpController.expectOne('/api/users/1');
    expect(request.request.method).toBe('GET');
    request.flush(USER_1);
    tick();

    expect(result).toBeDefined();
    expect((result as User).name).toBe('Max Mustermann');
  }));

  it('can get user with id 1337', fakeAsync(() => {
    let result: User|undefined;

    sut.getUser(1).subscribe(p => result = p);
    const request = httpController.expectOne('/api/users/1');
    expect(request.request.method).toBe('GET');
    request.flush(USER_1337);
    tick();

    expect(result).toBeDefined();
    expect((result as User).name).toBe('Averell Dalton');
  }));

});
