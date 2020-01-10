// ==UserScript==
// @name         Timing Click for Airpods2
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  倒计时自动点击，电商抢东西专用
// @author       lingcon
// match        *://*/*
// @match        *://*.byr.cn/*
// @match        *://*.taobao.com/*
// @match        *://*.jd.com/*
// @match        *://*.tmall.com/*
// @require      https://code.jquery.com/jquery-latest.js
// @run-at       document-idle
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// @connect      githubusercontent.com
// @connect      gitee.com

// ==/UserScript==

(function() {
    'use strict';

    var $ = $ || window.$;
    var _$ = $.noConflict(true);
    var infoSelector = "#item_a12178fd442b19b720ba22f59a1a2892 > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div > span";

    if (sessionStorage.notYeeet) {
        console.log('Not yeeet');
        sessionStorage.removeItem("notYeeet");
//         sessionStorage.buyNooow = true;
//         location.reload(true);
        return;
    }

    if (sessionStorage.buyNooow) {
        console.log('Buy nooow');
        if (sessionStorage.lag) {
            console.log('After lag', sessionStorage.lag);
            setTimeout(stepClick, sessionStorage.lag, 3, 50, function () {
                _$(sessionStorage.selector).trigger('click');
                fireEvent(document.querySelector(sessionStorage.selector), 'click');
            })
//             console.log(document.querySelector(infoSelector));
//             setTimeout(console.log, sessionStorage.lag * 2, document.querySelector(sessionStorage.selector));
        }
        else {
            console.log('Immediately!');
            stepClick(3, 100, function () {
                _$(sessionStorage.selector).trigger('click');
                fireEvent(document.querySelector(sessionStorage.selector), 'click');
            })
        }

//         else {
//             sessionStorage.removeItem("buyNooow");
//         }
        sessionStorage.removeItem("buyNooow");
        return;
    }

   // var countWoker = "https://gitee.com/erokee/monkey-lib/raw/master/timing-click/count-worker.js";
    var countWoker = "https://gitee.com/lingcon/QuickBuy/raw/master/count-worker.js";
    //var avatar = "https://gitee.com/erokee/monkey-lib/raw/master/timing-click/image/1.pic.png";
    var avatar = "https://gitee.com/lingcon/QuickBuy/raw/master/tc.jpg";
    var mainCss = `#ql-panel #counterClickTime {
position:relative;
z-index:999;
height: 30px !important;
width: 210px !important;
font-size: 1em !important;
padding: 5px !important;
border: none !important;
margin: 0 !important;
}

#ql-panel #mstimeClickSelector {
position:relative;
z-index:999;
height: 30px !important;
width: 210px !important;
font-size: 1em !important;
padding: 5px !important;
border: none !important;
margin: 0 !important;
}

#ql-panel #lagClickSelector {
position:relative;
z-index:999;
height: 30px !important;
width: 210px !important;
font-size: 1em !important;
padding: 5px !important;
border: none !important;
margin: 0 !important;
}

#ql-panel #counterClickSelector {
position:relative;
z-index:999;
height: 30px !important;
width: 210px !important;
font-size: 1em !important;
padding: 5px !important;
border: none !important;
margin: 0 !important;
}

#ql-panel #listenButton {
position:relative;
z-index:999;
height: 30px !important;
width: 100% !important;
border: none !important;
color: red !important;
font-size: 1em !important;
margin: 0 !important;
background-color: #fff;
}

#ql-panel #triggerButton {
height:40px;
width:56px;
position:relative;
z-index:9999;
background-position:center;
background-size:100%;
background-image:url(${avatar});
}

#ql-panel {
position:fixed;
z-index:9999;
top: 10vh;
left: 5vw;
}

#ql-panel #hidePanel {
position:absolute;
z-index:9999;
display:none;
border: solid 1px rgb(238,238,238) !important;
box-shadow: 0 0 5px rgb(213,210,210) !important;
}`;

    /*拖动*/
    class DragObj {
        constructor(dom) {
            this.mouse = {
                x: 0,
                y: 0
            };
            this.obj = {
                x: 0,
                y: 0
            };
            this.isClicked = false;
            if(dom) {
                this.dom = dom;
            } else {
                throw new Error('不存在的dom节点');
            }
        }

        init(options={}) {
            document.addEventListener('mousedown', this.down.bind(this));
            document.addEventListener('mousemove', this.move.bind(this));
            document.addEventListener('mouseup', this.end.bind(this));
            if(typeof options.click ==='function') {
                this.clickCb = options.click;
            }
            if(typeof options.exclude === 'object') {
                this.excludeDom = options.exclude;
            }
            if(typeof options.include === 'object') {
                this.includeDom = options.include;
            }
        }

        down(event) {
            if(this.includeDom.contains(event.target)) {
                this.isClicked = true;
                this.mouse.x = event.clientX;
                this.mouse.y = event.clientY;
                this.obj.x = this.dom.offsetLeft;
                this.obj.y = this.dom.offsetTop;
            }
        }

        move(event) {
            if(this.isClicked) {
                let moveX = event.clientX - this.mouse.x;
                let moveY = event.clientY - this.mouse.y;
                this.dom.style.left = `${this.obj.x+moveX}px`;
                this.dom.style.top = `${this.obj.y+moveY}px`;
            }
        }

        end(event) {
            this.isClicked = false;
            if(this.clickCb && (event.clientX === this.mouse.x && event.clientY===this.mouse.y)) {
                if(!this.excludeDom.contains(event.target) && this.includeDom.contains(event.target)) {
                    this.clickCb(event);
                }
            }
        }
    }

    GM_addStyle(mainCss);

    let timeInput = _$('<input id="counterClickTime" placeholder="输入开抢时间" type="datetime-local" step="1" value="2019-10-12T07:22:00" />');
    let mstimeInput; //提前抢毫秒数
    if (!sessionStorage.mstime) {
        mstimeInput = _$('<input id="mstimeClickSelector" placeholder="输入提前刷新毫秒数(默认0)" type="number" />' );
    }
    else {
        mstimeInput = _$('<input id="mstimeClickSelector" placeholder="当前提前刷新毫秒数：'+sessionStorage.mstime+'" type="text" />');
    }
    let lagInput; //延迟抢毫秒数
    if (!sessionStorage.lag) {
        lagInput = _$('<input id="lagClickSelector" placeholder="输入延迟提交毫秒数(默认0)" type="number" />' );
    }
    else {
        lagInput = _$('<input id="lagClickSelector" placeholder="当前延迟提交毫秒数：'+sessionStorage.lag+'" type="text" />');
    }
    let selectorInput; //抢按钮选择器
    if (!sessionStorage.selector) {
        selectorInput = _$('<input id="counterClickSelector" placeholder="输入抢购按钮选择器" type="text" />');
    }
    else {
        selectorInput = _$('<input id="counterClickSelector" placeholder="当前抢购按钮选择器：'+sessionStorage.selector+'" type="text" />');
    }
    let listenButton = _$('<button id="listenButton">(✪ω✪)点我准备开抢</button>');
    let triggerButton = _$('<div id="triggerButton"></div>');
    let panel = _$('<div id="ql-panel"></div>');
    let hidePanel = _$('<div id="hidePanel"></div>');

    let ptime = new Date(Date.parse(predictDate(new Date())));
    //console.log(ptime);

//     hidePanel.append(timeInput.val(dateFormatter.call(new Date(), 'yyyy-MM-ddThh:mm:ss')));
    hidePanel.append(timeInput.val(dateFormatter.call(ptime, 'yyyy-MM-ddThh:mm:ss')));
    hidePanel.append(mstimeInput);
    hidePanel.append(lagInput);
    hidePanel.append(selectorInput);
    hidePanel.append(listenButton);

    panel.append(triggerButton);
    panel.append(hidePanel);

    _$(document.body).append(panel);

    (new DragObj(panel[0])).init({
        click: function(event) {
            hidePanel.toggle('slow');
        },
        exclude: hidePanel[0],
        include: panel[0]
    });

    function dateFormatter(fmt) {
        var o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    // 触发鼠标点击
    function fireEvent(dom, eventName) {
        //console.log('fire', dom);
        let event = new MouseEvent(eventName);
        return dom.dispatchEvent(event);
    }

    // 创建计时器
    function createWorkerFromExternalURL(url, callback) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (response) {
                var script, dataURL, worker = null;
                if (response.status === 200) {
                    script = response.responseText;
                    dataURL = 'data:text/javascript;base64,' + btoa(script);
                    worker = new unsafeWindow.Worker(dataURL);
                }
                callback(worker);
            },
            onerror: function () {
                callback(null);
            }
        });
    }

    // 多次启动点击
    function stepClick(times, stepInterval, clickFn) {
        if (!times) {
            try {
//                 console.log('stepClick', document.querySelector(infoSelector).innerText);
                let infoText = document.querySelector(infoSelector).innerText;
                if (infoText == '百亿补贴活动还未开始') {
                    console.log('Not yet');
                    if (!sessionStorage.notYeeet) {
                        sessionStorage.notYeeet = true;
                        sessionStorage.refresh = true;
                        location.reload();
                    }
                }
                else if (infoText == '抱歉，该商品在您当前收货地址内已无库存！') {
                    console.log('Sold out');
                    if (sessionStorage.notYeeet) sessionStorage.deleteItem('notYeeet');
                }
            }
            catch(err) {
                console.log('Info error:', err.description);
            }
            return;
        }
        try {
            if (clickFn) clickFn();
            if (!sessionStorage.clickTimes)
                sessionStorage.clickTimes = '1';
            else
                sessionStorage.clickTimes += '1';
            console.log('Clicked!!!');
        }
        catch(err) {
            if (!sessionStorage.clickTimes)
                sessionStorage.clickTimes = '0';
            else
                sessionStorage.clickTimes += '0';
            console.log('Click error:', err.description);
        }
//         setTimeout(function () {
//             stepClick(--times, stepInterval, clickFn);
//         }, stepInterval);
        setTimeout(stepClick, stepInterval, --times, stepInterval, clickFn);
    }

    // 预测刷新时间
    function predictDate(date) {
        var YY = date.getFullYear() + '-';
        var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
        //var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        //var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        //var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
        var hh
        if (date.getHours() < 10) {
            hh = 10 + ':';
        }
        else if (date.getHours() < 12) {
            hh = 12 + ':';
        }
        else if (date.getHours() < 14) {
            hh = 14 + ':';
        }
        else if (date.getHours() < 16) {
            hh = 16 + ':';
        }
        else if (date.getHours() < 18) {
            hh = 18 + ':';
        }
        else if (date.getHours() < 20) {
            hh = 20 + ':';
        }
        else if (date.getHours() < 22) {
            hh = 22 + ':';
        }
        else {
            hh = '00:';
            var D = parseInt(DD) + 1;
            DD = (D < 10 ? '0' + D : D);
        }
        var mm = '00:';
        var ss = '00';
        return YY + MM + DD + " " + hh + mm + ss;
    }

    /*开始抢*/
    listenButton.click(function(e) {
        if (sessionStorage.refresh) sessionStorage.removeItem('refresh');
        if (sessionStorage.clickTimes) sessionStorage.removeItem('clickTimes');

//         if (listenButton[0].innerHTML.substring(0, '(σﾟ∀ﾟ)σ'.length) == '(σﾟ∀ﾟ)σ') {
//             listenButton[0].innerHTML = '_(:з」∠)_点我重新开抢';
//             return;
//         }

        let time = timeInput.val();
        let mstime;
        if (isNaN(parseInt(mstimeInput.val()))) {
            if (sessionStorage.mstime) {
                mstime = sessionStorage.mstime;
            }
            else {
                mstime = 0;
            }
        }
        else {
            mstime = parseInt(mstimeInput.val());
            if (mstime != 0) sessionStorage.mstime = mstime;
        }
        if (sessionStorage.mstime && mstime == 0) sessionStorage.removeItem('mstime');
        let lag;
        if (isNaN(parseInt(lagInput.val()))) {
            if (sessionStorage.lag) {
                lag = sessionStorage.lag;
            }
            else {
                lag = 0;
            }
        }
        else {
            lag = parseInt(lagInput.val());
            if (lag > 0) sessionStorage.lag = lag;
        }
        if (sessionStorage.lag && lag == 0) sessionStorage.removeItem('lag');
//        let selector = selectorInput.val();
        let selector;
        if(selectorInput.val() == "") {
            if (sessionStorage.selector) {
                selector = sessionStorage.selector;
            }
            else {
//                 selector = 'body > div.widgets-cover.show > div.cover-content > div > div.footer.trade > a > p';
                selector = '#submitBlock_1 > div > div > div > div:nth-child(3) > div:nth-child(2) > span';
//                 listenButton[0].innerHTML = `请输入抢按钮选择器！`;
//                 return;
            }
        }
        else {
            selector = selectorInput.val();
            sessionStorage.selector = selector;
        }
        let targetTime = Date.parse(new Date(time));
//         let currentTime = Date.now();
//         let timeout = targetTime - mstime - currentTime();
        let timing = targetTime - mstime;
        console.log(targetTime, mstime, lag, selector);
        createWorkerFromExternalURL(countWoker, function (worker) {
            if (!worker) throw Error('Create webworker failed');
            let btn = listenButton[0];
            worker.onmessage = function (event) {
                if (event.data === -1) {
                    sessionStorage.buyNooow = true;
                    btn.disabled = false;
                    btn.innerHTML = `(ง•̀_•́)ง正在刷新页面……`;
//                     stepClick(3, 100, function () {
//                         _$(selector).trigger('click');
//                         fireEvent(document.querySelector(selector), 'click');
//                     });
                    //btn.innerHTML = `抢购结束`;
                    worker.terminate();
                    location.reload();
                    return;
                } else {
                    btn.disabled = true;
                    btn.innerHTML = `(σﾟ∀ﾟ)σ距离开抢还有${Math.ceil(event.data / 1000)}秒`;
                }
            };
//             worker.postMessage(timeout);
            worker.postMessage(timing);
        });
    });

})();
