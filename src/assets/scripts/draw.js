var defaultColor = "#e5a13a";

$(window).ready(function() {
	var colorWheel = $.farbtastic($('.color-picker__wheel'));
	colorWheel.linkTo(colorPickerChange);
	colorWheel.setColor(defaultColor);
})


$(window).resize(canvasResize);
canvasResize();

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


//fake colorlist
// var colorlist = [];
// var rgbChange = 10;
// for (var r = 0; r < 256; r = r + parseInt(255/rgbChange)) {
// 	for (var g = 0; g < 256; g = g + parseInt(255/rgbChange)) {
// 		for (var b = 0; b < 256; b = b + parseInt(255/rgbChange)) {
// 			var rHex = r.toString(16);
// 			if(rHex.length<2) {
// 				rHex = "0" + rHex;
// 			}
// 			var gHex = g.toString(16);
// 			if(gHex.length<2) {
// 				gHex = "0" + gHex;
// 			}
// 			var bHex = b.toString(16);
// 			if(bHex.length<2) {
// 				bHex = "0" + bHex;
// 			}
// 			var hex = "#" + rHex + gHex + bHex;
// 			var name = hex;
// 			colorlist.push({hex,name,r,g,b});
// 		}
// 	}
// }
// console.log(colorlist);

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
console.log(colorlist);


function setDefaultColor(hex) {

}

//選色時被觸發
//進行搜尋並呈現結果
var nowColor;
var collectList = [];
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
		drawColor($(this).data('hex'));
	})
	if(defaultColor==color) {
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
		nowColor = {hex:$(this).data('hex'),name:$(this).data('name')};
		drawColor($(this).data('hex'));
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

$(".collection__opener").on("click",function(){
	$(".fcLayout").toggleClass('fcLayout--collection-active');
})

$(".collection__edit-btn").on("click",function(){
	$(".collection__edit-btn").toggleClass('collection__edit-btn--selected');
	$('.color-item__delete-btn').each(function(i){
	     $(this).toggleClass('color-item__delete-btn--active');
	});
})



//canvas
var imgBgUrl = "../assets/images/living_bg.png";
var imgWallUrl = "../assets/images/living_wall.png";

var imgLoadCount = 0;

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
	// console.log("loaded");
	canvas = document.getElementById("canvas");
	canvas.width = imgBg.width;
	canvas.height = imgBg.height;
	ctx = canvas.getContext('2d');
	drawColor(defaultColor);
}

function drawColor(hex) {
	ctx.fillStyle = hex;
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.drawImage(imgWall,0,0);
	ctx.drawImage(imgBg,0,0);
}