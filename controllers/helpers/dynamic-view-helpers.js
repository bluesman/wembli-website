module.exports = {
    req: function(req,res) { return req; },
    res: function(req,res) { return res; },
    session: function(req, res){ return req.session },

    //navigation
    tabs: function(req,res) {
	var tabs = [];

	if (req.session.loggedIn) {
	    tabs.push({name:'dashboard', label:'Dashboard', url:'/dashboard'});
	    tabs.push({name:'logout', label:'Log Out', url:'/logout'});
	} else {
	    tabs.push({name:'index', label:'Home', url:'/'});
	    tabs.push({name:'signup', label:'Sign Up', url:'#signupModal',modal:'modal'});
	    tabs.push({name:'login', label:'Log In To Your Dashboard', url:'#loginModal',modal:'modal'});
	}
	return tabs;
    },

    params: function(req,res) {
	return req.params;
    },

    friendsCount: function(req,res) {
	if ((typeof req.session.currentPlan.friends != "undefined") && (typeof req.session.currentPlan.config != "undefined")) {
	    return Object.keys(req.session.currentPlan.friends).length + 1;
	}
	return 1;
    }

};
