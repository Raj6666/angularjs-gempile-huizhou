'use strict';

// 百度地图API功能

var map;  //道路统计地图
var areaMap;//区域统计地图
var markerList = [];//存储添加的标注用来改变标注图片大小
var markerCount = 200; ///添加标注数量
var isStop = false;////用来判断批量标注是否添加结束
var myDis;
LoadApi(function () {
    //加载道路统计地图
    map = new BMap.Map("allmap", {mapType: getDefaultMapType()});

    LoadOverlayImage(map); //加载瓦片图
    ShowControl(map); //显示缩放控件
    ShowZoom(map); //启动鼠标拖动
    ShowScale(map, 1);//添加比例尺
    InitCenterAndZoom(map, 113.1838470000, 23.0216750000, 15);
    map.addEventListener("zoomend", function () {
        LoadMarker();
    });

    MarkersList();//加载线
    AddMarker();//加载标注
    myDis = new BMapLib.DistanceTool(map);
    //加载区域统计地图
    areaMap = new BMap.Map("areaMap", {mapType: getDefaultMapType()});

    LoadOverlayImage(areaMap); //加载瓦片图
    ShowControl(areaMap); //显示缩放控件
    ShowZoom(areaMap); //启动鼠标拖动
    ShowScale(areaMap, 2);//添加比例尺
    InitCenterAndZoom(areaMap, 113.1838470000, 23.0216750000, 15);
    MarkersList2();

});


function OpenCJ() {
    myDis.open();  //开启鼠标测距
}
////动态添加批量标注
function AddMarker() {
    var zoom = GetImageSize();
    zoom = 19;
    var bounds = map.getBounds();
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();
    var lngSpan = Math.abs(sw.lng - ne.lng);
    var latSpan = Math.abs(ne.lat - sw.lat);
    var style = {
        boxStyle: {
            //background: "url('images/iw3.png') no-repeat center top",
            backgroundColor: "#fff",
            width: "180px",
            height: "25px",
            cursor: "default",
            padding: "10px 10px 10px 10px",
            border: "2px solid #cccccc"
        },
        closeIconMargin: "0px 10px 0px 0px",
        offset: new BMap.Size(0, 10),
        closeIconUrl: "images/close1.png",
        enableAutoPan: true,
        alignBottom: true
    };

    //画出公路上的点，与基站连线
    var polylineArr = [{"lng": 113.1793800000, "lat": 23.0227710000}, {
        "lng": 113.1793850000,
        "lat": 23.0226250000
    }, {"lng": 113.1792690000, "lat": 23.0188030000}
        , {"lng": 113.1792420000, "lat": 23.0212570000}, {
            "lng": 113.1792420000,
            "lat": 23.0210820000
        }, {"lng": 113.1792510000, "lat": 23.0208410000}, {"lng": 113.1792790000, "lat": 23.0199250000},
        {"lng": 113.1792520000, "lat": 23.0209890000},
        {"lng": 113.1792520000, "lat": 23.0208560000},
        {"lng": 113.1792790000, "lat": 23.0207230000},
        {"lng": 113.1792700000, "lat": 23.0206060000},
        {"lng": 113.1792610000, "lat": 23.0204820000},
        {"lng": 113.1728231545, "lat": 23.0142431466},
        {"lng": 113.1792610000, "lat": 23.0203740000},
        {"lng": 113.1792610000, "lat": 23.0202660000},
        {"lng": 113.1792610000, "lat": 23.0201570000},
        {"lng": 113.1792570000, "lat": 23.0200740000}];
    for (var i = 0; i < polylineArr.length; i++) {
        var ico = APIPATH + APIIMAGESFILENAME + "/mgreen.png";
        //if (i % 2 == 0) { ico = APIPATH + APIIMAGESFILENAME + "/mgreen.png"; }
        //if (i % 3 == 0) { ico = APIPATH + APIIMAGESFILENAME + "/mred.png"; }
        var marker = SetMarker(map, polylineArr[i].lng, polylineArr[i].lat, ico, zoom, zoom);
        markerList.push(marker[0]);
        addClickHandler(map, "我是第" + i + "个标注", marker[0], style); //添加标注点击事件

    }

    LoadMarker();

}

