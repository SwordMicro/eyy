// Fix iPhone viewport scaling bug on orientation change
// By @mathias, @cheeaun and @jdalton
if (navigator.userAgent.match(/iPhone|iPad/i)) {
	(function(doc){
		var addEvent = 'addEventListener', type = 'gesturestart', qsa = 'querySelectorAll', scales = [1, 1], meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];
		function fix() {
			meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
			doc.removeEventListener(type, fix, true);
		}
		if (( meta = meta[meta.length - 1]) && addEvent in doc) {
			fix();
			scales = [.25, 1.6];
			doc[addEvent](type, fix, true);
		}
	}(document));
}

//////////////////////////////
// Test if touch event exists
//////////////////////////////
function is_touch_device() {
	try {
		document.createEvent("TouchEvent");
		return true;
	} catch(e) {
		return false;
	}
}

// Initialize Audio Player
function doAudio(context){
	jQuery('.f-embed-audio', context).each(function(index){
		$this = jQuery(this);
		f_id = $this.attr('id');
		
		if('yes' == $this.data('html5incompl')){
			up = $this.parent().parent();
			
			AudioPlayer.embed( f_id, { soundFile: $this.data('src') } );
			
			if(jQuery.browser.mozilla) {
				tempaud=document.getElementsByTagName("audio")[0];
				jQuery(tempaud).remove();
				jQuery("div.audio_wrap div").show()
			} else {
				jQuery("div.audio_wrap div *").remove();
			}
		}
	});
}

jQuery(document).ready(function($){

	// Prepare vars
	var tileFlipped = false;	
		
	/////////////////////////////////////////////
	// Flip Block
	/////////////////////////////////////////////
	$(document).on('mouseover mouseout touchstart', '.tile-post.image, .tile-post.map, .portfolio-post', function(event) {
		$o = $(this);
		if (event.type == 'mouseover') {
			$('.tile-flip', $o).addClass('tile-flipped');
			$o.css('z-index', '999');
		} else if (event.type == 'mouseout') {
			$('.tile-flip', $o).removeClass('tile-flipped');
			$o.css('z-index', '1');
		} else if (event.type == 'touchstart') {
			if(!tileFlipped){
				$('.tile-flip', $o).addClass('tile-flipped');
				$o.css('z-index', '999');
			} else {
				$('.tile-flip', $o).removeClass('tile-flipped');
				$o.css('z-index', '1');
			}
			tileFlipped = !tileFlipped;
		}
	});

	/////////////////////////////////////////////
	// HTML5 placeholder fallback				
	/////////////////////////////////////////////
	$('[placeholder]').focus(function() {
	  var input = $(this);
	  if (input.val() == input.attr('placeholder')) {
	    input.val('');
	    input.removeClass('placeholder');
	  }
	}).blur(function() {
	  var input = $(this);
	  if (input.val() == '' || input.val() == input.attr('placeholder')) {
	    input.addClass('placeholder');
	    input.val(input.attr('placeholder'));
	  }
	}).blur();
	$('[placeholder]').parents('form').submit(function() {
	  $(this).find('[placeholder]').each(function() {
	    var input = $(this);
	    if (input.val() == input.attr('placeholder')) {
		 input.val('');
	    }
	  })
	});
	
	// Show/Hide direction arrows
	$(document).on('mouseover mouseout', '.tile-post .slideshow-wrap', function(event) {
		if (event.type == 'mouseover') {
			if( $(window).width() > 600 ){
				$('.carousel-nav-wrap', $(this)).css('display', 'block');
			}
		} else {
			if( $(window).width() > 600 ){
				$('.carousel-nav-wrap', $(this)).css('display', 'none');
			}
		}
	});
	
	$(document).on('mouseover mouseout', '.portfolio-post .slideshow-wrap', function(event) {
		if (event.type == 'mouseover') {
			if( $(window).width() > 600 ){
				$('.carousel-nav-wrap .carousel-prev, .carousel-nav-wrap .carousel-next', $(this)).css('display', 'block');
			}
		} else {
			if( $(window).width() > 600 ){
				$('.carousel-nav-wrap .carousel-prev, .carousel-nav-wrap .carousel-next', $(this)).css('display', 'none');
			}
		}
	});
	
	/////////////////////////////////////////////
	// Scroll to top 							
	/////////////////////////////////////////////
	$('.back-top a').click(function () {
		$('body,html').animate({
			scrollTop: 0
		}, 800);
		return false;
	});

	/////////////////////////////////////////////
	// Toggle menu on mobile 							
	/////////////////////////////////////////////
	$("#menu-icon").click(function(){
		$("#headerwrap #main-nav").fadeToggle();
		$(this).toggleClass("active");
	});
	
	// Set path to audio player
	AudioPlayer.setup(themifyScript.audioPlayer, {
		width: '90%',
		transparentpagebg: 'yes'
	});
	
});

