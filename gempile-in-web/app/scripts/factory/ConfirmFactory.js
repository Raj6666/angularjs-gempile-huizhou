/**
 * Created by Administrator on 2017/3/31 0031.
 */
export default function ConfirmFactory($compile) {
    const showConfirm=function ($scope) {
        let html=
            $(
                '<div id="common_confirm_model"  class="modal"> ' +
                '<div class="modal-dialog modal-sm">' +
                '<div class="modal-content">' +
                '<div class="modal-header">' +
                '<h5 class="modal-title">' +
                '<i class="fa fa-exclamation-circle"></i>' +
                '<span class="title">{{confrimTitle}}</span>' +
                '</h5>' +
                '<button type="button" class="close" data-dismiss="modal" ng-click="cencleClick()">' +
                '<span aria-hidden="true">&times;</span>' +
                '<span class="sr-only" >Close</span>' +
                '</button>' +
                '</div>' +
                '<div class="modal-body small"> ' +
                '<p ><span class="message">{{confrimContent}}</span></p> ' +
                '</div>' +
                '<div class="modal-footer" >' +
                '<button type="button" class="btn btn-primary ok" data-dismiss="modal" ng-click="okClick()">确定</button> ' +
                '<button type="button" class="btn btn-default ok" ng-click="cencleClick()" ng-hide="isAlert" data-dismiss="modal">取消</button> ' +
                '</div>'+'</div>'+ '</div>'+'</div>'
            );
        let divObj=angular.element('.content');
        $compile(html)($scope).appendTo(divObj[0]);
        $('#common_confirm_model').modal('show');
        // document.getElementById('common_confirm_model').style.display='inline'
    };
    return {
        $Close(){
            $('#common_confirm_model').modal('hide');
            // document.getElementById('common_confirm_model').style.display='none'
        },
        $Open($scope,callback,isAlert){
            $scope.isAlert=!!isAlert;
            $scope.confrimTitle=!!$scope.confrimTitle?$scope.confrimTitle:'提示';
            showConfirm($scope);
            $scope.okClick=function () {
                if (!isAlert){callback.ok()}
                $('#common_confirm_model').modal('hide')
            };
            $scope.cencleClick=function () {
                if(!callback.cancel){
                    $('#common_confirm_model').modal('hide')
                }else {
                    callback.cancel();
                }
            }
        },
    }
}
ConfirmFactory.$inject=['$compile'];