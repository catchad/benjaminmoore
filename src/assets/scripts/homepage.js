function slider(params) {
	// params.container
	var $container = params.container;
	var timer = 0;

	loop();
	function loop() {
		timer ++;

		if( timer == 240 ) {
			var id = $container.find(".slider__item.slider__item--active").index() + 1;
			if( id > $container.find(".slider__item").length-1 ) id = 0;
			$container.find(".slider__item.slider__item--active").removeClass("slider__item--active");
			$container.find(".slider__item").eq(id).addClass("slider__item--active");
			timer = 0;
		}

		requestAnimationFrame(loop);

	}
}


function news(params) {
	// params.container
	var $container = params.container;
	var distance =  40;

	TweenMax.set($container.find(".news__text"), {marginTop: distance});
	TweenMax.set($container.find(".news__text").eq(0), {marginTop: 0});

	var tl = new TimelineMax({repeat:-1});

	$container.find(".news__text").each(function(index, el) {
		var item = $container.find(".news__text").eq(index);
		var nextItem;
		if( index+1 > $container.find(".news__text").length-1 ) {
			nextItem = $container.find(".news__text").eq(0);
		} else {
			nextItem = $container.find(".news__text").eq(index+1);
		}
		

		
		// // if( index > 0 ) {
		// 	// tl.to($(el), 1, {marginTop: 0}, "-=1");
		// // } else {
		// 	tl.to($(el), 1, {marginTop: 0});
		// // }
		
		// tl.to($(el), 1, {marginTop: -100, delay:1});

		
		tl.fromTo(item, 1, {marginTop:0}, {marginTop: -distance, immediateRender:false}, "+=2");

		// if( index == 0 ) {
			// tl.fromTo(item, 1, {marginTop: distance}, {marginTop: 0});
		// } else {
			tl.fromTo(nextItem, 1, {marginTop: distance}, {marginTop: 0, immediateRender:false}, "-=1");
		// }

		// tl.fromTo(nextItem, 1, {marginTop: 100}, {marginTop: 0}, "-=1");	
		

	});
}


new slider({container:$(".slider")});
new news({container:$(".news")});