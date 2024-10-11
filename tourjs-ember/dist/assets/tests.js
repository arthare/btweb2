'use strict';

define("bt-web2/tests/integration/helpers/add-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Helper | add', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it renders', async function (assert) {
      this.set('inputValue', '1234');
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        {{add inputValue}}
      */
      {
        id: "ZZBHEb3x",
        block: "{\"symbols\":[],\"statements\":[[1,[28,\"add\",[[24,[\"inputValue\"]]],null],false]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), '1234');
    });
  });
});
define("bt-web2/tests/integration/helpers/divide-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Helper | divide', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it renders', async function (assert) {
      this.set('inputValue', '1234');
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        {{divide inputValue}}
      */
      {
        id: "zn2JW/0O",
        block: "{\"symbols\":[],\"statements\":[[1,[28,\"divide\",[[24,[\"inputValue\"]]],null],false]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), '1234');
    });
  });
});
define("bt-web2/tests/integration/helpers/time-display-test", ["qunit", "ember-qunit", "@ember/test-helpers"], function (_qunit, _emberQunit, _testHelpers) {
  "use strict";

  (0, _qunit.module)('Integration | Helper | time-display', function (hooks) {
    (0, _emberQunit.setupRenderingTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it renders', async function (assert) {
      this.set('inputValue', '1234');
      await (0, _testHelpers.render)(Ember.HTMLBars.template(
      /*
        {{time-display inputValue}}
      */
      {
        id: "uSl9iJMY",
        block: "{\"symbols\":[],\"statements\":[[1,[28,\"time-display\",[[24,[\"inputValue\"]]],null],false]],\"hasEval\":false}",
        meta: {}
      }));
      assert.equal(this.element.textContent.trim(), '1234');
    });
  });
});
define("bt-web2/tests/lint/app.lint-test", [], function () {
  "use strict";

  QUnit.module('ESLint | app');
  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'app.js should pass ESLint\n\n20:7 - Unexpected console statement. (no-console)\n22:5 - Unexpected \'debugger\' statement. (no-debugger)');
  });
  QUnit.test('formats.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'formats.js should pass ESLint\n\n');
  });
  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });
  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'router.js should pass ESLint\n\n7:5 - \'lastRoute\' is assigned a value but never used. (no-unused-vars)\n11:15 - Use `import { inject } from \'@ember/service\';` instead of using Ember.inject.service (ember/new-module-imports)\n11:15 - \'Ember\' is not defined. (no-undef)\n12:12 - Use `import { inject } from \'@ember/service\';` instead of using Ember.inject.service (ember/new-module-imports)\n12:12 - \'Ember\' is not defined. (no-undef)\n17:7 - Unexpected console statement. (no-console)\n25:13 - Unexpected console statement. (no-console)\n26:13 - Unexpected console statement. (no-console)\n31:13 - Unexpected console statement. (no-console)\n32:13 - Unexpected lexical declaration in case block. (no-case-declarations)\n35:15 - Unexpected console statement. (no-console)\n48:28 - Use snake case in dynamic segments of routes (ember/routes-segments-snake-case)');
  });
  QUnit.test('sw.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'sw.js should pass ESLint\n\n1:1 - Unexpected console statement. (no-console)');
  });
});
define("bt-web2/tests/lint/templates.template.lint-test", [], function () {
  "use strict";

  QUnit.module('TemplateLint');
  QUnit.test('bt-web2/ai/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/ai/template.hbs should pass TemplateLint.\n\nbt-web2/ai/template.hbs\n  11:20  error  Attribute colspan should be either quoted or wrapped in mustaches  no-quoteless-attributes\n  16:20  error  Attribute colspan should be either quoted or wrapped in mustaches  no-quoteless-attributes\n  6:76  error  you must use double quotes in templates  quotes\n  11:79  error  you must use double quotes in templates  quotes\n  16:58  error  you must use double quotes in templates  quotes\n  3:2  error  Tables must have a table group (thead, tbody or tfoot).  table-groups\n');
  });
  QUnit.test('bt-web2/application/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/application/template.hbs should pass TemplateLint.\n\nbt-web2/application/template.hbs\n  4:41  error  Interaction added to non-interactive element  no-invalid-interactive\n  4:50  error  you must use double quotes in templates  quotes\n  5:67  error  you must use double quotes in templates  quotes\n  12:70  error  you must use double quotes in templates  quotes\n  15:70  error  you must use double quotes in templates  quotes\n  19:70  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('bt-web2/components/create-race-widget/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/create-race-widget/template.hbs should pass TemplateLint.\n\nbt-web2/components/create-race-widget/template.hbs\n  9:56  error  you must use double quotes in templates  quotes\n  16:64  error  you must use double quotes in templates  quotes\n  17:64  error  you must use double quotes in templates  quotes\n  18:64  error  you must use double quotes in templates  quotes\n  19:64  error  you must use double quotes in templates  quotes\n  34:52  error  you must use double quotes in templates  quotes\n  11:6  error  Self-closing a void element is redundant  self-closing-void-elements\n');
  });
  QUnit.test('bt-web2/components/display-post-race-spending/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/display-post-race-spending/template.hbs should pass TemplateLint.\n\nbt-web2/components/display-post-race-spending/template.hbs\n  3:0  error  Tables must have a table group (thead, tbody or tfoot).  table-groups\n');
  });
  QUnit.test('bt-web2/components/display-post-race/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/display-post-race/template.hbs should pass TemplateLint.\n\nbt-web2/components/display-post-race/template.hbs\n  96:4  error  Incorrect indentation for `<br>` beginning at L96:C4. Expected `<br>` to be at an indentation of 2 but was found at 4.  block-indentation\n  6:2  error  Tables must have a table group (thead, tbody or tfoot).  table-groups\n  25:2  error  Tables must have a table group (thead, tbody or tfoot).  table-groups\n  44:2  error  Tables must have a table group (thead, tbody or tfoot).  table-groups\n');
  });
  QUnit.test('bt-web2/components/display-pre-race-rider/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/display-pre-race-rider/template.hbs should pass TemplateLint.\n\nbt-web2/components/display-pre-race-rider/template.hbs\n  5:25  error  Self-closing a void element is redundant  self-closing-void-elements\n  6:51  error  Self-closing a void element is redundant  self-closing-void-elements\n  7:32  error  Self-closing a void element is redundant  self-closing-void-elements\n');
  });
  QUnit.test('bt-web2/components/display-pre-race/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/display-pre-race/template.hbs should pass TemplateLint.\n\nbt-web2/components/display-pre-race/template.hbs\n  4:9  error  Incorrect indentation for `Starts In: ` beginning at L4:C9. Expected `Starts In: ` to be at an indentation of 4 but was found at 9.  block-indentation\n');
  });
  QUnit.test('bt-web2/components/display-race/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/display-race/template.hbs should pass TemplateLint.\n\nbt-web2/components/display-race/template.hbs\n  22:84  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('bt-web2/components/joinable-ride/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'bt-web2/components/joinable-ride/template.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('bt-web2/components/leader-board/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/leader-board/template.hbs should pass TemplateLint.\n\nbt-web2/components/leader-board/template.hbs\n  1:37  error  \'index\' is defined but never used  no-unused-block-params\n');
  });
  QUnit.test('bt-web2/components/main-map/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'bt-web2/components/main-map/template.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('bt-web2/components/mini-map-live/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'bt-web2/components/mini-map-live/template.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('bt-web2/components/mini-map/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/mini-map/template.hbs should pass TemplateLint.\n\nbt-web2/components/mini-map/template.hbs\n  1:0  error  img tags must have an alt attribute  img-alt-attributes\n');
  });
  QUnit.test('bt-web2/components/pacing-challenge-overlay/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'bt-web2/components/pacing-challenge-overlay/template.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('bt-web2/components/pending-race/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/pending-race/template.hbs should pass TemplateLint.\n\nbt-web2/components/pending-race/template.hbs\n  47:42  error  Unnecessary string concatenation. Use {{race.url}} instead of "{{race.url}}".  no-unnecessary-concat\n');
  });
  QUnit.test('bt-web2/components/stored-data/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/stored-data/template.hbs should pass TemplateLint.\n\nbt-web2/components/stored-data/template.hbs\n  8:4  error  Incorrect indentation for `{{log}}` beginning at L8:C4. Expected `{{log}}` to be at an indentation of 6 but was found at 4.  block-indentation\n  9:4  error  Incorrect indentation for `{{#each}}` beginning at L9:C4. Expected `{{#each}}` to be at an indentation of 6 but was found at 4.  block-indentation\n  8:4  error  Unexpected {{log}} usage.  no-log\n  11:42  error  you must use double quotes in templates  quotes\n  11:55  error  you must use double quotes in templates  quotes\n  31:42  error  you must use double quotes in templates  quotes\n  31:55  error  you must use double quotes in templates  quotes\n  34:74  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('bt-web2/components/tourjs-header/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/tourjs-header/template.hbs should pass TemplateLint.\n\nbt-web2/components/tourjs-header/template.hbs\n  1:11  error  you must use double quotes in templates  quotes\n  6:63  error  you must use double quotes in templates  quotes\n  12:63  error  you must use double quotes in templates  quotes\n  19:62  error  you must use double quotes in templates  quotes\n  19:75  error  you must use double quotes in templates  quotes\n  24:23  error  you must use double quotes in templates  quotes\n  29:17  error  you must use double quotes in templates  quotes\n  36:62  error  you must use double quotes in templates  quotes\n  36:75  error  you must use double quotes in templates  quotes\n  41:23  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('bt-web2/components/user-dashboard/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'bt-web2/components/user-dashboard/template.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('bt-web2/components/user-set-up-widget/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/components/user-set-up-widget/template.hbs should pass TemplateLint.\n\nbt-web2/components/user-set-up-widget/template.hbs\n  17:57  error  Incorrect indentation for `Your Picture (click to add)\n      ` beginning at L17:C57. Expected `Your Picture (click to add)\n      ` to be at an indentation of 6 but was found at 57.  block-indentation\n  19:8  error  img tags must have an alt attribute  img-alt-attributes\n  20:88  error  elements cannot have inline styles  no-inline-styles\n  7:4  error  Unexpected {{log}} usage.  no-log\n  9:23  error  you must use double quotes in templates  quotes\n  29:49  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('bt-web2/components/vertical-align/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'bt-web2/components/vertical-align/template.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('bt-web2/hrm-control/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/hrm-control/template.hbs should pass TemplateLint.\n\nbt-web2/hrm-control/template.hbs\n  5:51  error  you must use double quotes in templates  quotes\n  6:51  error  you must use double quotes in templates  quotes\n  23:51  error  you must use double quotes in templates  quotes\n  24:51  error  you must use double quotes in templates  quotes\n  25:51  error  you must use double quotes in templates  quotes\n  26:51  error  you must use double quotes in templates  quotes\n  29:51  error  you must use double quotes in templates  quotes\n  31:51  error  you must use double quotes in templates  quotes\n  34:51  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('bt-web2/index/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/index/template.hbs should pass TemplateLint.\n\nbt-web2/index/template.hbs\n  3:36  error  Interaction added to non-interactive element  no-invalid-interactive\n  8:36  error  Interaction added to non-interactive element  no-invalid-interactive\n  13:43  error  Interaction added to non-interactive element  no-invalid-interactive\n  18:48  error  Interaction added to non-interactive element  no-invalid-interactive\n  3:45  error  you must use double quotes in templates  quotes\n  3:52  error  you must use double quotes in templates  quotes\n  8:45  error  you must use double quotes in templates  quotes\n  8:52  error  you must use double quotes in templates  quotes\n  13:52  error  you must use double quotes in templates  quotes\n  13:59  error  you must use double quotes in templates  quotes\n  18:57  error  you must use double quotes in templates  quotes\n  18:64  error  you must use double quotes in templates  quotes\n  24:13  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('bt-web2/kickr-setup/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/kickr-setup/template.hbs should pass TemplateLint.\n\nbt-web2/kickr-setup/template.hbs\n  17:0  error  Incorrect indentation for `<br>` beginning at L17:C0. Expected `<br>` to be at an indentation of 2 but was found at 0.  block-indentation\n  20:47  error  you must use double quotes in templates  quotes\n  21:47  error  you must use double quotes in templates  quotes\n  25:47  error  you must use double quotes in templates  quotes\n  26:47  error  you must use double quotes in templates  quotes\n  28:47  error  you must use double quotes in templates  quotes\n  33:47  error  you must use double quotes in templates  quotes\n  34:47  error  you must use double quotes in templates  quotes\n  35:47  error  you must use double quotes in templates  quotes\n  36:47  error  you must use double quotes in templates  quotes\n  37:47  error  you must use double quotes in templates  quotes\n  38:47  error  you must use double quotes in templates  quotes\n  39:47  error  you must use double quotes in templates  quotes\n  41:47  error  you must use double quotes in templates  quotes\n  42:47  error  you must use double quotes in templates  quotes\n  43:47  error  you must use double quotes in templates  quotes\n  44:47  error  you must use double quotes in templates  quotes\n  45:47  error  you must use double quotes in templates  quotes\n  46:47  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('bt-web2/no-bluetooth/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/no-bluetooth/template.hbs should pass TemplateLint.\n\nbt-web2/no-bluetooth/template.hbs\n  6:106  error  you must use double quotes in templates  quotes\n  12:82  error  you must use double quotes in templates  quotes\n  7:2  error  Self-closing a void element is redundant  self-closing-void-elements\n  14:2  error  Self-closing a void element is redundant  self-closing-void-elements\n');
  });
  QUnit.test('bt-web2/pacing-challenge-race/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'bt-web2/pacing-challenge-race/template.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('bt-web2/pacing-challenge/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/pacing-challenge/template.hbs should pass TemplateLint.\n\nbt-web2/pacing-challenge/template.hbs\n  24:35  error  Interaction added to non-interactive element  no-invalid-interactive\n  34:35  error  Interaction added to non-interactive element  no-invalid-interactive\n  42:34  error  Interaction added to non-interactive element  no-invalid-interactive\n  50:34  error  Interaction added to non-interactive element  no-invalid-interactive\n  58:34  error  Interaction added to non-interactive element  no-invalid-interactive\n  28:49  error  \'index\' is defined but never used  no-unused-block-params\n  37:49  error  \'index\' is defined but never used  no-unused-block-params\n  45:48  error  \'index\' is defined but never used  no-unused-block-params\n  53:48  error  \'index\' is defined but never used  no-unused-block-params\n  61:48  error  \'index\' is defined but never used  no-unused-block-params\n  15:71  error  you must use double quotes in templates  quotes\n  15:81  error  you must use double quotes in templates  quotes\n  16:71  error  you must use double quotes in templates  quotes\n  16:81  error  you must use double quotes in templates  quotes\n  17:69  error  you must use double quotes in templates  quotes\n  17:79  error  you must use double quotes in templates  quotes\n  18:69  error  you must use double quotes in templates  quotes\n  18:79  error  you must use double quotes in templates  quotes\n  24:44  error  you must use double quotes in templates  quotes\n  34:44  error  you must use double quotes in templates  quotes\n  42:43  error  you must use double quotes in templates  quotes\n  50:43  error  you must use double quotes in templates  quotes\n  58:43  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('bt-web2/race-results/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'bt-web2/race-results/template.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('bt-web2/results/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'bt-web2/results/template.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('bt-web2/ride/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/ride/template.hbs should pass TemplateLint.\n\nbt-web2/ride/template.hbs\n  13:40  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('bt-web2/set-up-ride/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/set-up-ride/template.hbs should pass TemplateLint.\n\nbt-web2/set-up-ride/template.hbs\n  5:68  error  you must use double quotes in templates  quotes\n  9:49  error  you must use double quotes in templates  quotes\n  13:35  error  you must use double quotes in templates  quotes\n  13:48  error  you must use double quotes in templates  quotes\n  17:58  error  you must use double quotes in templates  quotes\n  8:4  error  Using an {{else}} block with {{unless}} should be avoided.  simple-unless\n');
  });
  QUnit.test('bt-web2/set-up-user/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(false, 'bt-web2/set-up-user/template.hbs should pass TemplateLint.\n\nbt-web2/set-up-user/template.hbs\n  2:36  error  you must use double quotes in templates  quotes\n');
  });
  QUnit.test('bt-web2/strava-auth/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'bt-web2/strava-auth/template.hbs should pass TemplateLint.\n\n');
  });
  QUnit.test('bt-web2/test-hacks/template.hbs', function (assert) {
    assert.expect(1);
    assert.ok(true, 'bt-web2/test-hacks/template.hbs should pass TemplateLint.\n\n');
  });
});
define("bt-web2/tests/lint/tests.lint-test", [], function () {
  "use strict";

  QUnit.module('ESLint | tests');
  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });
});
define("bt-web2/tests/test-helper", ["bt-web2/app", "bt-web2/config/environment", "@ember/test-helpers", "ember-qunit"], function (_app, _environment, _testHelpers, _emberQunit) {
  "use strict";

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));
  (0, _emberQunit.start)();
});
define("bt-web2/tests/unit/ai/controller-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | ai', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:ai');
      assert.ok(controller);
    });
  });
});
define("bt-web2/tests/unit/ai/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | ai', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:ai');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/auth/service-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Service | auth', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let service = this.owner.lookup('service:auth');
      assert.ok(service);
    });
  });
});
define("bt-web2/tests/unit/hrm-control/controller-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | hrm-control', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:hrm-control');
      assert.ok(controller);
    });
  });
});
define("bt-web2/tests/unit/hrm-control/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | hrm-control', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:hrm-control');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/index/controller-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | index', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:index');
      assert.ok(controller);
    });
  });
});
define("bt-web2/tests/unit/index/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | index', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:index');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/kickr-setup/controller-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | kickr-setup', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:kickr-setup');
      assert.ok(controller);
    });
  });
});
define("bt-web2/tests/unit/kickr-setup/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | kickr-setup', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:kickr-setup');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/no-bluetooth/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | no-bluetooth', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:no-bluetooth');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/pacing-challenge-race/controller-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | pacing-challenge-race', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:pacing-challenge-race');
      assert.ok(controller);
    });
  });
});
define("bt-web2/tests/unit/pacing-challenge-race/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | pacing-challenge-race', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:pacing-challenge-race');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/pacing-challenge/controller-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | pacing-challenge', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:pacing-challenge');
      assert.ok(controller);
    });
  });
});
define("bt-web2/tests/unit/pacing-challenge/race/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | pacing-challenge/race', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:pacing-challenge/race');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/pacing-challenge/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | pacing-challenge', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:pacing-challenge');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/race-results/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | race-results', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:race-results');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/results/controller-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | results', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:results');
      assert.ok(controller);
    });
  });
});
define("bt-web2/tests/unit/results/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | results', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:results');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/ride/controller-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | ride', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:ride');
      assert.ok(controller);
    });
  });
});
define("bt-web2/tests/unit/ride/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | ride', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:ride');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/services/auth-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Service | auth', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let service = this.owner.lookup('service:auth');
      assert.ok(service);
    });
  });
});
define("bt-web2/tests/unit/services/connection-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Service | connection', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let service = this.owner.lookup('service:connection');
      assert.ok(service);
    });
  });
});
define("bt-web2/tests/unit/services/devices-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Service | devices', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let service = this.owner.lookup('service:devices');
      assert.ok(service);
    });
  });
});
define("bt-web2/tests/unit/services/platform-manager-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Service | platform-manager', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let service = this.owner.lookup('service:platform-manager');
      assert.ok(service);
    });
  });
});
define("bt-web2/tests/unit/set-up-join/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | set-up-join', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:set-up-join');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/set-up-ride/controller-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | set-up-ride', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:set-up-ride');
      assert.ok(controller);
    });
  });
});
define("bt-web2/tests/unit/set-up-ride/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | set-up-ride', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:set-up-ride');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/strava-auth/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | strava-auth', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:strava-auth');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/test-hacks/controller-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | test-hacks', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:test-hacks');
      assert.ok(controller);
    });
  });
});
define("bt-web2/tests/unit/test-hacks/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | test-hacks', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:test-hacks');
      assert.ok(route);
    });
  });
});
define("bt-web2/tests/unit/user-set-up/controller-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Controller | user-set-up', function (hooks) {
    (0, _emberQunit.setupTest)(hooks); // Replace this with your real tests.

    (0, _qunit.test)('it exists', function (assert) {
      let controller = this.owner.lookup('controller:user-set-up');
      assert.ok(controller);
    });
  });
});
define("bt-web2/tests/unit/user-set-up/route-test", ["qunit", "ember-qunit"], function (_qunit, _emberQunit) {
  "use strict";

  (0, _qunit.module)('Unit | Route | user-set-up', function (hooks) {
    (0, _emberQunit.setupTest)(hooks);
    (0, _qunit.test)('it exists', function (assert) {
      let route = this.owner.lookup('route:user-set-up');
      assert.ok(route);
    });
  });
});
define('bt-web2/config/environment', [], function() {
  var prefix = 'bt-web2';
try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(decodeURIComponent(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

});

require('bt-web2/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
