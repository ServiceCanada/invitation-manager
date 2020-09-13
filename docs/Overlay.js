/*
* Overlay.js
* Contains the fonctions and events for the survey overlay
* tacken from wet github: wb.js, overlay.js, and focus.js
************************ https://github.com/wet-boew/wet-boew/blob/master/src/core/wb.js
************************ https://github.com/wet-boew/wet-boew/blob/master/src/plugins/overlay/overlay.js
************************ https://github.com/wet-boew/wet-boew/blob/master/src/plugins/wb-focus/focus.js
* Customized for not WET theme
*/ 



/***********************************************************************************/
/***********************************************************************************/
/***********************************************************************************/


/*
* wb object: Functions and events for wb object needed for the overlay popup
*/


wb = {
	
	initQueue: 0,
	selectors: [],
	doc: $( document ),
	isReady: false,
	isStarted: false,
	seed: 0,
	lang: document.documentElement.lang,
		
		
	/*
	* return boolean of state of disabled flag
	*/
	isDisabled : function() {
		var disabledSaved = "false",
			disabled;
			
		try {
			disabledSaved = localStorage.getItem( "wbdisable" ) || disabledSaved;
		}
		catch ( e ) { }
		
		disabled = currentpage.params.wbdisable || disabledSaved;
		return ( typeof disabled === "string" ) ? ( disabled.toLowerCase() === "true" ) : Boolean ( disabled );
	},
		
		
	/*
	* Remove a selector targeted by timerpoke
	*/
	remove: function( selector ) {
		var len = this.selectors.length,
					i;
		
		for ( i = 0; i != len; i += 1 ) {
			if ( this.selectors[ i ] === selector ) {
				this.selectors.splice( i, 1 );
				break;
			}	
		}
	},
	
	
	/*
	* getId function
	*/
	getId: function() {
			return "wb-auto-" + ( wb.seed += 1 );
	},


	init: function ( event, componentName, selector, noAutoId ) {
		var eventTarget = event.target,
			isEvent = !!eventTarget,
			node = isEvent ? eventTarget : event,
			initedClass = componentName + "-inited",
			isDocumentNode = node === document;
		
		/*
		* Filter out any events triggered by descendents and only initializes
		* the element once (if is an event and document node is not the target)
		*/
		if ( !isEvent || isDocumentNode || ( event.currentTarget === node &&
			node.className.indexOf( initedClass ) === -1 ) ) {
				
			this.initQueue += 1;
			this.remove(selector);
			if ( !isDocumentNode ) {
				node.className += " " + initedClass;
				if ( !noAutoId && !node.id ) {
					node.id = wb.getId();
				}
			}
			return node;
		}
		//return undef;
		return document.querySelector(selector);
	},
	
	
	/*
	* ready function
	*/
	ready: function( $elm, componentName, context) {
		if ($elm) {
			// Trigger any nested elements (excluding nested within nested)
			$elm
				.find( wb.allSelectors )
				.addClass( "wb-init" )
				.filter( ":not(#" + $elm.attr( "id" ) + " .wb-init .wb-init)" )
				.trigger( "timerpoke.wb" );
				
			// Identify that the component is ready
			$elm.trigger( "wb-ready." + componentName, context);
			this.initQueue -= 1;
		}
		else {
			this.doc.trigger( "wb-ready." + componentName, context );
		}
		
		// Identify that global initialization is complete
		if ( !this.isReady && this.isStarted && this.initQueue < 1 ) {
			this.isReady = true;
			this.doc.trigger( "wb-ready.wb" );
		}
	},
	
	
	/*
	* start function
	*/
	start: function() {
		// Save a copy of all the possible selectors
		wb.allSelectors = wb.selectors.join( ", ");
		
		// Initiate timerpoke events right way
		wb.timerpoke( true );
		this.isStarted = true;
		this.ready();
		
		// initiate timerpoke events again every half second
		setInterval( wb.timerpoke, 500);
	},
	
	
	/*
	* add function: Add a selector to be targeted by timerpoke
	*/
	add: function( selector ) {
		var exists = false,
			len = wb.selectors.length,
			i;
			
		// Lets ensure we are not running if things are disabled
		if ( wb.isDisabled && selector !== "#wb-tphp" ) {
			return 0;
		}
		
		// Check to see if the selector is already targeted
		for ( i = 0; i !== len; i += 1 ) {
			if (wb.selectors[ i ] === selector ) {
				exists = true; 
				break;
			}
		}
		
		// Add the selector if it isn't already targeted
		if ( !exists ) {
			wb.selectors.push( selector );
		}
	},
	
	
	/* 
	* JQuery escape function -- does not do anything
	*/
	jqEscape : function (str) {return str;} //{ return str.replace(/[#;&,\.\+\*~':"!\^\$\[\]\(\)=>|\/\\]/g, '\\$&'); }
	

};




