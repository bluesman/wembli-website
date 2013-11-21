var wembliModel = require('wembli-model');
var Ticket = wembliModel.load('ticket');
var fs = require('fs');

/* checkout pixel looks like this:
<img src="https://www2.wembli.com/callback/tn/checkout?request_id={request_id}&request_datetime={request_datetime}&request_tickets={request_tickets}&request_promo={request_promo}&event_id={event_id}&event_name={event_name}&event_datetime={event_datetime}&venue_id={venue_id}&venue_name={venue_name}&ticket_retail={ticket_retail}&ticket_wholesale={ticket_wholesale}&ticket_face={ticket_face}&sale_tickets={sale_tickets}&sale_shipping={sale_shipping}&sale_discount={sale_discount}&sale_total={sale_total}&customer_id={customer_id}&customer_name={customer_name}&customer_email={customer_email}&customer_phone={customer_phone}&customer_altphone={customer_altphone}"/>
*/

module.exports = function(app) {
	app.all("/callback/tn/checkout", function(req, res) {

			var respond = function() {

				fs.readFile('public/img/tx.gif', function(err, pixel) {
					res.writeHead(200, {
						'Content-Type': 'image/gif'
					});
					return res.end(pixel, 'binary');
				});

			};

			/* request_id is not the same as transaction token - maybe get transaction token from referrer
			* /callback/tn/checkout?request_id=13907914&request_datetime=11/10/2013%2010:44:28%20PM&request_tickets=2&request_promo=ERROR&event_id=2042642&event_name=Clemson%20Tigers%20vs.%20Georgia%20Tech%20Yellow%20Jackets&event_datetime=11/14/2013%207:30:00%20PM&venue_id=844&venue_name=Clemson%20Memorial%20Stadium&ticket_retail=23.00&ticket_wholesale=23.00&ticket_face=0.00&sale_tickets=46.00&sale_shipping=15.00&sale_discount=0&sale_total=67.90&customer_id=28323863&customer_name=Kayla%20Burdine&customer_email=Lindseyburdine@gmail.com&customer_phone=8593537448%20[Daytime]&customer_altphone= HTTP/1.1" 200 53 "https://tickettransaction2.com/Receipt.aspx?brokerid=5006&sitenumber=0&tgid=1404113353&evtid=2042642&price=23&treq=2&req.sessionId=t8hJm" "Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_3 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B511 Safari/9537.53" "75.139.74.31"
			*/

			/* find the ticket record in the ticket collection and add the transaction data to the payment part and mark the ticket purchased */
			var query = {
				'service':'tn',
				'payment.transactionToken': req.param('request_id'),
				'eventId': req.param('event_id')
			};

			/* receipt is everything ticketnetwork sends over */
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

			Ticket.find(query, function(err, tickets) {
				if (err || !tickets || !tickets[0]) {
					return respond();
				}
				for (var i = 0; i < tickets.length; i++) {
					var t = tickets[i];
					t.purchased = true;
					t.payment.receipt = receipt;
					t.qty =
					t.save(function(err) {
						return respond();
					});
				};
			});

		});
	};
