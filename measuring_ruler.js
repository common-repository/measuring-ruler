/*
/*
/*
 * Measuring Ruler JS
 * since 1.1
 *
 */

const mea_data1 = document.getElementById ( 'mea_data1' ),		// Data box 1 element
	mea_data1c = document.getElementById ( 'mea_data1c' ),		// Data box 1 element child
	mea_data2 = document.getElementById ( 'mea_data2' ),		// Data box 2 element
	mea_data2c = document.getElementById ( 'mea_data2c' ),		// Data box 2 element child
	mea_canvas1 = document.getElementById ( 'mea_canvas1' ),	// Canvas1 element cross 1
	mea_canvas2 = document.getElementById ( 'mea_canvas2' ),	// Canvas1 element cross 2
	mea_canvas3 = document.getElementById ( 'mea_canvas3' ),	// Canvas1 element rectangle
	mea_cursor = document.getElementById ( 'mea_cursor' ),		// Cursor div element
	mea_body = document.body || document.getElementsByTagName('body')[0],	// The page
	mea_header = document.getElementsByTagName('header')[0],	// The header
	mea_page = document.getElementById ( 'page' ),				// Page div element
	mea_cross_size = 18,				// Size of cursor
	mea_marg_size = 10;					// Marging of data and other element
	mea_line_color1 = '#dddddd',		// Color of solid lines
	mea_line_color2 = '#222222',		// Color of shiffed lines
	mea_inaccuracy_positioning = 10,	// Inaccuracy of the positioning
	mea_offset = 1,						// Offset
	mea_cursor_shift = 3,				// Marging of system cursor
	mea_transition_on = 'all 0.2s ease 0s',
	mea_transition_all_on = 'all 0.2s ease 0s',
	mea_transition_opa_on = 'opacity 0.2s ease 0s',
	mea_transition_top_on = 'top 0.2s ease 0s',
	mea_deley_time = 300,
	mea_transition_off = 'none 0s ease 0s';

var mea_M_nb = 0,
	mea_A_nb = 0,
	mea_transition = false,
	mea_rel_cursor_x,	// Current ralative X cursor position
	mea_rel_cursor_y,	// Current ralative Y cursor position
	mea_abs_cursor_x,		// Current absolute X cursor position
	mea_abs_cursor_y,		// Current absolute Y cursor position
	mea_abs_show_x,			// X absolute position for show box
	mea_abs_show_y,			// Y absolute position for show box
	mea_abs_begin_x,		// X absolute position for draw box
	mea_abs_begin_y,		// Y absolute position for draw box
	mea_abs_end_x,			// End X absolute position for draw box
	mea_abs_end_y,			// End Y absolute position for draw box
	mea_dx,					// Current X position
	mea_dy,					// Current Y position
	mea_dw,					// Current width
	mea_dh,					// Current heiht
	mea_click_num = 0,		// For the clicks count
	mea_console_ind = 0,	// For debuging
	mea_line_corr,			// Size for correcting of line width
	mea_is_active = false,	// Is the plain activ
	mea_is_first_click,		// Is the first click
	mea_cursor_shift_ini = 0,	// Shift of cursor on start
	mea_cross_img,			// The crosshair element
	mea_onscroll_bottom,	// Size of screen scroll bottom
	mea_onscroll_left,		// Size of screen scroll left
	mea_onscroll_right,		// Size of screen scroll left
	mea_onscroll_top,		// Size of screen scroll top
	mea_time_scroll,		// Timing for scrolling
	mea_auto_mode = false,	// Auto mode
	mea_first_m = true,	// First pass M
	mea_auto_a,				// Element to displey auto mode
	mea_show1_pos_x,		// Position for rectangle X
	mea_show1_pos_y,		// Position for rectangle Y
	mea_corr_x,
	mea_corr_y,
	mea_scroll = false,
	mea_resize = false,
	mea_data_top1 = [],		// List of data top 1
	mea_data_top2 = [],		// List of data top 2
	mea_data_left1 = [],	// List of data left 1
	mea_data_left2 = [],	// List of data left 2
	ctx;					// Canvas element

mea_get_cursor ();
mea_ini ();

