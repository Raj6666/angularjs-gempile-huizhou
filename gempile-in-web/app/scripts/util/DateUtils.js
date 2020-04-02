'use strict';

/**
 * //dates -- 时间差距，0为当前，负数就是之前某天；m判断是返回(2)时间还是(1)日期
 * @param dates
 * @param m
 * @param type type = 0代表开始时间，1结束时间
 * @returns {*}
 */
function getTimeUtil(dates, m) {
	var myDate = new Date();
	// var year = myDate.getYear();        //获取当前年份(2位)
	var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
	var month = myDate.getMonth();       //获取当前月份(0-11,0代表1月)
	var date = myDate.getDate();        //获取当前日(1-31)
	//var day =  myDate.getDay();         //获取当前星期X(0-6,0代表星期天)
	// var time = myDate.getTime();        //获取当前时间(从1970.1.1开始的毫秒数)
	var hour = myDate.getHours();       //获取当前小时数(0-23)
	//var minutes =  myDate.getMinutes();     //获取当前分钟数(0-59)
	//var second =  myDate.getSeconds();     //获取当前秒数(0-59)
	var millisecond = myDate.getMilliseconds();    //获取当前毫秒数(0-999)
	if (dates == 0) {
		if (m == 1) {
			return year + "-" + (month + 1) + "-" + date;
		} else if (2 == m) {
			if ((hour - 1) < 0) {
				return "00:00";
			}
			return hour - 1 + ":00";//等于当前时间
		}
		return year + "-" + (month + 1) + "-" + date + " " + hour + ":00";
	} else {
		var nowDate = year + "/" + (month + 1) + "/" + date + " " + hour + ":00";
		var date = new Date(nowDate);
		var nowTime = date.getTime() + 1000 * 60 * 60 * 24 * dates;
		var resuleDate = new Date(nowTime);
		if (m == 1) {
			return resuleDate.getFullYear() + "-" + (resuleDate.getMonth() + 1) + "-" + resuleDate.getDate();
		}
		else if (m == 2) {
			if ((resuleDate.getHours() - 1) < 0) {
				return "00:00";
			}
			return resuleDate.getHours() + ":00";
		}
		return resuleDate.getFullYear() + "-" + (resuleDate.getMonth() + 1) + "-" + resuleDate.getDate() + " " + resuleDate.getHours() + ":00";
	}
}
/**
 * 日期类型转长整形
 * @param date
 * @returns {number}
 */
function dateToLong(date) {
	return new Date(date).getTime();
}

/**
 * 时间粒定位方法
 * startDate --开始日期
 * endDate -- 结束日期
 * $scope.startTime -- 开始时间
 * $scope.endTime  --- 结束时间
 * $scope.interval --  时间粒
 * $scope.checkmooningAndNight --- 早晚时 (1:早晚时不选择,0早晚时已选择)
 * $scope.moreDayFindType -- 跨天或者多天(interDays:跨天查询,manyDays:多天查询)
 */
