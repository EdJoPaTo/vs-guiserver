var WebwsServer = require( 'ws' ).Server;
var wss = new WebwsServer( {
  port: 3000
} );
wss.on( 'connection', connection );

wss.broadcast = function broadcast( data, exclude ) {
  wss.clients.forEach( function each( client ) {
    if (client === exclude) return;
    client.send( data );
  } );
};
console.log( "start" );

function connection( ws ) {
  console.log( "new connection" );
  ws.send( JSON.stringify( {
    type: "serverfaselei",
    content: "server sagt test!"
  } ) );

  ws.on( 'message', function( data ) {
    console.log( 'message', data );
    wss.broadcast( data, ws );
  } );
}