// Initiate all the datas
function mea_ini () {
	mea_data1.style.display = 'none';
	mea_data2.style.display = 'none';
	mea_canvas1.style.display = 'none';
	mea_canvas2.style.display = 'none';
	mea_canvas3.style.display = 'none';
	mea_cursor.style.display = 'none';
	mea_auto_onoff ();
	mea_click_num = 0;
	mea_is_active = false;
	mea_is_first_click = true;
	mea_body.style.overflowY = 'auto';			// Allow to scroll
	mea_el_transition_none ( mea_data1 );
}

function mea_el_transition_none ( el ) {
	el.style.transition = mea_transition_off;
}

function mea_el_transition_opa ( el ) {
	el.style.transition = mea_transition_opa_on;
	el.style.opacity = 1;
}

//*********************
//*	Autocorrection
//*********************

// Indicate auto mode
function mea_auto_onoff ( ) {
	if ( mea_auto_mode ) {
		mea_auto_a.style.display = 'block';
	}
	if ( ! mea_auto_mode ) {
		mea_auto_a.style.display = 'none';
	}
}

// Get data for page elements to correct inaccuracies
function mea_searh_elements () {
	mea_data_top1 = [];
	mea_data_top2 = [];
	mea_data_left1 = [];
	mea_data_left2 = [];

	let e = document.querySelectorAll('*'),
		j = 0;
	for (let i = 0; i < e.length; i++) {
		let s = e[i].id;
		if ( s.includes ( 'mea_' ) ) {
			continue;
		}

		let box = e[i].getBoundingClientRect(),	// Box of data
			t = Math.round( box.top + mea_onscroll_top ),
			l = Math.round( box.left + mea_onscroll_left ),
			h = Math.round(box.height),
			w = Math.round(box.width);
		if ( !t && !l && !h && !w ) {		// Empty data not needed
			continue;
		}

		let t1 = t,
			t2 = t + h,
			l1 = l,
			l2 = l + w;

		if ( j && ( mea_data_top1[j - 1] == t1 ) && ( mea_data_top2[j - 1] == t2 )	// Doblicated data
			&& ( mea_data_left1[j - 1] == l1 ) && ( mea_data_left2[j - 1] == l2 )	) {
			continue;
		}
		mea_data_top1[j] = t1;
		mea_data_top2[j] = t2;
		mea_data_left1[j] = l1;
		mea_data_left2[j] = l2;
		j++;
	}
}

// Correcting inaccurate cursor settings on an element
function mea_correct_inaccuracy () {

	if ( ! mea_auto_mode ) {
		return;
	}
//	mea_cursor.style.display = 'none';	// Hide the mea cursor
	let a = mea_get_closest ( mea_abs_end_x, mea_abs_end_y ),
		b = mea_get_closest ( mea_abs_begin_x, mea_abs_begin_y );

	if ( a[0] >= 0 ) {	// Closest found
		mea_abs_end_x = a[0];
	}
	if ( a[1] >= 0 ) {	// Closest found
		mea_abs_end_y = a[1];
	}
	if ( b[0] >= 0 ) {	// Closest found
		mea_abs_begin_x = b[0];
	}
	if ( b[1] >= 0 ) {	// Closest found
		mea_abs_begin_y = b[1];
	}
	mea_dx = mea_abs_end_x - mea_abs_begin_x;
	mea_dy = mea_abs_end_y - mea_abs_begin_y;

	let x2 = mea_abs_end_x,
		y2 = mea_abs_end_y,
		x1 = mea_abs_begin_x,
		y1 = mea_abs_begin_y;

	if ( mea_dx >= 0 ) {
		mea_abs_show_x = mea_abs_begin_x;
		if ( ( a[0] >= 0 ) && ( b[0] >= 0 ) ) {
			mea_dx = mea_dx - mea_offset;
			x2 = mea_abs_end_x - mea_offset;
			x1 = mea_abs_begin_x;
		}
	} else {
		mea_abs_show_x = mea_abs_end_x;
		if ( ( a[0] >= 0 ) && ( b[0] >= 0 ) ) {
			mea_dx = mea_dx + mea_offset;
			x2 = mea_abs_end_x;
			x1 = mea_abs_begin_x - mea_offset;
		}
	}

	if ( mea_dy >= 0 ) {
		mea_abs_show_y = mea_abs_begin_y;
		if ( ( a[1] >= 0 ) && ( b[1] >= 0 ) ) {
			mea_dy = mea_dy - mea_offset;
			y2 = mea_abs_end_y - mea_offset;
			y1 = mea_abs_begin_y;
		}
	} else {
		mea_abs_show_y = mea_abs_end_y;
		if ( ( a[1] >= 0 ) && ( b[1] >= 0 ) ) {
			mea_dy = mea_dy + mea_offset;
			y2 = mea_abs_end_y;
			y1 = mea_abs_begin_y - mea_offset;
		}
	}
	// Displey corrected
	mea_draw_rectangle ( mea_dx, mea_dy, mea_abs_show_x, mea_abs_show_y );
	mea_draw_cross ( mea_canvas2, x2, y2 );
	mea_draw_cross ( mea_canvas1, x1, y1 );
	mea_displey_data2 ();
}

