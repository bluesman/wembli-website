var wembliUtils = require('wembli/utils');
var async = require('async');
var wembliModel = require('../lib/wembli-model');
var Feed = wembliModel.load('feed');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var Confirmations = new Schema({
		timestamp: {
			type: String
		},
		token: {
			type: String
		}
	});

	var ForgotPassword = new Schema({
		timestamp: {
			type: String
		},
		token: {
			type: String
		}
	});

	var mapFriends = function(f) {
			var friends = {};
			for (idx in f) {
				friends[f[idx].email] = f[idx];
			}
			return friends;
		};

	var unMapFriends = function(f) {
			var friends = [];
			for (email in f) {
				friends.push(f[email]);
			}
			return friends;
		};

	var EventPlan = new Schema({
		date_created: {
			type: Date,
		default:
			Date.now
		},
		tickets: {
			type: {}
		},
		ticketIds: {
			type: []
		},
		event: {
			type: {}
		},
		//friends: {type:{},get:mapFriends,set:unMapFriends},
		friends: {
			type: {}
		},
		friendIds: {
			type: []
		},
		completed: {
			type: {}
		},
		config: {
			type: {}
		}
	});

	var Customer = new Schema({
		fbId: {
			type: String
		},
		first_name: {
			type: String
		},
		last_name: {
			type: String
		},
		birthday: {
			type: String
		},
		zip_code: {
			type: Number
		},
		gender: {
			type: String
		},
		email: {
			type: String,
			unique: true
		},
		password: {
			type: String
		},
		confirmed: {
			type: Boolean,
		default:
			false
		},
		confirmation: [Confirmations],
		forgot_password: [ForgotPassword],
		eventplan: [EventPlan],
		date_created: {
			type: Date,
		default:
			Date.now
		},
		last_modified: {
			type: Date
		}
	});

	Customer.pre('save', function(next) {
		console.log('customer email is: ' + this.email);
		//if no email throw an error
		if (!this.email) {
			return next(new Error('error - no email for customer'));
		}

		this.last_modified = new Date();
		console.log('pre save');
		next();
	});

	Customer.methods.test = function() {
		console.log('test');
	};

	Customer.methods.saveCurrentPlan = function(plan, callback) {
		var c = this;
		console.log('customer model');
		console.log(plan);
		//plan must have a config.organizer
		if (typeof plan.config.organizer == "undefined") {
			console.log('plan does not have an organizer..not saving it..');
			if (typeof callback != "undefined") {
				return callback('plan must have a config.organizer');
			} else {
				return;
			}

		}
		//if the organizer email for plan is not c.email gtfo
		if (plan.config.organizer != c.email) {
			console.log('organizer is not the customer');
			if (typeof callback != "undefined") {
				return callback('the plan does not belong to this customer');
			} else {
				return;
			}
		}

		var plans = [];
		var saved = false;
		for (var idx in this.eventplan) {
			//housekeeping
			if ((typeof this.eventplan[idx].config == "undefined") || (typeof this.eventplan[idx].config.guid == "undefined")) {
				continue;
			}

			//add this plan if its one of the plans
			if (this.eventplan[idx].config.guid == plan.config.guid) {
				plans.push(plan);
				saved = true;
			} else {
				plans.push(this.eventplan[idx]);
			}
		}

		//no plans, put this one in
		if (!saved) {
			plans.push(plan);
		}

		this.eventplan = plans;
		this.markModified('eventplan');

		this.save(function(err) {
			if (err) {
				console.log('error saving customer: ' + err);
				callback(err);
			}

			//check if there any currentPlan.feed elements to save
			//there's an existing feed
			if ((typeof plan.feed != "undefined") && plan.feed.length > 0) {
				//look for an existing feed
				Feed.findOne({
					guid: plan.config.guid
				}, function(err, feed) {
					if (err) {
						console.log('feed saving err:' + err);
						if (typeof callback != "undefined") {
							callback(err);
						}
					} else {
						if (feed == null) {
							//create a new one
							var newFeed = new Feed({
								guid: plan.config.guid,
								activity: []
							});
							for (var idx in plan.feed) {
								var f = plan.feed[idx];
								if (typeof f.actor == "undefined") {
									f.actor = {
										name: c.first_name + ' ' + c.last_name,
										keyName: 'organizer',
										keyValue: 'organizer'
									};

								}
								newFeed.activity.push(f);
							}


							console.log('saving new feed');
							newFeed.save(function(err) {
								plan.feed = [];
								if (typeof callback != "undefined") {
									callback(err);
								}
							});
						} else {
							console.log('adding to feed');
							for (var idx in plan.feed) {
								var f = plan.feed[idx];
								if (typeof f.actor == "undefined") {
									f.actor = {
										name: c.first_name + ' ' + c.last_name,
										keyName: 'organizer',
										keyValue: 'organizer'
									};

								}
								feed.activity.push(f);
							}
							feed.markModified('activity');
							feed.save(function(err) {
								plan.feed = [];
								if (typeof callback != "undefined") {
									callback(err);
								}
							});
						}
					}
				});
			} else {
				//console.log(c);
				if (typeof callback != "undefined") {
					callback(err);
				}
			}
		});
	};

	Customer.statics.findFriendEmailByFriendToken = function(token, callback) {
		var Customer = this;
		var friendEmail = null;
		//if there's a fbId for this customer get all the friends that have this as an id
		var query = Customer.find();
		query.where('eventplan.friends').elemMatch(function(elem) {
			elem.where('token.token', token);
		});
		query.exec(function(err, res) {
			if (err) {
				callback(err);
			} else {
				var plans = [];
				for (var i in res) {
					for (var idx in res[i].eventplan) {
						var plan = res[i].eventplan[idx];
						var keep = false;
						for (var idx2 in plan.friends) {
							var f = plan.friends[idx2];
							if ((typeof f.token != "undefined") && (f.token.token == token)) {
								if (f.email) {
									return callback(null, f.email);
									break;
								}
							}
						}
					}
				}
				callback(null, null);
			}
		});
	};

	Customer.statics.findPlansByFriend = function(friend, callback) {
		var Customer = this;
		var friends = [];
		var tasks = [];
		if ((typeof friend.fbId != "undefined") && (friend.fbId != null)) {
			var getByFb = function(cb1) {
					//if there's a fbId for this customer get all the friends that have this as an id
					var query = Customer.find();
					query.where('eventplan.friends').elemMatch(function(elem) {
						elem.where('fbId', friend.fbId);
					});
					query.exec(function(err, res) {
						if (err) {
							cb1(err);
						} else {
							var plans = [];
							for (var i in res) {
								//get the eventplans where this fbId is a friend
								for (var idx in res[i].eventplan) {
									var plan = res[i].eventplan[idx];
									var keep = false;
									for (var idx2 in plan.friends) {
										var f = plan.friends[idx2];
										if ((typeof f.fbId != "undefined") && (f.fbId == friend.fbId)) {
											plan.friends[idx2].me = true;
											plans.push(plan);
											break;
										}
									}
								}
							}
							cb1(null, plans);
						}
					});
				};
			tasks.push(getByFb);
		}

		if ((typeof friend.email != "undefined") && (friend.email != null)) {
			var getByEmail = function(cb2) {
					//if there's a fbId for this customer get all the friends that have this as an id
					var query = Customer.find();
					console.log(',atching for: ' + friend.email);
					query.where('eventplan.friends').elemMatch(function(elem) {
						elem.where('email', new RegExp('^' + friend.email + '$', "i"));
					});
					query.exec(function(err, res) {
						if (err) {
							cb2(err);
						} else {
							var plans = [];
							//get the eventplans where this fbId is a friend
							for (var i in res) {
								for (var idx in res[i].eventplan) {
									var plan = res[i].eventplan[idx];
									var keep = false;
									for (var idx2 in plan.friends) {
										var f = plan.friends[idx2];
										if (f.email) {
											console.log('is f ' + friend.email.toUpperCase());
										}
										if ((typeof f.email != "undefined") && (f.email.toUpperCase() == friend.email.toUpperCase())) {
											console.log('yes');
											console.log(f);
											plan.friends[idx2].me = true;
											plans.push(plan);
											break;
										}
									}
								}
							}
							cb2(null, plans);
						}
					});
				};
			tasks.push(getByEmail);
		}

		//merge the results
		var attending = [];

		if (tasks.length > 0) {
			async.parallel(tasks, function(err, results) {
				for (var idx in results) {
					wembliUtils.merge(attending, results[idx]);
				}
				callback(null, attending);
			});
		} else {
			callback(null, attending);
		}

	};

	Customer.statics.findPlanByGuid = function(guid, callback) {
		//get plan by guid and set it in the session
		var query = this.findOne({});
		query.where('eventplan').elemMatch(function(elem) {
			elem.where('config.guid', guid);
			elem.$ne('config.deleted', true);
		});
		query.exec(callback);
	};


	Customer.methods.full_name = function() {
		return this.first_name + ' ' + this.last_name
	};

	Customer.statics.findByEmail = function(email, callback) {
		return this.find({
			email: email
		}, callback);
	};


	//not sure if mongoose does connection pooling - i hope so :)
	//var db = mongoose.connect(mongoose.dbSetting);
	mongoose.model('customer', Customer);
	return mongoose.model('customer');
};
