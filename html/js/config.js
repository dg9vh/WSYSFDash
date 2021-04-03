// config structure version, please change to value in github-file after update and adding new values
var config_struc_ver = 20210403.01;

// 1 = show link to QRZ.com, 0 = off
var qrz = 1;

// 1 = enable debug in javascript-console, 0 = 0ff
var debug = 0;

// 1 = show tab, 2 = show tab and make it default-tab on startup, 0 = suppress it
var currtx = 1;
var lastheard = 2;
var allheard = 1;
var gateways = 1;
var mutedgateways = 0; // Optional for pysfreflector by IU5JAE
var qso = 1;
var sysinfo = 1;
var about = 1;

// Set displayed timezone and timestamp to timezone of browser if 1, else use UTC for displaying
var useClientTimezone = 1;

// 1 = show IP-Addresses of gateway on each gateway tab, 0 = off
var showGatewayIP = 0;

// 1 = show gateway's connected since time, 0 = off
var showConnectedSince = 1;

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