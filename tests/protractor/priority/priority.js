var app = angular.module('priority', ['wilddog']);
app.controller('PriorityCtrl', function Chat($scope, $wilddogArray, $wilddogObject) {
  // Get a reference to the Wilddog
  var messagesRef = new Wilddog('https://wild-angular.wilddogio.com/priority').push();

  // Put the random push ID into the DOM so that the test suite can grab it
  document.getElementById('pushId').innerHTML = messagesRef.key();

  // Get the chat messages as an array
  $scope.messages = $wilddogArray(messagesRef);

  // Verify that $inst() works
  verify($scope.messages.$ref() === messagesRef, 'Something is wrong with $wilddogArray.$ref().');

  // Initialize $scope variables
  $scope.message = '';
  $scope.username = 'Guest' + Math.floor(Math.random() * 101);

  /* Clears the priority Wilddog reference */
  $scope.clearRef = function () {
    messagesRef.remove();
  };

  /* Adds a new message to the messages list */
  $scope.addMessage = function () {
    if ($scope.message !== '') {
      // Add a new message to the messages list
      var priority = $scope.messages.length;
      $scope.messages.$add({
        from: $scope.username,
        content: $scope.message
      }).then(function (ref) {
        var newItem = $wilddogObject(ref);

        newItem.$loaded().then(function (data) {
          verify(newItem === data, '$wilddogObject.$loaded() does not return correct value.');

          // Update the message's priority
          newItem.$priority = priority;
          newItem.$save();
        });
      }, function (error) {
        verify(false, 'Something is wrong with $wilddogArray.$add().');
      });

      // Reset the message input
      $scope.message = '';
    };
  };

  /* Destroys all wild-angular bindings */
  $scope.destroy = function() {
    $scope.messages.$destroy();
  };

  /* Logs a message and throws an error if the inputted expression is false */
  function verify(expression, message) {
    if (!expression) {
      console.log(message);
      throw new Error(message);
    }
  }
});
