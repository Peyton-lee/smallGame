"use strict";
cc._RF.push(module, 'b2cdcGTZK5G54EVIt5boJDs', 'btnClick');
// Script/btnClick.js

"use strict";

var Global = require("./common/Global");
cc.Class({
    extends: cc.Component,

    properties: {},

    // onLoad () {},

    start: function start() {},


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