<?php
/*
Plugin Name: Measuring Ruler
Plugin URI: https://wordpress.org/plugins/measuring-ruler
Description: The plugin is designed to measure the height, width and margin of elements on your page during the preview when editing. It also shows the absolute and relative positions of elements. Press the "M" key on your keyboard to enable and disable measurement mode in preview.
Version: 1.1
Author: Nickolay N. Ankilov
Author URI:
License: GPLv2 or later
*/
/* Copyright 2020 Nickolay N. Ankilov ( email: n.ankilov@yandex.ru )

	Measuring Ruler is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 2 of the License, or
	( at your option ) any later version.

	Measuring Ruler is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program; if not, write to the Free Software
	Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
*/

// Stop direct call
if ( preg_match ( '#' . basename ( __FILE__ ) . '#', $_SERVER['PHP_SELF'] ) ) { die ( 'You are not allowed to call this page directly.' ); }

if ( ! class_exists ( 'Measuring_ruler' ) ) {
	class Measuring_ruler {
		function __construct () {
			add_action( 'wp_head', 'ruler_add_html' );
			add_action( 'wp_footer', 'ruler_add_js_css' );
		}
	}
}
$ruler_gr = new Measuring_ruler ();

// Creating admin menu
if ( is_admin () ) {	// admin actions
	add_action ( 'admin_init', 'ruler_admin_init' );
	register_activation_hook( __FILE__, 'ruler_plugin_activation' );
	register_deactivation_hook( __FILE__, 'ruler_plugin_deactivation' );
}

// Register setting
function ruler_admin_init() {
}

// When the plagin activated
function ruler_plugin_activation() {
}

// When the plagin is deactivated
function ruler_plugin_deactivation() {
	return true;
}

// Add html
function ruler_add_html () {
	if ( is_admin () ) {					// Admin actions. Don't use the plagin
		return;
	}
	if ( ! is_preview () ) {				// If it is not the post preview, kick
		return;
	};
	if ( ! is_single () && ! is_page () ) {	// If not a page and a single post, kick
		return;
	};
?>

<div id="mea_data1" class="mea_data1">
	<div id="mea_data1c" class="mea_data1c">
	</div>
</div>
<div id="mea_data2" class="mea_data2">
	<div id="mea_data2c" class="mea_data2c">
	</div>
</div>
<div id="mea_cursor" class="mea_cursor">
</div>
<canvas id="mea_canvas1" class="mea_canvas1"></canvas>
<canvas id="mea_canvas2" class="mea_canvas2"></canvas>
<canvas id="mea_canvas3" class="mea_canvas3"></canvas>
<?php
}

// Add scripts and styles
function ruler_add_js_css () {
	if ( is_admin () ) {					// Admin actions. Don't use the plagin
		return;
	}
	if ( ! is_preview () ) {				// If it is not the post preview, kick
		return;
	};
	if ( ! is_single () && ! is_page () ) {	// If not a page and a single post, kick
		return;
	};

	// Registering and add scripts
	wp_register_script ( 'MeaRulerJs', plugins_url( 'measuring_ruler.js', __FILE__ ) );
	wp_enqueue_script ( 'MeaRulerJs' );

	// Registering and add styles
	wp_register_style ( 'MeaRulerCss', plugins_url( 'measuring_ruler.css', __FILE__ ) );
	wp_enqueue_style ( 'MeaRulerCss' );
}
