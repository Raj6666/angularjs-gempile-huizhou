export function isPlainObject(value) {
    return !!value && Object.prototype.toString.call(value) === '[object Object]';
}

export function isArray(value) {
    return value instanceof Array;
}

export function isNumber(value) {
    return !!value && Object.prototype.toString.call(value) === '[object Number]';
}

export function isString(value) {
    return !!value && Object.prototype.toString.call(value) === '[object String]';
}

export function isFunction(value) {
    return !!value && Object.prototype.toString.call(value) === '[object Function]';
}

export function formatTime (val, format) {
    var time = new Date(val);

    var weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    var o = {
        "M+": time.getMonth() + 1, //月份
        "d+": time.getDate(), //日
        "H+": time.getHours(), //小时
        "m+": time.getMinutes(), //分
        "s+": time.getSeconds(), //秒
        "q+": Math.floor((time.getMonth() + 3) / 3), //季度
        "S": time.getMilliseconds(), //毫秒
        "w": weekDay[time.getDay()]
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1,
                (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return format;
}

export function isFloat(n) {
    return ~~n !== n;
}

/**
 * 大于100000000的特殊处理
 */
export function formatNum(val) {
    if (!isNumber(val)) return '';
    return val > 100000000 ? (val / 100000000).toFixed(2) + '亿' : (isFloat(val) ? val.toFixed(2) : val);
}