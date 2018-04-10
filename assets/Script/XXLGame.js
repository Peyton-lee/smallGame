let _llkGame = require('./Game2');
cc.Class({
    extends: _llkGame,

    properties: {
        showTip: cc.Sprite
    },

    onLoad() {
        
        this.row = 4;
        this.col = 4;
        this._probability = 0.01; // 炸弹几率

        // 存放所有盒子的数据结构
        this.arr = [];
    },

    start() {
        // 游戏结束的弹窗
        this.showTip.getComponent(cc.Sprite).node.active = false;
        this.showTip.getComponent(cc.Sprite).node.setLocalZOrder(100);

        // 屏幕
        const winSize = cc.director.getWinSize();
        // 获取随机数组
        this._arrs = this.getSortArrs(this.picArrs.slice(0, 4), this.row, this.col);
        if (this._arrs.length === 0) return;

        // 计算每个盒子宽度
        this._boxWidth = winSize.width / this.col;
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                let o = {
                    point: [j, i],
                    box: null,
                    val: null,
                    pos: null,
                    isValid: true,
                    index: j + i * this.col
                }
                let x = -winSize.width / 2 + (winSize.width - this._boxWidth * this.col) / 2 + (j + 1 / 2) * this._boxWidth;
                let y = 270 - i * this._boxWidth;
                o.pos = cc.p(x, y);
                let index = o.index;
                o.val = this._arrs[index].type;
                let box = this.newBox(o.val - 1);
                box.setPosition(o.pos);
                box.setTag(o.index);
                o.box = box;
                this.arr[o.index] = o;
            }
        }
    },

    getAroundPoints(point) {
        let result = [];
        if (!point.isValid) return result;
        // 上下炸弹 炸整列 不用判断是否是isValid
        let leftPoint = this.arr[point.index - 1];
        if (leftPoint && leftPoint.box && leftPoint.isValid && point.point[0] !== 0 && leftPoint.val === point.val) {
            result.push(leftPoint);
        }
        let rightPoint = this.arr[point.index + 1];
        if (rightPoint && rightPoint.box && rightPoint.isValid && point.point[0] !== this.col - 1 && rightPoint.val === point.val) {
            result.push(rightPoint);
        }
        let topPoint = this.arr[point.index - this.col];
        if (topPoint && topPoint.box && topPoint.isValid && point.point[1] !== 0 && topPoint.val === point.val) {
            result.push(topPoint);
        }
        let bottomPoint = this.arr[point.index + this.col];
        if (bottomPoint && bottomPoint.box && bottomPoint.isValid && point.point[1] !== this.row - 1 && bottomPoint.val === point.val) {
            result.push(bottomPoint);
        }
        return result;
    },

    getChunk(point, existIdxs, result, isFirst) {
        if (isFirst) {
            if (point.val === 9) {
                for (let i = 0; i < this.row; i++) {
                    let idx = point.point[0] + i * this.col;
                    if (this.arr[idx].box) {
                        result.push(this.arr[idx]);
                    }
                }
                return result
            } else if (point.val === 10) { // 左右炸弹 炸整行 不用判断是否是isValid
                for (let i = 0; i < this.col; i++) {
                    let idx = i + this.col * point.point[1];
                    if (this.arr[idx].box) {
                        result.push(this.arr[idx]);
                    }
                }
                return result
            }
        }

        let aAroundPoints = [point].concat(this.getAroundPoints(point));
        aAroundPoints.forEach(item => {
            if (existIdxs.indexOf(item.index) < 0) {
                existIdxs.push(item.index);
                result.push(item);
                result.concat(this.getChunk(item, existIdxs, result, false));
            }
        })
        return result;
    },

    clearPoints(points) {
        let _map = {};
        points.forEach(item => {
            let o = _map[item.point[0]];
            if (!o) {
                o = {
                    maxIdx: item.index
                }
            } else {
                item.index > o.maxIdx && (o.maxIdx = item.index);
            }
            item.box.destroy();
            item.box = null;
            item.val = null;
            _map[item.point[0]] = o;
        });

        for (let x in _map) {
            let maxIdx = _map[x].maxIdx;
            let result = [];
            for (let i = 0; i < this.row; i++) {
                let idx = parseInt(x) + i * this.col;
                if (this.arr[idx] && idx < maxIdx) result.push(this.arr[idx]);
            }
            this.movePoints(result, maxIdx);
        }
        this.scheduleOnce(() => {
            this.checkClickEnable();
        }, .3)
    },

    movePoints(points, maxIdx) {
        for (let i = points.length - 1; i >= 0; i--) {
            let item = points[i];
            let len = 0;
            for (let j = item.point[1] + 1; j < this.row; j++) {
                var index = item.point[0] + j * this.col;
                if (!this.arr[index].box) len++;
            }
            let nextIdx = item.index + this.col * len;
            let target = this.arr[nextIdx];
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

    checkClickEnable() {
        let enable = false;
        this.arr.forEach(item => {
            if (item.box) {
                let points = this.getAroundPoints(item);
                if (item.val === 9 || item.val === 10 || points.length > 0) {
                    enable = true;
                    return;
                }
            }
        })
        if (!enable) {
            this.setDisable();
            if (this.arr.every(item => item.box)) {
                this.gameOver();
            } else {
                this.setNextRound();
            }
        }
    },

    setDisable() {
        this.arr.forEach(item => {
            if (item.box) {
                item.isValid = false;
                item.box._spNode.setColor(cc.color(150, 150, 150));
            }
        })
    },

    setNextRound() {
        let _map = {}
        this.arr.forEach(item => {
            if (!item.box) {
                let o = _map[item.point[0]];
                if (!o) {
                    o = {
                        count: 1,
                        maxY: item.point[1],
                        points: [item]
                    }
                } else {
                    o.count += 1;
                    item.point[1] > o.maxY && (o.maxY = item.point[1]);
                    o.points.unshift(item)
                }
                _map[item.point[0]] = o;
            }
        })
        for (let x in _map) {
            this.createColBox(x, _map[x])
        }
        this.scheduleOnce(() => {
            this.checkClickEnable();
        }, 0.3)
    },

    createColBox(x, obj) {
        let len = obj.count;
        let maxY = obj.maxY;
        let points = obj.points;
        for (let i = 0; i < len; i++) {
            let random = cc.random0To1();
            let val;
            if (random < this._probability) {
                val = 8;
            } else if (random > this._probability && random < this._probability * 2) {
                val = 9;
            } else {
                val = (0 | cc.random0To1() * (this.picArrs.length - 2));
            }
            let box = this.newBox(val);
            let topBox = this.arr[x];
            box.setPosition(cc.p(topBox.pos.x, topBox.pos.y + this._boxWidth * (i + 1)));
            let target = points[i];
            box.setTag(target.index);
            target.box = box;
            target.val = val + 1;
            target.isValid = true;
            box.runAction(cc.moveTo(0.2, target.pos));
        }
    },

    newBox(index) {
        let box = cc.instantiate(this.box);
        this.node.addChild(box);

        let dynamicNode = new cc.Node();
        let sp = dynamicNode.addComponent(cc.Sprite);
        sp.spriteFrame = this.picArrs[index];
        box._spNode = dynamicNode;
        box.addChild(dynamicNode)

        box.setScale(this._boxWidth / box.width);

        // 绑定点击事件
        box.on(cc.Node.EventType.TOUCH_END, (event) => {
            let idx = event.currentTarget.getTag();
            if (!this.arr[idx].box) return;
            let point = this.arr[idx];
            if (!point.isValid || !point.box) return;
            let targetPoints = this.getChunk(point, [], [], true);
            targetPoints.length > 1 && this.clearPoints(targetPoints);
        })
        return box;
    },

    gameOver() {
        cc.log("游戏结束");
        this.showTip.getComponent(cc.Sprite).node.active = true;
    }

});