// Find the nearest coordinates to adjust.
function mea_get_closest ( x, y ){
	let len = mea_data_top1.length,
		dd,
		t1,
		t2,
		l1,
		l2,
		xl = -1,
		yt = -1,
		xm = 10000,
		ym = 10000;

	for (let i = 0; i < len; i++) {
		t1 = mea_data_top1[ i ];
		t2 = mea_data_top2[ i ];
		l1 = mea_data_left1[ i ];
		l2 = mea_data_left2[ i ];

		// Is cursor inside i element
		if ( ( y < ( t1 - mea_inaccuracy_positioning ) )
			|| ( y > ( t2 + mea_inaccuracy_positioning ) )
			|| ( x < ( l1 - mea_inaccuracy_positioning ) )
			|| ( x > ( l2 + mea_inaccuracy_positioning ) )
		) {
			continue;
		}

		// Look for closest X
		dd = Math.abs ( x - l1 );
		if ( ( dd < xm ) ) {
			xm = dd;
			if ( dd <= mea_inaccuracy_positioning ) {
				xl = l1;
			}
		}
		dd = Math.abs ( x - l2 );
		if ( dd < xm ) {
			xm = dd;
			if ( dd <= mea_inaccuracy_positioning ) {
				xl = l2;
			}
		}

		// Look for closest Y
		dd = Math.abs ( y - t1 );
		if ( dd < ym ) {
			ym = dd;
			if ( dd <= mea_inaccuracy_positioning ) {
				yt = t1;
			}
		}
		dd = Math.abs ( y - t2 );
		if ( dd < ym ) {
			ym = dd;
			if ( dd <= mea_inaccuracy_positioning ) {
				yt = t2;
			}
		}
	}
	let a = [ xl, yt ];
	return a;
}

//***********
//*	Events
//***********
// When mouse move
document.onmousemove = mea_move_cursor;
function mea_move_cursor ( event ) {
	let e = event || window.event;

	// Current relative cursor position
	mea_rel_cursor_x = e.clientX;	// Current X cursor position
	mea_rel_cursor_y = e.clientY;	// Current Y cursor position
	if ( mea_is_active ) {			// The plugin is active
		mea_get_position ();
	}
}

