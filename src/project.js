require=function t(i,o,r){function n(c,s){if(!o[c]){if(!i[c]){var a="function"==typeof require&&require;if(!s&&a)return a(c,!0);if(e)return e(c,!0);var l=new Error("Cannot find module '"+c+"'");throw l.code="MODULE_NOT_FOUND",l}var h=o[c]={exports:{}};i[c][0].call(h.exports,function(t){var o=i[c][1][t];return n(o||t)},h,h.exports,t,i,o,r)}return o[c].exports}for(var e="function"==typeof require&&require,c=0;c<r.length;c++)n(r[c]);return n}({Game2:[function(t,i,o){"use strict";cc._RF.push(i,"78da29ONVVGYpDXBTrwqJtB","Game2");var r=t("./common/Global");cc.Class({extends:cc.Component,properties:{box:{default:null,type:cc.Prefab},picArrs:{default:[],type:[cc.SpriteFrame]}},ctor:function(){this.arr=[],this.selectId=null,this.clickId=null,this.pass=!1,this._lineNodes=[],this.row=r._type,this.col=r._type},onLoad:function(){var t=this,i=this.picArrs.slice(0,this.row),o=(this.row,this.col,cc.director.getWinSize().width),r=this.getSortArrs(i,this.row,this.col);if(0!==r.length){this._boxWidth=500/this.col;for(var n=0;n<this.row+2;n++)for(var e=0;e<this.col+2;e++){var c={point:[e,n],box:null,val:null,pos:null,index:e+n*(this.col+2)},s=-o/2+(o-this._boxWidth*this.col)/2+(e-.5)*this._boxWidth,a=250-(n-1)*this._boxWidth;if(c.pos=cc.p(s,a),0!==n&&0!==e&&n!==this.col+1&&e!==this.row+1){var l=e-1+(n-1)*this.col;c.val=r[l].type;var h=cc.instantiate(this.box);this.node.addChild(h);var u=new cc.Node;u.addComponent(cc.Sprite).spriteFrame=r[l].texture,h.addChild(u),h.setScale(this._boxWidth/h.width),h.setPosition(c.pos),h.setTag(c.index),c.box=h,h.on(cc.Node.EventType.TOUCH_END,function(i){var o=i.currentTarget.getTag();if(t.arr[o].box)if(t.selectId){if(o===t.selectId)return;t.clickId=o;var r=t.checkAction(t.arr[t.selectId],t.arr[o],!0);if(0==r.length)t.selectId=null;else{for(var n=0;n<r.length-1;n++)t.drawLine(r[n],r[n+1]);t.scheduleOnce(function(){t._lineNodes.forEach(function(t){t.clear()}),t.clickPass()},.3)}}else t.selectId=o,t.pass=!1,cc.log("selectId = ",t.arr[o].val)})}this.arr.push(c)}this.checkEnable()}},checkAction:function(t,i,o){var r=this;if(!this.checkDoublePass(t,i)&&o)return[];if((t.point[0]===i.point[0]||t.point[1]===i.point[1])&&this.checkDoublePoint(t,i))return[t,i];var n=this.getPointAround(t),e=this.getPointAround(i),c=null,s=!1;if(n.forEach(function(t){s||e.forEach(function(i){if(t.index===i.index)return c=t,void(s=!0)})}),c)return[t,c,i];var a=[];return n.forEach(function(o){r.pass||e.forEach(function(n){o.point[0]!==n.point[0]&&o.point[1]!==n.point[1]||!r.checkDoublePoint(o,n)||(r.pass=!0,a=[t,o,n,i])})}),a},checkDoublePass:function(t,i){return t.val===i.val},checkDoublePoint:function(t,i){if(t.point[0]===i.point[0])if(t.point[1]>i.point[1])for(var o=i.point[1]+1;o<t.point[1];o++){var r=t.point[0]+o*(this.row+2);if(this.arr[r].val)return!1}else for(var n=i.point[1]-1;n>t.point[1];n--){var e=t.point[0]+n*(this.row+2);if(this.arr[e].val)return!1}else if(t.point[0]>i.point[0])for(var c=i.point[0]+1;c<t.point[0];c++){var s=c+i.point[1]*(this.row+2);if(this.arr[s].val)return!1}else for(var a=i.point[0]-1;a>t.point[0];a--){var l=a+i.point[1]*(this.row+2);if(this.arr[l].val)return!1}return!0},getPointAround:function(t){for(var i=[],o=t.point[1]-1;o>=0;o--){var r=t.point[0]+o*(this.col+2);if(this.arr[r].val)break;i.push(this.arr[r])}for(var n=t.point[0]+1;n<this.col+2;n++){var e=n+t.point[1]*(this.col+2);if(this.arr[e].val)break;i.push(this.arr[e])}for(var c=t.point[1]+1;c<this.row+2;c++){var s=t.point[0]+c*(this.col+2);if(this.arr[s].val)break;i.push(this.arr[s])}for(var a=t.point[0]-1;a>=0;a--){var l=a+t.point[1]*(this.col+2);if(this.arr[l].val)break;i.push(this.arr[l])}return i},clickPass:function(){[this.arr[this.selectId],this.arr[this.clickId]].map(function(t){t.box.destroy(),t.box=null,t.val=null}),this.selectId=null,this.checkGameSuccess()},checkGameSuccess:function(){this.arr.every(function(t){return!t.box})?cc.director.loadScene("Pass"):this.checkEnable()},drawLine:function(t,i){var o=cc.director.getWinSize(),r=new cc.DrawNode;cc.Canvas.instance.node.parent._sgNode.addChild(r),r.drawSegment(cc.p(t.pos.x+o.width/2,t.pos.y+o.height/2),cc.p(i.pos.x+o.width/2,i.pos.y+o.height/2),5,cc.color(265,1,0,255)),this._lineNodes.push(r)},getSortArrs:function(t,i,o){var r=[],n=i*o/t.length;if(n.toString().indexOf(".")>=0||n%2!=0)return cc.log("随机图片的个数不平均"),r;for(var e=0;e<t.length;e++)for(var c=0;c<n;c++)r.push({type:e+1,texture:t[e]});return r.sort(function(t,i){return cc.random0To1()>.5?1:-1}),r},checkEnable:function(){0==this.findTip().length&&(cc.log("无解!!! 替换位置"),this.updateLayout())},findTip:function(){var t=this,i=[];this.arr.forEach(function(t){t.box&&(i[t.val]?i[t.val].push(t):i[t.val]=[t])});var o=!1,r=[];return i.forEach(function(i){if(!o)for(var n=0;n<i.length&&!o;n++)for(var e=n+1;e<i.length&&!o;e++){var c=t.checkAction(i[n],i[e],!0);c.length>0&&(o=!0,r=c)}}),r},updateLayout:function(){var t=this,i=!1;this.arr.forEach(function(o){if(!i&&o.box){var r=void 0,n=void 0;t.arr.forEach(function(i){if(i.box){r||o.val!==i.val||o.index===i.index||(r=i);var e=t.checkAction(o,i,!1);!n&&o.val!==i.val&&e.length>0&&(n=i)}}),r&&n&&(t.updateDoublePoint(r,n),i=!0)}})},updateDoublePoint:function(t,i){var o={val:t.val,box:t.box};t.val=i.val,t.box=i.box,i.val=o.val,i.box=o.box,[t,i].map(function(t){t.box.setTag(t.index),t.box.runAction(cc.moveTo(.3,t.pos))})}}),cc._RF.pop()},{"./common/Global":"Global"}],Game:[function(t,i,o){"use strict";cc._RF.push(i,"280c3rsZJJKnZ9RqbALVwtK","Game"),cc.Class({extends:cc.Component,properties:{box:{default:null,type:cc.Prefab},arr:{default:[]},row:4,col:4,selectId:null,clickId:null,pass:!1,passInfos:[],_lineNodes:[]},onLoad:function(){var t=[1,2,3,4],i=(this.row,this.col,cc.director.getWinSize().width),o=this.node.getChildByName("Background"),r=this.getSortArrs(t,this.row,this.col);if(0!==r.length){this._boxWidth=500/this.col;for(var n=this,e=0;e<this.row+2;e++)for(var c=0;c<this.col+2;c++){var s={point:[c,e],box:null,val:null,pos:null,index:c+e*(this.row+2)},a=(i-500)/2+(c-1)*this._boxWidth,l=750-(e-1)*this._boxWidth;if(s.pos=cc.p(a,l),0!==e&&0!==c&&e!==this.col+1&&c!==this.row+1){var h=c-1+(e-1)*this.row;s.val=r[h];var u=cc.instantiate(this.box);o.addChild(u),u.anchorX=0,u.anchorY=0;var p=u.getChildByName("label");p.setPosition(cc.p(u.width/2,u.height/2)),p.getComponent(cc.Label).string=s.val,u.setScale(this._boxWidth/u.width),u.setPosition(s.pos),u.setTag(s.index),s.box=u,u.on(cc.Node.EventType.TOUCH_END,function(t){t.currentTarget.getChildByName("label").getComponent(cc.Label).string;var i=t.currentTarget.getTag();if(n.arr[i].box)if(n.selectId){if(i===n.selectId)return;n.clickId=i,n.checkAction(n.arr[n.selectId],n.arr[i],0,[])}else n.selectId=i,n.pass=!1,cc.log("selectId = ",n.arr[i].val)})}this.arr.push(s)}}},checkAction:function(t,i,o,r){var n=r.slice();if(t.point[0]!==i.point[0]&&t.point[1]!==i.point[1]||!this.checkDoublePoint(t,i)){if(2!==o){n.push(t);var e=[],c=this;this.arr.forEach(function(i,o){(i.point[0]===t.point[0]&&o!==t.index&&!i.val||i.point[1]===t.point[1]&&o!==t.index&&!i.val)&&e.push(i)}),e=e.filter(function(i){if(c.checkDoublePoint(i,t))return i}),o++,e.forEach(function(t){c.checkAction(t,i,o,n)}),1===o&&(cc.log("所有情况跑完"),this.findShortPath())}}else this.checkDoublePass(this.arr[this.selectId],this.arr[this.clickId])?(n.push(t),n.push(i),this.addPassInfo(n),0==o&&this.findShortPath()):0===o&&(this.selectId=null)},checkDoublePass:function(t,i){return t.val===i.val},checkDoublePoint:function(t,i){if(t.point[0]===i.point[0])if(t.point[1]>i.point[1])for(o=i.point[1]+1;o<t.point[1];o++){r=t.point[0]+o*(this.row+2);if(this.arr[r].val)return!1}else for(o=i.point[1]-1;o>t.point[1];o--){r=t.point[0]+o*(this.row+2);if(this.arr[r].val)return!1}else if(t.point[0]>i.point[0])for(o=i.point[0]+1;o<t.point[0];o++){r=o+i.point[1]*(this.row+2);if(this.arr[r].val)return!1}else for(var o=i.point[0]-1;o>t.point[0];o--){var r=o+i.point[1]*(this.row+2);if(this.arr[r].val)return!1}return!0},addPassInfo:function(t){this.passInfos.push(t)},findShortPath:function(){if(this.passInfos.length<=0)return cc.log("没有符合条件!!!"),void(this.selectId=null);var t=null,i=0;this.passInfos.forEach(function(o){for(var r=0,n=1;n<o.length;n++){var e=o[n].point,c=o[n-1].point;e[0]===c[0]?r+=Math.abs(e[1]-c[1]):r+=Math.abs(e[0]-c[0])}(r<i||!i)&&(t=o,i=r)});for(var o=0;o<t.length-1;o++)this.drawLine(t[o],t[o+1]);this.scheduleOnce(function(){this._lineNodes.forEach(function(t){t.clear()}),this.gamePass()},.5)},gamePass:function(){var t=this.arr[this.selectId],i=this.arr[this.clickId];t.box.destroy(),t.box=null,t.val=null,i.box.destroy(),i.box=null,i.val=null,this.selectId=null,this.pass=!0,this.passInfos=[],this.checkGameSuccess()},checkGameSuccess:function(){this.arr.every(function(t){return!t.box})&&(cc.log("通关"),cc.director.loadScene("Pass"))},drawLine:function(t,i){var o=new cc.DrawNode;cc.Canvas.instance.node.parent._sgNode.addChild(o,100),o.drawSegment(cc.p(t.pos.x+this._boxWidth/2+5,t.pos.y+this._boxWidth/2),cc.p(i.pos.x+this._boxWidth/2+5,i.pos.y+this._boxWidth/2),5,cc.color(265,1,0,255)),this._lineNodes.push(o)},getSortArrs:function(t,i,o){var r=[],n=i*o/t.length;if(n.toString().indexOf(".")>=0||n%2!=0)return cc.log("随机图片的个数不平均"),r;for(var e=0;e<t.length;e++)for(var c=0;c<n;c++)r.push(t[e]);return r.sort(function(t,i){return cc.random0To1()>.5?1:-1}),r},update:function(t){}}),cc._RF.pop()},{}],Global:[function(t,i,o){"use strict";cc._RF.push(i,"a0d74w6/RlD6pPIwyfKLFp/","Global"),i.exports={_type:4},cc._RF.pop()},{}],btnClick:[function(t,i,o){"use strict";cc._RF.push(i,"b2cdcGTZK5G54EVIt5boJDs","btnClick");var r=t("./common/Global");cc.Class({extends:cc.Component,properties:{},start:function(){},click:function(t){cc.director.loadScene("Began")},typeClick:function(t,i){r._type=+i,cc.director.loadScene("Game")}}),cc._RF.pop()},{"./common/Global":"Global"}]},{},["Game","Game2","btnClick","Global"]);