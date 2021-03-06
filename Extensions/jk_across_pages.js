//* TITLE J/K Across Pages **//
//* VERSION 1.0 REV B **//
//* DESCRIPTION Allow Tumblr's J/K navigation to move between pages **//
//* DEVELOPER beiju **//
//* FRAME false **//
//* BETA true **//

XKit.extensions.jk_across_pages = new Object({
	/*
	 * If the top of the last post is this far below the top of the screen or less, j will move to the next page.
	 */
	scrollBufferJ: 8,
	/*
	 * If the top of first post is this far below the top of the screen or more, k will move to the previous page.
	 */
	scrollBufferK: 7,
	/*
	 * Leave this much overlap when using view_entire_posts
	 */
	scrollBufferInside: 50,
	/*
	 * How long scroll animations should take (milliseconds)
	 */
	scrollAnimationDuration: 100,

	$posts: false,

	running: false,

	
	preferences: {
		"sep0": {
			type: 'separator',
			text: "Other"
		}, 
		"view_entire_posts": {
			text: "Scroll through the entire post, even if it's longer than the screen",
			default: false,
			value: false
		}
	},

	run: function() {
		this.registerJQueryPlugins();
		this.$posts = jQuery('.post_container').not('#new_post_buttons');
		
		XKit.tools.init_css("jk_across_pages");
		
		// If #auto_pagination_loader exists, endless scrolling is enabled and this extension is useless
		if (jQuery('#auto_pagination_loader').length > 0) return;

		if (/jk_across_pages_first/i.test(window.location.hash)) {
			console.log("Scrolling to first post", this.$posts.first());
			jQuery('html, body').animate({
				scrollTop: this.$posts.first().offset().top - this.scrollBufferJ
			}, this.scrollAnimationDuration);
			window.location.hash = '';
		} else if (/jk_across_pages_last/i.test(window.location.hash)) {
			console.log("Scrolling to last post", this.$posts.last());
			jQuery('html, body').animate({
				scrollTop: this.$posts.last().offset().top - this.scrollBufferK
			}, this.scrollAnimationDuration);
			window.location.hash = '';
		}
		
		var that = this;
		jQuery(document.body).bind('keydown.xkit_jk_across_pages', function(evt) {
			if (!evt.shiftKey && !evt.ctrlKey && !evt.altKey && !evt.metaKey) {
				// If the key wasn't J or K, we have nothing to do here.
				if (evt.which === 74 /* j */ && evt.which === 75 /* k */) return;
				
				// If the new post field has focus, do nothing.
				if (jQuery('#post_form').find(':focus').length > 0) return;
				
				if (that.preferences.view_entire_posts.value == true && evt.which === 74 /* j */ && 
					jQuery(jQuery.elementFromPoint(jQuery('#posts').offset().left+1,  that.scrollBufferJ+1)).closest('.post_container')[0] == 
					jQuery(jQuery.elementFromPoint(jQuery('#posts').offset().left+1,  window.innerHeight - (that.scrollBufferJ+1))).closest('.post_container')[0]){
					
					/* Animate this twice to make sure Tumblr's scrolling doesn't override it */
					var scrollTo = window.scrollY + window.innerHeight - that.scrollBufferInside;
					jQuery(document.body).animate({ scrollTop: scrollTo }, that.scrollAnimationDuration, function() {
						$(this).animate({ scrollTop: scrollTo }, that.scrollAnimationDuration);
					});

					
					return; // Don't try to go to the next page
				}

				/*console.log('key code', evt.which, 
					'bottom scroll', that.$posts.last().offset().top - window.scrollY, 
					'(threshold', that.scrollBufferJ, ')',
					'top scroll', that.$posts.first().offset().top + that.$posts.first().height() - window.scrollY,
					'(threshold', that.scrollBufferK, ')');*/

				if (evt.which === 74 /* j */ && that.$posts.last().offset().top - window.scrollY <= that.scrollBufferJ) {
					console.log("Moving to next page");
					if (jQuery('#next_page_link').length > 0) window.location = jQuery('#next_page_link').attr('href') + '#jk_across_pages_first';
				} else if (evt.which === 75 /* k */ && that.$posts.first().offset().top + that.$posts.first().height() - window.scrollY >= that.scrollBufferK) {
					console.log("Moving to previous page (if available)");
					if (jQuery('#previous_page_link').length > 0) window.location = jQuery('#previous_page_link').attr('href') + '#jk_across_pages_last';
				}
			}
		});
		this.running = true;
	},

	destroy: function() {
		try {
			jQuery(document.body).unbind('keydown.xkit_jk_across_pages');
			XKit.tools.remove_css("jk_across_pages");
			this.running = false;
		} catch(err) {
			if (console && console.error) console.error(e);
		}
	},
	
	registerJQueryPlugins: function() {
		(function ($){
			var check = false, isRelative = true;
 			$.elementFromPoint = function(x,y) {
				if (!document.elementFromPoint) return null;

				if (!check) {
					var sl;
					if ((sl = $(document).scrollTop()) >0) {
						isRelative = (document.elementFromPoint(0, sl + $(window).height() -1) == null);
					} else if((sl = $(document).scrollLeft()) >0) {
						isRelative = (document.elementFromPoint(sl + $(window).width() -1, 0) == null);
					}
					check = (sl>0);
				}
 
				if(!isRelative) {
					x += $(document).scrollLeft();
					y += $(document).scrollTop();
				}
 
				return document.elementFromPoint(x,y);
			}	
 		})(jQuery);
	}

});