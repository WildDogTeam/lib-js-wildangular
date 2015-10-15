(function() {
  'use strict';
  /**
   * Creates and maintains a synchronized object, with 2-way bindings between Angular and Wilddog.
   *
   * Implementations of this class are contracted to provide the following internal methods,
   * which are used by the synchronization process and 3-way bindings:
   *    $$updated - called whenever a change occurs (a value event from Wilddog)
   *    $$error - called when listeners are canceled due to a security error
   *    $$notify - called to update $watch listeners and trigger updates to 3-way bindings
   *    $ref - called to obtain the underlying Wilddog reference
   *
   * Instead of directly modifying this class, one should generally use the $extend
   * method to add or change how methods behave:
   *
   * <pre><code>
   * var ExtendedObject = $wilddogObject.$extend({
   *    // add a new method to the prototype
   *    foo: function() { return 'bar'; },
   * });
   *
   * var obj = new ExtendedObject(ref);
   * </code></pre>
   */
  angular.module('wilddog').factory('$wilddogObject', [
    '$parse', '$wilddogUtils', '$log',
    function($parse, $wilddogUtils, $log) {
      /**
       * Creates a synchronized object with 2-way bindings between Angular and Wilddog.
       *
       * @param {Wilddog} ref
       * @returns {WilddogObject}
       * @constructor
       */
      function WilddogObject(ref) {
        if( !(this instanceof WilddogObject) ) {
          return new WilddogObject(ref);
        }
        // These are private config props and functions used internally
        // they are collected here to reduce clutter in console.log and forEach
        this.$$conf = {
          // synchronizes data to Wilddog
          sync: new ObjectSyncManager(this, ref),
          // stores the Wilddog ref
          ref: ref,
          // synchronizes $scope variables with this object
          binding: new ThreeWayBinding(this),
          // stores observers registered with $watch
          listeners: []
        };

        // this bit of magic makes $$conf non-enumerable and non-configurable
        // and non-writable (its properties are still writable but the ref cannot be replaced)
        // we redundantly assign it above so the IDE can relax
        Object.defineProperty(this, '$$conf', {
          value: this.$$conf
        });

        this.$id = $wilddogUtils.getKey(ref.ref());
        this.$priority = null;

        $wilddogUtils.applyDefaults(this, this.$$defaults);

        // start synchronizing data with Wilddog
        this.$$conf.sync.init();
      }

      WilddogObject.prototype = {
        /**
         * Saves all data on the WilddogObject back to Wilddog.
         * @returns a promise which will resolve after the save is completed.
         */
        $save: function () {
          var self = this;
          var ref = self.$ref();
          var data = $wilddogUtils.toJSON(self);
          return $wilddogUtils.doSet(ref, data).then(function() {
            self.$$notify();
            return self.$ref();
          });
        },

        /**
         * Removes all keys from the WilddogObject and also removes
         * the remote data from the server.
         *
         * @returns a promise which will resolve after the op completes
         */
        $remove: function() {
          var self = this;
          $wilddogUtils.trimKeys(self, {});
          self.$value = null;
          return $wilddogUtils.doRemove(self.$ref()).then(function() {
            self.$$notify();
            return self.$ref();
          });
        },

        /**
         * The loaded method is invoked after the initial batch of data arrives from the server.
         * When this resolves, all data which existed prior to calling $asObject() is now cached
         * locally in the object.
         *
         * As a shortcut is also possible to pass resolve/reject methods directly into this
         * method just as they would be passed to .then()
         *
         * @param {Function} resolve
         * @param {Function} reject
         * @returns a promise which resolves after initial data is downloaded from Wilddog
         */
        $loaded: function(resolve, reject) {
          var promise = this.$$conf.sync.ready();
          if (arguments.length) {
            // allow this method to be called just like .then
            // by passing any arguments on to .then
            promise = promise.then.call(promise, resolve, reject);
          }
          return promise;
        },

        /**
         * @returns {Wilddog} the original Wilddog instance used to create this object.
         */
        $ref: function () {
          return this.$$conf.ref;
        },

        /**
         * Creates a 3-way data sync between this object, the Wilddog server, and a
         * scope variable. This means that any changes made to the scope variable are
         * pushed to Wilddog, and vice versa.
         *
         * If scope emits a $destroy event, the binding is automatically severed. Otherwise,
         * it is possible to unbind the scope variable by using the `unbind` function
         * passed into the resolve method.
         *
         * Can only be bound to one scope variable at a time. If a second is attempted,
         * the promise will be rejected with an error.
         *
         * @param {object} scope
         * @param {string} varName
         * @returns a promise which resolves to an unbind method after data is set in scope
         */
        $bindTo: function (scope, varName) {
          var self = this;
          return self.$loaded().then(function () {
            return self.$$conf.binding.bindTo(scope, varName);
          });
        },

        /**
         * Listeners passed into this method are notified whenever a new change is received
         * from the server. Each invocation is sent an object containing
         * <code>{ type: 'value', key: 'my_wilddog_id' }</code>
         *
         * This method returns an unbind function that can be used to detach the listener.
         *
         * @param {Function} cb
         * @param {Object} [context]
         * @returns {Function} invoke to stop observing events
         */
        $watch: function (cb, context) {
          var list = this.$$conf.listeners;
          list.push([cb, context]);
          // an off function for cancelling the listener
          return function () {
            var i = list.findIndex(function (parts) {
              return parts[0] === cb && parts[1] === context;
            });
            if (i > -1) {
              list.splice(i, 1);
            }
          };
        },

        /**
         * Informs $wilddog to stop sending events and clears memory being used
         * by this object (delete's its local content).
         */
        $destroy: function(err) {
          var self = this;
          if (!self.$isDestroyed) {
            self.$isDestroyed = true;
            self.$$conf.sync.destroy(err);
            self.$$conf.binding.destroy();
            $wilddogUtils.each(self, function (v, k) {
              delete self[k];
            });
          }
        },

        /**
         * Called by $wilddog whenever an item is changed at the server.
         * This method must exist on any objectFactory passed into $wilddog.
         *
         * It should return true if any changes were made, otherwise `$$notify` will
         * not be invoked.
         *
         * @param {object} snap a Wilddog snapshot
         * @return {boolean} true if any changes were made.
         */
        $$updated: function (snap) {
          // applies new data to this object
          var changed = $wilddogUtils.updateRec(this, snap);
          // applies any defaults set using $$defaults
          $wilddogUtils.applyDefaults(this, this.$$defaults);
          // returning true here causes $$notify to be triggered
          return changed;
        },

        /**
         * Called whenever a security error or other problem causes the listeners to become
         * invalid. This is generally an unrecoverable error.
         * @param {Object} err which will have a `code` property and possibly a `message`
         */
        $$error: function (err) {
          // prints an error to the console (via Angular's logger)
          $log.error(err);
          // frees memory and cancels any remaining listeners
          this.$destroy(err);
        },

        /**
         * Called internally by $bindTo when data is changed in $scope.
         * Should apply updates to this record but should not call
         * notify().
         */
        $$scopeUpdated: function(newData) {
          // we use a one-directional loop to avoid feedback with 3-way bindings
          // since set() is applied locally anyway, this is still performant
          var def = $wilddogUtils.defer();
          this.$ref().set($wilddogUtils.toJSON(newData), $wilddogUtils.makeNodeResolver(def));
          return def.promise;
        },

        /**
         * Updates any bound scope variables and
         * notifies listeners registered with $watch
         */
        $$notify: function() {
          var self = this, list = this.$$conf.listeners.slice();
          // be sure to do this after setting up data and init state
          angular.forEach(list, function (parts) {
            parts[0].call(parts[1], {event: 'value', key: self.$id});
          });
        },

        /**
         * Overrides how Angular.forEach iterates records on this object so that only
         * fields stored in Wilddog are part of the iteration. To include meta fields like
         * $id and $priority in the iteration, utilize for(key in obj) instead.
         */
        forEach: function(iterator, context) {
          return $wilddogUtils.each(this, iterator, context);
        }
      };

      /**
       * This method allows WilddogObject to be copied into a new factory. Methods passed into this
       * function will be added onto the object's prototype. They can override existing methods as
       * well.
       *
       * In addition to passing additional methods, it is also possible to pass in a class function.
       * The prototype on that class function will be preserved, and it will inherit from
       * WilddogObject. It's also possible to do both, passing a class to inherit and additional
       * methods to add onto the prototype.
       *
       * Once a factory is obtained by this method, it can be passed into $wilddog as the
       * `objectFactory` parameter:
       *
       * <pre><code>
       * var MyFactory = $wilddogObject.$extend({
       *    // add a method onto the prototype that prints a greeting
       *    getGreeting: function() {
       *       return 'Hello ' + this.first_name + ' ' + this.last_name + '!';
       *    }
       * });
       *
       * // use our new factory in place of $wilddogObject
       * var obj = $wilddog(ref, {objectFactory: MyFactory}).$asObject();
       * </code></pre>
       *
       * @param {Function} [ChildClass] a child class which should inherit WilddogObject
       * @param {Object} [methods] a list of functions to add onto the prototype
       * @returns {Function} a new factory suitable for use with $wilddog
       */
      WilddogObject.$extend = function(ChildClass, methods) {
        if( arguments.length === 1 && angular.isObject(ChildClass) ) {
          methods = ChildClass;
          ChildClass = function(ref) {
            if( !(this instanceof ChildClass) ) {
              return new ChildClass(ref);
            }
            WilddogObject.apply(this, arguments);
          };
        }
        return $wilddogUtils.inherit(ChildClass, WilddogObject, methods);
      };

      /**
       * Creates a three-way data binding on a scope variable.
       *
       * @param {WilddogObject} rec
       * @returns {*}
       * @constructor
       */
      function ThreeWayBinding(rec) {
        this.subs = [];
        this.scope = null;
        this.key = null;
        this.rec = rec;
      }

      ThreeWayBinding.prototype = {
        assertNotBound: function(varName) {
          if( this.scope ) {
            var msg = 'Cannot bind to ' + varName + ' because this instance is already bound to ' +
              this.key + '; one binding per instance ' +
              '(call unbind method or create another WilddogObject instance)';
            $log.error(msg);
            return $wilddogUtils.reject(msg);
          }
        },

        bindTo: function(scope, varName) {
          function _bind(self) {
            var sending = false;
            var parsed = $parse(varName);
            var rec = self.rec;
            self.scope = scope;
            self.varName = varName;

            function equals(scopeValue) {
              return angular.equals(scopeValue, rec) &&
                scopeValue.$priority === rec.$priority &&
                scopeValue.$value === rec.$value;
            }

            function setScope(rec) {
              parsed.assign(scope, $wilddogUtils.scopeData(rec));
            }

            var send = $wilddogUtils.debounce(function(val) {
              var scopeData = $wilddogUtils.scopeData(val);
              rec.$$scopeUpdated(scopeData)
                ['finally'](function() {
                  sending = false;
                  if(!scopeData.hasOwnProperty('$value')){
                    delete rec.$value;
                    delete parsed(scope).$value;
                  }
                }
              );
            }, 50, 500);

            var scopeUpdated = function(newVal) {
              newVal = newVal[0];
              if( !equals(newVal) ) {
                sending = true;
                send(newVal);
              }
            };

            var recUpdated = function() {
              if( !sending && !equals(parsed(scope)) ) {
                setScope(rec);
              }
            };

            // $watch will not check any vars prefixed with $, so we
            // manually check $priority and $value using this method
            function watchExp(){
              var obj = parsed(scope);
              return [obj, obj.$priority, obj.$value];
            }

            setScope(rec);
            self.subs.push(scope.$on('$destroy', self.unbind.bind(self)));

            // monitor scope for any changes
            self.subs.push(scope.$watch(watchExp, scopeUpdated, true));

            // monitor the object for changes
            self.subs.push(rec.$watch(recUpdated));

            return self.unbind.bind(self);
          }

          return this.assertNotBound(varName) || _bind(this);
        },

        unbind: function() {
          if( this.scope ) {
            angular.forEach(this.subs, function(unbind) {
              unbind();
            });
            this.subs = [];
            this.scope = null;
            this.key = null;
          }
        },

        destroy: function() {
          this.unbind();
          this.rec = null;
        }
      };

      function ObjectSyncManager(wilddogObject, ref) {
        function destroy(err) {
          if( !sync.isDestroyed ) {
            sync.isDestroyed = true;
            ref.off('value', applyUpdate);
            wilddogObject = null;
            initComplete(err||'destroyed');
          }
        }

        function init() {
          ref.on('value', applyUpdate, error);
          ref.once('value', function(snap) {
            if (angular.isArray(snap.val())) {
              $log.warn('Storing data using array indices in Wilddog can result in unexpected behavior. See https://www.wilddog.com/docs/web/guide/understanding-data.html#section-arrays-in-wilddog for more information. Also note that you probably wanted $wilddogArray and not $wilddogObject.');
            }

            initComplete(null);
          }, initComplete);
        }

        // call initComplete(); do not call this directly
        function _initComplete(err) {
          if( !isResolved ) {
            isResolved = true;
            if( err ) { def.reject(err); }
            else { def.resolve(wilddogObject); }
          }
        }

        var isResolved = false;
        var def = $wilddogUtils.defer();
        var applyUpdate = $wilddogUtils.batch(function(snap) {
          var changed = wilddogObject.$$updated(snap);
          if( changed ) {
            // notifies $watch listeners and
            // updates $scope if bound to a variable
            wilddogObject.$$notify();
          }
        });
        var error = $wilddogUtils.batch(function(err) {
          _initComplete(err);
          if( wilddogObject ) {
            wilddogObject.$$error(err);
          }
        });
        var initComplete = $wilddogUtils.batch(_initComplete);

        var sync = {
          isDestroyed: false,
          destroy: destroy,
          init: init,
          ready: function() { return def.promise; }
        };
        return sync;
      }

      return WilddogObject;
    }
  ]);

  /** @deprecated */
  angular.module('wilddog').factory('$WilddogObject', ['$log', '$wilddogObject',
    function($log, $wilddogObject) {
      return function() {
        $log.warn('$WilddogObject has been renamed. Use $wilddogObject instead.');
        return $wilddogObject.apply(null, arguments);
      };
    }
  ]);
})();
