let Global = require("./common/Global");
cc.Class({
    extends: cc.Component,

    properties: {
        btnMp3: {
            default: null,
            url: cc.AudioClip
        }
    },

    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, (event) => {
            this.btnClick();
        }, this);
    },

    btnClick(event) {
        cc.audioEngine.playEffect(this.btnMp3);
    },

    click(event) {
        cc.director.loadScene("Change");
    },

    typeClick(event, data) {
        Global._type = +data;
        cc.director.loadScene("Game");
    },
    
    gobackClick() {
        cc.director.loadScene("Change");
    },
    
    xxlGobackClick() {
        cc.director.loadScene("Change");
    },

    changeGameClick(event, data) {
        this.btnClick();
        if (data === "lianliankan") {
            cc.director.loadScene("Began"); 
        } else if (data === "huarongdao") {
            cc.director.loadScene("HuaGame"); 
        } else if (data === "xiaoxiaole") {
            cc.director.loadScene("XXLGame"); 
        }
    }

});
