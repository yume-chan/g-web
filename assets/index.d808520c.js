import{_ as a,P as g}from"./vendor.9d5ac3d8.js";const A=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerpolicy&&(o.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?o.credentials="include":n.crossorigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}};A();class U{constructor(t){this.hidpp=t}getDpiList(){return a(this,void 0,void 0,function*(){if(yield this.hidpp.getVersion(),this.hidpp.version===1)throw new Error("Not Implemented");{const{index:t}=yield this.hidpp.getFeature(8705),s=yield this.hidpp.request(17,t,1),i=new DataView(s);let n=[],o;for(let r=1;r<=1+14;r+=2){const c=i.getUint16(r);if(c===0)break;if(c>>13==7){o=c&8191;continue}n.push(c)}if(o){const r=[];for(let c=n[0];c<=n[1];c+=o)r.push(c);return r}else return n}})}getDpi(){return a(this,void 0,void 0,function*(){if(yield this.hidpp.getVersion(),this.hidpp.version===1)throw new Error("Not Implemented");{const{index:t}=yield this.hidpp.getFeature(8705),s=yield this.hidpp.request(17,t,2);return new DataView(s).getUint16(1)}})}setDpi(t){return a(this,void 0,void 0,function*(){if(yield this.hidpp.getVersion(),this.hidpp.version===1)throw new Error("Not Implemented");{const{index:s}=yield this.hidpp.getFeature(8705),i=new ArrayBuffer(3);let n=new DataView(i);n.setUint16(1,t);const o=yield this.hidpp.request(17,s,3,i);return n=new DataView(o),n.getUint16(1)}})}}var w;(function(e){e[e.Discharging=0]="Discharging",e[e.Recharging=1]="Recharging",e[e.AlmostFull=2]="AlmostFull",e[e.Charged=3]="Charged",e[e.SlowRecharge=4]="SlowRecharge",e[e.InvalidBattery=5]="InvalidBattery",e[e.TerminalError=6]="TerminalError"})(w||(w={}));class b{constructor(t){this.hidpp=t}getBattery(){return a(this,void 0,void 0,function*(){const{index:t}=yield this.hidpp.getFeature(4096),s=yield this.hidpp.request(17,t,0),i=new Uint8Array(s);return{level:i[0],nextLevel:i[1],status:i[2]}})}}new TextDecoder;class q{constructor(t=!1){this.list=[],this.blocking=t}wait(){if(!this.blocking&&(this.blocking=!0,this.list.length===0))return Promise.resolve();const t=new g;return this.list.push(t),t.promise}notify(){this.list.length!==0?this.list.pop().resolve():this.blocking=!1}dispose(){for(const t of this.list)t.reject(new Error("The Mutex has been disposed"));this.list.length=0}}const L=!0,F={vendorId:1133};var l;(function(e){e[e.Success=0]="Success",e[e.InvalidCommand=1]="InvalidCommand",e[e.InvalidAddress=2]="InvalidAddress",e[e.InvalidValue=3]="InvalidValue",e[e.ConnectFail=4]="ConnectFail",e[e.TooManyDevices=5]="TooManyDevices",e[e.AlreadyExists=6]="AlreadyExists",e[e.Busy=7]="Busy",e[e.UnknownDevice=8]="UnknownDevice",e[e.ResourceError=9]="ResourceError",e[e.RequestUnavailable=10]="RequestUnavailable",e[e.InvalidParamValue=11]="InvalidParamValue",e[e.WrongPinCode=12]="WrongPinCode"})(l||(l={}));const _={[l.Success]:"No error",[l.InvalidCommand]:"Invalid command",[l.InvalidAddress]:"Invalid address",[l.InvalidValue]:"Invalid value",[l.ConnectFail]:"Connection request failed (Receiver)",[l.TooManyDevices]:"Too many devices connected (Receiver)",[l.AlreadyExists]:"Already exists (Receiver)",[l.Busy]:"Busy (Receiver)",[l.UnknownDevice]:"Unknown device (Receiver)",[l.ResourceError]:"Resource error (Receiver)",[l.RequestUnavailable]:"Request not valid in current context",[l.InvalidParamValue]:"Request parameter has unsupported value",[l.WrongPinCode]:"The PIN code entered on the device was wrong"};function P(...e){let t=0;for(const n of e)n&&(t+=n.byteLength);const s=new Uint8Array(t);let i=0;for(const n of e)n&&(s.set(new Uint8Array(n),i),i+=n.byteLength);return s.buffer}class y{constructor(t,s,i){this._mutex=new q,this._featureIdToIndex={},this.handleInputReport=({data:n})=>{const o=new Uint8Array(n.buffer);if(o[0]!==this.index)return;const c=this._request;if(!c)return;let h=o[1];if(h===143){h=o[2];const d=o[3];if(c.command===h&&c.address===d){const f=o[4];console.error("error",h.toString(16),d.toString(16),f);const v=new Error(_[f]);v.name="Hidpp1Error",v.code=f,c.resolver.reject(v),this._request=void 0}return}const u=o[2];if(c.command===h&&c.address===u){const d=n.buffer.slice(3);console.log("response",h.toString(16),(this.version===2?u>>4:u).toString(16),Array.from(new Uint8Array(d))),c.resolver.resolve(d),this._request=void 0}},this.device=t,this.index=s,this.receiver=i,this.index===255&&this.device.addEventListener("inputreport",this.handleInputReport),this.receiver&&(this._mutex=this.receiver._mutex)}getVersion(){return a(this,void 0,void 0,function*(){if(this.version)return;if(this.device.opened||(yield this.device.open()),!this.device.collections.some(s=>{var i;return(i=s.outputReports)===null||i===void 0?void 0:i.some(n=>n.reportId===17)}))this.version=1;else{const s=new g,i=0,n=1<<4;this._request={command:i,address:n,resolver:s},yield this.device.sendReport(17,new Uint8Array([this.index,i,n]));try{yield s.promise,this.version=2}catch(o){if(o instanceof Error&&o.name==="Hidpp1Error"&&o.code===l.InvalidCommand)this.version=1;else throw o}}})}getFeature(t){return a(this,void 0,void 0,function*(){if(yield this.getVersion(),this.version===1)throw new Error("Feature not supported in HID++ 1.0");if(this._featureIdToIndex[t])return this._featureIdToIndex[t];const s=new ArrayBuffer(2);new DataView(s).setUint16(0,t);const i=yield this.request(17,0,0,s),n=new Uint8Array(i),o=n[0];if(o===0)throw new Error("Feature not supported");const r=n[2];return this._featureIdToIndex[t]={index:o,version:r},{index:o,version:r}})}request(t,s,i,n){return a(this,void 0,void 0,function*(){if(!this.version)throw new Error("Unknown device version");yield this._mutex.wait();try{this.device.opened||(yield this.device.open()),L&&console.log("request",s.toString(16),i.toString(16),n?Array.from(new Uint8Array(n)):""),this.version===2&&(i=i<<4);const o=new g;return this._request={command:s,address:i,resolver:o},yield this.device.sendReport(t,P(new Uint8Array([this.index,s,i]),n)),yield o.promise}finally{this._mutex.notify()}})}}function I(e){return e.collections.some(t=>t.usagePage===65347||t.usagePage===65280)}function V(){return a(this,void 0,void 0,function*(){const e=yield window.navigator.hid.requestDevice({filters:[F]});if(e.length===0)throw new Error("No device selected");const t=e.find(I);if(!t)throw new Error("Device not recognized");return t})}class D{constructor(t){this.children=[],this.handleInputReport=({data:s})=>{var i;const o=new Uint8Array(s.buffer)[0];o!==255&&((i=this.children[o])===null||i===void 0||i.handleInputReport({data:s}))},this.hidpp=t,this.hidpp.device.addEventListener("inputreport",this.handleInputReport)}getChildIndices(){return a(this,void 0,void 0,function*(){if(yield this.hidpp.getVersion(),this.hidpp.version!==1)throw new Error("Unsupported version");const t=yield this.hidpp.request(16,129,2),s=new Uint8Array(t)[1],i=[];for(let n=0;n<8;n++)s&1<<n&&i.push(n+1);return i})}getChild(t){return this.children[t]||(this.children[t]=new y(this.hidpp.device,t,this.hidpp)),this.children[t]}}class E{constructor(t){this.hidpp=t}getReportRateList(){return a(this,void 0,void 0,function*(){const{index:t}=yield this.hidpp.getFeature(32864),s=yield this.hidpp.request(17,t,0),n=new Uint8Array(s)[0],o=[];for(let r=0;r<8;r+=1)n&1<<r&&o.push(r+1);return o})}getReportRate(){return a(this,void 0,void 0,function*(){const{index:t}=yield this.hidpp.getFeature(32864),s=yield this.hidpp.request(17,t,1);return new Uint8Array(s)[0]})}setReportRate(t){return a(this,void 0,void 0,function*(){const{index:s}=yield this.hidpp.getFeature(32864);yield this.hidpp.request(17,s,2,new Uint8Array([t]))})}}const N=new TextDecoder;var x;(function(e){e[e.Keyboard=0]="Keyboard",e[e.RemoteControl=1]="RemoteControl",e[e.Numpad=2]="Numpad",e[e.Mouse=3]="Mouse",e[e.TouchPad=4]="TouchPad",e[e.Trackball=5]="Trackball",e[e.Presenter=6]="Presenter",e[e.Remote=7]="Remote",e[e.Receiver=8]="Receiver"})(x||(x={}));class k{constructor(t){this.hidpp=t}getNameLength(){return a(this,void 0,void 0,function*(){const{index:t}=yield this.hidpp.getFeature(5),s=yield this.hidpp.request(17,t,0);return new Uint8Array(s)[0]})}getName(){return a(this,void 0,void 0,function*(){const{index:t}=yield this.hidpp.getFeature(5),s=yield this.getNameLength();let i=new Uint8Array(s);for(let n=0;n<s;n+=16){const o=yield this.hidpp.request(17,t,1,new Uint8Array([n]).buffer);i.set(new Uint8Array(o,0,Math.min(s-n,16)),n)}return N.decode(i)})}getType(){return a(this,void 0,void 0,function*(){const{index:t}=yield this.hidpp.getFeature(5),s=yield this.hidpp.request(17,t,2);return new Uint8Array(s)[0]})}}const p=document.getElementById("settings"),m=[];async function R(e){if(m.includes(e))return;m.push(e),console.log(e);const t=new y(e,255);await t.getVersion(),console.log(t);const s=[];if(t.version===1){const i=new D(t),n=await i.getChildIndices();console.log(n);for(const o of n){const r=i.getChild(o);s.push(r)}}else s.push(t);for(const i of s){console.log(i);const n=document.createElement("div"),o=new k(i);n.textContent=await o.getName(),p.appendChild(n);{const r=document.createElement("div");r.textContent=`Type: ${x[await o.getType()]}`,p.appendChild(r)}try{const r=new b(i),{level:c,nextLevel:h,status:u}=await r.getBattery(),d=document.createElement("div");d.textContent=`Battery: about ${c}%, ${w[u]}`,p.appendChild(d)}catch{console.log(n,"does not support battery")}try{const r=new U(i),c=await r.getDpiList();console.log(c);const h=await r.getDpi();console.log(h);const u=document.createElement("div");u.textContent="DPI: ";const d=document.createElement("select");for(const f of c){const v=document.createElement("option");v.value=f.toString(),v.innerText=f.toString(),d.appendChild(v)}d.value=h.toString(),d.onchange=async()=>{console.log(d.value),await r.setDpi(parseInt(d.value,10))},u.appendChild(d),p.appendChild(u)}catch{}try{const r=new E(i),c=await r.getReportRateList(),h=await r.getReportRate(),u=document.createElement("div");u.textContent="Report Rate: ";const d=document.createElement("select");for(const f of c){const v=document.createElement("option");v.value=f.toString(),v.innerText=`${f}ms`,d.appendChild(v)}d.value=h.toString(),d.onchange=async()=>{console.log(d.value),await r.setReportRate(parseInt(d.value,10))},u.appendChild(d),p.appendChild(u)}catch(r){console.error(r)}}}(async()=>{const e=await navigator.hid.getDevices();for(const t of e)I(t)&&await R(t)})();document.getElementById("select-button").onclick=async()=>{const e=await V();m.includes(e)||(console.log(e),await R(e))};