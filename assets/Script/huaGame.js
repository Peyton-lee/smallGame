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

    ctor() {
        // 列
        this.col = 4;
        // 行
        this.row = 4;
    },

    onLoad() {
        let row = this.row;
        let col = this.col;
        const length = row * col;
        const winSizeW = 500;

        // 获取随机顺序的数组
        let arrs = this._getSortArrs(length, 2000);

        // 计算每个盒子宽度
        const width = winSizeW / col;

        // 初始化数据结构
        for (let i = 0; i < length; i++) {
            let x = (i % col - col / 2 + 0.5) * width;
            let y = 200 - Math.floor(i / col) * width;
            this.arr[i] = {
                point: [i % col, Math.floor(i / col)], // 坐标[x, y]
                val: null, // 值
                box: null, // 实例
                pos: cc.p(x, y) // 相应的坐标对应的位置
            }
        }

        for (let i = 0; i < length - 1; i++) {
            let box = cc.instantiate(this.box);
            this.node.addChild(box);
            let textLabel = box.getChildByName("label");
            textLabel.getComponent(cc.Label).string = arrs[i];
            box.setScale(width / box.width);

            // 保存到数据结构中
            this.arr[i].val = arrs[i];
            this.arr[i].box = box;

            box.setPosition(this.arr[i].pos);

            // 绑定点击事件
            box.on("mousedown", event => {
                let id = +event.currentTarget.getChildByName('label').getComponent(cc.Label).string;
                let target;
                let idx;
                // 遍历找出点击的盒子target
                this.arr.forEach((item, _idx) => {
                    if (id === item.val) {
                        target = item;
                        idx = _idx;
                        return;
                    }
                })

                // 获取点击盒子的上下左右四个坐标
                let nears = [[target.point[0], target.point[1] - 1],
                                    [target.point[0] + 1, target.point[1]],
                                    [target.point[0], target.point[1] + 1],
                                    [target.point[0] - 1, target.point[1]]],
                    oldIndex = idx,
                    newIndex;
                nears.forEach(_item => {
                    let index = _item[0] + _item[1] * col;
                    if (0 <= _item[0] && _item[0] < col && 0 <= _item[1] && _item[1] < row && !this.arr[index].val) {
                        newIndex = index;
                    }
                })
                // 获取替换的新位置 newIndex >= 0则说明四周存在空的位置 和老位置一起传入
                newIndex >= 0 && this.runAction(oldIndex, newIndex);
            })

        }
    },

    runAction(oldIndex, newIndex) {
        let newAddr = this.arr[newIndex];
        let oldAddr = this.arr[oldIndex];
        newAddr.box = oldAddr.box;
        newAddr.val = oldAddr.val;
        newAddr.box.runAction(cc.moveTo(0.1, newAddr.pos));

        this.arr[oldIndex].val = null;
        this.arr[oldIndex].box = null;

        // 判断是否结束游戏
        if (this.checkPassGame()) {
            cc.log("YOU WIN!! GAME OVER!");
            cc.director.loadScene("Pass");
        };

    },

    checkPassGame() {
        let result = true;
        this.arr.forEach((item, idx) => {
            if (item.val && item.val !== (idx + 1)) {
                result = false;
                return;
            }
        })
        return result;
    },

    getSortArrs(length) {
        let result = [];
        for (let i = 0; i < length; i++) result.push(i + 1);
        result.sort((a, b) => {
            return cc.random0To1() > 0.5 ? a - b : b - a;
        })
        return result;
    },

    _getSortArrs(length, count) {
        let result = [];
        for (let i = 0; i < length - 1; i++) result.push(i + 1);
        result.push(null);

        let _fn = (arrs) => {
            let index = arrs.indexOf(null);
            let targetIdx = null;
            if (index === 0) {
                targetIdx = this.getRandomTarget([index + 1, index + this.col]);
            } else if (index === this.col - 1) {
                targetIdx = this.getRandomTarget([index - 1, index + this.col]);
            } else if (index === length - this.col) {
                targetIdx = this.getRandomTarget([index + 1, index - this.col]);
            } else if (index === length - 1) {
                targetIdx = this.getRandomTarget([index - 1, index - this.col]);
            } else {
                if (index < this.col - 1) {
                    targetIdx = this.getRandomTarget([index + 1, index - 1, index + this.col]);
                } else if ((index + 1) % this.col === 0) {
                    targetIdx = this.getRandomTarget([index - 1, index + this.col, index - this.col]);
                } else if (index > length - this.col) {
                    targetIdx = this.getRandomTarget([index + 1, index - 1, index - this.col]);
                } else if (index % this.col === 0) {
                    targetIdx = this.getRandomTarget([index + 1, index + this.col, index - this.col]);
                } else {
                    targetIdx = this.getRandomTarget([index + 1, index - 1, index + this.col, index - this.col]);
                }
            }
            [arrs[index], arrs[targetIdx]] = [arrs[targetIdx], arrs[index]];
        }
        for (let i = 0; i < 100 * 100 * 100; i++) {
            let nullIdx = result.indexOf(null);
            if (i > count && nullIdx === length - 1) {
                break;
            }
            _fn(result);
        }
        return result;
    },

    getRandom(l) {
        return 0 | cc.random0To1() * l;
    },

    getRandomTarget(arrs) {
        let randomIdx = this.getRandom(arrs.length);
        return arrs[randomIdx];
    },

});
