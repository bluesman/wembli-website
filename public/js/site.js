//this is the wembli sitewide javascript
(function($,window,undefined) {
    $(window.document).ready(function($) {
	//setup the beta sign up button
	$('#signupEmailButton').each(function(idx) {
	    $(this).click(function(e) {
		e.preventDefault();
		var formId = '#'+$(this).parents('form').attr('id');
		$(formId).submit();
	    });
	});
    });
})(jQuery,window);


