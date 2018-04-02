(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/Game.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '280c3rsZJJKnZ9RqbALVwtK', 'Game', __filename);
// Script/Game.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        box: {
            default: null,
            type: cc.Prefab
        },

        arr: {
            default: []
        },

        row: 4, // 行
        col: 4, // 列
        selectId: null,
        clickId: null,
        pass: false,
        passInfos: [],
        _lineNodes: []
    },

    // use this for initialization
    onLoad: function onLoad() {
        // 随机图片
        var _randomArr = [1, 2, 3, 4];
        // 获取所有坐标的数组长度
        var length = (this.row + 2) * (this.col + 2);
        // 屏幕宽度
        var winSizeW = cc.director.getWinSize().width;
        var showW = 500;
        var background = this.node.getChildByName("Background");

        // 获取随机数组
        var arrs = this.getSortArrs(_randomArr, this.row, this.col);
        if (arrs.length === 0) return;

        // 计算每个盒子宽度
        this._boxWidth = showW / this.col;
        var self = this;

        // 初始化数据结构
        for (var i = 0; i < this.row + 2; i++) {
            for (var j = 0; j < this.col + 2; j++) {
                var o = {
                    point: [j, i],
                    box: null,
                    val: null,
                    pos: null,
                    index: j + i * (this.row + 2)
                };
                var x = (winSizeW - showW) / 2 + (j - 1) * this._boxWidth;
                var y = 750 - (i - 1) * this._boxWidth;
                o.pos = cc.p(x, y);

                if (i !== 0 && j !== 0 && i !== this.col + 1 && j !== this.row + 1) {
                    var index = j - 1 + (i - 1) * this.row;
                    o.val = arrs[index];
                    var box = cc.instantiate(this.box);
                    background.addChild(box);
                    box.anchorX = 0;
                    box.anchorY = 0;
                    var textLabel = box.getChildByName("label");
                    textLabel.setPosition(cc.p(box.width / 2, box.height / 2));
                    textLabel.getComponent(cc.Label).string = o.val;
                    box.setScale(this._boxWidth / box.width);
                    box.setPosition(o.pos);
                    box.setTag(o.index);
                    o.box = box;

                    // 绑定点击事件
                    box.on(cc.Node.EventType.TOUCH_END, function (event) {
                        var id = +event.currentTarget.getChildByName('label').getComponent(cc.Label).string;
                        var tag = event.currentTarget.getTag();
                        if (!self.arr[tag].box) return;
                        if (!self.selectId) {
                            self.selectId = tag;
                            self.pass = false;
                            cc.log("selectId = ", self.arr[tag].val);
                        } else {
                            if (tag === self.selectId) return;
                            self.clickId = tag;
                            self.checkAction(self.arr[self.selectId], self.arr[tag], 0, []);
                        }
                    });
                }
                this.arr.push(o);
            }
        }
    },

    checkAction: function checkAction(selectTarget, clickTarget, count, points) {
        var _points = points.slice();

        // 两个坐标在同一直线上面 且中间格子都是空的
        if ((selectTarget.point[0] === clickTarget.point[0] || selectTarget.point[1] === clickTarget.point[1]) && this.checkDoublePoint(selectTarget, clickTarget)) {
            if (this.checkDoublePass(this.arr[this.selectId], this.arr[this.clickId])) {
                _points.push(selectTarget);
                _points.push(clickTarget);
                this.addPassInfo(_points);
                count == 0 && this.findShortPath();
            } else {
                if (count === 0) {
                    this.selectId = null;
                }
            }
            return;
        }

        // 最多两个拐点
        if (count === 2) return;

        _points.push(selectTarget);
        var selectIdAroundArrs = [];
        var self = this;
        this.arr.forEach(function (item, idx) {
            if (item.point[0] === selectTarget.point[0] && idx !== selectTarget.index && !item.val || item.point[1] === selectTarget.point[1] && idx !== selectTarget.index && !item.val) {
                selectIdAroundArrs.push(item);
            }
        });

        selectIdAroundArrs = selectIdAroundArrs.filter(function (item) {
            if (self.checkDoublePoint(item, selectTarget)) return item;
        });

        count++;
        selectIdAroundArrs.forEach(function (item) {
            self.checkAction(item, clickTarget, count, _points);
        });

        // 遍历完毕 把选择ID复原为Null
        if (count === 1) {
            cc.log("所有情况跑完");
            this.findShortPath();
        }
    },

    // 判断两个点的值是否一致
    checkDoublePass: function checkDoublePass(a, b) {
        return a.val === b.val;
    },

    // 判断两个点之间的格子是否都为null
    checkDoublePoint: function checkDoublePoint(a, b) {
        if (a.point[0] === b.point[0]) {
            if (a.point[1] > b.point[1]) {
                for (var i = b.point[1] + 1; i < a.point[1]; i++) {
                    var index = a.point[0] + i * (this.row + 2);
                    if (this.arr[index].val) return false;
                }
            } else {
                for (var i = b.point[1] - 1; i > a.point[1]; i--) {
                    var index = a.point[0] + i * (this.row + 2);
                    if (this.arr[index].val) return false;
                }
            }
        } else {
            if (a.point[0] > b.point[0]) {
                for (var i = b.point[0] + 1; i < a.point[0]; i++) {
                    var index = i + b.point[1] * (this.row + 2);
                    if (this.arr[index].val) return false;
                }
            } else {
                for (var i = b.point[0] - 1; i > a.point[0]; i--) {
                    var index = i + b.point[1] * (this.row + 2);
                    if (this.arr[index].val) return false;
                }
            }
        }
        return true;
    },

    // 符合条件
    addPassInfo: function addPassInfo(points) {
        this.passInfos.push(points);
    },

    // 找到最短的路径
    findShortPath: function findShortPath() {
        if (this.passInfos.length <= 0) {
            cc.log('没有符合条件!!!');
            this.selectId = null;
            return;
        }
        var shortPath = null;
        var minLength = 0;
        this.passInfos.forEach(function (item) {
            var length = 0;
            for (var i = 1; i < item.length; i++) {
                var nowPoint = item[i].point;
                var lastPoint = item[i - 1].point;
                if (nowPoint[0] === lastPoint[0]) {
                    length += Math.abs(nowPoint[1] - lastPoint[1]);
                } else {
                    length += Math.abs(nowPoint[0] - lastPoint[0]);
                }
            }
            if (length < minLength || !minLength) {
                shortPath = item;
                minLength = length;
            }
        });
        for (var i = 0; i < shortPath.length - 1; i++) {
            this.drawLine(shortPath[i], shortPath[i + 1]);
        }
        this.scheduleOnce(function () {
            this._lineNodes.forEach(function (item) {
                item.clear();
            });
            this.gamePass();
        }, 0.5);
    },

    // 通过
    gamePass: function gamePass() {
        var selectTarget = this.arr[this.selectId];
        var clickTarget = this.arr[this.clickId];
        selectTarget.box.destroy();
        selectTarget.box = null;
        selectTarget.val = null;
        clickTarget.box.destroy();
        clickTarget.box = null;
        clickTarget.val = null;
        this.selectId = null;
        this.pass = true;
        this.passInfos = [];
        this.checkGameSuccess();
    },

    checkGameSuccess: function checkGameSuccess() {
        var result = this.arr.every(function (item) {
            return !item.box;
        });
        if (result) {
            cc.log("通关");
            cc.director.loadScene('Pass');
        }
    },

    drawLine: function drawLine(a, b) {
        var drawNode = new cc.DrawNode();
        cc.Canvas.instance.node.parent._sgNode.addChild(drawNode, 100);
        drawNode.drawSegment(cc.p(a.pos.x + this._boxWidth / 2 + 5, a.pos.y + this._boxWidth / 2), cc.p(b.pos.x + this._boxWidth / 2 + 5, b.pos.y + this._boxWidth / 2), 5, cc.color(265, 1, 0, 255));
        //        drawNode.drawSegment(a.pos, b.pos, 5, cc.color(265, 1, 0, 255));
        this._lineNodes.push(drawNode);
    },

    getSortArrs: function getSortArrs(arrs, row, col) {
        var result = [];
        var times = row * col / arrs.length;
        if (times.toString().indexOf(".") >= 0 || times % 2 !== 0) {
            cc.log("随机图片的个数不平均");
            return result;
        }
        for (var i = 0; i < arrs.length; i++) {
            for (var j = 0; j < times; j++) {
                result.push(arrs[i]);
            }
        }
        result.sort(function (a, b) {
            return cc.random0To1() > 0.5 ? 1 : -1;
        });
        return result;
    },

    // called every frame
    update: function update(dt) {}
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
        //# sourceMappingURL=Game.js.map
        