(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Script/XXLGame.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '40905aYvSpOub3AGKKpSVD3', 'XXLGame', __filename);
// Script/XXLGame.js

"use strict";

var _llkGame = require('./Game2');
cc.Class({
    extends: _llkGame,

    properties: {
        showTip: cc.Sprite
    },

    onLoad: function onLoad() {

        this.row = 12;
        this.col = 12;
        this._probability = 0.008; // 炸弹几率

        // 存放所有盒子的数据结构
        this.arr = [];
    },
    start: function start() {
        // 游戏结束的弹窗
        this.showTip.getComponent(cc.Sprite).node.active = false;
        this.showTip.getComponent(cc.Sprite).node.setLocalZOrder(100);

        // 屏幕
        var winSize = cc.director.getWinSize();
        // 获取随机数组
        this._arrs = this.getSortArrs(this.picArrs.slice(0, 6), this.row, this.col);
        if (this._arrs.length === 0) return;

        // 计算每个盒子宽度
        this._boxWidth = winSize.width / this.col;
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                var o = {
                    point: [j, i],
                    box: null,
                    val: null,
                    pos: null,
                    isValid: true,
                    index: j + i * this.col
                };
                var x = -winSize.width / 2 + (winSize.width - this._boxWidth * this.col) / 2 + (j + 1 / 2) * this._boxWidth;
                var y = 270 - i * this._boxWidth;
                o.pos = cc.p(x, y);
                var index = o.index;
                o.val = this._arrs[index].type;
                var box = this.newBox(o.val - 1);
                box.setPosition(o.pos);
                box.setTag(o.index);
                o.box = box;
                this.arr[o.index] = o;
            }
        }
    },
    getAroundPoints: function getAroundPoints(point) {
        var result = [];
        if (!point.isValid) return result;
        // 上下炸弹 炸整列 不用判断是否是isValid
        var leftPoint = this.arr[point.index - 1];
        if (leftPoint && leftPoint.box && leftPoint.isValid && point.point[0] !== 0 && leftPoint.val === point.val) {
            result.push(leftPoint);
        }
        var rightPoint = this.arr[point.index + 1];
        if (rightPoint && rightPoint.box && rightPoint.isValid && point.point[0] !== this.col - 1 && rightPoint.val === point.val) {
            result.push(rightPoint);
        }
        var topPoint = this.arr[point.index - this.col];
        if (topPoint && topPoint.box && topPoint.isValid && point.point[1] !== 0 && topPoint.val === point.val) {
            result.push(topPoint);
        }
        var bottomPoint = this.arr[point.index + this.col];
        if (bottomPoint && bottomPoint.box && bottomPoint.isValid && point.point[1] !== this.row - 1 && bottomPoint.val === point.val) {
            result.push(bottomPoint);
        }
        return result;
    },
    getChunk: function getChunk(point, existIdxs, result, isFirst) {
        var _this = this;

        if (isFirst) {
            if (point.val === 9) {
                for (var i = 0; i < this.row; i++) {
                    var idx = point.point[0] + i * this.col;
                    if (this.arr[idx].box) {
                        result.push(this.arr[idx]);
                    }
                }
                return result;
            } else if (point.val === 10) {
                // 左右炸弹 炸整行 不用判断是否是isValid
                for (var _i = 0; _i < this.col; _i++) {
                    var _idx = _i + this.col * point.point[1];
                    if (this.arr[_idx].box) {
                        result.push(this.arr[_idx]);
                    }
                }
                return result;
            }
        }

        var aAroundPoints = [point].concat(this.getAroundPoints(point));
        aAroundPoints.forEach(function (item) {
            if (existIdxs.indexOf(item.index) < 0) {
                existIdxs.push(item.index);
                result.push(item);
                result.concat(_this.getChunk(item, existIdxs, result, false));
            }
        });
        return result;
    },
    clearPoints: function clearPoints(points) {
        var _this2 = this;

        var _map = {};
        points.forEach(function (item) {
            var o = _map[item.point[0]];
            if (!o) {
                o = {
                    maxIdx: item.index
                };
            } else {
                item.index > o.maxIdx && (o.maxIdx = item.index);
            }
            item.box.destroy();
            item.box = null;
            item.val = null;
            _map[item.point[0]] = o;
        });

        for (var x in _map) {
            var maxIdx = _map[x].maxIdx;
            var result = [];
            for (var i = 0; i < this.row; i++) {
                var idx = parseInt(x) + i * this.col;
                if (this.arr[idx] && idx < maxIdx) result.push(this.arr[idx]);
            }
            this.movePoints(result, maxIdx);
        }
        this.scheduleOnce(function () {
            _this2.checkClickEnable();
        }, .3);
    },
    movePoints: function movePoints(points, maxIdx) {
        for (var i = points.length - 1; i >= 0; i--) {
            var item = points[i];
            var len = 0;
            for (var j = item.point[1] + 1; j < this.row; j++) {
                var index = item.point[0] + j * this.col;
                if (!this.arr[index].box) len++;
            }
            var nextIdx = item.index + this.col * len;
            var target = this.arr[nextIdx];
            target.val = item.val;
            target.box = item.box;
            if (target.box) {
                target.box.setTag(target.index);
                target.box.runAction(cc.moveTo(.2, target.pos));
            }
            item.val = null;
            item.box = null;
        }
    },
    checkClickEnable: function checkClickEnable() {
        var _this3 = this;

        var enable = false;
        this.arr.forEach(function (item) {
            if (item.box) {
                var points = _this3.getAroundPoints(item);
                if (item.val === 9 || item.val === 10 || points.length > 0) {
                    enable = true;
                    return;
                }
            }
        });
        if (!enable) {
            this.setDisable();
            if (this.arr.every(function (item) {
                return item.box;
            })) {
                this.gameOver();
            } else {
                this.setNextRound();
            }
        }
    },
    setDisable: function setDisable() {
        this.arr.forEach(function (item) {
            if (item.box) {
                item.isValid = false;
                item.box._spNode.setColor(cc.color(150, 150, 150));
            }
        });
    },
    setNextRound: function setNextRound() {
        var _this4 = this;

        var _map = {};
        this.arr.forEach(function (item) {
            if (!item.box) {
                var o = _map[item.point[0]];
                if (!o) {
                    o = {
                        count: 1,
                        maxY: item.point[1],
                        points: [item]
                    };
                } else {
                    o.count += 1;
                    item.point[1] > o.maxY && (o.maxY = item.point[1]);
                    o.points.unshift(item);
                }
                _map[item.point[0]] = o;
            }
        });
        for (var x in _map) {
            this.createColBox(x, _map[x]);
        }
        this.scheduleOnce(function () {
            _this4.checkClickEnable();
        }, 0.3);
    },
    createColBox: function createColBox(x, obj) {
        var len = obj.count;
        var maxY = obj.maxY;
        var points = obj.points;
        for (var i = 0; i < len; i++) {
            var random = cc.random0To1();
            var val = void 0;
            if (random < this._probability) {
                val = 8;
            } else if (random > this._probability && random < this._probability * 2) {
                val = 9;
            } else {
                val = 0 | cc.random0To1() * (this.picArrs.length - 2);
            }
            var box = this.newBox(val);
            var topBox = this.arr[x];
            box.setPosition(cc.p(topBox.pos.x, topBox.pos.y + this._boxWidth * (i + 1)));
            var target = points[i];
            box.setTag(target.index);
            target.box = box;
            target.val = val + 1;
            target.isValid = true;
            box.runAction(cc.moveTo(0.2, target.pos));
        }
    },
    newBox: function newBox(index) {
        var _this5 = this;

        var box = cc.instantiate(this.box);
        this.node.addChild(box);

        var dynamicNode = new cc.Node();
        var sp = dynamicNode.addComponent(cc.Sprite);
        sp.spriteFrame = this.picArrs[index];
        box._spNode = dynamicNode;
        box.addChild(dynamicNode);

        box.setScale(this._boxWidth / box.width);

        // 绑定点击事件
        box.on(cc.Node.EventType.TOUCH_END, function (event) {
            var idx = event.currentTarget.getTag();
            if (!_this5.arr[idx].box) return;
            var point = _this5.arr[idx];
            if (!point.isValid || !point.box) return;
            var targetPoints = _this5.getChunk(point, [], [], true);
            targetPoints.length > 1 && _this5.clearPoints(targetPoints);
        });
        return box;
    },
    gameOver: function gameOver() {
        cc.log("游戏结束");
        this.showTip.getComponent(cc.Sprite).node.active = true;
    }
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
        //# sourceMappingURL=XXLGame.js.map
        