// When the screen scroll
window.onresize = mea_screen_scroll;
document.onscroll = mea_screen_scroll;
function mea_screen_scroll ( event ) {
	if ( ! mea_is_active ) {	// The plugin is not active, kick.
		return;
	}
	let e = event || window.event;

	mea_onscroll_left = document.body.scrollLeft + document.documentElement.scrollLeft;	// Size of screen scroll left
	mea_onscroll_top = document.body.scrollTop + document.documentElement.scrollTop;	// Size of screen scroll top
	mea_onscroll_right = mea_onscroll_left + document.documentElement.clientWidth;
	mea_onscroll_bottom = mea_onscroll_top + document.documentElement.clientHeight;	// Size of screen scroll bottom
	mea_corr_x = 0;
	mea_corr_y = 0;
	// Page position on the screen
	let b;
	if ( mea_page ) {
		b = mea_page.getBoundingClientRect();
		mea_get_corrs ( b );
	} else if ( mea_header ) {
		b = mea_header.getBoundingClientRect();
		mea_get_corrs ( b );
	}

	// Is it a scaling?
	if ( e.type === 'scroll' ) {
		mea_scroll = true;
	}
	if ( e.type === 'resize' ) {
		mea_resize = true;
	}
	if ( mea_scroll && mea_resize ) {	// This is scaling
		mea_click_num = 2;
		mea_cursor.style.display = 'block';
		mea_data1.style.display = 'block';
		mea_data2.style.display = 'none';
		mea_canvas1.style.display = 'none';
		mea_canvas2.style.display = 'none';
		mea_canvas3.style.display = 'none';
		mea_cursor.style.cursor = 'none';	// Hide the system cursor
		mea_body.style.cursor = 'none';		// Hide the system cursor
		if ( mea_page ) {
			mea_page.style.cursor = 'none';		// Hide the system cursor
		}
		mea_auto_onoff ();
	}
	mea_get_position ();

	// Set timet for the searh elements
	if ( typeof mea_time_scroll !== 'undefined' ) {
		clearTimeout ( mea_time_scroll );
	};
	mea_time_scroll = setTimeout ( mea_scroll_deley, mea_deley_time );
	function mea_scroll_deley () {
		mea_scroll = false;
		mea_resize = false;
		mea_searh_elements ();
	}

	function mea_get_corrs ( b ) {
		if ( b ) {
			if ( b.left > 0 ) {
				mea_corr_x = b.left;
			}
			if ( b.top > 0 ) {
				mea_corr_y = b.top;
			}
		}
	}
}

// Mouse left button pushed
document.addEventListener ( 'mousedown', mea_mousedn, true );
function mea_mousedn ( event ) {
	if ( ! mea_is_active ) {	// The plugin is not active, kick.
		return;
	}
	if ( mea_is_cursor_inside ( mea_data2 ) ) {	// If cursor is in the box
		return;
	}

	let e = event || window.event;
	if ( e.which != 1 ) {	// If it is not left mouse button
		return;
	}

	mea_cursor.style.zIndex = '100004';
	mea_click_num++;
	if ( mea_click_num === 1 ) {
		mea_el_disappear ( mea_data2c );
//		mea_auto.style.display = 'none';
		mea_first_click ();
		return;
	}
	if ( mea_click_num === 2 ) {
		mea_abs_end_x = mea_abs_cursor_x;
		mea_abs_end_y = mea_abs_cursor_y;
		if ( mea_is_click () ) {	// It was jast a click
			mea_click_num = 1;
			mea_pos_data_boxes ();
			mea_first_click ();
			return;
		}
		if ( mea_auto_mode ) {
			mea_correct_inaccuracy ();
		} else {
			mea_draw_cross ( mea_canvas2, mea_abs_end_x, mea_abs_end_y );
		}
		return;
	}
	if ( mea_click_num > 2 ) {
		mea_canvas1.style.display = 'none';
		mea_el_disappear ( mea_data2c );
		mea_click_num = 1;
		mea_first_click ();
	}
}

// Mouse left button up
document.addEventListener ( 'mouseup', mea_mouseup, true );
function mea_mouseup ( event ) {
	if ( ! mea_is_active ) {	// The plugin is not active, kick.
		return;
	}
	if ( mea_is_cursor_inside ( mea_data2 ) ) {	// If cursor is in the box
		return;
	}
	let e = event || window.event;
	if ( e.which != 1 ) {	// If it is not left mouse button
		return;
	}

	mea_cursor.style.zIndex = '100005';

	if ( mea_click_num === 1 ) {
		mea_abs_end_x = mea_abs_cursor_x;
		mea_abs_end_y = mea_abs_cursor_y;
		if ( mea_is_click () ) {	// It was jast a click

			mea_cursor.style.cursor = 'none';	// Hide the system cursor
			mea_first_click ();
			return;
		}
		mea_click_num++;
		if ( mea_auto_mode ) {
			mea_correct_inaccuracy ();
		} else {
			mea_draw_cross ( mea_canvas2, mea_abs_end_x, mea_abs_end_y );
		}
		return;
	}
}

// If the left mouse pushed for click or for drag
function mea_is_click () {
	if ( ( Math.abs( mea_abs_begin_x - mea_abs_cursor_x ) < mea_marg_size )
		&& ( Math.abs( mea_abs_begin_y - mea_abs_cursor_y ) < mea_marg_size ) ) {
		return true;
	} else {
		return false;
	}
}

