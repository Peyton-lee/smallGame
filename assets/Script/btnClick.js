let Global = require("./common/Global");
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // onLoad () {},

    start () {
        
    },

    click: function (event) {
        cc.director.loadScene("Began");
    },

    typeClick: function (event, data) {
        Global._type = +data;
        cc.director.loadScene("Game");
    },

    // update (dt) {},
});
