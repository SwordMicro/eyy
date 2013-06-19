// Themify Lightbox and Fullscreen /////////////////////////
var ThemifyGallery = {};

(function($){

ThemifyGallery = {
	
	config: {
		fullscreen: themifyScript.lightbox.fullscreenSelector,
		lightbox: themifyScript.lightbox.lightboxSelector,
		lightboxGallery: themifyScript.lightbox.gallerySelector,
		lightboxContentImages: themifyScript.lightbox.lightboxContentImagesSelector,
		context: document
	},
	
	init: function(config){
		if (config && typeof(config) == 'object') {
			$.extend(ThemifyGallery.config, config);
		}
		if (config.extraLightboxArgs && typeof(config) == 'object') {
			for (var attrname in config.extraLightboxArgs) {
				themifyScript.lightbox[attrname] = config.extraLightboxArgs[attrname];
			}
		}
		this.general();
		this.parseArgs();
		this.doLightbox();
		this.doFullscreen();
	},
	
	general: function(){
		context = this.config.context;
	},
	
	parseArgs: function(){
		$.each(themifyScript.lightbox, function(index, value){
			if( 'false' == value || 'true' == value ){
				themifyScript.lightbox[index] = 'false'!=value;
			} else if( parseInt(value) ){
				themifyScript.lightbox[index] = parseInt(value);
			} else if( parseFloat(value) ){
				themifyScript.lightbox[index] = parseFloat(value);
			}
		});
	},
	
	doLightbox: function(){
		context = this.config.context;

		if(screen.width >= themifyScript.lightbox.screenWidthNoLightbox && (typeof($.fn.prettyPhoto) !== 'undefined') && (typeof(themifyScript.lightbox.lightboxOn) !== 'undefined')) {
			$.fn.prettyPhoto(themifyScript.lightbox);
			
			// Lightbox Link
			$(context).on('click', ThemifyGallery.config.lightbox, function(event){
				event.preventDefault();
				if(ThemifyGallery.isInIframe()){
					window.parent.jQuery.prettyPhoto.open($(this).attr('href'), '', '');
				} else {
					$.prettyPhoto.open($(this).attr('href'), '', '');
				}
			});
			
			// Images in post content
			$(themifyScript.lightbox.contentImagesAreas, context).each(function(index) {
				var $elf = $(this),
					images = [],
					titles = [],
					descriptions = [];
					links = [];
				if(themifyScript.lightbox.lightboxContentImages && themifyScript.lightbox.lightboxGalleryOn){
					$(ThemifyGallery.config.lightboxContentImages, $(this)).filter( function(index){
						if(!$(this).parent().hasClass('gallery-icon') && !$(this).hasClass('lightbox')){
							links.push($(this));
							images.push($(this).attr('href'));
							titles.push($(this).attr('title'));
							if($(this).next('.wp-caption-text').length > 0){
								// If there's a caption set for the image, use it
								descriptions.push($(this).next('.wp-caption-text').html());
							} else {
								// Otherwise, see if there's an alt attribute set
								descriptions.push($(this).children('img').attr('alt'));
							}
							return $(this);
						}
					}).each(function(index) {
						if (links.length > 0) {
							$(this).on('click', function(event){
								event.preventDefault();
								if(ThemifyGallery.isInIframe()){
									window.parent.jQuery.prettyPhoto.open(images, titles, descriptions);
									window.parent.jQuery.prettyPhoto.changePage(index);
								} else {
									$.prettyPhoto.open(images, titles, descriptions);
									$.prettyPhoto.changePage(index);
								}
							});
						}
					});
				}
			});
			
			// Images in WP Gallery
			if(themifyScript.lightbox.lightboxGalleryOn){
				$(context).on('click', ThemifyGallery.config.lightboxGallery, function(event){
					event.preventDefault();
					var $a = $(this),
						images = [],
						titles = [],
						descriptions = [];
					$(ThemifyGallery.config.lightboxGallery, $a.parent().parent().parent()).each(function(index) {
						images.push($(this).attr('href'));
						titles.push($(this).attr('title'));
						if($(this).parent().next('.gallery-caption').length > 0){
							// If there's a caption set for the image, use it
							descriptions.push($(this).parent().next('.gallery-caption').html());
						} else {
							// Otherwise, see if there's an alt attribute set
							descriptions.push($(this).children('img').attr('alt'));
						}
					});
					if(ThemifyGallery.isInIframe()){
						window.parent.jQuery.prettyPhoto.open(images, titles, descriptions);
						window.parent.jQuery.prettyPhoto.changePage(images.indexOf($(this).attr('href')));
					} else {
						$.prettyPhoto.open(images, titles, descriptions);
						$.prettyPhoto.changePage(images.indexOf($(this).attr('href')));	
					}
				});
			}
		}
	},
	
	doFullscreen: function(){
		if(this.config.context.selector){
			context = $(themifyScript.lightbox.contentImagesAreas, this.config.context);
		} else {
			context = this.config.context;
		}

		if((typeof($.fn.photoSwipe) !== 'undefined') && (typeof(themifyScript.lightbox.fullscreenOn) !== 'undefined')) {

			$(context).each(function(index) {
				var $elf = $(this),
					settings = {
						target: window,
						preventHide: false,
						zIndex: 50000,
						getImageSource: function(obj){
							return obj.url;
						},
						getImageCaption: function(obj){
							return obj.caption;
						}
					};

				// Images in WP Gallery
				if($(ThemifyGallery.config.fullscreen, $elf).length > 0){
					var images = [],
						instance,
						id = $elf.attr('id');
					$(ThemifyGallery.config.fullscreen, $elf).each(function(index) {
						images.push({url: $(this).attr('href'), caption: $(this).attr('title')});
					});

					instance = Code.PhotoSwipe.getInstance(id);

					if( Code.Util.isNothing(instance) ) {
						instance = Code.PhotoSwipe.attach(
							images,
							settings,
							id
						);
					}
				}
				
				// Images in post content
				if(themifyScript.lightbox.lightboxContentImages && $(ThemifyGallery.config.lightboxContentImages, $elf).length > 0){
					$cimgs = $(ThemifyGallery.config.lightboxContentImages, $elf).filter( function(index){
						if(!$(this).parent().hasClass('gallery-icon') && !$(this).hasClass('lightbox'))
							return $(this);
					});
					if($cimgs.length > 0) $cimgs.photoSwipe(themifyScript.lightbox);
				}
			});

			if(themifyScript.lightbox.fullscreenOn){
				$(context).on('click', ThemifyGallery.config.fullscreen, function(e){
					e.preventDefault();
					var $a = $(this),
						id = $a.closest(themifyScript.lightbox.contentImagesAreas).attr('id');
					
					// get instance
					var instance = window.parent.Code.PhotoSwipe.getInstance(id);
					var index = 0;
					$.each(instance.cache.images, function(i, item) {
						if(item.src == $a.attr('href')) 
							index = i; 
					});
					instance.show(index);
				});
			}

		}
	},
	
	countItems : function(type){
		context = this.config.context;
		if('lightbox' == type) return $(this.config.lightbox, context).length + $(this.config.lightboxGallery, context).length + $(ThemifyGallery.config.lightboxContentImages, context).length;
		else return $(this.config.fullscreen, context).length + $(ThemifyGallery.config.lightboxContentImages, context).length;
	},

	isInIframe: function(){
		if(typeof(ThemifyGallery.config.extraLightboxArgs) !== 'undefined') {
			if((typeof(ThemifyGallery.config.extraLightboxArgs.displayIframeContentsInParent) !== 'undefined') && (ThemifyGallery.config.extraLightboxArgs.displayIframeContentsInParent == true)) {
			return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}
};

}(jQuery));