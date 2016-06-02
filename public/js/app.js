
var app = angular.module('bigsocket', ['ngSanitize']);

app.run(['$rootScope', function($rootScope){
   $rootScope.version = 1.0;
}]);
//..

app.controller('socketController', ['$scope','$rootScope', 'socket',
                    function($scope, $rootScope, socket) {
    $scope.socket = socket;
    $scope.connected = false;
    $scope.socket.on('connect', function() {
            $scope.connected = true;
		});
    $scope.socket.on('disconnect', function() {
            $scope.connected = false;
		});

}]);

//..
app.factory('socket', function ($rootScope) {
    return new Socket($rootScope);
});

function Socket($rootScope){
    this.$rootScope = $rootScope;
    this.socket = io.connect('http://localhost:9092');
    this.on = function (eventName, callback) {
            var self = this;
            self.socket.on(eventName, function () {
                var args = arguments;
                self.$rootScope.$apply(function () {
                    callback.apply(self.socket, args);
                });
            });
        };
    this.emit = function (eventName, data, callback) {
        var self = this;
        self.socket.emit(eventName, data, function () {
            var args = arguments;
            self.$rootScope.$apply(function () {
                if (callback) {
                    callback.apply(self.socket, args);
                }
            });
        });
    };
};
