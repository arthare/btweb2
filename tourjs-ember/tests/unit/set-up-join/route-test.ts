import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | set-up-join', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:set-up-join');
    assert.ok(route);
  });
});
