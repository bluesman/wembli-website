console.log('controllers loading');
function MainCtrl($scope, stack) {
	$scope.main = {};

	console.log('pushing stack in main controller');
	stack.push('in MainCtrl before big loop');
    console.log('started big loop in mapctrl');
    for (var i = 0; i < 99999; i++) {
    	for (var j = 0; j < 9999; j++) {
    		continue;
    	};
    };
    console.log('finished big loop in MainCtrl');

	console.log('pushing stack in main controller');
	stack.push('in MainCtrl after big loop');
	$scope.main.model = 'mainModel';


};

function TestBodyCtrl($scope, stack) {
	$scope.body = {};
	console.log('pushing stack in test body controller');
	stack.push('in TestBodyCtrl');
	$scope.body.modelCtrl = 'modelCtrl';
}
