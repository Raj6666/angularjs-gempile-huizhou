import { Injectable } from '@angular/core';
// import * as leaflet from 'leaflet';
import { MapOptions } from './map.interface';
import { reduce } from 'rxjs/operators';
import {environment} from "../../../environments/environment";

declare let L: any;

@Injectable()
export class MapApi {
    private myMap = null;
    private greenIcon = null;
    private arrayLatlng = [];
    private lineLayers = [];
    private timer: any;
    constructor() { }

    init(opts: MapOptions) {
        const { contain, f_type } = opts;
        this.myMap = L.map(contain, {
          minZoom: 0,
          maxZoom: 11
        }).setView([23.080332, 114.419185], 9);

        // 设置瓦片图链接
        L.tileLayer(environment.tileLayer).addTo(this.myMap);

        // TEST
        // this.renderCircle([23.080332, 114.419185], {radius: 100});
        // 紫色：#bb2abb;
        // this.renderCircle([23.090468, 114.394174], {radius: 50, color: '#20bbfe'});
        // this.renderPolygon([[23.080332, 114.419185], [23.0912, 114.42], [23.080332, 114.40]]);
        // this.renderPolygon([[23.080332, 114.419185], [23.0912, 114.41], [23.080332, 114.39]]);
        // this.renderPolygon([[23.090468, 114.394174], [23.091613, 114.394367], [23.091889, 114.393187], [23.091435, 114.393187], [23.090468, 114.394174]], {color: 'red'});
        this.renderF_Type(f_type);

        // this.myMap.on('click', (e) =>{
        //   console.log(e);
        //   leaflet.marker(e.latlng).addTo(this.myMap);
        // })
        // 定位图标
        this.greenIcon = L.icon({
          iconUrl: './assets/leafletLocalMap/images/marker-icon.png', // 图标路径
          iconSize:     [20, 30], // icon定位图标长宽大小
          iconAnchor:   [10, 30], // 图标偏移位置
        });
    }

    // 点击出现定位图标且绑定点击事件
    positionPoint() {
       this.myMap.on('click', (e) =>{
         const pointMaker = L.marker(e.latlng, {icon: this.greenIcon}).addTo(this.myMap);
         this.lineLayers.push(pointMaker);
          this.arrayLatlng.push([e.latlng.lat,e.latlng.lng]);
          if(this.arrayLatlng.length === 2){
           this.lineLayers.push(this.renderLine(this.arrayLatlng));
            this.arrayLatlng = this.arrayLatlng.slice(1);
            this.lineLayers.push(this.arrayLatlng);
            return this.arrayLatlng;
          }
        });
    }
    // 第二次点击测距取消地图绑定点击事件
    positionPointClose() {
      this.myMap.off('click');
      this.arrayLatlng = [];
      this.clearLayer(this.lineLayers);
   }
    // 画线测距
    renderLine(latlng) {
      // console.log(latlng);
      const line = L.polyline(latlng, {color: 'red'}).addTo(this.myMap);
      const pointDistance = this.myMap.distance(latlng[0],latlng[1]);
      line.bindPopup('<span>两个点的距离是' + pointDistance.toFixed(2) + '米</span>',
      {maxWidth: 215}).openPopup();
      this.bindPopupTrigger(line, 'line', 30);
      return line;
    }

    // 画红蓝紫圆图层
    renderRBPCircle(cellInfo, textColor, latlng: L.LatLngExpression, opts?: Object) {
      const circle = L.circle(latlng, opts).addTo(this.myMap);
      circle.bindPopup('<span class="' + textColor + '">' + cellInfo + '</span>',
      {maxWidth: 300, maxHeight: 170});
      this.bindPopupTrigger(circle, 'circle', 30);
      circle.addTo(this.myMap);
      return circle;
    }
    // 画重叠圆图层
    renderCoverCircle(redCellInfo, redTextColor, blueCellInfo, blueTextColor, purpleCellInfo,
      latlng: L.LatLngExpression, opts?: Object) {
      let options: any = opts;
      if(redCellInfo.length > 0){
        options.color = 'red';
      }else if(purpleCellInfo.length > 0){
        options.color = '#bb2abb';
      }else {
        options.color = '#00a7f3';
      }
     const circle = L.circle(latlng, options).addTo(this.myMap);
     let redText = '';
     let blueText = '';
     let purpleText = '';
     redCellInfo.forEach(element => {
      redText += '</span><span style="display:inline-block;padding-bottom:20px;" class="' + redTextColor + '">'
      + element + '</span><br/>';
     });
     blueCellInfo.forEach(element => {
      blueText += '</span><span style="display:inline-block;padding-bottom:20px;" class="' + blueTextColor + '">'
      + element + '</span><br/>';
     });
     purpleCellInfo.forEach(element => {
      purpleText += '</span><span style="display:inline-block;padding-bottom:20px;" class="' + blueTextColor + '">'
      + element + '</span><br/>';
     });
     this.myMap.fitBounds(circle.getBounds());
     circle.bindPopup(redText + blueText + purpleText, {maxWidth: 300, maxHeight: 170});
     this.bindPopupTrigger(circle, 'circle', 30);
     circle.addTo(this.myMap);
     return circle;
   }

