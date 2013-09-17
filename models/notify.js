var wembliModel = require('../lib/wembli-model');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;

	var schemaOptions = {
		autoIndex: (typeof app !== "undefined") ? app.settings.autoIndex : true,
		collection: "notify",
	};

	var Notify = new Schema({
		email: {
			type: String,
			required: true,
			index: {
				unique: true
			}
		},
		service: {
			type: String,
			default: 'tn'
		},
		event: {},
		addOn: String,
		created: {
			type: Date,
			default: Date.now
		},
		updated: Date,

	}, schemaOptions);

	Notify.pre('save', function(next) {
		this.updated = new Date();
		next();
	});

	try {
		return mongoose.model('notify');
	} catch (e) {
		return mongoose.model('notify', Notify);
	}
};
