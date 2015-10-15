(function() {
  'use strict';

  angular.module("wilddog")

    /** @deprecated */
    .factory("$wilddog", function() {
      return function() {
        throw new Error('$wilddog has been removed. You may instantiate $wilddogArray and $wilddogObject ' +
        'directly now. For simple write operations, just use the Wilddog ref directly. ' +
        'See the wild-angular 1.0.0 changelog for details: https://www.wilddog.com/docs/web/libraries/angular/changelog.html');
      };
    });

})();
