
function ScriptEditor( $scope ) {

  $scope.script = {
    request: {},
    assertions: []
  };

  $scope.$on( 'ace.loaded', function( event, ace ){
    ace.setHighlightActiveLine( false );
    ace.setDisplayIndentGuides( true );
  });
}