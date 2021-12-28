import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | user-set-up', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:user-set-up');
    assert.ok(controller);
  });
});
