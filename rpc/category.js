var sys = require('sys');
var mongoose = require('mongoose').Mongoose;
//var ObjectID = require('mongodb/bson/bson').ObjectID;


//see lib/phatseat-model.js
var phatseatModel = require('phatseat-model');
var Category = phatseatModel.load('category');

exports.category = {
    getSubCategories: function(categoryId) {
	var me = this;
	console.log('called getSubcategories for: '+categoryId);
	//validate the categoryId
	var c = new Category();

	c.getSubCategories({'categoryId':categoryId},me);
	//console.log(Category);
	/*
	Category.find({ancestors:ObjectID.createFromHexString(categoryId)}).all(function(results) {
	    console.log(results);
	    me(null,results);

	    me(null,{'topLevel':topLevel,
		     'subCategories':c.subCategories[topLevel],
		     'bottom':['Show All','My Favorites']});
	},null);
*/

    }

}