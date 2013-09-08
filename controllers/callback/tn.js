var wembliModel = require('wembli-model');
var Ticket = wembliModel.load('ticket');
var fs = require('fs');

/* checkout pixel looks like this:
<img src="https://www2.wembli.com/callback/tn/checkout?request_id={request_id}&request_datetime={request_datetime}&request_tickets={request_tickets}&request_promo={request_promo}&event_id={event_id}&event_name={event_name}&event_datetime={event_datetime}&venue_id={venue_id}&venue_name={venue_name}&ticket_retail={ticket_retail}&ticket_wholesale={ticket_wholesale}&ticket_face={ticket_face}&sale_tickets={sale_tickets}&sale_shipping={sale_shipping}&sale_discount={sale_discount}&sale_total={sale_total}&customer_id={customer_id}&customer_name={customer_name}&customer_email={customer_email}&customer_phone={customer_phone}&customer_altphone={customer_altphone}"/>
*/

module.exports = function(app) {
	app.all("/callback/tn/checkout", function(req, res) {
			console.log('tn checkout callback');

			var respond = function() {

				fs.readFile('public/img/tx.gif', function(err, pixel) {
					res.writeHead(200, {
						'Content-Type': 'image/gif'
					});
					return res.end(pixel, 'binary');
				});

			};

			/* find the ticket record in the ticket collection and add the transaction data to the payment part and mark the ticket purchased */
			var query = {
				'service':'tn',
				'payment.transactionToken': req.param('request_id'),
				'eventId': req.param('event_id')
			};

			/* receipt is everything ticketnetwork sents over */
			var receipt = {
				request_id: req.param('request_id'),
				request_datetime: req.param('request_datetime'),
				request_tickets: req.param('request_tickets'),
				request_promo: req.param('request_promo'),
				event_id: req.param('event_id'),
				event_name: req.param('event_name'),
				event_datetime: req.param('event_datetime'),
				venue_id: req.param('venue_id'),
				venue_name: req.param('venue_name'),
				ticket_retail: req.param('ticket_retail'),
				ticket_wholesale: req.param('ticket_wholesale'),
				ticket_face: req.param('ticket_face'),
				sale_total: req.param('sale_total'),
				sale_tickets: req.param('sale_tickets'),
				sale_shipping: req.param('sale_shipping'),
				sale_discount: req.param('sale_discount'),
				customer_phone: req.param('customer_phone'),
				customer_name: req.param('customer_name'),
				customer_id: req.param('customer_id'),
				customer_email: req.param('customer_email'),
				customer_altphone: req.param('customer_altphone')
			};

			console.log(receipt);

			Ticket.find(query, function(err, tickets) {
				console.log('tickets');
				console.log(tickets);
				if (err || !tickets || !tickets[0]) {
					return respond();
				}
				for (var i = 0; i < tickets.length; i++) {
					var t = tickets[i];
					t.purchased = true;
					t.payment.receipt = receipt;
					t.save(function(err) {
						return respond();
					});
				};
			});

		});
	};
