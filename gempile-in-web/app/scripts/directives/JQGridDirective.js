/*
 * 广州丰石科技有限公司拥有本软件版权2016并保留所有权利。
 * Copyright 2016, Guangzhou Rich Stone Data Technologies Company Limited,
 * All rights reserved.
 */

/**
 * author liangzheng
 * directive 'jqgrid'
 * @export
 * @class JQGrid
 */
export default class JQGridDirective {
    constructor() {
        this.restrict = 'E';
        this.scope = {
            options: '=',
            id: '@',
        };
        this.replace = true;
        this.template = '<div style=" position: relative">\n    <table></table>\n</div>';
    }
    link($scope, iElement, iAttrs) {
        $scope.reloadgrid = function () {
            iElement.children().remove();
            iElement.append("<table id=\'" + iAttrs.id + "table\'></table>\n</div>");

            let griddata = angular.copy($scope.options.griddata);
            if (typeof ($scope.options.shrinkToFit) == 'undefined') {
                $scope.options.shrinkToFit = false;
            }
            $scope.options.obj = iElement.children('table').jqGrid({
                caption:$scope.options.caption,
                datatype: 'local',
                shrinkToFit: $scope.options.shrinkToFit,
                scrollrows: true,
                autoHeight: true,
                colNames: griddata.colnames,
                colModel: griddata.colmodel,
                rowNum: 300,
                onSelectRow: $scope.options.onSelectRow,
                onSortCol: $scope.options.onSortCol,
            });
            for (let i = 0; i <= griddata.data.length; i++) {
                $scope.options.obj.addRowData(i + 1, griddata.data[i]);
            }

            $scope.options.obj.jqGrid('setFrozenColumns');

            /*无数据水印*/
            if (griddata.data.length > 0) {
                //iElement.children('.nodata').hide();
            }
            else {
                //iElement.children('.nodata').show();
            }
            //自适应宽高
            if ($scope.options.gridresize) {
                $scope.options.gridresize($scope.options.obj);
            }
            //不显示水平滚动条
            if($scope.options.xScroll){
                $('#'+iAttrs.id + ' .ui-jqgrid-bdiv').css('overflow-x','hidden');
            }
            //不显示边框
            if($scope.options.showBorder!=undefined&&!$scope.options.showBorder){
                $('#'+iAttrs.id + ' .ui-jqgrid tr.ui-row-ltr td').css('border','none');
            }
            //不显示边框
            if($scope.options.padding!=undefined){
                $('#'+iAttrs.id + ' .ui-jqgrid tr.jqgrow td').css('padding', $scope.options.padding + 'px');
            }
        };
        $scope.reloadgrid();
        $scope.$watch('options.griddata', (newValue, oldValue) => {
            if (newValue && newValue != oldValue) {
                $scope.reloadgrid();
            }
        }, true);

        $(window).resize(() => {
            $(window).unbind('onresize');
            $scope.options.gridresize($scope.options.obj);
            $(window).bind('onresize', this);
        })
    }
    controller($scope) {
        ;
    }
}


