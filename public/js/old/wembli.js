doc = document;

// Global Wembli Object
$w = {};

(function($, window, undefined) {

	//figure out what page they are asking for and set that in $w.currentFrameHref
	function initFrame() {
		$w.initFrame = function() {
			var ary = window.location.href.split('#');
			$w.currentFrameHref = (typeof ary[1] != "undefined") ? '#' + ary[1] : '#home';
			console.log('initFrame: ' + $w.currentFrameHref);
			//if this page is search, make the search box active
			if ($w.currentFrameHref == '#search') {
				$('#nav-search').addClass('active');
			} else {
				$('#nav-search').removeClass('active');
			}
		}
		$w.initFrame();
	}

	function initNavArrow() {
		//this function will slide the nav arrow to the correct nav element
		//NOTE: its not actually called until initSequence()
		$w.slideNavArrow = function(start, end) {
			//append a fake element to #footer to get the left css property of end
			var startClass = 'center-' + start.split('#')[1];
			var endClass = 'center-' + end.split('#')[1];
			console.log('end class:' + endClass);
			$('#footer').append('<div class="' + endClass + '"" style="display:none;position:absolute;height:0;width:0;"/>');
			var moveTo = $('#footer .' + endClass).css('left');
			console.log('sliding nav arrow over ' + moveTo);
			$('#nav-arrow').animate({
				left: moveTo
			}, 1000, function() {
				console.log('removing class: ' + startClass)
				$('#nav-arrow').removeClass(startClass)
				$('#nav-arrow').addClass(endClass);
			});
		}
	}

	function initSequence() {
		//http://www.sequencejs.com/documentation.html
		var options = {
			preloader: false,
			animateStartingFrameIn: false,
			transitionThreshold: false,
			autoPlay: false,
			cycle: true,
			keyNavigation: false,
			swipeNavigation: false
		};
		$w.sequence = $("#content").sequence(options).data("sequence");

		//create a new sequence obj with diff options for the first page load
		console.log('going to ' + $w.currentFrameHref);
		//the page they loaded is not home, so we need to goTo it
		var path = $w.currentFrameHref.split('#')[1]; //href tells us what page to fetch via ajax

		//if its not #home we need to fetch the html
		if ($w.currentFrameHref != '#home') {
			//get the page data for this frame
			options.beforeNextFrameAnimatesIn = function() {
				//get the html for the new page
				$.ajax({
					url: '/' + path,
					//TODO: do something slick on error...
					success: function(data) {
						console.log(data);
						//put the new page in the DOM
						$('#content ul li .frame2').html(data);
						//might need to kick off the angular app here..
					}
				});
			};
			var sequence = $("#content").sequence(options).data("sequence");
			//go to frame 2 (we can assume its frame 2 cause this is the init func)
			$w.slideNavArrow('#home', $w.currentFrameHref);
			sequence.goTo(2, 1);
		} else {
			//home is a special case - html is already loaded..just need the js which will fetch the data and finish making the rest of the page
			//just maybe need to init the angular app
		}
	};

	function initStarRatings() {
		// get and parse the rating
		var rating;
		var nums;
		var whole;
		var frac;

		// I'll need this
		var span;
		var halfUsed;
		var me;

		$('.stars').each(function() {
			// get and parse the rating
			rating = $(this).html();
			nums = rating.split('.');
			whole = parseInt(nums[0]);
			frac = parseInt(nums[1]);

			// save these now
			halfUsed = false;
			me = this;

			//this.html('');
			// build the stars
			for (var i = 1; i < 6; i++) {
				span = doc.createElement('span');

				if (i <= whole) {
					span.className = 'whole-star';
				} else if (frac > 2 && !halfUsed) {
					span.className = 'half-star';
					halfUsed = true;
				} else {
					span.className = 'empty-star';
				}

				$(span).appendTo(me);
			}
		});
	};

	//event-wrappers are clickable
	function initEventWrapper() {
		if ($('.event-wrapper').length) {
			$('.event-wrapper').each(function(idx) {
				var eventId = $(this).attr('id').split('-')[0];
				$(this).click(function(e) {
					//load the event
					console.log('loading event: ' + eventId);
				});
			});
		}
	}

	//setup funcs for global $w obj
	$w.init = function() {
		initFrame();
		initNavArrow();
		initStarRatings();
		initSequence();
		initEventWrapper();
	};

})($, window);


$(document).ready(function() {
	$w.init();

	//this should come from a config somewhere
	var framesMap = {
		'#search': 0,
		'#home': 1,
		'#invitation': 2,
		'#tickets': 3,
		'#parking': 4,
		'#restaurants': 5,
		'#hotels': 6,
		'#login': 7
	};


	//click a nav element loads the page and slides the arrow
	$('#nav li a').each(function(idx) {

		var me = this;
		$(this).click(function(e) {
			console.log('current frame is: ' + $w.sequence.currentFrameID);

			//sequence.nextFrameID seems to not work...hardcode nextframeid
			var nextFrameID = ($w.sequence.currentFrameID === 1) ? 2 : 1;
			console.log('next frame is: ' + nextFrameID);
			//make an ajax call to get html for whatever frame is next
			var path = $(me).attr('href').split('#')[1]; //href tells us what page to fetch via ajax
			//get the html for the new page
			$.ajax({
				url: '/' + path,
				//TODO: do something slick on error...
				success: function(data) {
					console.log(data);
					//set the html of 'nextframe'
					var selector = '#content ul li .frame' + nextFrameID;
					console.log('selector:' + selector)

					//put the new page in the DOM
					$(selector).html(data);

					//kick off angular app?

					//goTo nextframe
					//determine which direction to go
					//if current frame href in framesmap is > next frame then go prev

					var currNavIndex = framesMap[$w.currentFrameHref];
					var nextNavIndex = framesMap[$(me).attr('href')];

					if (currNavIndex === nextNavIndex) {
						return false;
					}
					var direction = (currNavIndex < nextNavIndex) ? 1 : -1;
					console.log('going to next framID:' + nextFrameID + ' direction: ' + direction)

					$w.slideNavArrow($w.currentFrameHref, $(me).attr('href'));
					$w.currentFrameHref = $(me).attr('href');
					$w.sequence.goTo(nextFrameID, direction);
					$w.initFrame();
				}
			});
		});
	});
});
