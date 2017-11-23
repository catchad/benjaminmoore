//讀取本機儲存的顏色收藏
var collectList = localStorage.getItem("collectList");
collectList = JSON.parse(collectList);
if( collectList == null ) {
  collectList = [];
}
refreshCollectList();


var defaultColorList = ["#454b51","#6d6c6e","#e5a039","#c2d2ca"];
var defaultColor;
var isFirstDraw = true;
var colorPicker;

//依網址後參數設定canvas並讀取圖片
var picIndex = 0;
var imgLoadCount = 0;
var imgBgUrl = "../assets/images/pic{{index}}_bg.png";
var imgWallUrl = "../assets/images/pic{{index}}_mask.png";
setPicUrl();
function setPicUrl(){
	if(window.location.href.indexOf('?') != -1) {
		var hash = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		if(hash>=1 && hash<=4) {
			picIndex = hash[0];
		} else {
			picIndex = 1;
		}
	} else {
		picIndex = 1;
	}
	console.log(picIndex);
	defaultColor = defaultColorList[picIndex-1];
}
imgBgUrl = imgBgUrl.replace("{{index}}",picIndex);
imgWallUrl = imgWallUrl.replace("{{index}}",picIndex);

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

var canvas,ctx;
function imgInit() {
	console.log("loaded");
	canvas = document.getElementById("canvas");
	canvas.width = imgBg.width;
	canvas.height = imgBg.height;
	ctx = canvas.getContext('2d');
	canvasResize();
	drawColor(defaultColor);

	colorPicker = new ColorPicker(Color(defaultColor).toHsv());
	colorPicker.setColor();
}

//canvas上色
function drawColor(hex) {
	ctx.fillStyle = hex;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.drawImage(imgWall,0,0);
	ctx.drawImage(imgBg,0,0);
}

//canvas auto cover
$(window).resize(canvasResize);
function canvasResize() {
	var containerSize = {
	    w: $(".image").width(),
	    h: $(".image").height()
	};
    if ($(".image__canvas").width() / ($(".image__canvas").height()) > containerSize.w / containerSize.h) {
        $(".image__canvas").addClass("image__canvas--heightFirst");
    } else {
        $(".image__canvas").removeClass("image__canvas--heightFirst");
    }
}

//color picker
var ColorPicker = function(defaultColor) {
	var _this = this;
	defaultColor = defaultColor || {h:0,s:0,v:0};
	var h = defaultColor.h;
	var s = defaultColor.s;
	var v = defaultColor.v;

	var isSelectSV = false;
	$(".sv").on("mousedown",function(event){
		isSelectSV = true;
		var x = event.pageX - $(".sv").offset().left;
		var y = event.pageY - $(".sv").offset().top;
		s = (x*100)/$(".sv").outerWidth();
		v = (($(".sv").outerHeight()-y)*100)/$(".sv").outerHeight();
		_this.setColor({h,s,v});
	})

	var isSelectH = false;
	$(".h").on("mousedown",function(event){
		isSelectH = true;
		var x = event.pageX - ($(".h").offset().left+$(".h").outerWidth()/2);
		var y = event.pageY - ($(".h").offset().top+$(".h").outerHeight()/2);
		h = Math.atan2(y, x) * 180 / Math.PI;
		h = h>=0?h:h+360;
		_this.setColor({h,s,v});
	})

	// $("body").on("mousemove", function(event) {
	// 	if(isSelectSV) {
	// 		var x = event.pageX - $(".sv").offset().left;
	// 		var y = event.pageY - $(".sv").offset().top;
	// 		//修正滑鼠在選擇器外面時的坐標
	// 		if(x < 0) x = 0;
	// 		if(y < 0) y = 0;
	// 		if(x >= $(".sv").outerWidth()) x = $(".sv").outerWidth()-1;
	// 		if(y >= $(".sv").outerHeight()) y = $(".sv").outerHeight()-1;
	// 		// changePickerSV(x,y);
	// 		s = (x*100)/$(".sv").outerWidth();
	// 		v = (($(".sv").outerHeight()-y)*100)/$(".sv").outerHeight();
	// 		_this.setColor({h,s,v});
	// 	}
	// 	if(isSelectH) {
	// 		var x = event.pageX - ($(".h").offset().left+$(".h").outerWidth()/2);
	// 		var y = event.pageY - ($(".h").offset().top+$(".h").outerHeight()/2);
	// 		h = Math.atan2(y, x) * 180 / Math.PI;
	// 		h = h>=0?h:h+360;
	// 		// changePickerH(h);
	// 		_this.setColor({h,s,v});
	// 	}
	// })

	$("body").on("mouseup", function(event) {
		//結束選取顏色
		isSelectSV = false;
		isSelectH = false;
	})

	//sv換色
	function changeSV(h) {
		var hsv = Color( {h:h,s:100,v:100} );
		$(".sv").css("background-color",hsv.toString());
		$(".h__picker").css("background-color",hsv.toString());
	}

	this.setColor = function(hsv) {
		hsv = hsv || {h:defaultColor.h,s:defaultColor.s,v:defaultColor.v};
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

		colorPickerChange(hex);

	}

	// mobile touch
	var htSV = new Hammer($(".sv")[0]);

	htSV.on("panstart", function(ev){
		isSelectSV = true;
		ev.preventDefault();
		var x = ev.center.x - $(".sv").offset().left;
		var y = ev.center.y + document.body.scrollTop - $(".sv").offset().top;
		s = (x*100)/$(".sv").outerWidth();
		v = (($(".sv").outerHeight()-y)*100)/$(".sv").outerHeight();
		_this.setColor({h,s,v});
	})
	var htH = new Hammer($(".h")[0]);

	htH.on("panstart", function(ev){
		isSelectH = true;
		ev.preventDefault();
		var x = ev.center.x - ($(".h").offset().left+$(".h").outerWidth()/2);
		var y = ev.center.y + document.body.scrollTop - ($(".h").offset().top+$(".h").outerHeight()/2);
		h = Math.atan2(y, x) * 180 / Math.PI;
		h = h>=0?h:h+360;
		_this.setColor({h,s,v});
	})


	var ht = new Hammer($("body")[0]);
	ht.on('panstart panmove', function(ev) {
		if(isSelectSV) {
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
			_this.setColor({h,s,v});
		}
		if(isSelectH) {
			ev.preventDefault();
			var x = ev.center.x - ($(".h").offset().left+$(".h").outerWidth()/2);
			var y = ev.center.y + window.pageYOffset - ($(".h").offset().top+$(".h").outerHeight()/2);
			h = Math.atan2(y, x) * 180 / Math.PI;
			h = h>=0?h:h+360;
			_this.setColor({h,s,v});
		}
	});
	ht.on('panend', function(ev) {
		//結束選取顏色
		console.log("end");
		isSelectSV = false;
		isSelectH = false;
	});
}



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

