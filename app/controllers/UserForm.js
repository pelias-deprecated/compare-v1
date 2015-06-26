function UserForm($scope,$http) {

  var master = {};

  $http({ method: 'GET', url: '/form' }).
    success(function(data, status, headers, config) {
      master = data;
      $scope.cancel();
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });

  $scope.state = /^\w\w$/;
  $scope.zip = /^\d\d\d\d\d$/;

  $scope.cancel = function() {
    $scope.form = angular.copy(master);
  };

  $scope.save = function() {
    master = $scope.form;
    $scope.cancel();
  };

  $scope.addContact = function() {
    $scope.form.contacts.push({type:'', value:''});
  };

  $scope.removeContact = function(contact) {
    var contacts = $scope.form.contacts;
    for (var i = 0, ii = contacts.length; i < ii; i++) {
      if (contact === contacts[i]) {
        contacts.splice(i, 1);
      }
    }
  };

  $scope.isCancelDisabled = function() {
    return angular.equals(master, $scope.form);
  };

  $scope.isSaveDisabled = function() {
    return $scope.myForm.$invalid || angular.equals(master, $scope.form);
  };

  $scope.cancel();
}