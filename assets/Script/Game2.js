let Global = require("./common/Global");

cc.Class({
    extends: cc.Component,

    properties: {
        box: {
            default: null,
            type: cc.Prefab
        },

        picArrs: {
            default: [],
            type: [cc.SpriteFrame]
        },

        refreshBtn: {
            default: null,
            type: cc.Button
        },

        backBtn: {
            default: null,
            type: cc.Button
        },
    },

    ctor() {
        // 存放所有盒子的数据结构
        this.arr = [];
        // 存放所有的盒子实例
        this._boxArrs = [];
        // 存放选择的盒子
        this.selectId = null;
        // 存放点击的盒子
        this.clickId = null;
        // 记录是否可以消除
        this.pass = false;
        // 存放划线元素
        this._lineNodes = [];
        // 行
        this.row = Global._type;
        // 列
        this.col = Global._type;
    },

    onLoad() {
        this.gameStart();
        
        this.refreshBtn.node.on(cc.Node.EventType.TOUCH_END, event => {
            this.gameStart();
        })
        
        this.backBtn.node.on(cc.Node.EventType.TOUCH_END, event => {
            cc.director.loadScene('Began');
        })
    },

    gameStart() {
        if (this._boxArrs.length > 0) {
            this._boxArrs.forEach(item => {
                cc.isValid(item) && item.destroy();
            })
            this._boxArrs = [];
        }
        // 随机图片
        let _randomArr = this.picArrs.slice(0, this.row);
        // 屏幕宽度
        const winSizeW = cc.director.getWinSize().width;
        // 展示的宽度
        const showW = 500;

        // 获取随机数组
        const arrs = this.getSortArrs(_randomArr, this.row, this.col);
        if (arrs.length === 0) return;

        // 计算每个盒子宽度
        this._boxWidth = showW / this.col;

        // 初始化数据结构(+2表示所有盒子外面套多一层没有null的空盒子作为路径)
        for (let i = 0; i < this.row + 2; i++) {
            for (let j = 0; j < this.col + 2; j++) {
                let o = {
                    point: [j, i],
                    box: null,
                    val: null,
                    pos: null,
                    index: j + i * (this.col + 2)
                }
                let x = -winSizeW / 2 + (winSizeW - this._boxWidth * this.col) / 2 + (j - 1 / 2) * this._boxWidth;
                let y = 270 - (i - 1) * this._boxWidth;
                o.pos = cc.p(x, y);

                if (i !== 0 && j !== 0 && i !== this.col + 1 && j !== this.row + 1) {
                    let index = (j - 1) + (i - 1) * this.col;
                    o.val = arrs[index].type;
                    let box = cc.instantiate(this.box);
                    this.node.addChild(box);

                    let dynamicNode = new cc.Node();
                    let sp = dynamicNode.addComponent(cc.Sprite);
                    sp.spriteFrame = arrs[index].texture;
                    box.addChild(dynamicNode)

                    // let textLabel = box.getChildByName("label");
                    // textLabel.getComponent(cc.Label).string = o.val;
                    box.setScale(this._boxWidth / box.width);
                    box.setPosition(o.pos);
                    box.setTag(o.index);
                    o.box = box;
                    this._boxArrs.push(box);

                    // 绑定点击事件
                    box.on(cc.Node.EventType.TOUCH_END, (event) => {
                        // let id = +event.currentTarget.getChildByName('label').getComponent(cc.Label).string;
                        let tag = event.currentTarget.getTag();
                        if (!this.arr[tag].box) return;
                        if (!this.selectId) {
                            this.selectId = tag;
                            this.pass = false;
                            cc.log("selectId = ", this.arr[tag].val);
                        } else {
                            if (tag === this.selectId) return;
                            this.clickId = tag;
                            let points = this.checkAction(this.arr[this.selectId], this.arr[tag], true);
                            if (points.length == 0) {
                                this.selectId = null;
                            } else {
                                for (let i = 0; i < points.length - 1; i++) {
                                    this.drawLine(points[i], points[i + 1]);
                                }
                                this.scheduleOnce(() => {
                                    this._lineNodes.forEach((item) => {
                                        item.clear();
                                    })
                                    this.clickPass();
                                }, 0.3)
                            }
                        }
                    })
                }
                this.arr[o.index] = o;
            }
        }
        // 检测是否无解
        this.checkEnable();
    },

    // 检查两个点是否可以划掉 返回所有拐点数组 第三个参数needCheckVal表示是否需要判断两个点的val是否一致即是否需要判断是同张图片
    checkAction(targetA, targetB, needCheckVal) {
        if (!this.checkDoublePass(targetA, targetB) && needCheckVal) return [];
        if ((targetA.point[0] === targetB.point[0] || targetA.point[1] === targetB.point[1]) && this.checkDoublePoint(targetA, targetB)) {
            return [targetA, targetB];
        }
        let a_points = this.getPointAround(targetA),
            b_points = this.getPointAround(targetB),
            inflec_point = null,
            _ok = false;
        a_points.forEach((item) => {
            if (_ok) return;
            b_points.forEach((_item) => {
                if (item.index === _item.index) {
                    inflec_point = item;
                    _ok = true;
                    return;
                }
            })
        })
        if (inflec_point) {
            return [targetA, inflec_point, targetB];
        } else {
            let result = [];
            a_points.forEach((item) => {
                if (this.pass) return;
                b_points.forEach((_item) => {
                    if ((item.point[0] === _item.point[0] || item.point[1] === _item.point[1]) && this.checkDoublePoint(item, _item)) {
                        this.pass = true;
                        result = [targetA, item, _item, targetB];
                    }
                })
            })
            return result
        }
    },

    // 判断两个点的值是否一致
    checkDoublePass(a, b) {
        return a.val === b.val
    },

    // 判断两个同一直线的点之间的格子是否中间有阻碍
    checkDoublePoint(a, b) {
        if (a.point[0] === b.point[0]) {
            if (a.point[1] > b.point[1]) {
                for (let i = b.point[1] + 1; i < a.point[1]; i++) {
                    let index = a.point[0] + i * (this.row + 2);
                    if (this.arr[index].val) return false;
                }
            } else {
                for (let i = b.point[1] - 1; i > a.point[1]; i--) {
                    let index = a.point[0] + i * (this.row + 2);
                    if (this.arr[index].val) return false;
                }
            }
        } else {
            if (a.point[0] > b.point[0]) {
                for (let i = b.point[0] + 1; i < a.point[0]; i++) {
                    let index = i + b.point[1] * (this.row + 2);
                    if (this.arr[index].val) return false;
                }
            } else {
                for (let i = b.point[0] - 1; i > a.point[0]; i--) {
                    let index = i + b.point[1] * (this.row + 2);
                    if (this.arr[index].val) return false;
                }
            }
        }
        return true;
    },

    // 找出某个点扩散的所有可行路径
    getPointAround(target) {
        let points = [];
        // 上
        for (let i = target.point[1] - 1; i >= 0; i--) {
            let index = target.point[0] + i * (this.col + 2);
            if (!this.arr[index].val)
                points.push(this.arr[index]);
            else
                break
        }
        // 右
        for (let i = target.point[0] + 1; i < this.col + 2; i++) {
            let index = i + target.point[1] * (this.col + 2);
            if (!this.arr[index].val)
                points.push(this.arr[index]);
            else
                break
        }
        // 下
        for (let i = target.point[1] + 1; i < this.row + 2; i++) {
            let index = target.point[0] + i * (this.col + 2);
            if (!this.arr[index].val)
                points.push(this.arr[index]);
            else
                break
        }
        // 左
        for (let i = target.point[0] - 1; i >= 0; i--) {
            let index = i + target.point[1] * (this.col + 2);
            if (!this.arr[index].val)
                points.push(this.arr[index]);
            else
                break
        }
        return points
    },

    // 通过
    clickPass() {
        let selectTarget = this.arr[this.selectId];
        let clickTarget = this.arr[this.clickId];
        [selectTarget, clickTarget].map((item) => {
            item.box.destroy();
            item.box = null;
            item.val = null;
        })
        this.selectId = null;
        this.checkGameSuccess();
    },

    // 检查是否结束游戏
    checkGameSuccess() {
        let result = this.arr.every(item => !item.box);
        if (result) {
            cc.director.loadScene('Pass');
        } else {
            this.checkEnable();
        }
    },

    // 划线
    drawLine(a, b) {
        const winSize = cc.director.getWinSize();
        let drawNode = new cc.DrawNode();
        cc.Canvas.instance.node.parent._sgNode.addChild(drawNode);
        drawNode.drawSegment(cc.p(a.pos.x + winSize.width / 2, a.pos.y + winSize.height / 2),
            cc.p(b.pos.x + winSize.width / 2, b.pos.y + winSize.height / 2), 5, cc.color(265, 1, 0, 255));
        this._lineNodes.push(drawNode);
    },

    getSortArrs(arrs, row, col) {
        let result = [];
        let times = row * col / arrs.length;
        if (times.toString().indexOf(".") >= 0 || times % 2 !== 0) {
            cc.log("随机图片的个数不平均");
            return result;
        }
        for (let i = 0; i < arrs.length; i++) {
            for (let j = 0; j < times; j++) result.push({
                // +1是为了不让 索引 == 0 方便后面判断
                type: i + 1,
                texture: arrs[i]
            })
        }
        // 随机打乱顺序
        result.sort((a, b) => cc.random0To1() > 0.5 ? 1 : -1);
        return result;
    },

    // 检查是否无解
    checkEnable() {
        // 不存在可提示的即无解
        let tip = this.findTip();
        if (tip.length == 0) {
            cc.log("无解!!! 替换位置")
            this.updateLayout();
        }
    },

    // 提示
    findTip() {
        let _map = [];
        this.arr.forEach((item) => {
            if (item.box) {
                _map[item.val] ? _map[item.val].push(item) : (_map[item.val] = [item]);
            }
        })
        let _pass = false;
        let result = [];
        _map.forEach((item) => {
            if (_pass) return;
            for (let i = 0; i < item.length; i++) {
                if (_pass) break;
                for (let j = i + 1; j < item.length; j++) {
                    if (_pass) break;
                    let points = this.checkAction(item[i], item[j], true);
                    if (points.length > 0) {
                        _pass = true;
                        result = points;
                    }
                }
            }
        })
        return result
    },

    // 无解的情况下再次打乱布局 保证有解
    updateLayout() {
        let _pass = false;
        this.arr.forEach((item) => {
            if (_pass) return;

            // 找到随意的一个还没划掉的点C
            if (item.box) {

                // 找出准备替换位置的两个点A(同C一样的值)，B(不同C的值且能跟C划掉)
                let targetPointA,
                    targetPointB;

                this.arr.forEach((_item) => {
                    if (!_item.box) return;
                    if (!targetPointA && item.val === _item.val && item.index !== _item.index) {
                        targetPointA = _item;
                    }
                    let points = this.checkAction(item, _item, false);
                    if (!targetPointB && item.val !== _item.val && points.length > 0) {
                        targetPointB = _item;
                    }
                    // 找到两个点就停止内循环减少算法计算
                    if (targetPointA && targetPointB) return;
                })

                // 找到两个点就替换两个点的位置并停止外循环减少算法计算
                if (targetPointA && targetPointB) {
                    this.updateDoublePoint(targetPointA, targetPointB);
                    _pass = true;
                }
            }
        })
    },

    // 替换两个点的盒子
    updateDoublePoint(targetA, targetB) {
        let _ = {
            val: targetA.val,
            box: targetA.box,
        }
        targetA.val = targetB.val;
        targetA.box = targetB.box;
        targetB.val = _.val;
        targetB.box = _.box;

        [targetA, targetB].map((item) => {
            item.box.setTag(item.index);
            item.box.runAction(cc.moveTo(0.3, item.pos));
        })
    }

});
