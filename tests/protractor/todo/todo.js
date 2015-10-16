var app = angular.module('todo', ['wilddog']);
app. controller('TodoCtrl', function Todo($scope, $wilddogArray) {
  // Get a reference to the Wilddog
  var todosRef = new Wilddog('https://wild-angular.wilddogio.com/todo').push();

  // Put the random push ID into the DOM so that the test suite can grab it
  document.getElementById('pushId').innerHTML = todosRef.key();

  // Get the todos as an array
  $scope.todos = $wilddogArray(todosRef);

  // Verify that $ref() works
  verify($scope.todos.$ref() === todosRef, "Something is wrong with $wilddogArray.$ref().");

  /* Clears the todos Wilddog reference */
  $scope.clearRef = function () {
    todosRef.remove();
  };

  /* Adds a new todo item */
  $scope.addTodo = function() {
    if ($scope.newTodo !== '') {
      $scope.todos.$add({
        title: $scope.newTodo,
        completed: false
      });

      $scope.newTodo = '';
    }
  };

  /* Adds a random todo item */
  $scope.addRandomTodo = function () {
    $scope.newTodo = 'Todo ' + new Date().getTime();
    $scope.addTodo();
  };

  /* Removes the todo item with the inputted ID */
  $scope.removeTodo = function(id) {
    // Verify that $indexFor() and $keyAt() work
    verify($scope.todos.$indexFor($scope.todos.$keyAt(id)) === id, "Something is wrong with $wilddogArray.$indexFor() or WilddogArray.$keyAt().");

    $scope.todos.$remove(id);
  };

  /* Unbinds the todos array */
  $scope.destroyArray = function() {
    $scope.todos.$destroy();
  };

  /* Logs a message and throws an error if the inputted expression is false */
  function verify(expression, message) {
    if (!expression) {
      console.log(message);
      throw new Error(message);
    }
  }
});
