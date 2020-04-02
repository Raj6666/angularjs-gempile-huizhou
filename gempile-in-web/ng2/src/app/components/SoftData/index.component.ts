import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, Injectable, Renderer2} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Util } from '../../services/util.service';
import { SoftDataeIndexApi } from './api.service';
import { MapApi } from './map.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import {NzMessageService} from "ng-zorro-antd";
import {SoftDataConst} from '../../consts/softDataModuleConst';
import urls from '../../urls/index';
import {environment} from "../../../environments/environment";
import * as moment from 'moment';

declare let document;

@Component({
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  providers: [SoftDataeIndexApi, MapApi, SoftDataComponent ]
})

@Injectable()
export class SoftDataComponent implements OnInit, AfterViewInit {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('f_type') f_type_element: ElementRef;
  @ViewChild('rowSelectionTable') rowSelectionTableElement: ElementRef;
  @ViewChild('ajaxTable') ajaxTableElement: ElementRef;
  constructor(
    private searchFormBuild: FormBuilder,
    private api: SoftDataeIndexApi,
    private util: Util,
    private map: MapApi,
    private el: ElementRef,
    private render: Renderer2,
    private message: NzMessageService,
    private http: HttpClient
  ) { }
  // 下拉框信息
  questionTypeList = SoftDataConst.questionTypeList;
  coverageDomainList = SoftDataConst.coverageDomainList;
  // 表格信息
  displayData: Array<{ name: string; age: number; address: string; checked: boolean }> = [];
  coverageAreaDataSet = [];
  coverageAreaPageIndex = 1;
  coverageAreaPageSize = 10;
  coverageAreaLoading = true;

  coverageCellPairDataSet = [];
  coverageCellPairPageIndex = 1;
  coverageCellPairPageSize = 10;
  coverageCellPairLoading = true;

  total = 1;
  indeterminate = false;
  sortValue = null;
  sortKey = null;
  // 选择下拉框绑定的数据
  questionType =  this.questionTypeList[0];
  coverageDomain = this.coverageDomainList[0];
  selectedTime = null;
  // FDE频小区鼠标移动显示文字
  fBlueCicle = false;
  dBlueCicle = false;
  eBlueCicle = false;
  showRanging = false;
  showPositioning = false;
  topShowSwitchText = false;
  bottomShowSwitchText = true;
  showTable = false;
  topShowTable = false;
  bottomShowTable = true;
  // FDE频小区鼠标移动颜色变灰
  FGreyCicle = false;
  DGreyCicle = false;
  EGreyCicle = false;
  // FDE频小区鼠标滑动显示
  fChannelHoverText = '不显示F频小区';
  dChannelHoverText = '不显示D频小区';
  eChannelHoverText = '不显示E频小区';
  judgeText = SoftDataConst.judgeConditions[1];
  // 表格覆盖小区按钮
  coverageArea = '弱覆盖小区';
  coveredCellPair = '重叠覆盖小区对';
  showCoverCellPair = false;
  // 覆盖小区表格与覆盖小区组表格显示
  showCoverageAreaTable = true;
  showCoverageCellPairTable = false;
  // 表头数据
  tableHeader = SoftDataConst.softMiningInfoTableHeader.弱覆盖小区;
  cellPairTableHeader = SoftDataConst.softMiningInfoTableHeader.重叠覆盖小区对;
  // 表格查询参数对象
  getTableDataParams = {
    'timeSlots': null,
    'area': null,
    'selectType': null,
    'pageIndex': null,
    'pageSize': null,
    'cityOid' : null,
  };
  // 表格导出参数对象
  exportTableDataParams = {
    'timeSlots': null,
    'area': null,
    'selectType': null,
    'fileName': null,
    'pageIndex': null,
    'pageSize': null,
    'cityOid' : null,
  };
  // 地图FD,E频小区图形参数对象
  getCellInfoParams = {
    'cellId': '696318',
    'cityOid': null,
    'selectType': null,
    'selectDate': null
  };
  // FDE图层对象数组
  FLayers = [];
  DLayers = [];
  ELayers = [];
  // 查询条件DOM节点
  dateSelector = null;
  // 查询是否有结果
  hasSearched = false;
  tableHasResult = false;
  tableForCellPairHasResult = false;
  // test
  test = 1;
  // 扇形test
  point2 = [23.090468, 114.394174];
  radius = 50;
  sDegree = 300;
  eDegree = 360;
  toolTip = '"小区ID：696316<br>小区名：惠州地派白泥坑F-HLH-3<br>EARFCN：null<br>PCI：null"';

