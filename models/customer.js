var wembliUtils = require('wembli/utils');
var async = require('async');
var wembliModel = require('../lib/wembli-model');
//var Feed = wembliModel.load('feed');
var Plan = wembliModel.load('plan');
var Friend = wembliModel.load('friend');
var crypto = require('crypto');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;

	var Confirmations = new Schema({
		timestamp: String,
		token: String
	});

	var ForgotPassword = new Schema({
		timestamp: String,
		token: String
	});

	var schemaOptions = {
		autoIndex: (typeof app !== "undefined") ? app.settings.autoIndex : true,
		collection: "customer",
	};

	var Customer = new Schema({
		firstName: String,
		lastName: String,
		birthday: String,
		postalCode: Number,
		gender: String,
		imageUrl: String,
		email: {
			type: String,
			required: true,
			index: {
				unique: true
			}
		},
		socialProfiles: {
			twitter: {},
			facebook: {}
		},
		password: String,
		confirmed: {
			type: Boolean,
			default: false
		},
		confirmation: [Confirmations],
		forgotPassword: [ForgotPassword],
		plans: [String],
		balancedAPI: {
			merchantAccount:{},
			customerAccount:{},
		},
		created: {
			type: Date,
			default: Date.now
		},
		updated: Date,

	}, schemaOptions);


	/* pre func */
	Customer.pre('remove', function(next) {
		console.log('post remove');
		console.log('plans:');
		console.log(this.plans);

		/* remove customer.plans */
		async.forEach(this.plans, function(guid, callback) {
			console.log('removing plan for customer with guid: ' + guid);

			Plan.findByGuid(guid, function(err, p) {
				console.log('got plan by guid:' + err);
				console.log(p);
				console.log('removing it..');
				p.remove(function() {
					callback();
				});
			});

		}, function(err) {
			console.log('deleted plans for customer');
			next();
		});
	});

	Customer.pre('save', function(next) {
		console.log('customer email is: ' + this.email);
		this.updated = new Date();

		next();
	});
	/* done prefunk */

	Customer.methods.addPlan = function(plan, callback) {
		console.log('add plan: ' + plan + 'to customer ' + this.email);
		var guid = (typeof plan === "string") ? plan : plan.guid;
		if (!guid) {
			return callback('no guid');
		}

		var c = this;
		//check if this plan is in the list yet
		async.detect(c.plans, function(el, cb) {
			return cb((guid === el));
		}, function(result) {
			if (typeof result === "undefined") {
				console.log('this guid was not already in customer.plans so adding it');
				c.plans.push(guid);
				c.markModified('plans');
				c.save(callback);
			} else {
				callback();
			}
		});
	};

	Customer.methods.getPlans = function(callback) {
		var c = this;
		console.log('getting customer plans where customer id: ' + c.id);
		Plan.find().where('organizer.customerId').equals(c.id).sort('event.eventDate').exec(function(err, plans) {
			if (err) {
				return callback(err);
			};
			var current = [];
			var archive = [];
			var now = new Date().getTime();
			console.log('now' + now);

			async.forEachSeries(
			plans,

			function(plan, cb) {
				var eventTime = new Date(plan.event.eventDate).getTime();
				console.log('plan time: ' + eventTime);
				if (eventTime > now) {
					current.push(plan);
				} else {
					archive.push(plan);
				}
				cb(null);
			},

			function(err) {
				if (err) {
					return callback(err);
				};
				console.log('current');
				console.log(current);
				console.log('archive');
				console.log(archive);
				callback(null, [current, archive]);
			});
		});
	};

	Customer.methods.getInvitedPlans = function(callback) {
		var c = this;
		console.log('getting plans this customer was invited to: ' + c.id);
		/* get the guids where this customer is a friend */
		Friend.find().select({
			'planGuid': 1
		}).where('customerId').equals(c.id).exec(function(err, friends) {
			console.log('plan guids this customer was invited to');
			async.map(friends, function(item, callback) {
				callback(null, item.planGuid);
			},

			function(err, guids) {
				console.log(guids);
				/* get all the plans for these guids */
				Plan.find().where('guid').in(guids).sort('event.eventDate').exec(function(err, plans) {
					if (err) {
						return callback(err);
					};
					var current = [];
					var archive = [];
					var now = new Date().getTime();
					console.log('now' + now);

					async.forEachSeries(

					plans,

					function(plan, cb) {
						var eventTime = new Date(plan.event.eventDate).getTime();
						console.log('plan time: ' + eventTime);
						if (eventTime > now) {
							current.push(plan);
						} else {
							archive.push(plan);
						}
						cb(null);
					},

					function(err) {
						if (err) {
							return callback(err);
						};
						console.log('current');
						console.log(current);
						console.log('archive');
						console.log(archive);
						callback(null, [current, archive]);
					});
				});
			});
		});
	};

	Customer.methods.getInvitedFriends = function(callback) {
		var c = this;
		Friend.find().where('planGuid').in(c.plans).exec(callback);
	};

	Customer.statics.makeConfirmation = function(prefix) {
		hash = crypto.createHash('md5');
		var confirmationTimestamp = new Date().getTime().toString();
		hash.update(prefix + confirmationTimestamp);
		var confirmationToken = hash.digest(encoding = 'base64');
		confirmationToken.replace('/', '');
		return {
			timestamp: confirmationTimestamp,
			token: confirmationToken
		};
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


	Customer.methods.fullName = function() {
		return this.first_name + ' ' + this.last_name
	};

	Customer.statics.findByEmail = function(email, callback) {
		return this.find({
			email: email
		}, callback);
	};

	try {
		return mongoose.model('customer');
	} catch (e) {
		return mongoose.model('customer', Customer);
	}
};
