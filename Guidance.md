# More guidance about the dashboard exercise

This file contains more information about the dashboard exercise. 

**If you want a challenge then you should ignore this file.**

Below is an overview and then a description of different paths that allow 
you to complete the service as well as an overview of the different test cases,
how much they test of the functionality and where they are fuzzy.

## Precondition

Before continuing here you should have written the content of `todo.service` and `user.service`
and thus insured that the tests for UserService and TodoService are running successful.

## Paths through this exercise

If you do not want to complete the dashboard service exercise on your own,
then here are some suggested paths to guide you:

1. Path: Start with one Todo and user, then for all.
2. Path: Start with Todos without users first, then add users.

### Path 1: First one, then all

The idea behind this approach is to get the logic working first for
one Todo only, then for all. The following steps are suggested:

1. Process one todo only
    * Unwrap the result from the TodoService and only process the first entry in the array
    * Map the first entry into a TodoWithUser but ignore the user information
    * Wrap that result into an array before returning it
    * Now the test (one todo only) should be successful
2. Add the user information for the one todo
    * For the one todo extract the user id
    * Make an asynchronous call to the user service to get the user information
    * Add it to the TodoWithUser
    * Now the additional test (one todo with user) should be successful
3. Process all Todos
    * Process all Todos instead of unwrapping the array and processing only the first entry.
      You don't have to pay attention to only making one call for each user yet. 
    * Now the additional tests (multiple calls allowed) and (only todos) should be successful
4. Cache users
    * Somehow cache the user information so that each user is only loaded once
    * Now all tests should be successful
    
### Path 2: Add users later

The idea behind this approach is to get the logic working for the list
of Todos but postpone adding the users.

1. Process Todos only
    * Convert the Todo objects to TodoWithUser objects
    * Now the tests (one todo only) and (only todos) should be successful
2. Add user information
    * Load the user information for every Todo.
      You don't have to pay attention to only making one call for each user yet.
    * Now the additional tests (one todo with user) and (multiple calls allowed) should succeed
3. Cache users
    * Somehow cache the user information so that each user is only loaded once
    * Now all tests should be successful

## Test case overview

The test cases of the DashboardService test suite have the following individual focus:

- (final): Test everything
- (final different order): Test everything, but check with a different order of Todos
- (multiple calls allowed): Tests completeness of the TodoWithUsers but allows for multiple backend calls for an individual user
- (only todos): Tests that the TodoWithUser result contains all Todos but ignores the user information
- (one todo with user): Tests that the processing works for one todo and one user
- (one todo only): Tests that the processing works for one todo and ignores user information
