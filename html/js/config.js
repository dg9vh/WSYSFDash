// 1 = show link to QRZ.com, 0 = off
var qrz = 1;

// 1 = enable debug in javascript-console, 0 = 0ff
var debug = 0;

// 1 = show tab, 0 = suppress it
var showCurrTXTab = 1;
var showLastHeardTab = 1;
var showGatewaysTab = 1;
var showInQSOTab = 1;
var showSysInfoTab = 1;
var showAboutTab = 1;

// default-tab to show
// chose from following list: CurrTXTab, LastHeardTab, GatewaysTab, InQSOTab, SysInfoTab, AboutTab
var defaultTab = "LastHeardTab";

// Set displayed timezone and timestamp to timezone of browser if 1, else use UTC for displaying
var useClientTimezone = 1;

// Set this to to the section-name in your logtailer.ini that contains the logpath of your reflector
var WebsocketsPath = "YSFReflector";
