/*
 * 广州丰石科技有限公司拥有本软件版权2016并保留所有权利。
 * Copyright 2016, Guangzhou Rich Stone Data Technologies Company Limited,
 * All rights reserved.
 */

/**
 * author gaoyanlong
 * directive 'popover'
 * @export
 * @class Popover
 */
export default class PopoverDirective {

    constructor() {
        this.restrict = 'A';
        this.$scope = {
            relativeDimensions:'=',
            title:'@',
            options: '=',
            id: '@',
        };
        this.replace = true;
    }

    link($scope, iElement, iAttrs) {
        let popOverContent;
        let popoverContent =()=> {
            return '<div><div align="left" style="width: 100%; padding: 0 10px 0 10px"' +
                'ng-repeat="thisDimension in relativeDimensions track by $index">' +
                '<input type="checkbox" ng-bind="thisDimension.name" ng-model="isSelectedDrillDownDimension[$index]"/>' +
                '<span ng-bind="thisDimension.value"></span>' +
                '</div>' +
                '<div align="center" style="margin-top:10px;">' +
                '<button class="btn btn-primary btn-sm"' +
                'ng-click="grid.appScope.drillDownAnalysis(row.entity.dimensions,row.entity.networkElementIds)">查询</button>' +
                '<button class="btn btn-danger btn-sm" ng-click="grid.appScope.hideRelativePanel()">取消</button>' +
                '</div></div>';
        };
        if ($scope.relativeDimensions) {
            popOverContent = $compile(popoverContent())($scope);
            var options = {
                content: popOverContent,
                placement: "bottom",
                html: true,
                title: $scope.title
            };
            $(iElement).popover(options);
        }
    }
}