  // E频坐标数据数组
  arrayEChannel = [];
  // F频坐标数据数组
  arrayFChannel = {
    'F1': {
      'R': [],
      'P': [],
      'B': []
    },
    'F2': {
      'R': [],
      'P': [],
      'B': []
    },
  };
  // D频坐标数据数组
  arrayDChannel = {
    'D1': {
      'R': [],
      'P': [],
      'B': []
    },
    'D2': {
      'R': [],
      'P': [],
      'B': []
    },
    'D3': {
      'R': [],
      'P': [],
      'B': []
    },
  };
  // 问题小区坐标
  errorAreaLatlng = [];
  // 点击测距的变量
  clickNumber = 0;
  // 测距工具显示的提示语
  testDistanceText = '点击开始测距';
  cityId = null;


  compareFn = (o1: any, o2: any) => o1 && o2 ? o1.value === o2.value : o1 === o2;
// 获取表格数据
  getUsers(pageIndex: number = 1, pageSize: number = 10, sortField: string, sortOrder: string, genders: string[]): any {
    let params = new HttpParams()
    .append('page', `${pageIndex}`)
    .append('results', `${pageSize}`)
    .append('sortField', sortField)
    .append('sortOrder', sortOrder);
    genders.forEach(gender => {
      params = params.append('gender', gender);
    });
    return  this.coverageAreaDataSet;
  }
  // 改变表格页数，loading
  searchData(reset: boolean = false): void {
    // if (reset) {
    //   this.pageIndex = 1;
    // }
    // this.loading = true;
    // this.getUsers(this.pageIndex, this.pageSize, this.sortKey, this.sortValue, this.searchGenderList)
    // .subscribe((data: any) => {
    //   this.loading = false;
    //   this.total = 200;
    //   this.dataSet = data.results;
    // });
  }
  // 表格单选按钮
  refreshStatus(event) {
    // 清空图层
    this.clearLayers('all');
    let id = null;
    for (let i = 0; i < this.coverageAreaDataSet.length; i++) {
      if(event.cellId !== this.coverageAreaDataSet[i].cellId){
        this.coverageAreaDataSet[i].checked = false;
      }else{
        // this.coverageAreaDataSet[i].checked = !this.coverageAreaDataSet[i].checked;
        id = this.coverageAreaDataSet[i].cellId;
        if(this.hasSearched){ // 只有当进行了数据查询才能调用画图功能
          this.drawShape(this.coverageAreaDataSet[i].checked, id, this.coverageAreaDataSet[i].dateId);
        }
      }
    }
  }
  // 判断条件刷新
  refreshJudgeTest(questionType){
    this.judgeText = SoftDataConst.judgeConditions[(questionType)];
  }
  // 地图上画图形
  drawShape(show, id, date){
    if(show && id !== null && id !== undefined){
      this.getCellInfoParams.cellId = id;
      this.getCellInfoParams.cityOid = this.cityId;
      this.getCellInfoParams.selectType = this.getTableDataParams.selectType;
      this.getCellInfoParams.selectDate = date;
      this.errorAreaLatlng = []; //重置问题小区坐标
      this.getFDChannelData();
      this.getEChannelData();
    }
  }
  // 清空图层与图层数据
  clearLayers(type: string){
    switch (type){
      case 'F':
        this.map.clearLayer(this.FLayers);
        this.arrayFChannel = {
          'F1': {
            'R': [],
            'P': [],
            'B': []
          },
          'F2': {
            'R': [],
            'P': [],
            'B': []
          },
        };
        break;
      case 'D':
        this.map.clearLayer(this.DLayers);
        this.arrayDChannel = {
          'D1': {
            'R': [],
            'P': [],
            'B': []
          },
          'D2': {
            'R': [],
            'P': [],
            'B': []
          },
          'D3': {
            'R': [],
            'P': [],
            'B': []
          },
        };
        break;
      case 'E':
        this.map.clearLayer(this.ELayers);
        this.arrayEChannel = [];
        break;
      case 'all':
        this.map.clearLayer(this.FLayers);
        this.map.clearLayer(this.DLayers);
        this.map.clearLayer(this.ELayers);
        this.arrayFChannel = {
          'F1': {
            'R': [],
            'P': [],
            'B': []
          },
          'F2': {
            'R': [],
            'P': [],
            'B': []
          },
        };
        this.arrayDChannel = {
          'D1': {
            'R': [],
            'P': [],
            'B': []
          },
          'D2': {
            'R': [],
            'P': [],
            'B': []
          },
          'D3': {
            'R': [],
            'P': [],
            'B': []
          },
        };
        this.arrayEChannel = [];
        break;
      default:
        break;
    }
  }
  // 是否显示FDE频道小区——鼠标点击改变FDE频按钮颜色和文字
  switchChannelCircle(channel: string) {
    switch (channel) {
      case 'F': {
        this.FGreyCicle = !this.FGreyCicle;
        this.fChannelHoverText = '显示F频小区';
        this.map.clearLayer(this.FLayers);
        if (this.FGreyCicle === false) {
          this.map.clearLayer(this.FLayers);
          this.paintFchannelPolygon();
          this.fChannelHoverText = '不显示F频小区';
        }
        break;
      }
      case 'D': {
        this.DGreyCicle = !this.DGreyCicle;
        this.dChannelHoverText = '显示D频小区';
        this.map.clearLayer(this.DLayers);
        if (this.DGreyCicle === false) {
          this.map.clearLayer(this.DLayers);
          this.paintDchannelPolygon();
          this.dChannelHoverText = '不显示D频小区';
        }
        break;
      }
      case 'E': {
        this.EGreyCicle = !this.EGreyCicle;
        this.eChannelHoverText = '显示E频小区';
        this.map.clearLayer(this.ELayers);
        if (this.EGreyCicle === false) {
          this.map.clearLayer(this.ELayers);
          this.paintEchannelCircle();
          this.eChannelHoverText = '不显示E频小区';
        }
        break;
      }
    }
  }
  // 查询时间更新
  selectedDateUpdate(): boolean {
    // console.log(this.selectedTime[0].getTime()+','+this.selectedTime[1].getTime());
    if (this.selectedTime === null || this.selectedTime.length === 0 || ((this.selectedTime[1] - this.selectedTime[0]) / 86400000) >= 15) {
      if(this.selectedTime === null || this.selectedTime.length === 0){
        this.render.setStyle(this.dateSelector, 'border', '2px solid red');
        this.render.setStyle(this.dateSelector, 'border-radius', '4px');
        this.message.create('error', '请选择时间');
      }else{
        this.message.create('error', '时间跨度不能大于15天，请选择时间！');
        this.render.setStyle(this.dateSelector, 'border', '2px solid red');
        this.render.setStyle(this.dateSelector, 'border-radius', '4px');
        this.selectedTime = [];
      }
      return false;
    } else {
        this.render.removeStyle(this.dateSelector, 'border');
        return true;
    }
  }
  // 限制时间选择
  disabledDate(currDate: Date): boolean {
    const curr = moment(currDate),
      diff = moment(new Date()).diff(curr, 'days');
    return  diff <= 0;
  }
  // D频小区画图层的方法
  paintDchannelPolygon() {
    // D1,D2和D3频道
    for(let dChannel in this.arrayDChannel){
      // R P B颜色
      for(let color in this.arrayDChannel[(dChannel)]){
        this.arrayDChannel[(dChannel)][(color)].forEach(item => {
          this.DLayers.push(this.map.Sector1(item.latlng, item.radius, item.sDegree, item.eDegree, item.cellInfo, item.pointColor, item.textColor));
          //设置问题小区中心点
          if(color === 'R'){
            this.errorAreaLatlng = item.latlng;
          }
        });
      }
    }
  }
  // F频小区画图层的方法
  paintFchannelPolygon() {
    // F1,F2
    for(let fChannel in this.arrayFChannel){
      // R P B颜色
      for(let color in this.arrayFChannel[(fChannel)]){
        this.arrayFChannel[(fChannel)][(color)].forEach(item => {
          this.FLayers.push(this.map.Sector1(item.latlng, item.radius, item.sDegree, item.eDegree, item.cellInfo, item.pointColor, item.textColor));
          //设置问题小区中心点
          if(color === 'R'){
            this.errorAreaLatlng = item.latlng;
          }
        });
      }
    }
  }
  // E频小区画图层的方法
  paintEchannelCircle() {
    this.arrayEChannel.forEach(element => {
      // 画红色圆图层
      if (element.redTooltip.length > 0 && element.blueTooltip.length === 0 && element.purpleTooltip.length === 0) {
        this.ELayers.push(this.map.renderRBPCircle(element.redTooltip, 'red', element.latlng, {radius: 30, color: 'red'}));
        //设置问题小区中心点
        this.errorAreaLatlng = element.latlng;
        return;
      }
      // 画蓝色圆图层
      if (element.blueTooltip.length > 0 && element.redTooltip.length === 0 && element.purpleTooltip.length === 0) {
        this.ELayers.push(this.map.renderRBPCircle(element.blueTooltip, 'black', element.latlng, {radius: 30, color: '#00a7f3'}));
        return;
      }
      // 画紫色圆图层
      if (element.purpleTooltip.length > 0 && element.redTooltip.length === 0 && element.blueTooltip.length === 0) {
        this.ELayers.push(this.map.renderRBPCircle(element.purpleTooltip, 'black', element.latlng, {radius: 30, color: '#bb2abb'}));
        return;
      }
      // 画重叠圆图层
      this.ELayers.push(this.map.renderCoverCircle(element.redTooltip, 'red' , element.blueTooltip, 'black',
        element.purpleTooltip, element.latlng,  {radius: 30, color: 'red'}));
      //设置问题小区中心点
      if(element.redTooltip.length > 0){
        this.errorAreaLatlng = element.latlng;
      }
    });
  }
  // 点击查询
  search() {
    if(this.selectedDateUpdate()){
      this.coverageAreaLoading = true;
      this.hasSearched = true;
      // 更新判断条件
      this.judgeText = SoftDataConst.judgeConditions[this.getTableDataParams.selectType];
      // 更新查询请求参数
      this.getTableDataParams.timeSlots = this.selectedTime[0].getTime()+','+this.selectedTime[1].getTime();
      this.getTableDataParams.area = this.coverageDomain.value;
      this.getTableDataParams.selectType = this.questionType.value;
      this.getTableDataParams.pageIndex = 1;
      this.getTableDataParams.pageSize = -1;
      this.getTableDataParams.cityOid = this.cityId;
      this.http.get(urls.getSoftMiningInfo, {params: this.getTableDataParams})
        .subscribe((res: any) => {
          let result = res[this.getTableDataParams.selectType]; //覆盖小区表格数据
          let resultForCellPair = []; //覆盖小区组表格数据

        // 更新重叠覆盖小区表格表头 与 覆盖小区和小区组的显示按钮
          switch (this.getTableDataParams.selectType){
            case 1:
              this.tableHeader = SoftDataConst.softMiningInfoTableHeader.弱覆盖小区;
              this.coverageArea = '弱覆盖小区';
              this.showCoverCellPair = false;
              break;
            case 2:
              this.tableHeader = SoftDataConst.softMiningInfoTableHeader.过覆盖小区;
              this.coverageArea = '过覆盖小区';
              this.showCoverCellPair = false;
              break;
            case 3:
              this.tableHeader = SoftDataConst.softMiningInfoTableHeader.重叠覆盖小区;
              this.cellPairTableHeader = SoftDataConst.softMiningInfoTableHeader.重叠覆盖小区对;
              this.coverageArea = '重叠覆盖小区';
              this.coveredCellPair = '重叠覆盖小区对';
              this.showCoverCellPair = true;
              resultForCellPair = res['4'];
              break;
            case 5:
              this.tableHeader = SoftDataConst.softMiningInfoTableHeader.模三干扰小区;
              this.cellPairTableHeader = SoftDataConst.softMiningInfoTableHeader.模三干扰小区对;
              this.coverageArea = '模三干扰小区';
              this.coveredCellPair = '模三干扰小区对';
              this.showCoverCellPair = true;
              resultForCellPair = res['6'];
              break;
            case 7:
              this.tableHeader = SoftDataConst.softMiningInfoTableHeader.低上行信噪比小区;
              this.coverageArea = '低上行信噪比小区';
              this.showCoverCellPair = false;
              break;
            default:
              break;
          }
          // 覆盖小区数据插入
          if(result.length !== 0){
            this.tableHasResult = true;
            result.every(item => {
              item.checked = false;
              item.name = 'mockData ' + result.indexOf(item);
            });
            this.coverageAreaDataSet = result;
          }else{
            this.coverageAreaDataSet = [];
            this.tableHasResult = false;
          }
          // 覆盖小区组数据插入
          if(resultForCellPair.length !== 0){
            this.tableForCellPairHasResult = true;
            this.coverageCellPairDataSet = resultForCellPair;
          }else{
            this.tableForCellPairHasResult = false;
            this.coverageCellPairDataSet = [];
          }
          this.coverageAreaLoading = false;
          this.coverageCellPairLoading = false;
          // 初始化至显示覆盖小区表格
          this.switchTableTo('area');
          // 当展示表格隐藏时，显示表格
          if(!this.showTable){
            this.triggerShowTableButtom();
          }
          // 清除之前的图层与图层数据
          this.clearLayers('all');
      })
    }
  }
  // 点击导出
  exportData() {
    // 更新数据导出请求参数
    this.exportTableDataParams.timeSlots = this.getTableDataParams.timeSlots;
    this.exportTableDataParams.area = this.getTableDataParams.area;
    // 导出的问题类型
    switch (this.getTableDataParams.selectType){
      case 1:
      case 2:
      case 7:
        this.exportTableDataParams.selectType = this.getTableDataParams.selectType;
        this.exportTableDataParams.fileName = this.coverageArea;
        break;
      case 3:
      case 5:
        if(this.showCoverageAreaTable && !this.showCoverageCellPairTable){
          this.exportTableDataParams.selectType = this.getTableDataParams.selectType;
          this.exportTableDataParams.fileName = this.coverageArea;
        }else if(!this.showCoverageAreaTable && this.showCoverageCellPairTable) {
          this.exportTableDataParams.selectType = this.getTableDataParams.selectType + 1;
          this.exportTableDataParams.fileName = this.coverageArea + '对';
        }
        break;
      default:
        break;
    }
    this.exportTableDataParams.pageIndex = 1;
    this.exportTableDataParams.pageSize = -1;
    this.exportTableDataParams.cityOid = this.cityId;
    this.http.get(urls.exportCellData, {
      params: this.exportTableDataParams,
      responseType: 'text'})
      .subscribe((next: string) => {
      window.open(environment.host + next);
    })

  }
  // 显示/隐藏表格显示按钮
  triggerShowTableButtom() {
    this.bottomShowTable = !this.bottomShowTable;
    this.topShowTable = !this.topShowTable;
    this.showTable = !this.showTable;
  }
  // 切换显示覆盖小区与覆盖小区对表格
  switchTableTo(type) {
    if(type === 'area'){
      this.showCoverageAreaTable = true;
      this.showCoverageCellPairTable = false;
    }else{
      this.showCoverageAreaTable = false;
      this.showCoverageCellPairTable = true;
    }
  }
  //  显示指标表格提示2秒后隐藏
  setSwitchTextShow() {
    this.bottomShowSwitchText = false;
  }
  // 获取FD频小区数据
  getFDChannelData() {
    this.http.get(urls.cellInfo, {params: this.getCellInfoParams})
        .subscribe((res: any) => {
          // 遍历FD频小区res
          // F频D频小区红紫蓝图层点数据封装
          // 循环P R B三种颜色
          for (let obj in this.arrayFChannel.F1) {
            let color = obj.toString();
            let colorKey = 'cellInfoHzOf'+obj.toString(); // 数据中颜色的键值
            let pointColor = ''; // 图形颜色
            let textColor = ''; // 提示语颜色
            switch (color){
              case 'R':
                pointColor = 'red';
                textColor = 'red';
                break;
              case 'P':
                pointColor = '#bb2abb';
                textColor = 'black';
                break;
              case 'B':
                pointColor = '#00a7f3';
                textColor = 'black';
                break;
            }
            if(res[(colorKey)] !== null){
              // 循环返回结果中的F1，F2
              if(res[(colorKey)].frequencyF !== null){
              for (let fChannel in res[(colorKey)].frequencyF){
                  if(res[(colorKey)].frequencyF.hasOwnProperty(fChannel)){
                    // 循环每个颜色中的 F1与F2频数据
                    res[(colorKey)].frequencyF[(fChannel)].forEach(item =>{
                      if(fChannel.toString() == 'F1'){
                        this.arrayFChannel.F1[(color)].push({
                          'latlng': [parseFloat(item.actualMeasureLatitude), parseFloat(item.actualMeasureLongitude)],
                          'sDegree': item.actualMeasureAzimuth - 25,
                          'eDegree': item.actualMeasureAzimuth + 25,
                          'cellInfo': item.cellInfo,
                          'radius': 40,
                          'pointColor': pointColor,
                          'textColor': textColor
                        })
                      }
                      if(fChannel.toString() == 'F2'){
                        this.arrayFChannel.F2[(color)].push({
                          'latlng': [parseFloat(item.actualMeasureLatitude), parseFloat(item.actualMeasureLongitude)],
                          'sDegree': item.actualMeasureAzimuth - 20,
                          'eDegree': item.actualMeasureAzimuth + 20,
                          'cellInfo': item.cellInfo,
                          'radius': 60,
                          'pointColor': pointColor,
                          'textColor': textColor
                        })
                      }
                    });
                  }
                }
              }
              // 循环返回结果中的D1，D2, D3
              if(res[(colorKey)].frequencyD !== null){
              for (let dChannel in res[(colorKey)].frequencyD){
                if(res[(colorKey)].frequencyD.hasOwnProperty(dChannel)){
                  // 循环每个颜色中的 D1,D2与D3频数据
                  res[(colorKey)].frequencyD[(dChannel)].forEach(item =>{
                    if(dChannel.toString() == 'D1'){
                      this.arrayDChannel.D1[(color)].push({
                        'latlng': [parseFloat(item.actualMeasureLatitude), parseFloat(item.actualMeasureLongitude)],
                        'sDegree': item.actualMeasureAzimuth - 15,
                        'eDegree': item.actualMeasureAzimuth + 15,
                        'cellInfo': item.cellInfo,
                        'radius': 90,
                        'pointColor': pointColor,
                        'textColor': textColor
                      })
                    }
                    if(dChannel.toString() == 'D2'){
                      this.arrayDChannel.D2[(color)].push({
                        'latlng': [parseFloat(item.actualMeasureLatitude), parseFloat(item.actualMeasureLongitude)],
                        'sDegree': item.actualMeasureAzimuth - 10,
                        'eDegree': item.actualMeasureAzimuth + 10,
                        'cellInfo': item.cellInfo,
                        'radius': 100,
                        'pointColor': pointColor,
                        'textColor': textColor
                      })
                    }
                    if(dChannel.toString() == 'D3'){
                      this.arrayDChannel.D3[(color)].push({
                        'latlng': [parseFloat(item.actualMeasureLatitude), parseFloat(item.actualMeasureLongitude)],
                        'sDegree': item.actualMeasureAzimuth - 5,
                        'eDegree': item.actualMeasureAzimuth + 5,
                        'cellInfo': item.cellInfo,
                        'radius': 110,
                        'pointColor': pointColor,
                        'textColor': textColor
                      })
                    }
                  });
                }
              }
            }
            }
          }
          if(!this.FGreyCicle){
            this.paintFchannelPolygon();
          }
          if(!this.DGreyCicle){
            this.paintDchannelPolygon();
          }
        });
  }
  // 获取E频小区数据
  getEChannelData() {
    this.http.get(urls.cellInfoOfFreqE, {params: this.getCellInfoParams})
        .subscribe((res: any) => {
          // E频小区
          res.forEach(element => {
            const arrayRedTooltip = [];
            const arrayBlueTooltip = [];
            const arrayPurpleTooltip = [];
            element.cellInfoHzOfR.forEach(redItem => {
              arrayRedTooltip.push(redItem.cellInfo);
            });
            element.cellInfoHzOfB.forEach(blueItem => {
              arrayBlueTooltip.push(blueItem.cellInfo);
            });

            element.cellInfoHzOfP.forEach(purpleItem => {
              arrayPurpleTooltip.push(purpleItem.cellInfo);
            });
            this.arrayEChannel.push({
            'latlng':  [parseFloat(element.latitude), parseFloat(element.longitude)],
            'redTooltip': arrayRedTooltip,
            'blueTooltip': arrayBlueTooltip,
            'purpleTooltip': arrayPurpleTooltip,
            });
          });
          // 进入页面时画E频小区图层
          if(!this.EGreyCicle){
            this.paintEchannelCircle();
          }
    });
  }
  // 定位问题小区
  locatedProblemCell(){
    if(this.errorAreaLatlng !== [] && this.hasSearched){
      this.map.moveTo(this.errorAreaLatlng);
    }
  }
  // 测量距离
  measureDistance() {
    if(this.testDistanceText === '点击开始测距'){
      this.testDistanceText = '点击结束测距';
    }
    else if(this.testDistanceText === '点击结束测距'){
      this.testDistanceText = '点击开始测距';
    }
    if(this.clickNumber === 1){
      this.map.positionPointClose();
      this.clickNumber = 0;
    }
    else if(this.clickNumber === 0) {
      this.map.positionPoint();
      this.clickNumber++;
    }
  }

  ngOnInit(): void {
    this.coverageAreaLoading = false;
    // 展示10条空数据
    for (let i = 0; i < 10; i++) {
      this.coverageAreaDataSet.push({
        name   : `mockData ${i}`,
        checked: false
      });
    }
    // 默认选择弱覆盖小区
    this.getTableDataParams.selectType = 1;
    setTimeout(() => this.setSwitchTextShow(), 2000);
    this.dateSelector = document.querySelector('nz-range-picker').firstElementChild.firstChild;

  }
  ngAfterViewInit() {
    this.map.init({
      contain: this.mapElement.nativeElement,
      f_type: this.f_type_element.nativeElement
    });
    this.cityId = location.hash.substring(location.hash.lastIndexOf('#') + 1);
  }
}

