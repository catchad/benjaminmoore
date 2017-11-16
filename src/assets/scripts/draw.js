$(window).ready(function() {
	var colorWheel = $.farbtastic($('.color-picker__wheel'));
	colorWheel.linkTo(colorPickerChange);
	colorWheel.setColor("#B9862B");
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
        'url': "../assets/scripts/json/BenjaminMoore_ClassicColors_en-us.json",
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})(); 
console.log(colorlist);

//選色時被觸發
//進行搜尋並呈現結果
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
	})

}


//獲得搜尋結果
var maxDelta = 30; //最大差異值
function getColorRange(color) {
	var searchResult = [];
	var center = hexToRgb(color);
	for (var i = 0; i < colorlist.colors.length; i++) {
		var delta = Math.pow(Math.pow(colorlist.colors[i].color[0]*255-center.r,2)+Math.pow(colorlist.colors[i].color[1]*255-center.g,2)+Math.pow(colorlist.colors[i].color[2]*255-center.b,2),0.5);
		if(delta <= maxDelta) {
			searchResult.push({color:colorlist.colors[i],delta});
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

$(".color-info__like-btn").on("click",function(){
	$(".color-info__like-btn").toggleClass('color-info__like-btn--liked');
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