// When the first click
function mea_first_click () {
		mea_abs_begin_x = mea_abs_cursor_x;	// Save the absolute X start cursor position
		mea_abs_begin_y = mea_abs_cursor_y;	// Save the absolute Y start cursor position

		mea_canvas2.style.display = 'none';	// Hide canvas2 the cross
		mea_canvas3.style.display = 'none';	// Hide canvas3 the rectangle
		mea_draw_cross ( mea_canvas1, mea_abs_begin_x, mea_abs_begin_y );

		mea_is_first_click = true;
}

//****************
//*		Codes
//****************
// Get cursor position
function mea_get_position () {

	// Current absolute cursor position
	if ( typeof mea_rel_cursor_x === 'undefined' ) {
		return;
	}

	mea_abs_cursor_x = mea_rel_cursor_x + mea_onscroll_left - mea_cursor_shift_ini;
	mea_abs_cursor_y = mea_rel_cursor_y + mea_onscroll_top - mea_cursor_shift_ini;
	mea_cursor_shift_ini = mea_cursor_shift;

	if ( mea_abs_cursor_x < 0 ) {
		mea_abs_cursor_x = 0;
	}

	if ( mea_abs_cursor_x >= mea_onscroll_right ) {
		mea_abs_cursor_x = mea_onscroll_right;
	}

	if ( mea_abs_cursor_y < 0 ) {
		mea_abs_cursor_y = 0;
	}
	if ( mea_abs_cursor_y >= mea_onscroll_bottom ) {
		mea_abs_cursor_y = mea_onscroll_bottom;
	}
	mea_set_cursor_pos ();	// Set cursor position
	mea_pos_data_boxes ();
}

// Prepare for the datas show
function mea_pos_data_boxes () {
	if ( ! mea_is_active ) {	// The plugin is not active, kick.
		return;
	}
	mea_dx = mea_abs_cursor_x - mea_abs_begin_x;	// Current width of rectangle
	mea_dy = mea_abs_cursor_y - mea_abs_begin_y;	// Current height of rectangle

	if ( mea_click_num === 2 ) {			// The click number
		mea_cursor.style.cursor = 'none';	// Hide the system cursor
		mea_displey_data1 ();
		mea_el_appear ( mea_data1c );
		return;
	}

	if ( mea_click_num === 1 ) {
		mea_cursor.style.cursor = 'auto';	// Show the system cursor
		if ( mea_dx >= 0  ) {
			mea_abs_show_x = mea_abs_begin_x;
		} else {
			mea_abs_show_x = mea_abs_cursor_x;
		}

		if ( mea_dy >= 0 ) {
			mea_abs_show_y = mea_abs_begin_y;
		} else {
			mea_abs_show_y = mea_abs_cursor_y;
		}

		if ( mea_is_click () ) {	// It was jast a click
			mea_displey_data1 ();
//			mea_auto_onoff ();
		} else {
			mea_el_disappear ( mea_data1c );
			mea_el_appear ( mea_data2c );
			mea_el_appear ( mea_data2 );
			mea_displey_data2 ();
		}
		mea_displey_data1 ();
		mea_draw_rectangle ( mea_dx, mea_dy, mea_abs_show_x, mea_abs_show_y );
		mea_abs_end_x = mea_abs_cursor_x;
		mea_abs_end_y = mea_abs_cursor_y;
		return;
	}

	if ( mea_click_num === 0 ) {
		mea_abs_show_x = mea_abs_cursor_x;
		mea_abs_show_y = mea_abs_cursor_y;
		mea_displey_data1 ();
		mea_el_appear ( mea_data1c );
	}
}

// Hide an element
function mea_el_disappear ( el ) {
	el.style.opacity = '0';
}

// Show the element
function mea_el_appear ( el ) {
	el.style.display = 'block';
	el.style.opacity = '1';
}

