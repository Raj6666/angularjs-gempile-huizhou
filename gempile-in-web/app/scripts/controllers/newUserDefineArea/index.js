import swal from '../../util/swalConfig';
import APIS from '../../configs/ApisConfig';
import {AvgIcon, setAvgText} from './avg.help';
import AllIndicators from '../../data/UserDefinedAreaAnalysisDataConfig';
import { formatNum } from '../../util/tools';

let _parent = null;
const cityOid = 860752; // 地市ID
const allIndicators = AllIndicators.indicatorsName13.concat(AllIndicators.indicatorsName14);
const defaultTemplateIndict = [
	{indicatorIndex: 22},
	{indicatorIndex: 3},
	{indicatorIndex: 2},
	{indicatorIndex: 5},
	{indicatorIndex: 4},
	{indicatorIndex: 7},
	{indicatorIndex: 6},
	{indicatorIndex: 9},
	{indicatorIndex: 8},
	{indicatorIndex: 13},
	{indicatorIndex: 11},
	{indicatorIndex: 12},
	{indicatorIndex: 14}
];

export class NewUserDefineArea {
	constructor(params) {
		_parent = params[0];
		this.templateHttp = params[4];
		this.defaultTemplate = [{
			name: '默认模板',
			id: 'default',
			showDelete: false,
			datas: [
				{id: 1, name: '页面显示时长', indicatorId: '', indicatorIndex: 13, avg: AvgIcon.h},
				{id: 2, name: '页面显示时长5s以上占比', indicatorId: '', indicatorIndex: 11, avg: AvgIcon.h},
				{id: 3, name: '页面显示成功率', indicatorId: '', indicatorIndex: 12, avg: AvgIcon.h},
				{id: 4, name: '应用商店下载速率小于500kbps次数占比', indicatorId: '', indicatorIndex: 14, avg: AvgIcon.h}
			]
		}];
		this.defaultTemplateId = 'default';
		this.keyIndicatorData = []; // 关键指标数据
		this.defineIndicatorData = null; // 自定义模板指标数据
		this.appType = 41;
		this.templateOptions = JSON.parse(JSON.stringify(this.defaultTemplate));
		this.template = JSON.parse(JSON.stringify(this.defaultTemplate));
		this.selTemplate = [];
		const allSelectBox = [];
		this.selectedArr = [];
		this.templateName = '';
		this.templateType = null;
		for (let i = 1; i < 14; i++) {
			allSelectBox.push({
				id: i,
				value: '',
				avg: AvgIcon.l,
				//indicators: _parent.indicators13
			});
		}
		this.selectBox = [allSelectBox.slice(0, 8), allSelectBox.slice(8, 12), allSelectBox.slice(12, 13)];
		this.templateEvents = {
			onItemSelect: (item) => {
				//console.log(this.template);
			},
			onDeleteItem: (item) => {
				swal.confirm('确定要删除模板'+item.name+'吗？')
				.then(res => {
					return this.templateHttp.delete(item.id);
				})
				.then(res => {
					// 删除成功
					swal.alert('删除成功');
					this.template = [];
					this.getTemplates();
				})
				.catch(err => {
					console.log(err);
				});
			}
		};
		this.getTemplates();
		this.renderDefaultUI();
	}

	setTemplate() {
		const platSelectBox = Array.prototype.concat.apply([], this.selectBox),
			values = platSelectBox.map(sel => {
				return sel.value;
			});
		const templateNames = this.templateOptions.map(item => item.name);
		if (this.templateName === '') {
			swal.alert('请输入模板名称');
			return false;
		}

		if (values.indexOf('') > -1) {
			swal.alert('请选择13个指标');
			return false;
		}

		if (templateNames.indexOf(this.templateName) > -1) {
			swal.alert('已存在该模板名称，请重新输入');
			return false;
		}

		this.templateHttp.save(this.getTemplateIndicator(platSelectBox))
		.then(res => {
			this.getTemplates();
		});
		this.showTemplateModal(false);
	}

	showTemplateModal(isShow) {
		const $modal = $('#presetModal');
		isShow ? $moda.modal('show') : $modal.modal('hide');
	}

	// 必须有返回值
	searchData() {
		if (!this.template.length) {
			swal.alert('请选择模板');
			return false;
		}
		this.templateType = this.template[0].id === this.defaultTemplateId ? 'default' : 'define';
		this.selTemplate = JSON.parse(JSON.stringify(this.template));
		this.templateType === 'define' && this.getAppApiData(this.template[0].id);
		this.setAreaChart();
		return true;
	}

