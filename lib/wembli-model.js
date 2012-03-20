/* wembli-model                                                                                                                                                                 
                                                                                                                                                                                  
this is more of a helper function that wraps mongoose and allows you to elegantly
load models inside of your controller.  simply define your model in the models/ dir  
and then put this code in your controller: 
 
var phatseatModel = require('phatseat-model');
var Customer = phatseatModel.load('customer');
 
then you do stuff like:  
Customer.find().all(function(array) {
 async.forEach(array, 
  function(el,callback) {doSomething(el); callback();},
  function(err) { dunzo(); }
 ); 
}); 
 
your model should be defined as per the mongoose model definition except wrap  
it in a function that takes in the mongoose obj as an arg.  this way we can stack 
models in a global mogoose obj and make many models avail to our controller 
 
the model file will look like this:  
 
this.Model = function(mongoose) { 
 mongoose.model('foo', { 
 
  ... model spec ...  
 
 });
 
 //not sure if mongoose does connection pooling - i hope so :)  
 var db = mongoose.connect(mongoose.dbSetting);  
 return db.model('customer');  
};  
 
 
 
*/


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/wembli');

module.exports = {
 load: function(model) {
	return require('../models/'+model).Model(mongoose);
 },
 close: function() {
	mongoose.connection.close();
 }

};
