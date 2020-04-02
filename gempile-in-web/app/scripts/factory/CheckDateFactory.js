export default function CheckDateFactory() {

    const utils = {
        dayNum (start, end) {//计算天数方法
            const startTime = new Date(start).getTime();
            const endTime = new Date(end).getTime();
            return Math.floor((endTime - startTime) / (24 * 3600 * 1000));
        },
        showAlert (i, $scope) {//显示提示
            const mainMsg = i === 1 ? '日期' : '时段';
            /*当天为‘多天查询’且 字段要提示为‘时段字段’或 提示为‘时间字段’时就提示*/

            $scope.moreDayFindType !== 'interDays' && i !== 1 || i === 1 ? $scope.alertMsg = '开始' + mainMsg + '不能大于结束' + mainMsg : false;
        },
        getDate (i) {//生成日期方法
            const dateObj = new Date();
            dateObj.setTime(dateObj.getTime() - (24 * 60 * 60 * 1000 * i));//i=0 表示当天，-1表示明天，1表示昨天 以此类推
            return dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dateObj.getDate();
        },
        compareDate (s, e) {//判断日期前后大小
            let start=s;
            let end=e;
            if (start.indexOf(':') > -1 && end.indexOf(':') > -1) {
                /*判断为时段将转为标准date格式用于判断*/
                start = '1980-01-01 ' + start;
                end = '1980-01-01 ' + end
            } else {
                /*判断为日期，可能是查询当天到当天，所加上时段域*/
                start = start + ' 00:00';
                end = end + ' 23:59';
            }
            const startDate = new Date(start).getTime();
            const endDate = new Date(end).getTime();
            return endDate - startDate < 0
        },
    };
    return {
        checkDate ($scope,networkElement) {
            if(networkElement){
                $scope.startDate=$scope.timeConfig[networkElement].startDate;
                $scope.endDate=$scope.timeConfig[networkElement].endDate;
                $scope.startTimeMin=$scope.timeConfig[networkElement].startTimeMin;
                $scope.endTimeMin=$scope.timeConfig[networkElement].endTimeMin;
                $scope.interval=5;
            }
            $scope.alertMsg = '';
            if(!$scope.startDate){
                $scope.startDate=utils.getDate(1);      //未定义开始日期，默认开始日期为昨日日期
            }
            if(!$scope.endDate){
                $scope.endDate=utils.getDate(0);        //未定义结束日期，末日结束日期为今天日期
            }
            if(!$scope.startTimeMin){
                $scope.startTimeMin='00:00';
            }
            if(!$scope.endTimeMin){
                $scope.endTimeMin='23:59';
            }
            if(!$scope.startTime){
                $scope.startTime='00:00';
            }
            if(!$scope.endTime){
                $scope.endTime='23:59';
            }
            const startDate = $scope.startDate;  //已经定义过日期?-:默认昨天日期
            const endDate = $scope.endDate;      //已经定义过日期?-:默认今天日期
            const startTimeMin = $scope.startTimeMin ? $scope.startTimeMin : '';//5分钟-时段
            const endTimeMin = $scope.endTimeMin ? $scope.endTimeMin : '';
            const startTime = $scope.startTime ? $scope.startTime : '';//一小时-时段
            const endTime = $scope.endTime ? $scope.endTime : '';
            const days = utils.dayNum(
                startDate + ' ' + ($scope.interval === 5 ? startTimeMin : ($scope.interval === 60 ? startTime : '00:00')),
                endDate + ' ' + ($scope.interval === 5 ? endTimeMin : ($scope.interval === 60 ? endTime : '23:59'))
            );
            $scope.alertMsg = days > 7 ? '只提供查询7天内的数据' : false;
            switch ($scope.interval) {//根据不同时间颗粒传入不同参数对比
                case 5:
                    utils.compareDate(startTimeMin, endTimeMin) ? utils.showAlert(0, $scope) : false;
                    utils.compareDate(startDate, endDate) ? utils.showAlert(1, $scope) : false;
                    break;
                case 60:
                    utils.compareDate(startTime, endTime) ? utils.showAlert(0, $scope) : false;
                    utils.compareDate(startDate, endDate) ? utils.showAlert(1, $scope) : false;
                    break;
                case 1440:
                    utils.compareDate(startDate, endDate) ? utils.showAlert(1, $scope) : false;
                    break;
                default:
                    break;
            }

            if(networkElement){

                return $scope.alertMsg;
            }else {
                return !$scope.alertMsg;
            }
        },
        getBusyTime(){
            /*此方法用于如果需求改变的早晚忙时的时间，可直接在此处改，+ 预留重构DateUtils.getInterval方法用到*/
            const morningTime = '09:00-11:59';
            const nightTime = '21:00-23:59';
            const mornTimeArray = morningTime.split('-');
            const nightTimeArray = nightTime.split('-');
            const reTimeObj = {
                'morningTime': morningTime,
                'nightTime': nightTime,
                'morningTimeStart': mornTimeArray[0],
                'morningTimeEnd': mornTimeArray[1],
                'nightTimeStart': nightTimeArray[0],
                'nightTimeEnd': nightTimeArray[1],
            };
            return reTimeObj;
        },
    };
}