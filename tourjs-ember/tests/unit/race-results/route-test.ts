import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | race-results', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:race-results');
    assert.ok(route);
  });
});
