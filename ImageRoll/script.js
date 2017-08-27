(function () {
    var imageRoll = {};
    var imageNum = 0;//轮播图片数量
    var imageList = [];
    var wrapper;//轮播最外包裹层
    var container;//用户指定的容器
    var width = 0, height = 0;//图片宽高

    var list, prevBtn, nextBtn, focus, focusElems;

    var interval = 3000;//动画执行间隔 默认3000
    var span = 10;//一张图片平移时间间隔（平滑程度）
    var time;//移动执行时间
    
    /**
     *初始化
     *@param imgList 图片路径数组
     *@param imageWidth 图片宽度
     *@param imageHeight 图片高度
     *@param selector 用户指定的容器的选择器
     *@param playInterval 可选，轮播时间间隔
     *@param playTime 可选，图片移动时间
     */
    imageRoll.init = function (imgList, selector, playInterval, playTime) {
        imageList = imgList.slice();
        imageNum = imgList.length;
        interval = playInterval || interval;

        imageRoll.imageNum = imageNum;
        imageRoll.imageList = imageList;
        imageRoll.complete = false;//是否初始化完毕

        //获取图像宽高，onload必须在src之前
        var image = new Image();
        image.onload = function () {
            width = image.width;
            height = image.height;

            //获取默认移动动画执行时间
            var getTime = function () {
                var arr = [];
                var n = 1;
                do {
                    if (span * width % n == 0) {
                        if (n % span == 0) {
                            arr.push(n);
                        }
                    }
                    n++;
                }while (n <= span * width);
                return arr;
            };
            var timeArr = getTime();
            //取大于等于图像宽度的第一个值，这样速度适中
            for (var i = 0, len = timeArr.length; i < len; i++) {
                if (timeArr[i] >= width) {
                    time = timeArr[i];
                    break;
                }
            }
            time = playTime || time;

            container = document.querySelector(selector);

            render();
            play();

            imageRoll.playTime = timeArr;//提供参数playTime可能的选值
            imageRoll.complete = true;
        };
        image.src = imgList[0];
    };

    /**
     *渲染HTML及调整样式
     */
    var render = function () {
        /**
         *获取html
         */
        var getHTML = function () {
            var html =  '<div class="image-roll-wrapper">' +
                            '<div class="image-roll-list">' +
                               '<img src=' + imageList[imageNum - 1] + ' alt=' + imageNum + '>';
            for (var i = 0; i < imageNum; i++) {
                html += '<img src=' + imageList[i] + ' alt=' + (i + 1) + '>';
            }
            html += '<img src=' + imageList[0] + ' alt="1">' +
                           '</div>' +
                           '<div class="image-roll-focus">' +
                               '<span index="1" class="image-roll-on"></span>';
            for (var i = 1; i < imageNum; i++) {
                html += '<span index=' + (i + 1) + '></span>';
            }
            html += '</div>' +
                           '<a href="#" class="image-roll-prev"><</a>' +
                           '<a href="#" class="image-roll-next">></a>' +
                    '</div>';
            return html;
        };

        var html = getHTML();
        container.innerHTML = html;

        wrapper = document.querySelector('.image-roll-wrapper');
        list = wrapper.querySelector('.image-roll-list');//图片容器
        prevBtn = wrapper.querySelector('.image-roll-prev');
        nextBtn = wrapper.querySelector('.image-roll-next');
        focus = wrapper.querySelector('.image-roll-focus');
        focusElems = focus.children;//焦点元素

        /**
         *根据输入调整样式
         */
        var setStyle = function () {
            wrapper.style.width = width + 'px';
            wrapper.style.height = height + 'px';
            list.style.left = -width + 'px';
            list.style.width = (imageNum + 2) * width + 'px';
        };
        setStyle();
    };

    /**
     *播放
     */
    var play = function () {
        var index = 1;
        var timer;
        var isMoving = false;//动画是否正在执行

        /**
         *图像平滑移动动画
         *@param offset 当前位置与目的位置偏移量
         */
        var animate = function (offset) {
            var speed = offset / (time / span);
            var startVal = list.offsetLeft;//开始位置
            isMoving = true;
            var timer = setInterval(function () {
                if ((speed > 0 && list.offsetLeft < startVal + offset) || (speed < 0 && list.offsetLeft > startVal + offset)) {
                    list.style.left = list.offsetLeft + speed + 'px';
                }
                else {
                    if (list.offsetLeft > -width) {
                        list.style.left = -width * imageNum + 'px';
                    }
                    if (list.offsetLeft < -width * imageNum) {
                        list.style.left = -width + 'px';
                    }
                    clearInterval(timer);
                    isMoving = false;
                }
            }, span);
        };

        /**
         *焦点聚焦
         *@param index 焦点元素index属性值
         */
        var focusByIndex = function (index) {
            if (index) {
                for (var i = 0, len = focusElems.length; i < len; i++) {
                    if (focusElems[i].className == 'image-roll-on') {
                        focusElems[i].className = '';
                        break;
                    }
                }
                focusElems[index - 1].className = 'image-roll-on';
            }
        };

        /**
         *向右移动
         */
        var move = function () {
            if (isMoving) {
                return;
            }
            index++;
            if (index == imageNum + 1) {
                index = 1;
            }
            animate(-width);
            focusByIndex(index);
        };

        /**
         *轮播动画
         */
        var roll = function () {
            timer = setInterval(move, interval);
        };

        /**
         *停止轮播
         */
        var stop = function () {
            clearInterval(timer);
        };

        prevBtn.addEventListener('click', function () {
            if (isMoving) {
                return;
            }
            index--;
            if (index == 0) {
                index = imageNum;
            }
            animate(width);
            focusByIndex(index);
        }, false);

        nextBtn.addEventListener('click', move, false);

        focus.addEventListener('click', function (e) {
            if (isMoving) {
                return;
            }
            e = e || window.event;
            var target = e.target;
            if (target.className == 'image-roll-on') {
                return;
            }
            var indexNum = target.getAttribute('index');
            //点击到焦点父元素indexNum为空
            if (!indexNum) {
                return;
            }
            else {
                animate((indexNum - index) * (-width));
                index = indexNum;
                focusByIndex(index);
            }
        }, false);

        //鼠标移入移出
        wrapper.addEventListener('mouseout', roll, false);
        wrapper.addEventListener('mouseover', stop, false);

        roll();

        // var getStyle = function (element, attr) {
        //     if(element.currentStyle) {
        //         return element.currentStyle[attr];//兼容ie版本
        //     } else {
        //         return getComputedStyle(element, false)[attr];//兼容FF和谷歌版本
        //     }
        // };
    };

    window.imageRoll = imageRoll;
})();