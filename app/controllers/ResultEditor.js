
function ResultEditor( $scope, CiaoService, $http, progressbar ) {

  $scope.script = {
    request: {},
    response: {},
    req_visible: true,
    head_visible: true,
    res_visible: true
  };

  $scope.toggle = function( id ){
    $scope.script[ id+'_visible' ] = !$scope.script[ id+'_visible' ];
  }

  $scope.$on( 'ace.loaded', function( event, ace ){
    ace.setHighlightActiveLine( false );
    ace.setDisplayIndentGuides( false );
    ace.setReadOnly( true );
  });

  var prevData = ''

  $scope.$on( 'test.post', function( e, data ){

    console.log( 'event', 'test.post' );

    // a bunch of shitty code to stop duplicate requests
    thisData = data.request.code
    data.assertions.map( function( assertion ){
      thisData += assertion.code
    });
    if( thisData === prevData ) return null
    prevData = thisData

    $scope.script.res_visible = false;
    $scope.script.head_visible = false;
    $scope.script.req_visible = false;

    progressbar.color('#29d');
    progressbar.start();

    $http.post( '/request', data )
         .success( function( res ){

            progressbar.complete();

            $scope.script.res_visible = true;

            // res.response = angular.fromJson( angular.fromJson( res.response ) );
            // console.log( res );

            console.log( 'server data', data );
            // console.log( res.assertions );

            if( res.error ){
              console.error( res.error );
              $scope.script.response = {
                status: 0,
                headers: '',
                body: res.error
              };
            }

            else {

              // console.log( 'got response!', res );
              $scope.script.head_visible = true;
              $scope.script.req_visible = true;

              $scope.script.request.code = angular.toJson( res.request, 2 );
              $scope.script.response.headers = angular.toJson( res.response.headers, 2 );
              $scope.script.response.body = res.response.body;

              if( res.response.body && res.response.body.substr(0,1) === '{' ){
                $scope.script.response.body = angular.toJson( angular.fromJson( res.response.body ), 2 )
              }

              $scope.$$prevSibling.$emit( 'test.update', res );

            }

         })
         .error( function(){
          console.log( 'REQUEST ERROR' );
         });

  });
}