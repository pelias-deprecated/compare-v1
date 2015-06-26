
function ScriptEditor( $scope ) {

  $scope.script = {
    request: {},
    assertions: []
  };

  $scope.$on( 'ace.loaded', function( event, ace ){
    ace.setHighlightActiveLine( false );
    ace.setDisplayIndentGuides( true );

    // ace.commands.addCommand({
    //   name: 'saveScript',
    //   bindKey: {
    //     win: 'Ctrl-S',
    //     mac: 'Command-S',
    //     sender: 'editor|cli'
    //   },
    //   exec: function( env, args, request ) {
    //     $scope.$emit( 'ace.blur', ace );
    //   }
    // });

    // ace.commands.addCommand({
    //   name: 'runScript',
    //   bindKey: {
    //     win: 'Ctrl-Enter',
    //     mac: 'Command-Enter',
    //     sender: 'editor|cli'
    //   },
    //   exec: function( env, args, request ) {
    //     $scope.$emit( 'ace.blur', ace );
    //   }
    // });
  });

  // $scope.$on( 'test.update', function( e, data ){

  //   data.assertions.map( function( assertion ){
  //     for( i in $scope.script.assertions ){
  //       if( assertion.title == $scope.script.assertions[i].title ){
  //         $scope.script.assertions[i].status = assertion.status;
  //         $scope.script.assertions[i].message = assertion.message || null;
  //       }
  //     }
  //   });

  //   // $scope.script.assertions = data.assertions;
  // });

  $scope.$on( 'ace.blur', function( event, ace ){
    // ace.updateEditorHeight();

    // var match = $scope.script.request.code.match(/#> (.*)/);
    // $scope.script.request.title = ( match ) ? match[1] : '';

    // if( $scope.script.assertions ){
    //   $scope.script.assertions.forEach( function( assertion ){
    //     var match = assertion.code.match(/#? (.*)/);
    //     assertion.title = ( match ) ? match[1] : '';
    //   });
    // }

    // // save record
    // $scope.script.post();
    // $scope.$$nextSibling.$emit( 'test.post', $scope.script );

  });

  // // // load record
  // CiaoService.one( 'script' ).get().then( function( data ) {
  //   $scope.script = data;
  //   $scope.$$nextSibling.$emit( 'test.post', $scope.script );
  // });
}