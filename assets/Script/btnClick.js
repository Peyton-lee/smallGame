let Global = require("./common/Global");
cc.Class({
    extends: cc.Component,

    properties: {
        btnMp3: {
            default: null,
            url: cc.AudioClip
        }
    },

    // onLoad () {},

    start () {
        this.node.on(cc.Node.EventType.TOUCH_END, (event) => {
            this.btnClick();
        }, this);
    },

    btnClick(event) {
        cc.audioEngine.playEffect(this.btnMp3);
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
