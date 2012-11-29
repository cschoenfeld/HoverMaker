/*
	HoverMaker javascript library.
	
	THIS VERSION DEPENDS ON: prototype.js
	
	Simplifies the process of adding hover states to images in a web page.
	Just add a classname ("hover" by default) to the images that should have hover states.
	Name the images according to a convention (image.png and image-over.png for example), 
	or set up an object with custom over- and off-state filenames.
	Instantiate this object, and let it take over.

	@author Charles Schoenfeld, Adams & Knight
	@version 1.0
	
	Version History:
	1.0:
		Initial Release		
	
	SIMPLE USAGE EXAMPLE:
	hovers = new HoverMaker();
	
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
	hovers = new HoverMaker({
		slideclass: '.hasHoverState', 
		imagedir: 'http://www.mysite.com/pix/', 
		hoverstates: my_hoverstates
	});
		
*/
var HoverMaker = Class.create({
	
	// Constructor 
	initialize: function(params) {
		if ((typeof params) == 'undefined') { params = {}; };
		this.watchclass = (params.slideclass) ? params.slideclass : '.hover';
		this.imagedir = (params.imagedir) ? params.imagedir : (window.BASE_URL ? (window.BASE_URL + 'images/') : (window.location.protocol + '//' + window.location.hostname + '/images/'));
		this.elementsToWatch = $$(this.watchclass);
		this.hoverstates = (params.hoverstates) ? params.hoverstates : {};
		this.begin.bind(this)();
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
		var img = window.document.createElement('img');
		img.setAttribute('id', 'imagepreload');
		img.style.position = 'absolute';
		img.style.left = '-10000px';
		img.style.top = '-10000px';
		window.document.body.appendChild(img);
		var overstate = this.getHoverSrc.bind(this)(el);
		img.src = overstate;
		var result = {
			height: img.getHeight(), 
			width: img.getWidth()
		};
		img.remove();
		return result; // Dimensions of preloaded image		
	},
	
	preload_image: function(url) {
		var img = window.document.createElement('img');
		img.setAttribute('id', 'imagepreload');
		img.style.position = 'absolute';
		img.style.left = '-10000px';
		img.style.top = '-10000px';
		window.document.body.appendChild(img);
		img.src = url;
		var result = {
			height: img.getHeight(), 
			width: img.getWidth()
		};
		img.remove();
		return result; // Dimensions of preloaded image		
	}, 
	
	doHover: function(e) {
		var el = e.findElement();
		var srcimg = this.getHoverSrc.bind(this)(el);
		el.src = srcimg;
	}, 
	
	endHover: function(e) {
		var el = e.findElement();
		if (this.hoverstates[el.id]) {
			el.src = this.imagedir + this.hoverstates[el.id]['off'];
		} else {
			el.src = el.src.gsub('-over.', '.');
		}
	},
	
	begin: function() {
		// Preload the images for the over states.
		this.elementsToWatch.each((function(el) {
			this.preload_overstate.bind(this)(el);
		}).bind(this));

		// Watch the specified elements for hover events.
		this.elementsToWatch.each((function(el) {
			if (el) {
				el.observe('mouseover', this.doHover.bind(this));
				el.observe('mouseout', this.endHover.bind(this));
			}
		}).bind(this));
	}
	
});