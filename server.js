var WebwsServer = require( 'ws' ).Server;
var wss = new WebwsServer( {
  port: 3000
} );
wss.on( 'connection', connection );

wss.broadcast = function broadcast( data, exclude ) {
  wss.clients.forEach( function each( client ) {
    if ( client === exclude ) return;
    client.send( data );
  } );
};
wss.broadcastTo = function broadcastTo( identifier, data, exclude ) {
  wss.clients.forEach( function( client ) {
    if ( client === exclude ) return;
    if ( Number( client.identifier ) !== Number( identifier ) ) return;
    client.send( data );
  } );
};

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive( min, max ) {
  return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

function onlyUnique( value, index, self ) {
  return self.indexOf( value ) === index;
}

function generateIdentifier() {
  var identifierList = wss.clients.map( client => client.identifier ).filter( onlyUnique );
  console.log( "identifierList", identifierList );

  var identifier = 0;
  do {
    identifier = getRandomIntInclusive( 100000, 999999 );
  } while ( identifierList.indexOf( identifier ) > 0 );

  return identifier;
}

console.log( "start" );

function connection( ws ) {
  console.log( "new connection" );

  ws.on( 'message', function( data ) {
    console.log( 'message', data );
    var json = JSON.parse( data );
    if ( json.type === 'init' ) {
      if ( !json.identifier ) {
        ws.identifier = generateIdentifier();
        ws.send( JSON.stringify( {
          type: 'init',
          identifier: ws.identifier
        } ) );
      } else {
        ws.identifier = json.identifier;
      }
    } else {
      if ( !json.identifier ) {
        console.warn( 'no identifier', json );
      } else {
        var identifier = json.identifier;
        delete json.identifier;
        wss.broadcastTo( identifier, JSON.stringify( json ), ws );
      }
    }
  } );
}
