
# rjxs exercises

This application contains unit tests. These tests are currently failing. 
The services need to be fixed - do not modify the unit tests.

The tests are organized with incremental difficulty, 
simply 'fdescribe' the test for the service that you want to work on:

* Level 0: `level0.service.ts`: basic creation and subscription
* Level 1: `level1.service.ts`: first operators
* Level 2: `level2.service.ts`: simple combination of observables
* Level 3: `level3.service.ts`: combination of values from observables
* Level 4: `level4.service.ts`: calling a sub process
* Level 6: `level6.service.ts`: typeahead (combination of observables with constraints)
* Level 7: `level7.service.ts`: conditional execution

There is a challenge below `todo/services/*`
  * Fix `todo.service`
  * Fix `user.service`
  * Fix `dashboard.service`

Hint: The first two of those are easy, the dashboard is challenging 
(and is not meant at all for developers who are new to RxJs).

However, the dashboard exercise doesn't have to be completed in
one go: there are multiple steps and different implementation
paths that you can follow. If you want more guidance, then
check [Guidance.md](./Guidance.md).

# Origin:

Originally from Philip Schmökel, 2017-2019

* updated angular cli
* removed unnecessary code
* some fixes and documentation improvements
* provided sample solution
* provided Guidance.md
* updated test suite to have multiple progressing test cases 
* added alternative sample solutions