//$scope.getInterval = function() {
function getInterval(startDate, endDate, startTime, endTime, interval, checkmooningAndNight, moreDayFindType) {
	var star = startDate + " 00:00:00";
	var end = endDate + " 00:00:00";
	var sDate = new Date(star).getTime();
	var eDate = new Date(end).getTime();
	if (sDate > eDate) {
		// $scope.showTip("开始日期不得晚于结束日期");
		return -1;
	} else if (sDate == eDate) {//日期相等
		if (interval == 5 || interval == 1440) {//     传值时间:20160813 8:25 - 20160813 9:25
            var s1 = startDate + " " + startTime;
            var e1 = endDate + " " + endTime;
			return dateToLong(s1) + "," + dateToLong(e1);
		} else if (interval == 60 && checkmooningAndNight == 1) {//选择相同的日期 小时		早晚时不选择 ---20160813 8:00 - 20160813 9:00
			var s1 = startDate + " " + startTime;
			var e1 = endDate + " " + endTime;
			return dateToLong(s1) + "," + dateToLong(e1);
		} else if (interval == 60 && checkmooningAndNight == 0) {//选择相同的日期 小时	早晚时已选择  //	不选择 ---
			// 20160812 9:00 - 20160812 12:00
			// 20160812 21:00 - 20160813 00:00
            var s1 = endDate + " " + "9:00";
			var e1 = endDate + " " + "12:00";
			var s2 = endDate + " " + "21:00";
			var e2 = endDate + " " + "23:59:59";
			return dateToLong(s1) + "," + dateToLong(e1) + ";" + dateToLong(s2) + "," + dateToLong(e2);
		}
	} else {//开始  早于 结束 (不同日期)
		if (interval == 5 && moreDayFindType == "interDays") {//5分钟不同日期 跨天查询
			var s1 = startDate + " " + startTime;
			var e1 = endDate + " " + endTime;
			return dateToLong(s1) + "," + dateToLong(e1);
		} else if (interval == 5 && moreDayFindType == "manyDays") {//5分钟不同日期 多天查询
			var s1 = startDate + " " + startTime;
			var e1 = startDate + " " + endTime;
			var s2 = endDate + " " + startTime;
			var e2 = endDate + " " + endTime;
			var timeslots = dateToLong(s1) + "," + dateToLong(e1);
			var startLog = dateToLong(s1);
			var endLog = dateToLong(s2);
			var sDate1 = new Date(s1);
			var eDate1 = new Date(e1);
			while (endLog > startLog) {
				sDate1.setDate(sDate1.getDate() + 1);
				eDate1.setDate(eDate1.getDate() + 1);
				startLog = dateToLong(sDate1);
				timeslots = timeslots + ";" + dateToLong(sDate1) + "," + dateToLong(eDate1);
			}
			return timeslots;
		} else if (interval == 60 && checkmooningAndNight == 1 && moreDayFindType == "interDays") {//选择不同的日期 小时		早晚时不选择 跨天查询---20160812 8:00 - 20160813 9:00
			var s1 = startDate + " " + startTime;
			var e1 = endDate + " " + endTime;
			return dateToLong(s1) + "," + dateToLong(e1);
		} else if (interval == 60 && checkmooningAndNight == 1 && moreDayFindType == "manyDays") {//选择不同的日期 小时		早晚时不选择 多天重复查询---20160812 8:00 - 20160813 9:00
			var s1 = startDate + " " + startTime;
			var e1 = startDate + " " + endTime;
			var s2 = endDate + " " + startTime;
			var e2 = endDate + " " + endTime;
			var timeslots = dateToLong(s1) + "," + dateToLong(e1);
			var startLog = dateToLong(s1);
			var endLog = dateToLong(s2);
			var sDate1 = new Date(s1);
			var eDate1 = new Date(e1);
			while (endLog > startLog) {
				sDate1.setDate(sDate1.getDate() + 1);
				eDate1.setDate(eDate1.getDate() + 1);
				startLog = dateToLong(sDate1);
				timeslots = timeslots + ";" + dateToLong(sDate1) + "," + dateToLong(eDate1);
			}
			return timeslots;
		} else if (interval == 60 && checkmooningAndNight == 0) {//选择不同的日期 小时	早晚时已选择 	不选择 ---
			// 20160812 9:00 - 20160812 12:00
			// 20160812 21:00 - 20160813 00:00
			// 20160813 9:00 - 20160813 12:00
			// 20160813 21:00 - 20160814 00:00
            var s1 = startDate + " " + "09:00";
			var e1 = startDate + " " + "12:00";
			var s2 = startDate + " " + "21:00";
			var e2 = startDate + " " + "23:59:59";
            var s3 = endDate + " " + "09:00";
			var e3 = endDate + " " + "12:00";
			var s4 = endDate + " " + "21:00";
			var e4 = endDate + " " + "23:59:59";
			/*  return  dateToLong(s1)+","+ dateToLong(e1)+";"+dateToLong(s2)+","+ dateToLong(e2)+";"
			 +dateToLong(s3)+","+ dateToLong(e3)+";"+dateToLong(s4)+","+ dateToLong(e4);
			 */
			var timeslots = dateToLong(s1) + "," + dateToLong(e1) + ";" + dateToLong(s2) + "," + dateToLong(e2);
			var startLog = dateToLong(s1);
			var endLog = dateToLong(e4);
			var sDate1 = new Date(s1);
			var eDate1 = new Date(e4);

			while (endLog > startLog) {
				var tempDate = '';
				sDate1.setDate(sDate1.getDate() + 1);
				sDate1.setHours(9);
				sDate1.setMinutes(0);
				sDate1.setSeconds(0);
				tempDate = dateToLong(sDate1);
				sDate1.setHours(12);
				sDate1.setMinutes(0);
				sDate1.setSeconds(0);
				tempDate = tempDate + ',' + dateToLong(sDate1);
				sDate1.setHours(21);
				sDate1.setMinutes(0);
				sDate1.setSeconds(0);
				tempDate = tempDate + ';' + dateToLong(sDate1);
				sDate1.setHours(23);
				sDate1.setMinutes(59);
				sDate1.setSeconds(59);
				tempDate = tempDate + ',' + dateToLong(sDate1);
				startLog = dateToLong(sDate1);
				timeslots = timeslots + ";" + tempDate;
			}
			return timeslots;

		} else if (interval == 1440) {//天
			var s1 = startDate + " " + "00:00";
			var e1 = endDate + " " + "23:59:59";
			return dateToLong(s1) + "," + dateToLong(e1);
		}
	}
}
function getSimpleTimeslots(startDate, endDate, startTime, endTime) {

	var s1 = startDate + " " + startTime;
	var e1 = endDate + " " + endTime;
	var ret = dateToLong(s1) + "," + dateToLong(e1);

	console.log("getSimpleTimeslots " + startDate + endDate + startTime + endTime + " = " + ret);

	return ret;
}

