  var wembliUtils = require('wembli/utils');
  var wembliModel = require('wembli-model');
  var Plan = wembliModel.load('plan');
  var Customer = wembliModel.load('customer');
  var Feed = wembliModel.load('feed');

  /* customer functionality:
   - create
   - confirm email
   - validate password
   - forgot password

   static methods
   - get customer by token
   - get list of plans
     - all plans
     - only those organizing
     - only those invited to (this is tricky because of the email/fb/twitter id issue)
  */

  //create a plan to add to a customer
  var guid = Plan.makeGuid();
  var newPlan = {
    guid: guid,
    event : {
      eventId : "123456",
      eventName : "Test Event"
    },
    preferences : {
      payment : 'self',
      addOns : {
        hotel : true,
        parking : false,
        restaurant: false,
      },
      inviteOptions : {
        guestFriends : true,
        over21 : false,
      },
      guestList : 'full'
    },
  };

  var plan = new Plan(newPlan);

  /* make customer */
  var digest = wembliUtils.digest('123');
  var email = "test1@tomwalpole.com";

  var newC = {
    email: email,
    firstName: "Test",
    lastName: "One",
    password: digest,
    confirmed: false
  };

  var customer = new Customer(newC);

  var confirmationTimestamp = new Date().getTime().toString();
  var digestKey             = email + confirmationTimestamp;
  var confirmationToken     = wembliUtils.digest(digestKey);

  customer.confirmation.push({
    timestamp: confirmationTimestamp,
    token: confirmationToken
  });

  customer.save(function(err) {
    console.log('saved customer: '+customer.id);
    plan.organizer = customer._id;
    console.log('plan.organizer: ');
    console.log(plan.organizer);
    plan.save(function(err) {
      console.log('saved plan: '+plan.id);
      console.log('add plan to customer')

      customer.addPlan(plan.guid,function(err) {
        console.log('added a plan to customer..');

        /* get plan organizer customer obj */
        console.log('get organize cust obj for this plan.organizer: '+plan.organizer);
        Customer.findById(plan.organizer,function(err,c2) {
          console.log('organizer for plan:' + err);
          console.log(c2);
          /* delete the customer */
          c2.remove(function(err) {
            console.log('removed customer: '+customer.id);
            wembliModel.close();
          });
        });
      });
    });
  });