    // 弹出框控制
    bindPopupTrigger(layer, type, distance) {
      // 鼠标悬浮1秒后显示提示语
      layer.on('mouseover', (e) => {
        this.timer = setTimeout(() => layer.openPopup(), 1000);
      });
     // 鼠标移走后清空定时器
      layer.on('mouseout', (e) => {
        clearTimeout(this.timer);
      });
      if (type === 'line') {
        layer.on('mouseout', (e) => {
          clearTimeout(this.timer);
          // if(this.myMap.distance(sPoint, e.latlng) > distance){
          // }
        });
      }
    }

    // 画扇形多边形
    renderPolygon (cellInfo, textColor, latlng: L.LatLngExpression[] | L.LatLngExpression[][], radius, opts?: Object) {
      const polygon = L.polygon(latlng, opts).addTo(this.myMap);
      polygon.bindPopup('<span class="' + textColor + '">' + cellInfo + '</span>',
      {maxWidth: 300, maxHeight: 170});
      this.bindPopupTrigger(polygon, 'polygon', radius);
      polygon.addTo(this.myMap);
      let options: any = opts;
      if(options.color == 'red'){
        this.myMap.fitBounds(polygon.getBounds());
      }
      return polygon;
    }
    // 清除图层
    clearLayer(layers: Array<any>) {
      layers.forEach(layer => {
        // console.log(this.myMap.hasLayer(layer));
        if (this.myMap.hasLayer(layer)) {
          // console.log(layer);
          this.myMap.removeLayer(layer);
        }
      });
    }
    // 地图转移到某个点
    moveTo(latlng: L.LatLngExpression[] | L.LatLngExpression[][]){
      this.myMap.panTo(latlng);
    }
    renderF_Type(el: HTMLDivElement) {
        const F_Type = this.myMap.createPane('F_Type', el);
        console.log(F_Type);
    }

    // 以画多边形区域的方法画扇形区域 画出以circle点为圆心，半径为radius，夹角从sDegree到eDegree的扇形
    Sector1(circle, radius, sDegree, eDegree,  cellInfo, pointColor, textColor) {
      const points = []; // 创建构成多边形的点数组
      const step = ((eDegree - sDegree) / 10) || 10; // 根据扇形的总夹角确定每步夹角度数，最大为10
      points.push(circle);
      const pointObj = L.latLng(circle);
      for (let i = sDegree; i < eDegree + 0.001; i += step) { // 循环获取每步的圆弧上点的坐标，存入点数组
          points.push(this.EOffsetBearing(pointObj, radius, i));
      }
      return this.renderPolygon(cellInfo, textColor, points, radius,{color: pointColor});
  }

   // 使用数学的方法计算需要画扇形的圆弧上的点坐标
    EOffsetBearing(point, dist, bearing) {
        const lngConv = this.myMap.distance(point, [point.lat, point.lng + 0.1]) * 10;  // 计算1经度与原点的距离
        const latConv = this.myMap.distance(point, [point.lat + 0.1, point.lng]) * 10;  // 计算1纬度与原点的距离
        const lat = dist * Math.sin(bearing * Math.PI / 180) / latConv;  // 正弦计算待获取的点的纬度与原点纬度差
        const lng = dist * Math.cos(bearing * Math.PI / 180) / lngConv;  // 余弦计算待获取的点的经度与原点经度差
        return [point.lat + lat, point.lng + lng];
    }


}