/********************************************************/
/********************************************************/
/********************************************************/


/*
* overlay functions and events needed for the survey overlay popup
*/


/* 
* first function to be executed
*/
( function ( $, window, document, wb ) {
	"use strict";
	
	/*
	* Variable and function definitions.
	* These are global to the plugin - meaning that they will be initialized one per page,
	* not once per instance of plugin on the page.
	* So, this is a good place to define variables that are common to all instances
	* of the plugin on the page
	*/
	var componentName = "wb-overlay",
		selector = "." + componentName,
		initEvent = "wb-init" + selector,
		closeClass = "overlay-close",
		linkClass = "overlay-lnk",
		ignoreOutsideClass = "outside-off",
		overlayOpenFlag = "wb-overlay-dlg",
		initialized = false,
		sourceLinks = {},
		setFocusEvent = "setfocus.wb",
		$document = wb.doc,
		i18nText,
		
		
		/*
		* @method init
		* @param (jQuery Event) event Event that triggered the function call
		*/
		init = function ( event) {
			
			/*
			* start initialization
			* returns DOM object = proceed with init
			* return undefined = do not proceed with init (e.g., already initialized)
			*/
			var elm = wb.init( event, componentName, selector ),
				$elm,
				overlayClose;
				
			if ( elm ) {
				$elm = $( elm );
				
				// Only initialize the i18nText once
				if ( !i18nText ) {
					// ii18Text contrains the required language translation for words needed by survey popup (english and french)
					i18nText = {
						close: ( wb.lang === "en" ) ? "Close" : "Fermer", 
						colon: ( wb.lang === "en" ) ? ":" : "&#160;:", 
						space: "&#32;", 
						esc: ( wb.lang === "en" ) ? "(escape key)" : "(touche d\'échappement)", 
						closeOverlay: ( wb.lang === "en" ) ? "Close overlay" : "Fermer la fenêtre superposée" 
					};
				}
				

				elm.setAttribute( "aria-hidden", "true" );
				
				
				// Identify that initialization has completed
				initialized = true;
				wb.ready ( $elm, componentName );	

			} 
		},
		
		
		/*
		* openOverlay function
		*/
		openOverlay = function( overlayId, noFocus ) {
			var $overlay = $( "#" + wb.jqEscape( overlayId ) );
			
			$overlay
					.addClass( "open" )
					.attr( "aria-hidden", "false" );
					
			if ( $overlay.hasClass( "wb-popup-full" ) || $overlay.hasClass("wb-popup-mid" ) ) {
				$overlay.attr( "data-pgtitle", document.getElementsByTagName( "H2" )[ 0 ].textContent );
				$document.find( "body" ).addClass( overlayOpenFlag );
			}
			
			if ( !noFocus ) {
				$overlay
						.scrollTop( 0 )
						.trigger( setFocusEvent );
			}
			
			/*
			* Register the overlay if it wasn't previously registered
			* (only required when opening through an event)
			*/
			if ( !sourceLinks[ overlayId ] ) {
				setTimeout( function() {
					sourceLinks[ overlayId ] = null;
				}, 1 );
			}
			$overlay.trigger ( "opened" + selector );		
		},
		
		 
		/*
		* closeOverlay function
		*/
		closeOverlay = function( overlayId, noFocus, userClosed ) {
			var $overlay = $( "#" + overlayId ),
				sourceLink = sourceLinks[ overlayId ];
				
			$overlay
					.removeClass( "open" )
					.attr( "aria-hidden", "true" );
					
			if ( $overlay.hasClass( "wb-popup-full" ) || $overlay.hasClass( "wb-popup-mid" ) ) {
				$document.find( "body" ).removeClass( OverlayOpenFlag );
			}
			
			if ( userClosed ) {
				$overlay.addClass( "user-closed" );
			}
			
			if ( !noFocus && sourceLink ) {
				// Returns focus to the source link for the overlay
				$( sourceLink ).trigger( setFocusEvent );	
			}
			
			// Delete the source link reference
			delete sourceLinks[ overlayId ];
			
			$overlay.trigger( "closed" + selector );
		};
	
	
	/*
	* case of event.type is "open" or "close" or default
	*/
	$document.on( "timerpoke.wb " + initEvent + " keydown open" + selector + " close" + selector, 
		selector, function( event ) {
		
		var eventType = event.type,
			which = event.which,
			eventTarget = event.target,
			eventTurrentTarget = event.currentTarget,
			overlayId = eventTurrentTarget.id,
			overlay,
			$focusable,
			index, 
			length;
			
		switch ( eventType ) {
			case "timerpoke":
			case "wb-init":
				init( event );
				break;
				
			case "open":
				if ( eventTurrentTarget === eventTarget ) {
					openOverlay( overlayId, event.noFocus );
				}
				break;
				
			case "close":
				if ( eventTurrentTarget === eventTarget ) {
					closeOverlay( overlayId, event.noFocus );
				}
				break;
				
			default:
				overlay = document.getElementById( overlayId );
				
				switch ( which ) {
					
					// Tab Key
					case 9: 
						// No special tab handling when ignoring outside activity
						/*if ( overlay.className.indexOf( ignoreOutsideClass ) === -1 ) {
							$focusable = $( overlay ).find( ":focusable:not([tabindex='-1'])" );
							length = $focusable.length;
							index = $focusable.index( event.target ) + ( event.shiftkey ? -1 : 1 );
							
							if ( index === -1 || index === length ) {
								event.preventDefault();
								$focusable.eq( index === -1 ? length - 1 : 0 ).trigger( setFocusEvent );
							}
							
						}*/
						break;
					
						
					// EScape key
					case 27:
						if ( !event.isDefaultPrevented() ) {
							closeOverlay( overlayId, false, true );
						}
						break;	
				}
		}	
	} );
	
	
	/*
	* Handler for cliking on the close button of the overlay
	*/
	$document.on( "click vclick", "." + closeClass, function( event ) {
		var which = event.which;
		
		// Ignore if not initialized and middle/right mouse buttons
		if ( initialized && ( !which || which === 1 ) ) {
			closeOverlay( 
					$( event.currentTarget ).closest( selector ).attr( "id" ), 
					false,
					true
			);		
		}
	});
	
	
	/*
	* Handler for clicking on a source link for the overlay
	*/
	$document.on( "click vclick keydown", "." + linkClass, function( event ) {
		var which = event.which,
			sourceLink = event.currentTarget,
			overlayId = sourceLink.hash.substring( 1 );
			
		// Ignore if not initialized and middle/right mouse buttons
		if ( initialized && ( !which || which === 1 || which === 32 ) ) {
			event.preventDefault();
			
			// Introduce a delay to prevent outside activity detection
			setTimeout( function() {
				
				// Stores the source link for the overlay
				sourceLinks[ overlayId ] = sourceLink;
				
				// Opens the overlay
				openOverlay( overlayId );
			}, 1 );
		}
	});
	
	
	/*
	* Handler for cliking on a same page link within the overlay to outside the overlay
	*/
	$document.on( "click vclick", selector + " a[href^='#']", function( event ) {
		var which = event.which,
			eventTarget = event.target,
			href,
			overlay,
			linkTarget;
			
		// Ignore if not initialized and middle/right mouse buttons
		if ( initialized && ( !which || which === 1 ) ) {
			overlay = $( eventTarget ).closest( selector )[ 0 ];
			href = eventTarget.getAttribute( "href" );
			linkTarget = document.getElementById( href.substring( 1 ) );
			
			// Ignore same page links to within the overlay
			if ( href.length > 1 && !$.contains( overlay, linkTarget ) ) {
				
				// Stop propagation of the click event
				if ( event.stopPropagation ) {
					event.stopImmediatePropagation();
				}
				else {
					event.cancelBubble = true;
				}
				
				// Close the overlay and set focus to the same page link
				closeOverlay( overlay.id, true );
				$( linkTarget ).trigger( setFocusEvent );
			}
		}
	});
	
	
	/*
	* Outside activity detection
	*/
	$document.on( "click vclick touchstart focusin", "body", function( event ) {
		var eventTarget = event.target,
			which = event.which,
			overlayId,
			overlay;
			
		// Ignore if not initialized and middle/right mouse buttons
		if ( initialized && ( !which || which === 1 ) ) {
			
			// Close any overlays with outside activity
			for (overlayId in sourceLinks ) {
				overlay = document.getElementById( overlayId );
				if ( overlay && overlay.getAttribute( "aria-hidden" ) === "false" &&
					eventTarget.id !== overlayId &&
					overlay.className.indexOf( ignoreOutsideClass ) === -1 &&
					!$.contains( overlay, eventTarget ) ) {
					
					// Close the overlay
					closeOverlay( overlayId );
				}
			}
		}
	});
	
	
	/*
	* Ensure any element in focus ouside an overlay is visible
	*/
	$document.on( "keyup", function() {
		var elmInFocus, elmInFocusRect, focusAreaBelow, focusAreaAbove,
			overlayId, overlay, overlayRect;
			
		// Ignore if not initialized
		if ( initialized ) {
			elmInFocus = document.activeElement;
			elmInFocusRect = elmInFocus.getBoundingClientRect();
			focusAreaBelow = 0;
			focusAreaAbove = window.innerHeight;
			
			// Ensure that at least one overlay is visible, and that the element in focus is not an overlay,
			// a child of an overlay, or the body element
			if ( $.isEmptyObject( sourceLinks ) ||
					elmInFocus.className.indexOf( componentName ) !== -1 ||
					$( elmInFocus ).parents( selector ).length !== 0 ||
					elmInFocus === document.body ) {
					
					return;
			}
			
			// Determine the vertical portion of the viewport that is not obscured by an overlay
			for ( overlayId in sourceLinks ) {
				overlay = document.getElementById( overlayId );
				if ( overlay && overlay.getAttribute( "aria-hidden" ) === "false" ) {
					overlayRect = overlay.getBoundingClientRect();
					if ( overlay.className.indexOf( "wb-bar-t" ) !== -1 ) {
						focusAreaBelow = Math.max( overlayRect.bottom, focusAreaBelow );
					}
					else if ( overlay.className.indexOf( "wb-bar-b" ) !== -1 ) {
						focusAreaAbove = Math.min( overlayRect.top, focusAreaAbove );
					}
				}
			}
			
			// Ensure the element in focus is visible
			// TODO: Find a solution for when there isn't enough page to scroll up and down
			if ( elmInFocusRect.top < focusAreaBelow ) {
				
				//Scroll down till the top of the element is visible
				window.scrollBy( 0, focusAreaBelow - elmFocusRect.top );
			}
			else if (elmInFocusRect.bottom > focusAreaAbove ) {
				
				// Scroll up till the bottom of the element is visible
				window.scrollBy( 0, elmInFocusRect.bottom - focusAreaAbove );
			}	
		}
	});
	
	
	/*	
	* Bind the setfocus event	 
	*/
	$document.on( setFocusEvent, function( event ) {
		if ( event.namespace === "wb" ) {
			var $elm = $( event.target ),
				$closedParents = $elm.not( "summary" ).parents( "details, [role='tabpanel']" ),
				$closedPanels,
				$closedPanel, 
				len,
				i;
				
			if ( $closedParents.length !== 0 ) {
				
				// Open any closed ancestor details elements
				$closedParents.not( "[open]" ).children( "summary" ).trigger( "click" );
				
				// Open any closed tabpanels
				$closedPanels = $closedParents.filter( "[aria-hidden='true']" );
				len = $closedPanels.length;
				for ( i = 0; i != len; i += 1 ) {
					$closedPanel = $closedPanels.eq( i );
					$closedPanel.closest( " .wb-tabs" )
						.find( "#" + $closedPanel.attr( "aria-labelledby" ) )
						.trigger( "click" );
				}
			}
			
			// Set the tabindex to -1 (as needed) to ensure the element is focusable
			/*$elm
				.filter( ":not([tabindex], a[href], button, input, textarea, select)" )
				.attr( "tabindex", "-1" );
			*/	
			// Assigns focus to an element (delay allows for revealing of hidden content)
			setTimeout( function() {
				$elm.trigger( "focus" )
				
				var $topBar = $( ".wb-bar-t[aria-hidden=false]" );
				
				// Ensure the top bar overlay does not conceal the focus target
				if ( $topBar.length !== 0 ) {
					document.documentElement.screenTop -= $topBar.outerHeight();
				}
				
				return $elm;
			}, 100);
		}
			
	});
	
	
	// Add the timer poke to initialize the plugin
	wb.add( selector );	
	
} )( jQuery, window, document, wb); 




