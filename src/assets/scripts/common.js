var ImgLoadedChecker = function(params) {
    // params.complete 載入完成回傳函式
    // params.progress 載入進度回傳函式
    params.complete = params.complete || function() {};
    params.progress = params.progress || function() {};

    var imgLoaded = function(el) {
        imgCount++;
        params.progress({
            total: imgTotal,
            count: imgCount,
            percent: Math.floor(imgCount / imgTotal * 100),
            elem: el
        });
        if (imgTotal == imgCount) {
            params.complete();
        }
    }

    var $allImg = $("img");
    var imgTotal = $allImg.length;
    var imgCount = 0;
    $allImg.each(function(index, el) {
        if (!this.complete) {
            $(this).on('load', function(event) {
                imgLoaded(el);
            });
        } else {
            imgLoaded(el);
        }
    });
}

// dsLayout 專用的圖片固定
var dsLayout = function() {
    var wh = window.innerHeight;

    var fixedImgResize = function() {
        wh = window.innerHeight;
        var containerSize = {
            w: $(".dsLayout__fixedImgContainer").eq(0).width(),
            h: $(".dsLayout__fixedImgContainer").eq(0).height()
        };
        
        $(".dsLayout__fixedImgContainer").each(function(index, el) {
            var $img = $(el).find(".dsLayout__fixedImg");

            if ($img.width() / $img.height() > containerSize.w / containerSize.h) {
                $img.addClass("dsLayout__fixedImg--heightFirst");
            } else {
                $img.removeClass("dsLayout__fixedImg--heightFirst");
            }

        });
    }

    var fixedImgScrollUpdate = function() {
        if( $(".dsLayout__fixedImgContainer").length <= 1 ) {
            $(".dsLayout__fixedImgContainer").addClass("dsLayout__fixedImgContainer--active");
            return;
        }

        var scrollTop = $(window).scrollTop();        
        var $fixedImgContainer = $(".dsLayout__fixedImgContainer");

        $(".title").each(function(index, el) {
            if (scrollTop + (wh / 2) > $(el).offset().top) {
                $fixedImgContainer.eq(index).addClass("dsLayout__fixedImgContainer--active");
                $fixedImgContainer.eq(Math.max(index - 1, 0)).addClass("dsLayout__fixedImgContainer--afterActive");
            } else {
                $fixedImgContainer.eq(index).removeClass("dsLayout__fixedImgContainer--active");
                $fixedImgContainer.eq(Math.max(index - 1, 0)).removeClass("dsLayout__fixedImgContainer--afterActive");
            }
        });
    }

    fixedImgResize();
    fixedImgScrollUpdate();
    $(window).on('scroll', fixedImgScrollUpdate);
    $(window).on('resize', fixedImgResize);
}

// vTab 相關程式碼
var vTab = function() {

    var vTabHeightResize = function() {
        $(".vTab__textGroup").each(function(index, el) {
            $(el).css("height", "auto");
            $(el).attr("data-height", $(el).height());
            if( $(el).parents(".vTab__item").hasClass('vTab__item--active') ) {         
                $(el).css("height", $(el).attr("data-height"));
            } else {
                $(el).css("height", 0);
            }


        });

    }

    $(".vTab__title, .vTab__dot").on('click', function(event) {
        var $item = $(this).parents('.vTab__item');
        $item.toggleClass('vTab__item--active');
        var $textGroup = $item.find(".vTab__textGroup");

        if( $item.hasClass('vTab__item--active') ) {            
            $textGroup.css("height", $textGroup.attr("data-height"));
        } else {
            $textGroup.css("height", 0);
        }

    });

    vTabHeightResize();
    $(window).on('resize', vTabHeightResize);
}




new ImgLoadedChecker({
    complete: function() {

        if( $(".dsLayout").length > 0 ) {
            new dsLayout();
        }
        if( $(".vTab").length > 0 ) {
            new vTab();
        }

        setTimeout(function() {
            $(".loading").removeClass("loading--active");
        }, 500);

    },
    progress: function(response) {
        console.log(response);
    }
});


