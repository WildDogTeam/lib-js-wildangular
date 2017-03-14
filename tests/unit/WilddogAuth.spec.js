describe('WilddogAuth',function(){
  'use strict';

  var $wilddogAuth, ref, authService, auth, result, failure, status, tick, $timeout, log, fakePromise, fakePromiseResolve, fakePromiseReject;

  beforeEach(function(){

    log = {
      warn:[]
    };
    //
    // module('wilddog.utils');
    module('wilddog.auth',function($provide){
      $provide.value('$log',{
        warn:function(){
          log.warn.push(Array.prototype.slice.call(arguments,0));
        }
      })
    });
    module('testutils');

    result = undefined;
    failure = undefined;
    status = null;

    fakePromise = function () {
      var resolve;
      var reject;
      var obj = {
        then: function (_resolve, _reject) {
          resolve = _resolve;
          reject = _reject;
        },
        resolve: function (result) {
          resolve(result);
        },
        reject: function (err) {
          reject(err);
        }
      };
      fakePromiseReject = obj.reject;
      fakePromiseResolve = obj.resolve;
      return obj;
    }

    //offAuth, signInWithToken, updatePassword, changeEmail, removeUser
    auth = wilddog.auth();
    ['signInWithCustomToken','signInAnonymously','signInWithEmailAndPassword',
      'signInWithPhoneAndPassword','signInWithPopup','signInWithRedirect',
      'signInWithCredential','signOut','createUserWithEmailAndPassword',
      'createUserWithPhoneAndPassword','sendPasswordResetEmail',''
    ].forEach(function (funcName) {
      spyOn(auth, funcName).and.callFake(fakePromise);
    });
    spyOn(auth, 'onAuthStateChanged').and.callFake(function (cb) {
      fakePromiseResolve = function (result) {
        cb(result);
      }
      return function () {/* Deregister */};
    });

    inject(function(_$wilddogAuth_,_$timeout_, $q, $rootScope){
      $wilddogAuth = _$wilddogAuth_;
      authService = $wilddogAuth(auth);
      $timeout = _$timeout_;

      wilddog.sync.enableLogging(function () {tick()});
      tick = function () {
        setTimeout(function() {
          $q.defer();
          $rootScope.$digest();
          try {
            $timeout.flush();
          } catch (err) {
            // This throws an error when there is nothing to flush...
          }
        })
      };
    });

  });

  function wrapPromise(promise){
    promise.then(function(_result_){
      status = 'resolved';
      result = _result_;
    },function(_failure_){
      status = 'rejected';
      failure = _failure_;
    });
  }

  describe('Constructor', function() {
    it('will throw an error if a string is used in place of a Wilddog auth instance',function(){
      expect(function(){
        $wilddogAuth('https://some-wilddog.wilddogio.com/');
      }).toThrow();
    });

    it('will throw an error if a sync instance is used in place of a Wilddog auth instance',function(){
      expect(function(){
        $wilddogAuth(wilddog.sync());
      }).toThrow();
    });
  });

  it('will throw an error if a sync reference is used in place of a Wilddog auth instance',function(){
    expect(function(){
      $wilddogAuth(wilddog.sync().ref());
    }).toThrow();
  });

  it('will not throw an error if an auth instance is provided',function(){
      $wilddogAuth(wilddog.auth());
  });

  describe('$signInWithCustomToken',function(){
    it('should return a promise', function() {
      expect(authService.$signInWithCustomToken('myToken')).toBeAPromise();
    });

    it('passes custom token to underlying method',function(){
      authService.$signInWithCustomToken('myToken');
      expect(auth.signInWithCustomToken).toHaveBeenCalledWith('myToken');
    });

    it('will reject the promise if authentication fails',function(){
      var promise = authService.$signInWithCustomToken('myToken');
      wrapPromise(promise);
      fakePromiseReject('myError');
      $timeout.flush();
      expect(failure).toEqual('myError');
    });

    it('will resolve the promise upon authentication',function(){
      var promise = authService.$signInWithCustomToken('myToken');
      wrapPromise(promise);
      fakePromiseResolve('myResult');
      $timeout.flush();
      expect(result).toEqual('myResult');
    });
  });

  describe('$signInAnonymously',function(){
    it('should return a promise', function() {
      expect(authService.$signInAnonymously()).toBeAPromise();
    });

    it('passes options object to underlying method',function(){
      authService.$signInAnonymously();
      expect(auth.signInAnonymously).toHaveBeenCalled();
    });

    it('will reject the promise if authentication fails',function(){
      var promise = authService.$signInAnonymously('myToken');
      wrapPromise(promise);
      fakePromiseReject('myError');
      $timeout.flush();
      expect(failure).toEqual('myError');
    });

    it('will resolve the promise upon authentication',function(){
      var promise = authService.$signInAnonymously('myToken');
      wrapPromise(promise);
      fakePromiseResolve('myResult');
      $timeout.flush();
      expect(result).toEqual('myResult');
    });
  });

  describe('$signInWithEmailWithPassword',function(){
    it('should return a promise', function() {
      var email = 'abe@abe.abe';
      var password = 'abeabeabe';
      expect(authService.$signInWithEmailAndPassword(email, password)).toBeAPromise();
    });

    it('passes options and credentials object to underlying method',function(){
      var email = 'abe@abe.abe';
      var password = 'abeabeabe';
      authService.$signInWithEmailAndPassword(email, password);
      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        email, password
      );
    });

    it('will reject the promise if authentication fails',function(){
      var promise = authService.$signInWithEmailAndPassword('', '');
      wrapPromise(promise);
      fakePromiseReject('myError');
      $timeout.flush();
      expect(failure).toEqual('myError');
    });

    it('will resolve the promise upon authentication',function(){
      var promise = authService.$signInWithEmailAndPassword('', '');
      wrapPromise(promise);
      fakePromiseResolve('myResult');
      $timeout.flush();
      expect(result).toEqual('myResult');
    });
  });

  describe('$signInWithPopup',function(){
    it('should return a promise', function() {
      var provider = new wilddog.auth.QQAuthProvider();
      expect(authService.$signInWithPopup(provider)).toBeAPromise();
    });

  });

  describe('$signInWithRedirect',function(){
    it('should return a promise', function() {
      var provider = new wilddog.auth.QQAuthProvider();
      expect(authService.$signInWithRedirect(provider)).toBeAPromise();
    });
  });

  describe('$signInWithCredential',function(){
    it('should return a promise', function() {
      expect(authService.$signInWithCredential('CREDENTIAL')).toBeAPromise();
    });

    it('passes credential object to underlying method',function(){
      var credential = '!!!!';
      authService.$signInWithCredential(credential);
      expect(auth.signInWithCredential).toHaveBeenCalledWith(
        credential
      );
    });

    it('will reject the promise if authentication fails',function(){
      var promise = authService.$signInWithCredential('CREDENTIAL');
      wrapPromise(promise);
      fakePromiseReject('myError');
      $timeout.flush();
      expect(failure).toEqual('myError');
    });

    it('will resolve the promise upon authentication',function(){
      var promise = authService.$signInWithCredential('CREDENTIAL');
      wrapPromise(promise);
      fakePromiseResolve('myResult');
      $timeout.flush();
      expect(result).toEqual('myResult');
    });
  });

  describe('$getUser()',function(){
    it('returns getUser() from backing auth instance',function(){
      expect(authService.$getUser()).toEqual(auth.currentUser);
    });
  });

  describe('$signOut()',function(){
    it('should return a promise', function() {
      expect(authService.$signOut()).toBeAPromise();
    });

    it('will call not signOut() on backing auth instance when user is not signed in',function(){
      spyOn(authService._, 'getUser').and.callFake(function () {
        return null;
      });
      authService.$signOut();
      expect(auth.signOut).not.toHaveBeenCalled();
    });
  });

  describe('$onAuthStateChanged()',function(){
    it('calls onAuthStateChanged() on the backing auth instance', function() {
      function cb() {}
      var ctx = {};
      authService.$onAuthStateChanged(cb, ctx);
      expect(auth.onAuthStateChanged).toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('returns a deregistration function', function(){
      var cb = function () {};
      var ctx = {};
      expect(authService.$onAuthStateChanged(cb, ctx)).toEqual(jasmine.any(Function))
    });
  });

  describe('$requireUser()',function(){
    it('will be resolved if user is logged in', function(done){
      var credentials = {provider: 'qq'};
      spyOn(authService._, 'getUser').and.callFake(function () {
        return credentials;
      });

      authService.$requireUser()
        .then(function (result) {
          expect(result).toEqual(credentials);
          done();
        });

      fakePromiseResolve(credentials);
      tick();
    });

    it('will be rejected if user is not logged in', function(done){
      spyOn(authService._, 'getUser').and.callFake(function () {
        return null;
      });

      authService.$requireUser()
        .catch(function (error) {
          expect(error).toEqual('AUTH_REQUIRED');
          done();
        });

      fakePromiseResolve();
      tick();
    });
  });

  describe('$requireUser(requireEmailVerification)',function(){
    it('will be resolved if user is logged in and has a verified email address', function(done){
      var credentials = {provider: 'qq'};
      spyOn(authService._, 'getUser').and.callFake(function () {
        return credentials;
      });

      authService.$requireUser(true)
        .then(function (result) {
          expect(result).toEqual(credentials);
          done();
        });

      fakePromiseResolve(credentials);
      tick();
    });

    it('will be resolved if user is logged in and we ignore email verification', function(done){
      var credentials = {provider: 'qq'};
      spyOn(authService._, 'getUser').and.callFake(function () {
        return credentials;
      });

      authService.$requireUser(false)
        .then(function (result) {
          expect(result).toEqual(credentials);
          done();
        });

      fakePromiseResolve(credentials);
      tick();
    });

   it('will be rejected if user does not have a verified email address', function(done){
     var credentials = {provider: 'qq'};
     spyOn(authService._, 'getUser').and.callFake(function () {
       return credentials;
     });

      authService.$requireUser(true)
        .catch(function (error) {
          expect(error).toEqual('EMAIL_VERIFICATION_REQUIRED');
          done();
      });

      fakePromiseResolve(credentials);
      tick();
    });
  });

  describe('$waitForSignIn()',function(){
    it('will be resolved with authData if user is logged in', function(done){
      var credentials = {provider: 'qq'};
      spyOn(authService._, 'getUser').and.callFake(function () {
        return credentials;
      });

      authService.$().then(function (result) {
        expect(result).toEqual(credentials);
        done();
      });

      fakePromiseResolve(credentials);
      tick();
    });

    it('will be resolved with null if user is not logged in', function(done){
      spyOn(authService._, 'getUser').and.callFake(function () {
        return null;
      });

      authService.$waitForSignIn().then(function (result) {
        expect(result).toEqual(null);
        done();
      });

      fakePromiseResolve();
      tick();
    });
  });

  describe('$createUserWithEmailAndPassword()',function(){
    it('should return a promise', function() {
      var email = 'somebody@somewhere.com';
      var password = '12345';
      expect(authService.$createUserWithEmailAndPassword(email, password)).toBeAPromise();
    });

    it('passes email/password to method on backing ref',function(){
      var email = 'somebody@somewhere.com';
      var password = '12345';
      authService.$createUserWithEmailAndPassword(email, password);
      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
          email, password);
    });

    it('will reject the promise if creation fails',function(){
      var promise = authService.$createUserWithEmailAndPassword('abe@abe.abe', '12345');
      wrapPromise(promise);
      fakePromiseReject('myError');
      $timeout.flush();
      expect(failure).toEqual('myError');
    });

    it('will resolve the promise upon creation',function(){
      var promise = authService.$createUserWithEmailAndPassword('abe@abe.abe', '12345');
      wrapPromise(promise);
      fakePromiseResolve('myResult');
      $timeout.flush();
      expect(result).toEqual('myResult');
    });
  });

  describe('$createUserWithPhoneAndPassword()',function(){
    it('should return a promise', function() {
      var phone = '13288888888';
      var password = '12345';
      expect(authService.$createUserWithPhoneAndPassword(phone, password)).toBeAPromise();
    });

    it('passes email/password to method on backing ref',function(){
      var phone = 'somebody@somewhere.com';
      var password = '12345';
      authService.$createUserWithPhoneAndPassword(phone, password);
      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
          phone, password);
    });

    it('will reject the promise if creation fails',function(){
      var promise = authService.$createUserWithPhoneAndPassword('13288888888', '12345');
      wrapPromise(promise);
      fakePromiseReject('myError');
      $timeout.flush();
      expect(failure).toEqual('myError');
    });

    it('will resolve the promise upon creation',function(){
      var promise = authService.$createUserWithPhoneAndPassword('13288888888', '12345');
      wrapPromise(promise);
      fakePromiseResolve('myResult');
      $timeout.flush();
      expect(result).toEqual('myResult');
    });
  });

  describe('$updatePassword()',function() {
    it('should return a promise', function() {
      var newPassword = 'CatInDatHat';
      expect(authService.$updatePassword(newPassword)).toBeAPromise();
    });

    it('passes new password to method on backing auth instance',function(done) {
      spyOn(authService._, 'getUser').and.callFake(function () {
        return {
          updatePassword: function (password) {
            expect(password).toBe(newPassword);
            done();
          }
        };
      });

      var newPassword = 'CatInDatHat';
      authService.$updatePassword(newPassword);
    });

    it('will reject the promise if creation fails',function(){
      spyOn(authService._, 'getUser').and.callFake(function () {
        return {
          updatePassword: function (password) {
            return fakePromise();
          }
        };
      });

      var promise = authService.$updatePassword('PASSWORD');
      wrapPromise(promise);
      fakePromiseReject('myError');
      $timeout.flush();
      expect(failure).toEqual('myError');
    });

    it('will resolve the promise upon creation',function(){
      spyOn(authService._, 'getUser').and.callFake(function () {
        return {
          updatePassword: function (password) {
            return fakePromise();
          }
        };
      });

      var promise = authService.$updatePassword('PASSWORD');
      wrapPromise(promise);
      fakePromiseResolve('myResult');
      $timeout.flush();
      expect(result).toEqual('myResult');
    });
  });

  describe('$updateEmail()',function() {
    it('should return a promise', function() {
      var newEmail = 'abe@abe.abe';
      expect(authService.$updateEmail(newEmail)).toBeAPromise();
    });

    it('passes new email to method on backing auth instance',function(done) {
      spyOn(authService._, 'getUser').and.callFake(function () {
        return {
          updateEmail: function (email) {
            expect(email).toBe(newEmail);
            done();
          }
        };
      });

      var newEmail = 'abe@abe.abe';
      authService.$updateEmail(newEmail);
    });

    it('will reject the promise if creation fails',function(){
      spyOn(authService._, 'getUser').and.callFake(function () {
        return {
          updateEmail: function (email) {
            return fakePromise();
          }
        };
      });

      var promise = authService.$updateEmail('abe@abe.abe');
      wrapPromise(promise);
      fakePromiseReject('myError');
      $timeout.flush();
      expect(failure).toEqual('myError');
    });

    it('will resolve the promise upon creation',function(){
      spyOn(authService._, 'getUser').and.callFake(function () {
        return {
          updateEmail: function (email) {
            return fakePromise();
          }
        };
      });

      var promise = authService.$updateEmail('abe@abe.abe');
      wrapPromise(promise);
      fakePromiseResolve('myResult');
      $timeout.flush();
      expect(result).toEqual('myResult');
    });
  });

  describe('$deleteUser()',function(){
    it('should return a promise', function() {
      expect(authService.$deleteUser()).toBeAPromise();
    });

    it('calls delete on backing auth instance',function(done) {
      spyOn(authService._, 'getUser').and.callFake(function () {
        return {
          delete: function () {
            done();
          }
        };
      });
      authService.$deleteUser();
    });

    it('will reject the promise if creation fails',function(){
      spyOn(authService._, 'getUser').and.callFake(function () {
        return {
          delete: function () {
            return fakePromise();
          }
        };
      });

      var promise = authService.$deleteUser();
      wrapPromise(promise);
      fakePromiseReject('myError');
      $timeout.flush();
      expect(failure).toEqual('myError');
    });

    it('will resolve the promise upon creation',function(){
      spyOn(authService._, 'getUser').and.callFake(function () {
        return {
          delete: function () {
            return fakePromise();
          }
        };
      });

      var promise = authService.$deleteUser();
      wrapPromise(promise);
      fakePromiseResolve('myResult');
      $timeout.flush();
      expect(result).toEqual('myResult');
    });
  });

  describe('$sendPasswordResetEmail()',function(){
    it('should return a promise', function() {
      var email = 'somebody@somewhere.com';
      expect(authService.$sendPasswordResetEmail(email)).toBeAPromise();
    });

    it('passes email to method on backing auth instance',function(){
      var email = 'somebody@somewhere.com';
      authService.$sendPasswordResetEmail(email);
      expect(auth.sendPasswordResetEmail).toHaveBeenCalledWith(email);
    });

    it('will reject the promise if creation fails',function(){
      var promise = authService.$sendPasswordResetEmail('abe@abe.abe');
      wrapPromise(promise);
      fakePromiseReject('myError');
      $timeout.flush();
      expect(failure).toEqual('myError');
    });

    it('will resolve the promise upon creation',function(){
      var promise = authService.$sendPasswordResetEmail('abe@abe.abe');
      wrapPromise(promise);
      fakePromiseResolve('myResult');
      $timeout.flush();
      expect(result).toEqual('myResult');
    });
  });

  describe('$sendPasswordResetPhone()',function(){
    it('should return a promise', function() {
      var phone = '13288888888';
      expect(authService.$sendPasswordResetPhone(phone)).toBeAPromise();
    });

    it('passes email to method on backing auth instance',function(){
      var phone = 'somebody@somewhere.com';
      authService.$sendPasswordResetPhone(phone);
      expect(auth.sendPasswordResetEmail).toHaveBeenCalledWith(phone);
    });

    it('will reject the promise if creation fails',function(){
      var promise = authService.$sendPasswordResetPhone('13288888888');
      wrapPromise(promise);
      fakePromiseReject('myError');
      $timeout.flush();
      expect(failure).toEqual('myError');
    });

    it('will resolve the promise upon creation',function(){
      var promise = authService.$sendPasswordResetPhone('13288888888');
      wrapPromise(promise);
      fakePromiseResolve('myResult');
      $timeout.flush();
      expect(result).toEqual('myResult');
    });
  });
});