	getKeyIndicatorArr() {
		if (!this.selTemplate.length || !this.template.length) {
			return [];
		} else {
			return this.selTemplate[0].id === this.defaultTemplateId ? this.selTemplate[0].datas.slice(0, 4) : this.selTemplate[0].datas.slice(8, 12);
		}
	}

	setAreaChart() {
		this.template[0].id === this.defaultTemplateId ? this.setAreaChartDefault() : this.setAreaChartDefine();
	}

	// 默认业务指标
	setAreaChartDefault() {
		_parent.areaOption.title.text = '流量（GB）';
	}

	// 自定义业务指标
	setAreaChartDefine() {
		const filterItem = this.filterIndicator(this.template[0].datas[12]);
		_parent.areaOption.title.text = filterItem ? filterItem.name + `(${filterItem.unit})` : '';
		this.appType = this.template[0].datas[12].indicatorIndex;
	}

	setAreaOption(params, percentData) {
		if (this.template[0].id === this.defaultTemplateId) {
			let res = _parent.selectedTime + '<br>' + '业务大类：' + params[0].name + '<br>' + '流量：' + params[0].data + 'GB' + '<br>' + '占比：' + percentData[params[0].dataIndex] + '%';
			return res;
		} else {
			const filterItem = this.filterIndicator(this.template[0].datas[12]);
			return _parent.selectedTime + '<br>' + '业务大类：' + params[0].name + '<br>' + filterItem.name + '：' + params[0].data + filterItem.unit;
		}
	}

	setAvgText(item) {
		return setAvgText(item);
	}

	getTemplateIndicator(arr) {
		return arr.map(item => {
			return {
				cityOid,
				name: this.templateName,
				indicatorId: item.id,
				indicatorIndex: item.value
			};
		});
	}

	getTemplates() {
		this.templateOptions = [];
		this.templateHttp.getTemplates()
		.then(res => {
			this.templateOptions = this.defaultTemplate.concat(res) || [];
			_parent.$apply();
		});
	}

	// 获取自定义模板业务指标数据
	getAppApiData(templateId) {
		this.templateHttp.getDateByTemplateId({
			timeSlot: new Date(_parent.selectedTime.replace(/-/g, '/')).getTime(),
			areaName: _parent.selectOuterAreaName,
			timeInterval: _parent.hourParticles,
			cityOid:  _parent.cityId,
			templateId
		})
		.then(res => {
			this.defineIndicatorData = res;
			this.keyIndicatorData = [res[9], res[10], res[11], res[12]];
			_parent.$apply(); // 强制更新数据
		});
	}

	formatIndicatorData(index, item) {
		if (!this.defineIndicatorData) return {};
		const filterItem = this.filterIndicator(item);
		const isGood = this.defineIndicatorData[item.indicatorId]['gemUDAExamKpi'] > this.defineIndicatorData[item.indicatorId]['gemCityExamKpi'];
		const level =  filterItem.opt === 'h' ? (isGood ? 'h' : 'ml') : (isGood ? 'mh' : 'l');
		const gemUDAExamKpiVal = formatNum(this.defineIndicatorData[item.indicatorId]['gemUDAExamKpi']),
		gemCityExamKpiVal = formatNum(this.defineIndicatorData[item.indicatorId]['gemCityExamKpi']);

		return filterItem ? Object.assign(filterItem, {
			gemUDAExamKpi: (gemUDAExamKpiVal || '--') + filterItem.unit,
			gemCityExamKpi: (gemCityExamKpiVal || '--') + filterItem.unit,
			avg: AvgIcon[level]
		}) : {};
	}

	renderDefaultTemplate(data, cityData) {
		this.template[0].id === this.defaultTemplateId && (this.keyIndicatorData = [
			{gemUDAExamKpi: data.pageDisplayAvgDuration, gemCityExamKpi: cityData.pageDisplayAvgDuration},
			{gemUDAExamKpi: data.pageDisplayDurationRatio, gemCityExamKpi: cityData.pageDisplayDurationRatio},
			{gemUDAExamKpi: data.pageDisplaySuccessRate, gemCityExamKpi: cityData.pageDisplaySuccessRate},
			{gemUDAExamKpi: data.appStoreDlRate500KbRatio, gemCityExamKpi: cityData.appStoreDlRate500KbRatio}
		]);
	}