// Show the data 2
function mea_displey_data2 () {
	if ( ! mea_is_active ) {	// The plugin is not active, kick.
		return;
	}

	let	st =  'Abs. left:' + Math.round( mea_abs_show_x - mea_corr_x )
		+ ', top:' + Math.round( mea_abs_show_y - mea_corr_y ) + '<br>',
		x = Math.abs( mea_dx ) + mea_offset,
		y = Math.abs( mea_dy ) + mea_offset;

	st = st + 'width:' + Math.round( x ) + ', height:' + Math.round( y );
	mea_data2c.innerHTML = st;	// Write data string in the box

	// Set position of data box
	let box = mea_data2.getBoundingClientRect(),	// Box of data
		boxheight = box.height,
		boxwidth  = box.width;

	let pb_x = + mea_abs_show_x + mea_marg_size,				// Position X of the box
		pb_y = + mea_abs_show_y - boxheight - mea_marg_size,	// Position Y of the box
		dt = document.body.scrollTop + document.documentElement.scrollTop,	// Position of top screen
		dw = document.body.clientWidth;					// Width of the client screen

	if ( pb_y <= dt ) {									// Gona go out of the screen on the top
		pb_y = dt;
	}

	if ( ( pb_x + boxwidth + mea_marg_size ) >= dw )  {	// Gona go out of the screen on the right
		pb_x = + dw - boxwidth - mea_marg_size;
	}

	mea_data2.style.left = Math.round ( pb_x ) + 'px';	// Set position left
	mea_data2.style.top  = Math.round ( pb_y ) + 'px';	// Set position top
}

// Displey the data next to cursor
function mea_displey_data1 () {
	let	st =  'Abs. left:' + Math.round( mea_abs_cursor_x - mea_corr_x )
		+ ', top:' + Math.round( mea_abs_cursor_y - mea_corr_y );

	if ( mea_is_cursor_inside ( mea_canvas3 ) ) {
		let dx = mea_abs_cursor_x - mea_abs_show_x,
			dy = mea_abs_cursor_y - mea_abs_show_y;
		st = st + '<br>Rel. left:' + Math.round( dx ) + ', top:' + Math.round( dy );
	}
	mea_data1c.innerHTML = st;	// Write data string in the box

	// Set position of data box
	if ( mea_first_m ) {
	mea_data1.style.display = 'block';
	mea_data1c.style.display = 'block';
	}

	let box = mea_data1c.getBoundingClientRect(),	// Box of data
		boxheight = box.height,
		boxwidth  = box.width;
	mea_show1_pos_x = + mea_abs_cursor_x + mea_marg_size;				// Position X of the box
	if ( ! mea_transition ) {
		mea_show1_pos_y = + mea_abs_cursor_y - boxheight - mea_marg_size;	// Position Y of the box
		if ( mea_show1_pos_y <= mea_onscroll_top ) {	// Gona go out of the screen on the top
			mea_data1.style.transition = mea_transition_top_on;
			mea_transition = true;
			mea_show1_pos_y = + mea_abs_cursor_y + mea_marg_size;
			setTimeout ( mea_show1_deley, mea_deley_time );
		}
	} else {
		mea_show1_pos_y = + mea_abs_cursor_y + mea_marg_size;	// Position Y of the box
		if ( ( mea_abs_cursor_y - boxheight - mea_marg_size ) > mea_onscroll_top ) {	// Gona go out of the screen on the top
			mea_data1.style.transition = mea_transition_top_on;
			mea_transition = false;
			mea_show1_pos_y = + mea_abs_cursor_y + mea_marg_size;
			setTimeout ( mea_show1_deley, mea_deley_time );
		}
	}

	if ( ( mea_show1_pos_x + boxwidth + mea_marg_size ) >= mea_onscroll_right ) {	// Gona go out of the screen on the right
		mea_show1_pos_x = + mea_onscroll_right - boxwidth - mea_marg_size;
	}

	mea_data1.style.left = Math.round( mea_show1_pos_x ) + 'px';	// Set position left
	mea_data1.style.top  = Math.round( mea_show1_pos_y ) + 'px';	// Set position top
	mea_cursor.style.display = 'block';
	mea_first_m = false;

	function mea_show1_deley(){
		mea_data1.style.transition = 'none';
	}
}

// Check if the cursor inside the box
function mea_is_cursor_inside ( el ) {
	let box = el.getBoundingClientRect(),	// The box
		l = parseInt( el.style.left ),
		t = parseInt( el.style.top ),
		h = box.height,
		w = box.width,
		x = mea_abs_cursor_x,
		y = mea_abs_cursor_y;
	return ( x >= l ) && ( x < ( l + w ) ) && ( y >= t ) && ( y < ( t + h ) );
}

