import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | pacing-challenge/race', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:pacing-challenge/race');
    assert.ok(route);
  });
});
