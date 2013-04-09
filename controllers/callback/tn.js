var wembliModel   = require('wembli-model');
var Ticket      = wembliModel.load('ticket');
var fs = require('fs');

/* checkout pixel looks like this:
<img src="https://www2.wembli.com/callback/tn/checkout?request_id={request_id}&request_datetime={request_datetime}&request_tickets={request_tickets}&request_promo={request_promo}&event_id={event_id}&event_name={event_name}&event_datetime={event_datetime}&venue_id={venue_id}&venue_name={venue_name}&ticket_retail={ticket_retail}&ticket_wholesale={ticket_wholesale}&ticket_face={ticket_face}&sale_tickets={sale_tickets}&sale_shipping={sale_shipping}&sale_discount={sale_discount}&sale_total={sale_total}&customer_id={customer_id}&customer_name={customer_name}&customer_email={customer_email}&customer_phone={customer_phone}&customer_altphone={customer_altphone}"/>
*/

module.exports = function(app) {
    app.all("/callback/tn/checkout",function(req,res) {
	    console.log('tn checkout callback');
	    console.log(req.param('request_id'));

	    /* find the ticket record in the ticket collection and add the transaction data to the payment part */
	    fs.readFile('public/img/tx.gif',function(err,pixel) {
		    res.writeHead(200, {'Content-Type': 'image/gif'});
		    return res.end(pixel,'binary');
	    });
    });
}
