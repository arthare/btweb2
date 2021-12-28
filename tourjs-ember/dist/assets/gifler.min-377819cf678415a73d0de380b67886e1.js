/** gifler.js | github.com/themadcreator/gifler | @license: Apache-2.0 */
!function t(e,n,r){function i(s,a){if(!n[s]){if(!e[s]){var c="function"==typeof require&&require
if(!a&&c)return c(s,!0)
if(o)return o(s,!0)
var l=new Error("Cannot find module '"+s+"'")
throw l.code="MODULE_NOT_FOUND",l}var u=n[s]={exports:{}}
e[s][0].call(u.exports,(function(t){var n=e[s][1][t]
return i(n||t)}),u,u.exports,t,e,n,r)}return n[s].exports}for(var o="function"==typeof require&&require,s=0;s<r.length;s++)i(r[s])
return i}({1:[function(t,e,n){var r,i,o,s,a,c,l=function(t,e){return function(){return t.apply(e,arguments)}}
s=t("omggif").GifReader,a=t("bluebird"),c=function(t){var e,n
return(n=new XMLHttpRequest).open("GET",t,!0),n.responseType="arraybuffer",e=new a((function(t,e){return n.onload=function(e){return t(this.response)}})),n.send(),new o(e)},o=function(){function t(t){this._animatorPromise=t.then((function(t){var e
return e=new s(new Uint8Array(t)),i.decodeFramesAsync(e).then((function(t){return new r(e,t)}))}))}return t.getCanvasElement=function(t){var e,n
if("string"==typeof t&&"CANVAS"===(null!=(n=e=document.querySelector(t))?n.tagName:void 0))return e
if("CANVAS"===(null!=t?t.tagName:void 0))return t
throw new Error("Unexpected selector type. Valid types are query-selector-string/canvas-element")},t.prototype.animate=function(e){var n
return n=t.getCanvasElement(e),this._animatorPromise.then((function(t){return t.animateInCanvas(n)}))},t.prototype.frames=function(e,n,r){var i
return null==r&&(r=!1),i=t.getCanvasElement(e),this._animatorPromise.then((function(t){return t.onDrawFrame=n,t.animateInCanvas(i,r)}))},t.prototype.get=function(t){return this._animatorPromise},t}(),i=function(){function t(){}return t.decodeFramesSync=function(e){var n
return function(){n=[]
for(var t=0,r=e.numFrames();r>=0?r>t:t>r;r>=0?t++:t--)n.push(t)
return n}.apply(this).map((function(n){return t.decodeFrame(e,n)}))},t.decodeFramesAsync=function(e){var n
return a.map(function(){n=[]
for(var t=0,r=e.numFrames();r>=0?r>t:t>r;r>=0?t++:t--)n.push(t)
return n}.apply(this),(function(n){return t.decodeFrame(e,n)}),1)},t.decodeFrame=function(t,e){var n
return(n=t.frameInfo(e)).pixels=new Uint8ClampedArray(t.width*t.height*4),t.decodeAndBlitFrameRGBA(e,n.pixels),n},t}(),r=function(){function t(t,e){var n
this._reader=t,this._frames=e,this._advanceFrame=l(this._advanceFrame,this),this._nextFrameRender=l(this._nextFrameRender,this),this._nextFrame=l(this._nextFrame,this),n=this._reader,this.width=n.width,this.height=n.height,this._loopCount=this._reader.loopCount(),this._loops=0,this._frameIndex=0,this._running=!1}return t.createBufferCanvas=function(t,e,n){var r,i,o
return i=(r=document.createElement("canvas")).getContext("2d"),r.width=t.width,r.height=t.height,(o=i.createImageData(e,n)).data.set(t.pixels),i.putImageData(o,-t.x,-t.y),r},t.prototype.start=function(){return this._lastTime=(new Date).valueOf(),this._delayCompensation=0,this._running=!0,setTimeout(this._nextFrame,0),this},t.prototype.stop=function(){return this._running=!1,this},t.prototype.reset=function(){return this._frameIndex=0,this._loops=0,this},t.prototype.running=function(){return this._running},t.prototype._nextFrame=function(){requestAnimationFrame(this._nextFrameRender)},t.prototype._nextFrameRender=function(){var t,e
if(this._running)return t=this._frames[this._frameIndex],null!=(e=this.onFrame)&&e.apply(this,[t,this._frameIndex]),this._enqueueNextFrame()},t.prototype._advanceFrame=function(){this._frameIndex+=1,this._frameIndex>=this._frames.length&&(0!==this._loopCount&&this._loopCount===this._loops?this.stop():(this._frameIndex=0,this._loops+=1))},t.prototype._enqueueNextFrame=function(){var t,e,n,r
for(this._advanceFrame();this._running;){if(n=this._frames[this._frameIndex],e=(new Date).valueOf()-this._lastTime,this._lastTime+=e,this._delayCompensation+=e,t=(r=10*n.delay)-this._delayCompensation,this._delayCompensation-=r,!(0>t)){setTimeout(this._nextFrame,t)
break}this._advanceFrame()}},t.prototype.animateInCanvas=function(e,n){var r
return null==n&&(n=!0),n&&(e.width=this.width,e.height=this.height),r=e.getContext("2d"),null==this.onDrawFrame&&(this.onDrawFrame=function(t,e,n){return t.drawImage(e.buffer,e.x,e.y)}),null==this.onFrame&&(this.onFrame=function(n){return function(i,o){var s,a
switch(null==i.buffer&&(i.buffer=t.createBufferCanvas(i,n.width,n.height)),"function"==typeof n.disposeFrame&&n.disposeFrame(),i.disposal){case 2:n.disposeFrame=function(){return r.clearRect(0,0,e.width,e.height)}
break
case 3:a=r.getImageData(0,0,e.width,e.height),n.disposeFrame=function(){return r.putImageData(a,0,0)}
break
default:n.disposeFrame=null}return null!=(s=n.onDrawFrame)?s.apply(n,[r,i,o]):void 0}}(this)),this.start(),this},t}(),c.Gif=o,c.Decoder=i,c.Animator=r,"undefined"!=typeof window&&null!==window&&(window.gifler=c),null!=e&&(e.exports=c)},{bluebird:2,omggif:4}],2:[function(t,e,n){(function(t,r){!function(t){if("object"==typeof n&&void 0!==e)e.exports=t()
else if("function"==typeof define&&define.amd)define([],t)
else{var i
"undefined"!=typeof window?i=window:void 0!==r?i=r:"undefined"!=typeof self&&(i=self),i.Promise=t()}}((function(){return function t(e,n,r){function i(s,a){if(!n[s]){if(!e[s]){var c="function"==typeof _dereq_&&_dereq_
if(!a&&c)return c(s,!0)
if(o)return o(s,!0)
var l=new Error("Cannot find module '"+s+"'")
throw l.code="MODULE_NOT_FOUND",l}var u=n[s]={exports:{}}
e[s][0].call(u.exports,(function(t){var n=e[s][1][t]
return i(n||t)}),u,u.exports,t,e,n,r)}return n[s].exports}for(var o="function"==typeof _dereq_&&_dereq_,s=0;s<r.length;s++)i(r[s])
return i}({1:[function(t,e,n){"use strict"
e.exports=function(t){function e(t){var e=new n(t),r=e.promise()
return e.setHowMany(1),e.setUnwrap(),e.init(),r}var n=t._SomePromiseArray
t.any=function(t){return e(t)},t.prototype.any=function(){return e(this)}}},{}],2:[function(e,n,r){"use strict"
function i(){this._isTickUsed=!1,this._lateQueue=new u(16),this._normalQueue=new u(16),this._haveDrainedQueues=!1,this._trampolineEnabled=!0
var t=this
this.drainQueues=function(){t._drainQueues()},this._schedule=l.isStatic?l(this.drainQueues):l}function o(t,e,n){this._lateQueue.push(t,e,n),this._queueTick()}function s(t,e,n){this._normalQueue.push(t,e,n),this._queueTick()}function a(t){this._normalQueue._pushOne(t),this._queueTick()}var c
try{throw new Error}catch(t){c=t}var l=e("./schedule"),u=e("./queue"),h=e("./util")
i.prototype.disableTrampolineIfNecessary=function(){h.hasDevTools&&(this._trampolineEnabled=!1)},i.prototype.haveItemsQueued=function(){return this._isTickUsed||this._haveDrainedQueues},i.prototype.fatalError=function(e,n){n?(t.stderr.write("Fatal "+(e instanceof Error?e.stack:e)),t.exit(2)):this.throwLater(e)},i.prototype.throwLater=function(t,e){if(1===arguments.length&&(e=t,t=function(){throw e}),"undefined"!=typeof setTimeout)setTimeout((function(){t(e)}),0)
else try{this._schedule((function(){t(e)}))}catch(t){throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n")}},h.hasDevTools?(l.isStatic&&(l=function(t){setTimeout(t,0)}),i.prototype.invokeLater=function(t,e,n){this._trampolineEnabled?o.call(this,t,e,n):this._schedule((function(){setTimeout((function(){t.call(e,n)}),100)}))},i.prototype.invoke=function(t,e,n){this._trampolineEnabled?s.call(this,t,e,n):this._schedule((function(){t.call(e,n)}))},i.prototype.settlePromises=function(t){this._trampolineEnabled?a.call(this,t):this._schedule((function(){t._settlePromises()}))}):(i.prototype.invokeLater=o,i.prototype.invoke=s,i.prototype.settlePromises=a),i.prototype.invokeFirst=function(t,e,n){this._normalQueue.unshift(t,e,n),this._queueTick()},i.prototype._drainQueue=function(t){for(;t.length()>0;){var e=t.shift()
if("function"==typeof e){var n=t.shift(),r=t.shift()
e.call(n,r)}else e._settlePromises()}},i.prototype._drainQueues=function(){this._drainQueue(this._normalQueue),this._reset(),this._haveDrainedQueues=!0,this._drainQueue(this._lateQueue)},i.prototype._queueTick=function(){this._isTickUsed||(this._isTickUsed=!0,this._schedule(this.drainQueues))},i.prototype._reset=function(){this._isTickUsed=!1},n.exports=i,n.exports.firstLineError=c},{"./queue":26,"./schedule":29,"./util":36}],3:[function(t,e,n){"use strict"
e.exports=function(t,e,n,r){var i=!1,o=function(t,e){this._reject(e)},s=function(t,e){e.promiseRejectionQueued=!0,e.bindingPromise._then(o,o,null,this,t)},a=function(t,e){0==(50397184&this._bitField)&&this._resolveCallback(e.target)},c=function(t,e){e.promiseRejectionQueued||this._reject(t)}
t.prototype.bind=function(o){i||(i=!0,t.prototype._propagateFrom=r.propagateFromFunction(),t.prototype._boundValue=r.boundValueFunction())
var l=n(o),u=new t(e)
u._propagateFrom(this,1)
var h=this._target()
if(u._setBoundTo(l),l instanceof t){var f={promiseRejectionQueued:!1,promise:u,target:h,bindingPromise:l}
h._then(e,s,void 0,u,f),l._then(a,c,void 0,u,f),u._setOnCancel(l)}else u._resolveCallback(h)
return u},t.prototype._setBoundTo=function(t){void 0!==t?(this._bitField=2097152|this._bitField,this._boundTo=t):this._bitField=-2097153&this._bitField},t.prototype._isBound=function(){return 2097152==(2097152&this._bitField)},t.bind=function(e,n){return t.resolve(n).bind(e)}}},{}],4:[function(t,e,n){"use strict"
var r
"undefined"!=typeof Promise&&(r=Promise)
var i=t("./promise")()
i.noConflict=function(){try{Promise===i&&(Promise=r)}catch(t){}return i},e.exports=i},{"./promise":22}],5:[function(t,e,n){"use strict"
var r=Object.create
if(r){var i=r(null),o=r(null)
i[" size"]=o[" size"]=0}e.exports=function(e){function n(t,n){var r
if(null!=t&&(r=t[n]),"function"!=typeof r){var i="Object "+s.classString(t)+" has no method '"+s.toString(n)+"'"
throw new e.TypeError(i)}return r}function r(t){return n(t,this.pop()).apply(t,this)}function i(t){return t[this]}function o(t){var e=+this
return 0>e&&(e=Math.max(0,e+t.length)),t[e]}var s=t("./util"),a=s.canEvaluate
s.isIdentifier,e.prototype.call=function(t){var e=[].slice.call(arguments,1)
return e.push(t),this._then(r,void 0,void 0,e,void 0)},e.prototype.get=function(t){var e
if("number"==typeof t)e=o
else if(a){var n=(void 0)(t)
e=null!==n?n:i}else e=i
return this._then(e,void 0,void 0,t,void 0)}}},{"./util":36}],6:[function(t,e,n){"use strict"
e.exports=function(e,n,r,i){var o=t("./util"),s=o.tryCatch,a=o.errorObj,c=e._async
e.prototype.break=e.prototype.cancel=function(){if(!i.cancellation())return this._warn("cancellation is disabled")
for(var t=this,e=t;t.isCancellable();){if(!t._cancelBy(e)){e._isFollowing()?e._followee().cancel():e._cancelBranched()
break}var n=t._cancellationParent
if(null==n||!n.isCancellable()){t._isFollowing()?t._followee().cancel():t._cancelBranched()
break}t._isFollowing()&&t._followee().cancel(),e=t,t=n}},e.prototype._branchHasCancelled=function(){this._branchesRemainingToCancel--},e.prototype._enoughBranchesHaveCancelled=function(){return void 0===this._branchesRemainingToCancel||this._branchesRemainingToCancel<=0},e.prototype._cancelBy=function(t){return t===this?(this._branchesRemainingToCancel=0,this._invokeOnCancel(),!0):(this._branchHasCancelled(),!!this._enoughBranchesHaveCancelled()&&(this._invokeOnCancel(),!0))},e.prototype._cancelBranched=function(){this._enoughBranchesHaveCancelled()&&this._cancel()},e.prototype._cancel=function(){this.isCancellable()&&(this._setCancelled(),c.invoke(this._cancelPromises,this,void 0))},e.prototype._cancelPromises=function(){this._length()>0&&this._settlePromises()},e.prototype._unsetOnCancel=function(){this._onCancelField=void 0},e.prototype.isCancellable=function(){return this.isPending()&&!this.isCancelled()},e.prototype._doInvokeOnCancel=function(t,e){if(o.isArray(t))for(var n=0;n<t.length;++n)this._doInvokeOnCancel(t[n],e)
else if(void 0!==t)if("function"==typeof t){if(!e){var r=s(t).call(this._boundValue())
r===a&&(this._attachExtraTrace(r.e),c.throwLater(r.e))}}else t._resultCancelled(this)},e.prototype._invokeOnCancel=function(){var t=this._onCancel()
this._unsetOnCancel(),c.invoke(this._doInvokeOnCancel,this,t)},e.prototype._invokeInternalOnCancel=function(){this.isCancellable()&&(this._doInvokeOnCancel(this._onCancel(),!0),this._unsetOnCancel())},e.prototype._resultCancelled=function(){this.cancel()}}},{"./util":36}],7:[function(t,e,n){"use strict"
e.exports=function(e){var n=t("./util"),r=t("./es5").keys,i=n.tryCatch,o=n.errorObj
return function(t,s,a){return function(c){var l=a._boundValue()
t:for(var u=0;u<t.length;++u){var h=t[u]
if(h===Error||null!=h&&h.prototype instanceof Error){if(c instanceof h)return i(s).call(l,c)}else if("function"==typeof h){var f=i(h).call(l,c)
if(f===o)return f
if(f)return i(s).call(l,c)}else if(n.isObject(c)){for(var p=r(h),_=0;_<p.length;++_){var d=p[_]
if(h[d]!=c[d])continue t}return i(s).call(l,c)}}return e}}}},{"./es5":13,"./util":36}],8:[function(t,e,n){"use strict"
e.exports=function(t){function e(){this._trace=new e.CapturedTrace(n())}function n(){var t=i.length-1
return t>=0?i[t]:void 0}var r=!1,i=[]
return t.prototype._promiseCreated=function(){},t.prototype._pushContext=function(){},t.prototype._popContext=function(){return 0},t._peekContext=t.prototype._peekContext=function(){},e.prototype._pushContext=function(){void 0!==this._trace&&(this._trace._promisesCreated=0,i.push(this._trace))},e.prototype._popContext=function(){if(void 0!==this._trace){var t=i.pop(),e=t._promisesCreated
return t._promisesCreated=0,e}return 0},e.CapturedTrace=null,e.create=function(){return r?new e:void 0},e.activateLongStackTraces=function(){r=!0,t.prototype._pushContext=e.prototype._pushContext,t.prototype._popContext=e.prototype._popContext,t._peekContext=t.prototype._peekContext=n,t.prototype._promiseCreated=function(){var t=this._peekContext()
t&&t._promisesCreated++}},e}},{}],9:[function(e,n,r){"use strict"
n.exports=function(n,r){function i(t,e,n){var r=this
try{t(e,n,(function(t){if("function"!=typeof t)throw new TypeError("onCancel must be a function, got: "+T.toString(t))
r._attachCancellationCallback(t)}))}catch(t){return t}}function o(t){if(!this.isCancellable())return this
var e=this._onCancel()
void 0!==e?T.isArray(e)?e.push(t):this._setOnCancel([e,t]):this._setOnCancel(t)}function s(){return this._onCancelField}function a(t){this._onCancelField=t}function c(){this._cancellationParent=void 0,this._onCancelField=void 0}function l(t,e){if(0!=(1&e)){this._cancellationParent=t
var n=t._branchesRemainingToCancel
void 0===n&&(n=0),t._branchesRemainingToCancel=n+1}0!=(2&e)&&t._isBound()&&this._setBoundTo(t._boundTo)}function u(){var t=this._boundTo
return void 0!==t&&t instanceof n?t.isFulfilled()?t.value():void 0:t}function h(){this._trace=new w(this._peekContext())}function f(t,e){if(P(t)){var n=this._trace
if(void 0!==n&&e&&(n=n._parent),void 0!==n)n.attachExtraTrace(t)
else if(!t.__stackCleaned__){var r=d(t)
T.notEnumerableProp(t,"stack",r.message+"\n"+r.stack.join("\n")),T.notEnumerableProp(t,"__stackCleaned__",!0)}}}function p(t,e,r){if(q.warnings){var i,o=new E(t)
if(e)r._attachExtraTrace(o)
else if(q.longStackTraces&&(i=n._peekContext()))i.attachExtraTrace(o)
else{var s=d(o)
o.stack=s.message+"\n"+s.stack.join("\n")}v(o,"",!0)}}function _(t){for(var e=[],n=0;n<t.length;++n){var r=t[n],i="    (No stack trace)"===r||A.test(r),o=i&&H(r)
i&&!o&&(S&&" "!==r.charAt(0)&&(r="    "+r),e.push(r))}return e}function d(t){var e=t.stack,n=t.toString()
return e="string"==typeof e&&e.length>0?function(t){for(var e=t.stack.replace(/\s+$/g,"").split("\n"),n=0;n<e.length;++n){var r=e[n]
if("    (No stack trace)"===r||A.test(r))break}return n>0&&(e=e.slice(n)),e}(t):["    (No stack trace)"],{message:n,stack:_(e)}}function v(t,e,n){if("undefined"!=typeof console){var r
if(T.isObject(t)){var i=t.stack
r=e+O(i,t)}else r=e+String(t)
"function"==typeof F?F(r,n):("function"==typeof console.log||"object"==typeof console.log)&&console.log(r)}}function y(t,e,n,r){var i=!1
try{"function"==typeof e&&(i=!0,"rejectionHandled"===t?e(r):e(n,r))}catch(t){x.throwLater(t)}var o=!1
try{o=M(t,n,r)}catch(t){o=!0,x.throwLater(t)}var s=!1
if(N)try{s=N(t.toLowerCase(),{reason:n,promise:r})}catch(t){s=!0,x.throwLater(t)}o||i||s||"unhandledRejection"!==t||v(n,"Unhandled rejection ")}function m(t){var e
if("function"==typeof t)e="[function "+(t.name||"anonymous")+"]"
else{e=t&&"function"==typeof t.toString?t.toString():T.toString(t)
if(/\[object [a-zA-Z0-9$_]+\]/.test(e))try{e=JSON.stringify(t)}catch(t){}0===e.length&&(e="(empty array)")}return"(<"+function(t){return t.length<41?t:t.substr(0,38)+"..."}(e)+">, no stack trace)"}function g(){return"function"==typeof U}function b(t){var e=t.match(L)
return e?{fileName:e[1],line:parseInt(e[2],10)}:void 0}function w(t){this._parent=t,this._promisesCreated=0
var e=this._length=1+(void 0===t?0:t._length)
U(this,w),e>32&&this.uncycle()}var C,j,F,k=n._getDomain,x=n._async,E=e("./errors").Warning,T=e("./util"),P=T.canAttachTrace,R=/[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/,A=null,O=null,S=!1,I=!(0==T.env("BLUEBIRD_WARNINGS")),D=!(0==T.env("BLUEBIRD_LONG_STACK_TRACES"))
n.prototype.suppressUnhandledRejections=function(){var t=this._target()
t._bitField=-1048577&t._bitField|2097152},n.prototype._ensurePossibleRejectionHandled=function(){0==(2097152&this._bitField)&&(this._setRejectionIsUnhandled(),x.invokeLater(this._notifyUnhandledRejection,this,void 0))},n.prototype._notifyUnhandledRejectionIsHandled=function(){y("rejectionHandled",C,void 0,this)},n.prototype._notifyUnhandledRejection=function(){if(this._isRejectionUnhandled()){var t=this._settledValue()
this._setUnhandledRejectionIsNotified(),y("unhandledRejection",j,t,this)}},n.prototype._setUnhandledRejectionIsNotified=function(){this._bitField=262144|this._bitField},n.prototype._unsetUnhandledRejectionIsNotified=function(){this._bitField=-262145&this._bitField},n.prototype._isUnhandledRejectionNotified=function(){return(262144&this._bitField)>0},n.prototype._setRejectionIsUnhandled=function(){this._bitField=1048576|this._bitField},n.prototype._unsetRejectionIsUnhandled=function(){this._bitField=-1048577&this._bitField,this._isUnhandledRejectionNotified()&&(this._unsetUnhandledRejectionIsNotified(),this._notifyUnhandledRejectionIsHandled())},n.prototype._isRejectionUnhandled=function(){return(1048576&this._bitField)>0},n.prototype._warn=function(t,e){return p(t,e,this)},n.onPossiblyUnhandledRejection=function(t){var e=k()
j="function"==typeof t?null===e?t:e.bind(t):void 0},n.onUnhandledRejectionHandled=function(t){var e=k()
C="function"==typeof t?null===e?t:e.bind(t):void 0},n.longStackTraces=function(){if(x.haveItemsQueued()&&!q.longStackTraces)throw new Error("cannot enable long stack traces after promises have been created\n\n    See http://goo.gl/MqrFmX\n")
!q.longStackTraces&&g()&&(q.longStackTraces=!0,n.prototype._captureStackTrace=h,n.prototype._attachExtraTrace=f,r.activateLongStackTraces(),x.disableTrampolineIfNecessary())},n.hasLongStackTraces=function(){return q.longStackTraces&&g()},n.config=function(t){if("longStackTraces"in(t=Object(t))&&t.longStackTraces&&n.longStackTraces(),"warnings"in t&&(q.warnings=!!t.warnings),"cancellation"in t&&t.cancellation&&!q.cancellation){if(x.haveItemsQueued())throw new Error("cannot enable cancellation after promises are in use")
n.prototype._clearCancellationData=c,n.prototype._propagateFrom=l,n.prototype._onCancel=s,n.prototype._setOnCancel=a,n.prototype._attachCancellationCallback=o,n.prototype._execute=i,V=l,q.cancellation=!0}},n.prototype._execute=function(t,e,n){try{t(e,n)}catch(t){return t}},n.prototype._onCancel=function(){},n.prototype._setOnCancel=function(t){},n.prototype._attachCancellationCallback=function(t){},n.prototype._captureStackTrace=function(){},n.prototype._attachExtraTrace=function(){},n.prototype._clearCancellationData=function(){},n.prototype._propagateFrom=function(t,e){}
var V=function(t,e){0!=(2&e)&&t._isBound()&&this._setBoundTo(t._boundTo)},H=function(){return!1},L=/[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/
T.inherits(w,Error),r.CapturedTrace=w,w.prototype.uncycle=function(){var t=this._length
if(!(2>t)){for(var e=[],n={},r=0,i=this;void 0!==i;++r)e.push(i),i=i._parent
for(r=(t=this._length=r)-1;r>=0;--r){var o=e[r].stack
void 0===n[o]&&(n[o]=r)}for(r=0;t>r;++r){var s=n[e[r].stack]
if(void 0!==s&&s!==r){s>0&&(e[s-1]._parent=void 0,e[s-1]._length=1),e[r]._parent=void 0,e[r]._length=1
var a=r>0?e[r-1]:this
t-1>s?(a._parent=e[s+1],a._parent.uncycle(),a._length=a._parent._length+1):(a._parent=void 0,a._length=1)
for(var c=a._length+1,l=r-2;l>=0;--l)e[l]._length=c,c++
return}}}},w.prototype.attachExtraTrace=function(t){if(!t.__stackCleaned__){this.uncycle()
for(var e=d(t),n=e.message,r=[e.stack],i=this;void 0!==i;)r.push(_(i.stack.split("\n"))),i=i._parent;(function(t){for(var e=t[0],n=1;n<t.length;++n){for(var r=t[n],i=e.length-1,o=e[i],s=-1,a=r.length-1;a>=0;--a)if(r[a]===o){s=a
break}for(a=s;a>=0;--a){var c=r[a]
if(e[i]!==c)break
e.pop(),i--}e=r}})(r),function(t){for(var e=0;e<t.length;++e)(0===t[e].length||e+1<t.length&&t[e][0]===t[e+1][0])&&(t.splice(e,1),e--)}(r),T.notEnumerableProp(t,"stack",function(t,e){for(var n=0;n<e.length-1;++n)e[n].push("From previous event:"),e[n]=e[n].join("\n")
return n<e.length&&(e[n]=e[n].join("\n")),t+"\n"+e.join("\n")}(n,r)),T.notEnumerableProp(t,"__stackCleaned__",!0)}}
var N,U=function(){var t=/^\s*at\s*/,e=function(t,e){return"string"==typeof t?t:void 0!==e.name&&void 0!==e.message?e.toString():m(e)}
if("number"==typeof Error.stackTraceLimit&&"function"==typeof Error.captureStackTrace){Error.stackTraceLimit+=6,A=t,O=e
var n=Error.captureStackTrace
return H=function(t){return R.test(t)},function(t,e){Error.stackTraceLimit+=6,n(t,e),Error.stackTraceLimit-=6}}var r,i=new Error
if("string"==typeof i.stack&&i.stack.split("\n")[0].indexOf("stackDetection@")>=0)return A=/@/,O=e,S=!0,function(t){t.stack=(new Error).stack}
try{throw new Error}catch(t){r="stack"in t}return"stack"in i||!r||"number"!=typeof Error.stackTraceLimit?(O=function(t,e){return"string"==typeof t?t:"object"!=typeof e&&"function"!=typeof e||void 0===e.name||void 0===e.message?m(e):e.toString()},null):(A=t,O=e,function(t){Error.stackTraceLimit+=6
try{throw new Error}catch(e){t.stack=e.stack}Error.stackTraceLimit-=6})}(),M=function(){if(T.isNode)return function(e,n,r){return"rejectionHandled"===e?t.emit(e,r):t.emit(e,n,r)}
var e=!1,n=!0
try{var r=new self.CustomEvent("test")
e=r instanceof CustomEvent}catch(t){}if(!e)try{var i=document.createEvent("CustomEvent")
i.initCustomEvent("testingtheevent",!1,!0,{}),self.dispatchEvent(i)}catch(t){n=!1}n&&(N=function(t,n){var r
return e?r=new self.CustomEvent(t,{detail:n,bubbles:!1,cancelable:!0}):self.dispatchEvent&&(r=document.createEvent("CustomEvent")).initCustomEvent(t,!1,!0,n),!!r&&!self.dispatchEvent(r)})
var o={}
return o.unhandledRejection="onunhandledRejection".toLowerCase(),o.rejectionHandled="onrejectionHandled".toLowerCase(),function(t,e,n){var r=o[t],i=self[r]
return!!i&&("rejectionHandled"===t?i.call(self,n):i.call(self,e,n),!0)}}()
"undefined"!=typeof console&&void 0!==console.warn&&(F=function(t){console.warn(t)},T.isNode&&t.stderr.isTTY?F=function(e,n){var r=n?"[33m":"[31m"
t.stderr.write(r+e+"[0m\n")}:T.isNode||"string"!=typeof(new Error).stack||(F=function(t,e){console.warn("%c"+t,e?"color: darkorange":"color: red")}))
var q={warnings:I,longStackTraces:!1,cancellation:!1}
return D&&n.longStackTraces(),{longStackTraces:function(){return q.longStackTraces},warnings:function(){return q.warnings},cancellation:function(){return q.cancellation},propagateFromFunction:function(){return V},boundValueFunction:function(){return u},checkForgottenReturns:function(t,e,n,r){if(void 0===t&&e>0&&q.longStackTraces&&q.warnings){var i="a promise was created in a "+n+" handler but was not returned from it"
r._warn(i)}},setBounds:function(t,e){if(g()){for(var n,r,i=t.stack.split("\n"),o=e.stack.split("\n"),s=-1,a=-1,c=0;c<i.length;++c){if(l=b(i[c])){n=l.fileName,s=l.line
break}}for(c=0;c<o.length;++c){var l
if(l=b(o[c])){r=l.fileName,a=l.line
break}}0>s||0>a||!n||!r||n!==r||s>=a||(H=function(t){if(R.test(t))return!0
var e=b(t)
return!!(e&&e.fileName===n&&s<=e.line&&e.line<=a)})}},warn:p,deprecated:function(t,e){var n=t+" is deprecated and will be removed in a future version."
return e&&(n+=" Use "+e+" instead."),p(n)},CapturedTrace:w}}},{"./errors":12,"./util":36}],10:[function(t,e,n){"use strict"
e.exports=function(t){function e(){return this.value}function n(){throw this.reason}t.prototype.return=t.prototype.thenReturn=function(n){return n instanceof t&&n.suppressUnhandledRejections(),this._then(e,void 0,void 0,{value:n},void 0)},t.prototype.throw=t.prototype.thenThrow=function(t){return this._then(n,void 0,void 0,{reason:t},void 0)},t.prototype.catchThrow=function(t){if(arguments.length<=1)return this._then(void 0,n,void 0,{reason:t},void 0)
var e=arguments[1],r=function(){throw e}
return this.caught(t,r)},t.prototype.catchReturn=function(n){if(arguments.length<=1)return n instanceof t&&n.suppressUnhandledRejections(),this._then(void 0,e,void 0,{value:n},void 0)
var r=arguments[1]
r instanceof t&&r.suppressUnhandledRejections()
var i=function(){return r}
return this.caught(n,i)}}},{}],11:[function(t,e,n){"use strict"
e.exports=function(t,e){function n(){return o(this)}function r(t,n){return i(t,n,e,e)}var i=t.reduce,o=t.all
t.prototype.each=function(t){return this.mapSeries(t)._then(n,void 0,void 0,this,void 0)},t.prototype.mapSeries=function(t){return i(this,t,e,e)},t.each=function(t,e){return r(t,e)._then(n,void 0,void 0,t,void 0)},t.mapSeries=r}},{}],12:[function(t,e,n){"use strict"
function r(t,e){function n(r){return this instanceof n?(h(this,"message","string"==typeof r?r:e),h(this,"name",t),void(Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):Error.call(this))):new n(r)}return u(n,Error),n}function i(t){return this instanceof i?(h(this,"name","OperationalError"),h(this,"message",t),this.cause=t,this.isOperational=!0,void(t instanceof Error?(h(this,"message",t.message),h(this,"stack",t.stack)):Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor))):new i(t)}var o,s,a=t("./es5"),c=a.freeze,l=t("./util"),u=l.inherits,h=l.notEnumerableProp,f=r("Warning","warning"),p=r("CancellationError","cancellation error"),_=r("TimeoutError","timeout error"),d=r("AggregateError","aggregate error")
try{o=TypeError,s=RangeError}catch(t){o=r("TypeError","type error"),s=r("RangeError","range error")}for(var v="join pop push shift unshift slice filter forEach some every map indexOf lastIndexOf reduce reduceRight sort reverse".split(" "),y=0;y<v.length;++y)"function"==typeof Array.prototype[v[y]]&&(d.prototype[v[y]]=Array.prototype[v[y]])
a.defineProperty(d.prototype,"length",{value:0,configurable:!1,writable:!0,enumerable:!0}),d.prototype.isOperational=!0
var m=0
d.prototype.toString=function(){var t=Array(4*m+1).join(" "),e="\n"+t+"AggregateError of:\n"
m++,t=Array(4*m+1).join(" ")
for(var n=0;n<this.length;++n){for(var r=this[n]===this?"[Circular AggregateError]":this[n]+"",i=r.split("\n"),o=0;o<i.length;++o)i[o]=t+i[o]
e+=(r=i.join("\n"))+"\n"}return m--,e},u(i,Error)
var g=Error.__BluebirdErrorTypes__
g||(g=c({CancellationError:p,TimeoutError:_,OperationalError:i,RejectionError:i,AggregateError:d}),h(Error,"__BluebirdErrorTypes__",g)),e.exports={Error:Error,TypeError:o,RangeError:s,CancellationError:g.CancellationError,OperationalError:g.OperationalError,TimeoutError:g.TimeoutError,AggregateError:g.AggregateError,Warning:f}},{"./es5":13,"./util":36}],13:[function(t,e,n){var r=function(){"use strict"
return void 0===this}()
if(r)e.exports={freeze:Object.freeze,defineProperty:Object.defineProperty,getDescriptor:Object.getOwnPropertyDescriptor,keys:Object.keys,names:Object.getOwnPropertyNames,getPrototypeOf:Object.getPrototypeOf,isArray:Array.isArray,isES5:r,propertyIsWritable:function(t,e){var n=Object.getOwnPropertyDescriptor(t,e)
return!(n&&!n.writable&&!n.set)}}
else{var i={}.hasOwnProperty,o={}.toString,s={}.constructor.prototype,a=function(t){var e=[]
for(var n in t)i.call(t,n)&&e.push(n)
return e}
e.exports={isArray:function(t){try{return"[object Array]"===o.call(t)}catch(t){return!1}},keys:a,names:a,defineProperty:function(t,e,n){return t[e]=n.value,t},getDescriptor:function(t,e){return{value:t[e]}},freeze:function(t){return t},getPrototypeOf:function(t){try{return Object(t).constructor.prototype}catch(t){return s}},isES5:r,propertyIsWritable:function(){return!0}}}},{}],14:[function(t,e,n){"use strict"
e.exports=function(t,e){var n=t.map
t.prototype.filter=function(t,r){return n(this,t,r,e)},t.filter=function(t,r,i){return n(t,r,i,e)}}},{}],15:[function(t,e,n){"use strict"
e.exports=function(e,n){function r(t){this.finallyHandler=t}function i(t,e){return null!=t.cancelPromise&&(arguments.length>1?t.cancelPromise._reject(e):t.cancelPromise._cancel(),t.cancelPromise=null,!0)}function o(){return a.call(this,this.promise._target()._settledValue())}function s(t){return i(this,t)?void 0:(u.e=t,u)}function a(t){var a=this.promise,c=this.handler
if(!this.called){this.called=!0
var h=0===this.type?c.call(a._boundValue()):c.call(a._boundValue(),t)
if(void 0!==h){var f=n(h,a)
if(f instanceof e){if(null!=this.cancelPromise){if(f.isCancelled()){var p=new l("late cancellation observer")
return a._attachExtraTrace(p),u.e=p,u}f.isPending()&&f._attachCancellationCallback(new r(this))}return f._then(o,s,void 0,this,void 0)}}}return a.isRejected()?(i(this),u.e=t,u):(i(this),t)}var c=t("./util"),l=e.CancellationError,u=c.errorObj
return r.prototype._resultCancelled=function(){i(this.finallyHandler)},e.prototype._passThrough=function(t,e,n,r){return"function"!=typeof t?this.then():this._then(n,r,void 0,{promise:this,handler:t,called:!1,cancelPromise:null,type:e},void 0)},e.prototype.lastly=e.prototype.finally=function(t){return this._passThrough(t,0,a,a)},e.prototype.tap=function(t){return this._passThrough(t,1,a)},a}},{"./util":36}],16:[function(t,e,n){"use strict"
e.exports=function(e,n,r,i,o,s){function a(t,n,i,o){var s=this._promise=new e(r)
s._captureStackTrace(),s._setOnCancel(this),this._stack=o,this._generatorFunction=t,this._receiver=n,this._generator=void 0,this._yieldHandlers="function"==typeof i?[i].concat(f):f,this._yieldedPromise=null}var c=t("./errors").TypeError,l=t("./util"),u=l.errorObj,h=l.tryCatch,f=[]
l.inherits(a,o),a.prototype._isResolved=function(){return null===this.promise},a.prototype._cleanup=function(){this._promise=this._generator=null},a.prototype._promiseCancelled=function(){if(!this._isResolved()){var t
if(void 0!==this._generator.return)this._promise._pushContext(),t=h(this._generator.return).call(this._generator,void 0),this._promise._popContext()
else{var n=new e.CancellationError("generator .return() sentinel")
e.coroutine.returnSentinel=n,this._promise._attachExtraTrace(n),this._promise._pushContext(),t=h(this._generator.throw).call(this._generator,n),this._promise._popContext(),t===u&&t.e===n&&(t=null)}var r=this._promise
this._cleanup(),t===u?r._rejectCallback(t.e,!1):r.cancel()}},a.prototype._promiseFulfilled=function(t){this._yieldedPromise=null,this._promise._pushContext()
var e=h(this._generator.next).call(this._generator,t)
this._promise._popContext(),this._continue(e)},a.prototype._promiseRejected=function(t){this._yieldedPromise=null,this._promise._attachExtraTrace(t),this._promise._pushContext()
var e=h(this._generator.throw).call(this._generator,t)
this._promise._popContext(),this._continue(e)},a.prototype._resultCancelled=function(){if(this._yieldedPromise instanceof e){var t=this._yieldedPromise
this._yieldedPromise=null,t.cancel()}},a.prototype.promise=function(){return this._promise},a.prototype._run=function(){this._generator=this._generatorFunction.call(this._receiver),this._receiver=this._generatorFunction=void 0,this._promiseFulfilled(void 0)},a.prototype._continue=function(t){var n=this._promise
if(t===u)return this._cleanup(),n._rejectCallback(t.e,!1)
var r=t.value
if(!0===t.done)return this._cleanup(),n._resolveCallback(r)
var o=i(r,this._promise)
if(o instanceof e||null!==(o=function(t,n,r){for(var o=0;o<n.length;++o){r._pushContext()
var s=h(n[o])(t)
if(r._popContext(),s===u){r._pushContext()
var a=e.reject(u.e)
return r._popContext(),a}var c=i(s,r)
if(c instanceof e)return c}return null}(o,this._yieldHandlers,this._promise))){var s=(o=o._target())._bitField
0==(50397184&s)?(this._yieldedPromise=o,o._proxy(this,null)):0!=(33554432&s)?this._promiseFulfilled(o._value()):0!=(16777216&s)?this._promiseRejected(o._reason()):this._promiseCancelled()}else this._promiseRejected(new c("A value %s was yielded that could not be treated as a promise\n\n    See http://goo.gl/MqrFmX\n\n".replace("%s",r)+"From coroutine:\n"+this._stack.split("\n").slice(1,-7).join("\n")))},e.coroutine=function(t,e){if("function"!=typeof t)throw new c("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n")
var n=Object(e).yieldHandler,r=a,i=(new Error).stack
return function(){var e=t.apply(this,arguments),o=new r(void 0,void 0,n,i),s=o.promise()
return o._generator=e,o._promiseFulfilled(void 0),s}},e.coroutine.addYieldHandler=function(t){if("function"!=typeof t)throw new c("expecting a function but got "+l.classString(t))
f.push(t)},e.spawn=function(t){if(s.deprecated("Promise.spawn()","Promise.coroutine()"),"function"!=typeof t)return n("generatorFunction must be a function\n\n    See http://goo.gl/MqrFmX\n")
var r=new a(t,this),i=r.promise()
return r._run(e.spawn),i}}},{"./errors":12,"./util":36}],17:[function(t,e,n){"use strict"
e.exports=function(e,n,r,i){var o=t("./util")
o.canEvaluate,o.tryCatch,o.errorObj,e.join=function(){var t,e=arguments.length-1
e>0&&"function"==typeof arguments[e]&&(t=arguments[e])
var r=[].slice.call(arguments)
t&&r.pop()
var i=new n(r).promise()
return void 0!==t?i.spread(t):i}}},{"./util":36}],18:[function(t,e,n){"use strict"
e.exports=function(e,n,r,i,o,s){function a(t,e,n,r){this.constructor$(t),this._promise._captureStackTrace()
var i=l()
this._callback=null===i?e:i.bind(e),this._preservedValues=r===o?new Array(this.length()):null,this._limit=n,this._inFlight=0,this._queue=n>=1?[]:p,this._init$(void 0,-2)}function c(t,e,n,i){if("function"!=typeof e)return r("expecting a function but got "+u.classString(e))
var o="object"==typeof n&&null!==n?n.concurrency:0
return new a(t,e,o="number"==typeof o&&isFinite(o)&&o>=1?o:0,i).promise()}var l=e._getDomain,u=t("./util"),h=u.tryCatch,f=u.errorObj,p=[]
u.inherits(a,n),a.prototype._init=function(){},a.prototype._promiseFulfilled=function(t,n){var r=this._values,o=this.length(),a=this._preservedValues,c=this._limit
if(0>n){if(r[n=-1*n-1]=t,c>=1&&(this._inFlight--,this._drainQueue(),this._isResolved()))return!0}else{if(c>=1&&this._inFlight>=c)return r[n]=t,this._queue.push(n),!1
null!==a&&(a[n]=t)
var l=this._promise,u=this._callback,p=l._boundValue()
l._pushContext()
var _=h(u).call(p,t,n,o),d=l._popContext()
if(s.checkForgottenReturns(_,d,null!==a?"Promise.filter":"Promise.map",l),_===f)return this._reject(_.e),!0
var v=i(_,this._promise)
if(v instanceof e){var y=(v=v._target())._bitField
if(0==(50397184&y))return c>=1&&this._inFlight++,r[n]=v,v._proxy(this,-1*(n+1)),!1
if(0==(33554432&y))return 0!=(16777216&y)?(this._reject(v._reason()),!0):(this._cancel(),!0)
_=v._value()}r[n]=_}return++this._totalResolved>=o&&(null!==a?this._filter(r,a):this._resolve(r),!0)},a.prototype._drainQueue=function(){for(var t=this._queue,e=this._limit,n=this._values;t.length>0&&this._inFlight<e;){if(this._isResolved())return
var r=t.pop()
this._promiseFulfilled(n[r],r)}},a.prototype._filter=function(t,e){for(var n=e.length,r=new Array(n),i=0,o=0;n>o;++o)t[o]&&(r[i++]=e[o])
r.length=i,this._resolve(r)},a.prototype.preservedValues=function(){return this._preservedValues},e.prototype.map=function(t,e){return c(this,t,e,null)},e.map=function(t,e,n,r){return c(t,e,n,r)}}},{"./util":36}],19:[function(t,e,n){"use strict"
e.exports=function(e,n,r,i,o){var s=t("./util"),a=s.tryCatch
e.method=function(t){if("function"!=typeof t)throw new e.TypeError("expecting a function but got "+s.classString(t))
return function(){var r=new e(n)
r._captureStackTrace(),r._pushContext()
var i=a(t).apply(this,arguments)
return r._popContext(),r._resolveFromSyncValue(i),r}},e.attempt=e.try=function(t){if("function"!=typeof t)return i("expecting a function but got "+s.classString(t))
var r,c=new e(n)
if(c._captureStackTrace(),c._pushContext(),arguments.length>1){o.deprecated("calling Promise.try with more than 1 argument")
var l=arguments[1],u=arguments[2]
r=s.isArray(l)?a(t).apply(u,l):a(t).call(u,l)}else r=a(t)()
return c._popContext(),c._resolveFromSyncValue(r),c},e.prototype._resolveFromSyncValue=function(t){t===s.errorObj?this._rejectCallback(t.e,!1):this._resolveCallback(t,!0)}}},{"./util":36}],20:[function(t,e,n){"use strict"
function r(t){var e
if(function(t){return t instanceof Error&&a.getPrototypeOf(t)===Error.prototype}(t)){(e=new s(t)).name=t.name,e.message=t.message,e.stack=t.stack
for(var n=a.keys(t),r=0;r<n.length;++r){var o=n[r]
c.test(o)||(e[o]=t[o])}return e}return i.markAsOriginatingFromRejection(t),t}var i=t("./util"),o=i.maybeWrapAsError,s=t("./errors").OperationalError,a=t("./es5"),c=/^(?:name|message|stack|cause)$/
e.exports=function(t,e){return function(n,i){if(null!==t){if(n){var s=r(o(n))
t._attachExtraTrace(s),t._reject(s)}else if(e){var a=[].slice.call(arguments,1)
t._fulfill(a)}else t._fulfill(i)
t=null}}}},{"./errors":12,"./es5":13,"./util":36}],21:[function(t,e,n){"use strict"
e.exports=function(e){function n(t,e){if(!o.isArray(t))return r.call(this,t,e)
var n=a(e).apply(this._boundValue(),[null].concat(t))
n===c&&s.throwLater(n.e)}function r(t,e){var n=this._boundValue(),r=void 0===t?a(e).call(n,null):a(e).call(n,null,t)
r===c&&s.throwLater(r.e)}function i(t,e){if(!t){var n=new Error(t+"")
n.cause=t,t=n}var r=a(e).call(this._boundValue(),t)
r===c&&s.throwLater(r.e)}var o=t("./util"),s=e._async,a=o.tryCatch,c=o.errorObj
e.prototype.asCallback=e.prototype.nodeify=function(t,e){if("function"==typeof t){var o=r
void 0!==e&&Object(e).spread&&(o=n),this._then(o,i,void 0,this,t)}return this}}},{"./util":36}],22:[function(e,n,r){"use strict"
n.exports=function(){function n(){}function r(t){this._bitField=0,this._fulfillmentHandler0=void 0,this._rejectionHandler0=void 0,this._promise0=void 0,this._receiver0=void 0,t!==g&&(function(t,e){if("function"!=typeof e)throw new y("expecting a function but got "+f.classString(e))
if(t.constructor!==r)throw new y("the promise constructor cannot be invoked directly\n\n    See http://goo.gl/MqrFmX\n")}(this,t),this._resolveFromExecutor(t)),this._promiseCreated()}function i(t){this.promise._resolveCallback(t)}function o(t){this.promise._rejectCallback(t,!1)}function s(t){var e=new r(g)
e._fulfillmentHandler0=t,e._rejectionHandler0=t,e._promise0=t,e._receiver0=t}var a,c=function(){return new y("circular promise resolution chain\n\n    See http://goo.gl/MqrFmX\n")},l=function(){return new r.PromiseInspection(this._target())},u=function(t){return r.reject(new y(t))},h={},f=e("./util")
a=f.isNode?function(){var e=t.domain
return void 0===e&&(e=null),e}:function(){return null},f.notEnumerableProp(r,"_getDomain",a)
var p=e("./es5"),_=e("./async"),d=new _
p.defineProperty(r,"_async",{value:d})
var v=e("./errors"),y=r.TypeError=v.TypeError
r.RangeError=v.RangeError
var m=r.CancellationError=v.CancellationError
r.TimeoutError=v.TimeoutError,r.OperationalError=v.OperationalError,r.RejectionError=v.OperationalError,r.AggregateError=v.AggregateError
var g=function(){},b={},w={},C=e("./thenables")(r,g),j=e("./promise_array")(r,g,C,u,n),F=e("./context")(r),k=F.create,x=e("./debuggability")(r,F),E=(x.CapturedTrace,e("./finally")(r,C)),T=e("./catch_filter")(w),P=e("./nodeback"),R=f.errorObj,A=f.tryCatch
return r.prototype.toString=function(){return"[object Promise]"},r.prototype.caught=r.prototype.catch=function(t){var e=arguments.length
if(e>1){var n,r=new Array(e-1),i=0
for(n=0;e-1>n;++n){var o=arguments[n]
if(!f.isObject(o))return u("expecting an object but got "+f.classString(o))
r[i++]=o}return r.length=i,t=arguments[n],this.then(void 0,T(r,t,this))}return this.then(void 0,t)},r.prototype.reflect=function(){return this._then(l,l,void 0,this,void 0)},r.prototype.then=function(t,e){if(x.warnings()&&arguments.length>0&&"function"!=typeof t&&"function"!=typeof e){var n=".then() only accepts functions but was passed: "+f.classString(t)
arguments.length>1&&(n+=", "+f.classString(e)),this._warn(n)}return this._then(t,e,void 0,void 0,void 0)},r.prototype.done=function(t,e){this._then(t,e,void 0,void 0,void 0)._setIsFinal()},r.prototype.spread=function(t){return"function"!=typeof t?u("expecting a function but got "+f.classString(t)):this.all()._then(t,void 0,void 0,b,void 0)},r.prototype.toJSON=function(){var t={isFulfilled:!1,isRejected:!1,fulfillmentValue:void 0,rejectionReason:void 0}
return this.isFulfilled()?(t.fulfillmentValue=this.value(),t.isFulfilled=!0):this.isRejected()&&(t.rejectionReason=this.reason(),t.isRejected=!0),t},r.prototype.all=function(){return arguments.length>0&&this._warn(".all() was passed arguments but it does not take any"),new j(this).promise()},r.prototype.error=function(t){return this.caught(f.originatesFromRejection,t)},r.is=function(t){return t instanceof r},r.fromNode=r.fromCallback=function(t){var e=new r(g),n=arguments.length>1&&!!Object(arguments[1]).multiArgs,i=A(t)(P(e,n))
return i===R&&e._rejectCallback(i.e,!0),e._isFateSealed()||e._setAsyncGuaranteed(),e},r.all=function(t){return new j(t).promise()},r.cast=function(t){var e=C(t)
return e instanceof r||((e=new r(g))._setFulfilled(),e._rejectionHandler0=t),e},r.resolve=r.fulfilled=r.cast,r.reject=r.rejected=function(t){var e=new r(g)
return e._captureStackTrace(),e._rejectCallback(t,!0),e},r.setScheduler=function(t){if("function"!=typeof t)throw new y("expecting a function but got "+f.classString(t))
var e=d._schedule
return d._schedule=t,e},r.prototype._then=function(t,e,n,i,o){var s=void 0!==o,c=s?o:new r(g),l=this._target(),u=l._bitField
s||(c._propagateFrom(this,3),c._captureStackTrace(),void 0===i&&0!=(2097152&this._bitField)&&(i=0!=(50397184&u)?this._boundValue():l===this?void 0:this._boundTo))
var h=a()
if(0!=(50397184&u)){var f,p,_=l._settlePromiseCtx
0!=(33554432&u)?(p=l._rejectionHandler0,f=t):0!=(16777216&u)?(p=l._fulfillmentHandler0,f=e,l._unsetRejectionIsUnhandled()):(_=l._settlePromiseLateCancellationObserver,p=new m("late cancellation observer"),l._attachExtraTrace(p),f=e),d.invoke(_,l,{handler:null===h?f:"function"==typeof f&&h.bind(f),promise:c,receiver:i,value:p})}else l._addCallbacks(t,e,c,i,h)
return c},r.prototype._length=function(){return 65535&this._bitField},r.prototype._isFateSealed=function(){return 0!=(117506048&this._bitField)},r.prototype._isFollowing=function(){return 67108864==(67108864&this._bitField)},r.prototype._setLength=function(t){this._bitField=-65536&this._bitField|65535&t},r.prototype._setFulfilled=function(){this._bitField=33554432|this._bitField},r.prototype._setRejected=function(){this._bitField=16777216|this._bitField},r.prototype._setFollowing=function(){this._bitField=67108864|this._bitField},r.prototype._setIsFinal=function(){this._bitField=4194304|this._bitField},r.prototype._isFinal=function(){return(4194304&this._bitField)>0},r.prototype._unsetCancelled=function(){this._bitField=-65537&this._bitField},r.prototype._setCancelled=function(){this._bitField=65536|this._bitField},r.prototype._setAsyncGuaranteed=function(){this._bitField=134217728|this._bitField},r.prototype._receiverAt=function(t){var e=0===t?this._receiver0:this[4*t-4+3]
return e===h?void 0:void 0===e&&this._isBound()?this._boundValue():e},r.prototype._promiseAt=function(t){return this[4*t-4+2]},r.prototype._fulfillmentHandlerAt=function(t){return this[4*t-4+0]},r.prototype._rejectionHandlerAt=function(t){return this[4*t-4+1]},r.prototype._boundValue=function(){},r.prototype._migrateCallback0=function(t){var e=(t._bitField,t._fulfillmentHandler0),n=t._rejectionHandler0,r=t._promise0,i=t._receiverAt(0)
void 0===i&&(i=h),this._addCallbacks(e,n,r,i,null)},r.prototype._migrateCallbackAt=function(t,e){var n=t._fulfillmentHandlerAt(e),r=t._rejectionHandlerAt(e),i=t._promiseAt(e),o=t._receiverAt(e)
void 0===o&&(o=h),this._addCallbacks(n,r,i,o,null)},r.prototype._addCallbacks=function(t,e,n,r,i){var o=this._length()
if(o>=65531&&(o=0,this._setLength(0)),0===o)this._promise0=n,this._receiver0=r,"function"==typeof t&&(this._fulfillmentHandler0=null===i?t:i.bind(t)),"function"==typeof e&&(this._rejectionHandler0=null===i?e:i.bind(e))
else{var s=4*o-4
this[s+2]=n,this[s+3]=r,"function"==typeof t&&(this[s+0]=null===i?t:i.bind(t)),"function"==typeof e&&(this[s+1]=null===i?e:i.bind(e))}return this._setLength(o+1),o},r.prototype._proxy=function(t,e){this._addCallbacks(void 0,void 0,e,t,null)},r.prototype._resolveCallback=function(t,e){if(0==(117506048&this._bitField)){if(t===this)return this._rejectCallback(c(),!1)
var n=C(t,this)
if(!(n instanceof r))return this._fulfill(t)
e&&this._propagateFrom(n,2)
var i=n._target(),o=i._bitField
if(0==(50397184&o)){var s=this._length()
s>0&&i._migrateCallback0(this)
for(var a=1;s>a;++a)i._migrateCallbackAt(this,a)
this._setFollowing(),this._setLength(0),this._setFollowee(i)}else if(0!=(33554432&o))this._fulfill(i._value())
else if(0!=(16777216&o))this._reject(i._reason())
else{var l=new m("late cancellation observer")
i._attachExtraTrace(l),this._reject(l)}}},r.prototype._rejectCallback=function(t,e){var n=f.ensureErrorObject(t),r=n===t
if(!r&&x.warnings()){var i="a promise was rejected with a non-error: "+f.classString(t)
this._warn(i,!0)}this._attachExtraTrace(n,!!e&&r),this._reject(t)},r.prototype._resolveFromExecutor=function(t){var e=this
this._captureStackTrace(),this._pushContext()
var n=!0,r=this._execute(t,(function(t){e._resolveCallback(t)}),(function(t){e._rejectCallback(t,n)}))
n=!1,this._popContext(),void 0!==r&&e._rejectCallback(r,!0)},r.prototype._settlePromiseFromHandler=function(t,e,n,r){var i=r._bitField
if(0==(65536&i)){var o
r._pushContext(),e===b?n&&"number"==typeof n.length?o=A(t).apply(this._boundValue(),n):(o=R).e=new y("cannot .spread() a non-array: "+f.classString(n)):o=A(t).call(e,n)
var s=r._popContext()
if(0==(65536&(i=r._bitField)))if(o===w)r._reject(n)
else if(o===R||o===r){var a=o===r?c():o.e
r._rejectCallback(a,!1)}else void 0===o&&s>0&&x.longStackTraces()&&x.warnings()&&r._warn("a promise was created in a handler but none were returned from it",!0),r._resolveCallback(o)}},r.prototype._target=function(){for(var t=this;t._isFollowing();)t=t._followee()
return t},r.prototype._followee=function(){return this._rejectionHandler0},r.prototype._setFollowee=function(t){this._rejectionHandler0=t},r.prototype._settlePromise=function(t,e,i,o){var s=t instanceof r,a=this._bitField,c=0!=(134217728&a)
0!=(65536&a)?(s&&t._invokeInternalOnCancel(),e===E?(i.cancelPromise=t,A(e).call(i,o)===R&&t._reject(R.e)):e===l?t._fulfill(l.call(i)):i instanceof n?i._promiseCancelled(t):s||t instanceof j?t._cancel():i.cancel()):"function"==typeof e?s?(c&&t._setAsyncGuaranteed(),this._settlePromiseFromHandler(e,i,o,t)):e.call(i,o,t):i instanceof n?i._isResolved()||(0!=(33554432&a)?i._promiseFulfilled(o,t):i._promiseRejected(o,t)):s&&(c&&t._setAsyncGuaranteed(),0!=(33554432&a)?t._fulfill(o):t._reject(o))},r.prototype._settlePromiseLateCancellationObserver=function(t){var e=t.handler,n=t.promise,i=t.receiver,o=t.value
"function"==typeof e?n instanceof r?this._settlePromiseFromHandler(e,i,o,n):e.call(i,o,n):n instanceof r&&n._reject(o)},r.prototype._settlePromiseCtx=function(t){this._settlePromise(t.promise,t.handler,t.receiver,t.value)},r.prototype._settlePromise0=function(t,e,n){var r=this._promise0,i=this._receiverAt(0)
this._promise0=void 0,this._receiver0=void 0,this._settlePromise(r,t,i,e)},r.prototype._clearCallbackDataAtIndex=function(t){var e=4*t-4
this[e+2]=this[e+3]=this[e+0]=this[e+1]=void 0},r.prototype._fulfill=function(t){var e=this._bitField
if(!((117506048&e)>>>16)){if(t===this){var n=c()
return this._attachExtraTrace(n),this._reject(n)}this._setFulfilled(),this._rejectionHandler0=t,(65535&e)>0&&(0!=(134217728&e)?this._settlePromises():d.settlePromises(this))}},r.prototype._reject=function(t){var e=this._bitField
if(!((117506048&e)>>>16))return this._setRejected(),this._fulfillmentHandler0=t,this._isFinal()?d.fatalError(t,f.isNode):void((65535&e)>0?0!=(134217728&e)?this._settlePromises():d.settlePromises(this):this._ensurePossibleRejectionHandled())},r.prototype._fulfillPromises=function(t,e){for(var n=1;t>n;n++){var r=this._fulfillmentHandlerAt(n),i=this._promiseAt(n),o=this._receiverAt(n)
this._clearCallbackDataAtIndex(n),this._settlePromise(i,r,o,e)}},r.prototype._rejectPromises=function(t,e){for(var n=1;t>n;n++){var r=this._rejectionHandlerAt(n),i=this._promiseAt(n),o=this._receiverAt(n)
this._clearCallbackDataAtIndex(n),this._settlePromise(i,r,o,e)}},r.prototype._settlePromises=function(){var t=this._bitField,e=65535&t
if(e>0){if(0!=(16842752&t)){var n=this._fulfillmentHandler0
this._settlePromise0(this._rejectionHandler0,n,t),this._rejectPromises(e,n)}else{var r=this._rejectionHandler0
this._settlePromise0(this._fulfillmentHandler0,r,t),this._fulfillPromises(e,r)}this._setLength(0)}this._clearCancellationData()},r.prototype._settledValue=function(){var t=this._bitField
return 0!=(33554432&t)?this._rejectionHandler0:0!=(16777216&t)?this._fulfillmentHandler0:void 0},r.defer=r.pending=function(){return x.deprecated("Promise.defer","new Promise"),{promise:new r(g),resolve:i,reject:o}},f.notEnumerableProp(r,"_makeSelfResolutionError",c),e("./method")(r,g,C,u,x),e("./bind")(r,g,C,x),e("./cancel")(r,j,u,x),e("./direct_resolve")(r),e("./synchronous_inspection")(r),e("./join")(r,j,C,g,x),r.Promise=r,e("./map.js")(r,j,u,C,g,x),e("./using.js")(r,u,C,k,g,x),e("./timers.js")(r,g),e("./generators.js")(r,u,g,C,n,x),e("./nodeify.js")(r),e("./call_get.js")(r),e("./props.js")(r,j,C,u),e("./race.js")(r,g,C,u),e("./reduce.js")(r,j,u,C,g,x),e("./settle.js")(r,j,x),e("./some.js")(r,j,u),e("./promisify.js")(r,g),e("./any.js")(r),e("./each.js")(r,g),e("./filter.js")(r,g),f.toFastProperties(r),f.toFastProperties(r.prototype),s({a:1}),s({b:2}),s({c:3}),s(1),s((function(){})),s(void 0),s(!1),s(new r(g)),x.setBounds(_.firstLineError,f.lastLineError),r}},{"./any.js":1,"./async":2,"./bind":3,"./call_get.js":5,"./cancel":6,"./catch_filter":7,"./context":8,"./debuggability":9,"./direct_resolve":10,"./each.js":11,"./errors":12,"./es5":13,"./filter.js":14,"./finally":15,"./generators.js":16,"./join":17,"./map.js":18,"./method":19,"./nodeback":20,"./nodeify.js":21,"./promise_array":23,"./promisify.js":24,"./props.js":25,"./race.js":27,"./reduce.js":28,"./settle.js":30,"./some.js":31,"./synchronous_inspection":32,"./thenables":33,"./timers.js":34,"./using.js":35,"./util":36}],23:[function(t,e,n){"use strict"
e.exports=function(e,n,r,i,o){function s(t){var r=this._promise=new e(n)
t instanceof e&&r._propagateFrom(t,3),r._setOnCancel(this),this._values=t,this._length=0,this._totalResolved=0,this._init(void 0,-2)}var a=t("./util")
return a.isArray,a.inherits(s,o),s.prototype.length=function(){return this._length},s.prototype.promise=function(){return this._promise},s.prototype._init=function t(n,o){var s=r(this._values,this._promise)
if(s instanceof e){var c=(s=s._target())._bitField
if(this._values=s,0==(50397184&c))return this._promise._setAsyncGuaranteed(),s._then(t,this._reject,void 0,this,o)
if(0==(33554432&c))return 0!=(16777216&c)?this._reject(s._reason()):this._cancel()
s=s._value()}if(null!==(s=a.asArray(s)))return 0===s.length?void(-5===o?this._resolveEmptyArray():this._resolve(function(t){switch(t){case-2:return[]
case-3:return{}}}(o))):void this._iterate(s)
var l=i("expecting an array or an iterable object but got "+a.classString(s)).reason()
this._promise._rejectCallback(l,!1)},s.prototype._iterate=function(t){var n=this.getActualLength(t.length)
this._length=n,this._values=this.shouldCopyValues()?new Array(n):this._values
for(var i=this._promise,o=!1,s=null,a=0;n>a;++a){var c=r(t[a],i)
c instanceof e?s=(c=c._target())._bitField:s=null,o?null!==s&&c.suppressUnhandledRejections():null!==s?0==(50397184&s)?(c._proxy(this,a),this._values[a]=c):o=0!=(33554432&s)?this._promiseFulfilled(c._value(),a):0!=(16777216&s)?this._promiseRejected(c._reason(),a):this._promiseCancelled(a):o=this._promiseFulfilled(c,a)}o||i._setAsyncGuaranteed()},s.prototype._isResolved=function(){return null===this._values},s.prototype._resolve=function(t){this._values=null,this._promise._fulfill(t)},s.prototype._cancel=function(){!this._isResolved()&&this._promise.isCancellable()&&(this._values=null,this._promise._cancel())},s.prototype._reject=function(t){this._values=null,this._promise._rejectCallback(t,!1)},s.prototype._promiseFulfilled=function(t,e){return this._values[e]=t,++this._totalResolved>=this._length&&(this._resolve(this._values),!0)},s.prototype._promiseCancelled=function(){return this._cancel(),!0},s.prototype._promiseRejected=function(t){return this._totalResolved++,this._reject(t),!0},s.prototype._resultCancelled=function(){if(!this._isResolved()){var t=this._values
if(this._cancel(),t instanceof e)t.cancel()
else for(var n=0;n<t.length;++n)t[n]instanceof e&&t[n].cancel()}},s.prototype.shouldCopyValues=function(){return!0},s.prototype.getActualLength=function(t){return t},s}},{"./util":36}],24:[function(t,e,n){"use strict"
e.exports=function(e,n){function r(t){return!v.test(t)}function i(t){try{return!0===t.__isPromisified__}catch(t){return!1}}function o(t,e,n){var r=l.getDataPropertyOrDefault(t,e+n,d)
return!!r&&i(r)}function s(t,e,n,r){for(var s=l.inheritedDataKeys(t),a=[],c=0;c<s.length;++c){var u=s[c],h=t[u],f=r===y||y(u,h,t)
"function"!=typeof h||i(h)||o(t,u,e)||!r(u,h,t,f)||a.push(u,h)}return function(t,e,n){for(var r=0;r<t.length;r+=2){var i=t[r]
if(n.test(i))for(var o=i.replace(n,""),s=0;s<t.length;s+=2)if(t[s]===o)throw new _("Cannot promisify an API that has normal methods with '%s'-suffix\n\n    See http://goo.gl/MqrFmX\n".replace("%s",e))}}(a,e,n),a}function a(t,e,n,r,i){for(var o=new RegExp(m(e)+"$"),a=s(t,e,o,n),u=0,h=a.length;h>u;u+=2){var f=a[u],p=a[u+1],_=f+e
if(r===g)t[_]=g(f,c,f,p,e,i)
else{var d=r(p,(function(){return g(f,c,f,p,e,i)}))
l.notEnumerableProp(d,"__isPromisified__",!0),t[_]=d}}return l.toFastProperties(t),t}var c={},l=t("./util"),u=t("./nodeback"),h=l.withAppended,f=l.maybeWrapAsError,p=l.canEvaluate,_=t("./errors").TypeError,d={__isPromisified__:!0},v=new RegExp("^(?:"+["arity","length","name","arguments","caller","callee","prototype","__isPromisified__"].join("|")+")$"),y=function(t){return l.isIdentifier(t)&&"_"!==t.charAt(0)&&"constructor"!==t},m=function(t){return t.replace(/([$])/,"\\$")},g=p?void 0:function(t,r,i,o,s,a){function p(){var i=r
r===c&&(i=this)
var o=new e(n)
o._captureStackTrace()
var s="string"==typeof d&&this!==_?this[d]:t,l=u(o,a)
try{s.apply(i,h(arguments,l))}catch(t){o._rejectCallback(f(t),!0)}return o._isFateSealed()||o._setAsyncGuaranteed(),o}var _=function(){return this}(),d=t
return"string"==typeof d&&(t=o),l.notEnumerableProp(p,"__isPromisified__",!0),p}
e.promisify=function(t,e){if("function"!=typeof t)throw new _("expecting a function but got "+l.classString(t))
if(i(t))return t
var n=function(t,e,n){return g(t,e,void 0,t,null,n)}(t,void 0===(e=Object(e)).context?c:e.context,!!e.multiArgs)
return l.copyDescriptors(t,n,r),n},e.promisifyAll=function(t,e){if("function"!=typeof t&&"object"!=typeof t)throw new _("the target of promisifyAll must be an object or a function\n\n    See http://goo.gl/MqrFmX\n")
var n=!!(e=Object(e)).multiArgs,r=e.suffix
"string"!=typeof r&&(r="Async")
var i=e.filter
"function"!=typeof i&&(i=y)
var o=e.promisifier
if("function"!=typeof o&&(o=g),!l.isIdentifier(r))throw new RangeError("suffix must be a valid identifier\n\n    See http://goo.gl/MqrFmX\n")
for(var s=l.inheritedDataKeys(t),c=0;c<s.length;++c){var u=t[s[c]]
"constructor"!==s[c]&&l.isClass(u)&&(a(u.prototype,r,i,o,n),a(u,r,i,o,n))}return a(t,r,i,o,n)}}},{"./errors":12,"./nodeback":20,"./util":36}],25:[function(t,e,n){"use strict"
e.exports=function(e,n,r,i){function o(t){var e,n=!1
if(void 0!==a&&t instanceof a)e=h(t),n=!0
else{var r=u.keys(t),i=r.length
e=new Array(2*i)
for(var o=0;i>o;++o){var s=r[o]
e[o]=t[s],e[o+i]=s}}this.constructor$(e),this._isMap=n,this._init$(void 0,-3)}function s(t){var n,s=r(t)
return l(s)?(n=s instanceof e?s._then(e.props,void 0,void 0,void 0,void 0):new o(s).promise(),s instanceof e&&n._propagateFrom(s,2),n):i("cannot await properties of a non-object\n\n    See http://goo.gl/MqrFmX\n")}var a,c=t("./util"),l=c.isObject,u=t("./es5")
"function"==typeof Map&&(a=Map)
var h=function(){function t(t,r){this[e]=t,this[e+n]=r,e++}var e=0,n=0
return function(r){n=r.size,e=0
var i=new Array(2*r.size)
return r.forEach(t,i),i}}()
c.inherits(o,n),o.prototype._init=function(){},o.prototype._promiseFulfilled=function(t,e){if(this._values[e]=t,++this._totalResolved>=this._length){var n
if(this._isMap)n=function(t){for(var e=new a,n=t.length/2|0,r=0;n>r;++r){var i=t[n+r],o=t[r]
e.set(i,o)}return e}(this._values)
else{n={}
for(var r=this.length(),i=0,o=this.length();o>i;++i)n[this._values[i+r]]=this._values[i]}return this._resolve(n),!0}return!1},o.prototype.shouldCopyValues=function(){return!1},o.prototype.getActualLength=function(t){return t>>1},e.prototype.props=function(){return s(this)},e.props=function(t){return s(t)}}},{"./es5":13,"./util":36}],26:[function(t,e,n){"use strict"
function r(t){this._capacity=t,this._length=0,this._front=0}r.prototype._willBeOverCapacity=function(t){return this._capacity<t},r.prototype._pushOne=function(t){var e=this.length()
this._checkCapacity(e+1),this[this._front+e&this._capacity-1]=t,this._length=e+1},r.prototype._unshiftOne=function(t){var e=this._capacity
this._checkCapacity(this.length()+1)
var n=(this._front-1&e-1^e)-e
this[n]=t,this._front=n,this._length=this.length()+1},r.prototype.unshift=function(t,e,n){this._unshiftOne(n),this._unshiftOne(e),this._unshiftOne(t)},r.prototype.push=function(t,e,n){var r=this.length()+3
if(this._willBeOverCapacity(r))return this._pushOne(t),this._pushOne(e),void this._pushOne(n)
var i=this._front+r-3
this._checkCapacity(r)
var o=this._capacity-1
this[i+0&o]=t,this[i+1&o]=e,this[i+2&o]=n,this._length=r},r.prototype.shift=function(){var t=this._front,e=this[t]
return this[t]=void 0,this._front=t+1&this._capacity-1,this._length--,e},r.prototype.length=function(){return this._length},r.prototype._checkCapacity=function(t){this._capacity<t&&this._resizeTo(this._capacity<<1)},r.prototype._resizeTo=function(t){var e=this._capacity
this._capacity=t,function(t,e,n,r,i){for(var o=0;i>o;++o)n[o+r]=t[o+e],t[o+e]=void 0}(this,0,this,e,this._front+this._length&e-1)},e.exports=r},{}],27:[function(t,e,n){"use strict"
e.exports=function(e,n,r,i){function o(t,o){var c=r(t)
if(c instanceof e)return a(c)
if(null===(t=s.asArray(t)))return i("expecting an array or an iterable object but got "+s.classString(t))
var l=new e(n)
void 0!==o&&l._propagateFrom(o,3)
for(var u=l._fulfill,h=l._reject,f=0,p=t.length;p>f;++f){var _=t[f];(void 0!==_||f in t)&&e.cast(_)._then(u,h,void 0,l,null)}return l}var s=t("./util"),a=function(t){return t.then((function(e){return o(e,t)}))}
e.race=function(t){return o(t,void 0)},e.prototype.race=function(){return o(this,void 0)}}},{"./util":36}],28:[function(t,e,n){"use strict"
e.exports=function(e,n,r,i,o,s){function a(t,n,r,i){this.constructor$(t)
var s=f()
this._fn=null===s?n:s.bind(n),void 0!==r&&(r=e.resolve(r))._attachCancellationCallback(this),this._initialValue=r,this._currentCancellable=null,this._eachValues=i===o?[]:void 0,this._promise._captureStackTrace(),this._init$(void 0,-5)}function c(t,e){this.isFulfilled()?e._resolve(t):e._reject(t)}function l(t,e,n,i){return"function"!=typeof e?r("expecting a function but got "+p.classString(e)):new a(t,e,n,i).promise()}function u(t){this.accum=t,this.array._gotAccum(t)
var n=i(this.value,this.array._promise)
return n instanceof e?(this.array._currentCancellable=n,n._then(h,void 0,void 0,this,void 0)):h.call(this,n)}function h(t){var n,r=this.array,i=r._promise,o=_(r._fn)
i._pushContext(),(n=void 0!==r._eachValues?o.call(i._boundValue(),t,this.index,this.length):o.call(i._boundValue(),this.accum,t,this.index,this.length))instanceof e&&(r._currentCancellable=n)
var a=i._popContext()
return s.checkForgottenReturns(n,a,void 0!==r._eachValues?"Promise.each":"Promise.reduce",i),n}var f=e._getDomain,p=t("./util"),_=p.tryCatch
p.inherits(a,n),a.prototype._gotAccum=function(t){void 0!==this._eachValues&&t!==o&&this._eachValues.push(t)},a.prototype._eachComplete=function(t){return this._eachValues.push(t),this._eachValues},a.prototype._init=function(){},a.prototype._resolveEmptyArray=function(){this._resolve(void 0!==this._eachValues?this._eachValues:this._initialValue)},a.prototype.shouldCopyValues=function(){return!1},a.prototype._resolve=function(t){this._promise._resolveCallback(t),this._values=null},a.prototype._resultCancelled=function(t){return t===this._initialValue?this._cancel():void(this._isResolved()||(this._resultCancelled$(),this._currentCancellable instanceof e&&this._currentCancellable.cancel(),this._initialValue instanceof e&&this._initialValue.cancel()))},a.prototype._iterate=function(t){this._values=t
var n,r,i=t.length
if(void 0!==this._initialValue?(n=this._initialValue,r=0):(n=e.resolve(t[0]),r=1),this._currentCancellable=n,!n.isRejected())for(;i>r;++r){var o={accum:null,value:t[r],index:r,length:i,array:this}
n=n._then(u,void 0,void 0,o,void 0)}void 0!==this._eachValues&&(n=n._then(this._eachComplete,void 0,void 0,this,void 0)),n._then(c,c,void 0,n,this)},e.prototype.reduce=function(t,e){return l(this,t,e,null)},e.reduce=function(t,e,n,r){return l(t,e,n,r)}}},{"./util":36}],29:[function(e,n,i){"use strict"
var o,s=e("./util")
if(s.isNode&&"undefined"==typeof MutationObserver){var a=r.setImmediate,c=t.nextTick
o=s.isRecentNode?function(t){a.call(r,t)}:function(e){c.call(t,e)}}else"undefined"==typeof MutationObserver||"undefined"!=typeof window&&window.navigator&&window.navigator.standalone?o="undefined"!=typeof setImmediate?function(t){setImmediate(t)}:"undefined"!=typeof setTimeout?function(t){setTimeout(t,0)}:function(){throw new Error("No async scheduler available\n\n    See http://goo.gl/MqrFmX\n")}:(o=function(t){var e=document.createElement("div")
return new MutationObserver(t).observe(e,{attributes:!0}),function(){e.classList.toggle("foo")}}).isStatic=!0
n.exports=o},{"./util":36}],30:[function(t,e,n){"use strict"
e.exports=function(e,n,r){function i(t){this.constructor$(t)}var o=e.PromiseInspection
t("./util").inherits(i,n),i.prototype._promiseResolved=function(t,e){return this._values[t]=e,++this._totalResolved>=this._length&&(this._resolve(this._values),!0)},i.prototype._promiseFulfilled=function(t,e){var n=new o
return n._bitField=33554432,n._settledValueField=t,this._promiseResolved(e,n)},i.prototype._promiseRejected=function(t,e){var n=new o
return n._bitField=16777216,n._settledValueField=t,this._promiseResolved(e,n)},e.settle=function(t){return r.deprecated(".settle()",".reflect()"),new i(t).promise()},e.prototype.settle=function(){return e.settle(this)}}},{"./util":36}],31:[function(t,e,n){"use strict"
e.exports=function(e,n,r){function i(t){this.constructor$(t),this._howMany=0,this._unwrap=!1,this._initialized=!1}function o(t,e){if((0|e)!==e||0>e)return r("expecting a positive integer\n\n    See http://goo.gl/MqrFmX\n")
var n=new i(t),o=n.promise()
return n.setHowMany(e),n.init(),o}var s=t("./util"),a=t("./errors").RangeError,c=t("./errors").AggregateError,l=s.isArray,u={}
s.inherits(i,n),i.prototype._init=function(){if(this._initialized){if(0===this._howMany)return void this._resolve([])
this._init$(void 0,-5)
var t=l(this._values)
!this._isResolved()&&t&&this._howMany>this._canPossiblyFulfill()&&this._reject(this._getRangeError(this.length()))}},i.prototype.init=function(){this._initialized=!0,this._init()},i.prototype.setUnwrap=function(){this._unwrap=!0},i.prototype.howMany=function(){return this._howMany},i.prototype.setHowMany=function(t){this._howMany=t},i.prototype._promiseFulfilled=function(t){return this._addFulfilled(t),this._fulfilled()===this.howMany()&&(this._values.length=this.howMany(),1===this.howMany()&&this._unwrap?this._resolve(this._values[0]):this._resolve(this._values),!0)},i.prototype._promiseRejected=function(t){return this._addRejected(t),this._checkOutcome()},i.prototype._promiseCancelled=function(){return this._values instanceof e||null==this._values?this._cancel():(this._addRejected(u),this._checkOutcome())},i.prototype._checkOutcome=function(){if(this.howMany()>this._canPossiblyFulfill()){for(var t=new c,e=this.length();e<this._values.length;++e)this._values[e]!==u&&t.push(this._values[e])
return t.length>0?this._reject(t):this._cancel(),!0}return!1},i.prototype._fulfilled=function(){return this._totalResolved},i.prototype._rejected=function(){return this._values.length-this.length()},i.prototype._addRejected=function(t){this._values.push(t)},i.prototype._addFulfilled=function(t){this._values[this._totalResolved++]=t},i.prototype._canPossiblyFulfill=function(){return this.length()-this._rejected()},i.prototype._getRangeError=function(t){var e="Input array must contain at least "+this._howMany+" items but contains only "+t+" items"
return new a(e)},i.prototype._resolveEmptyArray=function(){this._reject(this._getRangeError(0))},e.some=function(t,e){return o(t,e)},e.prototype.some=function(t){return o(this,t)},e._SomePromiseArray=i}},{"./errors":12,"./util":36}],32:[function(t,e,n){"use strict"
e.exports=function(t){function e(t){void 0!==t?(t=t._target(),this._bitField=t._bitField,this._settledValueField=t._isFateSealed()?t._settledValue():void 0):(this._bitField=0,this._settledValueField=void 0)}e.prototype._settledValue=function(){return this._settledValueField}
var n=e.prototype.value=function(){if(!this.isFulfilled())throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\n\n    See http://goo.gl/MqrFmX\n")
return this._settledValue()},r=e.prototype.error=e.prototype.reason=function(){if(!this.isRejected())throw new TypeError("cannot get rejection reason of a non-rejected promise\n\n    See http://goo.gl/MqrFmX\n")
return this._settledValue()},i=e.prototype.isFulfilled=function(){return 0!=(33554432&this._bitField)},o=e.prototype.isRejected=function(){return 0!=(16777216&this._bitField)},s=e.prototype.isPending=function(){return 0==(50397184&this._bitField)},a=e.prototype.isResolved=function(){return 0!=(50331648&this._bitField)}
e.prototype.isCancelled=t.prototype._isCancelled=function(){return 65536==(65536&this._bitField)},t.prototype.isCancelled=function(){return this._target()._isCancelled()},t.prototype.isPending=function(){return s.call(this._target())},t.prototype.isRejected=function(){return o.call(this._target())},t.prototype.isFulfilled=function(){return i.call(this._target())},t.prototype.isResolved=function(){return a.call(this._target())},t.prototype.value=function(){return n.call(this._target())},t.prototype.reason=function(){var t=this._target()
return t._unsetRejectionIsUnhandled(),r.call(t)},t.prototype._value=function(){return this._settledValue()},t.prototype._reason=function(){return this._unsetRejectionIsUnhandled(),this._settledValue()},t.PromiseInspection=e}},{}],33:[function(t,e,n){"use strict"
e.exports=function(e,n){function r(t){try{return function(t){return t.then}(t)}catch(t){return s.e=t,s}}function i(t,r,i){var a=new e(n),c=a
i&&i._pushContext(),a._captureStackTrace(),i&&i._popContext()
var l=!0,u=o.tryCatch(r).call(t,(function(t){a&&(a._resolveCallback(t),a=null)}),(function(t){a&&(a._rejectCallback(t,l),a=null)}))
return l=!1,a&&u===s&&(a._rejectCallback(u.e,!0),a=null),c}var o=t("./util"),s=o.errorObj,a=o.isObject,c={}.hasOwnProperty
return function(t,o){if(a(t)){if(t instanceof e)return t
var l=r(t)
if(l===s){o&&o._pushContext()
var u=e.reject(l.e)
return o&&o._popContext(),u}if("function"==typeof l){if(function(t){return c.call(t,"_promise0")}(t)){u=new e(n)
return t._then(u._fulfill,u._reject,void 0,u,null),u}return i(t,l,o)}}return t}}},{"./util":36}],34:[function(t,e,n){"use strict"
e.exports=function(e,n){function r(t){var e=this
return e instanceof Number&&(e=+e),clearTimeout(e),t}function i(t){var e=this
throw e instanceof Number&&(e=+e),clearTimeout(e),t}var o=t("./util"),s=e.TimeoutError,a=function(t,e){var n
t.isPending()&&(n="string"!=typeof e?e instanceof Error?e:new s("operation timed out"):new s(e),o.markAsOriginatingFromRejection(n),t._attachExtraTrace(n),t._reject(n))},c=function(t){return l(+this).thenReturn(t)},l=e.delay=function(t,r){var i
return void 0!==r?i=e.resolve(r)._then(c,null,null,t,void 0):(i=new e(n),setTimeout((function(){i._fulfill()}),+t)),i._setAsyncGuaranteed(),i}
e.prototype.delay=function(t){return l(t,this)},e.prototype.timeout=function(t,e){t=+t
var n=this.then(),o=setTimeout((function(){a(n,e)}),t)
return n._then(r,i,void 0,o,void 0)}}},{"./util":36}],35:[function(t,e,n){"use strict"
e.exports=function(e,n,r,i,o,s){function a(t){setTimeout((function(){throw t}),0)}function c(t,n){var i=0,s=t.length,c=new e(o)
return function o(){if(i>=s)return c._fulfill()
var l=function(t){var e=r(t)
return e!==t&&"function"==typeof t._isDisposable&&"function"==typeof t._getDisposer&&t._isDisposable()&&e._setDisposable(t._getDisposer()),e}(t[i++])
if(l instanceof e&&l._isDisposable()){try{l=r(l._getDisposer().tryDispose(n),t.promise)}catch(t){return a(t)}if(l instanceof e)return l._then(o,a,null,null,null)}o()}(),c}function l(t,e,n){this._data=t,this._promise=e,this._context=n}function u(t,e,n){this.constructor$(t,e,n)}function h(t){return l.isDisposer(t)?(this.resources[this.index]._setDisposable(t),t.promise()):t}function f(t){this.length=t,this.promise=null,this[t-1]=null}var p=t("./util"),_=t("./errors").TypeError,d=t("./util").inherits,v=p.errorObj,y=p.tryCatch
l.prototype.data=function(){return this._data},l.prototype.promise=function(){return this._promise},l.prototype.resource=function(){return this.promise().isFulfilled()?this.promise().value():null},l.prototype.tryDispose=function(t){var e=this.resource(),n=this._context
void 0!==n&&n._pushContext()
var r=null!==e?this.doDispose(e,t):null
return void 0!==n&&n._popContext(),this._promise._unsetDisposable(),this._data=null,r},l.isDisposer=function(t){return null!=t&&"function"==typeof t.resource&&"function"==typeof t.tryDispose},d(u,l),u.prototype.doDispose=function(t,e){return this.data().call(t,t,e)},f.prototype._resultCancelled=function(){for(var t=this.length,n=0;t>n;++n){var r=this[n]
r instanceof e&&r.cancel()}},e.using=function(){var t=arguments.length
if(2>t)return n("you must pass at least 2 arguments to Promise.using")
var i=arguments[t-1]
if("function"!=typeof i)return n("expecting a function but got "+p.classString(i))
var o,a=!0
2===t&&Array.isArray(arguments[0])?(t=(o=arguments[0]).length,a=!1):(o=arguments,t--)
for(var u=new f(t),_=0;t>_;++_){var d=o[_]
if(l.isDisposer(d)){var m=d;(d=d.promise())._setDisposable(m)}else{var g=r(d)
g instanceof e&&(d=g._then(h,null,null,{resources:u,index:_},void 0))}u[_]=d}var b=new Array(u.length)
for(_=0;_<b.length;++_)b[_]=e.resolve(u[_]).reflect()
var w=e.all(b).then((function(t){for(var e=0;e<t.length;++e){var n=t[e]
if(n.isRejected())return v.e=n.error(),v
if(!n.isFulfilled())return void w.cancel()
t[e]=n.value()}C._pushContext(),i=y(i)
var r=a?i.apply(void 0,t):i(t),o=C._popContext()
return s.checkForgottenReturns(r,o,"Promise.using",C),r})),C=w.lastly((function(){var t=new e.PromiseInspection(w)
return c(u,t)}))
return u.promise=C,C._setOnCancel(u),C},e.prototype._setDisposable=function(t){this._bitField=131072|this._bitField,this._disposer=t},e.prototype._isDisposable=function(){return(131072&this._bitField)>0},e.prototype._getDisposer=function(){return this._disposer},e.prototype._unsetDisposable=function(){this._bitField=-131073&this._bitField,this._disposer=void 0},e.prototype.disposer=function(t){if("function"==typeof t)return new u(t,this,i())
throw new _}}},{"./errors":12,"./util":36}],36:[function(e,n,r){"use strict"
function i(){try{var t=u
return u=null,t.apply(this,arguments)}catch(t){return p.e=t,p}}function o(t){return null==t||!0===t||!1===t||"string"==typeof t||"number"==typeof t}function s(t,e,n){if(o(t))return t
var r={value:n,configurable:!0,enumerable:!1,writable:!0}
return h.defineProperty(t,e,r),t}function a(t){try{return t+""}catch(t){return"[no string representation]"}}function c(t){return t instanceof Error&&h.propertyIsWritable(t,"stack")}function l(t){return{}.toString.call(t)}var u,h=e("./es5"),f="undefined"==typeof navigator,p={e:{}},_=function(){var t=[Array.prototype,Object.prototype,Function.prototype],e=function(e){for(var n=0;n<t.length;++n)if(t[n]===e)return!0
return!1}
if(h.isES5){var n=Object.getOwnPropertyNames
return function(t){for(var r=[],i=Object.create(null);null!=t&&!e(t);){var o
try{o=n(t)}catch(t){return r}for(var s=0;s<o.length;++s){var a=o[s]
if(!i[a]){i[a]=!0
var c=Object.getOwnPropertyDescriptor(t,a)
null!=c&&null==c.get&&null==c.set&&r.push(a)}}t=h.getPrototypeOf(t)}return r}}var r={}.hasOwnProperty
return function(n){if(e(n))return[]
var i=[]
t:for(var o in n)if(r.call(n,o))i.push(o)
else{for(var s=0;s<t.length;++s)if(r.call(t[s],o))continue t
i.push(o)}return i}}(),d=/this\s*\.\s*\S+\s*=/,v=/^[a-z$_][a-z$_0-9]*$/i,y="stack"in new Error?function(t){return c(t)?t:new Error(a(t))}:function(t){if(c(t))return t
try{throw new Error(a(t))}catch(t){return t}},m=function(t){return h.isArray(t)?t:null}
if("undefined"!=typeof Symbol&&Symbol.iterator){var g="function"==typeof Array.from?function(t){return Array.from(t)}:function(t){for(var e,n=[],r=t[Symbol.iterator]();!(e=r.next()).done;)n.push(e.value)
return n}
m=function(t){return h.isArray(t)?t:null!=t&&"function"==typeof t[Symbol.iterator]?g(t):null}}var b=void 0!==t&&"[object process]"===l(t).toLowerCase(),w={isClass:function(t){try{if("function"==typeof t){var e=h.names(t.prototype),n=h.isES5&&e.length>1,r=e.length>0&&!(1===e.length&&"constructor"===e[0]),i=d.test(t+"")&&h.names(t).length>0
if(n||r||i)return!0}return!1}catch(t){return!1}},isIdentifier:function(t){return v.test(t)},inheritedDataKeys:_,getDataPropertyOrDefault:function(t,e,n){if(!h.isES5)return{}.hasOwnProperty.call(t,e)?t[e]:void 0
var r=Object.getOwnPropertyDescriptor(t,e)
return null!=r?null==r.get&&null==r.set?r.value:n:void 0},thrower:function(t){throw t},isArray:h.isArray,asArray:m,notEnumerableProp:s,isPrimitive:o,isObject:function(t){return"function"==typeof t||"object"==typeof t&&null!==t},canEvaluate:f,errorObj:p,tryCatch:function(t){return u=t,i},inherits:function(t,e){function n(){for(var n in this.constructor=t,this.constructor$=e,e.prototype)r.call(e.prototype,n)&&"$"!==n.charAt(n.length-1)&&(this[n+"$"]=e.prototype[n])}var r={}.hasOwnProperty
return n.prototype=e.prototype,t.prototype=new n,t.prototype},withAppended:function(t,e){var n,r=t.length,i=new Array(r+1)
for(n=0;r>n;++n)i[n]=t[n]
return i[n]=e,i},maybeWrapAsError:function(t){return o(t)?new Error(a(t)):t},toFastProperties:function(t){function e(){}e.prototype=t
for(var n=8;n--;)new e
return t},filledRange:function(t,e,n){for(var r=new Array(t),i=0;t>i;++i)r[i]=e+i+n
return r},toString:a,canAttachTrace:c,ensureErrorObject:y,originatesFromRejection:function(t){return null!=t&&(t instanceof Error.__BluebirdErrorTypes__.OperationalError||!0===t.isOperational)},markAsOriginatingFromRejection:function(t){try{s(t,"isOperational",!0)}catch(t){}},classString:l,copyDescriptors:function(t,e,n){for(var r=h.names(t),i=0;i<r.length;++i){var o=r[i]
if(n(o))try{h.defineProperty(e,o,h.getDescriptor(t,o))}catch(t){}}},hasDevTools:"undefined"!=typeof chrome&&chrome&&"function"==typeof chrome.loadTimes,isNode:b,env:function(e,n){return b?t.env[e]:n}}
w.isRecentNode=w.isNode&&function(){var e=t.versions.node.split(".").map(Number)
return 0===e[0]&&e[1]>10||e[0]>0}(),w.isNode&&w.toFastProperties(t)
try{throw new Error}catch(t){w.lastLineError=t}n.exports=w},{"./es5":13}]},{},[4])(4)})),"undefined"!=typeof window&&null!==window?window.P=window.Promise:"undefined"!=typeof self&&null!==self&&(self.P=self.Promise)}).call(this,t("_process"),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{_process:3}],3:[function(t,e,n){function r(){u=!1,a.length?l=a.concat(l):h=-1,l.length&&i()}function i(){if(!u){var t=setTimeout(r)
u=!0
for(var e=l.length;e;){for(a=l,l=[];++h<e;)a&&a[h].run()
h=-1,e=l.length}a=null,u=!1,clearTimeout(t)}}function o(t,e){this.fun=t,this.array=e}function s(){}var a,c=e.exports={},l=[],u=!1,h=-1
c.nextTick=function(t){var e=new Array(arguments.length-1)
if(arguments.length>1)for(var n=1;n<arguments.length;n++)e[n-1]=arguments[n]
l.push(new o(t,e)),1!==l.length||u||setTimeout(i,0)},o.prototype.run=function(){this.fun.apply(null,this.array)},c.title="browser",c.browser=!0,c.env={},c.argv=[],c.version="",c.versions={},c.on=s,c.addListener=s,c.once=s,c.off=s,c.removeListener=s,c.removeAllListeners=s,c.emit=s,c.binding=function(t){throw new Error("process.binding is not supported")},c.cwd=function(){return"/"},c.chdir=function(t){throw new Error("process.chdir is not supported")},c.umask=function(){return 0}},{}],4:[function(t,e,n){function r(t,e,n,r){for(var i=t[e++],o=1<<i,s=o+1,a=s+1,c=i+1,l=(1<<c)-1,u=0,h=0,f=0,p=t[e++],_=new Int32Array(4096),d=null;;){for(;16>u&&0!==p;)h|=t[e++]<<u,u+=8,1===p?p=t[e++]:--p
if(c>u)break
var v=h&l
if(h>>=c,u-=c,v!==o){if(v===s)break
for(var y=a>v?v:d,m=0,g=y;g>o;)g=_[g]>>8,++m
var b=g
if(f+m+(y!==v?1:0)>r)return void console.log("Warning, gif stream longer than expected.")
n[f++]=b
var w=f+=m
for(y!==v&&(n[f++]=b),g=y;m--;)g=_[g],n[--w]=255&g,g>>=8
null!==d&&4096>a&&(_[a++]=d<<8|b,a>=l+1&&12>c&&(++c,l=l<<1|1)),d=v}else a=s+1,l=(1<<(c=i+1))-1,d=null}return f!==r&&console.log("Warning, gif stream shorter than expected."),n}try{n.GifWriter=function(t,e,n,r){function i(t){var e=t.length
if(2>e||e>256||e&e-1)throw"Invalid code/color length, must be power of 2 and 2 .. 256."
return e}var o=0,s=void 0===(r=void 0===r?{}:r).loop?null:r.loop,a=void 0===r.palette?null:r.palette
if(0>=e||0>=n||e>65535||n>65535)throw"Width/Height invalid."
t[o++]=71,t[o++]=73,t[o++]=70,t[o++]=56,t[o++]=57,t[o++]=97
var c=0,l=0
if(null!==a){for(var u=i(a);u>>=1;)++c
if(u=1<<c,--c,void 0!==r.background){if((l=r.background)>=u)throw"Background index out of range."
if(0===l)throw"Background index explicitly passed as 0."}}if(t[o++]=255&e,t[o++]=e>>8&255,t[o++]=255&n,t[o++]=n>>8&255,t[o++]=(null!==a?128:0)|c,t[o++]=l,t[o++]=0,null!==a)for(var h=0,f=a.length;f>h;++h){var p=a[h]
t[o++]=p>>16&255,t[o++]=p>>8&255,t[o++]=255&p}if(null!==s){if(0>s||s>65535)throw"Loop count invalid."
t[o++]=33,t[o++]=255,t[o++]=11,t[o++]=78,t[o++]=69,t[o++]=84,t[o++]=83,t[o++]=67,t[o++]=65,t[o++]=80,t[o++]=69,t[o++]=50,t[o++]=46,t[o++]=48,t[o++]=3,t[o++]=1,t[o++]=255&s,t[o++]=s>>8&255,t[o++]=0}var _=!1
this.addFrame=function(e,n,r,s,c,l){if(!0===_&&(--o,_=!1),l=void 0===l?{}:l,0>e||0>n||e>65535||n>65535)throw"x/y invalid."
if(0>=r||0>=s||r>65535||s>65535)throw"Width/Height invalid."
if(c.length<r*s)throw"Not enough pixels for the frame size."
var u=!0,h=l.palette
if(null==h&&(u=!1,h=a),null==h)throw"Must supply either a local or global palette."
for(var f=i(h),p=0;f>>=1;)++p
f=1<<p
var d=void 0===l.delay?0:l.delay,v=void 0===l.disposal?0:l.disposal
if(0>v||v>3)throw"Disposal out of range."
var y=!1,m=0
if(void 0!==l.transparent&&null!==l.transparent&&(y=!0,0>(m=l.transparent)||m>=f))throw"Transparent color index."
if((0!==v||y||0!==d)&&(t[o++]=33,t[o++]=249,t[o++]=4,t[o++]=v<<2|(!0===y?1:0),t[o++]=255&d,t[o++]=d>>8&255,t[o++]=m,t[o++]=0),t[o++]=44,t[o++]=255&e,t[o++]=e>>8&255,t[o++]=255&n,t[o++]=n>>8&255,t[o++]=255&r,t[o++]=r>>8&255,t[o++]=255&s,t[o++]=s>>8&255,t[o++]=!0===u?128|p-1:0,!0===u)for(var g=0,b=h.length;b>g;++g){var w=h[g]
t[o++]=w>>16&255,t[o++]=w>>8&255,t[o++]=255&w}o=function(t,e,n,r){function i(n){for(;f>=n;)t[e++]=255&p,p>>=8,f-=8,e===s+256&&(t[s]=255,s=e++)}function o(t){p|=t<<f,f+=h,i(8)}t[e++]=n
var s=e++,a=1<<n,c=a-1,l=a+1,u=l+1,h=n+1,f=0,p=0,_=r[0]&c,d={}
o(a)
for(var v=1,y=r.length;y>v;++v){var m=r[v]&c,g=_<<8|m,b=d[g]
if(void 0===b){for(p|=_<<f,f+=h;f>=8;)t[e++]=255&p,p>>=8,f-=8,e===s+256&&(t[s]=255,s=e++)
4096===u?(o(a),u=l+1,h=n+1,d={}):(u>=1<<h&&++h,d[g]=u++),_=m}else _=b}return o(_),o(l),i(1),s+1===e?t[s]=0:(t[s]=e-s-1,t[e++]=0),e}(t,o,2>p?2:p,c)},this.end=function(){return!1===_&&(t[o++]=59,_=!0),o}},n.GifReader=function(t){var e=0
if(71!==t[e++]||73!==t[e++]||70!==t[e++]||56!==t[e++]||56!=(t[e++]+1&253)||97!==t[e++])throw"Invalid GIF 87a/89a header."
var n=t[e++]|t[e++]<<8,i=t[e++]|t[e++]<<8,o=t[e++],s=o>>7,a=1<<(7&o)+1
t[e++],t[e++]
var c=null
s&&(c=e,e+=3*a)
var l=!0,u=[],h=0,f=null,p=0,_=null
for(this.width=n,this.height=i;l&&e<t.length;)switch(t[e++]){case 33:switch(t[e++]){case 255:if(11!==t[e]||78==t[e+1]&&69==t[e+2]&&84==t[e+3]&&83==t[e+4]&&67==t[e+5]&&65==t[e+6]&&80==t[e+7]&&69==t[e+8]&&50==t[e+9]&&46==t[e+10]&&48==t[e+11]&&3==t[e+12]&&1==t[e+13]&&0==t[e+16])e+=14,_=t[e++]|t[e++]<<8,e++
else for(e+=12;;){if(0===(k=t[e++]))break
e+=k}break
case 249:if(4!==t[e++]||0!==t[e+4])throw"Invalid graphics extension block."
var d=t[e++]
h=t[e++]|t[e++]<<8,f=t[e++],0==(1&d)&&(f=null),p=d>>2&7,e++
break
case 254:for(;;){if(0===(k=t[e++]))break
e+=k}break
default:throw"Unknown graphic control label: 0x"+t[e-1].toString(16)}break
case 44:var v=t[e++]|t[e++]<<8,y=t[e++]|t[e++]<<8,m=t[e++]|t[e++]<<8,g=t[e++]|t[e++]<<8,b=t[e++],w=b>>6&1,C=c,j=!1
if(b>>7){j=!0
C=e,e+=3*(1<<(7&b)+1)}var F=e
for(e++;;){var k
if(0===(k=t[e++]))break
e+=k}u.push({x:v,y:y,width:m,height:g,has_local_palette:j,palette_offset:C,data_offset:F,data_length:e-F,transparent_index:f,interlaced:!!w,delay:h,disposal:p})
break
case 59:l=!1
break
default:throw"Unknown gif block: 0x"+t[e-1].toString(16)}this.numFrames=function(){return u.length},this.loopCount=function(){return _},this.frameInfo=function(t){if(0>t||t>=u.length)throw"Frame index out of range."
return u[t]},this.decodeAndBlitFrameBGRA=function(e,i){var o=this.frameInfo(e),s=o.width*o.height,a=new Uint8Array(s)
r(t,o.data_offset,a,s)
var c=o.palette_offset,l=o.transparent_index
null===l&&(l=256)
var u=o.width,h=n-u,f=u,p=4*(o.y*n+o.x),_=4*((o.y+o.height)*n+o.x),d=p,v=4*h
!0===o.interlaced&&(v+=4*n*7)
for(var y=8,m=0,g=a.length;g>m;++m){var b=a[m]
if(0===f&&(f=u,(d+=v)>=_&&(v=4*h+4*n*(y-1),d=p+(u+h)*(y<<1),y>>=1)),b===l)d+=4
else{var w=t[c+3*b],C=t[c+3*b+1],j=t[c+3*b+2]
i[d++]=j,i[d++]=C,i[d++]=w,i[d++]=255}--f}},this.decodeAndBlitFrameRGBA=function(e,i){var o=this.frameInfo(e),s=o.width*o.height,a=new Uint8Array(s)
r(t,o.data_offset,a,s)
var c=o.palette_offset,l=o.transparent_index
null===l&&(l=256)
var u=o.width,h=n-u,f=u,p=4*(o.y*n+o.x),_=4*((o.y+o.height)*n+o.x),d=p,v=4*h
!0===o.interlaced&&(v+=4*n*7)
for(var y=8,m=0,g=a.length;g>m;++m){var b=a[m]
if(0===f&&(f=u,(d+=v)>=_&&(v=4*h+4*n*(y-1),d=p+(u+h)*(y<<1),y>>=1)),b===l)d+=4
else{var w=t[c+3*b],C=t[c+3*b+1],j=t[c+3*b+2]
i[d++]=w,i[d++]=C,i[d++]=j,i[d++]=255}--f}}}}catch(t){}},{}]},{},[1])