///改变标注大小
function LoadMarker() {
    markerCount = markerList.length;
    var zoom = GetImageSize(); ////获取标注图片大小
    // var intv = setInterval(function () {
    // window.clearInterval(intv);
    while (markerCount--) {
        var mak = markerList[markerCount];
        var icon = mak.getIcon();
        //icon.setSize({ width: zoom, height: zoom});
        icon.setImageSize({width: zoom, height: zoom});
        mak.setIcon(icon);
        if (markerCount == 0) {
            isStop = true;
        }
    }

    // }, 10);

}
///根据地图大小获取标注图片大小
function GetImageSize() {
    var zoom = map.getZoom(); ////获取地图级别
    switch (zoom) {
        case 19:
            zoom = 19;
            break;
        case 18:
            zoom = 15;
            break;
        case 17:
            zoom = 12;
            break;
        case 16:
            zoom = 10;
            break;
        case 15:
            zoom = 8;
            break;
        case 14:
            zoom = 6;
            break;
        case 13:
            zoom = 4;
            break;
        case 12:
            zoom = 2;
            break;
        default:
            zoom = 1;
            break;
    }
    return zoom;
}
//道路统计地图画线
function MarkersList() {
    var styleOptions = {
        strokeColor: "green",    //边线颜色。
        fillColor: "red",      //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 2,       //边线的宽度，以像素为单位。
        strokeOpacity: 0.5,    //边线透明度，取值范围0 - 1。
        fillOpacity: 0.5,      //填充的透明度，取值范围0 - 1。
        strokeStyle: 'solid' //边线的样式，solid或dashed。
    };
    var styleOptions2 = {
        strokeColor: "green",    //边线颜色。
        fillColor: "#7DD43C",      //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 2,       //边线的宽度，以像素为单位。
        strokeOpacity: 0.5,    //边线透明度，取值范围0 - 1。
        fillOpacity: 0.5,      //填充的透明度，取值范围0 - 1。
        strokeStyle: 'solid' //边线的样式，solid或dashed。
    };
    //基站与点的画线
    var polylineArr = [
        {
            "parentPoint": {"lng": 113.1729400000, "lat": 23.0193270000},
            "subPoint": [{"lng": 113.1793800000, "lat": 23.0227710000}, {
                "lng": 113.1793850000,
                "lat": 23.0226250000
            }, {"lng": 113.1792690000, "lat": 23.0188030000}
                , {"lng": 113.1792420000, "lat": 23.0212570000}, {
                    "lng": 113.1792420000,
                    "lat": 23.0210820000
                }, {"lng": 113.1792510000, "lat": 23.0208410000}, {"lng": 113.1792790000, "lat": 23.0199250000},
                {"lng": 113.1792520000, "lat": 23.0209890000},
                {"lng": 113.1792520000, "lat": 23.0208560000},
                {"lng": 113.1792790000, "lat": 23.0207230000},
                {"lng": 113.1792700000, "lat": 23.0206060000},
                {"lng": 113.1792610000, "lat": 23.0204820000},
                {"lng": 113.1728231545, "lat": 23.0142431466},
                {"lng": 113.1792610000, "lat": 23.0203740000},
                {"lng": 113.1792610000, "lat": 23.0202660000},
                {"lng": 113.1792610000, "lat": 23.0201570000},
                {"lng": 113.1792570000, "lat": 23.0200740000}]
        }
    ];
    for (var i = 0; i < polylineArr.length; i++) {
        for (var j = 0; j < polylineArr[i].subPoint.length; j++) {
            var curLine = [];
            curLine.push(polylineArr[i].parentPoint);
            curLine.push(polylineArr[i].subPoint[j]);
            var polyline = new BMap.Polyline(curLine, styleOptions);   //创建折线
            map.addOverlay(polyline);   //增加折线
        }

    }


    function Sector1(point2, radius, sDegree, eDegree, strokeColour, strokeWeight, Strokepacity, fillColour, fillOpacity, opts) {
        var points = [];
        var step = ((eDegree - sDegree) / 10) || 10;
        points.push(point2);
        for (var i = sDegree; i < eDegree + 0.001; i += step) {
            points.push(EOffsetBearing(point2, radius, i));
        }
        points.push(point2);
        var polygon = new BMap.Polygon(
            points
            , {
                strokeColor: strokeColour,
                strokeWeight: strokeWeight,
                strokeOpacity: Strokepacity,
                fillColor: fillColour,
                fillOpacity: fillOpacity
            });

        return polygon;
    }

    function EOffsetBearing(point3, dist, bearing) {
        var latConv = map.getDistance(point3, new BMap.Point(point3.lng + 0.1, point3.lat)) * 10;
        var lngConv = map.getDistance(point3, new BMap.Point(point3.lng, point3.lat + 0.1)) * 10;
        var lat = dist * Math.cos(bearing * Math.PI / 180) / latConv;
        var lng = dist * Math.sin(bearing * Math.PI / 180) / lngConv;

        var p = new BMap.Point(point3.lng + lng, point3.lat + lat);

        return p;
    }

    var jizhan = [{
        "pointJIZHAN": {
            "lng": 113.17209,
            "lat": 23.01925,
            "fwj": [{"addr": "佛山南海平洲尖东酒店F-ZLH-1", "s": 40, "e": 90, "color": "green"}, {
                "addr": "佛山南海平洲尖东酒店F-ZLH-2",
                "s": 140,
                "e": 210,
                "color": "green"
            }, {"addr": "佛山南海平洲尖东酒店F-ZLH-3", "s": 300, "e": 330, "color": "green"}]
        }
    },
        {
            "pointJIZHAN": {
                "lng": 112.89695,
                "lat": 23.15118,
                "fwj": [{"addr": "佛山三水西南海畔名苑F-ZLH-1", "s": 60, "e": 90, "color": "green"}, {
                    "addr": "佛山三水西南海畔名苑F-ZLH-2",
                    "s": 160,
                    "e": 210,
                    "color": "green"
                }, {"addr": "佛山三水西南海畔名苑F-ZLH-3", "s": 300, "e": 300, "color": "green"}]
            }
        },
        {
            "pointJIZHAN": {
                "lng": 113.16483,
                "lat": 23.08505,
                "fwj": [{"addr": "佛山南海盐步竹苑村二D-ELH-1", "s": 60, "e": 90, "color": "green"}, {
                    "addr": "佛山南海盐步竹苑村二D-ELH-2",
                    "s": 160,
                    "e": 210,
                    "color": "green"
                }, {"addr": "佛山南海盐步竹苑村二D-ELH-3", "s": 300, "e": 300, "color": "green"}]
            }
        }];

    var LableList = [];
    var lbIndex = 0;
    for (var i = 0; i < jizhan.length; i++) {
        var pJIZHAN = jizhan[i].pointJIZHAN;
        var points = new BMap.Point(pJIZHAN.lng, pJIZHAN.lat);

        for (var j = 0; j < pJIZHAN.fwj.length; j++) {
            var label = new BMap.Label(pJIZHAN.fwj[j].addr, {offset: new BMap.Size(51, -30), position: points});
            LableList.push(label);
            var polygon11 = Sector1(points, 100, pJIZHAN.fwj[j].s, pJIZHAN.fwj[j].e, pJIZHAN.fwj[j].color, 3, 0.5, pJIZHAN.fwj[j].color, 0.5);
            polygon11.IndexValue = lbIndex;
            polygon11.addEventListener('mouseover', function () {
                map.addOverlay(LableList[this.IndexValue]);
            });
            polygon11.addEventListener('mouseout', function () {
                map.removeOverlay(LableList[this.IndexValue])
            });

            map.addOverlay(polygon11);
            lbIndex++;
        }
    }
}

