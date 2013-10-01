exports.server = require('../../rpc/jsonrpc');
exports.rpcDispatchHooks = {
    //tell the rpc server which method to execute
    //must return a function
    initMethod: function(rpc) {
	//grab the rpc method and require the class
	var s = rpc.method.split('.'); //service
	var c = require('../../rpc/'+s[0]); //require <service>.js

	return c[s[0]][s[1]]; //execute <service>.<method>(rpc.params)
    },
    pre: function() {
	//this function will get called before handling a json rpc request...


    },
    post: function(req,res,result,respond) {
        //check for a customer in req
        if (typeof req.session !== "undefined") {
            if (req.session.customer) {
                var safeCustomerFields = ['email','firstName','lastName','postalCode','confirmed','id','balancedAPI'];
                result.customer = {};
                safeCustomerFields.forEach(function(key) {
                    result.customer[key] = req.session.customer[key];
                })
            }

            if (req.session.loggedIn) {
                result.loggedIn = req.session.loggedIn;
            }

            if (typeof req.session.plan !== "undefined") {

            }
        }

        respond(result);
    }
};
