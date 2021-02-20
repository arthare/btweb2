import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | kickr-setup', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:kickr-setup');
    assert.ok(route);
  });
});
