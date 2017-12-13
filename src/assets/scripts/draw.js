// IE array.find polyfill
Array.prototype.find||Object.defineProperty(Array.prototype,"find",{value:function(r){if(null==this)throw new TypeError('"this" is null or not defined');var t=Object(this),e=t.length>>>0;if("function"!=typeof r)throw new TypeError("predicate must be a function");for(var n=arguments[1],o=0;o<e;){var i=t[o];if(r.call(n,i,o,t))return i;o++}}});


var isFirstDraw = true;
var colorPicker;

//讀取本機儲存的顏色收藏
var collectList = localStorage.getItem("collectList");
collectList = JSON.parse(collectList);
if( collectList == null ) {
  collectList = [];
}
refreshCollectList();

//4個房間的預設色彩
var defaultColorList = ["#454b51","#6d6c6e","#e5a039","#c2d2ca"];
var defaultColor;

//依網址後參數設定canvas並讀取圖片
var picIndex = 0;
var imgLoadCount = 0;
var imgBgUrl = "../assets/images/pic{{index}}_bg.png";
var imgWallUrl = "../assets/images/pic{{index}}_mask.png";
setPicUrl();
function setPicUrl(){
	var vars = getUrlVars();
	//設定房間
	if(vars.room) {
		if(vars.room>=1 && vars.room<=4) {
			picIndex = vars.room;
		} else {
			picIndex = 1;
		}
	} else {
		picIndex = 1;
	}
	//設定預設顏色
	if(vars.color) {
		if(/^#[0-9A-F]{6}$/i.test('#'+vars.color)) {
			defaultColor = "#"+vars.color;
		} else {
			defaultColor = defaultColorList[picIndex-1];
		}
	} else {
		defaultColor = defaultColorList[picIndex-1];
	}
}

function getUrlVars(){
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++)
  {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
  }
  return vars;
}

function updateUrl(hex){
	var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?room='+picIndex+'&color='+hex.substring(1,hex.length);
	window.history.replaceState({path:newurl},'',newurl);
}


//設定圖片路徑
imgBgUrl = imgBgUrl.replace("{{index}}",picIndex);
imgWallUrl = imgWallUrl.replace("{{index}}",picIndex);

//載入圖片
var imgBg = new Image();
imgBg.src = imgBgUrl;
imgBg.addEventListener("load", function() {
	imgLoader();
}, false);

var imgWall = new Image();
imgWall.src = imgWallUrl;
imgWall.addEventListener("load", function() {
	imgLoader();
}, false);

function imgLoader() {
	imgLoadCount++;
	if(imgLoadCount==2) {
		imgInit();
	}
}

//圖片載入完畢，設定canvas
var canvas,ctx;
function imgInit() {
	console.log("loaded");
	canvas = document.getElementById("canvas");
	canvas.width = imgBg.width;
	canvas.height = imgBg.height;
	ctx = canvas.getContext('2d');
	canvasResize();
	drawColor(defaultColor);

	//創造選色器
	colorPicker = new ColorPicker();
	//使選色器設定為預設顏色
	colorPicker.setColor(Color(defaultColor).toHsv());
}

//canvas上色
function drawColor(hex) {
	updateUrl(hex);
	ctx.fillStyle = hex;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.drawImage(imgWall,0,0);
	ctx.drawImage(imgBg,0,0);
}

//canvas 自動resize
// $(window).resize(canvasResize);
$(window).on("orientationchange resize load", canvasResize);
function canvasResize() {
	console.log("resize");
	var containerSize = {
	    w: $(".image").width(),
	    h: $(".image").height()
	};
	console.log(containerSize);
	// console.log(($(".image__canvas").width() / ($(".image__canvas").height()))+"\n"+(containerSize.w / containerSize.h));
    if ($(".image__canvas").width() / ($(".image__canvas").height()) > containerSize.w / containerSize.h) {
        $(".image__canvas").addClass("image__canvas--heightFirst");
    } else {
        $(".image__canvas").removeClass("image__canvas--heightFirst");
    }
}


