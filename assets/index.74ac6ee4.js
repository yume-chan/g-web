import{_ as u,a as k,b as m,P as I,E as b}from"./vendor.241a3de2.js";const M=function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function r(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerpolicy&&(i.referrerPolicy=t.referrerpolicy),t.crossorigin==="use-credentials"?i.credentials="include":t.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(t){if(t.ep)return;t.ep=!0;const i=r(t);fetch(t.href,i)}};M();class N{constructor(n){this.hidpp=n}getSensorCount(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(8705),r=yield this.hidpp.request(17,n,0);return new Uint8Array(r)[0]})}getDpiList(n){return u(this,void 0,void 0,function*(){if(yield this.hidpp.getVersion(),this.hidpp.version===1)throw new Error("Not Implemented");{const{index:r}=yield this.hidpp.getFeature(8705),o=yield this.hidpp.request(17,r,1,new Uint8Array([n]).buffer),t=new DataView(o);let i=[],s;for(let a=1;a<=1+14;a+=2){const c=t.getUint16(a);if(c===0)break;if(c>>13==7){s=c&8191;continue}i.push(c)}if(s){const a=[];for(let c=i[0];c<=i[1];c+=s)a.push(c);return a}else return i}})}getDpi(n){return u(this,void 0,void 0,function*(){if(yield this.hidpp.getVersion(),this.hidpp.version===1)throw new Error("Not Implemented");{const{index:r}=yield this.hidpp.getFeature(8705),o=yield this.hidpp.request(17,r,2,new Uint8Array([n]).buffer);return new DataView(o).getUint16(1)}})}setDpi(n,r){return u(this,void 0,void 0,function*(){if(yield this.hidpp.getVersion(),this.hidpp.version===1)throw new Error("Not Implemented");{const{index:o}=yield this.hidpp.getFeature(8705),t=new ArrayBuffer(3);let i=new DataView(t);i.setUint8(0,n),i.setUint16(1,r);const s=yield this.hidpp.request(17,o,3,t);return i=new DataView(s),i.getUint16(1)}})}}var y;(function(e){e[e.Discharging=0]="Discharging",e[e.Charging=1]="Charging",e[e.AlmostFull=2]="AlmostFull",e[e.Charged=3]="Charged",e[e.SlowRecharge=4]="SlowRecharge",e[e.InvalidBattery=5]="InvalidBattery",e[e.TerminalError=6]="TerminalError",e[e.OtherError=7]="OtherError"})(y||(y={}));var R;(function(e){e[e.FastCharging=8]="FastCharging",e[e.SlowCharging=16]="SlowCharging",e[e.LevelCritical=32]="LevelCritical",e[e.Charging=128]="Charging"})(R||(R={}));var U;(function(e){e[e.Critical=1]="Critical",e[e.Low=2]="Low",e[e.Good=4]="Good",e[e.Full=8]="Full"})(U||(U={}));class C{constructor(n){this.hidpp=n}getBattery(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(4096),r=yield this.hidpp.request(17,n,0),o=new Uint8Array(r);return{percentage:o[0],nextPercentage:o[1],status:o[2]}})}getBatteryV1(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(4097),r=yield this.hidpp.request(17,n,0),o=new DataView(r);return{voltage:o.getUint16(0),flags:o.getUint8(2)}})}getBatteryV4(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(4100),r=yield this.hidpp.request(17,n,1),o=new DataView(r);return{percentage:o.getUint8(0),level:o.getUint8(1),status:o.getUint8(2)}})}}class B{constructor(n){this.hidpp=n}getFeatureCount(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(1),r=yield this.hidpp.request(17,n,0);return new Uint8Array(r)[0]})}getFeatures(){return k(this,arguments,function*(){const r=yield m(this.getFeatureCount()),{index:o}=yield m(this.hidpp.getFeature(1));for(let t=0;t<=r;t+=1){const i=yield m(this.hidpp.request(17,o,1,new Uint8Array([t]).buffer)),s=new DataView(i),a=s.getUint16(0),c=s.getUint8(2);yield yield m({id:a,obsolete:(c&1<<7)!=0,hidden:(c&1<<6)!=0,internal:(c&1<<5)!=0})}})}}const F=new TextDecoder;var w;(function(e){e[e.Firmware=0]="Firmware",e[e.Bootloader=1]="Bootloader",e[e.Hardware=2]="Hardware",e[e.TouchPad=3]="TouchPad",e[e.OpticalSensor=4]="OpticalSensor",e[e.SoftDevice=5]="SoftDevice",e[e.RfMcu=6]="RfMcu",e[e.FactoryApplication=7]="FactoryApplication",e[e.RgbCustomEffect=8]="RgbCustomEffect",e[e.MotorDrive=9]="MotorDrive"})(w||(w={}));var E;(function(e){e[e.Bluetooth=1]="Bluetooth",e[e.BluetoothLE=2]="BluetoothLE",e[e.EQuad=4]="EQuad",e[e.USB=8]="USB"})(E||(E={}));class O{constructor(n){this.hidpp=n}getDeviceInfo(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(3),r=yield this.hidpp.request(17,n,0),o=new DataView(r),t=o.getUint8(0),i=o.getUint32(1),s=o.getUint16(5),a=[];for(let f=0;f<16;f+=1)(s&1<<f)!=0&&a.push(1<<f);const c=[o.getUint16(7),o.getUint16(9),o.getUint16(11)],d=o.getUint8(13),h=(o.getUint8(14)&1)==1;return{entityCount:t,unitId:i,transports:a,modelId:c,extendedModelId:d,supportSerialNumber:h}})}getFirmwareInfo(n){return u(this,void 0,void 0,function*(){const{index:r}=yield this.hidpp.getFeature(3),o=yield this.hidpp.request(17,r,1,new Uint8Array([n]).buffer),t=new DataView(o),i=t.getUint8(0)&15;switch(i){case w.Firmware:case w.Bootloader:{const s=F.decode(o.slice(1,4)),a=t.getUint8(4),c=t.getUint8(5),d=t.getUint16(6),l=t.getUint8(8),h=t.getUint16(9);return{type:i,name:s,major:a,minor:c,build:d,active:(l&1)==1,pid:h}}case w.Hardware:return{type:i,name:"",major:t.getUint8(1),minor:0,build:0,active:!1,pid:0};default:return{type:i,name:"",major:0,minor:0,build:0,active:!1,pid:0}}})}getSerialNumber(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(3),r=yield this.hidpp.request(17,n,2);return console.error(r),F.decode(r.slice(0,12))})}}new TextDecoder;class V{constructor(n=!1){this.list=[],this.blocking=n}wait(){if(!this.blocking&&(this.blocking=!0,this.list.length===0))return Promise.resolve();const n=new I;return this.list.push(n),n.promise}notify(){this.list.length!==0?this.list.pop().resolve():this.blocking=!1}dispose(){for(const n of this.list)n.reject(new Error("The Mutex has been disposed"));this.list.length=0}}const W=!0,K={vendorId:1133};var x;(function(e){e[e.Success=0]="Success",e[e.InvalidCommand=1]="InvalidCommand",e[e.InvalidAddress=2]="InvalidAddress",e[e.InvalidValue=3]="InvalidValue",e[e.ConnectFail=4]="ConnectFail",e[e.TooManyDevices=5]="TooManyDevices",e[e.AlreadyExists=6]="AlreadyExists",e[e.Busy=7]="Busy",e[e.UnknownDevice=8]="UnknownDevice",e[e.ResourceError=9]="ResourceError",e[e.RequestUnavailable=10]="RequestUnavailable",e[e.InvalidParamValue=11]="InvalidParamValue",e[e.WrongPinCode=12]="WrongPinCode"})(x||(x={}));const D={[x.Success]:"No error",[x.InvalidCommand]:"Invalid command",[x.InvalidAddress]:"Invalid address",[x.InvalidValue]:"Invalid value",[x.ConnectFail]:"Connection request failed (Receiver)",[x.TooManyDevices]:"Too many devices connected (Receiver)",[x.AlreadyExists]:"Already exists (Receiver)",[x.Busy]:"Busy (Receiver)",[x.UnknownDevice]:"Unknown device (Receiver)",[x.ResourceError]:"Resource error (Receiver)",[x.RequestUnavailable]:"Request not valid in current context",[x.InvalidParamValue]:"Request parameter has unsupported value",[x.WrongPinCode]:"The PIN code entered on the device was wrong"};var v;(function(e){e[e.InvalidArgument=2]="InvalidArgument",e[e.OutOfRange=3]="OutOfRange",e[e.HardwareError=4]="HardwareError",e[e.LogitechInternal=5]="LogitechInternal",e[e.InvalidFeatureIndex=6]="InvalidFeatureIndex",e[e.InvalidFunction=7]="InvalidFunction",e[e.Busy=8]="Busy",e[e.Unsupported=9]="Unsupported"})(v||(v={}));const P={[v.InvalidArgument]:"Invalid Argument",[v.OutOfRange]:"Out of Range",[v.HardwareError]:"Hardware Error",[v.LogitechInternal]:"Internal Error",[v.InvalidFeatureIndex]:"Invalid Feature Index",[v.InvalidFunction]:"Invalid Function",[v.Busy]:"Device Busy",[v.Unsupported]:"Unsupported"};function j(...e){let n=0;for(const t of e)t&&(n+=t.byteLength);const r=new Uint8Array(n);let o=0;for(const t of e)t&&(r.set(new Uint8Array(t),o),o+=t.byteLength);return r.buffer}class ${constructor(n,r,o){if(this.disconnectEvent=new b,this.onDisconnect=this.disconnectEvent.event,this._mutex=new V,this._featureIdToIndex={},this.handleRawInputReport=({reportId:t,data:i})=>{t===16||t===17?this.handleInputReport(i):console.log(`raw input message 0x${t.toString(16)}`,Array.from(new Uint8Array(i.buffer)))},this.handleInputReport=t=>{var i,s;const a=new Uint8Array(t.buffer),c=a[0];{const f=a[1],g=a[2],p=t.buffer.slice(3);console.log(`input message ${c} 0x${f.toString(16).padStart(2,"0")} 0x${g.toString(16).padStart(2,"0")}`,Array.from(new Uint8Array(p)))}if(c!==this.index)return;const d=this._request;if(!d)return;let l=a[1];if(l===143){l=a[2];const f=a[3];if(d.command===l&&d.address===f){const g=a[4];console.error(`error ${l.toString(16)} ${f.toString(16)} ${D[g]}`);const p=new Error((i=D[g])!==null&&i!==void 0?i:"Hidpp 1 Error");p.name="Hidpp1Error",p.code=g,d.resolver.reject(p),this._request=void 0}return}else if(l===255){l=a[2];const f=a[3];if(d.command===l&&d.address===f){const g=a[4];console.error(`error ${l.toString(16)} ${f.toString(16)} ${P[g]}`);const p=new Error((s=P[g])!==null&&s!==void 0?s:"Hidpp 2 Error");p.name="Hidpp2Error",p.code=g,d.resolver.reject(p),this._request=void 0}}const h=a[2];if(d.command===l&&d.address===h){const f=t.buffer.slice(3);console.log(`response ${c} 0x${l.toString(16)} 0x${(this.version===2?h>>4:h).toString(16)}`,Array.from(new Uint8Array(f))),d.resolver.resolve(f),this._request=void 0}},this.device=n,this.index=r,this.receiver=o,this.index===255&&this.device.addEventListener("inputreport",this.handleRawInputReport),this.receiver){this._mutex=this.receiver.hidpp._mutex;const t=this.receiver.onChildDisconnect(i=>{i===this&&(this.disconnectEvent.fire(),t())})}}getVersion(){return u(this,void 0,void 0,function*(){if(this.version)return;if(this.device.opened||(yield this.device.open()),!this.device.collections.some(r=>{var o;return(o=r.outputReports)===null||o===void 0?void 0:o.some(t=>t.reportId===17)}))this.version=1;else{const r=new I,o=0,t=1<<4;this._request={command:o,address:t,resolver:r},yield this.device.sendReport(17,new Uint8Array([this.index,o,t]));try{yield r.promise,this.version=2}catch(i){if(i instanceof Error&&i.name==="Hidpp1Error"&&i.code===x.InvalidCommand)this.version=1;else throw i}}})}getFeature(n){return u(this,void 0,void 0,function*(){if(yield this.getVersion(),this.version===1)throw new Error("Feature not supported in HID++ 1.0");if(this._featureIdToIndex[n])return this._featureIdToIndex[n];const r=new ArrayBuffer(2);new DataView(r).setUint16(0,n);const o=yield this.request(17,0,0,r),t=new Uint8Array(o),i=t[0];if(i===0)throw new Error("Feature not supported");const s=t[2];return this._featureIdToIndex[n]={index:i,version:s},{index:i,version:s}})}request(n,r,o,t){return u(this,void 0,void 0,function*(){if(!this.version)throw new Error("Unknown device version");yield this._mutex.wait();try{this.device.opened||(yield this.device.open()),W&&console.log(`request 0x${r.toString(16)} 0x${o.toString(16)}`,t?Array.from(new Uint8Array(t)):""),this.version===2&&(o=o<<4);const i=new I;return this._request={command:r,address:o,resolver:i},yield this.device.sendReport(n,j(new Uint8Array([this.index,r,o]),t)),yield i.promise}finally{this._mutex.notify()}})}}function q(e){return e.collections.some(n=>n.usagePage===65347||n.usagePage===65280)}function G(){return u(this,void 0,void 0,function*(){const e=yield window.navigator.hid.requestDevice({filters:[K]});if(e.length===0)throw new Error("No device selected");const n=e.find(q);if(!n)throw new Error("Device not recognized");return n})}class z{constructor(n){this.children=[],this.childConnectEvent=new b,this.onChildConnect=this.childConnectEvent.event,this.childDisconnectEvent=new b,this.onChildDisconnect=this.childDisconnectEvent.event,this.handleInputReport=({reportId:r,data:o})=>{var t;if(r===16||r===17){const i=new Uint8Array(o.buffer),s=i[0];if(s!==255){if(i[1]===65){(i[3]&1<<6)==0?this.children[s]||this.childConnectEvent.fire(this.getChild(s)):this.children[s]&&(this.childDisconnectEvent.fire(this.getChild(s)),delete this.children[s]);return}(t=this.children[s])===null||t===void 0||t.handleInputReport(o)}else{const a=i[1],c=i[2],d=o.buffer.slice(3);console.log(`input message ${s} 0x${a.toString(16).padStart(2,"0")} 0x${c.toString(16).padStart(2,"0")}`,Array.from(new Uint8Array(d)))}}else console.log(`raw input message 0x${r.toString(16)}`,Array.from(new Uint8Array(o.buffer)))},this.hidpp=n,this.hidpp.device.addEventListener("inputreport",this.handleInputReport)}getChildCount(){return u(this,void 0,void 0,function*(){if(yield this.hidpp.getVersion(),this.hidpp.version!==1)throw new Error("Unsupported version");const n=yield this.hidpp.request(16,129,2);return new Uint8Array(n)[1]})}detectChildren(){return u(this,void 0,void 0,function*(){yield this.hidpp.request(16,128,0,new Uint8Array([0,1,0]).buffer),yield this.hidpp.request(16,128,2,new Uint8Array([2]).buffer)})}getChild(n){return this.children[n]||(this.children[n]=new $(this.hidpp.device,n,this)),this.children[n]}}class J{constructor(n){this.hidpp=n}getReportRateList(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(32864),r=yield this.hidpp.request(17,n,0),t=new Uint8Array(r)[0],i=[];for(let s=0;s<8;s+=1)t&1<<s&&i.push(s+1);return i})}getReportRate(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(32864),r=yield this.hidpp.request(17,n,1);return new Uint8Array(r)[0]})}setReportRate(n){return u(this,void 0,void 0,function*(){const{index:r}=yield this.hidpp.getFeature(32864);yield this.hidpp.request(17,r,2,new Uint8Array([n]))})}}const Q=new TextDecoder;var A;(function(e){e[e.Keyboard=0]="Keyboard",e[e.RemoteControl=1]="RemoteControl",e[e.Numpad=2]="Numpad",e[e.Mouse=3]="Mouse",e[e.TrackPad=4]="TrackPad",e[e.Trackball=5]="Trackball",e[e.Presenter=6]="Presenter",e[e.Receiver=7]="Receiver",e[e.Headset=8]="Headset",e[e.Webcam=9]="Webcam",e[e.SteeringWheel=10]="SteeringWheel",e[e.Joystick=11]="Joystick",e[e.Gamepad=12]="Gamepad",e[e.Dock=13]="Dock",e[e.Speaker=14]="Speaker",e[e.Microphone=15]="Microphone"})(A||(A={}));class X{constructor(n){this.hidpp=n}getNameLength(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(5),r=yield this.hidpp.request(17,n,0);return new Uint8Array(r)[0]})}getName(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(5),r=yield this.getNameLength();let o=new Uint8Array(r);for(let t=0;t<r;t+=16){const i=yield this.hidpp.request(17,n,1,new Uint8Array([t]).buffer);o.set(new Uint8Array(i,0,Math.min(r-t,16)),t)}return Q.decode(o)})}getType(){return u(this,void 0,void 0,function*(){const{index:n}=yield this.hidpp.getFeature(5),r=yield this.hidpp.request(17,n,2);return new Uint8Array(r)[0]})}}const Y=document.getElementById("root"),S=[];async function L(e){var r,o;if(await e.getVersion(),console.log(e),e.version===1){const t=new z(e);console.log(t),t.onChildConnect(s=>L(s)),await t.detectChildren();const i=await t.getChildCount();console.log("childrenCount",i);return}const n=document.createElement("div");Y.appendChild(n),e.onDisconnect(()=>{n.remove()});try{const t=new X(e);let i=document.createElement("div");i.textContent=`${e.index} - ${await t.getName()}`,n.appendChild(i),i=document.createElement("div"),i.textContent=`Type: ${A[await t.getType()]}`,n.appendChild(i)}catch(t){console.log(t)}try{const t=new B(e),i=document.createElement("div");i.textContent="Features: ";let s=0;for await(const a of t.getFeatures()){const c=`0x${a.id.toString(16).padStart(4,"0")}`,d=document.createElement("div"),l={"0x0000":"Root","0x0001":"Feature Set","0x0002":"Feature Info","0x0003":"Firmware Info","0x0004":"Device Unit ID","0x0005":"Device Name","0x0006":"Device Groups","0x0007":"Device Friendly Name","0x0008":"Keep Alive","0x0020":"Config Change","0x0021":"Crypto ID","0x0040":"Target Software","0x0080":"Wireless Signal Strength","0x00c0":"DFU Control v0","0x00c1":"DFU Control v1","0x00c2":"DFU Control v2","0x00d0":"DFU","0x1000":"Battery v0","0x1001":"Battery v1","0x1004":"Battery v4","0x1010":"Charging Control","0x1300":"LED Control","0x1800":"Generic Test","0x1802":"Device Reset","0x1805":"OOB State","0x1806":"Configurable Device Properties","0x1014":"Change Host","0x1015":"Hosts Info","0x1981":"Keyboard Backlight v1","0x1982":"Keyboard Backlight v2","0x1983":"Keyboard Backlight v3","0x1a00":"Presenter Control","0x1b00":"Reprogrammable Control v0","0x1b01":"Reprogrammable Control v1","0x1b02":"Reprogrammable Control v2","0x1b03":"Reprogrammable Control v3","0x1b04":"Reprogrammable Control v4","0x1bc0":"Report HID Usages","0x1c00":"Persistent Remappable Action","0x1d4b":"Wireless Status","0x1df0":"Remaining Pairing","0x1e00":"Enable Hidden Features","0x1f1f":"Firmware Properties","0x1f20":"ADC Measurement","0x2001":"Button Swap","0x2005":"Button Swap Cancel","0x2006":"Pointer Axis Orientation","0x2100":"Vertical Scrolling","0x2110":"Smart Shift v0","0x2111":"Smart Shift v1","0x2120":"Hi-Res Wheel v0","0x2121":"Hi-Res Wheel v1","0x2130":"Ratchet Wheel","0x2150":"Thumb Wheel","0x2200":"Mouse Pointer","0x2201":"Adjustable DPI","0x2205":"Pointer Motion Scaling","0x2230":"Angle Snapping","0x2240":"Surface Tuning","0x2250":"XY Stats","0x2251":"Wheel Stats","0x2400":"Hybrid Tracking","0x40a0":"Fn Inversion v0","0x40a2":"Fn Inversion v2","0x40a3":"Fn Inversion v3","0x4100":"Encryption","0x4220":"Lock Key State","0x4301":"Solar Dashboard","0x4520":"Keyboard Layout","0x4521":"Disable Keys","0x4522":"Disable Keys By Usage","0x4530":"Dual Platform","0x4531":"Multi Platform","0x4540":"Keyboard Layout 2","0x4600":"Crown","0x6010":"TouchPad Firmware Items","0x6011":"TouchPad Software Items","0x6012":"TouchPad Windows 8 Firmware Items","0x6020":"Tap Enabled v0","0x6021":"Tap Enabled v1","0x6030":"Cursor Ballistic","0x6040":"TouchPad Resolution","0x6100":"TouchPad Raw XY","0x6110":"Touch Mouse Raw Points","0x6500":"TouchPad Gestures v0","0x6501":"TouchPad Gestures v1","0x8040":"Brightness Control","0x8060":"Adjustable Report Rate","0x8070":"Color LED Effects","0x8071":"RGB Effects","0x8080":"Per Key Lighting v0","0x8081":"Per Key Lighting v1","0x8090":"Mode Status","0x8100":"On-board Profiles","0x8110":"Mouse Button Spy","0x8111":"Latency Monitoring","0x8120":"Gaming Attachments","0x8123":"Force Feedback","0x8300":"Side Tone","0x8310":"Equalizer","0x8320":"Headset Out"},h=[];a.obsolete&&h.push("obsolete"),a.hidden&&h.push("hidden"),a.internal&&h.push("internal"),d.textContent=`Feature 0x${s.toString(16)}: ${c}${l[c]?` ${l[c]}`:""}${h.length?` (${h.join(", ")})`:""}`,n.appendChild(d),s+=1}}catch(t){console.log(t)}try{const t=new O(e),i=await t.getDeviceInfo();console.error(i);for(let c=0;c<i.entityCount;c+=1){const d=await t.getFirmwareInfo(c),l=document.createElement("div");l.textContent=[`Firmware ${c}:`,(r=w[d.type])!=null?r:"Unknown",d.name,`${d.major.toString(16)}.${d.minor.toString(16)}.${d.build.toString(16)}`,d.active?" (active)":"",d.pid?` pid=${d.pid.toString(16).padStart(2,"0")}`:""].filter(Boolean).join(" "),n.appendChild(l)}let s=i.unitId.toString(16).padStart(8,"0");i.supportSerialNumber&&(s=await t.getSerialNumber());const a=document.createElement("div");a.textContent=`Serial Number: ${s}`,n.appendChild(a)}catch(t){console.error(t)}try{const t=new C(e),{percentage:i,nextPercentage:s,status:a}=await t.getBattery();console.log("battery",i,s,a);const c=document.createElement("div");c.textContent=`Battery: about ${i}%, ${y[a]}`,n.appendChild(c)}catch(t){console.log(t)}try{const t=new C(e),{voltage:i,flags:s}=await t.getBatteryV1();console.log("battery",i,s);const a=document.createElement("div");a.textContent=`Battery: ${i}mV, ${(o=R[s])!=null?o:"Discharging"}`,n.appendChild(a)}catch(t){console.log(t)}try{const t=new C(e),{percentage:i,level:s,status:a}=await t.getBatteryV4();console.log("battery",i,s,a);const c=document.createElement("div");c.textContent=`Battery: ${i?`${i}%`:U[s]}, ${y[a]}`,n.appendChild(c)}catch(t){console.log(t)}try{const t=new N(e),i=await t.getSensorCount();for(let s=0;s<i;s+=1){const a=s,c=await t.getDpiList(a),d=await t.getDpi(a),l=document.createElement("div");l.textContent=`Sensor ${a} DPI: `;const h=document.createElement("select");for(const f of c){const g=document.createElement("option");g.value=f.toString(),g.innerText=f.toString(),h.appendChild(g)}h.value=d.toString(),h.onchange=async()=>{console.log(h.value),await t.setDpi(a,parseInt(h.value,10))},l.appendChild(h),n.appendChild(l)}}catch(t){console.log(t)}try{const t=new J(e),i=await t.getReportRateList(),s=await t.getReportRate(),a=document.createElement("div");a.textContent="Report Rate: ";const c=document.createElement("select");for(const d of i){const l=document.createElement("option");l.value=d.toString(),l.innerText=`${d}ms`,c.appendChild(l)}c.value=s.toString(),c.onchange=async()=>{console.log(c.value),await t.setReportRate(parseInt(c.value,10))},a.appendChild(c),n.appendChild(a)}catch(t){console.log(t)}}async function _(e){S.includes(e)||(S.push(e),console.log(e),await L(new $(e,255)))}(async()=>{const e=await navigator.hid.getDevices();for(const n of e)q(n)&&await _(n)})();document.getElementById("select-button").onclick=async()=>{const e=await G();S.includes(e)||(console.log(e),await _(e))};