	tabIndicator(index, item) {
		let url = APIS.userDefinedArea.tonghuanbiAll;
		let param = {
			timeInterval: _parent.hourParticles,
			time: new Date(_parent.selectedTime.replace(/-/g, '/')).getTime(),
			area: _parent.selectOuterAreaName,
			selectId: index+1,
			cityOid: _parent.cityId,
			templateId: this.template[0].id
		};
		_parent.setOption(url, param, this.formatIndicatorData(index, item).name);
	}

	filterIndicator(item) {
		if (!item.indicatorIndex) return false;
		return allIndicators.filter(indicator => {
            return indicator.value === item.indicatorIndex;
		})[0];
	}

	getAppTypeKpiData(name) {
		let url = APIS.userDefinedArea.appTypeTonghuanbi;
		let param = {
			timeInterval: _parent.hourParticles,
			time: new Date(_parent.selectedTime.replace(/-/g, '/')).getTime(),
			area: _parent.selectOuterAreaName,
			selectId: 13,
			cityOid: _parent.cityId,
			templateId: this.template[0].id,
			appTypeName: name,
			appSubTypeName: '全部'
		};
		_parent.setOption(url, param, name + '类型' + this.filterIndicator(this.template[0].datas[12]).name);
	}

	// 自定义同环比
	setCompareConfig(monthConfig, yearConfig, res, param) {
		//if (this.template[0].id === this.defaultTemplateId) return;
		const isDefault = this.template[0].id === this.defaultTemplateId;
		const provHuanbiData = res.provHuanbi || [],
		cityHuanbiData = res.cityHuanbi || [],
		provTongbiData = res.provTongbi || [],
		cityTongbiData = res.cityTongbi || [],
		getSeries = (arr) => arr.map(item => item.value);

		const provHuanbiSeries = getSeries(provHuanbiData),
		provTongbiSeries = getSeries(provTongbiData),
		cityHuanbiSeries = getSeries(cityHuanbiData),
		cityTongbiSeries = getSeries(cityTongbiData);

		const indict = isDefault ? defaultTemplateIndict[param.selectId] : this.template[0].datas[param.selectId-1]
		const fn = () => {
			yearConfig.series[1].data = cityTongbiSeries;
			yearConfig.series[2].data = provTongbiSeries;
			yearConfig.legend.data = ['区域', '全市', '全省'];
			monthConfig.series[1].data = cityHuanbiSeries;
			monthConfig.series[2].data = provHuanbiSeries;
			monthConfig.legend.data = ['区域', '全市', '全省'];
		};
		const fnOnlyArea = () => {
			yearConfig.legend.data = ['区域'];
			monthConfig.legend.data = ['区域'];
			yearConfig.series[1].data = [];
			yearConfig.series[2].data = [];
			monthConfig.series[1].data = [];
			monthConfig.series[2].data = [];
		};
		if (!indict) {
			fnOnlyArea();
			return false;
		}

		const item = this.filterIndicator(indict);
		if (!item.yearAndMonth) {
			fnOnlyArea();
		} else {
			fn();
		}

	}

	setProgressStyle(index, item) {
		const filterItem = this.filterIndicator(item);
		const unit = filterItem.unit;
		if (this.defineIndicatorData && unit === '%') {
			const val = this.defineIndicatorData[item.indicatorId]['gemUDAExamKpi'];
			return val ? val + '%' : 'auto';
		}
		return 'auto';
	}

	resetTemplate() {
		this.templateName = '';
		const platSelectBox = Array.prototype.concat.apply([], this.selectBox);
		platSelectBox.map(item => {
			item.value = '';
		});
	}

	setDefaultTemplateIcon(index, key) {
		const filterItem = this.filterIndicator(defaultTemplateIndict[index]),
		areaData = _parent[key],
		cityData = _parent[key+'_City'],
		isGood = areaData > cityData,
		level = filterItem.opt === 'h' ? (isGood ? 'h' : 'ml') : (isGood ? 'mh' : 'l');
		return AvgIcon[level];
	}

	setDefaultTemplateLevelText(key) {
		return _parent[key] > _parent[key+'_City'] ? '高于' : '低于';
	}

	renderDefaultUI() {
		$(function() {
			$('.progressCharts .value').hover(function(e) {
				$(this).parent().find('.hoverContainer').css('display', 'flex');
			}, function() {
				$(this).parent().find('.hoverContainer').css('display', 'none');
			});
			$('.progressCharts .icon img').hover(function(e) {
				$(this).parent().find('.imgHoverContainer').css('display', 'flex');
			}, function() {
				$(this).parent().find('.imgHoverContainer').css('display', 'none');
			});
		});
	}
}