//選色時被觸發
//進行搜尋並呈現結果
var nowColor;
function colorPickerChange(color) {
	$(".color-select__list").html("");
	var searchResult = getColorRange(color);
	var colorDomTemplate = "<div data-hex='{{hex}}' data-name='{{name}}' class='color-select__color'></div>"
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
	$('.color-select__color').on("click", function(){
		$(".color-info__color").css("background-color",$(this).data('hex') );
		$(".color-info__name").html($(this).data('name'));
		$(".color-select__color--selected").removeClass('color-select__color--selected');
		$(this).addClass('color-select__color--selected');
		nowColor = {hex:$(this).data('hex'),name:$(this).data('name')};

		//確認所選顏色是否已收藏
		var result = collectList.find(function(data){
			return data.name == nowColor.name;
		});
		if(result) {
			$(".color-info__like-btn").addClass('color-info__like-btn--liked');
		} else {
			$(".color-info__like-btn").removeClass('color-info__like-btn--liked');
		}
		console.log($(this).data('hex'));
		drawColor($(this).data('hex'));
	})
	if(isFirstDraw) {
		// console.log($('.color-select__color:first-child'));
		isFirstDraw = false;
		$('.color-select__color:first-child').click();
	}

}


//獲得搜尋結果
var maxDelta = 30; //最大差異值
function getColorRange(color) {
	var searchResult = [];
	var center = hexToRgb(color);
	for (var i = 0; i < colorlist.length; i++) {
		var delta = Math.pow(Math.pow(colorlist[i].color[0]*255-center.r,2)+Math.pow(colorlist[i].color[1]*255-center.g,2)+Math.pow(colorlist[i].color[2]*255-center.b,2),0.5);
		if(delta <= maxDelta) {
			searchResult.push({color:colorlist[i],delta});
		}
	}
	//照差異度做排序
	searchResult.sort(function(a, b) {
	  return a.delta - b.delta;
	});
	return searchResult;

}

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



function addToCollect(color){
	collectList.push(color);
	refreshCollectList();
}

function deleteFromCollect(index){
	collectList.splice(index, 1);
	refreshCollectList();
}

function refreshCollectList() {
	localStorage.setItem("collectList", JSON.stringify(collectList));
	$(".collection__list").html("");

	var collectDomTemplate = "<div class='color-item' data-index={{index}} data-hex='{{hex}}' data-name='{{name}}'><div class='color-item__delete-btn'>×</div><div class='color-item__color'></div><div class='color-item__name'>{{name-text}}</div>"
	for (var i = 0; i < collectList.length; i++) {
		var collectDom = collectDomTemplate.replace("{{index}}",i)
											.replace("{{hex}}",collectList[i].hex)
											.replace("{{name}}",collectList[i].name)
											.replace("{{name-text}}",collectList[i].name);
		$(".collection__list").append(collectDom);
	}
	if($(".collection__edit-btn").hasClass('collection__edit-btn--selected')){
		$('.color-item__delete-btn').each(function(i){
			$(this).addClass('color-item__delete-btn--active');
		});
	}
	$('.color-item__color').each(function(i){
	    $(this).css("background-color",$(this).parent(".color-item").data("hex"));
	});
	$(".color-item__delete-btn").on("click",function(){
		var index = $(this).parent(".color-item").data("index");
		deleteFromCollect(index);
	})
	$(".color-item").on("click",function(){
		$(".color-info__color").css("background-color",$(this).data('hex') );
		$(".color-info__name").html($(this).data('name'));
		$(".color-info__like-btn").addClass('color-info__like-btn--liked');
		nowColor = {hex:$(this).data('hex'),name:$(this).data('name')};
		drawColor($(this).data('hex'));
		colorPicker.setColor(Color($(this).data('hex')).toHsv());
	})

}

$(".color-info__like-btn").on("click",function(){
	//確認所選顏色是否已收藏
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

$(".color-info__collect-btn").on("click",function(){
	$(".fcLayout").toggleClass('fcLayout--collection-active');
})

$(".collection__opener, .collection__btn-close").on("click",function(){
	$(".fcLayout").toggleClass('fcLayout--collection-active');
})

$(".collection__edit-btn").on("click",function(){
	$(".collection__edit-btn").toggleClass('collection__edit-btn--selected');
	$('.color-item__delete-btn').each(function(i){
	     $(this).toggleClass('color-item__delete-btn--active');
	});
})