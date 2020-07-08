import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | hrm-control', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:hrm-control');
    assert.ok(route);
  });
});