// Set absolute cursor position
function mea_set_cursor_pos () {
	mea_cursor.style.left = Math.round( mea_abs_cursor_x - mea_cross_size / 2 ) + 'px';
	mea_cursor.style.top  = Math.round( mea_abs_cursor_y - mea_cross_size / 2 ) + 'px';
}

//*********************
//*	On and Off modes
//*********************
//	Measuring Ruler On
function mea_on () {
	mea_is_active = true;
	mea_click_num = 2;
	mea_cursor_shift_ini = mea_cursor_shift;
	mea_cursor.style.display = 'block';

	if ( ! mea_first_m ) {
		mea_data1.style.display = 'block';
		mea_data2.style.display = 'block';
	} else {
		mea_data1.style.display = 'none';
		mea_data2.style.display = 'none';
	}
//	mea_first_m = false;

	mea_canvas1.style.display = 'block';
	mea_canvas2.style.display = 'block';
	mea_canvas3.style.display = 'block';
	mea_cursor.style.cursor = 'none';	// Hide the system cursor
	mea_body.style.cursor = 'none';		// Hide the system cursor
	if ( mea_page ) {
		mea_page.style.cursor = 'none';		// Hide the system cursor
	}
	mea_auto_onoff ();
	mea_screen_scroll ();
}

//	Measuring Ruler Off
function mea_off () {
	mea_body.style.cursor = 'auto';	// Show system cursor
	if ( mea_page ) {
		mea_page.style.cursor = 'auto';	// Show system cursor
	}
	mea_is_active = false;
	mea_ini ();
}

function mea_auto_mode_off () {
	if ( ! mea_is_active && mea_auto_mode ) {
		mea_on ();
		mea_M_nb = 2;
		mea_A_nb = 1;
		mea_auto_mode = true;
		mea_auto_onoff ();
		return;
	}
	mea_auto_mode = false;
	mea_auto_onoff ();
}

function mea_auto_on () {
	if ( ! mea_is_active ) {
		mea_on ();
		mea_M_nb = 2;
	}
	mea_auto_mode = true;
	mea_auto_onoff ();
	if ( mea_click_num === 2) {
		mea_correct_inaccuracy ();
	}
}

// Keyboard button pushed
document.onkeydown = mea_keydn;
function mea_keydn ( event ) {
	let e = event || window.event;
	mea_auto_onoff ();
	if ( e.code === 'Escape' ) {	// If Esc key
		if ( ! mea_is_active ) {
			return;
		}
		mea_data2.style.display = 'none';
		mea_canvas1.style.display = 'none';
		mea_canvas2.style.display = 'none';
		mea_canvas3.style.display = 'none';
		mea_click_num = 0;
		return;
	}

	// Block repeats
	if ( mea_M_nb & 1 ) {		// If odd number
		return;
	}

	if ( mea_A_nb & 1 ) {		// If odd number
		return;
	}

	if ( e.code === 'KeyM' ) {	// If M key
		mea_M_nb++;
		if ( mea_M_nb === 1 ) {
			mea_on ();			// The plugin is On
		}
		if ( mea_M_nb === 3 ) {
			mea_off ();			// The plugin is Off
		}
	}

	if ( e.code === 'KeyA' ) {	// If A key
		mea_A_nb++;
		if ( mea_A_nb === 1 ) {
			mea_auto_on ();		// Auto mode On
		}
		if ( mea_A_nb === 3 ) {
			mea_auto_mode_off ();	// Auto mode is Off
		}
	}
}

// If a key up
document.onkeyup = mea_keyup;
function mea_keyup ( event ) {
	let e = event || window.event;

	mea_auto_onoff ();

	if ( e.code === 'KeyM' ) {	// If M key
		mea_M_nb++;
	}

	if ( e.code === 'KeyA' ) {	// If M key
		mea_A_nb++;
	}

	// Wait again
	if ( mea_M_nb > 3 ) {
		mea_M_nb = 0;
	}

	if ( mea_A_nb > 3 ) {
		mea_A_nb = 0;
	}

}

