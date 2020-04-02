'use strict';

Array.prototype.remove = function(val) {
    let index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

Array.prototype.del = function(value,key){//根据对象的某个Key value去删除整个对象,没传入key值默认为id
   let delKey=key;
   if(!delKey){
       delKey='id';
   }
   const filter=obj => {
        return obj[delKey] == value;
    };
    let idx = filter;
    for(let i=0;i<this.length;i++){
        if(filter(this[i],i)) {
            idx = i
        }
    }
    this.splice(idx,1)
};

//根据数据长度动态返回echarts默认zoom长度
const getPercent = function getPercent(dataList) {
	if (dataList.length < 30) {
		return 100;
	}
	if (dataList.length < 100) {
		return 30;
	}
	if (dataList.length < 200) {
		return 15;
	}
	if (200 < dataList.length && dataList.length <= 500) {
		return 6;
	}
	if (500 < dataList.length && dataList.length < 1000) {
		return 3;
	}
	if (1000 < dataList.length && dataList.length < 1500) {
		return 0.2;
	}
	if (dataList.length > 1500) {
		return 0.001;
	}
};

//数值小数精确到两位
const formateNumber = function formateNumber(num) {
    let i = 0;
    if (isNumber(num) || isNaN(num)) {
        return num;
    }
	if (null == num || "" == num || typeof (num) == "undefined") {
		return "-"
    }
	num = Number(num).toFixed(2);
	return num;
};

//流量单位转换
const flowUnit = function flowUnit(num) {
    let unit = ['MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'BB'];
    let i = 0;
    if (null == num || "" == num || typeof (num) == "undefined") {
        return "-"
    }
    while (Number(num).toFixed(0).length > 5 && i<7) {
        num = Number(num) / 1024;
        i++;
    }
    num = Number(num).toFixed(2) + unit[i];
    return num;
};

//时间单位转换
const timeUnit = function timeUnit(num) {
    let unit = ['ms', 's', 'min', 'h'];
    let i = 0;
    if (null == num || "" == num || typeof (num) == "undefined") {
        return "-"
    }
    while (Number(num).toFixed(0).length > 5 && i<4) {
        if (i==0) {
            num = Number(num) / 1000;
            i++;
        } else {
            num = Number(num) / 60;
            i++;
        }

    }
    num = Number(num).toFixed(2) + unit[i];
    return num;
};

//验证正整数
const isNumber = function isNumber(oNum) {
	if (!oNum) {
		return false;
	}

	var strP = /^-?\d+$/; //正整数

	if (!strP.test(oNum)) return false;

    return true;
};
module.exports = {
	getPercent,
	formateNumber,
    flowUnit,
    timeUnit
};