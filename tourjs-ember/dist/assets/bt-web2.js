'use strict';



;define("bt-web2/adapters/wordpress/attachment", ["exports", "ember-wordpress/adapters/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/adapters/wordpress/category", ["exports", "ember-wordpress/adapters/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/adapters/wordpress/comment", ["exports", "ember-wordpress/adapters/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/adapters/wordpress/page", ["exports", "ember-wordpress/adapters/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/adapters/wordpress/post", ["exports", "ember-wordpress/adapters/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/adapters/wordpress/tag", ["exports", "ember-wordpress/adapters/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/adapters/wordpress/user", ["exports", "ember-wordpress/adapters/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/ai/controller", ["exports", "bt-web2/tourjs-shared/ServerAISnapshots"], function (_exports, _ServerAISnapshots) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  const handleFiles = files => {
    console.log("handling files ", files);
    return new Promise((resolve, reject) => {
      const fr = new FileReader();

      fr.onload = async theFile => {
        var _theFile$target;

        const res = (_theFile$target = theFile.target) === null || _theFile$target === void 0 ? void 0 : _theFile$target.result;
        const str = new TextDecoder().decode(res); // ok, str will be a bunch of valid JSONs, divided by "$$" to split them up

        const chunks = str.split('$$').filter(res => !!res.trim());
        const datas = chunks.map(c => JSON.parse(c));
        resolve(datas);
      };

      fr.readAsArrayBuffer(files[0]);
    });
  };

  class Ai extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    datas: null,
    running: false,
    actions: {
      async onFileChange(evt) {
        console.log("file drop ", evt);
        const files = evt.target.files;
        console.log("files = ", files);
        const datas = await handleFiles(files);
        this.set('datas', datas);
      },

      cancel() {
        this.set('running', false);
      },

      async train() {
        const tfvis = window.tfvis;
        tfvis.visor();
        const metrics = ['mse'];
        const container = {
          name: 'show.fitCallbacks',
          tab: 'Training',
          styles: {
            height: '1000px'
          }
        }; //const callbacks = tfvis.show.fitCallbacks(container, metrics);

        const callbacks = undefined;
        const tf = window.tf;
        const datas = this.get('datas');

        const writeResult = (fileName, contents) => {
          var data = new Blob([contents], {
            type: 'text/plain'
          });
          var url = window.URL.createObjectURL(data);
          const linky = document.createElement('a');
          linky.href = url;
          linky.download = fileName;
          linky.target = "_blank";
          document.body.appendChild(linky);
          linky.click();
          document.body.removeChild(linky);
        };

        this.set('running', true);
        await (0, _ServerAISnapshots.doNNTrainWithSnapshots)(tf, 'art', datas, writeResult, callbacks, () => !this.get('running'));
        debugger;
      }

    }
  }) {
    // normal class body definition here
    startup() {}

  } // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.


  _exports.default = Ai;
});
;define("bt-web2/ai/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  async function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    return new Promise(resolve => {
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  class Ai extends Ember.Route.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    async beforeModel() {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js');
      await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-vis");
    }

    model() {}

    setupController(controller, params) {
      controller.startup();
    }

  }

  _exports.default = Ai;
});
;define("bt-web2/ai/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "1X8kXlqd",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"ai__container\"],[8],[0,\"\\n  \"],[7,\"h3\",true],[8],[0,\"TourJS AI Training\"],[9],[0,\"\\n  \"],[7,\"table\",true],[8],[0,\"\\n    \"],[7,\"tr\",true],[8],[0,\"\\n      \"],[7,\"td\",true],[8],[0,\"Upload File\"],[9],[0,\"\\n      \"],[7,\"td\",true],[8],[7,\"input\",true],[10,\"class\",\"ai__file\"],[10,\"id\",\"upload\"],[11,\"onchange\",[28,\"action\",[[23,0,[]],\"onFileChange\"],null]],[10,\"type\",\"file\"],[8],[9],[9],[0,\"\\n    \"],[9],[0,\"\\n\\n\"],[4,\"if\",[[24,[\"datas\"]]],null,{\"statements\":[[0,\"      \"],[7,\"tr\",true],[8],[0,\"\\n        \"],[7,\"td\",true],[10,\"colspan\",\"2\"],[8],[7,\"button\",false],[12,\"disabled\",[22,\"running\"]],[12,\"class\",\"ai__button\"],[3,\"action\",[[23,0,[]],\"train\"]],[8],[0,\"Train\"],[9],[9],[0,\"\\n      \"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[24,[\"running\"]]],null,{\"statements\":[[0,\"      \"],[7,\"tr\",true],[8],[0,\"\\n        \"],[7,\"td\",true],[10,\"colspan\",\"2\"],[8],[7,\"button\",false],[12,\"class\",\"ai__button\"],[3,\"action\",[[23,0,[]],\"cancel\"]],[8],[0,\"Stop Running\"],[9],[9],[0,\"\\n      \"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/ai/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/app", ["exports", "bt-web2/resolver", "ember-load-initializers", "bt-web2/config/environment"], function (_exports, _resolver, _emberLoadInitializers, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const App = Ember.Application.extend({
    modulePrefix: _environment.default.modulePrefix,
    podModulePrefix: _environment.default.podModulePrefix,
    Resolver: _resolver.default
  });

  if (_environment.default.environment === 'production') {//console.log = () => {};
  }

  window.assert2 = (f, reason) => {
    if (!f) {
      if (reason) {
        console.log("Assertions failed: Reason = ", reason);
      }

      debugger;
    }
  };

  (0, _emberLoadInitializers.default)(App, _environment.default.modulePrefix);
  var _default = App;
  _exports.default = _default;
});
;define("bt-web2/application/controller", ["exports", "bt-web2/services/devices", "bt-web2/pojs/DeviceFactory", "bt-web2/pojs/WebBluetoothDevice"], function (_exports, _devices, _DeviceFactory, _WebBluetoothDevice) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = _exports.FakeDevice = void 0;

  var _dec, _dec2, _class, _temp;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class FakeDevice extends _WebBluetoothDevice.PowerDataDistributor {
    constructor() {
      super();

      _defineProperty(this, "nextPower", void 0);

      this.nextPower = 0;
      setInterval(() => {
        if (this.nextPower) {
          this._notifyNewPower(new Date().getTime(), Math.random() * 2 + this.nextPower - 1);
        } else {
          this._notifyNewPower(new Date().getTime(), Math.random() * 50 + 100);

          this._notifyNewHrm(new Date().getTime(), Math.random() * 5 + 50);
        }
      }, 250);
    }

    setNextPower(power) {
      this.nextPower = power;
    }

    getDeviceId() {
      return "Fake";
    }

    getDeviceTypeDescription() {
      return "Fake Device";
    }

    updateSlope(tmNow, ftmsPct) {
      return Promise.resolve(false);
    }

    updateErg(tmNow, watts) {
      return Promise.resolve(false);
    }

    updateResistance(tmNow) {
      return Promise.resolve(false);
    }

    disconnect() {
      return Promise.resolve();
    }

    getState() {
      return _WebBluetoothDevice.BTDeviceState.Ok;
    }

    name() {
      return "Fake Device";
    }

  }

  _exports.FakeDevice = FakeDevice;
  let g_fakeDevice;
  let Application = (_dec = Ember.computed("myRidersVersion"), _dec2 = Ember.computed("frame"), (_class = (_temp = class Application extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service('devices'),
    connection: Ember.inject.service('connection'),
    bluetoothWarning: false,
    canDoBluetooth: false,
    frame: 0,
    showCheater: false,
    isDebug: window.location.hostname === 'localhost',
    observeGoodUpdates: Ember.observer('devices.goodUpdates', function () {
      const deviceWrite = document.querySelector('.application__device-write');

      if (deviceWrite) {
        deviceWrite.classList.add('good');
        setTimeout(() => {
          deviceWrite.classList.remove('good');
        }, 250);
      }
    }),
    actions: {
      connectDh() {
        (0, _DeviceFactory.getDeviceFactory)().findDisplay().then(device => {
          this.devices.setDisplayDevice(device);
        });
      },

      connectDevice() {
        var _window$location, _window$location$sear;

        if (((_window$location = window.location) === null || _window$location === void 0 ? void 0 : (_window$location$sear = _window$location.search) === null || _window$location$sear === void 0 ? void 0 : _window$location$sear.includes("fake")) || window.location.hostname === 'localhost') {
          const device = g_fakeDevice = new FakeDevice();
          this.devices.setLocalUserDevice(device, _devices.DeviceFlags.All);
        } else {
          (0, _DeviceFactory.getDeviceFactory)().findPowermeter().then(device => {
            this.devices.setLocalUserDevice(device, _devices.DeviceFlags.AllButHrm);
          });
        }
      },

      hideThis() {
        const userInfo = document.querySelector('.application__user-info');

        if (userInfo) {
          window.scrollTo(0, userInfo === null || userInfo === void 0 ? void 0 : userInfo.scrollHeight);
        }
      },

      connectHrm() {
        if (window.location.search && window.location.search.includes("fake")) {
          const device = g_fakeDevice = new FakeDevice();
          this.devices.setLocalUserDevice(device, _devices.DeviceFlags.Hrm);
        } else {
          (0, _DeviceFactory.getDeviceFactory)().findHrm().then(device => {
            this.devices.setLocalUserDevice(device, _devices.DeviceFlags.Hrm);
          });
        }
      },

      ftmsAdjust(amt) {
        this.devices.ftmsAdjust(amt);
      }

    }
  }) {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "myRidersVersion", 0);
    }

    _tick() {
      const hasLocalUser = !!this.devices.getLocalUser();
      const hasBluetoothDevice = this.devices.isLocalUserDeviceValid();

      if (hasLocalUser && !hasBluetoothDevice) {
        this.set('bluetoothWarning', true);
      } else {
        this.set('bluetoothWarning', false);
      }

      this.incrementProperty('frame');
      this.incrementProperty('myRidersVersion');
      setTimeout(() => this._tick(), 2000);
    }

    get userInfo() {
      const hasLocalUser = this.devices.getLocalUser();

      if (hasLocalUser) {
        const image = hasLocalUser.getImage();

        if (image) {
          return `<a href="/results?md5=${hasLocalUser.getBigImageMd5()}">your results link</a>`;
        }
      }

      return '';
    }

    start() {
      if (window.location.hostname === 'localhost' || window.location.search.includes('?fake')) {
        this.set('showCheater', false);
        Ember.run.later('afterRender', () => {
          const cheater = document.querySelector('.application__user-status--cheater');

          if (cheater) {
            cheater.onmousemove = evt => {
              const x = evt.offsetX;

              if (g_fakeDevice) {
                g_fakeDevice.setNextPower(x);
              }
            };
          }
        });
      }

      if (!window.navigator || !window.navigator.bluetooth || !window.navigator.bluetooth.getAvailability) {
        this.set('canDoBluetooth', false);
        this.transitionToRoute('no-bluetooth');
      } else {
        navigator.bluetooth.getAvailability().then(available => {
          console.log("Bluetooth is available? ", available);
          this.set('canDoBluetooth', available);

          if (!available) {
            this.transitionToRoute('no-bluetooth');
          }
        });
      }

      this._tick();
    }

    get localUser() {
      if (this.get('bluetoothWarning')) {
        // don't display the user if we have a bluetooth warning
        return null;
      }

      const user = this.devices.getLocalUser();

      try {
        const raceState = this.connection.getRaceState();

        if (raceState) {
          // don't display the user if we're racing
          return null;
        }
      } catch (e) {}

      if (window.location.pathname.includes("pacing-challenge-race")) {
        return null;
      }

      if (user) {
        return user.getDisplay(null);
      }

      return null;
    }

  }, _temp), (_applyDecoratedDescriptor(_class.prototype, "userInfo", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "userInfo"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "localUser", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "localUser"), _class.prototype)), _class)); // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.

  _exports.default = Application;
});
;define("bt-web2/application/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class Application extends Ember.Route.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service('devices'),
    auth: Ember.inject.service('auth')
  }) {
    // normal class body definition here
    async beforeModel(params) {
      const auth = await this.get('auth').auth;
      debugger;
    }

    setupController(controller, model) {
      controller.set('model', model);
      controller.start();
    }

  }

  _exports.default = Application;
});
;define("bt-web2/application/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "Nj4YWJkh",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"application__container\"],[8],[0,\"\\n  \"],[1,[22,\"outlet\"],false],[0,\"\\n\\n  \"],[7,\"div\",false],[12,\"class\",\"application__device-write\"],[3,\"action\",[[23,0,[]],\"connectDevice\"]],[8],[9],[0,\"\\n  \"],[7,\"div\",true],[11,\"class\",[29,[\"application__bluetooth-warning \",[28,\"if\",[[24,[\"bluetoothWarning\"]],\"device-gone\"],null]]]],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"application__bluetooth-warning--text\"],[8],[0,\"\\n      \"],[7,\"i\",true],[10,\"class\",\"fas fa-exclamation-triangle yellow\"],[8],[9],[0,\"\\n      \"],[7,\"i\",true],[10,\"class\",\"fab fa-bluetooth blue\"],[8],[9],[0,\"\\n      \"],[7,\"i\",true],[10,\"class\",\"fas fa-arrow-right green\"],[8],[9],[0,\"\\n    \"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"application__bluetooth-warning--buttons\"],[8],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"application__bluetooth-warning--button\"],[3,\"action\",[[23,0,[]],\"connectHrm\"]],[8],[0,\"\\n        \"],[7,\"i\",true],[10,\"class\",\"fas fa-heart\"],[8],[9],[0,\"\\n      \"],[9],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"application__bluetooth-warning--button\"],[3,\"action\",[[23,0,[]],\"connectDevice\"]],[8],[0,\"\\n        \"],[7,\"i\",true],[10,\"class\",\"fas fa-bolt\"],[8],[9],[0,\"\\n      \"],[9],[0,\"\\n\\n      \"],[7,\"button\",false],[12,\"class\",\"application__bluetooth-warning--button\"],[3,\"action\",[[23,0,[]],\"connectDh\"]],[8],[0,\"\\n        \"],[7,\"i\",true],[10,\"class\",\"fas fa-desktop\"],[8],[9],[0,\"\\n      \"],[9],[0,\"\\n    \"],[9],[0,\"\\n  \"],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/application/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/cldrs/en", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  /*jslint eqeq: true*/
  var _default = [{
    "locale": "en-US",
    "parentLocale": "en"
  }, {
    "locale": "en",
    "pluralRuleFunction": function (n, ord) {
      var s = String(n).split("."),
          v0 = !s[1],
          t0 = Number(s[0]) == n,
          n10 = t0 && s[0].slice(-1),
          n100 = t0 && s[0].slice(-2);
      if (ord) return n10 == 1 && n100 != 11 ? "one" : n10 == 2 && n100 != 12 ? "two" : n10 == 3 && n100 != 13 ? "few" : "other";
      return n == 1 && v0 ? "one" : "other";
    },
    "fields": {
      "year": {
        "displayName": "year",
        "relative": {
          "0": "this year",
          "1": "next year",
          "-1": "last year"
        },
        "relativeTime": {
          "future": {
            "one": "in {0} year",
            "other": "in {0} years"
          },
          "past": {
            "one": "{0} year ago",
            "other": "{0} years ago"
          }
        }
      },
      "year-short": {
        "displayName": "yr.",
        "relative": {
          "0": "this yr.",
          "1": "next yr.",
          "-1": "last yr."
        },
        "relativeTime": {
          "future": {
            "one": "in {0} yr.",
            "other": "in {0} yr."
          },
          "past": {
            "one": "{0} yr. ago",
            "other": "{0} yr. ago"
          }
        }
      },
      "month": {
        "displayName": "month",
        "relative": {
          "0": "this month",
          "1": "next month",
          "-1": "last month"
        },
        "relativeTime": {
          "future": {
            "one": "in {0} month",
            "other": "in {0} months"
          },
          "past": {
            "one": "{0} month ago",
            "other": "{0} months ago"
          }
        }
      },
      "month-short": {
        "displayName": "mo.",
        "relative": {
          "0": "this mo.",
          "1": "next mo.",
          "-1": "last mo."
        },
        "relativeTime": {
          "future": {
            "one": "in {0} mo.",
            "other": "in {0} mo."
          },
          "past": {
            "one": "{0} mo. ago",
            "other": "{0} mo. ago"
          }
        }
      },
      "day": {
        "displayName": "day",
        "relative": {
          "0": "today",
          "1": "tomorrow",
          "-1": "yesterday"
        },
        "relativeTime": {
          "future": {
            "one": "in {0} day",
            "other": "in {0} days"
          },
          "past": {
            "one": "{0} day ago",
            "other": "{0} days ago"
          }
        }
      },
      "day-short": {
        "displayName": "day",
        "relative": {
          "0": "today",
          "1": "tomorrow",
          "-1": "yesterday"
        },
        "relativeTime": {
          "future": {
            "one": "in {0} day",
            "other": "in {0} days"
          },
          "past": {
            "one": "{0} day ago",
            "other": "{0} days ago"
          }
        }
      },
      "hour": {
        "displayName": "hour",
        "relative": {
          "0": "this hour"
        },
        "relativeTime": {
          "future": {
            "one": "in {0} hour",
            "other": "in {0} hours"
          },
          "past": {
            "one": "{0} hour ago",
            "other": "{0} hours ago"
          }
        }
      },
      "hour-short": {
        "displayName": "hr.",
        "relative": {
          "0": "this hour"
        },
        "relativeTime": {
          "future": {
            "one": "in {0} hr.",
            "other": "in {0} hr."
          },
          "past": {
            "one": "{0} hr. ago",
            "other": "{0} hr. ago"
          }
        }
      },
      "minute": {
        "displayName": "minute",
        "relative": {
          "0": "this minute"
        },
        "relativeTime": {
          "future": {
            "one": "in {0} minute",
            "other": "in {0} minutes"
          },
          "past": {
            "one": "{0} minute ago",
            "other": "{0} minutes ago"
          }
        }
      },
      "minute-short": {
        "displayName": "min.",
        "relative": {
          "0": "this minute"
        },
        "relativeTime": {
          "future": {
            "one": "in {0} min.",
            "other": "in {0} min."
          },
          "past": {
            "one": "{0} min. ago",
            "other": "{0} min. ago"
          }
        }
      },
      "second": {
        "displayName": "second",
        "relative": {
          "0": "now"
        },
        "relativeTime": {
          "future": {
            "one": "in {0} second",
            "other": "in {0} seconds"
          },
          "past": {
            "one": "{0} second ago",
            "other": "{0} seconds ago"
          }
        }
      },
      "second-short": {
        "displayName": "sec.",
        "relative": {
          "0": "now"
        },
        "relativeTime": {
          "future": {
            "one": "in {0} sec.",
            "other": "in {0} sec."
          },
          "past": {
            "one": "{0} sec. ago",
            "other": "{0} sec. ago"
          }
        }
      }
    },
    "numbers": {
      "decimal": {
        "long": [[1000, {
          "one": ["0 thousand", 1],
          "other": ["0 thousand", 1]
        }], [10000, {
          "one": ["00 thousand", 2],
          "other": ["00 thousand", 2]
        }], [100000, {
          "one": ["000 thousand", 3],
          "other": ["000 thousand", 3]
        }], [1000000, {
          "one": ["0 million", 1],
          "other": ["0 million", 1]
        }], [10000000, {
          "one": ["00 million", 2],
          "other": ["00 million", 2]
        }], [100000000, {
          "one": ["000 million", 3],
          "other": ["000 million", 3]
        }], [1000000000, {
          "one": ["0 billion", 1],
          "other": ["0 billion", 1]
        }], [10000000000, {
          "one": ["00 billion", 2],
          "other": ["00 billion", 2]
        }], [100000000000, {
          "one": ["000 billion", 3],
          "other": ["000 billion", 3]
        }], [1000000000000, {
          "one": ["0 trillion", 1],
          "other": ["0 trillion", 1]
        }], [10000000000000, {
          "one": ["00 trillion", 2],
          "other": ["00 trillion", 2]
        }], [100000000000000, {
          "one": ["000 trillion", 3],
          "other": ["000 trillion", 3]
        }]],
        "short": [[1000, {
          "one": ["0K", 1],
          "other": ["0K", 1]
        }], [10000, {
          "one": ["00K", 2],
          "other": ["00K", 2]
        }], [100000, {
          "one": ["000K", 3],
          "other": ["000K", 3]
        }], [1000000, {
          "one": ["0M", 1],
          "other": ["0M", 1]
        }], [10000000, {
          "one": ["00M", 2],
          "other": ["00M", 2]
        }], [100000000, {
          "one": ["000M", 3],
          "other": ["000M", 3]
        }], [1000000000, {
          "one": ["0B", 1],
          "other": ["0B", 1]
        }], [10000000000, {
          "one": ["00B", 2],
          "other": ["00B", 2]
        }], [100000000000, {
          "one": ["000B", 3],
          "other": ["000B", 3]
        }], [1000000000000, {
          "one": ["0T", 1],
          "other": ["0T", 1]
        }], [10000000000000, {
          "one": ["00T", 2],
          "other": ["00T", 2]
        }], [100000000000000, {
          "one": ["000T", 3],
          "other": ["000T", 3]
        }]]
      }
    }
  }];
  _exports.default = _default;
});
;define("bt-web2/components/create-race-widget/component", ["exports", "bt-web2/tourjs-shared/RideMap", "bt-web2/tourjs-shared/communication", "bt-web2/tourjs-shared/ServerHttpObjects", "bt-web2/set-up-ride/route", "bt-web2/services/platform-manager", "bt-web2/tourjs-client-shared/DecorationFactory"], function (_exports, _RideMap, _communication, _ServerHttpObjects, _route, _platformManager, _DecorationFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = _exports.RideMapResampleDistance = void 0;

  var _dec, _class;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class RideMapResampleDistance extends _RideMap.RideMapPartial {
    constructor(src, myDistance) {
      super();

      _defineProperty(this, "_src", void 0);

      _defineProperty(this, "_myDistance", void 0);

      this._src = src;
      this._myDistance = myDistance;
    }

    getElevationAtDistance(meters) {
      const pct = meters / this._myDistance;

      const theirDistance = pct * this._src.getLength();

      return this._src.getElevationAtDistance(theirDistance);
    }

    getLength() {
      return this._myDistance;
    }

  }

  _exports.RideMapResampleDistance = RideMapResampleDistance;

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    // Loop through the FileList and render image files as thumbnails.

    for (var i = 0, f; f = files[i]; i++) {
      // Only process image files.
      if (!f.name.endsWith('.gpx')) {
        continue;
      }

      var reader = new FileReader(); // Closure to capture the file information.

      reader.onload = theFile => {
        var _theFile$target;

        const xml = (_theFile$target = theFile.target) === null || _theFile$target === void 0 ? void 0 : _theFile$target.result;

        if (!(typeof xml === 'string')) {
          var _theFile$target2;

          console.error("File contents showed up as ", (_theFile$target2 = theFile.target) === null || _theFile$target2 === void 0 ? void 0 : _theFile$target2.result);
          alert("Couldn't parse.");
          return;
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        const trackPoints = xmlDoc.querySelectorAll('trkseg trkpt');

        if (trackPoints.length <= 0) {
          alert("No dist/elev data found");
          return;
        }

        let distances = [0];
        let elevs = [parseFloat(trackPoints[0].querySelector('ele').innerHTML)];

        if (!isFinite(elevs[0]) && isNaN(elevs[0])) {
          alert("Failed to parse data");
          return;
        }

        let cumeDistance = 0;
        [...trackPoints].slice(1).forEach((trkpt, index) => {
          var _trkpt$querySelector;

          // these individually look like:
          //<trkpt lon="-80.48777635" lat="43.4883684333">
          //  <time>2013-02-06T18:44:15Z</time>
          //  <ele>330.387824331</ele>
          //</trkpt>
          // so now we have to measure distances from each latlng and spit it into a ElevDistanceMap
          const realIndex = index + 1;
          const last = trackPoints[realIndex - 1];
          const lastLatLng = {
            latitude: parseFloat(last.attributes['lat'].value),
            longitude: parseFloat(last.attributes['lon'].value)
          };
          const thisLatLng = {
            latitude: parseFloat(trkpt.attributes['lat'].value),
            longitude: parseFloat(trkpt.attributes['lon'].value)
          };
          const distThisStep = window.geolib.getDistance(lastLatLng, thisLatLng, 0.1);
          const elevThisStep = parseFloat(((_trkpt$querySelector = trkpt.querySelector('ele')) === null || _trkpt$querySelector === void 0 ? void 0 : _trkpt$querySelector.innerHTML) || "");
          cumeDistance += distThisStep;

          if (!isFinite(cumeDistance) && isNaN(cumeDistance)) {
            alert("Failed to parse data");
            return;
          }

          if (!isFinite(elevThisStep) && isNaN(elevThisStep)) {
            alert("Failed to parse data");
            return;
          }

          distances.push(cumeDistance);
          elevs.push(elevThisStep);
        });

        if (distances.length > 0 && elevs.length > 0 && distances.length === elevs.length) {
          // we good!
          this.set('uploadMapData', new _platformManager.ElevDistanceMap(elevs, distances));
        } else {
          alert("Failed to import map data");
        }
      }; // Read in the image file as a data URL.


      reader.readAsText(f);
    }
  }

  let CreateRideWidget = (_dec = Ember.computed("meters", "rideName", "uploadMapData"), (_class = class CreateRideWidget extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    meters: 20000,
    raceName: "My Ride",
    raceDate: new Date(new Date().getTime() + 5 * 3600 * 1000),
    raceTime: '12:00',
    classNames: ['create-race-widget__container'],
    race: null,
    uploadMapData: null,
    onRaceCreated: req => {},
    devices: Ember.inject.service('devices'),
    platformManager: Ember.inject.service('platform-manager'),
    actions: {
      setUpStrava() {
        // gotta redirect them to a strava link, then callback to a server, and blah blah
        this.get('platformManager').getStravaMapList().then(mapList => {
          const names = mapList.map((map, index) => index + ') ' + map.name + ' (' + (map.distance / 1000).toFixed(1) + 'km)');
          const pick = prompt("Select a map \n" + names.join('\n'));

          if (pick) {
            const pickNumber = parseInt(pick);

            if (isFinite(pickNumber)) {
              return this.get('platformManager').getStravaMapDetails(mapList[pickNumber]).then(mapDetails => {
                this.set('uploadMapData', mapDetails);
                this.set('meters', mapDetails.getLength());
                this.set('raceName', mapList[pickNumber].name);
              });
            }
          }

          debugger;
        });
      },

      randomCourse(lengthMeters) {
        this.set('meters', lengthMeters);
        let lastElevation = 0;
        let elevations = [lastElevation];
        const stepSize = 500;

        for (var x = 0; x < lengthMeters; x += stepSize) {
          // let's have 5% as our max grade
          const gainLoss = (0, _DecorationFactory.randRange)(-0.05, 0.05) * stepSize;
          const newElev = lastElevation + gainLoss;
          elevations.push(newElev);
          lastElevation = newElev;
        }

        const map = new _communication.SimpleElevationMap(elevations, lengthMeters);
        this.set('race', map);
        this.set('raceName', `Quick ${lengthMeters}m race`);
      },

      buildFromTcx() {},

      createRace() {
        const race = this.get('race');
        const raceDate = this.get('raceDate');
        const raceTime = this.get('raceTime');
        const raceTimeSplit = raceTime.split(':');

        if (raceTimeSplit.length !== 2) {
          throw new Error("Invalid/expected time");
        }

        const hoursOfDay = parseInt(raceTimeSplit[0]);

        if (!isFinite(hoursOfDay) || hoursOfDay < 0 || hoursOfDay >= 24) {
          throw new Error("Invalid hours");
        }

        const minutesOfHour = parseInt(raceTimeSplit[1]);

        if (!isFinite(minutesOfHour) || minutesOfHour < 0 || minutesOfHour >= 60) {
          throw new Error("Invalid minutes");
        }

        let date = new Date(raceDate);
        const offset = date.getTimezoneOffset() * 60 * 1000;
        date = new Date(date.getTime() + offset);
        date.setHours(hoursOfDay);
        date.setMinutes(minutesOfHour);
        const localUser = this.devices.getLocalUser();

        if (!localUser) {
          throw new Error("You're not signed in!");
        }

        const req = new _ServerHttpObjects.ScheduleRacePostRequest(race, date, this.get('raceName'), localUser.getName());
        return (0, _route.apiPost)('create-race', req).then(() => {
          this.onRaceCreated(req);
        }, failure => {
          console.error(failure);
          alert("Failed to create your ride");
        });
      }

    }
  }) {
    // normal class body definition here
    didInsertElement() {
      const files = this.element.querySelector('input[type="file"]');

      if (files) {
        files.addEventListener('change', handleFileSelect.bind(this), false);
      }

      let raceDateInitial = new Date();
      raceDateInitial = new Date(raceDateInitial.getTime() - raceDateInitial.getTimezoneOffset() * 60000);
      this.set('raceDate', raceDateInitial.toISOString().split('T')[0]);
      this.set('raceTime', (new Date().getHours() + 1) % 24 + ':00');
      const localUser = this.devices.getLocalUser();

      if (!localUser) {
        throw new Error("You're not signed in!");
      }

      this.set('raceName', `${localUser.getName()}'s Race`);
    }

    get race() {
      const uploadMap = this.get('uploadMapData');

      if (uploadMap) {
        return new RideMapResampleDistance(uploadMap, this.get('meters'));
      }

      return new _RideMap.PureCosineMap(parseInt('' + this.get('meters')));
    }

  }, (_applyDecoratedDescriptor(_class.prototype, "race", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "race"), _class.prototype)), _class));
  _exports.default = CreateRideWidget;
  ;
});
;define("bt-web2/components/create-race-widget/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "0C/zOAX4",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"create-race-widget__param\"],[8],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"create-race-widget__param--title\"],[8],[0,\"Length (meters)\"],[9],[0,\"\\n  \"],[1,[28,\"input\",null,[[\"class\",\"type\",\"value\"],[\"create-race-widget__text\",\"number\",[24,[\"meters\"]]]]],false],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"create-race-widget__param\"],[8],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"create-race-widget__param--title\"],[8],[0,\"Pick Course\"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"stravaLink\"]]],null,{\"statements\":[],\"parameters\":[]},{\"statements\":[[0,\"    \"],[7,\"button\",false],[12,\"class\",\"create-race-widget__button\"],[3,\"action\",[[23,0,[]],\"setUpStrava\"]],[8],[0,\"Pick From Strava\"],[9],[0,\"\\n    \"],[7,\"label\",true],[10,\"for\",\"gpx-upload\"],[8],[0,\"\\n      \"],[7,\"input\",true],[10,\"id\",\"gpx-upload\"],[10,\"class\",\"create-race-widget__button file-upload\"],[10,\"type\",\"file\"],[8],[9],[0,\"\\n      \"],[7,\"span\",true],[10,\"class\",\"create-race-widget__button\"],[8],[0,\"Upload GPX\"],[9],[0,\"\\n    \"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"create-race-widget__quick-label\"],[8],[0,\"Quick Start\"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"create-race-widget__quick-container\"],[8],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"create-race-widget__quick-button\"],[3,\"action\",[[23,0,[]],\"randomCourse\",6000]],[8],[0,\"6km\"],[9],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"create-race-widget__quick-button\"],[3,\"action\",[[23,0,[]],\"randomCourse\",10000]],[8],[0,\"10km\"],[9],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"create-race-widget__quick-button\"],[3,\"action\",[[23,0,[]],\"randomCourse\",15000]],[8],[0,\"15km\"],[9],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"create-race-widget__quick-button\"],[3,\"action\",[[23,0,[]],\"randomCourse\",20000]],[8],[0,\"20km\"],[9],[0,\"\\n    \"],[9],[0,\"\\n\"]],\"parameters\":[]}],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"create-race-widget__param\"],[8],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"create-race-widget__param--title\"],[8],[0,\"Name Of Your Ride\"],[9],[0,\"\\n  \"],[1,[28,\"input\",null,[[\"class\",\"type\",\"value\"],[\"create-race-widget__text\",\"text\",[24,[\"raceName\"]]]]],false],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"create-race-widget__param\"],[8],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"create-race-widget__param--title\"],[8],[0,\"When are you riding? (date)\"],[9],[0,\"\\n  \"],[1,[28,\"input\",null,[[\"class\",\"id\",\"type\",\"value\"],[\"create-race-widget__text\",\"when-date\",\"date\",[24,[\"raceDate\"]]]]],false],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"create-race-widget__param--title\"],[8],[0,\"When are you riding? (time)\"],[9],[0,\"\\n  \"],[1,[28,\"input\",null,[[\"class\",\"id\",\"type\",\"value\"],[\"create-race-widget__text\",\"when-time\",\"time\",[24,[\"raceTime\"]]]]],false],[0,\"\\n\"],[9],[0,\"\\n\"],[1,[28,\"mini-map\",null,[[\"class\",\"race\"],[\"create-race-widget__minimap\",[24,[\"race\"]]]]],false],[0,\"\\n\"],[7,\"button\",false],[12,\"class\",\"create-race-widget__button\"],[3,\"action\",[[23,0,[]],\"createRace\"]],[8],[0,\"Submit Ride\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/create-race-widget/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/display-post-race-spending/component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class DisplayPostRaceSpending extends Ember.Component.extend({// anything which *must* be merged to prototype here
  }) {// normal class body definition here
  }

  _exports.default = DisplayPostRaceSpending;
  ;
});
;define("bt-web2/components/display-post-race-spending/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "0w3uIgBq",
    "block": "{\"symbols\":[\"result\",\"index\"],\"statements\":[[7,\"h3\",true],[10,\"class\",\"display-post-race__title\"],[8],[1,[22,\"title\"],false],[9],[0,\"\\n\"],[7,\"p\",true],[10,\"class\",\"display-post-race__text\"],[8],[1,[22,\"description\"],false],[9],[0,\"\\n\"],[7,\"table\",true],[10,\"class\",\"display-post-race__table\"],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"list\"]]],null,{\"statements\":[[0,\"    \"],[7,\"tr\",true],[10,\"class\",\"display-post-race__result\"],[8],[0,\"\\n      \"],[7,\"td\",true],[8],[0,\"#\"],[1,[28,\"add\",[[23,2,[]],1],null],false],[9],[0,\"\\n      \"],[7,\"td\",true],[8],[1,[23,1,[\"name\"]],false],[9],[0,\"\\n      \"],[7,\"td\",true],[8],[0,\"\\n\"],[4,\"if\",[[23,1,[\"spending\"]]],null,{\"statements\":[[4,\"if\",[[24,[\"overDistanceKm\"]]],null,{\"statements\":[[0,\"            \"],[1,[28,\"divide\",[[23,1,[\"spending\"]],[24,[\"overDistanceKm\"]],1],null],false],[0,\"/km\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"            \"],[1,[23,1,[\"spending\"]],false],[0,\"\\n\"]],\"parameters\":[]}]],\"parameters\":[]},{\"statements\":[[0,\"          Not Finished\\n\"]],\"parameters\":[]}],[0,\"      \"],[9],[0,\"\\n    \"],[9],[0,\"\\n\"]],\"parameters\":[1,2]},null],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/display-post-race-spending/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/display-post-race/component", ["exports", "bt-web2/tourjs-shared/Utils", "bt-web2/tourjs-shared/User"], function (_exports, _Utils, _User) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _dec, _class, _temp;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class FinishUser {
    constructor(id, finish) {
      _defineProperty(this, "_data", void 0);

      _defineProperty(this, "_id", void 0);

      _defineProperty(this, "_ix", void 0);

      this._id = id;
      this._data = finish;
      const ix = finish.rankings.findIndex(rankId => rankId === id);

      if (ix < 0 || ix >= finish.rankings.length) {
        throw new Error("Couldn't find user");
      }

      this._ix = ix;
    }

    getName() {
      return this._data.names[this._ix];
    }

    getUserType() {
      return this._data.types[this._ix];
    }

    getHandicap() {
      return this._data.handicaps[this._ix];
    }

    getHandicapSecondsSaved() {
      return this._data.hsSaved[this._ix];
    }

    getHandicapSecondsUsed() {
      return this._data.userSpending[this._ix];
    }

    getId() {
      return this._id;
    }

    setId(newId) {
      debugger;
      throw new Error('Method not implemented.');
    }

    setHandicap(watts) {
      debugger;
      throw new Error('Method not implemented.');
    }

    setChat(tmNow, chat) {
      debugger;
      throw new Error('Method not implemented.');
    }

    getLastChat(tmNow) {
      debugger;
      throw new Error('Method not implemented.');
    }

    getLastElevation() {
      return 0;
    }

    getPositionUpdate(tmNow) {
      debugger;
      throw new Error('Method not implemented.');
    }

    setDistance(dist) {
      debugger;
      throw new Error('Method not implemented.');
    }

    setSpeed(speed) {
      debugger;
      throw new Error('Method not implemented.');
    }

    setDistanceHistory(newHistory) {
      debugger;
      throw new Error('Method not implemented.');
    }

    getDistanceHistory() {
      debugger;
      throw new Error('Method not implemented.');
    }

    getLastSlopeInWholePercent() {
      debugger;
      throw new Error('Method not implemented.');
    }

    getDistance() {
      debugger;
      throw new Error('Method not implemented.');
    }

    getSpeed() {
      debugger;
      throw new Error('Method not implemented.');
    }

    getImage() {
      debugger;
      throw new Error('Method not implemented.');
    }

    getBigImageMd5() {
      debugger;
      throw new Error('Method not implemented.');
    }

    getLastHandicapChangeTime() {
      debugger;
      throw new Error('Method not implemented.');
    }

    physicsTick(tmNow, map, otherUsers) {
      debugger;
      throw new Error('Method not implemented.');
    }

    getDrafteeStats() {
      return [];
    }

    getLastDraftLength() {
      return 0;
    }

    notifyDrafteeThisCycle(tmNow, id, pctSaved) {
      debugger;
      throw new Error('Method not implemented.');
    }

    getDrafteeCount(tmNow) {
      debugger;
      throw new Error('Method not implemented.');
    }

    getSecondsAgoToCross(tmNow, distance) {
      debugger;
      throw new Error('Method not implemented.');
    }

    isDraftingLocalUser() {
      debugger;
      throw new Error('Method not implemented.');
    }

    getLastWattsSaved() {
      debugger;
      throw new Error('Method not implemented.');
    }

    hasDraftersThisCycle(tmNow) {
      debugger;
      throw new Error('Method not implemented.');
    }

    getDisplay(raceState) {
      debugger;
      throw new Error('Method not implemented.');
    }

    setImage(imageBase64, bigImageMd5) {
      debugger;
      throw new Error('Method not implemented.');
    }

    absorbNameUpdate(tmNow, name, type, handicap) {
      debugger;
      throw new Error('Method not implemented.');
    }

    absorbPositionUpdate(tmNow, update) {
      debugger;
      throw new Error('Method not implemented.');
    }

    isPowerValid(tmNow) {
      debugger;
      throw new Error('Method not implemented.');
    }

    notifyPower(tmNow, watts) {
      debugger;
      throw new Error('Method not implemented.');
    }

    notifyCadence(tmNow, cadence) {
      debugger;
      throw new Error('Method not implemented.');
    }

    notifyHrm(tmNow, hrm) {
      debugger;
      throw new Error('Method not implemented.');
    }

    getLastHrm(tmNow) {
      debugger;
      throw new Error('Method not implemented.');
    }

    getLastPower() {
      debugger;
      throw new Error('Method not implemented.');
    }

    setFinishTime(tmNow) {
      debugger;
      throw new Error('Method not implemented.');
    }

    getRaceTimeSeconds(tmRaceStart) {
      debugger;
      throw new Error('Method not implemented.');
    }

    isFinished() {
      debugger;
      throw new Error('Method not implemented.');
    }

    getMsSinceLastPacket(tmNow) {
      debugger;
      throw new Error('Method not implemented.');
    }

    notePacket(tmNow) {
      debugger;
      throw new Error('Method not implemented.');
    }

  }

  class FinishUserProvider {
    constructor(data) {
      _defineProperty(this, "users", void 0);

      this.users = [];
      data.rankings.forEach(id => {
        this.users.push(new FinishUser(id, data));
      });
    }

    getUsers(tmNow) {
      return this.users;
    }

    getUser(id) {
      return this.users.find(user => user.getId() === id) || null;
    }

    getLocalUser() {
      return null;
    }

  }

  let DisplayPostRace = (_dec = Ember.computed("results", "frame", "users"), (_class = (_temp = class DisplayPostRace extends Ember.Component.extend({// anything which *must* be merged to prototype here
  }) {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "results", null);

      _defineProperty(this, "users", null);
    }

    didInsertElement() {
      const results = this.get('results');

      if (results) {
        this.set('users', new FinishUserProvider(results));
      }
    }

    get processedRankings() {
      const results = this.get('results');
      const users = this.get('users');
      console.log("post-race display! ", results);

      if (results && users) {
        let ret = [];
        let leadAiUserId = results.rankings.find(userId => {
          const user = users.getUser(userId);
          return user && user.getUserType() & _User.UserTypeFlags.Ai;
        });
        results.rankings.forEach((userId, index) => {
          // this will be a userid.  We need to get the name out of the name database
          const user = users.getUser(userId);
          const name = (user === null || user === void 0 ? void 0 : user.getName()) || "Unknown";
          const timeRaw = results.times[index];
          ret.push({
            userId: userId,
            name: userId === leadAiUserId ? "Lead AI" : name,
            rank: `#${index + 1}`,
            time: (0, _Utils.formatSecondsHms)(timeRaw),
            hsSaved: results.hsSaved[index],
            efficiency: results.efficiency[index],
            spending: results.userSpending[index]
          });
        });
        ret = ret.filter(resultRow => {
          const user = users.getUser(resultRow.userId);

          if (!user) {
            return false;
          }

          if (user.getUserType() & _User.UserTypeFlags.Ai) {
            return user.getId() === leadAiUserId;
          } else {
            // non-AI users all get included
            return true;
          }
        });
        const byRank = ret.slice();
        const byHs = ret.slice().sort((a, b) => a.hsSaved > b.hsSaved ? -1 : 1).map(num => ({
          name: num.name,
          hsSaved: num.hsSaved.toFixed(1)
        }));
        const byEfficiency = ret.slice().sort((a, b) => a.efficiency > b.efficiency ? -1 : 1).map(num => ({
          name: num.name,
          efficiency: `${num.efficiency.toFixed(1)}/km`
        }));
        const finalObject = {
          byRank,
          byHs,
          byEfficiency
        };

        for (var key in results.userSpending[0]) {
          console.log("need to compute for ", key);
          finalObject[key] = ret.slice().sort((a, b) => a.spending[key] > b.spending[key] ? -1 : 1).map(num => ({
            name: num.name,
            spending: `${num.spending[key].toFixed(1)}`
          }));
        }

        console.log("final = ", finalObject);
        finalObject.raceDistanceKm = results.raceLengthKm;
        finalObject.halfDistanceKm = results.raceLengthKm / 2;
        finalObject.sprintDistanceKm = 0.5;
        return finalObject;
      } else {
        return {
          byRank: [],
          byHs: [],
          byEfficiency: []
        };
      }
    }

  }, _temp), (_applyDecoratedDescriptor(_class.prototype, "processedRankings", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "processedRankings"), _class.prototype)), _class));
  _exports.default = DisplayPostRace;
  ;
});
;define("bt-web2/components/display-post-race/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "xq5KE3P9",
    "block": "{\"symbols\":[\"result\",\"index\",\"result\",\"index\",\"result\"],\"statements\":[[1,[22,\"tourjs-header\"],false],[0,\"\\n\\n\\n\"],[7,\"div\",true],[10,\"class\",\"display-post-race__rankings\"],[8],[0,\"\\n  \"],[7,\"h3\",true],[10,\"class\",\"display-post-race__title\"],[8],[0,\"Rankings:\"],[9],[0,\"\\n  \"],[7,\"table\",true],[10,\"class\",\"display-post-race__table\"],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"processedRankings\",\"byRank\"]]],null,{\"statements\":[[0,\"      \"],[7,\"tr\",true],[10,\"class\",\"display-post-race__result\"],[8],[0,\"\\n        \"],[7,\"td\",true],[8],[1,[23,5,[\"rank\"]],false],[9],[0,\"\\n        \"],[7,\"td\",true],[8],[1,[23,5,[\"name\"]],false],[9],[0,\"\\n        \"],[7,\"td\",true],[8],[0,\"\\n\"],[4,\"if\",[[23,5,[\"time\"]]],null,{\"statements\":[[0,\"            \"],[1,[23,5,[\"time\"]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"            Not Finished\\n\"]],\"parameters\":[]}],[0,\"        \"],[9],[0,\"\\n      \"],[9],[0,\"\\n\"]],\"parameters\":[5]},null],[0,\"  \"],[9],[0,\"\\n\\n\\n  \"],[7,\"h3\",true],[10,\"class\",\"display-post-race__title\"],[8],[0,\"Draft Kings and Queens:\"],[9],[0,\"\\n  \"],[7,\"p\",true],[10,\"class\",\"display-post-race__text\"],[8],[0,\"This shows how many FTP-seconds of energy each person saved.  An FTP-second saved means for a 250W rider, they got to skip doing 250W for a second.  Or they got to do 125W less for 2 seconds.\"],[9],[0,\"\\n  \"],[7,\"table\",true],[10,\"class\",\"display-post-race__table\"],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"processedRankings\",\"byHs\"]]],null,{\"statements\":[[0,\"      \"],[7,\"tr\",true],[10,\"class\",\"display-post-race__result\"],[8],[0,\"\\n        \"],[7,\"td\",true],[8],[0,\"#\"],[1,[28,\"add\",[[23,4,[]],1],null],false],[9],[0,\"\\n        \"],[7,\"td\",true],[8],[1,[23,3,[\"name\"]],false],[9],[0,\"\\n        \"],[7,\"td\",true],[8],[0,\"\\n\"],[4,\"if\",[[23,3,[\"hsSaved\"]]],null,{\"statements\":[[0,\"            \"],[1,[23,3,[\"hsSaved\"]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"            Not Finished\\n\"]],\"parameters\":[]}],[0,\"        \"],[9],[0,\"\\n      \"],[9],[0,\"\\n\"]],\"parameters\":[3,4]},null],[0,\"  \"],[9],[0,\"\\n\\n  \\n  \"],[7,\"h3\",true],[10,\"class\",\"display-post-race__title\"],[8],[0,\"The \\\"Definitely Not A Prius\\\" Award\"],[9],[0,\"\\n  \"],[7,\"p\",true],[10,\"class\",\"display-post-race__text\"],[8],[0,\"Who used the most energy per km?  Rankings are by FTP-seconds spent per kilometer.\"],[9],[0,\"\\n  \"],[7,\"table\",true],[10,\"class\",\"display-post-race__table\"],[8],[0,\"\\n\"],[4,\"each\",[[24,[\"processedRankings\",\"byEfficiency\"]]],null,{\"statements\":[[0,\"      \"],[7,\"tr\",true],[10,\"class\",\"display-post-race__result\"],[8],[0,\"\\n        \"],[7,\"td\",true],[8],[0,\"#\"],[1,[28,\"add\",[[23,2,[]],1],null],false],[9],[0,\"\\n        \"],[7,\"td\",true],[8],[1,[23,1,[\"name\"]],false],[9],[0,\"\\n        \"],[7,\"td\",true],[8],[0,\"\\n\"],[4,\"if\",[[23,1,[\"efficiency\"]]],null,{\"statements\":[[0,\"            \"],[1,[23,1,[\"efficiency\"]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"            Not Finished\\n\"]],\"parameters\":[]}],[0,\"        \"],[9],[0,\"\\n      \"],[9],[0,\"\\n\"]],\"parameters\":[1,2]},null],[0,\"  \"],[9],[0,\"\\n\\n\\n  \"],[1,[28,\"display-post-race-spending\",null,[[\"list\",\"overDistanceKm\",\"title\",\"description\"],[[24,[\"processedRankings\",\"last-500m\"]],[24,[\"processedRankings\",\"sprintDistanceKm\"]],\"Sprint Finish\",\"Energy spent in the last 500m\"]]],false],[0,\"\\n\\n  \"],[1,[28,\"display-post-race-spending\",null,[[\"list\",\"overDistanceKm\",\"title\",\"description\"],[[24,[\"processedRankings\",\"first-half\"]],[24,[\"processedRankings\",\"halfDistanceKm\"]],\"First Half Heroes\",\"Energy spent in the first half of the course.  You don't want to be winning this ranking.\"]]],false],[0,\"\\n\\n       \\n  \"],[1,[28,\"display-post-race-spending\",null,[[\"list\",\"overDistanceKm\",\"title\",\"description\"],[[24,[\"processedRankings\",\"last-half\"]],[24,[\"processedRankings\",\"halfDistanceKm\"]],\"Negative Splits Aren't So Negative\",\"Energy spent in the second half of the course\"]]],false],[0,\"\\n\\n  \"],[1,[28,\"display-post-race-spending\",null,[[\"list\",\"title\",\"description\"],[[24,[\"processedRankings\",\"while-downhill\"]],\"Which Way Does Gravity Go?\",\"Total FTP-seconds spent on downhill segments.  It's probably unwise to win this ranking.\"]]],false],[0,\"\\n  \\n  \"],[1,[28,\"display-post-race-spending\",null,[[\"list\",\"title\",\"description\"],[[24,[\"processedRankings\",\"while-uphill\"]],\"Up Up And Away!\",\"Total FTP-seconds spent on uphill segments\"]]],false],[0,\"\\n       \\n  \"],[1,[28,\"display-post-race-spending\",null,[[\"list\",\"overDistanceKm\",\"title\",\"description\"],[[24,[\"processedRankings\",\"whole-course\"]],[24,[\"processedRankings\",\"raceDistanceKm\"]],\"Total Energy Spent\",\"Total FTP-seconds spent on the entire course\"]]],false],[0,\"\\n\\n    \"],[7,\"br\",true],[8],[9],[7,\"br\",true],[8],[9],[7,\"br\",true],[8],[9],[7,\"br\",true],[8],[9],[7,\"br\",true],[8],[9],[7,\"br\",true],[8],[9],[7,\"br\",true],[8],[9],[0,\"\\n       \\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/display-post-race/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/display-pre-race-rider/component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class DisplayPreRaceRider extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    classNames: ['display-pre-race-rider__container'],
    display: null
  }) {
    // normal class body definition here
    didInsertElement() {
      const display = this.get('display');
      const image = display.user.getImage();

      if (image) {
        const myImg = this.element.querySelector('.display-pre-race-rider__image');

        if (myImg) {
          myImg.style.backgroundImage = `url('${image}')`;
        }
      }
    }

  }

  _exports.default = DisplayPreRaceRider;
  ;
});
;define("bt-web2/components/display-pre-race-rider/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "bNZ1QwXC",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"display-pre-race-rider__image-holder\"],[8],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"display-pre-race-rider__image\"],[8],[9],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"display-pre-race-rider__text\"],[8],[0,\"\\n  \"],[7,\"b\",true],[8],[1,[24,[\"display\",\"name\"]],false],[9],[7,\"br\",true],[8],[9],[0,\"\\n  \"],[7,\"i\",true],[10,\"class\",\"fas fa-bolt\"],[8],[9],[0,\" \"],[1,[24,[\"display\",\"lastPower\"]],false],[7,\"br\",true],[8],[9],[0,\"\\n  Handicap: \"],[1,[24,[\"display\",\"handicap\"]],false],[7,\"br\",true],[8],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/display-pre-race-rider/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/display-pre-race/component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _dec, _class;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  let DisplayPreRace = (_dec = Ember.computed("connection.msOfStart", "frame"), (_class = class DisplayPreRace extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    connection: Ember.inject.service(),
    frame: 0,
    classNames: ['display-pre-race__container']
  }) {
    // normal class body definition here
    get startsInSeconds() {
      const tmOfStart = this.get('connection').msOfStart;

      if (tmOfStart > 0) {
        const tmNow = new Date().getTime();
        const msAhead = Math.max(0, tmOfStart - tmNow);
        return (msAhead / 1000.0).toFixed(1);
      } else {
        return "Unknown";
      }
    }

  }, (_applyDecoratedDescriptor(_class.prototype, "startsInSeconds", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "startsInSeconds"), _class.prototype)), _class));
  _exports.default = DisplayPreRace;
  ;
});
;define("bt-web2/components/display-pre-race/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "z73+Awts",
    "block": "{\"symbols\":[\"riderDisplay\",\"riderDisplay\",\"riderDisplay\"],\"statements\":[[1,[22,\"tourjs-header\"],false],[0,\"\\n\"],[4,\"if\",[[24,[\"startsInSeconds\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\",true],[10,\"class\",\"display-pre-race__start\"],[8],[0,\"\\n    \\n    Starts In: \"],[1,[28,\"time-display\",[[24,[\"startsInSeconds\"]]],null],false],[0,\"\\n  \"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"each\",[[24,[\"localRiders\"]]],null,{\"statements\":[[0,\"  \"],[1,[28,\"display-pre-race-rider\",null,[[\"display\"],[[23,3,[]]]]],false],[0,\"\\n\"]],\"parameters\":[3]},null],[4,\"each\",[[24,[\"nonLocalHumans\"]]],null,{\"statements\":[[0,\"  \"],[1,[28,\"display-pre-race-rider\",null,[[\"display\"],[[23,2,[]]]]],false],[0,\"\\n\"]],\"parameters\":[2]},null],[4,\"each\",[[24,[\"ais\"]]],null,{\"statements\":[[0,\"  \"],[1,[28,\"display-pre-race-rider\",null,[[\"display\"],[[23,1,[]]]]],false],[0,\"\\n\"]],\"parameters\":[1]},null],[7,\"div\",true],[10,\"class\",\"bluetooth-warning-socket\"],[8],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/display-pre-race/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/display-race/component", ["exports", "bt-web2/tourjs-shared/Utils"], function (_exports, _Utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _dec, _class;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  let DisplayRace = (_dec = Ember.computed("frame"), (_class = class DisplayRace extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    frame: 0,
    raceState: null,
    devices: Ember.inject.service('devices'),
    connection: Ember.inject.service('connection'),
    mode: "2d"
  }) {
    // normal class body definition here
    didInsertElement() {
      console.log("display-race init");
      const rs = this.get('raceState');
      (0, _Utils.assert2)(rs);

      const fnUpdatePowers = () => {
        if (!this.isDestroyed) {
          this.incrementProperty('frame');
          setTimeout(fnUpdatePowers, 200);
        }
      };

      setTimeout(fnUpdatePowers);
    }

    click(evt) {
      if (evt && evt.target) {
        const totalWidth = evt.target.clientWidth;
        const pct = evt.clientX / totalWidth;
        console.log("you clicked at pos ", evt.clientX, evt.target.clientWidth);

        if (pct > 0.9) {
          this.get('connection').chat("I WILL LEAD");
        } else if (pct < 0.1) {
          this.get('connection').chat("I will rest");
        }
      }
    }

    get recentHandicapChange() {
      const tmNow = new Date().getTime();
      const localGuy = this.devices.getLocalUser();

      if (localGuy) {
        const tmHandicapChange = localGuy.getLastHandicapChangeTime();

        if (tmHandicapChange >= tmNow - 15000) {
          return localGuy.getHandicap().toFixed(1) + 'W';
        }
      }

      return null;
    }

  }, (_applyDecoratedDescriptor(_class.prototype, "recentHandicapChange", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "recentHandicapChange"), _class.prototype)), _class));
  _exports.default = DisplayRace;
  ;
});
;define("bt-web2/components/display-race/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "o98UXVIb",
    "block": "{\"symbols\":[],\"statements\":[[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"display-race__content\"],[8],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"display-race__main-holder\"],[8],[0,\"\\n    \"],[1,[28,\"main-map\",null,[[\"raceState\",\"mode\"],[[24,[\"raceState\"]],[24,[\"mode\"]]]]],false],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"display-race__controls-container\"],[8],[0,\"\\n\"],[4,\"if\",[[24,[\"overlay\"]]],null,{\"statements\":[[0,\"        \"],[7,\"div\",true],[10,\"class\",\"display-race__rankings-container\"],[8],[0,\"\\n          \"],[1,[28,\"component\",[[24,[\"overlay\"]]],[[\"raceState\",\"overlayData\",\"frame\"],[[24,[\"raceState\"]],[24,[\"overlayData\"]],[24,[\"frame\"]]]]],false],[0,\"\\n        \"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"      \"],[7,\"div\",true],[10,\"class\",\"display-race__controls-gap\"],[8],[9],[0,\"\\n      \"],[7,\"div\",true],[10,\"class\",\"display-race__status-and-map\"],[8],[0,\"\\n        \\n        \"],[7,\"div\",true],[10,\"class\",\"display-race__status-container\"],[8],[0,\"\\n          \"],[1,[28,\"user-dashboard\",null,[[\"raceState\",\"frame\"],[[24,[\"raceState\"]],[24,[\"frame\"]]]]],false],[0,\"\\n        \"],[9],[0,\"\\n        \"],[7,\"div\",true],[10,\"class\",\"display-race__mini-map-container\"],[8],[0,\"\\n          \"],[1,[28,\"mini-map-live\",null,[[\"raceState\"],[[24,[\"raceState\"]]]]],false],[0,\"\\n        \"],[9],[0,\"\\n        \\n      \"],[9],[0,\"\\n      \"],[7,\"div\",true],[11,\"class\",[29,[\"display-race__handicap-update-container \",[28,\"if\",[[24,[\"recentHandicapChange\"]],\"show\"],null]]]],[8],[0,\"\\n        Handicap revised to \"],[1,[22,\"recentHandicapChange\"],false],[7,\"br\",true],[8],[9],[0,\"\\n        Congratulations!\\n      \"],[9],[0,\"\\n    \"],[9],[0,\"\\n  \"],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/display-race/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/joinable-ride/component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class JoinableRide extends Ember.Component.extend({// anything which *must* be merged to prototype here
  }) {// normal class body definition here
  }

  _exports.default = JoinableRide;
  ;
});
;define("bt-web2/components/joinable-ride/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "i1nzw0UR",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[14,1]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/joinable-ride/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/leader-board/component", ["exports", "bt-web2/tourjs-shared/User", "bt-web2/tourjs-shared/Utils"], function (_exports, _User, _Utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _dec, _class;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function formatDelta(secondsAhead, fuzzy = false) {
    const prefix = secondsAhead >= 0 ? '' : '-';

    if (fuzzy) {
      return `${secondsAhead.toFixed(0)}s`;
    }

    if (secondsAhead > -10 && secondsAhead < 10) {
      return `${prefix}${Math.abs(secondsAhead).toFixed(2)}s`;
    } else if (secondsAhead > -60 && secondsAhead < 60) {
      return `${prefix}${Math.abs(secondsAhead).toFixed(1)}s`;
    } else {
      // minutes!
      const absSeconds = Math.abs(secondsAhead);
      const m = Math.floor(absSeconds / 60);
      const s = absSeconds - m * 60;
      return `${prefix}${m.toFixed(0)}m${s.toFixed(0)}s`;
    }
  }

  function compactUserList(users) {
    let compacted = [];
    let lastUser = users[0];
    let ixStartOfGroup = 0;
    const localUser = users.find(user => user.getUserType() & _User.UserTypeFlags.Local);

    if (!localUser) {
      return [];
    }

    for (var x = 0; x < users.length; x++) {
      const thisUser = users[x];

      if (lastUser.getUserType() & _User.UserTypeFlags.Ai) {
        if (thisUser.getUserType() & _User.UserTypeFlags.Ai) {// just continuing a run of AIs
        } else {
          // finished a run of AIs
          const compactedUser = new _User.User("Gr. " + lastUser.getName(), _User.DEFAULT_RIDER_MASS, _User.DEFAULT_HANDICAP_POWER, lastUser.getUserType());
          const leadOfGroup = users[ixStartOfGroup];
          const isBeatingLocal = leadOfGroup.getDistance() > localUser.getDistance();
          const representativeRider = isBeatingLocal ? lastUser : leadOfGroup;
          compactedUser.setDistance(representativeRider.getDistance());
          compactedUser.setSpeed(representativeRider.getSpeed());
          compactedUser.setDistanceHistory(representativeRider.getDistanceHistory());
          compacted.push({
            user: compactedUser,
            rank: `#${ixStartOfGroup + 1}`
          });
          compacted.push({
            user: thisUser,
            rank: `#${x + 1}`
          });
          ixStartOfGroup = x + 1;
        }
      } else {
        // last user was not an AI, so they must have been put in the list
        if (thisUser.getUserType() & _User.UserTypeFlags.Ai) {// just continue a run of AIs
        } else {
          // this user is also not an AI, so they gotta go in
          compacted.push({
            user: thisUser,
            rank: `#${x + 1}`
          });
          ixStartOfGroup = x + 1;
        }
      }

      lastUser = thisUser;
    } // if the last user was an AI, then they wouldn't have gotten inserted


    if (lastUser.getUserType() & _User.UserTypeFlags.Ai) {
      const compactedUser = new _User.User("Gr. " + lastUser.getName(), _User.DEFAULT_RIDER_MASS, _User.DEFAULT_HANDICAP_POWER, lastUser.getUserType());
      const leadOfGroup = users[ixStartOfGroup];
      const isBeatingLocal = leadOfGroup.getDistance() > localUser.getDistance();
      const representativeRider = isBeatingLocal ? lastUser : leadOfGroup;
      compactedUser.setDistance(representativeRider.getDistance());
      compactedUser.setSpeed(representativeRider.getSpeed());
      compactedUser.setDistanceHistory(representativeRider.getDistanceHistory());
      compacted.push({
        user: compactedUser,
        rank: `#${ixStartOfGroup + 1}`
      });
    }

    return compacted;
  }

  let LeaderBoard = (_dec = Ember.computed("frame"), (_class = class LeaderBoard extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    raceState: null,
    classNames: ['leader-board__container']
  }) {
    // normal class body definition here
    didInsertElement() {
      (0, _Utils.assert2)(this.get('raceState'));
    }

    get rankings() {
      const tmNow = new Date().getTime();
      const rs = this.get('raceState');

      if (rs) {
        let users = rs.getUserProvider().getUsers(tmNow);

        if (users.length <= 0) {
          return null;
        }

        users = users.sort((u1, u2) => {
          return u1.getDistance() > u2.getDistance() ? -1 : 1;
        }); // let's compact groups of Ais

        let compactedUsers = compactUserList(users);
        let ixUser = 0;
        let localUser = null;

        for (var x = 0; x < compactedUsers.length; x++) {
          if (compactedUsers[x].user.getUserType() & _User.UserTypeFlags.Local) {
            ixUser = x;
            localUser = compactedUsers[x].user;
            break;
          }
        }

        if (!localUser) {
          return [];
        }

        let nToShow = 6;
        let ixStart = Math.max(0, Math.min(compactedUsers.length - nToShow, ixUser - 2));
        let ixEnd = Math.min(ixStart + nToShow, users.length);
        compactedUsers = compactedUsers.slice(ixStart, ixEnd);
        return compactedUsers.map((compacted, index) => {
          const user = compacted.user;
          const display = Object.assign({
            rankString: compacted.rank
          }, compacted.user.getDisplay(rs));

          if (localUser && user.getId() !== localUser.getId()) {
            if (user.getDistance() > localUser.getDistance()) {
              // this rider is ahead of our local hero.
              const secondsAhead = user.getSecondsAgoToCross(tmNow, localUser.getDistance());

              if (secondsAhead !== null && secondsAhead > 1) {
                display.secondsDelta = formatDelta(secondsAhead);
              }
            } else {
              const secondsAhead = localUser.getSecondsAgoToCross(tmNow, user.getDistance());

              if (secondsAhead !== null && secondsAhead > 1) {
                if (secondsAhead < 4) {
                  display.secondsDelta = formatDelta(-secondsAhead);
                } else {
                  // Phil had a good idea: make it harder for the person ahead to judge people behind if they're far behind
                  let chunkified = Math.floor(Math.sqrt(secondsAhead)) + 1;
                  chunkified = Math.pow(chunkified, 2);
                  display.secondsDelta = formatDelta(-Math.ceil(chunkified), true);
                }
              }
            }
          }

          return display;
        });
      } else {
        return [];
      }
    }

  }, (_applyDecoratedDescriptor(_class.prototype, "rankings", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "rankings"), _class.prototype)), _class));
  _exports.default = LeaderBoard;
  ;
});
;define("bt-web2/components/leader-board/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "tcLzLFPT",
    "block": "{\"symbols\":[\"ranking\",\"index\"],\"statements\":[[4,\"each\",[[24,[\"rankings\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\",true],[11,\"class\",[29,[\"leader-board__rank \",[23,1,[\"classString\"]]]]],[8],[0,\"\\n    \"],[7,\"span\",true],[10,\"class\",\"leader-board__rank-text\"],[8],[0,\"\\n      \"],[1,[23,1,[\"rankString\"]],false],[0,\"\\n    \"],[9],[0,\"\\n    \"],[7,\"span\",true],[10,\"class\",\"leader-board__rank-name\"],[8],[0,\"\\n      \"],[1,[23,1,[\"name\"]],false],[0,\"\\n    \"],[9],[0,\"\\n    \"],[7,\"span\",true],[10,\"class\",\"leader-board__rank-delta\"],[8],[0,\"\\n\"],[4,\"if\",[[23,1,[\"secondsDelta\"]]],null,{\"statements\":[[0,\"        \"],[1,[23,1,[\"secondsDelta\"]],false],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"],[9],[0,\"\\n    \"],[7,\"span\",true],[10,\"class\",\"leader-board__rank-distance\"],[8],[0,\"\\n      \"],[1,[23,1,[\"distance\"]],false],[0,\"\\n    \"],[9],[0,\"\\n  \"],[9],[0,\"\\n\"]],\"parameters\":[1,2]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/leader-board/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/main-map/component", ["exports", "bt-web2/tourjs-client-shared/DecorationFactory", "bt-web2/tourjs-shared/DecorationState", "bt-web2/config/environment", "bt-web2/tourjs-client-shared/drawing-constants", "bt-web2/tourjs-shared/drawing-factory", "bt-web2/tourjs-shared/drawing-interface"], function (_exports, _DecorationFactory, _DecorationState, _environment, _drawingConstants, _drawingFactory, _drawingInterface) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class MainMap extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    connection: Ember.inject.service('connection'),
    classNames: ['main-map__container'],
    tagName: 'canvas',
    mode: "2d",
    raceState: null
  }) {
    // normal class body definition here
    didInsertElement() {
      var _canvas$parentElement, _canvas$parentElement2;

      console.log("main-map didInsertElement");
      const canvas = this.element;

      if (!canvas.parentElement) {
        console.log("no canvas for main-map");
        return;
      }

      canvas.width = ((_canvas$parentElement = canvas.parentElement) === null || _canvas$parentElement === void 0 ? void 0 : _canvas$parentElement.clientWidth) * window.devicePixelRatio;
      canvas.height = ((_canvas$parentElement2 = canvas.parentElement) === null || _canvas$parentElement2 === void 0 ? void 0 : _canvas$parentElement2.clientHeight) * window.devicePixelRatio; //canvas.height = canvas.clientHeight;

      const raceState = this.get('raceState');

      if (!raceState) {
        console.log("no race-state for main-map");
        return;
      }

      const decorationFactory = new _DecorationFactory.DecorationFactory(_drawingConstants.defaultThemeConfig);
      const decorationState = new _DecorationState.DecorationState(raceState === null || raceState === void 0 ? void 0 : raceState.getMap(), decorationFactory);
      let lastTime = 0;
      const drawer = (0, _drawingFactory.createDrawer)(this.get('mode'));
      const paintState = new _drawingInterface.PaintFrameState();
      let frame = 0;

      const handleAnimationFrame = time => {
        frame++;

        if (raceState) {
          let dt = 0;

          if (lastTime) {
            dt = (time - lastTime) / 1000.0;
          }

          lastTime = time;
          const tmNow = new Date().getTime();
          raceState.tick(tmNow);
          const frameMod = 1;

          if (frame % frameMod == 0) {
            drawer.doPaintFrameStateUpdates(_environment.default.rootURL, tmNow, dt * frameMod, raceState, paintState);
          }

          drawer.paintCanvasFrame(canvas, raceState, time, decorationState, dt, paintState);

          if (!this.isDestroyed) {
            requestAnimationFrame(handleAnimationFrame);
          }
        } else {
          throw new Error("No race state available?");
        }
      };

      requestAnimationFrame(handleAnimationFrame);
    }

  }

  _exports.default = MainMap;
  ;
});
;define("bt-web2/components/main-map/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "oWcsOHrH",
    "block": "{\"symbols\":[],\"statements\":[],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/main-map/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/mini-map-live/component", ["exports", "bt-web2/tourjs-shared/Utils", "bt-web2/tourjs-shared/User", "bt-web2/tourjs-shared/drawing-factory"], function (_exports, _Utils, _User, _drawingFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class MiniMapLive extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    classNames: ['mini-map-live__container'],
    raceState: null,
    drawer: null
  }) {
    // normal class body definition here
    didInsertElement() {
      (0, _Utils.assert2)(this.get('raceState'));
      this.set('drawer', (0, _drawingFactory.createDrawer)());

      this._doFrame();
    }

    _doFrame() {
      if (this.isDestroying) {
        return;
      }

      const tmNow = new Date().getTime();
      const canvas = this.element.querySelector('canvas');

      if (!canvas) {
        throw new Error("canvas not found");
      }

      const drawer = this.get('drawer');

      if (!drawer) {
        throw new Error("drawer not found");
      }

      const w = this.element.clientWidth;
      const h = this.element.clientHeight;
      canvas.width = w;
      canvas.height = h;
      const elevations = [];
      const raceState = this.get('raceState');

      if (raceState) {
        const map = raceState.getMap();

        for (var pct = 0; pct <= 1.0; pct += 0.01) {
          elevations.push(map.getElevationAtDistance(pct * map.getLength()));
        }

        const aiPositions = [];
        const humanPositions = [];
        let localPosition = 0;
        const users = raceState.getUserProvider().getUsers(tmNow);
        users.forEach(user => {
          const type = user.getUserType();

          if (type & _User.UserTypeFlags.Ai) {
            aiPositions.push(user.getDistance() / map.getLength());
          } else {
            if (type & _User.UserTypeFlags.Local) {
              localPosition = user.getDistance() / map.getLength();
            } else {
              humanPositions.push(user.getDistance() / map.getLength());
            }
          }
        });
        const w = this.element.clientWidth;
        const h = this.element.clientHeight;

        if (!this.isDestroyed) {
          requestAnimationFrame(() => {
            const ctx = canvas.getContext('2d');
            const drawMiniParams = {
              ctx,
              elevations,
              w,
              h,
              minElevSpan: map.getLength() * 0.01,
              localPositionPct: localPosition,
              humanPositions,
              aiPositions
            };
            drawer.drawMinimap(drawMiniParams);
          });
        }
      }

      if (!this.isDestroyed) {
        setTimeout(() => this._doFrame(), 250);
      }
    }

  }

  _exports.default = MiniMapLive;
  ;
});
;define("bt-web2/components/mini-map-live/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "cMzBu7mv",
    "block": "{\"symbols\":[],\"statements\":[[7,\"canvas\",true],[10,\"id\",\"mini-map-live\"],[8],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/mini-map-live/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/mini-map/component", ["exports", "bt-web2/tourjs-shared/drawing-factory"], function (_exports, _drawingFactory) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class MiniMap extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    classNames: ['mini-map__container'],
    race: null,
    _onChangeRace: Ember.observer('race', function () {
      this._redraw();
    })
  }) {
    // normal class body definition here
    _redraw() {
      const race = this.get('race');

      if (!race) {
        throw new Error("you gotta provide your minimap a race!");
      }

      const canvas = document.createElement('canvas');
      const w = this.element.clientWidth;
      const h = this.element.clientHeight;
      canvas.width = w;
      canvas.height = h;
      const elevations = [];
      const len = race.getLength();

      for (var pct = 0; pct <= 1.0; pct += 0.005) {
        elevations.push(race.getElevationAtDistance(pct * len));
      }

      const ctx = canvas.getContext('2d');
      const drawer = (0, _drawingFactory.createDrawer)();
      drawer.drawMinimap({
        ctx,
        elevations,
        w,
        h,
        minElevSpan: race.getLength() * 0.01
      });
      const png = canvas.toDataURL();
      const img = this.element.querySelector('img');

      if (img) {
        img.src = png;
      }
    }

    didInsertElement() {
      // we need to draw a minimap for this guy
      this._redraw();
    }

  }

  _exports.default = MiniMap;
  ;
});
;define("bt-web2/components/mini-map/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "y8Jm4kEB",
    "block": "{\"symbols\":[],\"statements\":[[7,\"img\",true],[10,\"id\",\"mini-map\"],[8],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/mini-map/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/pacing-challenge-overlay/component", ["exports", "bt-web2/tourjs-shared/User"], function (_exports, _User) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _dec, _class;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  let PacingChallengeOverlay = (_dec = Ember.computed("frame"), (_class = class PacingChallengeOverlay extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    classNames: ['pacing-challenge-overlay__container'],
    devices: Ember.inject.service(),
    overlayData: null
  }) {
    // normal class body definition here
    didInsertElement() {}

    get powerData() {
      const tmNow = new Date().getTime();
      const timerData = this.devices.getPowerCounterAverage(tmNow, "pacing-challenge");
      const mySettings = this.get('overlayData');
      const user = this.devices.getLocalUser();

      if (!user) {
        throw new Error("Uh-oh");
      }

      const climbingLeft = mySettings.endOfRideElevation - user.getLastElevation();
      const climbingJoulesLeft = climbingLeft * _User.DEFAULT_GRAVITY * _User.DEFAULT_RIDER_MASS;
      const climbingHandicapSecondsLeft = Math.max(0, climbingJoulesLeft / _User.DEFAULT_HANDICAP_POWER);
      const velocityJoulesLeft = 0.5 * _User.DEFAULT_RIDER_MASS * Math.pow(user.getSpeed(), 2);
      const velocityHandicapSecondsLeft = velocityJoulesLeft / _User.DEFAULT_HANDICAP_POWER;
      const joulesUsed = timerData.joules;
      const handicapSecondsUsed = joulesUsed / user.getHandicap();
      const handicapSecondsLeft = mySettings.handicapSecondsAllowed - handicapSecondsUsed;
      const kmLeft = Math.max(0.001, (mySettings.mapLen - user.getDistance()) / 1000);
      const rawPowerRemaining = handicapSecondsLeft;
      const powerRemaining = Math.min(rawPowerRemaining, handicapSecondsLeft - climbingHandicapSecondsLeft + velocityHandicapSecondsLeft);
      return {
        powerRemaining: powerRemaining.toFixed(0),
        powerRemainingPerKm: (powerRemaining / kmLeft).toFixed(0),
        rawPowerRemaining: rawPowerRemaining.toFixed(0),
        rawPowerRemainingPerKm: (rawPowerRemaining / kmLeft).toFixed(0),
        powerUsed: handicapSecondsUsed.toFixed(),
        powerUsedPerKm: (handicapSecondsUsed / (user.getDistance() / 1000)).toFixed(1)
      };
    }

  }, (_applyDecoratedDescriptor(_class.prototype, "powerData", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "powerData"), _class.prototype)), _class));
  _exports.default = PacingChallengeOverlay;
  ;
});
;define("bt-web2/components/pacing-challenge-overlay/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "wNSd9/Ho",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"pacing-challenge-overlay__row header\"],[8],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__label header\"],[8],[0,\"Dashboard\"],[9],[0,\" \\n  \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__data header\"],[8],[0,\"Amount\"],[9],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__data header\"],[8],[0,\"Per Km\"],[9],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"pacing-challenge-overlay__row\"],[8],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__label\"],[8],[0,\"Energy Left:\"],[9],[0,\" \\n\"],[4,\"if\",[[24,[\"overlayData\",\"usedAllPower\"]]],null,{\"statements\":[[0,\"    \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__data\"],[8],[0,\"COASTING\"],[9],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"    \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__data\"],[8],[1,[24,[\"powerData\",\"powerRemaining\"]],false],[9],[0,\"\\n    \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__data\"],[8],[1,[24,[\"powerData\",\"powerRemainingPerKm\"]],false],[9],[0,\"\\n\"]],\"parameters\":[]}],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"pacing-challenge-overlay__row\"],[8],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__label\"],[8],[0,\"Raw Left\"],[9],[0,\" \\n\"],[4,\"if\",[[24,[\"overlayData\",\"usedAllPower\"]]],null,{\"statements\":[[0,\"    \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__data\"],[8],[0,\"COASTING\"],[9],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"    \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__data\"],[8],[1,[24,[\"powerData\",\"rawPowerRemaining\"]],false],[9],[0,\"\\n    \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__data\"],[8],[1,[24,[\"powerData\",\"rawPowerRemainingPerKm\"]],false],[9],[0,\"\\n\"]],\"parameters\":[]}],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"pacing-challenge-overlay__row\"],[8],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__label\"],[8],[0,\"Used:\"],[9],[0,\" \\n  \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__data\"],[8],[1,[24,[\"powerData\",\"powerUsed\"]],false],[9],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pacing-challenge-overlay__data\"],[8],[1,[24,[\"powerData\",\"powerUsedPerKm\"]],false],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/pacing-challenge-overlay/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/pending-race/component", ["exports", "bt-web2/tourjs-shared/Utils", "bt-web2/tourjs-shared/communication"], function (_exports, _Utils, _communication) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  let PendingRace = (_dec = Ember.computed("race"), _dec2 = Ember.computed("race"), _dec3 = Ember.computed("race"), _dec4 = Ember.computed("race", "frame"), _dec5 = Ember.computed("race"), _dec6 = Ember.computed("race", "frame"), (_class = class PendingRace extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    classNames: ['pending-race__content'],
    classNameBindings: ['hasHumans'],
    race: null
  }) {
    // normal class body definition here
    didInsertElement() {
      (0, _Utils.assert2)(this.joinRace);
    }

    get hasHumans() {
      const race = this.get('race');

      if (race) {
        return race.whoIn.length > 0;
      } else {
        return false;
      }
    }

    get raceTime() {
      const race = this.get('race');

      if (race) {
        return new Date(race.tmScheduledStart).toLocaleString();
      } else {
        return "Unknown";
      }
    }

    get hasWhen() {
      const race = this.get('race');

      if (race) {
        return !!(race.tmActualStart > 0 || race.tmScheduledStart > 0);
      } else {
        return false;
      }
    }

    get lengthString() {
      const race = this.get('race');

      if (race) {
        return `${(race.lengthMeters / 1000).toFixed(1)}km`;
      } else {
        return "Unknown";
      }
    }

    get raceElevations() {
      const race = this.get('race');

      if (race) {
        return new _communication.SimpleElevationMap(race.elevations, race.lengthMeters);
      } else {
        return null;
      }
    }

    get statusString() {
      const race = this.get('race');

      if (!race) {
        return "Unknown";
      }

      const frame = this.get('frame');

      switch (race.status) {
        case _communication.CurrentRaceState.PostRace:
          return "Finished!";

        case _communication.CurrentRaceState.PreRace:
          {
            if (race.tmScheduledStart <= 0) {
              return "Will start when players join";
            }

            const msToStart = race.tmScheduledStart - new Date().getTime();

            if (msToStart > 0) {
              return `Starting in ${(0, _Utils.formatSecondsHms)(msToStart / 1000)}`;
            } else {
              return `Started ${(0, _Utils.formatSecondsHms)(-msToStart / 1000)} ago`;
            }
          }

        case _communication.CurrentRaceState.Racing:
          {
            const msToStart = race.tmActualStart - new Date().getTime();

            if (msToStart > 0) {
              return `Starting in ${(0, _Utils.formatSecondsHms)(msToStart / 1000)}`;
            } else {
              return `Started ${(0, _Utils.formatSecondsHms)(-msToStart / 1000)} ago`;
            }
          }
      }
    }

  }, (_applyDecoratedDescriptor(_class.prototype, "hasHumans", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "hasHumans"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "raceTime", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "raceTime"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "hasWhen", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "hasWhen"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "lengthString", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "lengthString"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "raceElevations", [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, "raceElevations"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "statusString", [_dec6], Object.getOwnPropertyDescriptor(_class.prototype, "statusString"), _class.prototype)), _class));
  _exports.default = PendingRace;
  ;
});
;define("bt-web2/components/pending-race/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "WImZ2gHm",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"pending-race__row\"],[8],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pending-race__key\"],[8],[0,\"\\n    What:\\n  \"],[9],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pending-race__value\"],[8],[0,\"\\n    \"],[1,[24,[\"race\",\"displayName\"]],false],[0,\"\\n  \"],[9],[0,\"\\n\"],[9],[0,\"\\n\\n\"],[4,\"if\",[[24,[\"hasWhen\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\",true],[10,\"class\",\"pending-race__row\"],[8],[0,\"\\n    \"],[7,\"span\",true],[10,\"class\",\"pending-race__key\"],[8],[0,\"\\n      When:\\n    \"],[9],[0,\"\\n    \"],[7,\"span\",true],[10,\"class\",\"pending-race__value\"],[8],[0,\"\\n      \"],[1,[22,\"raceTime\"],false],[0,\"\\n    \"],[9],[0,\"\\n  \"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[7,\"div\",true],[10,\"class\",\"pending-race__row\"],[8],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pending-race__key\"],[8],[0,\"\\n    Current Riders:\\n  \"],[9],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pending-race__value\"],[8],[0,\"\\n    \"],[1,[24,[\"race\",\"whoIn\",\"length\"]],false],[0,\" humans, \"],[1,[24,[\"race\",\"whoInAi\",\"length\"]],false],[0,\" AI\\n  \"],[9],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"pending-race__row\"],[8],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pending-race__key\"],[8],[0,\"\\n    Status:\\n  \"],[9],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pending-race__value\"],[8],[0,\"\\n    \"],[1,[22,\"statusString\"],false],[0,\"\\n  \"],[9],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"pending-race__row\"],[8],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pending-race__key\"],[8],[0,\"\\n    Length:\\n  \"],[9],[0,\"\\n  \"],[7,\"span\",true],[10,\"class\",\"pending-race__value\"],[8],[0,\"\\n    \"],[1,[22,\"lengthString\"],false],[0,\"\\n  \"],[9],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"pending-race__row\"],[8],[0,\"\\n  \"],[1,[28,\"mini-map\",null,[[\"race\"],[[24,[\"raceElevations\"]]]]],false],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"a\",false],[12,\"class\",\"pending-race__join-button\"],[12,\"href\",[29,[[24,[\"race\",\"url\"]]]]],[3,\"action\",[[23,0,[]],[24,[\"joinRace\"]],[24,[\"race\",\"gameId\"]]]],[8],[0,\"Join\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/pending-race/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/stored-data/component", ["exports", "bt-web2/tourjs-shared/Utils", "bt-web2/services/devices", "bt-web2/set-up-ride/route", "ember-md5", "bt-web2/components/user-set-up-widget/component"], function (_exports, _Utils, _devices, _route, _emberMd, _component) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class StoredData extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service(),
    classNames: ['stored-data__content'],
    hasData: false,
    triedToGetData: false,
    userHasImageSet: false,
    imageUpdateCount: 0,
    override: '',
    yourImage: '',
    riders: [],
    yourmd5: Ember.computed('yourImage', 'override', function () {
      console.log("your md5");

      if (this.get('override')) {
        return this.get('override');
      } else {
        const user = this.devices.getLocalUser();

        if (user && user.getBigImageMd5()) {
          return user.getBigImageMd5();
        } else {
          const imgBase64 = this.get('yourImage');
          const md5Result = (0, _emberMd.default)(imgBase64);
          return md5Result;
        }
      }
    }),
    observeImage: Ember.observer('devices.ridersVersion', function () {
      const localUser = this.devices.getLocalUser();

      if (localUser) {
        const imgBase64 = window.localStorage.getItem(_component.USERSETUP_KEY_IMAGE);
        this.set('userHasImageSet', !!imgBase64);

        if (imgBase64) {
          this.set('yourImage', imgBase64);
        }
      }
    }),
    observeMd5: Ember.observer('yourmd5', function () {
      const md5Result = this.get('yourmd5');
      const arg = {
        imageMd5: md5Result
      };
      this.incrementProperty('imageUpdateCount');
      const myReqNumber = this.get('imageUpdateCount');
      (0, _route.apiGet)('user-ride-results', arg).then(rideResults => {
        if (this.isDestroyed) {
          return;
        }

        this.set('triedToGetData', true);

        if (myReqNumber === this.get('imageUpdateCount')) {
          // ok, there hasn't been a new request since we spawned this one
          const riders = [];

          for (var key in rideResults) {
            riders.push({
              name: key,
              rides: rideResults[key]
            });
          }

          this.set('hasData', riders.length > 0);
          this.set('riders', riders);
        }
      }).finally(() => {
        if (this.isDestroyed) return;
        this.set('triedToGetData', true);
      });
    }),
    actions: {
      downloadRide(targetRide) {
        (0, _Utils.assert2)(targetRide.samples.length === 0, "we're expecting the parameter here to be a basic ride.  we need to ask the server for the whole thing");
        const yourMd5 = this.get('yourmd5');
        const md5Result = this.get('override') || yourMd5;
        const arg = {
          tmStart: targetRide.tmStart,
          riderName: targetRide.riderName,
          imageMd5: md5Result
        };
        return (0, _route.apiGet)('user-ride-result', arg).then(fullResult => {
          (0, _Utils.assert2)(fullResult.samples.length > 0, "the one we fetch specifically should have full samples");
          (0, _Utils.assert2)(fullResult.tmStart === targetRide.tmStart && fullResult.rideName === targetRide.rideName);
          (0, _devices.dumpRaceResultToPWX)(fullResult);
        });
      },

      downloadImg() {
        const user = this.devices.getLocalUser();

        if (user) {
          const img = this.get('yourImage');
          var data = new Blob([img], {
            type: 'application/octet-stream'
          });
          var url = window.URL.createObjectURL(data);
          const linky = document.createElement('a');
          linky.href = img;
          linky.download = `${user.getName()}-security-image.png`;
          linky.target = "_blank";
          document.body.appendChild(linky);
          linky.click();
          document.body.removeChild(linky);
        }
      }

    }
  }) {
    // normal class body definition here
    didInsertElement() {
      this.observeImage();
      this.observeMd5();
    }

  }

  _exports.default = StoredData;
  ;
});
;define("bt-web2/components/stored-data/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "vULZVLIa",
    "block": "{\"symbols\":[\"rider\",\"ride\"],\"statements\":[[7,\"h3\",true],[10,\"class\",\"stored-data__title\"],[8],[0,\"Stored Data\"],[9],[0,\"\\n\"],[7,\"p\",true],[10,\"class\",\"stored-data__subtitle\"],[8],[1,[22,\"yourmd5\"],false],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"hasData\"]]],null,{\"statements\":[[4,\"each\",[[24,[\"riders\"]]],null,{\"statements\":[[0,\"    \"],[7,\"hr\",true],[8],[9],[0,\"\\n    \"],[7,\"h5\",true],[10,\"class\",\"stored-data__title\"],[8],[1,[23,1,[\"name\"]],false],[9],[0,\"\\n    \"],[7,\"ul\",true],[8],[0,\"\\n    \"],[1,[28,\"log\",[\"rider \",[23,1,[]]],null],false],[0,\"\\n\"],[4,\"each\",[[23,1,[\"rides\",\"results\"]]],null,{\"statements\":[[0,\"      \"],[7,\"li\",true],[8],[0,\"\\n        \"],[7,\"a\",false],[12,\"class\",\"stored-data__link\"],[12,\"href\",\"#\"],[3,\"action\",[[23,0,[]],\"downloadRide\",[23,2,[]]]],[8],[1,[23,2,[\"rideName\"]],false],[9],[0,\"\\n      \"],[9],[0,\"\\n\"]],\"parameters\":[2]},null],[0,\"    \"],[9],[0,\"\\n\"]],\"parameters\":[1]},null]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[24,[\"triedToGetData\"]]],null,{\"statements\":[[0,\"    \"],[7,\"p\",true],[10,\"class\",\"stored-data__p\"],[8],[0,\"Tour.js could not locate data for your current image\"],[9],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[24,[\"userHasImageSet\"]]],null,{\"statements\":[[0,\"      \"],[7,\"p\",true],[10,\"class\",\"stored-data__p\"],[8],[0,\"Loading...\"],[9],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[7,\"p\",true],[10,\"class\",\"stored-data__p\"],[8],[0,\"You don't have a rider image set.\"],[9],[0,\"\\n\"]],\"parameters\":[]}],[0,\"    \\n\"]],\"parameters\":[]}]],\"parameters\":[]}],[7,\"p\",true],[10,\"class\",\"stored-data__p\"],[8],[0,\"Tour.js kinda-sorta secures your data by requiring you to have an image set.  The exact pixels of your image allow you to access your specific data uniquely.\"],[9],[0,\"\\n\"],[7,\"p\",true],[10,\"class\",\"stored-data__p\"],[8],[0,\"Tip: Tour.js is a for-fun project with zero effort applied to security.  If you're sensitive about your data, I recommend not setting an image, which will result in data not getting saved.\"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"yourImage\"]]],null,{\"statements\":[[0,\"  \"],[7,\"p\",true],[10,\"class\",\"stored-data__p\"],[8],[0,\"Click \"],[7,\"a\",false],[12,\"href\",\"#\"],[3,\"action\",[[23,0,[]],\"downloadImg\"]],[8],[0,\"here\"],[9],[0,\" to download your image if you want to set up other devices to save/load as that user.  Just use that image as your user image on the other device.\"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[4,\"if\",[[24,[\"yourmd5\"]]],null,{\"statements\":[[0,\"  \"],[7,\"p\",true],[10,\"class\",\"stored-data__p\"],[8],[0,\"You can always view your results with \"],[7,\"a\",true],[11,\"href\",[29,[\"https://tourjs.ca/results?md5=\",[22,\"yourmd5\"]]]],[8],[0,\"this link\"],[9],[0,\".  You can share that link to other devices as well.\"],[9],[0,\"\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/stored-data/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/tourjs-header/component", ["exports", "bt-web2/pojs/DeviceFactory", "bt-web2/services/devices"], function (_exports, _DeviceFactory, _devices) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class TourjsHeader extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    classNames: ['tourjs-header__container'],
    devices: Ember.inject.service('devices'),
    connection: Ember.inject.service('connection'),
    frame: 0,
    frameInterval: null,
    you: Ember.computed('devices.ridersVersion', function () {
      const user = this.devices.getLocalUser();
      return user;
    }),
    yourName: Ember.computed('you', function () {
      const user = this.get('you');

      if (user) {
        return user.getName();
      } else {
        return 'Unset';
      }
    }),
    yourFtp: Ember.computed('you', function () {
      const user = this.get('you');

      if (user) {
        return user.getHandicap().toFixed(1) + 'W';
      } else {
        return 'Unset';
      }
    }),
    hasPower: Ember.computed('devices.ridersVersion', function () {
      return !!this.devices.getPowerDevice();
    }),
    hasHrm: Ember.computed('devices.ridersVersion', function () {
      return !!this.devices.getHrmDevice();
    }),
    lastPower: Ember.computed('frame', 'you', function () {
      const you = this.get('you');
      return you && you.getLastPower().toFixed(0) + 'W' || '---W';
    }),
    lastHrm: Ember.computed('frame', 'you', function () {
      const you = this.get('you');
      const hrm = you && you.getLastHrm(new Date().getTime()).toFixed(0) + 'bpm' || '';
      return hrm;
    }),
    actions: {
      connectHrm() {
        (0, _DeviceFactory.getDeviceFactory)().findHrm().then(device => {
          this.devices.setLocalUserDevice(device, _devices.DeviceFlags.Hrm);
        });
      },

      connectPower() {
        (0, _DeviceFactory.getDeviceFactory)().findPowermeter(false).then(device => {
          this.devices.setLocalUserDevice(device, _devices.DeviceFlags.AllButHrm);
        });
      }

    }
  }) {
    // normal class body definition here
    didInsertElement() {
      this.set('frameInterval', setInterval(() => {
        this.incrementProperty('frame');
      }, 1000));
    }

    willDestroyElement() {
      clearInterval(this.get('frameInterval'));
    }

  }

  _exports.default = TourjsHeader;
  ;
});
;define("bt-web2/components/tourjs-header/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "YxkSiSFi",
    "block": "{\"symbols\":[],\"statements\":[[4,\"link-to\",null,[[\"class\",\"route\"],[\"tourjs-header__title\",\"index\"]],{\"statements\":[[0,\"Tour.js\"]],\"parameters\":[]},null],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead\"],[8],[0,\"\\n\\n\\n  \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item-label\"],[8],[4,\"link-to\",null,[[\"route\"],[\"set-up-user\"]],{\"statements\":[[0,\"Name\"]],\"parameters\":[]},null],[0,\":\"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item-value\"],[8],[1,[22,\"yourName\"],false],[9],[0,\"\\n  \"],[9],[0,\"\\n\\n\\n  \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item-label\"],[8],[4,\"link-to\",null,[[\"route\"],[\"set-up-user\"]],{\"statements\":[[0,\"FTP\"]],\"parameters\":[]},null],[0,\":\"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item-value\"],[8],[1,[22,\"yourFtp\"],false],[9],[0,\"\\n  \"],[9],[0,\"\\n\\n\\n\"],[4,\"if\",[[24,[\"hasHrm\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item\"],[8],[0,\"\\n      \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item-label\"],[8],[7,\"a\",false],[12,\"href\",\"#\"],[3,\"action\",[[23,0,[]],\"connectHrm\"]],[8],[0,\"BPM:\"],[9],[9],[0,\"\\n      \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item-value\"],[8],[1,[22,\"lastHrm\"],false],[9],[0,\"\\n    \"],[9],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"    \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item\"],[8],[0,\"\\n      \"],[7,\"button\",false],[3,\"action\",[[23,0,[]],\"connectHrm\"]],[8],[0,\"Connect\"],[7,\"br\",true],[8],[9],[0,\"HRM\"],[9],[0,\"\\n    \"],[9],[0,\"\\n\"]],\"parameters\":[]}],[4,\"if\",[[24,[\"devices\",\"kickrConnected\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item\"],[8],[0,\"\\n      \"],[4,\"link-to\",null,[[\"route\"],[\"kickr-setup\"]],{\"statements\":[[0,\"Kickr Setup\"]],\"parameters\":[]},null],[0,\"\\n    \"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"\\n\\n\"],[4,\"if\",[[24,[\"hasPower\"]]],null,{\"statements\":[[0,\"    \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item\"],[8],[0,\"\\n      \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item-label\"],[8],[7,\"a\",false],[12,\"href\",\"#\"],[3,\"action\",[[23,0,[]],\"connectPower\"]],[8],[0,\"Power\"],[9],[9],[0,\"\\n      \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item-value\"],[8],[1,[22,\"lastPower\"],false],[9],[0,\"\\n    \"],[9],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"    \"],[7,\"div\",true],[10,\"class\",\"tourjs-header__subhead--item\"],[8],[0,\"\\n      \"],[7,\"button\",false],[3,\"action\",[[23,0,[]],\"connectPower\"]],[8],[0,\"Connect\"],[7,\"br\",true],[8],[9],[0,\"Power\"],[9],[0,\"\\n    \"],[9],[0,\"\\n\"]],\"parameters\":[]}],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/tourjs-header/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/user-dashboard/component", ["exports", "bt-web2/tourjs-shared/Utils"], function (_exports, _Utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _dec, _class;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  let UserDashboard = (_dec = Ember.computed("frame", "user"), (_class = class UserDashboard extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    user: null,
    frame: null,
    raceState: null,
    classNames: ['user-dashboard__container']
  }) {
    // normal class body definition here
    didInsertElement() {
      (0, _Utils.assert2)(this.get('raceState'));
      (0, _Utils.assert2)(this.get('frame') !== undefined);
      const rs = this.get('raceState');

      if (rs) {
        const user = rs.getLocalUser();

        if (user) {
          this.set('user', user);
        } else {
          throw new Error("Can't have a dashboard for a user that doesn't exist!");
        }
      } else {
        throw new Error("Can't have a dashboard when there's no race!");
      }
    }

    get userDisplay() {
      const rs = this.get('raceState');

      if (rs) {
        const user = rs.getLocalUser();

        if (user) {
          const ret = user.getDisplay(rs);
          return ret;
        }
      }

      return null;
    }

  }, (_applyDecoratedDescriptor(_class.prototype, "userDisplay", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "userDisplay"), _class.prototype)), _class));
  _exports.default = UserDashboard;
  ;
});
;define("bt-web2/components/user-dashboard/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "BSIkza/m",
    "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[24,[\"userDisplay\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\",true],[10,\"class\",\"user-dashboard__table\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"user-dashboard__tr\"],[8],[0,\"\\n      \"],[7,\"div\",true],[10,\"class\",\"user-dashboard__group\"],[8],[0,\"\\n        \"],[7,\"span\",true],[10,\"class\",\"user-dashboard__label\"],[8],[7,\"i\",true],[10,\"class\",\"fas fa-bolt\"],[8],[9],[9],[0,\"\\n        \"],[7,\"span\",true],[10,\"class\",\"user-dashboard__value\"],[8],[1,[24,[\"userDisplay\",\"lastPower\"]],false],[9],[0,\"\\n      \"],[9],[0,\"\\n      \"],[7,\"div\",true],[10,\"class\",\"user-dashboard__group\"],[8],[0,\"\\n        \"],[7,\"span\",true],[10,\"class\",\"user-dashboard__label\"],[8],[7,\"i\",true],[10,\"class\",\"fas fa-tachometer-alt\"],[8],[9],[9],[0,\"\\n        \"],[7,\"span\",true],[10,\"class\",\"user-dashboard__value\"],[8],[1,[24,[\"userDisplay\",\"speed\"]],false],[9],[0,\"\\n      \"],[9],[0,\"\\n      \"],[7,\"div\",true],[10,\"class\",\"user-dashboard__group\"],[8],[0,\"\\n        \"],[7,\"span\",true],[10,\"class\",\"user-dashboard__label\"],[8],[7,\"i\",true],[10,\"class\",\"fas fa-mountain\"],[8],[9],[9],[0,\"\\n        \"],[7,\"span\",true],[10,\"class\",\"user-dashboard__value\"],[8],[1,[24,[\"userDisplay\",\"slope\"]],false],[9],[0,\"\\n      \"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"userDisplay\",\"hrm\"]]],null,{\"statements\":[[0,\"        \"],[7,\"div\",true],[10,\"class\",\"user-dashboard__group\"],[8],[0,\"\\n          \"],[7,\"span\",true],[10,\"class\",\"user-dashboard__label\"],[8],[7,\"i\",true],[10,\"class\",\"fa fa-heart\"],[10,\"aria-hidden\",\"true\"],[8],[9],[9],[0,\"\\n          \"],[7,\"span\",true],[10,\"class\",\"user-dashboard__value\"],[8],[1,[24,[\"userDisplay\",\"hrm\"]],false],[9],[0,\"\\n        \"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"    \"],[9],[0,\"\\n  \"],[9],[0,\"\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/user-dashboard/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/user-set-up-widget/component", ["exports", "ember-md5"], function (_exports, _emberMd) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.resizeImage = resizeImage;
  _exports.storeFromVirginImage = storeFromVirginImage;
  _exports.default = _exports.USERSETUP_PAST_USERS = _exports.USERSETUP_KEY_HANDICAP = _exports.USERSETUP_KEY_NAME = _exports.USERSETUP_KEY_IMAGE = void 0;

  var _dec, _class;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  const USERSETUP_KEY_IMAGE = "user-set-up:lastImage";
  _exports.USERSETUP_KEY_IMAGE = USERSETUP_KEY_IMAGE;
  const USERSETUP_KEY_NAME = "user-set-up:lastName";
  _exports.USERSETUP_KEY_NAME = USERSETUP_KEY_NAME;
  const USERSETUP_KEY_HANDICAP = "user-set-up:lastHandicap";
  _exports.USERSETUP_KEY_HANDICAP = USERSETUP_KEY_HANDICAP;
  const USERSETUP_PAST_USERS = "user-set-up:past-users";
  _exports.USERSETUP_PAST_USERS = USERSETUP_PAST_USERS;

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    // Loop through the FileList and render image files as thumbnails.

    for (var i = 0, f; f = files[i]; i++) {
      // Only process image files.
      if (!f.type.match('image.*')) {
        continue;
      }

      var reader = new FileReader(); // Closure to capture the file information.

      reader.onload = (theFile => {
        return e => {
          // Render thumbnail.
          const b64 = e.target.result;
          let appropriateSizeImagePromise = Promise.resolve(b64);

          if (b64.length > 4 * 1024 * 1024) {
            // this image is too damn big
            console.log("image from camera is too large " + (b64.length / 1024).toFixed(0) + "kb, need to downsize");
            appropriateSizeImagePromise = resizeImage(b64, 1024, 1024);
          } else {// this image is fine
          }

          return appropriateSizeImagePromise.then(b64Smaller => {
            this.setImage(b64Smaller, false);
          });
        };
      })(f); // Read in the image file as a data URL.


      reader.readAsDataURL(f);
    }
  }

  function resizeImage(originalBase64, maxWidth, maxHeight) {
    return new Promise(resolve => {
      var img = new Image();

      img.onload = function () {
        const aspect = img.width / img.height;
        let desiredHeight = 64;
        let desiredWidth = desiredHeight * aspect;

        if (aspect > 1) {
          // wider than high
          desiredWidth = maxWidth;
          desiredHeight = maxWidth / aspect;
        } else {
          desiredHeight = maxHeight;
          desiredWidth = maxHeight * aspect;
        }

        var canvas = document.createElement('canvas');
        canvas.width = desiredWidth;
        canvas.height = desiredHeight;
        canvas.style.width = desiredWidth + 'px';
        canvas.style.height = desiredHeight + 'px';
        canvas.style.position = 'fixed';
        canvas.style.left = '-10000px';
        canvas.style.top = '0px';
        canvas.style.zIndex = '10000';
        canvas.style.border = "1px solid black";
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, desiredWidth, desiredHeight);
          var newDataUri = canvas.toDataURL('image/jpeg', 0.75);
          document.body.removeChild(canvas);
          resolve(newDataUri);
        }
      };

      img.src = originalBase64;
    });
  }

  function storeFromVirginImage(base64, recursed, displayImage) {
    if (!recursed) {
      console.log("setting ", base64.substr(0, 100), " with length ", base64.length, "and md5 ", (0, _emberMd.default)(base64), " to localstorage");
      localStorage.setItem(USERSETUP_KEY_IMAGE, base64);
    }

    const img = document.createElement('img');
    return new Promise((resolve, reject) => {
      img.onload = () => {
        // ok, we've got the image
        if (img.width <= 256 && img.height <= 256) {
          // this image is fine!
          if (displayImage) {
            displayImage.src = base64;
          } else {// lol what
          }

          return resolve(base64);
        } else {
          // we need to resize this sucker
          return resizeImage(base64, 256, 256).then(resizedBase64 => {
            return storeFromVirginImage(resizedBase64, true, displayImage);
          }).then(resolve, reject);
        }
      };

      img.src = base64;
    });
  }

  let UserSetUp = (_dec = Ember.computed("userName", "userHandicap"), (_class = class UserSetUp extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service('devices'),
    userName: 'Art',
    userHandicap: '300',
    canDoBluetooth: true,
    onDone: param => {},
    actions: {
      useOldUser(user) {
        console.log("useOldUser ", user);
        this.set('userName', user.name);
        this.set('userHandicap', user.handicap);
        const displayImage = this.element.querySelector('.user-set-up__image');

        if (displayImage) {
          displayImage.src = user.imageBase64;
          window.localStorage.setItem(USERSETUP_KEY_IMAGE, user.imageBase64);
        }
      },

      done() {
        const displayImage = this.element.querySelector('.user-set-up__image');
        const bigImageBase64 = localStorage.getItem(USERSETUP_KEY_IMAGE);
        let imageBase64 = null;

        if (displayImage) {
          imageBase64 = displayImage.src;
        }

        localStorage.setItem(USERSETUP_KEY_HANDICAP, '' + this.userHandicap);
        localStorage.setItem(USERSETUP_KEY_NAME, '' + this.userName);
        const user = {
          name: this.userName,
          handicap: parseFloat(this.userHandicap),
          imageBase64: imageBase64,
          bigImageMd5: (0, _emberMd.default)(bigImageBase64)
        };
        const oldUsers = this.get('pastUsers');
        oldUsers[user.name] = user;
        window.localStorage.setItem(USERSETUP_PAST_USERS, JSON.stringify(oldUsers));
        this.onDone(user);
      }

    },
    pastUsers: Ember.computed(function () {
      try {
        const data = window.localStorage.getItem(USERSETUP_PAST_USERS);

        if (!data) {
          return null;
        }

        const users = JSON.parse(data);
        return users; // this will be a hash from names to user objects (things that we would pass to onDone())
      } catch (e) {
        return null;
      }
    })
  }) {
    didInsertElement() {
      window.assert2(this.onDone);
      const lastImage = window.localStorage.getItem(USERSETUP_KEY_IMAGE);

      if (lastImage) {
        this.setImage(lastImage);
      }

      const lastName = window.localStorage.getItem(USERSETUP_KEY_NAME);

      if (lastName) {
        this.set('userName', lastName);
      }

      const lastHandicap = '' + window.localStorage.getItem(USERSETUP_KEY_HANDICAP);

      if (lastHandicap && isFinite(parseFloat(lastHandicap))) {
        this.set('userHandicap', lastHandicap);
      }

      const files = this.element.querySelector('input[type="file"]');

      if (files) {
        files.addEventListener('change', handleFileSelect.bind(this), false);
      }
    }

    setImage(base64) {
      const displayImage = this.element.querySelector('.user-set-up__image');
      storeFromVirginImage(base64, false, displayImage);
    } // normal class body definition here


    get disableDone() {
      return !this.get('userName') || !this.get('userHandicap');
    }

  }, (_applyDecoratedDescriptor(_class.prototype, "disableDone", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "disableDone"), _class.prototype)), _class));
  _exports.default = UserSetUp;
  ;
});
;define("bt-web2/components/user-set-up-widget/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "obske3Xq",
    "block": "{\"symbols\":[\"user\",\"name\"],\"statements\":[[7,\"div\",true],[10,\"class\",\"user-set-up__content\"],[8],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"user-set-up__title\"],[8],[0,\"\\n    Set Up Your User\\n  \"],[9],[0,\"\\n\"],[4,\"if\",[[24,[\"pastUsers\"]]],null,{\"statements\":[[0,\"    \"],[7,\"h3\",true],[8],[0,\"This PC has had other users in the past\"],[9],[0,\"\\n    \"],[1,[28,\"log\",[\"past users\",[24,[\"pastUsers\"]]],null],false],[0,\"\\n\"],[4,\"each\",[[28,\"-each-in\",[[24,[\"pastUsers\"]]],null]],null,{\"statements\":[[0,\"      \"],[7,\"button\",false],[3,\"action\",[[23,0,[]],\"useOldUser\",[23,1,[]]]],[8],[1,[23,2,[]],false],[9],[0,\"\\n\"]],\"parameters\":[1,2]},null]],\"parameters\":[]},null],[0,\"  \"],[7,\"div\",true],[10,\"class\",\"user-set-up__element\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"user-set-up__label\"],[8],[0,\"Your Name\"],[9],[0,\"\\n    \"],[1,[28,\"input\",null,[[\"value\",\"placeholder\",\"class\"],[[24,[\"userName\"]],\"Your Name\",\"user-set-up__input\"]]],false],[0,\"\\n  \"],[9],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"user-set-up__element\"],[8],[0,\"\\n    \"],[7,\"label\",true],[10,\"for\",\"user-picture\"],[10,\"class\",\"user-set-up__label\"],[8],[0,\"Your Picture (click to add)\\n      \"],[7,\"div\",true],[10,\"class\",\"user-set-up__imagefile\"],[8],[0,\"\\n        \"],[7,\"img\",true],[10,\"class\",\"user-set-up__image\"],[8],[9],[0,\"\\n        \"],[7,\"input\",true],[10,\"id\",\"user-picture\"],[10,\"accept\",\"image/*\"],[10,\"class\",\"user-set-up__file\"],[10,\"style\",\"display:none;\"],[10,\"type\",\"file\"],[8],[9],[0,\"\\n      \"],[9],[0,\"\\n    \"],[9],[0,\"\\n  \"],[9],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"user-set-up__element\"],[8],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"user-set-up__label\"],[8],[0,\"Your Handicap / FTP\"],[9],[0,\"\\n    \"],[1,[28,\"input\",null,[[\"value\",\"placeholder\",\"class\"],[[24,[\"userHandicap\"]],\"Your Handicap or FTP\",\"user-set-up__input\"]]],false],[0,\"\\n  \"],[9],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"user-set-up__element\"],[8],[0,\"\\n    \"],[7,\"button\",false],[12,\"class\",\"user-set-up__button\"],[12,\"disabled\",[22,\"disableDone\"]],[3,\"action\",[[23,0,[]],\"done\"]],[8],[0,\"Done\"],[9],[0,\"\\n  \"],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/user-set-up-widget/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/vertical-align/component", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class VerticalAlign extends Ember.Component.extend({
    // anything which *must* be merged to prototype here
    classNames: ['vertical-align__container']
  }) {// normal class body definition here
  }

  _exports.default = VerticalAlign;
  ;
});
;define("bt-web2/components/vertical-align/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "aOFpNMud",
    "block": "{\"symbols\":[\"&default\"],\"statements\":[[7,\"div\",true],[10,\"class\",\"vgap\"],[8],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"vgap-content\"],[8],[0,\"\\n  \"],[14,1],[0,\"\\n\"],[9],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"vgap\"],[8],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/components/vertical-align/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/components/welcome-page", ["exports", "ember-welcome-page/components/welcome-page"], function (_exports, _welcomePage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _welcomePage.default;
    }
  });
});
;define("bt-web2/config/environment.d", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = config;
  /**
   * Type declarations for
   *    import config from './config/environment'
   *
   * For now these need to be managed by the developer
   * since different ember addons can materialize new entries.
   */

  _exports.default = _default;
});
;define("bt-web2/formats", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    time: {
      hhmmss: {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    },
    date: {
      hhmmss: {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      }
    },
    number: {
      EUR: {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      USD: {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    }
  };
  _exports.default = _default;
});
;define("bt-web2/helpers/add", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.add = add;
  _exports.default = void 0;

  function add(params)
  /*, hash*/
  {
    return params[0] + params[1];
  }

  var _default = Ember.Helper.helper(add);

  _exports.default = _default;
});
;define("bt-web2/helpers/and", ["exports", "ember-truth-helpers/helpers/and"], function (_exports, _and) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _and.default;
    }
  });
  Object.defineProperty(_exports, "and", {
    enumerable: true,
    get: function () {
      return _and.and;
    }
  });
});
;define("bt-web2/helpers/app-version", ["exports", "bt-web2/config/environment", "ember-cli-app-version/utils/regexp"], function (_exports, _environment, _regexp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.appVersion = appVersion;
  _exports.default = void 0;

  function appVersion(_, hash = {}) {
    const version = _environment.default.APP.version; // e.g. 1.0.0-alpha.1+4jds75hf
    // Allow use of 'hideSha' and 'hideVersion' For backwards compatibility

    let versionOnly = hash.versionOnly || hash.hideSha;
    let shaOnly = hash.shaOnly || hash.hideVersion;
    let match = null;

    if (versionOnly) {
      if (hash.showExtended) {
        match = version.match(_regexp.versionExtendedRegExp); // 1.0.0-alpha.1
      } // Fallback to just version


      if (!match) {
        match = version.match(_regexp.versionRegExp); // 1.0.0
      }
    }

    if (shaOnly) {
      match = version.match(_regexp.shaRegExp); // 4jds75hf
    }

    return match ? match[0] : version;
  }

  var _default = Ember.Helper.helper(appVersion);

  _exports.default = _default;
});
;define("bt-web2/helpers/divide", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.divide = divide;
  _exports.default = void 0;

  function divide(params)
  /*, hash*/
  {
    if (params.length < 2) {
      return '';
    }

    const d1 = parseFloat('' + params[0]);
    const d2 = parseFloat('' + params[1]);
    console.log("dividing ", params[0], " by ", params[1]);
    const ret = d1 / d2;

    if (params[2]) {
      return ret.toFixed(params[2]);
    } else {
      return d1 / d2;
    }
  }

  var _default = Ember.Helper.helper(divide);

  _exports.default = _default;
});
;define("bt-web2/helpers/eq", ["exports", "ember-truth-helpers/helpers/equal"], function (_exports, _equal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _equal.default;
    }
  });
  Object.defineProperty(_exports, "equal", {
    enumerable: true,
    get: function () {
      return _equal.equal;
    }
  });
});
;define("bt-web2/helpers/format-date", ["exports", "ember-intl/helpers/format-date"], function (_exports, _formatDate) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _formatDate.default;
    }
  });
});
;define("bt-web2/helpers/format-message", ["exports", "ember-intl/helpers/format-message"], function (_exports, _formatMessage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _formatMessage.default;
    }
  });
});
;define("bt-web2/helpers/format-number", ["exports", "ember-intl/helpers/format-number"], function (_exports, _formatNumber) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _formatNumber.default;
    }
  });
});
;define("bt-web2/helpers/format-relative", ["exports", "ember-intl/helpers/format-relative"], function (_exports, _formatRelative) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _formatRelative.default;
    }
  });
});
;define("bt-web2/helpers/format-time", ["exports", "ember-intl/helpers/format-time"], function (_exports, _formatTime) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _formatTime.default;
    }
  });
});
;define("bt-web2/helpers/gt", ["exports", "ember-truth-helpers/helpers/gt"], function (_exports, _gt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _gt.default;
    }
  });
  Object.defineProperty(_exports, "gt", {
    enumerable: true,
    get: function () {
      return _gt.gt;
    }
  });
});
;define("bt-web2/helpers/gte", ["exports", "ember-truth-helpers/helpers/gte"], function (_exports, _gte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _gte.default;
    }
  });
  Object.defineProperty(_exports, "gte", {
    enumerable: true,
    get: function () {
      return _gte.gte;
    }
  });
});
;define("bt-web2/helpers/is-array", ["exports", "ember-truth-helpers/helpers/is-array"], function (_exports, _isArray) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isArray.default;
    }
  });
  Object.defineProperty(_exports, "isArray", {
    enumerable: true,
    get: function () {
      return _isArray.isArray;
    }
  });
});
;define("bt-web2/helpers/is-empty", ["exports", "ember-truth-helpers/helpers/is-empty"], function (_exports, _isEmpty) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isEmpty.default;
    }
  });
});
;define("bt-web2/helpers/is-equal", ["exports", "ember-truth-helpers/helpers/is-equal"], function (_exports, _isEqual) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _isEqual.default;
    }
  });
  Object.defineProperty(_exports, "isEqual", {
    enumerable: true,
    get: function () {
      return _isEqual.isEqual;
    }
  });
});
;define("bt-web2/helpers/lt", ["exports", "ember-truth-helpers/helpers/lt"], function (_exports, _lt) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _lt.default;
    }
  });
  Object.defineProperty(_exports, "lt", {
    enumerable: true,
    get: function () {
      return _lt.lt;
    }
  });
});
;define("bt-web2/helpers/lte", ["exports", "ember-truth-helpers/helpers/lte"], function (_exports, _lte) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _lte.default;
    }
  });
  Object.defineProperty(_exports, "lte", {
    enumerable: true,
    get: function () {
      return _lte.lte;
    }
  });
});
;define("bt-web2/helpers/md5", ["exports", "ember-md5/helpers/md5"], function (_exports, _md) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _md.default;
    }
  });
});
;define("bt-web2/helpers/not-eq", ["exports", "ember-truth-helpers/helpers/not-equal"], function (_exports, _notEqual) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _notEqual.default;
    }
  });
  Object.defineProperty(_exports, "notEq", {
    enumerable: true,
    get: function () {
      return _notEqual.notEq;
    }
  });
});
;define("bt-web2/helpers/not", ["exports", "ember-truth-helpers/helpers/not"], function (_exports, _not) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _not.default;
    }
  });
  Object.defineProperty(_exports, "not", {
    enumerable: true,
    get: function () {
      return _not.not;
    }
  });
});
;define("bt-web2/helpers/or", ["exports", "ember-truth-helpers/helpers/or"], function (_exports, _or) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _or.default;
    }
  });
  Object.defineProperty(_exports, "or", {
    enumerable: true,
    get: function () {
      return _or.or;
    }
  });
});
;define("bt-web2/helpers/t", ["exports", "ember-intl/helpers/t"], function (_exports, _t) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _t.default;
    }
  });
});
;define("bt-web2/helpers/time-display", ["exports", "bt-web2/tourjs-shared/Utils"], function (_exports, _Utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.timeDisplay = timeDisplay;
  _exports.default = void 0;

  function timeDisplay(params
  /*, hash*/
  ) {
    if (params.length < 1) {
      return;
    }

    const asNumber = parseFloat(params[0]);

    if (isFinite(asNumber)) {
      return (0, _Utils.formatSecondsHms)(asNumber);
    }

    return params[0];
  }

  var _default = Ember.Helper.helper(timeDisplay);

  _exports.default = _default;
});
;define("bt-web2/helpers/xor", ["exports", "ember-truth-helpers/helpers/xor"], function (_exports, _xor) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _xor.default;
    }
  });
  Object.defineProperty(_exports, "xor", {
    enumerable: true,
    get: function () {
      return _xor.xor;
    }
  });
});
;define("bt-web2/hrm-control/controller", ["exports", "bt-web2/tourjs-client-shared/heart-rate-engine"], function (_exports, _heartRateEngine) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _dec, _dec2, _dec3, _class;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  let HrmControl = (_dec = Ember.computed("lastBpm"), _dec2 = Ember.computed("targetHandicap"), _dec3 = Ember.computed("targetBpm"), (_class = class HrmControl extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service(),
    lastBpm: 0,
    targetHandicap: 75,
    targetBpm: 150,
    gain: 100,
    hrmEngine: null,
    actions: {
      upTarget(amount) {
        this.incrementProperty('targetBpm', amount);
      },

      downTarget(amount) {
        this.decrementProperty('targetBpm', amount);
      },

      upErg() {
        this.incrementProperty('targetHandicap');
      },

      downErg() {
        this.decrementProperty('targetHandicap');
      },

      gainAdjust(amount) {
        this.incrementProperty('gain', amount);
      },

      downloadFile() {
        this.devices.dumpPwx("HRM-Control", new Date().getTime());
      }

    }
  }) {
    // normal class body definition here
    startup() {
      console.log("starting hrm control mode");
      let tmLast = new Date().getTime();
      const user = this.devices.getLocalUser();

      if (user) {
        this.set('hrmEngine', new _heartRateEngine.HeartRateEngine(user.getLastHrm(tmLast)));

        const doTick = () => {
          const tmNow = new Date().getTime();
          const dt = (tmNow - tmLast) / 1000;
          tmLast = tmNow;
          const targetBpm = this.get('targetBpm');
          let targetHandicap = this.get('targetHandicap');
          const hrmEngine = this.get('hrmEngine');

          if (hrmEngine && user) {
            const {
              newTargetHandicap
            } = hrmEngine.tick(user, tmNow, dt, targetBpm, targetHandicap, this.get('gain') / 100);
            this.set('targetHandicap', newTargetHandicap);
          }

          this.devices.tick(tmNow, false);

          if (!this.isDestroyed) {
            setTimeout(doTick, 500);
          }
        };

        setTimeout(doTick, 500);
      } else {
        alert("Somehow we don't have a user");
      }
    }

    _applyTargetErg(user, handicap) {
      this.devices.setErgMode(handicap * user.getHandicap() / 100);
      this.set('targetHandicap', handicap);
    }

    get strLastBpm() {
      return this.get('lastBpm').toFixed(0) + 'bpm';
    }

    get strTargetHandicap() {
      return this.get('targetHandicap').toFixed(1) + '%';
    }

    get strTargetBpm() {
      return this.get('targetBpm').toFixed(0) + 'bpm';
    }

  }, (_applyDecoratedDescriptor(_class.prototype, "strLastBpm", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "strLastBpm"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "strTargetHandicap", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "strTargetHandicap"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "strTargetBpm", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "strTargetBpm"), _class.prototype)), _class)); // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.

  _exports.default = HrmControl;
});
;define("bt-web2/hrm-control/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class HrmControl extends Ember.Route.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    setupController(controller, model) {
      controller.set('model', model);
      controller.startup();
    }

  }

  _exports.default = HrmControl;
});
;define("bt-web2/hrm-control/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "6q7q94xe",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"hrm-control__super-container\"],[8],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"hrm-control__container\"],[8],[0,\"\\n    \"],[7,\"h1\",true],[8],[0,\"HRM control mode\"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"hrm-control__button-row\"],[8],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"hrm-control__button\"],[3,\"action\",[[23,0,[]],\"upErg\"]],[8],[0,\"% Up\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"hrm-control__button\"],[3,\"action\",[[23,0,[]],\"downErg\"]],[8],[0,\"% Down\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n    \"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"hrm-control__data\"],[8],[0,\"\\n      \"],[7,\"div\",true],[10,\"class\",\"hrm-control__data-row\"],[8],[0,\"\\n        \"],[7,\"div\",true],[10,\"class\",\"hrm-control__data-key\"],[8],[0,\"Target %\"],[9],[0,\"\\n        \"],[7,\"div\",true],[10,\"class\",\"hrm-control__data-value\"],[8],[1,[22,\"strTargetHandicap\"],false],[9],[0,\"\\n      \"],[9],[0,\"\\n      \"],[7,\"div\",true],[10,\"class\",\"hrm-control__data-row\"],[8],[0,\"\\n        \"],[7,\"div\",true],[10,\"class\",\"hrm-control__data-key\"],[8],[0,\"Current bpm\"],[9],[0,\"\\n        \"],[7,\"div\",true],[10,\"class\",\"hrm-control__data-value\"],[8],[1,[22,\"strLastBpm\"],false],[9],[0,\"\\n      \"],[9],[0,\"\\n      \"],[7,\"div\",true],[10,\"class\",\"hrm-control__data-row\"],[8],[0,\"\\n        \"],[7,\"div\",true],[10,\"class\",\"hrm-control__data-key\"],[8],[0,\"Target bpm\"],[9],[0,\"\\n        \"],[7,\"div\",true],[10,\"class\",\"hrm-control__data-value\"],[8],[1,[22,\"strTargetBpm\"],false],[9],[0,\"\\n      \"],[9],[0,\"\\n    \"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"hrm-control__button-row\"],[8],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"hrm-control__button\"],[3,\"action\",[[23,0,[]],\"downTarget\",5]],[8],[7,\"i\",true],[10,\"class\",\"fas fa-heart hrm-control__heart down5\"],[8],[9],[0,\" -5\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"hrm-control__button\"],[3,\"action\",[[23,0,[]],\"downTarget\",1]],[8],[7,\"i\",true],[10,\"class\",\"fas fa-heart hrm-control__heart down1\"],[8],[9],[0,\" -1\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"hrm-control__button\"],[3,\"action\",[[23,0,[]],\"upTarget\",1]],[8],[7,\"i\",true],[10,\"class\",\"fas fa-heart hrm-control__heart up1\"],[8],[9],[0,\" +1\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"hrm-control__button\"],[3,\"action\",[[23,0,[]],\"upTarget\",5]],[8],[7,\"i\",true],[10,\"class\",\"fas fa-heart hrm-control__heart up5\"],[8],[9],[0,\" +5\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n    \"],[9],[0,\"\\n    \"],[7,\"div\",true],[10,\"class\",\"hrm-control__button-row\"],[8],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"hrm-control__button\"],[3,\"action\",[[23,0,[]],\"gainAdjust\",-1]],[8],[0,\"Aggro - 1\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n      \"],[1,[22,\"gain\"],false],[0,\"\\n      \"],[7,\"button\",false],[12,\"class\",\"hrm-control__button\"],[3,\"action\",[[23,0,[]],\"gainAdjust\",1]],[8],[0,\"Aggro + 1\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n    \"],[9],[0,\"\\n    \"],[7,\"br\",true],[8],[9],[7,\"br\",true],[8],[9],[0,\"\\n    \"],[7,\"button\",false],[12,\"class\",\"hrm-control__download\"],[3,\"action\",[[23,0,[]],\"downloadFile\"]],[8],[0,\"Download PWX\"],[9],[0,\"\\n  \"],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/hrm-control/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/index/controller", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class Index extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service()
  }) {} // normal class body definition here
  // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.


  _exports.default = Index;
});
;define("bt-web2/index/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class Index extends Ember.Route.extend({
    // anything which *must* be merged to prototype here
    actions: {
      goto(where) {
        this.transitionTo(where);
      }

    }
  }) {// normal class body definition here
  }

  _exports.default = Index;
});
;define("bt-web2/index/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "PbJD34Ln",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"index__container\"],[8],[0,\"\\n  \"],[1,[22,\"tourjs-header\"],false],[0,\"\\n  \"],[7,\"div\",false],[12,\"class\",\"index__activity user\"],[3,\"action\",[[23,0,[]],\"goto\",\"set-up-user\"]],[8],[0,\"\\n\"],[4,\"vertical-align\",null,[[\"class\"],[\"index__activity--text\"]],{\"statements\":[[0,\"      Setup User\\n\"]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n  \"],[7,\"div\",false],[12,\"class\",\"index__activity race\"],[3,\"action\",[[23,0,[]],\"goto\",\"set-up-ride\"]],[8],[0,\"\\n\"],[4,\"vertical-align\",null,[[\"class\"],[\"index__activity--text\"]],{\"statements\":[[0,\"      Race\\n\"]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n  \"],[7,\"div\",false],[12,\"class\",\"index__activity hrm-control\"],[3,\"action\",[[23,0,[]],\"goto\",\"hrm-control\"]],[8],[0,\"\\n\"],[4,\"vertical-align\",null,[[\"class\"],[\"index__activity--text\"]],{\"statements\":[[0,\"      Heart Rate Workout\\n\"]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n  \"],[7,\"div\",false],[12,\"class\",\"index__activity pacing-challenge\"],[3,\"action\",[[23,0,[]],\"goto\",\"pacing-challenge\"]],[8],[0,\"\\n\"],[4,\"vertical-align\",null,[[\"class\"],[\"index__activity--text\"]],{\"statements\":[[0,\"      Pacing Challenge\\n\"]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n  \"],[1,[22,\"stored-data\"],false],[0,\"\\n  \"],[4,\"link-to\",null,[[\"route\"],[\"test-hacks\"]],{\"statements\":[[0,\"Test Hacks\"]],\"parameters\":[]},null],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/index/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/initializers/app-version", ["exports", "ember-cli-app-version/initializer-factory", "bt-web2/config/environment"], function (_exports, _initializerFactory, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  let name, version;

  if (_environment.default.APP) {
    name = _environment.default.APP.name;
    version = _environment.default.APP.version;
  }

  var _default = {
    name: 'App Version',
    initialize: (0, _initializerFactory.default)(name, version)
  };
  _exports.default = _default;
});
;define("bt-web2/initializers/container-debug-adapter", ["exports", "ember-resolver/resolvers/classic/container-debug-adapter"], function (_exports, _containerDebugAdapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = {
    name: 'container-debug-adapter',

    initialize() {
      let app = arguments[1] || arguments[0];
      app.register('container-debug-adapter:main', _containerDebugAdapter.default);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }

  };
  _exports.default = _default;
});
;define("bt-web2/initializers/export-application-global", ["exports", "bt-web2/config/environment"], function (_exports, _environment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.initialize = initialize;
  _exports.default = void 0;

  function initialize() {
    var application = arguments[1] || arguments[0];

    if (_environment.default.exportApplicationGlobal !== false) {
      var theGlobal;

      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _environment.default.exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = Ember.String.classify(_environment.default.modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;
        application.reopen({
          willDestroy: function () {
            this._super.apply(this, arguments);

            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  var _default = {
    name: 'export-application-global',
    initialize: initialize
  };
  _exports.default = _default;
});
;define("bt-web2/kickr-setup/controller", ["exports", "bt-web2/pojs/WebBluetoothDevice"], function (_exports, _WebBluetoothDevice) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class SimpleSlopeSource {
    constructor() {
      _defineProperty(this, "slope", 0);
    }

    getLastSlopeInWholePercent() {
      return this.slope;
    }

    setSlope(slope) {
      this.slope = slope;
    }

  }

  class KickrSetup extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service('devices'),
    downhillStrength: 0x3fff,
    uphillStrength: 0x2000,
    currentHill: 0,
    mySlopeSource: new SimpleSlopeSource(),
    frame: 0,

    _applyToKickr(dh, uh) {
      const kickr = _WebBluetoothDevice.BluetoothKickrDevice.getKickrDevice();

      if (kickr) {
        kickr.setUphillDownhill(Math.floor(dh), Math.floor(uh));
        console.log("applied uphill/downhill to kickr");
      }
    },

    hillObserver: Ember.observer('currentHill', 'downhillStrength', 'uphillStrength', 'frame', function () {
      if (this.isDestroyed) {
        return;
      }

      const percents = this.get('currentHill');
      const currentDown = parseInt('' + this.get('downhillStrength'));
      const currentUp = parseInt('' + this.get('uphillStrength'));
      const frame = this.get('frame');
      console.log("kickr setup frame " + frame + " setting slope to ", percents);
      this.get('mySlopeSource').setSlope(percents);

      const kickr = _WebBluetoothDevice.BluetoothKickrDevice.getKickrDevice();

      if (kickr) {
        kickr.setUphillDownhill(currentDown, currentUp);
        kickr.setSlopeSource(this.get('mySlopeSource'));
        kickr.updateSlope(new Date().getTime(), 1);
      }
    }),
    actions: {
      downhill(pct) {
        const currentDown = parseInt('' + this.get('downhillStrength'));
        const afterDown = Math.min(0x3fff, Math.max(0, currentDown * pct));
        const currentUp = parseInt('' + this.get('uphillStrength'));
        const afterUp = Math.min(afterDown - 1, currentUp);
        this.set('downhillStrength', Math.floor(afterDown));
        this.set('uphillStrength', Math.floor(afterUp));

        this._applyToKickr(afterDown, afterUp);
      },

      uphill(pct) {
        const currentUp = parseInt('' + this.get('uphillStrength'));
        const afterUp = Math.min(0x3fff, Math.max(0, currentUp * pct));
        const currentDown = parseInt('' + this.get('downhillStrength'));
        const afterDown = Math.max(afterUp + 1, currentDown);
        this.set('downhillStrength', Math.floor(afterDown));
        this.set('uphillStrength', Math.floor(afterUp));

        this._applyToKickr(afterDown, afterUp);
      },

      save() {
        window.localStorage.setItem('kickr-downhill-number', '' + parseInt('' + this.get('downhillStrength')));
        window.localStorage.setItem('kickr-uphill-number', '' + parseInt('' + this.get('uphillStrength')));
        alert("Saved kickr configs");
      },

      setHill(percents) {
        this.set('currentHill', percents);
      }

    }
  }) {
    // normal class body definition here
    _setup() {
      const dh = parseInt(window.localStorage.getItem('kickr-downhill-number') || '0x3fff');
      this.set('downhillStrength', dh);
      const uh = parseInt(window.localStorage.getItem('kickr-uphill-number') || '0x2000');
      this.set('uphillStrength', uh);

      const incrementFrame = () => {
        this.incrementProperty('frame');

        if (window.location.pathname.includes('kickr-setup')) {
          setTimeout(() => incrementFrame(), 1000);
        }
      };

      setTimeout(() => incrementFrame(), 1000);
    }

  } // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.


  _exports.default = KickrSetup;
});
;define("bt-web2/kickr-setup/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class KickrSetup extends Ember.Route.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    setupController(controller) {
      controller._setup();
    }

  }

  _exports.default = KickrSetup;
});
;define("bt-web2/kickr-setup/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "RU6TxSVx",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"index__container\"],[8],[0,\"\\n  \"],[1,[22,\"tourjs-header\"],false],[0,\"\\n  \"],[7,\"p\",true],[8],[0,\"Do you have a Wahoo Kickr?  Wahoo doesn't appear to have released the specs for their control protocol, so this lets you configure my best-guess protocol.\"],[9],[0,\"\\n  \"],[7,\"br\",true],[8],[9],[0,\"\\n  \"],[7,\"h4\",true],[8],[0,\"How to use\"],[9],[0,\"\\n  \"],[7,\"ul\",true],[8],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Connect your kickr\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Shift to your fastest gear setting (downhill config)\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Set it to -10% with the buttons below\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Screw around with the \\\"downhill strength\\\" setting\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Shift to your gear you'll be doing climbing in\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Set it to +10% with the buttons below\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Screw around with the \\\"uphill strength\\\" setting\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[7,\"b\",true],[8],[0,\"Don't forget to click \\\"save\\\" so you only have to do this once\"],[9],[9],[0,\"\\n  \"],[9],[0,\"\\n\\n\"],[7,\"br\",true],[8],[9],[7,\"br\",true],[8],[9],[0,\"\\n  Downhill Strength\"],[7,\"br\",true],[8],[9],[0,\"\\n  \"],[1,[28,\"input\",null,[[\"class\",\"value\"],[\"kickr-setup__input\",[24,[\"downhillStrength\"]]]]],false],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"downhill\",0.98]],[8],[0,\"Harder\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"downhill\",1.02]],[8],[0,\"Easier\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n\\n  Uphill Strength\"],[7,\"br\",true],[8],[9],[0,\"\\n  \"],[1,[28,\"input\",null,[[\"class\",\"value\"],[\"kickr-setup__input\",[24,[\"uphillStrength\"]]]]],false],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"uphill\",0.98]],[8],[0,\"Harder\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"uphill\",1.02]],[8],[0,\"Easier\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n  \"],[7,\"br\",true],[8],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"save\"]],[8],[0,\"Save Uphill/downhill strengths\"],[9],[0,\"\\n  \"],[7,\"br\",true],[8],[9],[7,\"br\",true],[8],[9],[0,\"\\n  \"],[7,\"h3\",true],[8],[0,\"Test your settings below\"],[9],[0,\"\\n\\n\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",-20]],[8],[0,\"-20%\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",-10]],[8],[0,\"-10%\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",-8]],[8],[0,\"-8%\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",-6]],[8],[0,\"-6%\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",-4]],[8],[0,\"-4%\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",-2]],[8],[0,\"-2%\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",0]],[8],[0,\"Flat\"],[9],[7,\"br\",true],[8],[9],[0,\"\\n\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",2]],[8],[0,\"2%\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",4]],[8],[0,\"4%\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",6]],[8],[0,\"6%\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",8]],[8],[0,\"8%\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",10]],[8],[0,\"10%\"],[9],[0,\"\\n  \"],[7,\"button\",false],[12,\"class\",\"kickr-setup__button\"],[3,\"action\",[[23,0,[]],\"setHill\",20]],[8],[0,\"20%\"],[9],[0,\"\\n\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/kickr-setup/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/models/wordpress/attachment", ["exports", "ember-wordpress/models/attachment"], function (_exports, _attachment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _attachment.default;
    }
  });
});
;define("bt-web2/models/wordpress/category", ["exports", "ember-wordpress/models/term"], function (_exports, _term) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _term.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/models/wordpress/comment", ["exports", "ember-wordpress/models/comment"], function (_exports, _comment) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _comment.default;
    }
  });
});
;define("bt-web2/models/wordpress/page", ["exports", "ember-wordpress/models/post"], function (_exports, _post) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _post.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/models/wordpress/post", ["exports", "ember-wordpress/models/post"], function (_exports, _post) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _post.default;
    }
  });
});
;define("bt-web2/models/wordpress/tag", ["exports", "ember-wordpress/models/term"], function (_exports, _term) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _term.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/models/wordpress/user", ["exports", "ember-wordpress/models/user"], function (_exports, _user) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _user.default;
    }
  });
});
;define("bt-web2/no-bluetooth/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class NoBluetooth extends Ember.Route.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    model() {
      var _window, _window$navigator, _window$navigator$blu;

      if ((_window = window) === null || _window === void 0 ? void 0 : (_window$navigator = _window.navigator) === null || _window$navigator === void 0 ? void 0 : (_window$navigator$blu = _window$navigator.bluetooth) === null || _window$navigator$blu === void 0 ? void 0 : _window$navigator$blu.getAvailability) {
        window.navigator.bluetooth.getAvailability().then(available => {
          if (available) {
            // oh wait, bluetooth IS available
            this.transitionTo('index');
          } else {// still broken
          }
        });
      } else {// yep, bluetooth is definitely broken
      }
    }

  }

  _exports.default = NoBluetooth;
});
;define("bt-web2/no-bluetooth/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "qrawUs33",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"index__container\"],[8],[0,\"\\n  \"],[7,\"h3\",true],[10,\"class\",\"no-bluetooth-header\"],[8],[0,\"No Web-Bluetooth Access?\"],[9],[0,\"\\n  \"],[7,\"p\",true],[10,\"class\",\"no-bluetooth-p\"],[8],[0,\"If you got here, unfortunately your browser told TourJS that it doesn't support Web-Bluetooth.\"],[9],[0,\"\\n  \"],[7,\"p\",true],[10,\"class\",\"no-bluetooth-p\"],[8],[0,\"TourJS requires your browser to support web-bluetooth in order to connect to your powermeter and play.  Web-Bluetooth is supported in Google Chrome, but not in any other browsers\"],[9],[0,\"\\n  \"],[7,\"p\",true],[10,\"class\",\"no-bluetooth-p\"],[8],[0,\"If you've got a BLE stick like an IOGear GBU521, you can plug it in and refresh to see if your browser gets happier.\"],[9],[0,\"\\n  \"],[7,\"p\",true],[10,\"class\",\"no-bluetooth-p\"],[8],[0,\"If you want to see what the game looks like, you can check out the \"],[4,\"link-to\",null,[[\"route\"],[\"test-hacks\"]],{\"statements\":[[0,\"test page\"]],\"parameters\":[]},null],[9],[0,\"\\n  \"],[7,\"hr\",true],[8],[9],[0,\"\\n  \"],[7,\"h4\",true],[10,\"class\",\"no-bluetooth-header\"],[8],[0,\"Recommended Systems\"],[9],[0,\"\\n  \"],[7,\"ul\",true],[8],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Android + Chrome\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Apple MacOS + Chrome\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Windows PCs + Chrome - \"],[7,\"i\",true],[8],[0,\"you may need an BLE addon stick like an \"],[7,\"a\",true],[10,\"href\",\"https://www.amazon.ca/Iogear-Bluetooth-Micro-Adapter-Gbu521/dp/B007GFX0PY/\"],[8],[0,\"IOGear GBU521\"],[9],[9],[0,\".  TourJS is developed on a Windows desktop with an IOGear GBU521\"],[9],[0,\"\\n  \"],[9],[0,\"\\n  \"],[7,\"hr\",true],[8],[9],[0,\"\\n  \"],[7,\"h4\",true],[10,\"class\",\"no-bluetooth-header\"],[8],[0,\"Annoyingly Unsupported Systems\"],[9],[0,\"\\n  \"],[7,\"ul\",true],[8],[0,\"\\n    \"],[7,\"il\",true],[8],[0,\"iPhones running chrome - due to Apple's policies, Chrome on iPhone is really just Safari in lipstick, and so doesn't support many features that Chrome usually does.\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Firefox\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Safari\"],[9],[0,\"\\n    \"],[7,\"li\",true],[8],[0,\"Internet Explorer\"],[9],[0,\"\\n  \"],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/no-bluetooth/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/pacing-challenge-race/controller", ["exports", "bt-web2/tourjs-shared/User", "bt-web2/tourjs-shared/RideMap", "bt-web2/tourjs-shared/RaceState", "bt-web2/set-up-ride/route"], function (_exports, _User, _RideMap, _RaceState, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getPacingChallengeMap = getPacingChallengeMap;
  _exports.default = _exports.PacingChallengeUserProvider = _exports.PacingChallengeLong = _exports.PacingChallengeFlat = _exports.PacingChallengeHills2 = _exports.PacingChallengeHills1 = _exports.PacingChallengeShortMap = void 0;

  var _dec, _class, _temp;

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class PacingChallengeShortMap extends _RideMap.RideMapPartial {
    getPowerTransform(who) {
      return power => {
        return _User.DEFAULT_HANDICAP_POWER * (power / who.getHandicap());
      };
    }

    getBounds() {
      return {
        minElev: -40,
        maxElev: 50,
        minDist: 0,
        maxDist: this.getLength()
      };
    }

    getElevationAtDistance(meters) {
      return 15 * Math.cos(meters / 400) + 2.5 * Math.cos(meters / 170) - 7.5 * Math.cos(meters / 2200) + 50 * Math.cos(Math.cos(meters / 750)) - 25;
    }

    getLength() {
      return 5000;
    }

  }

  _exports.PacingChallengeShortMap = PacingChallengeShortMap;

  class PacingChallengeHills1 extends PacingChallengeShortMap {
    getLength() {
      if (window.location.hostname === 'localhost') {
        return 100;
      } else {
        return super.getLength();
      }
    }

    getElevationAtDistance(meters) {
      return 15 * Math.cos(meters / 400) + 2.5 * Math.cos(meters / 170) - 7.5 * Math.cos(meters / 2200) + 50 * Math.cos(Math.cos(meters / 750)) - 25;
    }

  }

  _exports.PacingChallengeHills1 = PacingChallengeHills1;

  class PacingChallengeHills2 extends PacingChallengeShortMap {
    getBounds() {
      return {
        minElev: 0,
        maxElev: 60,
        minDist: 0,
        maxDist: this.getLength()
      };
    }

    getElevationAtDistance(meters) {
      return 12 * Math.cos(meters / 300) + 6.5 * Math.cos(meters / 150) + 50 * Math.cos(Math.cos(meters / 750)) - 25 + meters / 250;
    }

  }

  _exports.PacingChallengeHills2 = PacingChallengeHills2;

  class PacingChallengeFlat extends PacingChallengeShortMap {
    getBounds() {
      return {
        minElev: 0,
        maxElev: 20,
        minDist: 0,
        maxDist: this.getLength()
      };
    }

    getElevationAtDistance(meters) {
      return 2 * Math.sin(meters / 1000);
    }

  }

  _exports.PacingChallengeFlat = PacingChallengeFlat;

  class PacingChallengeLong extends PacingChallengeShortMap {
    getBounds() {
      return {
        minElev: -10,
        maxElev: 60,
        minDist: 0,
        maxDist: this.getLength()
      };
    }

    getLength() {
      return 15000;
    }

    getElevationAtDistance(meters) {
      if (meters <= 1500) {
        // climb gradually from 0 to 15 meters at a steady grade
        return 0.01 * meters;
      } else if (meters <= 3000) {
        // descend back down to zero elevation
        meters -= 1500;
        return 15 - meters * 0.01;
      } else if (meters <= 5500) {
        meters -= 3000;
        return 12 * Math.sin(meters / 300) + 6.5 * Math.sin(meters / 150) + 50 * Math.sin(Math.sin(meters / 750));
      } else if (meters <= 7500) {
        // 2km perfectly flat
        const lastElev = this.getElevationAtDistance(5500);
        return lastElev;
      } else {
        // something siney to finish things off
        const lastElev = this.getElevationAtDistance(7500);
        meters -= 7500;
        return lastElev + 8 * Math.sin(Math.pow(meters, 0.6) / 1300) + 5.5 * Math.sin(meters / 250) + 30 * Math.sin(Math.sin(meters / 350));
      }
    }

  }

  _exports.PacingChallengeLong = PacingChallengeLong;

  function getPacingChallengeMap(name) {
    switch (name) {
      default:
      case 'hills1':
        return new PacingChallengeHills1();

      case 'hills2':
        return new PacingChallengeHills2();

      case 'flat':
        return new PacingChallengeFlat();

      case 'long':
        return new PacingChallengeLong();
    }
  }

  class PacingChallengeUserProvider {
    constructor(localUserOverride, pctZeroToOne, mapLen) {
      _defineProperty(this, "users", void 0);

      _defineProperty(this, "localUser", void 0);

      if (!localUserOverride) {
        throw new Error("You need to have your devices set up before starting");
      }

      localUserOverride.setDistance(0);
      localUserOverride.setSpeed(10);
      this.users = [localUserOverride];
      this.localUser = localUserOverride; // generate a bunch of slow AIs so that the user has to overtake them and decide whether to stick around and draft or push harder
      // all the AIs will ride at 90% of the handicapped effort level, so they'll be easy to catch up to and not fast enough to be useful

      const n = 30;
      const aiLead = Math.min(mapLen / 2, 2000);

      for (var x = 1; x < n; x++) {
        const aiUser = new _User.User(`AI ${n - x + 1}`, _User.DEFAULT_RIDER_MASS, 100, _User.UserTypeFlags.Ai | _User.UserTypeFlags.Remote);
        aiUser.setDistance(x / n * aiLead);
        aiUser.notifyPower(new Date().getTime(), 100 * pctZeroToOne * 0.9);
        this.users.push(aiUser);
      }

      this.users.forEach((user, index) => {
        if (user.getId() < 0) {
          user.setId(index);
        }
      });
    }

    getUsers(tmNow) {
      return this.users.slice();
    }

    getUser(id) {
      return this.users.find(user => user.getId() === id) || null;
    }

    getLocalUser() {
      return this.localUser;
    }

  }

  _exports.PacingChallengeUserProvider = PacingChallengeUserProvider;
  let pcRaceId = 0;
  let PacingChallengeRace = (_dec = Ember.computed("ticks", "handicapSecondsAllowed", "usedAllPower"), (_class = (_temp = class PacingChallengeRace extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service(),
    transitionedOut: false
  }) {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "pickedMapName", '');

      _defineProperty(this, "_map", null);

      _defineProperty(this, "_userProvider", null);

      _defineProperty(this, "_raceState", null);

      _defineProperty(this, "pctZeroTo100", 0);

      _defineProperty(this, "handicapSecondsAllowed", 0);

      _defineProperty(this, "ticks", 0);

      _defineProperty(this, "startingSpeedJoules", 0);

      _defineProperty(this, "_id", 0);

      _defineProperty(this, "usedAllPower", false);
    }

    _setup(params) {
      this._id = pcRaceId++;
      this.set('usedAllPower', false);
      console.log("starting pacing challenge id ", this._id);
      this.set('transitionedOut', false);
      const pctAsFloat = parseFloat(params.pct);

      if (pctAsFloat < 0 || pctAsFloat > 200) {
        throw new Error("Effort level out of range");
      }

      this.set('pctZeroTo100', pctAsFloat);
      const localUser = this.devices.getLocalUser();

      if (!localUser) {
        throw new Error("You don't have a user set up yet");
      }

      const pctZeroToOne = pctAsFloat / 100;
      this.set('pickedMapName', params.map);
      this._map = getPacingChallengeMap(params.map);
      this._userProvider = new PacingChallengeUserProvider(localUser, pctAsFloat / 100, this._map.getLength());
      this.set('_raceState', new _RaceState.RaceState(this._map, this._userProvider, `Pacing-Challenge-${pctAsFloat.toFixed(0)}%`)); // let's figure out how many handicap-seconds are allowed!

      const handicappedPower = _User.DEFAULT_HANDICAP_POWER * pctZeroToOne;

      const joulesForCrr = _User.DEFAULT_CRR * _User.DEFAULT_RIDER_MASS * _User.DEFAULT_GRAVITY * this._map.getLength();

      const expectedSteadyStateSpeedMetersPerSec = Math.pow(handicappedPower / (_User.DEFAULT_CDA * _User.DEFAULT_RHO * 0.5), 0.333333333);

      const joulesForAero = 0.5 * _User.DEFAULT_CDA * _User.DEFAULT_RHO * Math.pow(expectedSteadyStateSpeedMetersPerSec, 2) * this._map.getLength();

      const joulesForClimb = (this._map.getElevationAtDistance(this._map.getLength()) - this._map.getElevationAtDistance(0)) * _User.DEFAULT_GRAVITY * _User.DEFAULT_RIDER_MASS;

      const expectedCompletionTimeSeconds = (joulesForClimb + joulesForCrr + joulesForAero) / handicappedPower; // so we've figured out how fast the handicapped avatar will complete the course.
      // let's figure out what that means for our human rider.

      const expectedPower = localUser.getHandicap() * pctZeroToOne;
      const expectedJoulesAllowed = expectedPower * expectedCompletionTimeSeconds;
      const handicapSecondsAllowed = expectedJoulesAllowed / localUser.getHandicap();
      this.set('handicapSecondsAllowed', handicapSecondsAllowed);
      this.set('startingSpeedJoules', 0.5 * _User.DEFAULT_RIDER_MASS * Math.pow(expectedSteadyStateSpeedMetersPerSec, 2));
      localUser.setDistance(0);
      localUser.setSpeed(expectedSteadyStateSpeedMetersPerSec);
      this.devices.startPowerTimer("pacing-challenge");

      this._tick();
    }

    _tick() {
      console.log(`pacing-challenge-race ${this._id} tick`);
      const tmNow = new Date().getTime();
      this.incrementProperty("ticks");
      this.devices.tick(tmNow, true);
      const localUser = this.devices.getLocalUser();

      if (!localUser) {
        throw new Error("You don't have a user set up yet");
      }

      const map = this._map;

      if (!map) {
        throw new Error("No map");
      }

      const raceState = this._raceState;

      if (!raceState) {
        throw new Error("No racestate");
      }

      const result = this.devices.getPowerCounterAverage(tmNow, "pacing-challenge");
      const hsUsed = result.joules / localUser.getHandicap();

      if (localUser.getDistance() >= map.getLength()) {
        alert(`You made it!\nIt took you ${result.totalTimeSeconds.toFixed(1)} seconds and you used ${hsUsed.toFixed(1)} energies.`);
        raceState.stop();
        const hsLeft = this.get("handicapSecondsAllowed") - hsUsed;
        const submission = {
          mapName: this.get('pickedMapName'),
          "name": localUser.getName(),
          "time": result.totalTimeSeconds,
          "hsLeft": hsLeft,
          "pct": this.get('pctZeroTo100')
        };
        return (0, _route.apiPost)('pacing-challenge-result', submission).finally(() => {
          raceState.stop();
          this.devices.dumpPwx("Pacing-Challenge-Success", new Date().getTime());
          this.transitionToRoute('pacing-challenge');
        });
      }

      if (hsUsed > this.get('handicapSecondsAllowed')) {
        this.set('usedAllPower', true);
        this.devices.setPowerFilter(power => {
          console.log("filtered ", power.toFixed(0), " watts to zero");
          return 0;
        });

        if (localUser.getSpeed() < 1.5) {
          alert(`You failed!\nYou used ${hsUsed.toFixed(1)} energies before finishing the course.`);
          raceState.stop();
          this.devices.dumpPwx("Pacing-Challenge-Failure", new Date().getTime()); // we done here!

          return this.transitionToRoute('pacing-challenge');
        } else {// they're still coasting.  maybe they'll make it!
        }
      }

      if (!this.isDestroyed && !this.get('transitionedOut')) {
        setTimeout(() => {
          this._tick();
        }, 200);
      } else {
        raceState.stop();
      }
    }

    notifyTransitionOut() {
      this.set('transitionedOut', true);
    }

    get pacingChallengeData() {
      var _this$_map;

      if (!this._map) {
        throw new Error("No map");
      }

      if (!this.get('handicapSecondsAllowed')) {
        throw new Error("No limit on handi-seconds");
      }

      console.log("used all power? ", this.get('usedAllPower'));
      return {
        pctZeroToOne: this.get('pctZeroTo100') / 100,
        handicapSecondsAllowed: this.get('handicapSecondsAllowed'),
        mapLen: this._map.getLength(),
        endOfRideElevation: (_this$_map = this._map) === null || _this$_map === void 0 ? void 0 : _this$_map.getElevationAtDistance(this._map.getLength()),
        startOfRideElevation: this._map.getElevationAtDistance(0),
        speedJoulesToStart: this.get('startingSpeedJoules'),
        usedAllPower: this.get('usedAllPower')
      };
    }

  }, _temp), (_applyDecoratedDescriptor(_class.prototype, "pacingChallengeData", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "pacingChallengeData"), _class.prototype)), _class)); // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.

  _exports.default = PacingChallengeRace;
});
;define("bt-web2/pacing-challenge-race/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class PacingChallengeRace extends Ember.Route.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service()
  }) {
    // normal class body definition here
    beforeModel() {
      var _this$devices$getLoca;

      if (!this.devices.getLocalUser()) {
        alert("You can't do a pacing challenge without having set yourself up first!");
        return this.transitionTo('pacing-challenge');
      }

      const tmNow = new Date().getTime();

      if (!((_this$devices$getLoca = this.devices.getLocalUser()) === null || _this$devices$getLoca === void 0 ? void 0 : _this$devices$getLoca.isPowerValid(tmNow))) {
        alert("You need a powermeter or trainer set up to play this game.  Click the lightning bolt.");
        return this.transitionTo('pacing-challenge');
      }
    }

    resetController() {
      debugger;
      this.controller.notifyTransitionOut();
    }

    setupController(controller, model) {
      controller._setup(model);
    }

  }

  _exports.default = PacingChallengeRace;
});
;define("bt-web2/pacing-challenge-race/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "PT2uz9Bx",
    "block": "{\"symbols\":[],\"statements\":[[1,[28,\"display-race\",null,[[\"raceState\",\"overlay\",\"overlayData\",\"mode\"],[[24,[\"_raceState\"]],\"pacing-challenge-overlay\",[24,[\"pacingChallengeData\"]],\"3d\"]]],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/pacing-challenge-race/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/pacing-challenge/controller", ["exports", "bt-web2/pacing-challenge-race/controller", "bt-web2/set-up-ride/route"], function (_exports, _controller, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class PacingChallenge extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service(),
    pickedMapName: 'hills1',
    pickedMap: Ember.computed('pickedMapName', function () {
      return (0, _controller.getPacingChallengeMap)(this.get('pickedMapName'));
    }),
    pickedHills1: Ember.computed.equal('pickedMapName', 'hills1'),
    pickedHills2: Ember.computed.equal('pickedMapName', 'hills2'),
    pickedFlat: Ember.computed.equal('pickedMapName', 'flat'),
    pickedLong: Ember.computed.equal('pickedMapName', 'long'),
    actions: {
      start(pct) {
        const map = this.get('pickedMapName');
        this.transitionToRoute('pacing-challenge-race', {
          pct,
          map
        });
      },

      pickMap(map) {
        this.set('pickedMapName', map);
        window.localStorage.setItem('pacing-challenge-map-name', map); // gotta requery for records

        const dev = this.get('devices');
        const user = dev.getLocalUser();
        const name = user && user.getName();
        return (0, _route.apiGet)('pacing-challenge-records', {
          name,
          map
        }).then(currentRecords => {
          this.set('model', currentRecords);
        });
      }

    }
  }) {} // normal class body definition here
  // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.


  _exports.default = PacingChallenge;
});
;define("bt-web2/pacing-challenge/route", ["exports", "bt-web2/set-up-ride/route"], function (_exports, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class PacingChallenge extends Ember.Route.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service(),
    pickedMapName: 'hills1'
  }) {
    // normal class body definition here
    model() {
      const dev = this.get('devices');
      const user = dev.getLocalUser();
      const name = user && user.getName();
      const oldMap = window.localStorage.getItem('pacing-challenge-map-name') || 'hills1';
      this.set('pickedMapName', oldMap);
      return (0, _route.apiGet)('pacing-challenge-records', {
        name,
        map: this.get('pickedMapName')
      }).then(currentRecords => {
        return currentRecords;
      });
    }

    setupController(controller, model) {
      console.log("setting up controller for pacing-challenge ", model);
      controller.set('model', model);
      controller.set('pickedMapName', this.get('pickedMapName'));
    }

  }

  _exports.default = PacingChallenge;
});
;define("bt-web2/pacing-challenge/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "IDq5pfMg",
    "block": "{\"symbols\":[\"result\",\"index\",\"result\",\"index\",\"result\",\"index\",\"result\",\"index\",\"result\",\"index\"],\"statements\":[[7,\"div\",true],[10,\"class\",\"index__container\"],[8],[0,\"\\n  \"],[1,[22,\"tourjs-header\"],false],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"index__activity explanation\"],[8],[0,\"\\n\"],[4,\"vertical-align\",null,[[\"class\"],[\"index__activity--text\"]],{\"statements\":[[0,\"      \"],[7,\"p\",true],[8],[0,\"Pacing Challenge mode is identical to if someone put 1L of gas in your can and told you to drive a 25km course as fast as you can.  You need to spend the energy available to you, but spend it efficiently!.  The various modes (125%, 100%, etc) give you more or less fuel to spend.\"],[9],[0,\"\\n      \"],[7,\"p\",true],[8],[0,\"If you use too much energy, game over.\"],[9],[0,\"\\n      \"],[7,\"p\",true],[8],[0,\"Tip: Powering up uphills and coasting downhills is wise.\"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n\\n  \"],[7,\"div\",true],[10,\"class\",\"index__activity explanation\"],[8],[0,\"\\n\"],[4,\"vertical-align\",null,[[\"class\"],[\"index__activity--text\"]],{\"statements\":[[0,\"      \"],[7,\"p\",true],[8],[0,\"Pacing Mode now offers different maps\"],[9],[0,\"\\n      \"],[7,\"p\",true],[8],[0,\"\\n        \"],[7,\"button\",false],[12,\"class\",\"pacing-mode\"],[12,\"disabled\",[22,\"pickedHills1\"]],[3,\"action\",[[23,0,[]],\"pickMap\",\"hills1\"]],[8],[0,\"Hills 1 (classic)\"],[9],[0,\"\\n        \"],[7,\"button\",false],[12,\"class\",\"pacing-mode\"],[12,\"disabled\",[22,\"pickedHills2\"]],[3,\"action\",[[23,0,[]],\"pickMap\",\"hills2\"]],[8],[0,\"Hills 2\"],[9],[0,\"\\n        \"],[7,\"button\",false],[12,\"class\",\"pacing-mode\"],[12,\"disabled\",[22,\"pickedFlat\"]],[3,\"action\",[[23,0,[]],\"pickMap\",\"flat\"]],[8],[0,\"Flat\"],[9],[0,\"\\n        \"],[7,\"button\",false],[12,\"class\",\"pacing-mode\"],[12,\"disabled\",[22,\"pickedLong\"]],[3,\"action\",[[23,0,[]],\"pickMap\",\"long\"]],[8],[0,\"15km\"],[9],[0,\"\\n      \"],[9],[0,\"\\n\"]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n  \"],[1,[28,\"mini-map\",null,[[\"race\"],[[24,[\"pickedMap\"]]]]],false],[0,\"\\n\\n  \"],[7,\"div\",false],[12,\"class\",\"index__activity 100\"],[3,\"action\",[[23,0,[]],\"start\",125]],[8],[0,\"\\n\"],[4,\"vertical-align\",null,[[\"class\"],[\"index__activity--text\"]],{\"statements\":[[0,\"      \"],[7,\"p\",true],[8],[0,\"125% Effort\"],[9],[0,\"\\n\\n\"],[4,\"each\",[[24,[\"model\",\"effort125\"]]],null,{\"statements\":[[0,\"        \"],[7,\"p\",true],[10,\"class\",\"index__activity--small\"],[8],[1,[23,9,[\"rank\"]],false],[0,\": \"],[1,[28,\"time-display\",[[23,9,[\"time\"]]],null],false],[0,\" by \"],[1,[23,9,[\"name\"]],false],[9],[0,\"\\n\"]],\"parameters\":[9,10]},null],[0,\"      \\n\"]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n  \"],[7,\"div\",false],[12,\"class\",\"index__activity 100\"],[3,\"action\",[[23,0,[]],\"start\",100]],[8],[0,\"\\n\"],[4,\"vertical-align\",null,[[\"class\"],[\"index__activity--text\"]],{\"statements\":[[0,\"      \"],[7,\"p\",true],[8],[0,\"100% Effort\"],[9],[0,\"\\n\"],[4,\"each\",[[24,[\"model\",\"effort100\"]]],null,{\"statements\":[[0,\"        \"],[7,\"p\",true],[10,\"class\",\"index__activity--small\"],[8],[1,[23,7,[\"rank\"]],false],[0,\": \"],[1,[28,\"time-display\",[[23,7,[\"time\"]]],null],false],[0,\" by \"],[1,[23,7,[\"name\"]],false],[9],[0,\"\\n\"]],\"parameters\":[7,8]},null]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n  \"],[7,\"div\",false],[12,\"class\",\"index__activity 90\"],[3,\"action\",[[23,0,[]],\"start\",90]],[8],[0,\"\\n\"],[4,\"vertical-align\",null,[[\"class\"],[\"index__activity--text\"]],{\"statements\":[[0,\"      90% Effort\\n\"],[4,\"each\",[[24,[\"model\",\"effort90\"]]],null,{\"statements\":[[0,\"        \"],[7,\"p\",true],[10,\"class\",\"index__activity--small\"],[8],[1,[23,5,[\"rank\"]],false],[0,\": \"],[1,[28,\"time-display\",[[23,5,[\"time\"]]],null],false],[0,\" by \"],[1,[23,5,[\"name\"]],false],[9],[0,\"\\n\"]],\"parameters\":[5,6]},null]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n  \"],[7,\"div\",false],[12,\"class\",\"index__activity 80\"],[3,\"action\",[[23,0,[]],\"start\",80]],[8],[0,\"\\n\"],[4,\"vertical-align\",null,[[\"class\"],[\"index__activity--text\"]],{\"statements\":[[0,\"      80% Effort\\n\"],[4,\"each\",[[24,[\"model\",\"effort80\"]]],null,{\"statements\":[[0,\"        \"],[7,\"p\",true],[10,\"class\",\"index__activity--small\"],[8],[1,[23,3,[\"rank\"]],false],[0,\": \"],[1,[28,\"time-display\",[[23,3,[\"time\"]]],null],false],[0,\" by \"],[1,[23,3,[\"name\"]],false],[9],[0,\"\\n\"]],\"parameters\":[3,4]},null]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n  \"],[7,\"div\",false],[12,\"class\",\"index__activity 50\"],[3,\"action\",[[23,0,[]],\"start\",50]],[8],[0,\"\\n\"],[4,\"vertical-align\",null,[[\"class\"],[\"index__activity--text\"]],{\"statements\":[[0,\"      50% Effort\\n\"],[4,\"each\",[[24,[\"model\",\"effort50\"]]],null,{\"statements\":[[0,\"        \"],[7,\"p\",true],[10,\"class\",\"index__activity--small\"],[8],[1,[23,1,[\"rank\"]],false],[0,\": \"],[1,[28,\"time-display\",[[23,1,[\"time\"]]],null],false],[0,\" by \"],[1,[23,1,[\"name\"]],false],[9],[0,\"\\n\"]],\"parameters\":[1,2]},null]],\"parameters\":[]},null],[0,\"  \"],[9],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/pacing-challenge/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/pojs/DeviceFactory", ["exports", "bt-web2/pojs/WebBluetoothDevice", "bt-web2/pojs/DeviceUtils"], function (_exports, _WebBluetoothDevice, _DeviceUtils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getDeviceFactory = getDeviceFactory;
  _exports.TestPowermeter = void 0;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class TestPowermeter extends _WebBluetoothDevice.PowerDataDistributor {
    constructor() {
      super();

      _defineProperty(this, "_interval", null);

      this._interval = setInterval(() => {
        const tmNow = new Date().getTime();

        this._notifyNewPower(tmNow, Math.random() * 50 + 200);
      }, 500);
    }

    getDeviceTypeDescription() {
      return "Fake Device";
    }

    disconnect() {
      clearInterval(this._interval);
      this._interval = null;
      return Promise.resolve();
    }

    getState() {
      return _WebBluetoothDevice.BTDeviceState.Ok;
    }

    name() {
      return "Test Powermeter";
    }

    hasPower() {
      return true;
    }

    hasCadence() {
      return false;
    }

    hasHrm() {
      return false;
    }

    updateSlope(tmNow, ftmsPct) {
      return Promise.resolve(false);
    }

    updateErg(tmNow, watts) {
      return Promise.resolve(false);
    }

    getDeviceId() {
      throw new Error("Method not implemented.");
    }

    updateResistance(tmNow, pct) {
      throw new Error("Method not implemented.");
    }

  }

  _exports.TestPowermeter = TestPowermeter;

  class BluetoothHrmDevice extends _WebBluetoothDevice.BluetoothDeviceShared {
    constructor(gattDevice) {
      super(gattDevice);
      this._startupPromise = this._startupPromise.then(() => {
        // need to start up property monitoring for ftms
        const fnHrmData = evt => {
          this._decodeHrmData(evt.target.value);
        };

        return (0, _DeviceUtils.monitorCharacteristic)(gattDevice, 'heart_rate', 'heart_rate_measurement', fnHrmData);
      });
    }

    _decodeHrmData(dataView) {
      const tmNow = new Date().getTime();
      const flags = dataView.getUint8(0);
      let hr = 0;

      if ((flags & 1) === 0) {
        // this is a uint8 hrm
        hr = dataView.getUint8(1);
      } else {
        // this is a uint16 hrm
        hr = dataView.getUint16(1, true);
      }

      this._notifyNewHrm(tmNow, hr);
    }

    hasPower() {
      return false;
    }

    hasCadence() {
      return false;
    }

    hasHrm() {
      return true;
    }

    getDeviceTypeDescription() {
      return "Bluetooth HRM";
    }

    updateErg(tmNow, watts) {
      return Promise.resolve(false);
    }

    updateSlope(tmNow, ftmsPct) {
      return Promise.resolve(false);
    }

    updateResistance(tmNow, pct) {
      return Promise.resolve(false);
    }

  }

  class TestDeviceFactory {
    async findDisplay() {
      this._checkAvailable();

      const filters = {
        filters: [{
          services: [_DeviceUtils.serviceUuids.display4iiii]
        }]
      };
      const device = await navigator.bluetooth.requestDevice(filters);

      if (device.gatt) {
        const gattServer = await device.gatt.connect();
        const displayService = await gattServer.getPrimaryService(_DeviceUtils.serviceUuids.display4iiii);
        const displayCp = await displayService.getCharacteristic(_DeviceUtils.serviceUuids.display4iiiiControlPoint);
        return displayCp;
      } else {
        throw new Error("No device gatt?");
      }
    }

    async findPowermeter(byPlugin) {
      this._checkAvailable();

      const filters = {
        filters: [{
          services: ['cycling_power']
        }, {
          services: ['fitness_machine', 'cycling_power']
        }, {
          services: [_DeviceUtils.serviceUuids.kickrService, 'cycling_power']
        }]
      };
      return navigator.bluetooth.requestDevice(filters).then(device => {
        if (device.gatt) {
          return device.gatt.connect();
        } else {
          throw new Error("No device gatt?");
        }
      }).then(gattServer => {
        (0, _DeviceUtils.deviceUtilsNotifyConnect)();
        return gattServer.getPrimaryServices().then(services => {
          const ftms = (0, _DeviceUtils.getFtms)(services);
          const cps = (0, _DeviceUtils.getCps)(services);
          const kickr = (0, _DeviceUtils.getKickrService)(services);

          if (ftms) {
            return new _WebBluetoothDevice.BluetoothFtmsDevice(gattServer);
          } else if (kickr) {
            return new _WebBluetoothDevice.BluetoothKickrDevice(gattServer);
          } else if (cps) {
            return new _WebBluetoothDevice.BluetoothCpsDevice(gattServer);
          } else {
            throw new Error("We don't recognize what kind of device this is");
          }
        });
      });
    }

    async findHrm() {
      this._checkAvailable();

      const filters = {
        filters: [{
          services: ['heart_rate']
        }]
      };
      return navigator.bluetooth.requestDevice(filters).then(device => {
        if (device.gatt) {
          return device.gatt.connect();
        } else {
          throw new Error("No device gatt?");
        }
      }).then(gattServer => {
        (0, _DeviceUtils.deviceUtilsNotifyConnect)();
        return gattServer.getPrimaryServices().then(services => {
          const hrm = (0, _DeviceUtils.getHrm)(services);

          if (hrm) {
            return new BluetoothHrmDevice(gattServer);
          } else {
            throw new Error("We don't recognize what kind of device this is");
          }
        });
      });
    }

    async _checkAvailable() {
      if (window.location.search.includes('fake') || window.location.hostname === 'localhost') {
        return;
      }

      const available = await navigator.bluetooth.getAvailability();

      if (!available) {
        const msg = "It looks like your browser/OS combo doesn't support BLE in the browser.\n\nOr your bluetooth is disabled.\n\nTourJS is best enjoyed on a Mac with Chrome or Android phone with Chrome.  If it asks for location services, allow them.  If none of that works, try a paid service like Zwift.";
        alert(msg);
        throw msg;
      }
    }

  }

  const g_deviceFactory = new TestDeviceFactory();

  function getDeviceFactory() {
    return g_deviceFactory;
  }
});
;define("bt-web2/pojs/DeviceUtils", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getFtms = getFtms;
  _exports.getHrm = getHrm;
  _exports.getCps = getCps;
  _exports.getKickrService = getKickrService;
  _exports.monitorCharacteristic = monitorCharacteristic;
  _exports.deviceUtilsNotifyConnect = deviceUtilsNotifyConnect;
  _exports.writeToCharacteristic = writeToCharacteristic;
  _exports.serviceUuids = void 0;
  const serviceUuids = {
    ftms: '00001826-0000-1000-8000-00805f9b34fb',
    cps: '00001818-0000-1000-8000-00805f9b34fb',
    kickrService: 'a026ee01-0a7d-4ab3-97fa-f1500f9feb8b',
    display4iiii: '9891eaf5-5456-11eb-ae93-0242ac130002',
    display4iiiiControlPoint: '2ebe05f1-20f5-ec8e-374e-fc1900003c16',
    kickrWriteCharacteristic: 'a026e005-0a7d-4ab3-97fa-f1500f9feb8b',
    hrm: '0000180d-0000-1000-8000-00805f9b34fb'
  };
  _exports.serviceUuids = serviceUuids;

  function getFtms(services) {
    return services.find(service => service.uuid === serviceUuids.ftms) || null;
  }

  function getHrm(services) {
    return services.find(service => service.uuid === serviceUuids.hrm) || null;
  }

  function getCps(services) {
    return services.find(service => service.uuid === serviceUuids.cps) || null;
  }

  function getKickrService(services) {
    return services.find(service => service.uuid === serviceUuids.kickrService) || null;
  }

  function monitorCharacteristic(deviceServer, serviceName, characteristicName, fnCallback) {
    return deviceServer.getPrimaryService(serviceName).then(service => {
      return service.getCharacteristic(characteristicName);
    }).then(characteristic => {
      return characteristic.startNotifications();
    }).then(characteristic => {
      characteristic.addEventListener('characteristicvaluechanged', fnCallback);
      return deviceServer;
    });
  }

  function msPromise(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  let g_writeQueue = Promise.resolve();
  let g_cachedFtms = new Map();

  function deviceUtilsNotifyConnect() {
    g_writeQueue = Promise.resolve();
    g_cachedFtms = new Map();
  }

  function writeToCharacteristic(deviceServer, serviceName, characteristicName, arrayBufferToWrite) {
    g_writeQueue = g_writeQueue.catch(failure => {
      // the previous 
      console.log("The previous write-queue operation failed and the caller didn't clean it up >:(", failure);
    }).then(() => {
      if (serviceName === 'fitness_machine') {
        if (g_cachedFtms.has(characteristicName)) {
          const char = g_cachedFtms.get(characteristicName);

          if (char) {
            return char.writeValue(arrayBufferToWrite);
          }
        }
      }

      return deviceServer.getPrimaryService(serviceName).then(service => {
        return msPromise(100).then(() => {
          return service.getCharacteristic(characteristicName);
        });
      }).then(characteristic => {
        if (serviceName === 'fitness_machine') {
          g_cachedFtms.set(characteristicName, characteristic);
        }

        return msPromise(100).then(() => {
          return characteristic.writeValue(arrayBufferToWrite);
        });
      });
    });
    return g_writeQueue;
  }
});
;define("bt-web2/pojs/WebBluetoothDevice", ["exports", "bt-web2/pojs/DeviceUtils", "bt-web2/tourjs-shared/Utils"], function (_exports, _DeviceUtils, _Utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.BluetoothKickrDevice = _exports.BluetoothCpsDevice = _exports.BluetoothFtmsDevice = _exports.BluetoothDeviceShared = _exports.PowerDataDistributor = _exports.BTDeviceState = void 0;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  let BTDeviceState;
  _exports.BTDeviceState = BTDeviceState;

  (function (BTDeviceState) {
    BTDeviceState[BTDeviceState["Ok"] = 0] = "Ok";
    BTDeviceState[BTDeviceState["BrieflyGone"] = 1] = "BrieflyGone";
    BTDeviceState[BTDeviceState["ExtendedGone"] = 2] = "ExtendedGone";
    BTDeviceState[BTDeviceState["Disconnected"] = 3] = "Disconnected";
  })(BTDeviceState || (_exports.BTDeviceState = BTDeviceState = {}));

  class PowerDataDistributor {
    constructor() {
      _defineProperty(this, "_powerOutput", []);

      _defineProperty(this, "_cadenceOutput", []);

      _defineProperty(this, "_hrmOutput", []);

      _defineProperty(this, "_slopeSource", null);

      _defineProperty(this, "_userWantsToKeep", true);

      _defineProperty(this, "_deviceFlags", 0);
    }

    getDeviceFlags() {
      return this._deviceFlags;
    }

    setDeviceFlags(flags) {
      this._deviceFlags = flags;
    }

    disconnect() {
      this._userWantsToKeep = false;
      return Promise.resolve();
    }

    userWantsToKeep() {
      return this._userWantsToKeep;
    }

    setPowerRecipient(who) {
      this._powerOutput.push(who);
    }

    setCadenceRecipient(who) {
      this._cadenceOutput.push(who);
    }

    setHrmRecipient(who) {
      this._hrmOutput.push(who);
    }

    setSlopeSource(who) {
      this._slopeSource = who;
    }

    _notifyNewPower(tmNow, watts) {
      this._powerOutput.forEach(pwr => {
        pwr(tmNow, watts);
      });
    }

    _notifyNewCadence(tmNow, cadence) {
      this._cadenceOutput.forEach(cad => {
        cad.notifyCadence(tmNow, cadence);
      });
    }

    _notifyNewHrm(tmNow, newHrm) {
      this._hrmOutput.forEach(hrm => {
        hrm.notifyHrm(tmNow, newHrm);
      });
    }

  }

  _exports.PowerDataDistributor = PowerDataDistributor;

  class BluetoothDeviceShared extends PowerDataDistributor {
    constructor(gattDevice) {
      super();

      _defineProperty(this, "_gattDevice", void 0);

      _defineProperty(this, "_state", void 0);

      _defineProperty(this, "_startupPromise", Promise.resolve());

      this._gattDevice = gattDevice;
      this._state = BTDeviceState.Disconnected;
    }

    disconnect() {
      return super.disconnect().then(() => {
        this._gattDevice.disconnect();

        return Promise.resolve();
      });
    }

    getDeviceId() {
      return this._gattDevice.device.id;
    }

    getState() {
      return this._state;
    }

    name() {
      return this._gattDevice.device.name || "Unknown";
    }

  }

  _exports.BluetoothDeviceShared = BluetoothDeviceShared;

  class BluetoothFtmsDevice extends BluetoothDeviceShared {
    constructor(gattDevice) {
      super(gattDevice);

      _defineProperty(this, "_hasSeenCadence", false);

      _defineProperty(this, "_tmLastErgUpdate", 0);

      _defineProperty(this, "_tmLastSlopeUpdate", 0);

      this._startupPromise = this._startupPromise.then(() => {
        // need to start up property monitoring for ftms
        const fnIndoorBikeData = evt => {
          this._decodeIndoorBikeData(evt.target.value);
        };

        return (0, _DeviceUtils.monitorCharacteristic)(gattDevice, 'fitness_machine', 'indoor_bike_data', fnIndoorBikeData).then(() => {
          const fnFtmsStatus = evt => {
            this._decodeFitnessMachineStatus(evt.target.value);
          };

          return (0, _DeviceUtils.monitorCharacteristic)(gattDevice, 'fitness_machine', 'fitness_machine_status', fnFtmsStatus);
        }).then(() => {
          const fnFtmsControlPoint = evt => {
            this._decodeFtmsControlPoint(evt.target.value);
          };

          return (0, _DeviceUtils.monitorCharacteristic)(gattDevice, 'fitness_machine', 'fitness_machine_control_point', fnFtmsControlPoint);
        }).then(() => {
          const charOut = new DataView(new ArrayBuffer(1));
          charOut.setUint8(0, 0); // request control

          return (0, _DeviceUtils.writeToCharacteristic)(gattDevice, 'fitness_machine', 'fitness_machine_control_point', charOut);
        });
      });
    }

    getDeviceTypeDescription() {
      return "FTMS Smart Trainer";
    }

    updateErg(tmNow, watts) {
      const dtMs = tmNow - this._tmLastErgUpdate;

      if (dtMs < 500) {
        return Promise.resolve(false); // don't update the ftms device too often
      }

      this._tmLastErgUpdate = tmNow;
      console.log("updating FTMS device with erg " + watts.toFixed(0) + 'W');
      const charOut = new DataView(new ArrayBuffer(20));
      charOut.setUint8(0, 5); // setTargetPower

      charOut.setInt16(1, watts, true);
      return (0, _DeviceUtils.writeToCharacteristic)(this._gattDevice, 'fitness_machine', 'fitness_machine_control_point', charOut).then(() => {
        console.log("sent FTMS command to " + this._gattDevice.device.name);
        return true;
      }).catch(failure => {
        throw failure;
      });
    }

    updateSlope(tmNow, ftmsPct) {
      const dtMs = tmNow - this._tmLastSlopeUpdate;

      if (dtMs < 500) {
        return Promise.resolve(false); // don't update the ftms device too often
      }

      this._tmLastSlopeUpdate = tmNow;

      if (!this._slopeSource) {
        console.log("Not updating FTMS device because no slope source");
        return Promise.resolve(false);
      }

      let slopeInWholePercent = this._slopeSource.getLastSlopeInWholePercent() * ftmsPct;

      if (slopeInWholePercent < 0) {
        slopeInWholePercent /= 4; // zwift-style, let's not spin out on downhills
      }

      console.log("updating FTMS device with slope " + slopeInWholePercent.toFixed(1) + '%');
      const charOut = new DataView(new ArrayBuffer(7));
      charOut.setUint8(0, 0x11); // setIndoorBikesimParams
      // the actual object looks like:
      // typedef struct
      // {
      //   int16_t windMmPerSec;
      //   int16_t gradeHundredths;
      //   uint8_t crrTenThousandths;
      //   uint8_t windResistanceCoefficientHundredths; // in "kilograms per meter"
      // } INDOORBIKESIMPARAMS;

      charOut.setInt16(1, 0, true);
      charOut.setInt16(3, slopeInWholePercent * 100, true);
      charOut.setUint8(5, 33);
      charOut.setUint8(6, 0);
      return (0, _DeviceUtils.writeToCharacteristic)(this._gattDevice, 'fitness_machine', 'fitness_machine_control_point', charOut).then(() => {
        console.log("sent FTMS command to " + this._gattDevice.device.name);
        return true;
      }).catch(failure => {
        throw failure;
      });
    }

    updateResistance(tmNow, pct) {
      const dtMs = tmNow - this._tmLastSlopeUpdate;

      if (dtMs < 500) {
        return Promise.resolve(false); // don't update the ftms device too often
      }

      this._tmLastSlopeUpdate = tmNow;
      const charOut = new DataView(new ArrayBuffer(7));
      charOut.setUint8(0, 0x04); // setTargetResistance

      charOut.setUint8(1, pct * 200);
      return (0, _DeviceUtils.writeToCharacteristic)(this._gattDevice, 'fitness_machine', 'fitness_machine_control_point', charOut).then(() => {
        console.log("sent FTMS resistance command to " + this._gattDevice.device.name);
        return true;
      }).catch(failure => {
        throw failure;
      });
    }

    hasPower() {
      return true;
    }

    hasCadence() {
      return this._hasSeenCadence;
    }

    hasHrm() {
      return false;
    }

    _decodeFtmsControlPoint(dataView) {
      // we're mainly just looking for the "control not permitted" response so we can re-request control
      console.log("decoding ftms control point");

      if (dataView.getUint8(0) === 0x80) {
        // this is a response
        if (dataView.getUint8(2) === 0x5) {
          // this says "control not permitted"
          const dvTakeControl = new DataView(new ArrayBuffer(1));
          dvTakeControl.setUint8(0, 0);
          return (0, _DeviceUtils.writeToCharacteristic)(this._gattDevice, 'fitness_machine', 'fitness_machine_control_point', dvTakeControl).catch(() => {// oh well, try again I guess?
          });
        }
      }
    }

    _decodeIndoorBikeData(dataView) {
      const tmNow = new Date().getTime();
      const update = {};
      const flags = dataView.getUint16(0, true);
      const MORE_DATA = 1 << 0;
      const AVERAGE_SPEED = 1 << 1;
      const INSTANT_CADENCE = 1 << 2;
      const AVERAGE_CADENCE = 1 << 3;
      const TOTALDISTANCE = 1 << 4;
      const RESISTANCELEVEL = 1 << 5;
      const INSTANT_POWER = 1 << 6;
      const AVERAGE_POWER = 1 << 7;
      const EXPENDED_ENERGY = 1 << 8;
      const HEART_RATE = 1 << 9;
      let pos = 2;

      if (!(flags & MORE_DATA)) {
        const kph100 = dataView.getUint16(pos, true);
        pos += 2;
        update.lastSpeedKph = kph100 / 100;
      }

      if (flags & AVERAGE_SPEED) {
        pos += 2; // we don't care about this, so we'll just skip the bytes
      }

      if (flags & INSTANT_CADENCE) {
        const cadence2 = dataView.getUint16(pos, true);
        pos += 2;

        this._notifyNewCadence(tmNow, cadence2 / 2);

        this._hasSeenCadence = true;
      }

      if (flags & AVERAGE_CADENCE) {
        pos += 2;
      }

      if (flags & TOTALDISTANCE) {
        pos += 3;
      }

      if (flags & RESISTANCELEVEL) {
        pos += 2;
      }

      if (flags & INSTANT_POWER) {
        const power = dataView.getInt16(pos, true);
        pos += 2;

        this._notifyNewPower(tmNow, power);
      }

      if (flags & AVERAGE_POWER) {
        pos += 2;
      }
    }

    _decodeFitnessMachineStatus(value) {}

  }

  _exports.BluetoothFtmsDevice = BluetoothFtmsDevice;

  class BluetoothCpsDevice extends BluetoothDeviceShared {
    updateSlope(tmNow, ftmsPct) {
      // powermeters don't have slope adjustment, dummy!
      return Promise.resolve(false);
    }

    updateErg(tmNow, watts) {
      return Promise.resolve(false);
    }

    getDeviceTypeDescription() {
      return "Bluetooth Powermeter";
    }

    constructor(gattDevice) {
      super(gattDevice);

      _defineProperty(this, "_hasSeenCadence", false);

      this._startupPromise = this._startupPromise.then(() => {
        // need to start up property monitoring for ftms
        return (0, _DeviceUtils.monitorCharacteristic)(gattDevice, 'cycling_power', 'cycling_power_measurement', evt => this.onPowerMeasurementChanged(evt.target.value));
      });
    }

    onPowerMeasurementChanged(buf) {
      const tmNow = new Date().getTime();
      const flags = buf.getUint16(0);
      const power = buf.getInt16(2, true);
      console.log('power device sez ', power);

      this._notifyNewPower(tmNow, power);
    }

    updateResistance(tmNow, pct) {
      return Promise.resolve(false);
    }

    hasPower() {
      return true;
    }

    hasCadence() {
      return this._hasSeenCadence;
    }

    hasHrm() {
      return false;
    }

  }

  _exports.BluetoothCpsDevice = BluetoothCpsDevice;

  class BluetoothKickrDevice extends BluetoothCpsDevice {
    static getKickrDevice() {
      return BluetoothKickrDevice._singleton;
    }

    constructor(gattDevice) {
      super(gattDevice);

      _defineProperty(this, "_downhillValue", 0x3fff);

      _defineProperty(this, "_uphillValue", 0x2000);

      _defineProperty(this, "_lastSlopeSent", 0);

      _defineProperty(this, "_responsed", false);

      _defineProperty(this, "_tmLastSlopeUpdate", 0);

      _defineProperty(this, "_tmLastErgUpdate", 0);

      BluetoothKickrDevice._singleton = this;

      try {
        const dh = parseInt(window.localStorage.getItem('kickr-downhill-number') || '0x3fff');
        const uh = parseInt(window.localStorage.getItem('kickr-uphill-number') || '0x3fff');

        if (isFinite(dh) && isFinite(uh) && dh >= 0 && dh <= 0x3fff && uh >= 0 && uh <= 0x3fff && dh > uh) {
          this._downhillValue = dh;
          this._uphillValue = uh;
          console.log("kickr inited to ", dh, uh);
        }
      } catch (e) {}

      this._startupPromise = this._startupPromise.then(() => {
        return (0, _DeviceUtils.monitorCharacteristic)(gattDevice, 'cycling_power', _DeviceUtils.serviceUuids.kickrWriteCharacteristic, evt => this._handleKickrResponse(evt.target.value));
      }).catch(failure => {
        throw failure;
      });
    }

    getDeviceTypeDescription() {
      return "Wahoo Kickr";
    }

    _handleKickrResponse(value) {
      this._responsed = true;
    }

    setUphillDownhill(downhillValue, uphillValue) {
      this._downhillValue = downhillValue;
      this._uphillValue = uphillValue;
    }

    updateSlope(tmNow, ftmsPct) {
      // we're a kickr!  despite launching as the "open source" trainer, our protocol does
      // not appear to be public.  Therefore, I'm going to send hills as resistance levels
      // since I can't figure out how to reliably do the sim-mode commands.
      // this is not a trainer, but we don't want to force all the powermeters and hrms to implement this method.
      if (!this._slopeSource) {
        return Promise.resolve(false);
      }

      const dtMs = tmNow - this._tmLastSlopeUpdate;

      if (dtMs < 500) {
        return Promise.resolve(false); // don't update the ftms device too often
      }

      this._tmLastSlopeUpdate = tmNow; // from goobering around with nRF connect and trainerroad's "set resistance strength"
      // slider, it looks like the kickr's set resistance command looks like:
      // 6 bytes: [01 40 01 00 XX YY]
      // XX: LSB of a 16-bit uint
      // YY: MSB of a 16-bit uint
      // the uint goes from 0 (full resistance) to 3fff (no resistance), which is a little strange
      // but whatevs.

      const charOut = new DataView(new ArrayBuffer(3));
      charOut.setUint8(0, 0x40);
      const minSlope = -10;
      const maxSlope = 10; // if we ever peg the kickr at max slope, you basically can't turn the pedals

      let slopeInWholePercent = this._slopeSource.getLastSlopeInWholePercent() * ftmsPct;
      const slopeShiftRate = 0.5; // bounds!

      slopeInWholePercent = Math.min(slopeInWholePercent, maxSlope);
      slopeInWholePercent = Math.max(slopeInWholePercent, minSlope);
      slopeInWholePercent = Math.max(slopeInWholePercent, this._lastSlopeSent - slopeShiftRate);
      slopeInWholePercent = Math.min(slopeInWholePercent, this._lastSlopeSent + slopeShiftRate);
      this._lastSlopeSent = slopeInWholePercent;
      const offset = slopeInWholePercent - minSlope;
      const span = maxSlope - minSlope;
      const pctUphill = offset / span;
      let pctUphillClamped = Math.max(0, pctUphill);
      pctUphillClamped = Math.min(1, pctUphill);
      const resistanceAtDownhill = this._downhillValue;
      const resistanceAtUphill = this._uphillValue;
      (0, _Utils.assert2)(pctUphillClamped >= 0 && pctUphillClamped <= 1);
      let uint16 = pctUphillClamped * resistanceAtUphill + (1 - pctUphillClamped) * resistanceAtDownhill;
      uint16 = Math.max(this._uphillValue, uint16);
      uint16 = Math.min(this._downhillValue, uint16);
      const buf = Buffer.alloc(2);
      buf.writeUInt16LE(uint16, 0);
      console.log("sending ", uint16, pctUphillClamped);
      charOut.setUint16(1, buf.readUInt16LE(0), true);
      return (0, _DeviceUtils.writeToCharacteristic)(this._gattDevice, 'cycling_power', _DeviceUtils.serviceUuids.kickrWriteCharacteristic, charOut).then(() => {
        return true;
      }).catch(failure => {
        throw failure;
      });
    }

    updateErg(tmNow, watts) {
      const dtMs = tmNow - this._tmLastErgUpdate;

      if (dtMs < 500) {
        return Promise.resolve(false); // don't update the ftms device too often
      }

      const charOut = new DataView(new ArrayBuffer(3));
      charOut.setUint8(0, 0x42); // setTargetPower

      charOut.setUint16(1, watts, true); // setTargetPower

      console.log("writing ", charOut.buffer, " to kickr");
      return (0, _DeviceUtils.writeToCharacteristic)(this._gattDevice, 'cycling_power', _DeviceUtils.serviceUuids.kickrWriteCharacteristic, charOut);
    }

    updateResistance(tmNow, pct) {
      const dtMs = tmNow - this._tmLastSlopeUpdate;

      if (dtMs < 500) {
        return Promise.resolve(false); // don't update the ftms device too often
      }

      this._tmLastSlopeUpdate = tmNow;
      console.log("kickr updating slope to ", pct);
      const charOut = new DataView(new ArrayBuffer(3));
      charOut.setUint8(0, 0x40);
      const pctUphill = pct;
      let pctUphillClamped = Math.max(0, pctUphill);
      pctUphillClamped = Math.min(1, pctUphill);
      const resistanceAtDownhill = 0x5f5b;
      const resistanceAtUphill = 0x185b;
      (0, _Utils.assert2)(pctUphillClamped >= 0 && pctUphillClamped <= 1);
      const uint16 = pctUphillClamped * resistanceAtUphill + (1 - pctUphillClamped) * resistanceAtDownhill;
      console.log("sending ", uint16, pctUphillClamped);
      charOut.setUint8(1, uint16 & 0xff);
      charOut.setUint8(2, uint16 >> 8 & 0xff);
      return (0, _DeviceUtils.writeToCharacteristic)(this._gattDevice, 'cycling_power', _DeviceUtils.serviceUuids.kickrWriteCharacteristic, charOut).then(() => {
        return true;
      }).catch(failure => {
        throw failure;
      });
    }

    hasCadence() {
      return false;
    }

    hasHrm() {
      return false;
    }

  }

  _exports.BluetoothKickrDevice = BluetoothKickrDevice;

  _defineProperty(BluetoothKickrDevice, "_singleton", null);
});
;define("bt-web2/race-results/route", ["exports", "bt-web2/set-up-ride/route"], function (_exports, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function processQueryParam(search) {
    const vals = search.replace('?', '');
    let splitted = vals.split('&');
    let ret = {};
    const key = splitted.forEach(split => {
      const keyvalue = split.split('=');
      ret[keyvalue[0]] = keyvalue.slice(1).join('=');
    });
    return ret;
  }

  class RaceResults extends Ember.Route.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    model(params) {
      console.log("race-results params: ", params);
      return (0, _route.apiGet)('race-results', {
        key: params.key
      });
    }

  }

  _exports.default = RaceResults;
});
;define("bt-web2/race-results/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "aI9xuFdk",
    "block": "{\"symbols\":[],\"statements\":[[1,[28,\"display-post-race\",null,[[\"results\"],[[24,[\"model\"]]]]],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/race-results/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/resolver", ["exports", "ember-resolver"], function (_exports, _emberResolver) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = _emberResolver.default;
  _exports.default = _default;
});
;define("bt-web2/results/controller", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class Results extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    queryParams: ['md5'],
    md5: ''
  }) {} // normal class body definition here
  // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.


  _exports.default = Results;
});
;define("bt-web2/results/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class Results extends Ember.Route.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    setupController(controller, model) {
      controller.set('model', model);
    }

  }

  _exports.default = Results;
});
;define("bt-web2/results/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "I/DEeH3y",
    "block": "{\"symbols\":[],\"statements\":[[7,\"div\",true],[10,\"class\",\"index__container\"],[8],[0,\"\\n  \"],[1,[22,\"tourjs-header\"],false],[0,\"\\n  \"],[1,[28,\"stored-data\",null,[[\"override\"],[[24,[\"md5\"]]]]],false],[0,\"\\n\"],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/results/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/ride/controller", ["exports", "bt-web2/tourjs-shared/User", "bt-web2/config/environment", "bt-web2/tourjs-shared/communication"], function (_exports, _User, _environment, _communication) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _dec, _dec2, _dec3, _dec4, _class, _temp;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  let Ride = (_dec = Ember.computed("devices.ridersVersion", "connection._updateVersion"), _dec2 = Ember.computed("devices.ridersVersion", "connection._updateVersion"), _dec3 = Ember.computed("devices.ridersVersion", "connection._updateVersion"), _dec4 = Ember.computed("frame"), (_class = (_temp = class Ride extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service(),
    connection: Ember.inject.service(),
    _raceState: null,
    hasSentPwx: false,
    _gameId: '',
    actions: {
      doneAddingUser(user) {
        console.log("done adding user", user, " with md5 ", user.bigImageMd5);
        this.devices.addUser(user);

        this._setup(this.get('_gameId'));
      }

    },
    watchForRaceCompletion: Ember.observer('connection.postRace', function () {})
  }) {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "lastLocalMeters", 0);

      _defineProperty(this, "myTimeout", 0);

      _defineProperty(this, "frame", 0);

      _defineProperty(this, "_raceState", null);

      _defineProperty(this, "_userSignedIn", false);
    }

    _setup(gameId) {
      this.set('_gameId', gameId);
      const user = this.devices.getLocalUser();

      if (!user) {
        // nuthin to do yet
        this.set('_userSignedIn', false);
        return Promise.resolve();
      }

      this.set('_userSignedIn', true);
      const targetHost = _environment.default.gameServerHost;

      const fnOnNewRaceState = raceState => {
        console.log("connected, new race state! ", raceState);
        this.set('_raceState', raceState);
        this.myTimeout = setTimeout(() => this._tick(), 15);
        this.set('hasSentPwx', false);
        return this._raceState;
      };

      return this.connection.connect(targetHost, gameId, "TheJoneses", user, fnOnNewRaceState).then(fnOnNewRaceState, failure => {
        const yn = confirm(`Failed to connect to ${targetHost}.  Start setup again?`);

        if (yn) {
          return this.transitionToRoute('set-up-user');
        }
      });
    }

    _tick() {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      const tmNow = new Date().getTime();
      const users = this.devices.getUsers(tmNow);

      if (users.length <= 0) {
        const yn = confirm("There aren't any users.  Start setup again?");

        if (yn) {
          return this.transitionToRoute('set-up-user');
        }
      }

      const raceState = this.get('_raceState');

      if (!raceState) {
        throw new Error("Failed to find race state");
      }

      if (raceState.isOldNews()) {
        return;
      }

      raceState.tick(tmNow);
      {
        const user = raceState.getLocalUser();

        if (user) {
          if (user.getDistance() >= raceState.getMap().getLength() && !this.get('hasSentPwx')) {
            this.devices.dumpPwx("Online-Race", tmNow);
            this.set('hasSentPwx', true);
          }
        }
      }
      this.devices.tick(tmNow, true);
      const conn = this.get('connection');

      if (conn.postRace && conn.raceResults) {
        // we're post race!  let's just transition to the post-race route
        conn.disconnect('');
        const rr = conn.raceResults;
        setTimeout(() => {
          window.location.href = `/race-results/${_communication.S2CFinishUpdate.getPermanentKey(rr)}`;
        }, 1000);
      } else {
        this.myTimeout = setTimeout(() => this._tick(), 15);
        this.incrementProperty('frame');
      }
    }

    get localRidersPreRace() {
      if (!this._raceState) {
        return [];
      }

      const tmNow = new Date().getTime();
      return this.devices.getUsers(tmNow).filter(user => {
        return user.getUserType() & _User.UserTypeFlags.Local;
      }).map(localUser => {
        return localUser.getDisplay(this._raceState);
      });
    }

    get nonLocalHumans() {
      if (!this._raceState) {
        return [];
      }

      const tmNow = new Date().getTime();
      return this.devices.getUsers(tmNow).filter(user => {
        return !(user.getUserType() & _User.UserTypeFlags.Local) && !(user.getUserType() & _User.UserTypeFlags.Ai);
      }).map(localUser => {
        return localUser.getDisplay(this._raceState);
      });
    }

    get ais() {
      if (!this._raceState) {
        return [];
      }

      const tmNow = new Date().getTime();
      return this.devices.getUsers(tmNow).filter(user => {
        return !(user.getUserType() & _User.UserTypeFlags.Local) && user.getUserType() & _User.UserTypeFlags.Ai;
      }).map(localUser => {
        return localUser.getDisplay(this._raceState);
      });
    }

    get remoteRiders() {
      if (!this._raceState) {
        return [];
      }

      const tmNow = new Date().getTime();
      return this.devices.getUsers(tmNow).filter(user => {
        return user.getUserType() & _User.UserTypeFlags.Remote;
      }).map(localUser => {
        return localUser.getDisplay(this._raceState);
      });
    }

  }, _temp), (_applyDecoratedDescriptor(_class.prototype, "localRidersPreRace", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "localRidersPreRace"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "nonLocalHumans", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "nonLocalHumans"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "ais", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "ais"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "remoteRiders", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "remoteRiders"), _class.prototype)), _class)); // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.

  _exports.default = Ride;
});
;define("bt-web2/ride/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class Ride extends Ember.Route.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    setupController(controller, model) {
      controller._setup(model.gameId);
    }

  }

  _exports.default = Ride;
});
;define("bt-web2/ride/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "tmoITTyH",
    "block": "{\"symbols\":[],\"statements\":[[4,\"if\",[[24,[\"connection\",\"preRace\"]]],null,{\"statements\":[[0,\"  \"],[1,[28,\"display-pre-race\",null,[[\"frame\",\"localRiders\",\"nonLocalHumans\",\"ais\"],[[24,[\"frame\"]],[24,[\"localRidersPreRace\"]],[24,[\"nonLocalHumans\"]],[24,[\"ais\"]]]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[4,\"if\",[[24,[\"connection\",\"racing\"]]],null,{\"statements\":[[4,\"if\",[[24,[\"_raceState\"]]],null,{\"statements\":[[0,\"    \"],[1,[28,\"display-race\",null,[[\"raceState\",\"overlay\",\"mode\"],[[24,[\"_raceState\"]],\"leader-board\",\"3d\"]]],false],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"    Connecting...\\n\"]],\"parameters\":[]}]],\"parameters\":[]},null]],\"parameters\":[]}],[0,\"\\n\"],[4,\"unless\",[[24,[\"_userSignedIn\"]]],null,{\"statements\":[[0,\"  \"],[7,\"div\",true],[10,\"class\",\"new-user__container\"],[8],[0,\"\\n    \"],[1,[28,\"user-set-up-widget\",null,[[\"onDone\"],[[28,\"action\",[[23,0,[]],\"doneAddingUser\"],null]]]],false],[0,\"\\n  \"],[9],[0,\"\\n\"]],\"parameters\":[]},null]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/ride/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/router", ["exports", "bt-web2/config/environment", "bt-web2/pojs/WebBluetoothDevice"], function (_exports, _environment, _WebBluetoothDevice) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  let lastRoute = '';
  const Router = Ember.Router.extend({
    location: _environment.default.locationType,
    rootURL: _environment.default.rootURL,
    connection: Ember.inject.service(),
    devices: Ember.inject.service(),

    init() {
      this._super(...arguments);

      this.on('routeDidChange', transition => {
        console.log("transition = ", transition);

        if (transition.from) {
          switch (transition.from.name) {
            case 'pacing-challenge-race':
              this.get('devices').dumpPwx('pacing-challenge-abandoned');
              break;

            case 'ride':
              console.log("they jumped away from the ride screen.  We probably need to disconnect");
              console.log("connections = ", this.get('connection'));
              this.get('connection').disconnect(`Quit-${transition.from.name}`);
              break;

            case 'kickr-setup':
              // in kickr-setup, they're likely to have screwed around with the kickr's slope source and settings
              console.log("they've exited kickr-setup");

              const kickr = _WebBluetoothDevice.BluetoothKickrDevice.getKickrDevice();

              if (kickr) {
                this.get('devices').setLocalUserDevice(kickr, 0x7);
                console.log("reset their use of the kickr");
              }

              break;
          }
        }
      });
    }

  });
  Router.map(function () {
    this.route('set-up-user');
    this.route('set-up-ride');
    this.route('ride', {
      path: '/ride/:gameId'
    });
    this.route('set-up-join');
    this.route('test-hacks');
    this.route('strava-auth');
    this.route('hrm-control');
    this.route('pacing-challenge');
    this.route('pacing-challenge-race', {
      path: '/pacing-challenge-race/:pct'
    });
    this.route('results');
    this.route('kickr-setup');
    this.route('race-results', {
      path: '/race-results/:key'
    });
    this.route('ai');
    this.route('no-bluetooth');
  });
  var _default = Router;
  _exports.default = _default;
});
;define("bt-web2/serializers/wordpress/attachment", ["exports", "ember-wordpress/serializers/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/serializers/wordpress/category", ["exports", "ember-wordpress/serializers/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/serializers/wordpress/comment", ["exports", "ember-wordpress/serializers/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/serializers/wordpress/page", ["exports", "ember-wordpress/serializers/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/serializers/wordpress/post", ["exports", "ember-wordpress/serializers/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/serializers/wordpress/tag", ["exports", "ember-wordpress/serializers/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/serializers/wordpress/user", ["exports", "ember-wordpress/serializers/wordpress"], function (_exports, _wordpress) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = _wordpress.default.extend({});

  _exports.default = _default;
});
;define("bt-web2/services/auth", ["exports", "bt-web2/tourjs-client-shared/signin-client", "npm:auth0-js"], function (_exports, _signinClient, _npmAuth0Js) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class Auth extends Ember.Service.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    constructor() {
      super(...arguments);

      _defineProperty(this, "auth", new _signinClient.TourJsSignin());

      console.log(_npmAuth0Js.default);
      console.log("building auth service");
    }

  } // DO NOT DELETE: this is how TypeScript knows how to look up your services.


  _exports.default = Auth;
});
;define("bt-web2/services/connection", ["exports", "bt-web2/tourjs-shared/communication", "bt-web2/config/environment", "bt-web2/components/user-set-up-widget/component"], function (_exports, _communication, _environment, _component) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _temp;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  let Connection = (_dec = Ember.computed("_lastServerRaceState"), _dec2 = Ember.computed("_lastServerRaceState"), _dec3 = Ember.computed("_lastServerRaceState"), _dec4 = Ember.computed("_lastServerRaceState"), _dec5 = Ember.computed("_updateVersion"), (_class = (_temp = class Connection extends Ember.Service.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service()
  }) {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "_connectManager", new _communication.default(newFtp => this._onHandicapChange(newFtp), () => this._onLastServerRaceStateChange(), () => this._onNetworkUpdateComplete(), (client, image) => this._notifyNewUserNoticed(client, image)));

      _defineProperty(this, "_lastServerRaceState", 0);

      _defineProperty(this, "_updateVersion", 0);
    }

    _onHandicapChange(newHandicap) {
      localStorage.setItem(_component.USERSETUP_KEY_HANDICAP, newHandicap.toFixed(1));
    }

    _onLastServerRaceStateChange() {
      this.incrementProperty('_lastServerRaceState');
    }

    _onNetworkUpdateComplete() {
      this.incrementProperty('_updateVersion');
      this.set('msOfStart', this._connectManager.msOfStart);
    }

    _notifyNewUserNoticed(client, image) {
      this.devices.addRemoteUser(client, image);
    }

    connect(targetHost, gameId, accountId, user, fnOnNewRaceState) {
      let url = _environment.default.environment === 'production' ? `wss://${targetHost}:8080` : `ws://${targetHost}:8080`;
      return this._connectManager.connect(url, this.devices, gameId, accountId, user, fnOnNewRaceState);
    }

    disconnect(activityName) {
      const tmNow = new Date().getTime();

      if (activityName) {
        this.devices.dumpPwx(activityName, tmNow);
      }

      const user = this.devices.getLocalUser();

      if (user) {
        user.setId(-1);
      }

      this._connectManager.disconnect();
    }

    getUser(userId) {
      const user = this.devices.getUser(userId);
      return user || null;
    }

    getUserName(userId) {
      const user = this.devices.getUser(userId);
      return user && user.getName() || "Unknown";
    }

    chat(chat) {
      return this._connectManager.chat(chat);
    }

    get preRace() {
      return this._connectManager.preRace;
    }

    get racing() {
      return this._connectManager.racing;
    }

    get postRace() {
      return this._connectManager.postRace;
    }

    get msOfStart() {
      return this._connectManager.msOfStart;
    }

    get raceResults() {
      return this._connectManager.raceResults;
    }

    getRaceState() {
      return this._connectManager.getRaceState();
    }

  }, _temp), (_applyDecoratedDescriptor(_class.prototype, "preRace", [_dec], Object.getOwnPropertyDescriptor(_class.prototype, "preRace"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "racing", [_dec2], Object.getOwnPropertyDescriptor(_class.prototype, "racing"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "postRace", [_dec3], Object.getOwnPropertyDescriptor(_class.prototype, "postRace"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "msOfStart", [_dec4], Object.getOwnPropertyDescriptor(_class.prototype, "msOfStart"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "raceResults", [_dec5], Object.getOwnPropertyDescriptor(_class.prototype, "raceResults"), _class.prototype)), _class)); // DO NOT DELETE: this is how TypeScript knows how to look up your services.

  _exports.default = Connection;
});
;define("bt-web2/services/devices", ["exports", "bt-web2/pojs/WebBluetoothDevice", "bt-web2/tourjs-shared/User", "bt-web2/tourjs-shared/FileSaving", "bt-web2/tourjs-shared/Utils", "bt-web2/set-up-ride/route"], function (_exports, _WebBluetoothDevice, _User, _FileSaving, _Utils, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.dumpRaceResultToPWX = dumpRaceResultToPWX;
  _exports.default = _exports.DeviceFlags = _exports.PowerTimer = void 0;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class PowerTimer {
    constructor(tmStart) {
      _defineProperty(this, "tmStart", void 0);

      _defineProperty(this, "tmLast", void 0);

      _defineProperty(this, "sumPower", void 0);

      _defineProperty(this, "countPower", void 0);

      this.tmStart = tmStart;
      this.tmLast = tmStart;
      this.sumPower = 0;
      this.countPower = 0;
    }

    notifyPower(tmNow, power) {
      const dt = Math.min(2, (tmNow - this.tmLast) / 1000);

      if (dt <= 0) {
        return;
      }

      this.sumPower += power * dt;
      this.countPower += dt;
      this.tmLast = tmNow;
    }

    getAverage(tmNow) {
      const elapsedSeconds = this.countPower > 0 ? this.countPower : (tmNow - this.tmStart) / 1000;
      return {
        powerAvg: this.countPower > 0 ? this.sumPower / elapsedSeconds : 0,
        joules: this.sumPower,
        totalTimeSeconds: elapsedSeconds
      };
    }

  }

  _exports.PowerTimer = PowerTimer;

  function dumpRaceResultToPWX(submission) {
    const pwx = (0, _FileSaving.samplesToPWX)("Workout", submission);
    const lengthMeters = submission.samples[submission.samples.length - 1].distance - submission.samples[0].distance;
    var data = new Blob([pwx], {
      type: 'application/octet-stream'
    });
    var url = window.URL.createObjectURL(data);
    const linky = document.createElement('a');
    linky.href = url;
    linky.download = `TourJS-${submission.activityName}-${lengthMeters.toFixed(0)}m-${new Date(submission.samples[0].tm).toDateString()}.pwx`;
    linky.target = "_blank";
    document.body.appendChild(linky);
    linky.click();
    document.body.removeChild(linky);
  }

  let DeviceFlags;
  _exports.DeviceFlags = DeviceFlags;

  (function (DeviceFlags) {
    DeviceFlags[DeviceFlags["PowerOnly"] = 1] = "PowerOnly";
    DeviceFlags[DeviceFlags["Trainer"] = 2] = "Trainer";
    DeviceFlags[DeviceFlags["Cadence"] = 4] = "Cadence";
    DeviceFlags[DeviceFlags["Hrm"] = 8] = "Hrm";
    DeviceFlags[DeviceFlags["AllButHrm"] = 7] = "AllButHrm";
    DeviceFlags[DeviceFlags["All"] = 15] = "All";
  })(DeviceFlags || (_exports.DeviceFlags = DeviceFlags = {}));

  class Devices extends Ember.Service.extend({// anything which *must* be merged to prototype here
  }) {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "devices", []);

      _defineProperty(this, "users", []);

      _defineProperty(this, "deviceDescription", "No Device Connected");

      _defineProperty(this, "workoutSaver", null);

      _defineProperty(this, "_displayControlPoint", null);

      _defineProperty(this, "_displayWriteQueue", Promise.resolve());

      _defineProperty(this, "ridersVersion", 0);

      _defineProperty(this, "goodUpdates", 0);

      _defineProperty(this, "badUpdates", 0);

      _defineProperty(this, "ftmsLevel", 100);

      _defineProperty(this, "_powerCounters", new Map());

      _defineProperty(this, "_fnPowerFilter", num => {
        return num;
      });

      _defineProperty(this, "_tmLastDisplayUpdate", 0);

      _defineProperty(this, "_displayUpdates", 0);

      _defineProperty(this, "tmLastInternalTick", 0);

      _defineProperty(this, "nextTickHandle", 0);
    }

    setDisplayDevice(controlPoint) {
      this._displayControlPoint = controlPoint;

      this._internalTick(new Date().getTime());
    }

    setPowerFilter(fnPower) {
      this._fnPowerFilter = fnPower;
    }

    addDevice(device) {
      this.set('deviceDescription', `A ${device.getDeviceTypeDescription()} named ${device.name()}`);
      this.devices.push(device);
      console.log("added a device to device man: ", this.devices);
    }

    ftmsAdjust(amt) {
      this.incrementProperty('ftmsLevel', amt);
    }

    clearUsers() {
      this.devices.forEach(dev => {
        dev.disconnect();
      });
      console.log("cleared out devices ", this.devices);
      this.devices = [];
      this.users = [];
      this.incrementProperty('ridersVersion');
    }

    addRemoteUser(pos, image) {
      const tmNow = new Date().getTime();
      const newUser = new _User.User("Unknown User " + pos.id, _User.DEFAULT_RIDER_MASS, _User.DEFAULT_HANDICAP_POWER, _User.UserTypeFlags.Remote);

      if (image) {
        newUser.setImage(image, null);
      }

      newUser.setId(pos.id);
      newUser.absorbPositionUpdate(tmNow, pos);
      this.users.push(newUser);
      this.incrementProperty('ridersVersion');
    }

    addUser(user) {
      console.log("images adding user with image length ", user.imageBase64 && user.imageBase64.length);
      const newUser = new _User.User(user.name, _User.DEFAULT_RIDER_MASS, user.handicap, _User.UserTypeFlags.Local);
      const alreadyHaveLocal = this.getLocalUser();

      if (alreadyHaveLocal) {
        // get rid of the "local" user that we already have
        this.users = this.users.filter(user => user.getId() !== alreadyHaveLocal.getId());
      }

      this.workoutSaver = new _FileSaving.WorkoutFileSaver(newUser, new Date().getTime());

      if (user.imageBase64) {
        newUser.setImage(user.imageBase64, user.bigImageMd5);
      }

      this.users.push(newUser);
      this.incrementProperty('ridersVersion');
    }

    _updatePowerCounters(tmNow, power) {
      this._powerCounters.forEach(counter => {
        counter.notifyPower(tmNow, power);
      });
    }

    getPowerCounterAverage(tmNow, name) {
      const counter = this._powerCounters.get(name);

      if (counter) {
        return counter.getAverage(tmNow);
      } else {
        return {
          powerAvg: 0,
          joules: 0,
          totalTimeSeconds: 0
        };
      }
    }

    startPowerTimer(name) {
      console.log("devices service: setting power timer " + name);

      this._powerCounters.set(name, new PowerTimer(new Date().getTime()));
    }

    stopPowerTimer(name) {
      this._powerCounters.delete(name);
    }

    setLocalUserDevice(device, deviceFlags) {
      this.set('kickrConnected', !!_WebBluetoothDevice.BluetoothKickrDevice.getKickrDevice());
      const user = this.getLocalUser();

      if (!user) {
        throw new Error("You can't set a device for a local user that doesn't exist");
      }

      if (deviceFlags & DeviceFlags.Cadence) {
        device.setCadenceRecipient(user);
      }

      if (deviceFlags & DeviceFlags.Hrm) {
        device.setHrmRecipient(user);
      }

      if (deviceFlags & DeviceFlags.PowerOnly || deviceFlags & DeviceFlags.Trainer) {
        device.setPowerRecipient((tmNow, power) => {
          // pacing challenge mode uses the power filter to make users coast to a stop once they've used their energy allotment
          power = this._fnPowerFilter(power);
          user.notifyPower(tmNow, power);

          this._updatePowerCounters(tmNow, power);
        });
      }

      if (deviceFlags && DeviceFlags.Hrm) {
        device.setHrmRecipient(user);
      }

      if (deviceFlags & DeviceFlags.Trainer) {
        device.setSlopeSource(user);
      }

      this._internalTick(new Date().getTime()); // get rid of all the old devices


      this.devices = this.devices.filter(oldDevice => {
        const oldDeviceRemainingDeviceFlags = oldDevice.getDeviceFlags() & ~deviceFlags;

        if (oldDevice.getDeviceId() !== device.getDeviceId()) {
          // ok, this is a physically separate device.  But is it providing a different purpose?
          if (oldDeviceRemainingDeviceFlags !== 0) {
            oldDevice.setDeviceFlags(oldDeviceRemainingDeviceFlags);
            return true;
          } else {
            console.log("disconnecting " + oldDevice.name() + " because new device is a physically separate device");
            oldDevice.disconnect();
            return false;
          }
        } else {
          // exact same device.  don't send a physical disconnect because that'll kill the new device too.  but we don't want this device around anymore either
          return false;
        }
      });
      device.setDeviceFlags(deviceFlags);
      this.devices.push(device);
      this.incrementProperty('ridersVersion');
    }

    getHrmDevice() {
      return this.devices.find(dev => dev.getDeviceFlags() & DeviceFlags.Hrm) || null;
    }

    getPowerDevice() {
      return this.devices.find(dev => dev.getDeviceFlags() & (DeviceFlags.Trainer | DeviceFlags.PowerOnly)) || null;
    }

    getLocalUser() {
      return this.users.find(user => user.getUserType() & _User.UserTypeFlags.Local) || null;
    }

    isLocalUserDeviceValid() {
      const tmNow = new Date().getTime();
      const user = this.getLocalUser();

      if (user) {
        if (user.isPowerValid(tmNow)) {
          return true;
        }
      }

      return false;
    }

    dumpPwx(activityName, tmNow) {
      const user = this.getLocalUser();

      if (this.workoutSaver && user) {
        const samples = this.workoutSaver.getWorkout();
        let ixLastNonzeroPower = samples.length - 1;

        while (ixLastNonzeroPower > 0 && samples[ixLastNonzeroPower].power <= 0) {
          ixLastNonzeroPower--;
        }

        const strStart = new Date(samples[0].tm).toLocaleString();
        const strEnd = new Date(samples[ixLastNonzeroPower].tm).toLocaleString();
        const lengthMeters = samples[samples.length - 1].distance - samples[0].distance;
        const userImage = user.getImage();
        const submission = {
          rideName: `${user.getName()} doing ${activityName} for ${lengthMeters.toFixed(0)}m from ${strStart} to ${strEnd}`,
          riderName: user.getName(),
          tmStart: samples[0].tm,
          tmEnd: samples[ixLastNonzeroPower].tm,
          activityName,
          handicap: user.getHandicap(),
          samples,
          deviceName: this.get('deviceDescription'),
          bigImageMd5: user.getBigImageMd5() || ''
        };
        dumpRaceResultToPWX(submission); // let's also send this to the main server.  This only happens if the user has an image.
        // the image acts as their authentication.

        if (userImage) {
          (0, _route.apiPost)('submit-ride-result', submission);
        }
      }
    }

    getUsers(tmNow) {
      return this.users.filter(user => {
        return user.getUserType() & _User.UserTypeFlags.Local || user.getUserType() & _User.UserTypeFlags.Ai || user.getMsSinceLastPacket(tmNow) < 5000 || user.isFinished();
      });
    }

    setErgMode(watts) {
      this.devices = this.devices.filter(device => {
        return device.userWantsToKeep();
      });
      const tmNow = new Date().getTime();
      this.devices.forEach(device => {
        console.log("setting erg mode for ", device);
        device.updateErg(tmNow, watts).then(good => {
          if (good) {
            this.incrementProperty('goodUpdates');
          } else {// benign "failure", such as the device doing rate-limiting or just doesn't support slope changes
          }
        }, failure => {
          this.incrementProperty('badUpdates');
        });
      });
    }

    setResistanceMode(pct) {
      (0, _Utils.assert2)(pct >= 0 && pct <= 1, "resistance fractions should be between 0 and 1");
      this.devices = this.devices.filter(device => {
        return device.userWantsToKeep();
      });
      const tmNow = new Date().getTime();
      this.devices.forEach(device => {
        console.log("setting resistance mode for ", device);
        device.updateResistance(tmNow, pct).then(good => {
          if (good) {
            this.incrementProperty('goodUpdates');
          } else {// benign "failure", such as the device doing rate-limiting or just doesn't support slope changes
          }
        }, failure => {
          this.incrementProperty('badUpdates');
        });
      });
    }

    updateSlopes(tmNow) {
      this.devices = this.devices.filter(device => {
        return device.userWantsToKeep();
      });
      this.devices.forEach(device => {
        device.updateSlope(tmNow, this.ftmsLevel / 100).then(good => {
          if (good) {
            this.incrementProperty('goodUpdates');
          } else {// benign "failure", such as the device doing rate-limiting or just doesn't support slope changes
          }
        }, failure => {
          this.incrementProperty('badUpdates');
        });
      });
    }

    getUser(id) {
      return this.users.find(user => user.getId() === id) || null;
    }

    _updateDisplay() {
      if (this._displayControlPoint) {
        const tmNow = new Date().getTime();

        if (tmNow - this._tmLastDisplayUpdate > 1000) {
          const cp = this._displayControlPoint;
          const local = this.getLocalUser();

          if (local) {
            this._displayWriteQueue = this._displayWriteQueue.then(async () => {
              this._displayUpdates++;
              {
                // #1: current power
                const charOut = new DataView(new ArrayBuffer(20));
                const pwr = local.getLastPower();
                charOut.setUint8(0, 0x11); // SetUISlot

                charOut.setUint8(1, 0x0); // slot zero, no flags

                charOut.setUint8(2, 0); // UISLOT_DISPLAY::POWER

                charOut.setUint8(3, 0); // params[0] = 0

                charOut.setUint8(4, 0); // params[1] = 0

                charOut.setFloat32(5, pwr, true); // their power!

                await cp.writeValue(charOut);
              }
              {
                // #2: current distance
                const charOut = new DataView(new ArrayBuffer(20));
                const dist = local.getDistance();
                charOut.setUint8(0, 0x11); // SetUISlot

                charOut.setUint8(1, 0x1); // slot one, no flags

                charOut.setUint8(2, 5); // UISLOT_DISPLAY::DISTANCE

                charOut.setUint8(3, 0); // params[0] = 0

                charOut.setUint8(4, 0); // params[1] = 0

                charOut.setFloat32(5, dist, true); // their distance!

                await cp.writeValue(charOut);
              }
              {
                // #3: current speed
                const charOut = new DataView(new ArrayBuffer(20));
                const speed = local.getSpeed();
                charOut.setUint8(0, 0x11); // SetUISlot

                charOut.setUint8(1, 0x2); // slot two, no flags

                charOut.setUint8(2, 6); // UISLOT_DISPLAY::SPEED

                charOut.setUint8(3, 0); // params[0] = 0

                charOut.setUint8(4, 0); // params[1] = 0

                charOut.setFloat32(5, speed, true); // their speed!

                await cp.writeValue(charOut);
              }
              {
                // #4: current slope [text]
                const charOut = new DataView(new ArrayBuffer(20));
                const slope = local.getLastSlopeInWholePercent();
                charOut.setUint8(0, 0x11); // SetUISlot

                const flags = this._displayUpdates % 10 === 0 ? 1 : 0;
                const slot = 3;
                const slotFlags = slot | flags << 4;
                let slopeText;

                if (flags) {
                  slopeText = `Slope`;
                } else {
                  slopeText = `${slope.toFixed(1)}%`;
                }

                charOut.setUint8(1, slotFlags); // slot three, no flags

                charOut.setUint8(2, 4); // UISLOT_DISPLAY::TEXT

                charOut.setUint8(3, 0); // params[0] = 0

                charOut.setUint8(4, 0); // params[1] = 0

                for (var x = 0; x < slopeText.length; x++) {
                  charOut.setUint8(5 + x, slopeText.charCodeAt(x)); // their speed!
                }

                charOut.setUint8(5 + slopeText.length, 0); // c-style string ender

                await cp.writeValue(charOut);
              }
            }).catch(() => {
              // whatevs
              console.log("display send failed.  that's fine");
            });
          }

          this._tmLastDisplayUpdate = tmNow;
        }
      }
    }

    _internalTick(tmNow) {
      if (this._displayControlPoint) {
        this._updateDisplay();
      }

      this.tmLastInternalTick = tmNow;

      if (!this.nextTickHandle) {
        this.nextTickHandle = setTimeout(() => {
          this.nextTickHandle = 0;

          this._internalTick(new Date().getTime());
        }, 100);
      }
    }

    tick(tmNow, needSlopes) {
      if (needSlopes) {
        this.updateSlopes(tmNow);
      }

      if (this.workoutSaver) {
        this.workoutSaver.tick(tmNow);
      }
    }

  } // DO NOT DELETE: this is how TypeScript knows how to look up your services.


  _exports.default = Devices;
});
;define("bt-web2/services/intl", ["exports", "ember-intl/services/intl"], function (_exports, _intl) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _intl.default;
    }
  });
});
;define("bt-web2/services/platform-manager", ["exports", "bt-web2/tourjs-shared/RideMap", "bt-web2/tourjs-shared/Utils"], function (_exports, _RideMap, _Utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = _exports.ElevDistanceMap = void 0;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function getCookie(cookieKey) {
    console.log("they're looking for ", cookieKey);
    return new Promise(resolve => {
      const allCookies = document.cookie;
      const split = allCookies.split(';');
      console.log("split = ", split);
      split.forEach(keyValue => {
        const split2 = keyValue.split('=');
        const key = split2[0].trim();
        const value = split2[1].trim();
        console.log("key, vlaue = ", key, value);

        if (key === cookieKey && value && value.length > 0) {
          resolve(value);
          return;
        }
      });
      resolve(); // no cookie
    });
  }

  function setCookie(key, value, maxAgeSeconds) {
    let values = [`${key}=${value}`];

    if (maxAgeSeconds > 0) {
      values.push(`Max-Age=${maxAgeSeconds}`);
    }

    const finalSet = values.join(';');
    console.log("applying ", finalSet, " to cookie");
    document.cookie = values.join(';');
  }

  class ElevDistanceMap extends _RideMap.RideMapPartial {
    constructor(elevs, distances) {
      super();

      _defineProperty(this, "_distance", void 0);

      _defineProperty(this, "_elevation", void 0);

      this._distance = distances;
      this._elevation = elevs;
      (0, _Utils.assert2)(this._distance && this._elevation);
    }

    getElevationAtDistance(meters) {
      if (meters <= 0) {
        return this._elevation[0];
      } else if (meters >= this._distance[this._distance.length - 1]) {
        return this._elevation[this._elevation.length - 1];
      } else {
        for (var x = 0; x < this._distance.length - 1; x++) {
          const distNow = this._distance[x];
          const distNext = this._distance[x + 1];

          if (meters >= distNow && meters <= distNext) {
            const offset = meters - distNow;
            const span = distNext - distNow;
            const pct = offset / span;
            const elevThis = this._elevation[x];
            const elevNext = this._elevation[x + 1];
            return pct * elevNext + (1 - pct) * elevThis;
          }
        }

        (0, _Utils.assert2)(false, "We shouln't get here - we should always find a distance");
        return 0;
      }
    }

    getLength() {
      return this._distance[this._distance.length - 1];
    }

  }

  _exports.ElevDistanceMap = ElevDistanceMap;

  class PlatformManager extends Ember.Service.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    _doSignIn(url) {
      return new Promise((resolve, reject) => {
        const windowRef = window.open(url, "_blank");

        if (!windowRef) {
          return;
        }

        const interval = setInterval(() => {
          if (windowRef.closed) {
            // they closed the window, but we haven't gotten the new authcode yet
            return getCookie('strava-auth-code').then(authCode => {
              console.log("getCookie got ", authCode);
              console.log("document cookie is ", document.cookie);
              setCookie('strava-auth-code', "", 3600);

              if (authCode) {
                resolve(authCode);
              } else {
                reject("Window closed, but no auth code gotten");
              }

              clearInterval(interval);
            });
          }
        }, 750);
      }).then(authCode => {
        // now we have to exchange this for a access token
        console.log("gotta exchange ", authCode, " for access token");
        const params = {
          client_id: 3055,
          client_secret: 'a14312f43d3000a65391c6c718d5a8b8a3f13434',
          code: authCode,
          grant_type: 'authorization_code'
        };
        return fetch('https://www.strava.com/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        }).then(fetchResp => {
          return fetchResp.json();
        }).then(fetchRespJson => {
          setCookie('strava-access-token', fetchRespJson.access_token, fetchRespJson.expires_in);
          return fetchRespJson.access_token;
        });
      });
    }

    getStravaMapList() {
      return this.getStravaAccessToken().then(accessToken => {
        return fetch(`https://www.strava.com/api/v3/segments/starred?access_token=${accessToken}`);
      }).then(stravaResult => {
        return stravaResult.json();
      }).then(stravaJson => {
        return stravaJson;
      });
    }

    getStravaMapDetails(stravaMapSummary) {
      return this.getStravaAccessToken().then(accessToken => {
        return fetch(`https://www.strava.com/api/v3/segments/${stravaMapSummary.id}/streams?keys=altitude,distance&key_by_type=true&access_token=${accessToken}`);
      }).then(mapDetails => {
        return mapDetails.json();
      }).then(mapDetailsJson => {
        debugger;
        return new ElevDistanceMap(mapDetailsJson.altitude.data, mapDetailsJson.distance.data);
      });
    }

    getStravaAccessToken() {
      return new Promise((resolve, reject) => {
        getCookie('strava-access-token').then(currentAuthCode => {
          console.log("current auth code ", currentAuthCode);

          if (currentAuthCode) {
            resolve(currentAuthCode);
          } else {
            // we'll need to trigger an iframe to sign in
            const clientId = '3055';
            const redirectUri = window.location.hostname.includes('localhost') ? 'https://tourjs.ca/strava-auth?stayOpen=1' : 'https://tourjs.ca/strava-auth';
            const targetUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read`; //const targetUrl = `localhost:4200/bt-web/strava-auth?code=1234`;

            console.log("going to ", targetUrl);
            return this._doSignIn(targetUrl).then(authCode => {
              console.log("auth complete: ", authCode);
              resolve(authCode);
            }).catch(failure => {
              reject(failure);
            });
          }
        });
      });
    }

  } // DO NOT DELETE: this is how TypeScript knows how to look up your services.


  _exports.default = PlatformManager;
});
;define("bt-web2/set-up-ride/controller", ["exports", "bt-web2/set-up-ride/route"], function (_exports, _route) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class SetUpRide extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    settingUpRide: false,
    actions: {
      go() {
        this.transitionToRoute('ride');
      },

      joinRace(gameId) {
        this.transitionToRoute('ride', gameId);
      },

      toggleRideWidget() {
        this.toggleProperty('settingUpRide');
      },

      onRaceCreated() {
        this._refreshAllRaces();

        alert("Your ride has been created!");
        this.set('settingUpRide', false);
      },

      refreshAllRaces() {
        this._refreshAllRaces();
      }

    },
    frame: 0
  }) {
    // normal class body definition here
    _refreshAllRaces() {
      (0, _route.refreshRaceList)().then(model => {
        this.set('model', model);
      });
    }

    beginFrames() {
      const incrementFrame = () => {
        this.incrementProperty('frame');
        console.log("frame!");

        if (!this.isDestroyed) {
          setTimeout(incrementFrame, 15000);
        }
      };

      incrementFrame();
    }

  } // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.


  _exports.default = SetUpRide;
});
;define("bt-web2/set-up-ride/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.refreshRaceList = refreshRaceList;
  _exports.default = void 0;

  function refreshRaceList() {
    return apiGet('race-list').then(result => {
      result.races = result.races.sort((a, b) => {
        return a.tmScheduledStart < b.tmScheduledStart ? -1 : 1;
      });
      return result;
    });
  }

  class SetUpRide extends Ember.Route.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    model() {
      return refreshRaceList();
    }

    setupController(controller, model) {
      controller.set('model', model);
      controller.beginFrames();
    }

  }

  _exports.default = SetUpRide;
});
;define("bt-web2/set-up-ride/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "E1N/BtEa",
    "block": "{\"symbols\":[\"race\"],\"statements\":[[1,[22,\"tourjs-header\"],false],[0,\"\\n\"],[7,\"div\",true],[10,\"class\",\"set-up-ride__content\"],[8],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"set-up-ride__create-your-own\"],[8],[0,\"\\n\"],[4,\"unless\",[[24,[\"settingUpRide\"]]],null,{\"statements\":[[0,\"      \"],[7,\"button\",false],[12,\"class\",\"set-up-ride__create-your-own--button\"],[3,\"action\",[[23,0,[]],\"toggleRideWidget\"]],[8],[0,\"\\n        Preschedule Ride\\n      \"],[9],[0,\"\\n\"]],\"parameters\":[]},{\"statements\":[[0,\"      \"],[1,[28,\"create-race-widget\",null,[[\"onRaceCreated\"],[[28,\"action\",[[23,0,[]],\"onRaceCreated\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[]}],[0,\"  \"],[9],[0,\"\\n  \"],[7,\"div\",true],[10,\"class\",\"set-up-ride__title\"],[8],[0,\"\\n    Current Joinable Rides \"],[7,\"a\",false],[12,\"href\",\"#\"],[3,\"action\",[[23,0,[]],\"refreshAllRaces\"]],[8],[0,\"Refresh\"],[9],[0,\"\\n  \"],[9],[0,\"\\n\\n\"],[4,\"each\",[[24,[\"model\",\"races\"]]],null,{\"statements\":[[0,\"    \"],[1,[28,\"pending-race\",null,[[\"frame\",\"race\",\"joinRace\"],[[24,[\"frame\"]],[23,1,[]],[28,\"action\",[[23,0,[]],\"joinRace\"],null]]]],false],[0,\"\\n\"]],\"parameters\":[1]},null],[9],[0,\"\\n\\n\"],[7,\"div\",true],[10,\"class\",\"bluetooth-warning-socket\"],[8],[9]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/set-up-ride/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/set-up-user/controller", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class UserSetUp extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service(),
    actions: {
      onAddedUser(user) {
        console.log("set-up-user done adding user with md5 ", user.bigImageMd5);
        this.devices.addUser(user);
        this.transitionToRoute('index');
      }

    }
  }) {} // normal class body definition here
  // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.


  _exports.default = UserSetUp;
});
;define("bt-web2/set-up-user/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class UserSetUp extends Ember.Route.extend({
    // anything which *must* be merged to prototype here
    devices: Ember.inject.service()
  }) {
    // normal class body definition here
    beforeModel() {
      return this.devices.clearUsers();
    }

  }

  _exports.default = UserSetUp;
});
;define("bt-web2/set-up-user/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "Vf0qoTNF",
    "block": "{\"symbols\":[],\"statements\":[[1,[22,\"tourjs-header\"],false],[0,\"\\n\"],[1,[28,\"user-set-up-widget\",null,[[\"onDone\"],[[28,\"action\",[[23,0,[]],\"onAddedUser\"],null]]]],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/set-up-user/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/strava-auth/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class StravaAuth extends Ember.Route.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    beforeModel() {
      // http://localhost:4200/bt-web/strava-auth?code8e0475516ae3c5196cd8c7d2ca3b91e67b9f7511
      const q = window.location.search.replace('?', '');
      const split = q.split('&');
      const debuggin = window.location.search.includes('stayOpen');
      split.forEach(val => {
        const split2 = val.split('=');
        const key = decodeURIComponent(split2[0]);
        const value = decodeURIComponent(split2[1]);
        console.log(key, " = ", value);

        if (key === "code") {
          document.cookie = `strava-auth-code=${value}`;

          if (window.opener) {
            const msg = JSON.stringify({
              stravaAuthCode: value
            });
            const targetOrigin = debuggin ? "http://localhost:4200" : "https://tourjs.ca";
            console.log("posting auth code " + value + " to opener", targetOrigin);
            window.opener.postMessage(msg, targetOrigin);
          }
        }
      });

      if (debuggin) {} else {
        window.close();
      }
    }

  }

  _exports.default = StravaAuth;
});
;define("bt-web2/strava-auth/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "f2FlwE4C",
    "block": "{\"symbols\":[],\"statements\":[[1,[22,\"outlet\"],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/strava-auth/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/sw", [], function () {
  "use strict";

  console.log("Test service worker!");
});
;define("bt-web2/test-hacks/controller", ["exports", "bt-web2/tourjs-shared/RideMap", "bt-web2/tourjs-shared/RaceState", "bt-web2/tourjs-shared/User", "bt-web2/tourjs-shared/communication", "bt-web2/tourjs-shared/RideMapHandicap"], function (_exports, _RideMap, _RaceState, _User, _communication, _RideMapHandicap) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = _exports.FakeUserProvider = void 0;

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  class FakeUserProvider {
    constructor(localUserOverride) {
      _defineProperty(this, "users", void 0);

      _defineProperty(this, "_local", void 0);

      this._local = localUserOverride;
      this.users = [localUserOverride ? localUserOverride : new _User.User("Local User", _User.DEFAULT_RIDER_MASS, 100, _User.UserTypeFlags.Local), new _User.User("Human Remote", _User.DEFAULT_RIDER_MASS, 260, _User.UserTypeFlags.Remote), new _User.User("Human Remote", _User.DEFAULT_RIDER_MASS, 260, _User.UserTypeFlags.Remote), new _User.User("Human Remote", _User.DEFAULT_RIDER_MASS, 240, _User.UserTypeFlags.Remote) //new User("Slow Fella", DEFAULT_RIDER_MASS, 900, UserTypeFlags.Remote),
      //new User("Fast Fella", DEFAULT_RIDER_MASS, 30, UserTypeFlags.Remote),
      ];

      for (var x = 0; x < 0; x++) {
        const aiUser = new _User.User(`AI Remote ${x}`, _User.DEFAULT_RIDER_MASS, 200 + Math.random() * 150, _User.UserTypeFlags.Ai | _User.UserTypeFlags.Remote);
        this.users.push(aiUser);
      }

      this.users.forEach((user, index) => {
        user.setId(index);
        user.setImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAADpSURBVEhL7ZZBEkQwEEUtcwTLOUqWjuAIbmGlHMPWDRzNMv7Ib2WQQWOqZszbdaL7hVRaIncxPyao67ooCgZ7aJrm0VNVFYeEFwGqR5HmnVAaicAYwyHhnE9UlqUXZFnGIeGze3AFf8EqdxMojvo+geKo320PFJwmQMe21q606yPEcYz9D7brkH87fbd+wlhgPPjVDl8dMBYYo7SfVjt8OmAsMB5+SUDnYHJIAI448jxn5hsBGDvA4i1hjL9M8OmeNE05J0yFE8cukiRp25aFhKkA6BxY+7w6WBB4tmvmV5UxQcFZfLvAuQ7+9Jkk3ToNzAAAAABJRU5ErkJggg==', '');
      });
    }

    getUsers(tmNow) {
      return this.users.slice();
    }

    getUser(id) {
      return this.users.find(user => user.getId() === id) || null;
    }

    getLocalUser() {
      return this._local || null;
    }

  }

  _exports.FakeUserProvider = FakeUserProvider;

  class TestHacks extends Ember.Controller.extend({
    // anything which *must* be merged to prototype here
    raceState: null,
    userProvider: null,
    devices: Ember.inject.service('devices'),
    frame: 0
  }) {
    // normal class body definition here
    controllerInit() {
      console.log("test-hacks controller init");
      const baseMap = new _RideMap.PureCosineMap(5000);
      const fullMap = new _RideMapHandicap.RideMapHandicap(new _communication.ServerMapDescription(baseMap));
      const userProvider = new FakeUserProvider(this.devices.getLocalUser());
      this.set('raceState', new _RaceState.RaceState(fullMap, userProvider, "Test Game"));

      const fnUpdatePowers = () => {
        if (!this.isDestroyed) {
          const tmNow = new Date().getTime();
          userProvider.getUsers(tmNow).forEach((user, index) => {
            //if(user.getUserType() & UserTypeFlags.Local) 
            {
              // this is a local guy.  we'll send fake power if there's not a device connected
              if (this.devices.devices.length > 0) {// there's already a device for this guy
              } else {
                user.notifyHrm(tmNow, Math.random() + 170 + index * 5);
                user.notifyPower(tmNow, Math.random() * 50 + 300 + index * 2);
              }
            }
          });
          setTimeout(fnUpdatePowers, 200);
          this.devices.tick(tmNow, true);
        }
      };

      setTimeout(fnUpdatePowers);
    }

  } // DO NOT DELETE: this is how TypeScript knows how to look up your controllers.


  _exports.default = TestHacks;
});
;define("bt-web2/test-hacks/route", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  class TestHacks extends Ember.Route.extend({// anything which *must* be merged to prototype here
  }) {
    // normal class body definition here
    setupController(controller, model) {
      controller.set('model', model);
      controller.controllerInit();
    }

  }

  _exports.default = TestHacks;
});
;define("bt-web2/test-hacks/template", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  var _default = Ember.HTMLBars.template({
    "id": "Ye6arKUI",
    "block": "{\"symbols\":[],\"statements\":[[1,[28,\"display-race\",null,[[\"raceState\",\"overlay\",\"mode\"],[[24,[\"raceState\"]],\"leader-board\",\"3d\"]]],false]],\"hasEval\":false}",
    "meta": {
      "moduleName": "bt-web2/test-hacks/template.hbs"
    }
  });

  _exports.default = _default;
});
;define("bt-web2/transforms/rendered", ["exports", "ember-wordpress/transforms/rendered"], function (_exports, _rendered) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _rendered.default;
    }
  });
});
;define("bt-web2/utils/intl/missing-message", ["exports", "ember-intl/utils/missing-message"], function (_exports, _missingMessage) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _missingMessage.default;
    }
  });
});
;

;define('bt-web2/config/environment', [], function() {
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

;
          if (!runningTests) {
            require("bt-web2/app")["default"].create({"name":"bt-web2","version":"0.0.0+35e68f50"});
          }
        
//# sourceMappingURL=bt-web2.map
