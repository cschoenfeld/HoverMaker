/*
	HoverMaker javascript library.
	
	THIS VERSION DEPENDS ON: jQuery
	(It can even be used with jQuery in "noConflict" mode.)
	
	Simplifies the process of adding hover states to images in a web page.
	Just add a classname ("hover" by default) to the images that should have hover states.
	Name the images according to a convention (image.png and image-over.png for example), 
	or set up an object with custom over- and off-state filenames.
	Instantiate this object, call its "initialize" function, and let it take over.

	@author Charles Schoenfeld, Adams & Knight
	@version 1.0
	
	Version History:
	1.0:
		Initial Release		
	
	SIMPLE USAGE EXAMPLE:
	hovers = new CAS.HoverMaker();
	hovers.initialize();
	
	MORE COMPLEX USAGE EXAMPLE:
	var my_hoverstates = {
		'myphoto_1': {
			'off': 'myphoto1.jpg', 
			'hover: 'myphoto1-over.jpg'
		}, 
		'myphoto_2': {
			'off': 'myphoto2.jpg', 
			'hover': 'myphoto2-over.jpg'
		}
	};
	hovers = new CAS.HoverMaker({
		slideclass: '.hasHoverState', 
		imagedir: 'http://www.mysite.com/pix/', 
		hoverstates: my_hoverstates
	});
	hovers.initialize();
		
*/

// Namespace for my helper functions.
window.CAS = {};

// Create the HoverMaker class.
CAS.HoverMaker = function() {};

// Add functionality to the class.
CAS.HoverMaker.prototype = {

	initialize: function(params) {
		if ((typeof params) == 'undefined') { params = {}; };
		this.watchclass = (params.slideclass) ? params.slideclass : '.hover';
		this.imagedir = (params.imagedir) ? params.imagedir : (window.BASE_URL ? (window.BASE_URL + 'images/') : (window.location.protocol + '//' + window.location.hostname + '/images/'));
		this.elementsToWatch = jQuery(this.watchclass);
		this.hoverstates = (params.hoverstates) ? params.hoverstates : {};
		jQuery.proxy(this.begin, this)();		
	},
	
	getHoverSrc: function(el) {
		var srcimg;
		if (this.hoverstates[el.id]) {
			srcimg = this.imagedir + this.hoverstates[el.id]['hover'];
		} else {
			// Break down the element's current path.
			if (el.src.include('-over')) { return el.src; }
			var srcpcs = el.src.split('/');
			var srcfile = srcpcs.pop();
			var filepcs = srcfile.split('.');
			var fileext = filepcs.pop();
			var overfile = filepcs.join('.') + '-over.' + fileext;
			srcimg = srcpcs.join('/') + '/' + overfile;
		}
		return srcimg;		
	},
	
	preload_overstate: function(el) {
		var wrapper = jQuery('<img>').appendTo('body').css('display', 'block').css('position', 'absolute').css('top', -10000).css('left', -10000).css('width', 9000).css('height', 2000);
		var overstate = jQuery.proxy(this.getHoverSrc, this)(el);
		wrapper.attr('src', overstate);
		var result = {
			height: wrapper.height(), 
			width: wrapper.width()
		};
		wrapper.remove();
		return result; // Dimensions of preloaded image		
	},
	
	preload_image: function(url) {
		var wrapper = jQuery('<img>').appendTo('body').css('display', 'block').css('position', 'absolute').css('top', -10000).css('left', -10000).css('width', 9000).css('height', 2000);
		wrapper.attr('src', url);
		var result = {
			height: wrapper.height(), 
			width: wrapper.width()
		};
		wrapper.remove();
		return result; // Dimensions of preloaded image		
	}, 
	
	doHover: function(e) {
		var el = e.delegateTarget;
		var srcimg = jQuery.proxy(this.getHoverSrc, this)(el);
		el.src = srcimg;		
	}, 
	
	endHover: function(e) {
		var el = e.delegateTarget;
		if (this.hoverstates[el.id]) {
			el.src = this.imagedir + this.hoverstates[el.id]['off'];
		} else {
			el.src = el.src.replace('-over.', '.');
		}
	}, 
	
	begin: function() {
		// Preload the images for the over states.
		jQuery(this.elementsToWatch).each(			
			jQuery.proxy((function(i, el) {
				jQuery.proxy(this.preload_overstate, this)(el);
			}), this)
		);
		
		// Watch the specified elements for hover events.
		jQuery(this.elementsToWatch).mouseover(jQuery.proxy(this.doHover, this)).mouseout(jQuery.proxy(this.endHover, this));
	}

};