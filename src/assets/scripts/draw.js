$('.color-picker__wheel').farbtastic();

$(window).resize(canvasResize);
canvasResize();

function canvasResize() {
	// console.log("!!!!");
	var containerSize = {
	    w: $(".image").width(),
	    h: $(".image").height()
	};
	// console.log(containerSize);
    if ($(".image__canvas").width() / ($(".image__canvas").height()) > containerSize.w / containerSize.h) {
        $(".image__canvas").addClass("image__canvas--heightFirst");
    } else {
        $(".image__canvas").removeClass("image__canvas--heightFirst");
    }
}