/**
 * Created by richstone on 2017/12/27.
 */
'use strict';

import APIS from '../configs/ApisConfig';
import Flatpickr from 'flatpickr';
import Loading from '../custom-pulgin/Loading';
import swal from 'sweetalert2';
import {NOW, ONE_HOUR_MS, ONE_DAY_MS} from '../constants/CommonConst';
//require('../../../node_modules/flatpickr/dist/themes/material_red.css');

/**
 * ControlPanelController
 *
 * @export
 * @param $scope
 * @param $filter
 * @param HttpRequestService
 */
export default function ComplaintDataEntryController($scope, $filter, HttpRequestService) {

	/**客户以及基站投诉日期*/
	let customerDate = null;
	let baseStationDate = null;
	let customerDateConversion = [];
	let baseStationDateConversion = [];

	/**获取客户以及基站投诉日期url*/
	let url1 = APIS.complaintDataEntry.getDateOfCustomerComplainData;
	let url2 = APIS.complaintDataEntry.getDateOfBaseStationComplainData;

	/**获取客户投诉日期*/
	const getCustomerComplaintDate = () => {
		HttpRequestService.post(url1, null, null, response => {
			customerDate = response.sort();
			customerDateConversion = [];
			for (let i = 0; i < customerDate.length; i++) {
				let arr = customerDate[i].split('-').join('');
				customerDateConversion.push(arr)
			}
			customerFlatpickr();
		});
	};

	/**获取基站投诉日期*/
	const getBaseStationComplaintDate = () => {
		HttpRequestService.post(url2, null, null, response => {
			baseStationDate = response.sort();
			baseStationDateConversion = [];
			for (let i = 0; i < baseStationDate.length; i++) {
				let arr = baseStationDate[i].split('-').join('');
				baseStationDateConversion.push(arr)
			}
			baseStationFlatpickr();
		})
	};

	/**初始化客户投诉时间插件*/
	const customerFlatpickr = () => {
		let startDatePicker;
		let testConfig = {
			inline: true,
			mode: 'multiple',
			defaultDate: customerDate,
		};
		$(document).ready(() => {
			startDatePicker = new Flatpickr(document.getElementById('customerDate'), testConfig);
			startDatePicker.jumpToDate(customerDate.pop())
		})
	};

	/**初始化基站投诉时间插件*/
	const baseStationFlatpickr = () => {
		let startDatePicker;
		let testConfig = {
			inline: true,
			mode: 'multiple',
			defaultDate: baseStationDate,
		};
		$(document).ready(() => {
			startDatePicker = new Flatpickr(document.getElementById('baseStationDate'), testConfig);
			startDatePicker.jumpToDate(baseStationDate.pop());
		})
	};

	/**打开文件夹*/
	$('#customerBtn').click(function () {
		clearFileInput('customer_file');
		document.getElementById("customer_file").click();
	});
	$('#baseStationBtn').click(function () {
		clearFileInput('baseStation_file');
		document.getElementById("baseStation_file").click();
	});

	let customerUrl = APIS.complaintDataEntry.importCustomerComplaintFile;
	let baseStationUrl = APIS.complaintDataEntry.importBaseStationComplaintFile;

	/** 上传文件前校验文件 */
	const checkUploadFiles = (fileId, url, containerId, dateArr,type) => {
		let fileObj = document.getElementById(fileId).files;
		if (fileObj.length <= 0) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请选择文件!',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}
		for (let i = 0; i < fileObj.length; i++) {
			let fileType = fileObj[i].name.substring(fileObj[i].name.lastIndexOf("."), fileObj[i].name.length);
			if (fileType != ".csv") {
				swal({
					showCloseButton: true,
					title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
					text: '导入文件类型不对!',
					allowOutsideClick: false,
					confirmButtonText: '确定',
					confirmButtonClass: 'sure-class',
				});
				return;
			}
		}

		for (let i = 0; i < fileObj.length; i++) {
			if (fileObj[i].name.indexOf('-') <= -1) {
				swal({
					showCloseButton: true,
					title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
					text: '文件名格式有误!',
					allowOutsideClick: false,
					confirmButtonText: '确定',
					confirmButtonClass: 'sure-class',
				});
				return;
			}
		}

		for (let i = 0; i < fileObj.length; i++) {
			if (fileObj[i].name.indexOf('~') <= -1) {
				let date1 = fileObj[i].name.substr(fileObj[i].name.indexOf('-') + 1, 8);
				if (!(/\d{8}/.test(date1))) {
					swal({
						showCloseButton: true,
						title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
						text: '文件名格式有误!',
						allowOutsideClick: false,
						confirmButtonText: '确定',
						confirmButtonClass: 'sure-class',
					});
					return;
				}
			} else {
				let date2 = fileObj[i].name.substr(fileObj[i].name.indexOf('-') + 1, 17);
				if (!(/\d{8}~\d{8}/.test(date2))) {
					swal({
						showCloseButton: true,
						title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
						text: '文件名格式有误!',
						allowOutsideClick: false,
						confirmButtonText: '确定',
						confirmButtonClass: 'sure-class',
					});
					return;
				}
			}
		}

		if(type=='baseStation'){
			for (let i = 0; i < fileObj.length; i++) {
				if (fileObj[i].name.indexOf('~') > -1) {
					swal({
						showCloseButton: true,
						title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
						text: '基站投诉不能上传多天数据!',
						allowOutsideClick: false,
						confirmButtonText: '确定',
						confirmButtonClass: 'sure-class',
					});
					return;
				}
			}
		}

		if(fileObj.length>1){
			for (let i = 0; i < fileObj.length; i++) {
				if (fileObj[i].name.indexOf('~') > -1) {
					swal({
						showCloseButton: true,
						title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
						text: '单文件包含多天数据时不能上传多个文件!',
						allowOutsideClick: false,
						confirmButtonText: '确定',
						confirmButtonClass: 'sure-class',
					});
					return;
				}
			}
		}

		let fileSize = 0;
		for (let i = 0; i < fileObj.length; i++){
			fileSize += fileObj[i].size;
		}
		if (fileSize > 50 * 1024 * 1024) {
			swal({
				showCloseButton: true,
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '请上传小于50M的文件！',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
			});
			return;
		}

		let myForm = new FormData();
		$.each(fileObj, (index, value) => {
			myForm.append('file', value);
		});

		if (checkExistFile(fileObj, dateArr)) {
			swal({
				title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
				text: '导入的数据部分已存在，是否覆盖所有数据？',
				allowOutsideClick: false,
				confirmButtonText: '确定',
				confirmButtonClass: 'sure-class',
				showCancelButton: true,
				cancelButtonText: '取消',
				cancelButtonClass: 'cancel-class',
			}).then(() => {
				uploadFile(url, myForm,type);
				clearFileInput(fileId);
			}, () => {
				clearFileInput(fileId);
			});
		} else {
			uploadFile(url, myForm,type);
			clearFileInput(fileId);
		}
	};

	/** 检查文件是否已存在 */
	const checkExistFile = (fileObj, dateArr) => {
		for (let i = 0; i < fileObj.length; i++) {
			if (fileObj[i].name.indexOf('~') <= -1) {
				let importDate = fileObj[i].name.substr(fileObj[i].name.indexOf('-') + 1, 8);
				//console.log(dateArr, importDate);
				if (dateArr.indexOf(importDate) > -1) {
					return true;
				}
			} else {
				let startDate = fileObj[i].name.substr(fileObj[i].name.indexOf('-') + 1, 8);
				let endDate = fileObj[i].name.substr(fileObj[i].name.indexOf('~') + 1, 8);
				for (let j = 0; j < dateArr.length; j++) {
					if (dateArr[j] >= startDate && dateArr[j] <= endDate) {
						return true;
					}
				}
			}
		}
	};

	/** 上传文件 */
	const uploadFile = (url, myForm,type) => {
		$.ajax({
			url: url,
			data: myForm,
			type: 'post',
			dataType: 'json',
			cache: false,//上传文件无需缓存
			processData: false,//用于对data参数进行序列化处理 这里必须false
			contentType: false, //必须
			success: function (msg) {
				if (msg > 0) {
					swal({
						showCloseButton: true,
						title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
						text: '导入成功!',
						allowOutsideClick: false,
						confirmButtonText: '确定',
						confirmButtonClass: 'sure-class',
					});
				} else {
					swal({
						showCloseButton: true,
						title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
						text: '导入失败!',
						allowOutsideClick: false,
						confirmButtonText: '确定',
						confirmButtonClass: 'sure-class',
					});
				}
				if(type=='customer'){
					getCustomerComplaintDate();
				}else if(type=='baseStation'){
					getBaseStationComplaintDate();
				}
			},
			error: function (e) {
				swal({
					showCloseButton: true,
					title: '<div id="alert-title" style="font-size:26px">提&nbsp;示</div>',
					html: '导入失败<br>' + '失败原因：' + e.responseJSON.errorMessage,
					//html: '导入失败',
					allowOutsideClick: false,
					confirmButtonText: '确定',
					confirmButtonClass: 'sure-class',
				});
			},
		})
	};

	/** 清空input文件 */
	const clearFileInput = fileId => {
		let file = $('#' + fileId);
		file.after(file.clone().val(""));
		file.remove();
	};

	/** 导入客户投诉文件点击事件 */
	$('#customer_upload').click(() => {
		checkUploadFiles('customer_file', customerUrl, 'customer_complaints', customerDateConversion,'customer');
	});

	/** 导入基站投诉文件点击事件 */
	$('#baseStation_upload').click(() => {
		checkUploadFiles('baseStation_file', baseStationUrl, 'baseStation_complaints', baseStationDateConversion,'baseStation');
	});

	/** 初始化加载Controller */
	const initController = () => {
		customerFlatpickr();
		baseStationFlatpickr();
		getCustomerComplaintDate();
		getBaseStationComplaintDate();
	};
	initController();

}

ComplaintDataEntryController.$inject = ['$scope', '$filter', 'HttpRequestService'];