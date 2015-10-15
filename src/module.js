(function(exports) {
  "use strict";

// Define the `wilddog` module under which all wild-angular
// services will live.
  angular.module("wilddog", [])
    //todo use $window
    .value("Wilddog", exports.Wilddog);

})(window);
