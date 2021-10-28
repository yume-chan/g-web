/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */function _(r,t,e,i){function c(s){return s instanceof e?s:new e(function(u){u(s)})}return new(e||(e=Promise))(function(s,u){function f(o){try{h(i.next(o))}catch(a){u(a)}}function p(o){try{h(i.throw(o))}catch(a){u(a)}}function h(o){o.done?s(o.value):c(o.value).then(f,p)}h((i=i.apply(r,t||[])).next())})}function d(r){return this instanceof d?(this.v=r,this):new d(r)}function m(r,t,e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var i=e.apply(r,t||[]),c,s=[];return c={},u("next"),u("throw"),u("return"),c[Symbol.asyncIterator]=function(){return this},c;function u(n){i[n]&&(c[n]=function(l){return new Promise(function(v,y){s.push([n,l,v,y])>1||f(n,l)})})}function f(n,l){try{p(i[n](l))}catch(v){a(s[0][3],v)}}function p(n){n.value instanceof d?Promise.resolve(n.value.v).then(h,o):a(s[0][2],n)}function h(n){f("next",n)}function o(n){f("throw",n)}function a(n,l){n(l),s.shift(),s.length&&f(s[0][0],s[0][1])}}var b=function(){function r(){var t=this;this._state="running",this.resolve=function(e){t._resolve(e),t._state="resolved"},this.reject=function(e){t._reject(e),t._state="rejected"},this._promise=new Promise(function(e,i){t._resolve=e,t._reject=i})}return Object.defineProperty(r.prototype,"promise",{get:function(){return this._promise},enumerable:!1,configurable:!0}),Object.defineProperty(r.prototype,"state",{get:function(){return this._state},enumerable:!1,configurable:!0}),r}();class w{constructor(){this.listeners=[],this.event=this.event.bind(this)}addEventListener(t){this.listeners.push(t);const e=()=>{const i=this.listeners.indexOf(t);i!==-1&&this.listeners.splice(i,1)};return e.dispose=e,e}event(t,e,...i){const c={listener:t,thisArg:e,args:i};return this.addEventListener(c)}fire(t){for(const e of this.listeners.slice())e.listener.apply(e.thisArg,[t,...e.args])}dispose(){this.listeners.length=0}}export{w as E,b as P,_,m as a,d as b};
