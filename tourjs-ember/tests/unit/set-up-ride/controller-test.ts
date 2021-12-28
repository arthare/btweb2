import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | set-up-ride', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:set-up-ride');
    assert.ok(controller);
  });
});
