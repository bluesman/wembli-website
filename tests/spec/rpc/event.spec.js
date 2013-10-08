/* haven't found a very good way to run tests that require req or res obj */
xdescribe('RPC Event Namespace',function() {
	var date = require('/wembli/website/public/js/lib/date.format');
	var eventRpc      = require('/wembli/website/rpc/event').event;

	describe('The get method',function() {
		var beginDate = null;
		beforeEach(function() {
			var daysPadding = 2; //how many days from today for the beginDate
			var d = Date.today();
			d2 = new Date(d);
			d2.setDate(d.getDate() + 2);
			beginDate = d2.format("shortDate");
		});

		it('should return a list',function(done) {
			var events = null;
			runs(function() {
				var args = {};
				args.beginDate = beginDate;
				args.orderByClause = 'Date'; //order by date
				args.nearZip = '92101';
			
				//get nearby events:
				eventRpc['get'].apply(function(err,results) {
					events = results.event;
				    },[args,req,res]);
			    });

			waitsFor(function() {
			    });

			runs(function() {
				expect(events).not.toBeNull();
			    });

		});
	});
});