//区域统计地图画线
function MarkersList2() {
    var styleOptions = {
        strokeColor: "red",    //边线颜色。
        fillColor: "red",      //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 2,       //边线的宽度，以像素为单位。
        strokeOpacity: 0.5,    //边线透明度，取值范围0 - 1。
        fillOpacity: 0.5,      //填充的透明度，取值范围0 - 1。
        strokeStyle: 'solid' //边线的样式，solid或dashed。
    };
    var styleOptions2 = {
        strokeColor: "#7DD43C",    //边线颜色。
        fillColor: "#7DD43C",      //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 2,       //边线的宽度，以像素为单位。
        strokeOpacity: 0.5,    //边线透明度，取值范围0 - 1。
        fillOpacity: 0.5,      //填充的透明度，取值范围0 - 1。
        strokeStyle: 'solid' //边线的样式，solid或dashed。
    };
    //var polylineArr = [{"parentPoint":{"lng":113.1255370000,"lat":23.0206240000},"subPoint":[{"lng":113.1235250000,"lat":23.0184790000},
    //{"lng":113.1235610000,"lat":23.0198590000},{"lng":113.1249800000,"lat":23.0255300000}]}];
    //基站与点的画线
    var polylineArr = [
        {
            "parentPoint": {"lng": 113.1729400000, "lat": 23.0193270000},
            "subPoint": [{"lng": 113.1793800000, "lat": 23.0227710000}, {
                "lng": 113.1793850000,
                "lat": 23.0226250000
            }, {"lng": 113.1792690000, "lat": 23.0188030000}
                , {"lng": 113.1792420000, "lat": 23.0212570000}, {
                    "lng": 113.1792420000,
                    "lat": 23.0210820000
                }, {"lng": 113.1792510000, "lat": 23.0208410000}, {"lng": 113.1792790000, "lat": 23.0199250000},
                {"lng": 113.1792520000, "lat": 23.0209890000},
                {"lng": 113.1792520000, "lat": 23.0208560000},
                {"lng": 113.1792790000, "lat": 23.0207230000},
                {"lng": 113.1792700000, "lat": 23.0206060000},
                {"lng": 113.1792610000, "lat": 23.0204820000},
                {"lng": 113.1728231545, "lat": 23.0142431466},
                {"lng": 113.1792610000, "lat": 23.0203740000},
                {"lng": 113.1792610000, "lat": 23.0202660000},
                {"lng": 113.1792610000, "lat": 23.0201570000},
                {"lng": 113.1792570000, "lat": 23.0200740000}]
        }
    ];
    for (var i = 0; i < polylineArr.length; i++) {
        for (var j = 0; j < polylineArr[i].subPoint.length; j++) {
            var curLine = [];
            curLine.push(polylineArr[i].parentPoint);
            curLine.push(polylineArr[i].subPoint[j]);
            var polyline = new BMap.Polyline(curLine, styleOptions);   //创建折线
            areaMap.addOverlay(polyline);   //增加折线
        }

    }


    function Sector1(point2, radius, sDegree, eDegree, strokeColour, strokeWeight, Strokepacity, fillColour, fillOpacity, opts) {
        var points = [];
        var step = ((eDegree - sDegree) / 10) || 10;
        points.push(point2);
        for (var i = sDegree; i < eDegree + 0.001; i += step) {
            points.push(EOffsetBearing(point2, radius, i));
        }
        points.push(point2);
        var polygon = new BMap.Polygon(
            points
            , {
                strokeColor: strokeColour,
                strokeWeight: strokeWeight,
                strokeOpacity: Strokepacity,
                fillColor: fillColour,
                fillOpacity: fillOpacity
            });

        return polygon;
    }

    function EOffsetBearing(point3, dist, bearing) {
        var latConv = areaMap.getDistance(point3, new BMap.Point(point3.lng + 0.1, point3.lat)) * 10;
        var lngConv = areaMap.getDistance(point3, new BMap.Point(point3.lng, point3.lat + 0.1)) * 10;
        var lat = dist * Math.cos(bearing * Math.PI / 180) / latConv;
        var lng = dist * Math.sin(bearing * Math.PI / 180) / lngConv;

        var p = new BMap.Point(point3.lng + lng, point3.lat + lat);

        return p;
    }

    var jizhan = [{
        "pointJIZHAN": {
            "lng": 113.17209,
            "lat": 23.01925,
            "fwj": [{"addr": "佛山南海平洲尖东酒店F-ZLH-1", "s": 40, "e": 90, "color": "red"}, {
                "addr": "佛山南海平洲尖东酒店F-ZLH-2",
                "s": 140,
                "e": 210,
                "color": "#000"
            }, {"addr": "佛山南海平洲尖东酒店F-ZLH-3", "s": 300, "e": 330, "color": "green"}]
        }
    },
        {
            "pointJIZHAN": {
                "lng": 112.89695,
                "lat": 23.15118,
                "fwj": [{"addr": "佛山三水西南海畔名苑F-ZLH-1", "s": 60, "e": 90, "color": "red"}, {
                    "addr": "佛山三水西南海畔名苑F-ZLH-2",
                    "s": 160,
                    "e": 210,
                    "color": "#000"
                }, {"addr": "佛山三水西南海畔名苑F-ZLH-3", "s": 300, "e": 300, "color": "green"}]
            }
        },
        {
            "pointJIZHAN": {
                "lng": 113.16483,
                "lat": 23.08505,
                "fwj": [{"addr": "佛山南海盐步竹苑村二D-ELH-1", "s": 60, "e": 90, "color": "red"}, {
                    "addr": "佛山南海盐步竹苑村二D-ELH-2",
                    "s": 160,
                    "e": 210,
                    "color": "#000"
                }, {"addr": "佛山南海盐步竹苑村二D-ELH-3", "s": 300, "e": 300, "color": "green"}]
            }
        }];

    var LableList = [];
    var lbIndex = 0;
    for (var i = 0; i < jizhan.length; i++) {
        var pJIZHAN = jizhan[i].pointJIZHAN;
        var points = new BMap.Point(pJIZHAN.lng, pJIZHAN.lat);


        for (var j = 0; j < pJIZHAN.fwj.length; j++) {
            var label = new BMap.Label(pJIZHAN.fwj[j].addr, {offset: new BMap.Size(51, -30), position: points});
            LableList.push(label);
            var polygon11 = Sector1(points, 100, pJIZHAN.fwj[j].s, pJIZHAN.fwj[j].e, pJIZHAN.fwj[j].color, 3, 0.5, pJIZHAN.fwj[j].color, 0.5);
            polygon11.IndexValue = lbIndex;
            polygon11.addEventListener('mouseover', function () {
                areaMap.addOverlay(LableList[this.IndexValue]);
            });
            polygon11.addEventListener('mouseout', function () {
                areaMap.removeOverlay(LableList[this.IndexValue])
            });

            areaMap.addOverlay(polygon11);
            lbIndex++;
        }


    }


}