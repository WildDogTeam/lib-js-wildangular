var protractor = require('protractor');
var Wilddog = require('wilddog');

describe('Chat App', function () {
  // Reference to the Wilddog which stores the data for this demo
  var wilddogRef = new Wilddog('https://wild-angular.wilddogio.com/chat');

  // Boolean used to load the page on the first test only
  var isPageLoaded = false;

  // Reference to the messages repeater
  var messages = element.all(by.repeater('message in messages'));

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

      // Navigate to the chat app
      browser.get('chat/chat.html').then(function() {
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
    expect(browser.getTitle()).toEqual('wild-angular Chat e2e Test');
  });

  it('starts with an empty list of messages', function () {
    expect(messages.count()).toBe(0);
  });

  it('adds new messages', function () {
    // Add three new messages by typing into the input and pressing enter
    var newMessageInput = element(by.model('message'));
    newMessageInput.sendKeys('Hey there!\n');
    newMessageInput.sendKeys('Oh, hi. How are you?\n');
    newMessageInput.sendKeys('Pretty fantastic!\n');

    sleep();

    // We should only have two messages in the repeater since we did a limit query
    expect(messages.count()).toBe(2);
  });

  it('updates upon new remote messages', function () {
    flow.execute(function() {
      var def = protractor.promise.defer();
      // Simulate a message being added remotely
      wilddogRef.child('messages').push({
        from: 'Guest 2000',
        content: 'Remote message detected'
      }, function(err) {
        if( err ) { def.reject(err); }
        else { def.fulfill(); }
      });
      return def.promise;
    });

    // We should only have two messages in the repeater since we did a limit query
    expect(messages.count()).toBe(2);
  });

  it('updates upon removed remote messages', function () {
    flow.execute(function() {
      var def = protractor.promise.defer();
      // Simulate a message being deleted remotely
      var onCallback = wilddogRef.child('messages').limitToLast(1).on('child_added', function(childSnapshot) {
        wilddogRef.child('messages').off('child_added', onCallback);
        childSnapshot.ref().remove(function(err) {
          if( err ) { def.reject(err); }
          else { def.fulfill(); }
        });
      });
      return def.promise;
    });

    // We should only have two messages in the repeater since we did a limit query
    expect(messages.count()).toBe(2);
  });

  it('stops updating once the wild-angular bindings are destroyed', function () {
    // Destroy the wild-angular bindings
    $('#destroyButton').click();

    sleep();

    expect(messages.count()).toBe(0);
  });
});
