var protractor = require('protractor');
var Wilddog = require('wilddog');

describe('Todo App', function () {
  // Reference to the Wilddog which stores the data for this demo
  var wilddogRef = new Wilddog('https://angularfire.wilddogio-demo.com/todo');

  // Boolean used to load the page on the first test only
  var isPageLoaded = false;

  // Reference to the todos repeater
  var todos = element.all(by.repeater('(id, todo) in todos'));
  var flow = protractor.promise.controlFlow();

  function waitOne() {
    return protractor.promise.delayed(500);
  }

  function sleep() {
    flow.execute(waitOne);
  }

  function clearWilddogRef() {
    var deferred = protractor.promise.defer();

    wilddogRef.remove(function(err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.fulfill();
      }
    });

    return deferred.promise;
  }

  beforeEach(function (done) {
    if (!isPageLoaded) {
      isPageLoaded = true;

      // Navigate to the todo app
      browser.get('todo/todo.html').then(function() {
        // Get the random push ID where the data is being stored
        return $('#pushId').getText();
      }).then(function(pushId) {
        // Update the Wilddog ref to point to the random push ID
        wilddogRef = wilddogRef.child(pushId);

        // Clear the Wilddog ref
        return clearWilddogRef();
      }).then(done);
    } else {
      done();
    }
  });

  it('loads', function () {
    expect(browser.getTitle()).toEqual('wild-angular Todo e2e Test');
  });

  it('starts with an empty list of Todos', function () {
    expect(todos.count()).toBe(0);
  });

  it('adds new Todos', function () {
    // Add three new todos by typing into the input and pressing enter
    var newTodoInput = element(by.model('newTodo'));
    newTodoInput.sendKeys('Buy groceries\n');
    newTodoInput.sendKeys('Run 10 miles\n');
    newTodoInput.sendKeys('Build Wilddog\n');

    sleep();

    expect(todos.count()).toBe(3);
  });

  it('adds random Todos', function () {
    // Add a three new random todos via the provided button
    var addRandomTodoButton = $('#addRandomTodoButton');
    addRandomTodoButton.click();
    addRandomTodoButton.click();
    addRandomTodoButton.click();

    sleep();

    expect(todos.count()).toBe(6);
  });

  it('removes Todos', function () {
    // Remove two of the todos via the provided buttons
    $('.todo:nth-of-type(2) .removeTodoButton').click();
    $('.todo:nth-of-type(3) .removeTodoButton').click();

    sleep();

    expect(todos.count()).toBe(4);
  });

  it('updates when a new Todo is added remotely', function () {
    // Simulate a todo being added remotely
    flow.execute(function() {
      var def = protractor.promise.defer();
      wilddogRef.push({
        title: 'Wash the dishes',
        completed: false
      }, function(err) {
        if( err ) { def.reject(err); }
        else { def.fulfill(); }
      });
      return def.promise;
    });
    expect(todos.count()).toBe(5);
  });

  it('updates when an existing Todo is removed remotely', function () {
    // Simulate a todo being removed remotely
    flow.execute(function() {
      var def = protractor.promise.defer();
      var onCallback = wilddogRef.limitToLast(1).on("child_added", function(childSnapshot) {
        // Make sure we only remove a child once
        wilddogRef.off("child_added", onCallback);

        childSnapshot.ref().remove(function(err) {
          if( err ) { def.reject(err); }
          else { def.fulfill(); }
        });
      });
      return def.promise;
    });
    expect(todos.count()).toBe(4);
  });

  it('stops updating once the sync array is destroyed', function () {
    // Destroy the sync array
    $('#destroyArrayButton').click();

    sleep();

    expect(todos.count()).toBe(0);
  });
});