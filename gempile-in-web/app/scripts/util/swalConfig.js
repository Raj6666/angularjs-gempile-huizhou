import swal from 'sweetalert2';

export default {
	alert(text) {
		swal({
			showCloseButton: true,
			title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
			text,
			allowOutsideClick: false,
			confirmButtonText: '确定',
			confirmButtonClass: 'sure-class',
		}).then(res => {
            // console.log(res);
        });
	},
	confirm(text) {
		return swal({
			title: '<div id="alert-title" style="font-size:26px">温馨提示</div>',
			text,
			showCancelButton: true,
			showCloseButton: true,
			confirmButtonText: '确定',
			cancelButtonText: '取消',
		});
	}
};