//color picker
var ColorPicker = function() {
	var _this = this;
	var h,s,v;

	$(".sv").on("mousedown",function(event){
		var x = event.pageX - $(".sv").offset().left;
		var y = event.pageY - $(".sv").offset().top;
		s = (x*100)/$(".sv").outerWidth();
		v = (($(".sv").outerHeight()-y)*100)/$(".sv").outerHeight();
		_this.setColor({h:h,s:s,v:v});
	})

	$(".h").on("mousedown",function(event){
		var x = event.pageX - ($(".h").offset().left+$(".h").outerWidth()/2);
		var y = event.pageY - ($(".h").offset().top+$(".h").outerHeight()/2);
		h = Math.atan2(y, x) * 180 / Math.PI;
		h = h>=0?h:h+360;
		_this.setColor({h:h,s:s,v:v});
	})

	var htSV = new Hammer($(".sv")[0]);
	htSV.on("panstart panmove", function(ev){
		ev.preventDefault();
		var x = ev.center.x - $(".sv").offset().left;
		var y = ev.center.y + window.pageYOffset - $(".sv").offset().top;
		//修正滑鼠在選擇器外面時的坐標
		if(x < 0) x = 0;
		if(y < 0) y = 0;
		if(x >= $(".sv").outerWidth()) x = $(".sv").outerWidth()-1;
		if(y >= $(".sv").outerHeight()) y = $(".sv").outerHeight()-1;
		s = (x*100)/$(".sv").outerWidth();
		v = (($(".sv").outerHeight()-y)*100)/$(".sv").outerHeight();
		_this.setColor({h:h,s:s,v:v});
	})
	var htH = new Hammer($(".h")[0]);
	htH.on("panstart panmove", function(ev){
		ev.preventDefault();
		var x = ev.center.x - ($(".h").offset().left+$(".h").outerWidth()/2);
		var y = ev.center.y + window.pageYOffset - ($(".h").offset().top+$(".h").outerHeight()/2);
		h = Math.atan2(y, x) * 180 / Math.PI;
		h = h>=0?h:h+360;
		_this.setColor({h:h,s:s,v:v});
	})

	//sv換色
	function changeSV(h) {
		var hsv = Color( {h:h,s:100,v:100} );
		$(".sv").css("background-color",hsv.toString());
		$(".h__picker").css("background-color",hsv.toString());
	}

	//hsv : {h,s,v}
	this.setColor = function(hsv) {
		var hex = Color(hsv).toString();

		h = hsv.h;
		s = hsv.s;
		v = hsv.v;

		//畫面變動
		changeSV(hsv.h);
		$(".h__picker-container").css("transform","rotate("+hsv.h+"deg)");
		var x = hsv.s*$(".sv").outerWidth()/100;
		var y = $(".sv").outerHeight() - hsv.v*$(".sv").outerHeight()/100;
		$(".sv__picker").css("top",y);
		$(".sv__picker").css("left",x);

		//callback
		colorPickerChange(hex);
	}
}


//載入油漆色票
var colorlist = (function () {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "../assets/scripts/json/colors.json",
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})(); 

//選色時被觸發，進行搜尋並呈現結果
var nowColor;
var searchResult;
function colorPickerChange(color) {
	//清空搜尋結果
	$(".color-select__list").html("");
	//進行搜尋
	searchResult = getColorRange(color);

	//依照搜尋結果生成結果並放入與填色
	var colorDomTemplate = "<div data-hex='{{hex}}' data-name='{{name}}' class='color-select__color'></div>";
	for (var i = 0; i < searchResult.length; i++) {
		var rgb = [parseInt(searchResult[i].color.color[0]*255),parseInt(searchResult[i].color.color[1]*255),parseInt(searchResult[i].color.color[2]*255)]
		var hex = rgbToHex(rgb[0],rgb[1],rgb[2]);
		var colorDom = colorDomTemplate.replace("{{hex}}",hex)
										.replace("{{name}}",searchResult[i].color.name);
		$(".color-select__list").append(colorDom);
	}
	$('.color-select__color').each(function(i){
	     $(this).css("background-color",$(this).data('hex'));
	});

	//點擊事件綁定，進行換色
	$('.color-select__color').on("click", function(){
		$(".color-info__color").css("background-color",$(this).data('hex') );
		$(".color-info__name").html($(this).data('name'));
		$(".color-select__color--selected").removeClass('color-select__color--selected');
		$(this).addClass('color-select__color--selected');
		nowColor = {hex:$(this).data('hex'),name:$(this).data('name')};

		//確認所選顏色是否已收藏，切換收藏按鈕狀態
		var result = collectList.find(function(data){
			return data.name == nowColor.name;
		});
		if(result) {
			$(".color-info__like-btn").addClass('color-info__like-btn--liked');
		} else {
			$(".color-info__like-btn").removeClass('color-info__like-btn--liked');
		} 

		//著色
		drawColor($(this).data('hex'));
	})

	//初始化自動填入預設色彩
	if(isFirstDraw) {
		isFirstDraw = false;
		$('.color-select__color:first-child').click();
	}

}


//依指定色碼，從油漆色票中進行搜尋
//具體方式是在三維空間以(r,g,b)作為座標計算兩者距離，越近表示越相似
var maxDelta = 30; //最大差異值
var maxResult = 20; //搜尋結果數目上限
function getColorRange(color) {
	var searchResult = [];
	var center = hexToRgb(color);
	for (var i = 0; i < colorlist.length; i++) {
		var delta = Math.pow(Math.pow(colorlist[i].color[0]*255-center.r,2)+Math.pow(colorlist[i].color[1]*255-center.g,2)+Math.pow(colorlist[i].color[2]*255-center.b,2),0.5);
		if(delta <= maxDelta) {
			searchResult.push({color:colorlist[i],delta:delta});
		}
	}
	//照差異度做排序
	searchResult.sort(function(a, b) {
	  return a.delta - b.delta;
	});
	//只留前幾個結果
	return searchResult.slice(0, maxResult);
}