jQuery(function($){
	
	function infiniteIsotope(containerSelector, itemSelectorIso, itemSelectorInf, containerInfinite, doIso, isoColW){
		
		// Get max pages for regular category pages and home
		var scrollMaxPages = parseInt(themifyScript.maxPages),
			$container = $(containerSelector),
			$containerInfinite = $(containerInfinite);
		// Get max pages for Query Category pages
		if( typeof qp_max_pages != 'undefined')
			scrollMaxPages = qp_max_pages;
	
		if( (! $('body.list-post').length > 0) && doIso ){
			// isotope init
			$container.isotope({
				masonry: {
					columnWidth: isoColW
				},
				itemSelector : itemSelectorIso,
				transformsEnabled : false,
				animationEngine: 'jquery',
				onLayout: function( $elems, instance){
					$('.portfolio-post .tile-flip').css('position', 'absolute');
				}
			});
			$(window).resize();
		}

		// infinite scroll
		$containerInfinite.infinitescroll({
			navSelector  : '#load-more a:last', 		// selector for the paged navigation
			nextSelector : '#load-more a:last', 		// selector for the NEXT link (to page 2)
			itemSelector : itemSelectorInf, 	// selector for all items you'll retrieve
			loadingText  : '',
			donetext     : '',
			loading 	 : { img: themifyScript.loadingImg },
			maxPage      : scrollMaxPages,
			behavior	 : 'auto' != themifyScript.autoInfinite? 'twitter' : '',
			pathParse 	 : function (path, nextPage) {
				return path.match(/^(.*?)\b2\b(?!.*\b2\b)(.*?$)/).slice(1);
			}
		}, function(newElements) {
			// call Isotope for new elements
			var $newElems = $(newElements);
			
			// Mark new items: remove newItems from already loaded items and add it to loaded items
			$('.post.newItems').removeClass('newItems');
			$newElems.addClass('newItems');
			
			$newElems.hide().imagesLoaded(function(){
				
				$(this).show();
				$('#infscr-loading').fadeOut('normal');
				if( 1 == scrollMaxPages ){
					$('#load-more, #infscr-loading').remove();
				}
				
				// For audio player
				doAudio($newElems);
				
				// Create carousel on portfolio new items
				createCarousel($('.portfolio-post.newItems .slideshow'));
				
				$('.portfolio-post').each(function(index){
					$this = $(this);
					thisH = $('.tile-flip img', $this).height();
					$('.tile-flip', $this).css({'height': thisH});
					$this.css({'height': thisH});
				});
				
				if( (! $('body.list-post').length > 0) && doIso ){
					$container.isotope('appended', $newElems );
				}
				
				// Apply lightbox/fullscreen gallery to new items
				if(typeof ThemifyGallery !== undefined){ ThemifyGallery.init({'context': $newElems}); }
			});

			scrollMaxPages = scrollMaxPages - 1;
			if( 1 < scrollMaxPages && 'auto' != themifyScript.autoInfinite)
				$('#load-more a').show();
		});
		
		// disable auto infinite scroll based on user selection
		if( 'auto' == themifyScript.autoInfinite ){
			jQuery('#load-more, #load-more a').hide();
		}

	}
	
	function createCarousel(obj){
		obj.each(function(){
			$this = $(this);
			$this.carouFredSel({
				responsive: true,
				prev: '#' + $this.data('id') + ' .carousel-prev',
				next: '#' + $this.data('id') + ' .carousel-next',
				pagination: { container: '#' + $this.data('id') + ' .carousel-pager' },
				circular: true,
				infinite: true,
				scroll: {
					items: 1,
					wipe: true,
					fx: $this.data('effect'),
					duration: parseInt($this.data('speed'))
				},
				auto: {
					play: 'off' != $this.data('autoplay')? true: false,
					pauseDuration: 'off' != $this.data('autoplay')? parseInt($this.data('autoplay')): 0,
				},
				items: {
					visible: { min: 1, max: 1 },
					width: 222
				},
				onCreate: function(){
					$('.portfolio-post .slideshow-wrap').css({'visibility':'visible', 'height':'auto'});
					$('.portfolio-post .carousel-nav-wrap .carousel-prev, .portfolio-post .carousel-nav-wrap .carousel-next').hide();
				}
			});
		});
	}
	
	$(window).load(function(){
		// Lightbox / Fullscreen initialization ///////////
		if(typeof ThemifyGallery !== undefined){ ThemifyGallery.init({'context': jQuery(themifyScript.lightboxContext)}); }
		
		if(typeof (jQuery.fn.carouFredSel) !== 'undefined'){
			createCarousel($('.portfolio-post .slideshow'));
			$('.tile .slideshow').each(function(){
				$this = $(this);
				$this.carouFredSel({
					responsive: true,
					prev: '#' + $this.data('id') + ' .carousel-prev',
					next: '#' + $this.data('id') + ' .carousel-next',
					pagination: { container: '#' + $this.data('id') + ' .carousel-pager' },
					circular: true,
					infinite: true,
					scroll: {
						items: 1,
						wipe: true,
						fx: $this.data('effect'),
						duration: parseInt($this.data('speed'))
					},
					auto: {
						play: 'off' != $this.data('autoplay')? true: false,
						pauseDuration: 'off' != $this.data('autoplay')? parseInt($this.data('autoplay')): 0,
					},
					items: {
						visible: { min: 1, max: 1 },
						width: 326
					},
					onCreate: function(){
						$('.tile .slideshow-wrap').css({'visibility':'visible', 'height':'auto'});
					}
				});
			});
		}
		
		// For audio player
		doAudio(document);
		
		$('.portfolio-post').each(function(index){
			$this = $(this);
			thisH = $('.tile-flip img', $this).height();
			$('.tile-flip', $this).css({'height': thisH});
			$this.css({'height': thisH});
		});

		// Check if isotope is enabled
		if(typeof (jQuery.fn.isotope) !== 'undefined'){
			
			if($('.tile').length > 0){
				// isotope container, isotope item, item fetched by infinite scroll, infinite scroll
				infiniteIsotope('.tile-wrapper', '.tile', '#content .tile', '.tile-wrapper', true, 168);
			}
			
			if($('.portfolio-post').length > 0){
				// isotope container, isotope item, item fetched by infinite scroll, infinite scroll
				infiniteIsotope('.portfolio-wrapper', '.portfolio-post', '.portfolio-post', '.portfolio-wrapper', true, '');
			}
			
			if($('.post').length > 0){
				// isotope container, isotope item, item fetched by infinite scroll, infinite scroll
				infiniteIsotope('.loops-wrapper', '.post', '#content .post', '.loops-wrapper', true, '');
			}

			/////////////////////////////////////////////
			// Post filtering
			/////////////////////////////////////////////
			if($(".sorting-nav li a").length > 0){
				$(".sorting-nav li a").bind("click", function(e){
					e.preventDefault();
					$(".sorting-nav .active").removeClass("active");
					var el = $(this).parents("li"), sortable = $(".loops-wrapper");
					el.addClass("active");
					if(el.hasClass('all')){
						sortable.isotope({ filter : ".post" });
					} else {
						sortable.isotope({ filter : ".cat-" + el.attr('class').replace(/cat-item/g,"").replace(/-/g,"").replace(/active/g,"").replace(" ","")  });
					}
				});
			}
		}

	});
});