(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/btnClick.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'b2cdcGTZK5G54EVIt5boJDs', 'btnClick', __filename);
// Script/btnClick.js

"use strict";

var Global = require("./common/Global");
cc.Class({
    extends: cc.Component,

    properties: {
        btnMp3: {
            default: null,
            url: cc.AudioClip
        }
    },

    // onLoad () {},

    start: function start() {
        var _this = this;

        this.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            _this.btnClick();
        }, this);
    },
    btnClick: function btnClick(event) {
        cc.audioEngine.playEffect(this.btnMp3);
    },


    click: function click(event) {
        cc.director.loadScene("Began");
    },

    typeClick: function typeClick(event, data) {
        Global._type = +data;
        cc.director.loadScene("Game");
    }

    // update (dt) {},
});

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=btnClick.js.map
        