var linename_regexp = /(^地铁|^)(\d+|[^号支专快(地面)(高速)(全程)(夜宵)]+)(号|路|区|[(地面)(高速)(全程)(夜宵)]*[号支专快]?线[^(区间)]*|[A-Z])(区间)?$/;
var buslist = [];

/** 百度搜索start **/
var map = new BMap.Map("container");
var point = new BMap.Point(121.48789949, 31.24916171);
map.centerAndZoom(point, 12);

var busline = new BMap.BusLineSearch(map, {
  // renderOptions:{map:map,panel:"r-result"},
  onGetBusListComplete: function (result) {
    $('.loading, .mask').hide();
    // console.log(result)
    $('.linelist').html('');
    if (result) {
      for (var i in result.XA) {
        var fstLine = result.getBusListItem(i);//获取第一个公交列表显示到map上
        busline.getBusLine(fstLine);
      }
    }
  },
  onGetBusLineComplete: function (result) {
    // console.log(result)
    var linename = result.name.replace(/\(.+\)/, '')//.match(linename_regexp);
    var direction = result.name.match(/^(.*)\((.*)\)/);
    $('.linelist').append('<li>\
            <h1 class="linename">'+ linename + '</h1>\
            <div class="linedesc">\
                <p class="direction">'+ direction[2] + '</p>\
                <p class="linetime"><span>首班：'+ result.startTime + '</span><span>末班：' + result.endTime + '</span></p>\
            </div>\
        </li>');
  },
});

function jtcxSearch(linename) {
  var b = new Date
    , a = b.getMonth() + 1 + ""
    , d = b.getDate() + ""
    , c = b.getHours() + ""
    , e = b.getMinutes() + ""
    , b = b.getFullYear() + ""
    , b = b + (1 == a.length ? "0" + a : a)
    , b = b + (1 == d.length ? "0" + d : d)
    , b = b + (1 == c.length ? "0" + c : c)
    , b = b + (1 == e.length ? "0" + e : e)
    , a = "TYMON_" + b;
  $.ajax({
    url: 'http://182.254.143.172/fkgis-gateway/' + a + '/gis/keyquery.json',
    type: 'GET',
    dataType: 'JSON',
    cache: false,
    data: {
      adcode: 310000,
      key: linename,
      searchtype: 'busline',
      datatype: 81300,
      pageNumber: 1,
      pageCount: 1000,
      language: 0,
      // callback: 'search_bus_station_line_callback',
      isresemble: 1,
      t: new Date().getTime()
    },
    success: function (res) {
      $('.loading, .mask').hide();
      $('.linelist').empty();
      res = JSON.parse(res);
      buslist = res.response.result.keyresult;

      for (var i in buslist) {
        var linename = (buslist[i].linename || buslist[i].name).match(/^(.*)\((.*)\)/);

        $('.linelist').append('<li>\
                    <h1 class="linename">'+ linename[1] + '</h1>\
                    <div class="linedesc">\
                        <p class="direction">'+ linename[2] + '</p>\
                        <p class="linetime"><span>首班：5:30</span><span>末班：23:00</span></p>\
                    </div>\
                </li>');
      }
    },
    error: function () {
      $('.loading, .mask').hide();
      alert('请求网络失败，请重试~')
    }
  });
};
/** 百度搜索end **/


$('.searchBtn').click(function () {
  var linename = $('#lineName').val();
  if (!linename) return alert("请输入查询的线路");
  $('.loading, .mask').show();
  // busline.getBusList(linename);
  jtcxSearch(linename);
});

$('.linelist').on('click', 'li', function () {
  $('.stationlist').empty();
  $('.buslinename').html($(this).find('.linename').text());
  $('.busdirection').html($(this).find('.direction').text());
  var site = buslist[$(this).index()].site.split(';');
  for (var i in site) {
    if (site.hasOwnProperty(i)) {
      var station = site[i].split(',')
      $('.stationlist').append('<li><a href="javascipt:;">\
                <div class="list-icon detail-line-no -ft-small">  '+ (parseInt(i) + 1) + '</div>\
                <div class="bus-info"><span class="-ft-middle stationname">'+ station[0] + '<span><br></span></span></div>\
                <p class="rt-info">无实时信息</p>\
                </a></li>');
    }
  }
  $('.busStationList').show().siblings().hide();
});
$('.stationlist').on('click', 'li', function () {
  var _this = $(this);
  $('.loading, .mask').show();
  $('.rt-info').hide();
  _this.addClass('close').siblings().removeClass('close');
  _this.find('.rt-info').show();
  var busname = $('.buslinename').text();
  var stopname = _this.find('.stationname').text();
  var startstop = $('.busdirection').text().split('-')[0];
  var endstop = $('.busdirection').text().split('-')[1];
  $.ajax({
    url: 'http://www.jtcx.sh.cn/dynamictraffic_interface/web/trafficline/carmonitor',
    type: 'GET',
    dataType: 'JSON',
    cache: false,
    data: {
      busname,
      stopname,
      startstop,
      endstop,
      time: new Date().getTime(),
    },
    success: function (res) {
      $('.loading, .mask').hide();
      var rtinfo = JSON.parse(res).result.realtime;
      var arrive = parseInt(rtinfo.time / 60);
      _this.find('.rt-info').html(rtinfo.terminal + '<span>还有' + rtinfo.stopdis + '站</span><span>' + arrive + '分钟</span>').show();
    },
    error: function () {
      $('.loading, .mask').hide();
      alert('请求网络失败，请重试~')
    }
  })
})
