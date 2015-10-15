'use strict';
describe('$wilddog', function () {

  beforeEach(function () {
    module('wilddog');
  });

  describe('<constructor>', function () {
    var $wilddog;
    beforeEach(function() {
      inject(function (_$wilddog_) {
        $wilddog = _$wilddog_;
      });
    });
    it('throws an error', function() {
      expect(function() {
        $wilddog(new Wilddog('Mock://'));
      }).toThrow();
    });
  });
});
