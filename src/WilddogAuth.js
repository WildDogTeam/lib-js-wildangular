(function() {
  'use strict';
  var WilddogAuth;

  // Define a service which provides user authentication and management.
  angular.module('wilddog').factory('$wilddogAuth', [
    '$q', '$wilddogUtils',
    function($q, $wilddogUtils) {
      /**
       * This factory returns an object allowing you to manage the client's authentication state.
       *
       * @param {Wilddog} auth A Wilddog Auth to authenticate.
       * @return {object} An object containing methods for authenticating clients, retrieving
       * authentication state, and managing users.
       */
      return function(auth) {
        var authInstance = new WilddogAuth($q, $wilddogUtils, auth);
        return authInstance.construct();
      };
    }
  ]);

  WilddogAuth = function($q, $wilddogUtils, auth) {
    this._q = $q;
    this._utils = $wilddogUtils;
    if (typeof auth === 'string') {
      throw new Error('Please provide a Wilddog auth instead of a URL when creating a `$wilddogAuth` object.');
    } else if (typeof auth.ref !== 'undefined') {
      throw new Error('Please provide a Wilddog auth instead of a Wilddog sync when creating a `$wilddogAuth` object.');
    }
    this._auth = auth;
    this._initialAuthResolver = this._initAuthResolver();
  };

  WilddogAuth.prototype = {
    construct: function() {
      this._object = {
        // Authentication methods
        $signInWithCustomToken: this.signInWithCustomToken.bind(this),
        $signInAnonymously: this.signInAnonymously.bind(this),
        $signInWithEmailAndPassword: this.signInWithEmailAndPassword.bind(this),
        $signInWithPhoneAndPassword: this.signInWithPhoneAndPassword.bind(this),
        $signInWithPopup: this.signInWithPopup.bind(this),
        $signInWithRedirect: this.signInWithRedirect.bind(this),
        $signInWithCredential: this.signInWithCredential.bind(this),
        $signOut: this.signOut.bind(this),

        // Authentication state methods
        $onAuthStateChanged: this.onAuthStateChanged.bind(this),
        $getUser: this.getUser.bind(this),
        $requireUser: this.requireUser.bind(this),
        $waitForSignIn: this.waitForSignIn.bind(this),

        // User management methods
        $createUserWithPhoneAndPassword: this.createUserWithPhoneAndPassword.bind(this),
        $createUserWithEmailAndPassword: this.createUserWithEmailAndPassword.bind(this),
        $sendPasswordResetEmail: this.sendPasswordResetEmail.bind(this),
        $sendPasswordResetPhone: this.sendPasswordResetPhone.bind(this),
        $updateProfile: this.updateProfile.bind(this),
        $updatePassword: this.updatePassword.bind(this),
        $updateEmail: this.updateEmail.bind(this),
        $updatePhone: this.updatePhone.bind(this),
        $deleteUser: this.deleteUser.bind(this),
        //************************

        // // Authentication methods
        // $authWithCustomToken: this.authWithCustomToken.bind(this),
        // $authAnonymously: this.authAnonymously.bind(this),
        // $authWithPassword: this.authWithPassword.bind(this),
        // $authWithOAuthPopup: this.authWithOAuthPopup.bind(this),
        // $authWithOAuthRedirect: this.authWithOAuthRedirect.bind(this),
        // $authWithOAuthToken: this.authWithOAuthToken.bind(this),
        // $unauth: this.unauth.bind(this),
        //
        // // Authentication state methods
        // $onAuth: this.onAuth.bind(this),
        // $getUser: this.getUser.bind(this),
        // $requireAuth: this.requireAuth.bind(this),
        // $waitForAuth: this.waitForAuth.bind(this),
        //
        // // User management methods
        // $createUser: this.createUser.bind(this),
        // $updatePassword: this.updatePassword.bind(this),
        // $updateEmail: this.updateEmail.bind(this),
        // $deleteUser: this.deleteUser.bind(this),
        // $resetPassword: this.resetPassword.bind(this)
      };

      return this._object;
    },

    /********************/
    /*  Authentication  */
    /********************/

    /**
     * Authenticates the Firebase reference with a custom authentication token.
     *
     * @param {string} authToken An authentication token or a Firebase Secret. A Firebase Secret
     * should only be used for authenticating a server process and provides full read / write
     * access to the entire Firebase.
     * @return {Promise<Object>} A promise fulfilled with an object containing authentication data.
     */
    signInWithCustomToken: function(authToken) {
      return this._q.when(this._auth.signInWithCustomToken(authToken));
    },

    /**
     * Authenticates the Firebase reference anonymously.
     *
     * @return {Promise<Object>} A promise fulfilled with an object containing authentication data.
     */
    signInAnonymously: function() {
      return this._q.when(this._auth.signInAnonymously());
    },

    /**
     * Authenticates the Firebase reference with an email/password user.
     *
     * @param {String} email An email address for the new user.
     * @param {String} password A password for the new email.
     * @return {Promise<Object>} A promise fulfilled with an object containing authentication data.
     */
    signInWithEmailAndPassword: function(email, password) {
      return this._q.when(this._auth.signInWithEmailAndPassword(email, password));
    },

    /**
     * Authenticates the Firebase reference with an phone/password user.
     *
     * @param {String} phone An phone address for the new user.
     * @param {String} password A password for the new phone.
     * @return {Promise<Object>} A promise fulfilled with an object containing authentication data.
     */
    signInWithPhoneAndPassword: function(phone, password) {
      return this._q.when(this._auth.signInWithPhoneAndPassword(phone, password));
    },
    /**
     * Authenticates the Firebase reference with the OAuth popup flow.
     *
     * @param {object|string} provider A wilddog.auth.AuthProvider or a unique provider ID like 'facebook'.
     * @return {Promise<Object>} A promise fulfilled with an object containing authentication data.
     */
    signInWithPopup: function(provider) {
      return this._q.when(this._auth.signInWithPopup(provider));
    },

    /**
     * Authenticates the Firebase reference with the OAuth redirect flow.
     *
     * @param {object|string} provider A wilddog.auth.AuthProvider or a unique provider ID like 'facebook'.
     * @return {Promise<Object>} A promise fulfilled with an object containing authentication data.
     */
    signInWithRedirect: function(provider) {
      return this._q.when(this._auth.signInWithRedirect(provider));
    },

    /**
     * Authenticates the Firebase reference with an OAuth token.
     *
     * @param {wilddog.auth.AuthCredential} credential The Firebase credential.
     * @return {Promise<Object>} A promise fulfilled with an object containing authentication data.
     */
    signInWithCredential: function(credential) {
      return this._q.when(this._auth.signInWithCredential(credential));
    },

    /**
     * Unauthenticates the Firebase reference.
     */
    signOut: function() {
      if (this.getUser() !== null) {
        return this._q.when(this._auth.signOut());
      } else {
        return this._q.when();
      }
    },

    /**************************/
    /*  Authentication State  */
    /**************************/
    /**
     * Asynchronously fires the provided callback with the current authentication data every time
     * the authentication data changes. It also fires as soon as the authentication data is
     * retrieved from the server.
     *
     * @param {function} callback A callback that fires when the client's authenticate state
     * changes. If authenticated, the callback will be passed an object containing authentication
     * data according to the provider used to authenticate. Otherwise, it will be passed null.
     * @param {string} [context] If provided, this object will be used as this when calling your
     * callback.
     * @return {Promise<Function>} A promised fulfilled with a function which can be used to
     * deregister the provided callback.
     */
    onAuthStateChanged: function(callback, context) {
      var fn = this._utils.debounce(callback, context, 0);
      var off = this._auth.onAuthStateChanged(fn);

      // Return a method to detach the `onAuthStateChanged()` callback.
      return off;
    },

    /**
     * Synchronously retrieves the current authentication data.
     *
     * @return {Object} The client's authentication data.
     */
    getUser: function() {
      return this._auth.currentUser;
    },

    /**
     * Helper onAuthStateChanged() callback method for the two router-related methods.
     *
     * @param {boolean} rejectIfAuthDataIsNull Determines if the returned promise should be
     * resolved or rejected upon an unauthenticated client.
     * @param {boolean} rejectIfEmailNotVerified Determines if the returned promise should be
     * resolved or rejected upon a client without a verified email address.
     * @return {Promise<Object>} A promise fulfilled with the client's authentication state or
     * rejected if the client is unauthenticated and rejectIfAuthDataIsNull is true.
     */
    _routerMethodOnAuthPromise: function(rejectIfAuthDataIsNull, rejectIfEmailNotVerified) {
      var self = this;

      // wait for the initial auth state to resolve; on page load we have to request auth state
      // asynchronously so we don't want to resolve router methods or flash the wrong state
      return this._initialAuthResolver.then(function() {
        // auth state may change in the future so rather than depend on the initially resolved state
        // we also check the auth data (synchronously) if a new promise is requested, ensuring we resolve
        // to the current auth state and not a stale/initial state
        var authData = self.getUser(),
          res = null;
        if (rejectIfAuthDataIsNull && authData === null) {
          res = self._q.reject("AUTH_REQUIRED");
        } else if (rejectIfEmailNotVerified && !authData.emailVerified) {
          res = self._q.reject("EMAIL_VERIFICATION_REQUIRED");
        } else {
          res = self._q.when(authData);
        }
        return res;
      });
    },

    /**
     * Helper that returns a promise which resolves when the initial auth state has been
     * fetched from the Firebase server. This never rejects and resolves to undefined.
     *
     * @return {Promise<Object>} A promise fulfilled when the server returns initial auth state.
     */
    _initAuthResolver: function() {
      var auth = this._auth;

      return this._q(function(resolve) {
        var off;

        function callback() {
          // Turn off this onAuthStateChanged() callback since we just needed to get the authentication data once.
          setTimeout(function () {
            off();
            resolve();
          }, 0);
        }
        off = auth.onAuthStateChanged(callback);
      });
    },

    /**
     * Utility method which can be used in a route's resolve() method to require that a route has
     * a logged in client.
     *
     * @param {boolean} requireEmailVerification Determines if the route requires a client with a
     * verified email address.
     * @returns {Promise<Object>} A promise fulfilled with the client's current authentication
     * state or rejected if the client is not authenticated.
     */
    requireUser: function(requireEmailVerification) {
      return this._routerMethodOnAuthPromise(true, requireEmailVerification);
    },

    /**
     * Utility method which can be used in a route's resolve() method to grab the current
     * authentication data.
     *
     * @returns {Promise<Object|null>} A promise fulfilled with the client's current authentication
     * state, which will be null if the client is not authenticated.
     */
    waitForSignIn: function() {
      return this._routerMethodOnAuthPromise(false, false);
    },

    /*********************/
    /*  User Management  */
    /*********************/
    /**
     * Creates a new phone/password user. Note that this function only creates the user, if you
     * wish to log in as the newly created user, call $authWithPassword() after the promise for
     * this method has been resolved.
     *
     * @param {string} phone An phone number for this user.
     * @param {string} password A password for this user.
     * @return {Promise<Object>} A promise fulfilled with the user object, which contains the
     * uid of the created user.
     */
    createUserWithPhoneAndPassword: function(phone, password) {
      return this._q.when(this._auth.createUserWithPhoneAndPassword(phone, password));
    },

    /*********************/
    /*  User Management  */
    /*********************/
    /**
     * Creates a new email/password user. Note that this function only creates the user, if you
     * wish to log in as the newly created user, call $authWithPassword() after the promise for
     * this method has been resolved.
     *
     * @param {string} email An email for this user.
     * @param {string} password A password for this user.
     * @return {Promise<Object>} A promise fulfilled with the user object, which contains the
     * uid of the created user.
     */
    createUserWithEmailAndPassword: function(email, password) {
      return this._q.when(this._auth.createUserWithEmailAndPassword(email, password));
    },

    /**
     * Changes the profile for an user.
     *
     * @param {string} profile A new profile for the current user.
     * @return {Promise<>} An empty promise fulfilled once the profile change is complete.
     */
    updateProfile: function(profile) {
      var user = this.getUser();
      if (user) {
        return this._q.when(user.updateProfile(profile));
      } else {
        return this._q.reject("Cannot update profile since there is no logged in user.");
      }
    },

    /**
     * Changes the password for an email/password user.
     *
     * @param {string} password A new password for the current user.
     * @return {Promise<>} An empty promise fulfilled once the password change is complete.
     */
    updatePassword: function(password) {
      var user = this.getUser();
      if (user) {
        return this._q.when(user.updatePassword(password));
      } else {
        return this._q.reject("Cannot update password since there is no logged in user.");
      }
    },

    /**
     * Changes the phone for an phone/password user.
     *
     * @param {String} phone The new phone for the currently logged in user.
     * @return {Promise<>} An empty promise fulfilled once the phone change is complete.
     */
    updatePhone: function(phone) {
      var user = this.getUser();
      if (user) {
        return this._q.when(user.updatePhone(phone));
      } else {
        return this._q.reject("Cannot update phone since there is no logged in user.");
      }
    },

    /**
     * Changes the email for an email/password user.
     *
     * @param {String} email The new email for the currently logged in user.
     * @return {Promise<>} An empty promise fulfilled once the email change is complete.
     */
    updateEmail: function(email) {
      var user = this.getUser();
      if (user) {
        return this._q.when(user.updateEmail(email));
      } else {
        return this._q.reject("Cannot update email since there is no logged in user.");
      }
    },

    /**
     * Deletes the currently logged in user.
     *
     * @return {Promise<>} An empty promise fulfilled once the user is removed.
     */
    deleteUser: function() {
      var user = this.getUser();
      if (user) {
        return this._q.when(user.delete());
      } else {
        return this._q.reject("Cannot delete user since there is no logged in user.");
      }
    },

    /**
     * Sends a password reset phone to an phone/password user.
     *
     * @param {string} phone An phone address to send a password reset to.
     * @return {Promise<>} An empty promise fulfilled once the reset password phone is sent.
     */
    sendPasswordResetPhone: function(phone) {
      return this._q.when(this._auth.sendPasswordResetSms(phone));
    },

    /**
     * Sends a password reset email to an email/password user.
     *
     * @param {string} email An email address to send a password reset to.
     * @return {Promise<>} An empty promise fulfilled once the reset password email is sent.
     */
    sendPasswordResetEmail: function(email) {
      return this._q.when(this._auth.sendPasswordResetEmail(email));
    }
  };
})();
