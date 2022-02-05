(function () {
  'use strict';

  const VERSION = '1644080393212|0.4217956481227687';
  self.CACHE_BUSTER = VERSION;
  self.addEventListener('install', function installEventListenerCallback(event) {
    return self.skipWaiting();
  });
  self.addEventListener('activate', function installEventListenerCallback(event) {
    return self.clients.claim();
  });

}());