function currentTime() {
	var now = new Date();

	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	var day = now.getDate();

	var hh = now.getHours();
	var mm = now.getMinutes();

	var clock = year + "-";

	if (month < 10) clock += "0";
	clock += month + "-";

	if (day < 10) clock += "0";
	clock += day + " ";

	if (hh < 10) clock += "0";
	clock += hh + ":";

	if (mm < 10) clock += '0';
	clock += mm;
	return (clock);
}

function getMaxDate() {
	var clock = currentTime();
	var dt;
	var times = 0;
	dt = $("#d241").val();
	if (dt != '') {
		times = Date.parse(dt.replace(/-/g, '/')) + 6 * 24 * 60 * 60 * 1000;//时间间隔为10天

		if (times - Date.parse(clock.replace(/-/g, '/')) < 0) {
			var d1 = new Date(times);
			var year = d1.getFullYear();
			var month = d1.getMonth() + 1;    //月份以0开头
			var day = d1.getDate();

			var hh = d1.getHours();
			var mm = d1.getMinutes();

			var clock = year + "-";

			if (month < 10) clock += "0";
			clock += month + "-";

			if (day < 10) clock += "0";
			clock += day + " ";

			if (hh < 10) clock += "0";
			clock += hh + ":";

			if (mm < 10) clock += '0';
			clock += mm;

		}
	}
	return clock;
}

function formateMinute(temMin) {
	if (temMin > 0 && temMin < 5) {
		return '00';
	} else if (temMin > 5 && temMin < 10) {
		return '05';
	} else if (temMin > 10 && temMin < 15) {
		return '10';
	} else if (temMin > 15 && temMin < 20) {
		return '15';
	} else if (temMin > 20 && temMin < 25) {
		return '20';
	} else if (temMin > 25 && temMin < 30) {
		return '25';
	} else if (temMin > 30 && temMin < 35) {
		return '30';
	} else if (temMin > 35 && temMin < 40) {
		return '35';
	} else if (temMin > 40 && temMin < 45) {
		return '40';
	} else if (temMin > 45 && temMin < 50) {
		return '45';
	} else if (temMin > 50 && temMin < 55) {
		return '50';
	} else if (temMin > 55 && temMin < 60) {
		return '55';
	} else {
		return temMin;
	}
}

Date.prototype.format = function(format){
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(),    //day
        "h+" : this.getHours(),   //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
        "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
        (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length==1 ? o[k] :
                ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
};

module.exports = {
	getTimeUtil,
	dateToLong,
	getInterval,
	getSimpleTimeslots,
	currentTime,
	getMaxDate,
    formateMinute,
};