//色彩編碼轉換
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function clickColor(color) {
	// color.hex
	// color.name

	$(".color-info__color").css("background-color",color.hex );
	$(".color-info__name").html(color.name);
	var index = -1;
	searchResult.find(function(data){
		index++;
		return data.color.name == color.name;
	});

	var resultDom = $('.color-select__color')[index];
	console.log(resultDom);


	$(".color-select__color--selected").removeClass('color-select__color--selected');
	$(resultDom).addClass('color-select__color--selected');
	nowColor = {hex:color.hex,name:color.name};

	//確認所選顏色是否已收藏，切換收藏按鈕狀態
	var result = collectList.find(function(data){
		return data.name == nowColor.name;
	});
	if(result) {
		$(".color-info__like-btn").addClass('color-info__like-btn--liked');
	} else {
		$(".color-info__like-btn").removeClass('color-info__like-btn--liked');
	} 

	//著色
	drawColor(color.hex);
}


//收藏清單與介面更新
function refreshCollectList() {
	//將現在的清單送入本機儲存
	localStorage.setItem("collectList", JSON.stringify(collectList));
	//介面清空
	$(".collection__list").html("");

	//生成清單元素並放入介面與填色
	var collectDomTemplate = "<div class='color-item' data-index={{index}} data-hex='{{hex}}' data-name='{{name}}'><div class='color-item__delete-btn'>×</div><div class='color-item__color'></div><div class='color-item__name'>{{name-text}}</div>"
	for (var i = 0; i < collectList.length; i++) {
		var collectDom = collectDomTemplate.replace("{{index}}",i)
											.replace("{{hex}}",collectList[i].hex)
											.replace("{{name}}",collectList[i].name)
											.replace("{{name-text}}",collectList[i].name);
		$(".collection__list").append(collectDom);
	}
	$('.color-item__color').each(function(i){
	    $(this).css("background-color",$(this).parent(".color-item").data("hex"));
	});

	//如果編輯按鈕啟動中則顯示刪除按鈕，反之則隱藏
	if($(".collection__edit-btn").hasClass('collection__edit-btn--selected')){
		$('.color-item__delete-btn').each(function(i){
			$(this).addClass('color-item__delete-btn--active');
		});
	}

	//按下刪除按鈕則刪除該元素
	$(".color-item__delete-btn").on("click",function(){
		if(nowColor.name == $(this).parent(".color-item").data('name')) {
			$(".color-info__like-btn").removeClass('color-info__like-btn--liked');
		}
		var index = $(this).parent(".color-item").data("index");
		deleteFromCollect(index);
	})

	//按下元素本身，則依元素中的資料進行填色
	$(".color-item").on("click",function(){
		colorPicker.setColor(Color($(this).data('hex')).toHsv());
		clickColor({hex:$(this).data('hex'),name:$(this).data('name')});
	})

	// 更新 mailto 的參數
	var emailLink = "mailto:bm@sensedesign.com.tw?subject=你好，我想了解這幾個顏色&body=";
	for( var i=0; i<collectList.length; i++ ) {
		emailLink += collectList[i].name + "%0D%0A";
	}
	$(".collection__mail-btn").attr("href", emailLink);
}



//收藏按鈕
$(".color-info__like-btn").on("click",function(){
	//確認所選顏色是否已在收藏清單
	//若沒有，點擊後加入收藏清單
	//若有，點擊後自收藏清單刪除
	var index = -1;
	var result = collectList.find(function(data){
		index++;
		return data.name == nowColor.name;
	});
	if(result) {
		$(".color-info__like-btn").removeClass('color-info__like-btn--liked');
		deleteFromCollect(index);
	} else {
		$(".color-info__like-btn").addClass('color-info__like-btn--liked');
		addToCollect(nowColor);
	}
})

//加入顏色到收藏清單
function addToCollect(color){
	collectList.push(color);
	refreshCollectList();
}
//從收藏清單刪除顏色
function deleteFromCollect(index){
	collectList.splice(index, 1);
	refreshCollectList();
}

//收藏清單介面控制
$(".color-info__collect-btn").on("click",function(){
	$(".fcLayout").toggleClass('fcLayout--collection-active');
})

$(".collection__opener, .collection__btn-close").on("click",function(){
	$(".fcLayout").toggleClass('fcLayout--collection-active');
})

//編輯按鈕
$(".collection__edit-btn").on("click",function(){
	$(".collection__edit-btn").toggleClass('collection__edit-btn--selected');
	$('.color-item__delete-btn').each(function(i){
	     $(this).toggleClass('color-item__delete-btn--active');
	});
})