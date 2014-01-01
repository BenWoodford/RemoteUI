(function()
{
	var trapArea = $( '.mousetrap' ), input = $( '.js-steam-input' ), lastPosition = { x: 0.0, y: 0.0 };
	var deltaArea = $( '.mousedelta' );
	var deltaTimer = null;
	var deltaMouseX = 0, deltaMouseY = 0;
	var mouseisdown = false;

	// Key trap
	$( document ).on( {
		keydown: function( e )
		{
			if( trapArea.is( ':hover' ) )
			{
				e.preventDefault();
				
				var key = 'key_' + Keycode.GetValueByEvent( e );
				
				trapArea.find( 'h3' ).text( key );
				
				SteamRemoteClient.Keyboard.Key( key );
			}
		},
		mousewheel: function( e )
		{
			if( trapArea.is( ':hover' ) )
			{
				e.preventDefault();
				
				SteamRemoteClient.Keyboard.Key( e.originalEvent.wheelDelta > 0 ? 'key_left' : 'key_right' ); // Ideally it should be up/down for dropdowns
			}
		},
		mousemove: function( e )
		{
			if( trapArea.is( ':hover' ) )
			{
				var deltaX = lastPosition.x - event.clientX,
					deltaY = lastPosition.y - event.clientY;
				
				lastPosition =
				{
					x: event.clientX,
					y: event.clientY
				};
				
				SteamRemoteClient.DoPOST( 'mouse/move',
					{
						delta_x: -deltaX,
						delta_y: -deltaY
					}
				);
			}
		}
	} );
	
	$( trapArea ).on( 'click', function( e )
	{
		SteamRemoteClient.DoPOST( 'mouse/click', { button: 'mouse_left' } );
	} );

	$(deltaArea).on('mousemove', function(e) {
		deltaMouseX = e.pageX;
		deltaMouseY = e.pageY;
	});

	deltaTimer = setInterval(function() {
		if(mouseisdown && deltaArea.is(':hover')) {
			var x = $(deltaArea).offset().left + ($(deltaArea).outerWidth()/2);
			var y = $(deltaArea).offset().top + ($(deltaArea).outerHeight()/2);

			SteamRemoteClient.DoPOST('mouse/move',
				{
					delta_x: ((deltaMouseX - x) / ($(deltaArea).outerWidth()/2)) * 10,
					delta_y: ((deltaMouseY - y) / ($(deltaArea).outerHeight()/2)) * 10
				}
			);
		}
	}, 10);

	$(document).on('mousedown', function(e) {
		mouseisdown = true;
	});

	$(document).on('mouseup', function(e) {
		mouseisdown = false;
	});

	// Get space
	$( '.js-steam-get-space' ).click( function( e )
	{
		e.preventDefault( );
		
		SteamRemoteClient.Space.Current( function( data )
		{
			SteamRemoteClient.ShowAlert( 'success', '<b>Current space:</b> ' + data.data.name );
		} );
	} );

	// Get list
	$( '.js-steam-get-games' ).click( function( e )
	{
		e.preventDefault( );
		
		SteamRemoteClient.Games.Index( function( data )
		{
			var list = $( '.js-steam-games-list' ).empty( );
			
			console.log( data );
			
			for( var i in data.data )
			{
				var link = $( '<a></a>', { class: 'list-group-item', href: '#', 'data-appid': i } );
				
				var game = data.data[ i ];
				
				var name = game.name;
				
				if( game.installed )
				{
					name = '<b>' + name + '</b>';
				}
				else
				{
					name = '<i>' + name + ' (' + ( 0 | game.estimated_disk_bytes / 1000000 ) + ' MB)</i>';
				}
				
				link.html( name ).click( function( e )
				{
					e.preventDefault( );
					
					input.val( $( this ).data( 'appid' ) );
				} );
				
				list.append( link );
			}
			
			if( list.is( ':empty' ) )
			{
				list.append( $( '<span></span>', { class: 'list-group-item' } ).text( 'The list is empty :(' ) );
			}
		} );
	} );

	$( '.js-steam-space' ).on( 'click', function( e )
	{
		e.preventDefault();
		
		SteamRemoteClient.Space.Set( input.val() );
	} );

	$( '.js-steam-sequence' ).on( 'click', function( e )
	{
		e.preventDefault();
		
		SteamRemoteClient.Keyboard.Sequence( input.val() );
	} );

	$( '.js-steam-key' ).on( 'click', function( e )
	{
		e.preventDefault();
		
		SteamRemoteClient.Keyboard.Key( input.val() );
	} );

	$( '.js-steam-button' ).on( 'click', function( e )
	{
		e.preventDefault();
		
		SteamRemoteClient.Button.Press( $( this ).data( 'button' ) || input.val() );
	} );

	$( '.js-steam-games' ).on( 'click', function( e )
	{
		e.preventDefault();
		
		SteamRemoteClient.Games.Action( input.val(), 'run' );
	} );
}());
