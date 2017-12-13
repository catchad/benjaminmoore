var c = document.querySelector('.gallery__fakeGrid');
var ctx = c.getContext("2d");
var gridPercent;



draw();
function draw() {
	c.width = window.innerWidth;
	c.height = window.innerHeight - 60;


	if( c.width >= 2560 ) {
		gridPercent = 0.2;
	}
	if( c.width < 2560 && c.width > 992 ) {
		gridPercent = 0.25;
	}
	if( c.width <= 992 && c.width > 768 ) {
		gridPercent = 0.3333;
	}
	if( c.width <= 768 ) {
		gridPercent = 0.5;
	}
	console.log( gridPercent );

	for( var i=0; i<Math.ceil(c.height/(c.width*gridPercent)); i++ ) {
		
		for( var j=0; j<1/gridPercent; j++ ) {
			console.log(i + "-" + j);
			ctx.beginPath();
			ctx.rect(c.width*gridPercent*j, c.width*gridPercent*i, c.width*gridPercent, c.width*gridPercent);
			if( i%2 == 0 ) {
				if( j%2 == 0 ) {
					ctx.fillStyle = "#EFEFEF";
				} else {
					ctx.fillStyle = "#E5E5E5";
				}
			} else {
				if( j%2 == 0 ) {
					ctx.fillStyle = "#E5E5E5";
				} else {
					ctx.fillStyle = "#EFEFEF";
				}
			}			
			ctx.fill();
		}
	}
}

window.addEventListener('resize', function(event) {
	draw();
})