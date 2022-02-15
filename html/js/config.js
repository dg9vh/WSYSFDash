// config structure version, please change to value in github-file after update and adding new values
var config_struc_ver = 20220215.01;

// 1 = show link to QRZ.com, 0 = off
var qrz = 1;

// 1 = show link to Openstreetmap.org behind coordinates (if activated below with coordscol),
// 0 = off
var osm = 1;

// 1 = enable debug in javascript-console, 0 = 0ff
var debug = 0;

// Here you can switch on and off tabs to be shown:
// 1 = show tab, 2 = show tab and make it default-tab on startup, 0 = suppress it
var currtx = 1;
var lastheard = 2;
var allheard = 1;
var gateways = 1;
var mutedgateways = 1; // Optional for pysfreflector by IU5JAE
var qso = 1;
var sysinfo = 1;
var about = 1;

// with this variables you can switch on and off columns within the tables, hereby
// columns containing same type of date in different tables are controlled by one variable
// means: callsigncol for example controls all tablecolumns containing the origin callsign
// 1 = show tablecolumn, 0 = suppress it
var timecol = 1;
var callsigncol = 1;
var targetcol = 1;
var gatewaycol = 1;
var gatewayipcol = 1;
var durationcol = 1;
var voicemodecol = 1;
var coordscol = 1;
var connectedsincecol = 1;
var gatewaycallsigncol = 1;
var addedatcol = 1;
var lasttxatcol = 1;

// Set displayed timezone and timestamp to timezone of browser if 1, else use UTC for displaying
var useClientTimezone = 1;

// 1 = show blocked transmissions on heard-lists, 0 = off
var showBlockedTX = 0; // Optional for pysfreflector by IU5JAE

// Set this to to the section-name in your logtailer.ini that contains the logpath of your reflector
var WebsocketsPath = "YSFReflector";

// Array of callsigns that should not be linked to qrz.com
var qrz_blacklist = [
"N0CALL",
]

// Array of callsigns that should generally not be listed on the dashboard

var dashboard_blacklist = [
"MY0CALL",
]

// Here you can set the content of the show x entries selectbox
var datatable_length_menu =  [ 
[10, 25, 50, 100, -1], 
[10, 25, 50, 100, "All"] 
]

// Here the default-selected value in the selectbox is defined (for show x entries)
var datatable_default_length = 10;

// 1 = enable dark display theme, 0 = use bright theme
var useDarkTheme = 0;
