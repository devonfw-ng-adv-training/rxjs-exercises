import { Todo } from '../todo/todo';
import { User } from '../user/user';

export interface TodoWithUser {

  todo: Todo;
  user: User;

}