//********************
//*	All the Drawing
//********************
// Draw crosshair cursor and put it in the image
function mea_get_cursor () {
	mea_draw_cross ( mea_canvas1, 0, 0 );
	let scrImg = mea_canvas1.toDataURL ( 'image/png' ),
		fst = "<img id='mea_cross_img' src='" + scrImg + "' >";
	fst = fst + "<div id='mea_auto_a' class='mea_auto_a'><p>a</p></div>";
	mea_cursor.innerHTML = fst;
	mea_canvas1.style.display = 'none';
	mea_cross_img = document.getElementById ( 'mea_cross_img' );
	mea_auto_a = document.getElementById ( 'mea_auto_a' );
}

// Draw the crosshair
function mea_draw_cross ( c, x, y ) {

	// The canvas parametrs
	let w = mea_cross_size,
		h = mea_cross_size;

	c.width = w;
	c.height = h;
	ctx = c.getContext ( '2d' );
	ctx.clearRect ( 0, 0, w, h );
	ctx.lineWidth = 1;
	mea_corr_line_width ();

	// Let's drawing
	ctx.strokeStyle = mea_line_color1;
	mea_cross ( w, h );

	ctx.setLineDash ( [2, 2] ) // Dashes are 2px and spaces are 2px
	ctx.strokeStyle = mea_line_color2;
	mea_cross ( w, h );

	// Set position of the canvas
	c.style.left = Math.round( x - mea_cross_size / 2 ) + 'px';
	c.style.top  = Math.round( y - mea_cross_size / 2 ) + 'px';
	c.style.display = 'block';	// Displey the cross
}

// The crosshair itself
function mea_cross ( w, h ) {
	ctx.beginPath ();

	mea_mp ( w / 2, 0 );
	mea_lm ( w / 2, h );

	mea_mp ( 0, h / 2 );
	mea_lm ( w , h / 2 );
	ctx.stroke ();
}

// Draw the rectangle
function mea_draw_rectangle ( wr, hr, xr, yr ) {

	// The canvas parametrs
	let w = Math.abs( wr ),
		h = Math.abs( hr ),
		c = mea_canvas3;

	mea_dw = w;
	mea_dh = h;

	c.width = w + 1;
	c.height = h + 1;
	ctx = c.getContext ( '2d' );
	ctx.clearRect ( 0, 0, w + 1, h + 1 );

	ctx.lineWidth = 1;
	mea_corr_line_width ();

	// Let's drawing
	ctx.strokeStyle = mea_line_color1;
	mea_rectangle ( w, h );

	ctx.setLineDash ( [4, 4] ) // Dashes are 4px and spaces are 4px
	ctx.strokeStyle = mea_line_color2;
	mea_rectangle ( w, h );

	// Set position of the canvas
	c.style.left = Math.round( xr ) + 'px';
	c.style.top  = Math.round( yr ) + 'px';
	c.style.display = 'block';			// Displey the rectangle
}

// The rectangle itself
function mea_rectangle ( w, h ) {
	ctx.beginPath ();

	if ( ! w && ! h ) {		// If no size, kick
		return;
	}

	if ( ! h ) {			// No height, draw horizontal only
		mea_mp ( 0, 0 );
		mea_lm ( w, 0 );
	} else if ( ! w ) {		// No width, draw vertical only
		mea_mp ( 0, 0 );
		mea_lm ( 0, h);
	} else {				// Draw all rectangle
		mea_mp ( 0, 0 );
		mea_lm ( w, 0 );
		mea_lm ( w , h);
		mea_lm ( 0, h);
		mea_lm ( 0, 0);
	}
	ctx.stroke ();
}

// Drawing a line
function mea_lm ( x, y ) {
	ctx.lineTo ( Math.round( x ) + mea_line_corr, Math.round( y ) + mea_line_corr );
}

// Put the pen at X, Y
function mea_mp ( x, y ) {
	ctx.moveTo ( Math.round( x ) + mea_line_corr, Math.round( y ) + mea_line_corr );
}

// Get the line width correction
function mea_corr_line_width () {
	if ( ctx.lineWidth & 1 ) {
		mea_line_corr = 0.5;
	} else {
		mea_line_corr = 0;
	}
}
