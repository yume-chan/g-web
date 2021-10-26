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
***************************************************************************** */function p(i,t,e,r){function f(o){return o instanceof e?o:new e(function(s){s(o)})}return new(e||(e=Promise))(function(o,s){function a(n){try{c(r.next(n))}catch(u){s(u)}}function l(n){try{c(r.throw(n))}catch(u){s(u)}}function c(n){n.done?o(n.value):f(n.value).then(a,l)}c((r=r.apply(i,t||[])).next())})}var _=function(){function i(){var t=this;this._state="running",this.resolve=function(e){t._resolve(e),t._state="resolved"},this.reject=function(e){t._reject(e),t._state="rejected"},this._promise=new Promise(function(e,r){t._resolve=e,t._reject=r})}return Object.defineProperty(i.prototype,"promise",{get:function(){return this._promise},enumerable:!1,configurable:!0}),Object.defineProperty(i.prototype,"state",{get:function(){return this._state},enumerable:!1,configurable:!0}),i}();export{_ as P,p as _};
