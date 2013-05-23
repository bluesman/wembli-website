var s = '0b50f03cb15a11e28537026ba7d31e6f';
var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
var b = require('../../bluesman-nbalanced/lib/nbalanced');

var s2 = '42e01b00b15e11e29523026ba7c1aba6';
var m2 = '/v1/marketplaces/MP22BmXshSp7Q8DjgBYnKJmi';


var api = new b({
	marketplace_uri: m,
	secret: s
});

var merchantAccountData = {
	_type: 'account',
	_uris: {
		holds_uri: {
			_type: 'page',
			key: 'holds'
		},
		bank_accounts_uri: {
			_type: 'page',
			key: 'bank_accounts'
		},
		refunds_uri: {
			_type: 'page',
			key: 'refunds'
		},
		customer_uri: {
			_type: 'customer',
			key: 'customer'
		},
		debits_uri: {
			_type: 'page',
			key: 'debits'
		},
		transactions_uri: {
			_type: 'page',
			key: 'transactions'
		},
		credits_uri: {
			_type: 'page',
			key: 'credits'
		},
		cards_uri: {
			_type: 'page',
			key: 'cards'
		}
	},
	bank_accounts_uri: '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC4q3VmXC2vFH4JgC3tRAyKI/bank_accounts',
	meta: {},
	transactions_uri: '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC4q3VmXC2vFH4JgC3tRAyKI/transactions',
	email_address: 'test-merchant-06@tomwalpole.com',
	id: 'AC4q3VmXC2vFH4JgC3tRAyKI',
	credits_uri: '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC4q3VmXC2vFH4JgC3tRAyKI/credits',
	cards_uri: '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC4q3VmXC2vFH4JgC3tRAyKI/cards',
	holds_uri: '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC4q3VmXC2vFH4JgC3tRAyKI/holds',
	name: 'Test Merchant',
	roles: ['merchant'],
	created_at: '2013-05-23T06:25:31.003617Z',
	uri: '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC4q3VmXC2vFH4JgC3tRAyKI',
	refunds_uri: '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC4q3VmXC2vFH4JgC3tRAyKI/refunds',
	customer_uri: '/v1/customers/AC4q3VmXC2vFH4JgC3tRAyKI',
	debits_uri: '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC4q3VmXC2vFH4JgC3tRAyKI/debits'
}

/* get account by uri */
/* this isn't exactly right - its got merchant acount info which is good and uri's which are good
	but be careful - the way to use this info properly with nbalanced is by creating a Customers context
	using the customer_uri from here...the customer will have all the necessary uris too
 */
api.Accounts.get(merchantAccountData.uri, function(err, account) {
	console.log('get merchant account via Accounts');
	console.log(account);
});
/* this returns a list of all bank accounts for wembli - this is bad - dont' use it */
api.BankAccounts.list(merchantAccountData.bank_accounts_uri,function(err,bankAccounts) {
	console.log('get bank accounts for merchant account');
	console.log(bankAccounts);
})

/* this is the right way to get customer info */
api.Customers.get(merchantAccountData.customer_uri,function(err,customer) {
	console.log('get customer for merchant account');
	console.log(customer);
	var custApi = api.Customers.nbalanced(customer);
	custApi.BankAccounts.list(function(err,ba) {
		console.log('list of bank accounts for customer');
		console.log(ba);
	});
});

