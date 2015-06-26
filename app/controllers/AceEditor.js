
function AceEditor( $scope, $http ) {

  var parent = $scope.$parent;

  $scope.aceLoaded = function( ace ) {

    // if( $scope.$parent.$parent.$parent ){
    //   parent = $scope.$parent.$parent;
    // }

    // Editor part
    var _session = ace.getSession();
    var _renderer = ace.renderer;

    // Options
    ace.setReadOnly(true);
    ace.$blockScrolling = Infinity;
    _renderer.setShowGutter(false);
    _renderer.setShowPrintMargin(false);
    // console.log( Object.keys(ace) );
    // console.log( Object.keys(_renderer) );
    // ace.setReadOnly(true);

    // parent.attachEditor( ace );
    parent.$emit( 'ace.loaded', ace );
    // console.log( 'aceLoaded' );

    ace.on( 'focus', function(){
      parent.$emit( 'ace.focus', ace );
      // $( ace.container ).parent().parent().addClass( 'shadow' );
      // $( ace.container ).parent().parent().find('.code-title').addClass( 'rounded' );
      // $( ace.container ).parent().parent().addClass( 'rounded' );
      // $( ace.container ).parent().addClass( 'rounded' );
    });
    ace.on( 'blur', function(){
      parent.$emit( 'ace.blur', ace );
      // $( ace.container ).parent().parent().removeClass( 'shadow' );
      // $( ace.container ).parent().parent().find('.code-title').removeClass( 'rounded' );
      // $( ace.container ).parent().parent().removeClass( 'rounded' );
      // $( ace.container ).parent().removeClass( 'rounded' );
    });
    ace.on( 'change', function(){
      parent.$emit( 'ace.change', ace );
      updateEditorHeight( ace );
    });
  };

  $scope.aceChanged = function( e, ace ) {
    parent.$emit( 'ace.changed', ace );
    console.log( 'aceChanged' );
  };
}

// helper function to resize the ace editor to its parent
function updateEditorHeight( ace ) {

  var codeEl = $( ace.container ).parent();
  if( !ace.getSession ) return null;

  // http://stackoverflow.com/questions/11584061/
  var newHeight =
            ace.getSession().getScreenLength()
            * ace.renderer.lineHeight
            + ace.renderer.scrollBar.getWidth();

  $(codeEl).height(newHeight.toString() + "px");
  ace.resize();

  // this sets the parent .status element to the new gutter width
  setTimeout( function(){
    codeEl.parent().find('.status').css( 'width', codeEl.find('.ace_gutter-layer').width() );
  }, 100);
  // editor.getSession().on('change', updateEditorHeight);
};