"use strict";
cc._RF.push(module, 'c3c04KhgWdFG54kGnB/L2Jt', 'huaGame');
// Script/huaGame.js

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
        }
    },

    ctor: function ctor() {
        // 列
        this.col = 4;
        // 行
        this.row = 4;
    },


    // use this for initialization
    onLoad: function onLoad() {

        // 行
        var row = this.row;
        // 列
        var col = this.col;
        var length = row * col;
        var winSizeW = this.node.width;

        // 获取随机顺序的数组
        // const arrs = this.getSortArrs(length - 1);
        var arrs = this._getSortArrs(length, 2000);

        // 计算每个盒子宽度
        var width = winSizeW / col;

        // 初始化数据结构
        for (var i = 0; i < length; i++) {
            var x = (i % col - col / 2 + 0.5) * width;
            var y = 200 - Math.floor(i / col) * width;
            this.arr[i] = {
                point: [i % col, Math.floor(i / col)], // 坐标[x, y]
                val: null, // 值
                box: null, // 实例
                pos: cc.p(x, y) // 相应的坐标对应的位置
            };
        }

        var self = this;
        for (var i = 0; i < length - 1; i++) {
            var box = cc.instantiate(this.box);
            this.node.addChild(box);
            var textLabel = box.getChildByName("label");
            // 赋值
            textLabel.getComponent(cc.Label).string = arrs[i];
            box.setScale(width / box.width);

            // 保存到数据结构中
            this.arr[i].val = arrs[i];
            this.arr[i].box = box;

            box.setPosition(this.arr[i].pos);

            // 绑定点击事件
            box.on("mousedown", function (event) {
                var id = +event.currentTarget.getChildByName('label').getComponent(cc.Label).string;
                var target;
                var idx;
                // 遍历找出点击的盒子target
                self.arr.forEach(function (item, _idx) {
                    if (id === item.val) {
                        target = item;
                        idx = _idx;
                        return;
                    }
                });

                // 获取点击盒子的上下左右四个坐标
                var nears = [[target.point[0], target.point[1] - 1], [target.point[0] + 1, target.point[1]], [target.point[0], target.point[1] + 1], [target.point[0] - 1, target.point[1]]];

                var oldIndex = idx,
                    newIndex;
                nears.forEach(function (_item) {
                    var index = _item[0] + _item[1] * col;
                    if (0 <= _item[0] && _item[0] < col && 0 <= _item[1] && _item[1] < row && !self.arr[index].val) {
                        newIndex = index;
                    }
                });
                // 获取替换的新位置 newIndex >= 0则说明四周存在空的位置 和老位置一起传入
                newIndex >= 0 && self.runAction(oldIndex, newIndex);
            });
        }
    },

    runAction: function runAction(oldIndex, newIndex) {
        var newAddr = this.arr[newIndex];
        var oldAddr = this.arr[oldIndex];
        newAddr.box = oldAddr.box;
        newAddr.val = oldAddr.val;
        newAddr.box.runAction(cc.moveTo(0.1, newAddr.pos));

        this.arr[oldIndex].val = null;
        this.arr[oldIndex].box = null;

        // 判断是否结束游戏
        if (this.checkPassGame()) {
            cc.log("YOU WIN!! GAME OVER!");
        };
    },

    checkPassGame: function checkPassGame() {
        var result = true;
        this.arr.forEach(function (item, idx) {
            if (item.val && item.val !== idx + 1) {
                result = false;
                return;
            }
        });
        return result;
    },

    getSortArrs: function getSortArrs(length) {
        var result = [];
        for (var i = 0; i < length; i++) {
            result.push(i + 1);
        }result.sort(function (a, b) {
            return cc.random0To1() > 0.5 ? a - b : b - a;
        });
        return result;
    },

    _getSortArrs: function _getSortArrs(length, count) {
        var _this = this;

        var result = [];
        for (var i = 0; i < length - 1; i++) {
            result.push(i + 1);
        }result.push(null);

        var _fn = function _fn(arrs) {
            var index = arrs.indexOf(null);
            var targetIdx = null;
            if (index === 0) {
                targetIdx = _this.getRandomTarget([index + 1, index + _this.col]);
            } else if (index === _this.col - 1) {
                targetIdx = _this.getRandomTarget([index - 1, index + _this.col]);
            } else if (index === length - _this.col) {
                targetIdx = _this.getRandomTarget([index + 1, index - _this.col]);
            } else if (index === length - 1) {
                targetIdx = _this.getRandomTarget([index - 1, index - _this.col]);
            } else {
                if (index < _this.col - 1) {
                    targetIdx = _this.getRandomTarget([index + 1, index - 1, index + _this.col]);
                } else if ((index + 1) % _this.col === 0) {
                    targetIdx = _this.getRandomTarget([index - 1, index + _this.col, index - _this.col]);
                } else if (index > length - _this.col) {
                    targetIdx = _this.getRandomTarget([index + 1, index - 1, index - _this.col]);
                } else if (index % _this.col === 0) {
                    targetIdx = _this.getRandomTarget([index + 1, index + _this.col, index - _this.col]);
                } else {
                    targetIdx = _this.getRandomTarget([index + 1, index - 1, index + _this.col, index - _this.col]);
                }
            }
            var _ref = [arrs[targetIdx], arrs[index]];
            arrs[index] = _ref[0];
            arrs[targetIdx] = _ref[1];
        };
        for (var i = 0; i < 100 * 100 * 100; i++) {
            var nullIdx = result.indexOf(null);
            if (i > count && nullIdx === length - 1) {
                break;
            }
            _fn(result);
        }
        return result;
    },


    getRandom: function getRandom(l) {
        return 0 | cc.random0To1() * l;
    },

    getRandomTarget: function getRandomTarget(arrs) {
        var randomIdx = this.getRandom(arrs.length);
        return arrs[randomIdx];
    },


    // called every frame
    update: function update(dt) {}
});

cc._RF.pop();