var act_config_struc_ver = 20220215.01;
var txingdata = null;
var txtimestamp = "";
var fill_gw = false;
var fill_mgw = false;
var array_gateways = [];


setInterval(getCurrentTXing, 1000);

var usedTheme = getCookie("Theme");

if (usedTheme == "") {
	if (useDarkTheme)
		usedTheme = "dark";
	else
		usedTheme = "bright";
	setCookie("Theme",usedTheme, 30);
}

var element = document.createElement("link");
element.setAttribute("rel", "stylesheet");
element.setAttribute("type", "text/css");
element.setAttribute("href", "css/styles-" + usedTheme + ".css");
document.getElementsByTagName("head")[0].appendChild(element);

function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function switchTheme() {
	if (usedTheme == "dark") {
		setCookie("Theme", "bright", 30);
	} else {
		setCookie("Theme", "dark", 30);
	}
	document.location.reload();
}

// 00000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222223333333333
// 01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
// M: 2020-11-28 10:10:09.729 Currently linked repeaters/gateways:
// M: 2020-11-28 10:10:09.729     DB1ZD     : 3/60
// M: 2020-11-28 10:10:09.729     2622-DL   : 1/60
// M: 2020-11-28 10:10:09.729     DO8DHH    : 0/60
// M: 2020-11-28 10:11:26.555 Received data from DL5STX     to ALL        at 2622-DL
// M: 2020-11-28 10:11:27.317 Received end of transmission

function logIt(message) {
	var stringmessage = false;
	if (typeof message == "string") {
		stringmessage = true;
	}
	if (debug == 1 || (stringmessage && message.startsWith("Logtailer-Errormessage:"))) {
		console.log(message);
	}
}

function checkConfigStructure() {
	if (typeof config_struc_ver === "undefined" || config_struc_ver < act_config_struc_ver) {
		$('#configstructmodal').modal('show');
	}
}

Date.prototype.stdTimezoneOffset = function () {
	var jan = new Date(this.getFullYear(), 0, 1);
	var jul = new Date(this.getFullYear(), 6, 1);
	return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}

Date.prototype.isDstObserved = function () {
	return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

function getTimezone() {
	if (useClientTimezone) {
		var d = new Date();
		var usertime = d.toLocaleString();

		// Some browsers / OSs provide the timezone name in their local string:
		var tzsregex = /\b(ACDT|ACST|ACT|ADT|AEDT|AEST|AFT|AKDT|AKST|AMST|AMT|ART|AST|AWDT|AWST|AZOST|AZT|BDT|BIOT|BIT|BOT|BRT|BST|BTT|CAT|CCT|CDT|CEDT|CEST|CET|CHADT|CHAST|CIST|CKT|CLST|CLT|COST|COT|CST|CT|CVT|CXT|CHST|DFT|EAST|EAT|ECT|EDT|EEDT|EEST|EET|EST|FJT|FKST|FKT|GALT|GET|GFT|GILT|GIT|GMT|GST|GYT|HADT|HAEC|HAST|HKT|HMT|HST|ICT|IDT|IRKT|IRST|IST|JST|KRAT|KST|LHST|LINT|MART|MAGT|MDT|MET|MEST|MIT|MSD|MSK|MST|MUT|MYT|NDT|NFT|NPT|NST|NT|NZDT|NZST|OMST|PDT|PETT|PHOT|PKT|PST|RET|SAMT|SAST|SBT|SCT|SGT|SLT|SST|TAHT|THA|UYST|UYT|VET|VLAT|WAT|WEDT|WEST|WET|WST|YAKT|YEKT)\b/gi;

		// In other browsers the timezone needs to be estimated based on the offset:
		var timezonenames = {"UTC+0":"GMT","UTC+1":"CET","UTC+2":"EET","UTC+3":"EEDT","UTC+3.5":"IRST","UTC+4":"MSD","UTC+4.5":"AFT","UTC+5":"PKT","UTC+5.5":"IST","UTC+6":"BST","UTC+6.5":"MST","UTC+7":"THA","UTC+8":"AWST","UTC+9":"AWDT","UTC+9.5":"ACST","UTC+10":"AEST","UTC+10.5":"ACDT","UTC+11":"AEDT","UTC+11.5":"NFT","UTC+12":"NZST","UTC-1":"AZOST","UTC-2":"GST","UTC-3":"BRT","UTC-3.5":"NST","UTC-4":"CLT","UTC-4.5":"VET","UTC-5":"EST","UTC-6":"CST","UTC-7":"MST","UTC-8":"PST","UTC-9":"AKST","UTC-9.5":"MIT","UTC-10":"HST","UTC-11":"SST","UTC-12":"BIT"};

		var timezone = usertime.match(tzsregex);
		if (timezone) {
			timezone = timezone[timezone.length-1];
		} else {
			var offset = -1*d.getTimezoneOffset()/60;
			offset = "UTC" + (offset >= 0 ? "+" + offset : offset);
			timezone = timezonenames[offset];
		}
		
		if (d.isDstObserved() && timezone == "EET")
			timezone = "CEST";
		
		return timezone;
	} else {
		return "UTC";
	}
}

function inDashboardBlacklist(logline) {
	callsign = logline.substring(logline.indexOf("from") + 5, logline.indexOf("to")).trim();
	name = "";
	if (callsign.indexOf("$") > 0) {
		name = callsign.substring(callsign.indexOf("$") + 1, callsign.lastIndexOf("$"));
		if (name == "$")
			name = "";
		callsign = callsign.substring(0, callsign.indexOf("$"));
	}
	return dashboard_blacklist.includes(callsign);
}

function getLocaltimeFromTimestamp(timestamp) {
	logIt(timestamp);
	if (useClientTimezone) {
		var localtime = new Date(timestamp.replace(/-/g, "/") + " GMT");
		return localtime.toLocaleString();
	} else {
		return timestamp;
	}
}

function getRawTimestamp(logline) {
	return logline.substring(3,22);
}

function getTimestamp(logline) {
	return getLocaltimeFromTimestamp(getRawTimestamp(logline));
}

function getCallsign(logline) {
	callsign = "";
	if (logline.indexOf("blocked/") > 0 ) {
		callsign = logline.substring(logline.indexOf("from") + 5, logline.indexOf(" at")).trim();
	} else {
		callsign = logline.substring(logline.indexOf("from") + 5, logline.indexOf("to")).trim();
	}
	if (qrz == 1 && !qrz_blacklist.includes(callsign)) {
		return '<a target="_new" href="https://qrz.com/db/' + callsign + '">' + callsign + '</a>';
	} else {
		return callsign;
	}
}

// 000000000011111111112222222222333333333344444444445555555555666666666677777777778888888888999999999900000000001111111111222222222233333333334444444444555555555566666666667777777
// 012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456
// M: 2021-06-21 21:05:13.248 Received data from DG9VH      to *****E0B8f at DG9VH      FICH-Data: CS:2 | CM:1 | FT:7 | Dev:False | MR:0 | VoIP:False | DT:2 | SQL:False | SQC:0
// M: 2020-11-28 11:12:41.770 Received data from DO1KHI     to ALL        at DB0WK
// M: 2020-11-28 10:10:09.729 Currently linked repeaters/gateways:
// M: 2020-11-28 10:10:09.729     DB1ZD     : 3/60
// M: 2020-11-28 10:10:09.729     2622-DL   : 1/60
// M: 2020-11-28 10:10:09.729     DO8DHH    : 0/60
// M: 2021-03-12 17:31:33.004      DG9VH     : 192.168.178.33:42011 3/60
// M: 2020-11-28 10:11:26.555 Received data from DL5STX     to ALL        at 2622-DL
// M: 2020-11-28 10:11:27.317 Received end of transmission
function getTarget(logline) {
	val = "";
	if(logline.indexOf("at") > 0 && logline.indexOf(" to ") > 0) {
		return logline.substring(logline.indexOf(" to ") + 4, logline.lastIndexOf(" at "));
	} else {
		if (logline.indexOf("blocked/") > 0 ) {
			val = "muted";
		} else {
			val = logline.substring(logline.indexOf(" to ") + 4);
		}
		if (val.indexOf(",") > 0) {
			val = val.substring(0, val.indexOf(","));
		}
		return val;
	}
}

function getGateway(logline) {
	if(logline.indexOf("at ") > 0 && logline.indexOf(" FICH-Data: ") > 0) {
		return logline.substring(logline.indexOf(" at ") + 4, logline.indexOf(" FICH-Data: "));
	} else {
		return logline.substring(logline.indexOf(" at ") + 4);
	}
}

function getDuration(logline) {
	if(logline.lastIndexOf("seconds") > 0) {
		val = logline.substring(0, logline.lastIndexOf("seconds"));
		val = val.substring(val.lastIndexOf(",") + 2);
		return val;
	} else {
		return "";
	}
}

function getVoiceMode(logline) {
	if (logline.lastIndexOf(" | DT:") > 0 && logline.indexOf(" FICH-Data: ") > 0) {
		val = logline.substring(logline.lastIndexOf(" | DT:") + 6);
		val = parseInt(val.substring(0, val.indexOf(" |")));
		switch (val) {
			case 0:
				val = "Voice Narrow (DN)";
				break;
			case 1:
				val = "High Speed Data";
				break;
			case 2:
				val = "Voice Narrow (DN)";
				break;
			case 3:
				val = "Voice Wide (VW)";
				break;
			default:
				val = "Voice Narrow (DN)";
				break;
		}
		return val;
	} else {
		return "";
	}
}

// 000000000011111111112222222222333333333344444444445555555555666666666677777777778888888888999999999900000000001111111111222222222233333333334444444444555555555566666666667777777
// 012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456
// M: 2021-06-21 21:17:02.706 Received end of transmission coords: 49.231833, 6.834833 | 47/0
function getCoordinates(logline) {
	if (logline.lastIndexOf(" coords: ") > 0) {
		val = logline.substring(logline.lastIndexOf(" coords: ") + 9, logline.lastIndexOf(" | "));
		latitude = val.substring(0, val.lastIndexOf(","));
		latitudestring = (latitude >= 0) ? latitude + "N" : latitude + "S";
		longitude = val.substring(val.lastIndexOf(",") + 2);
		longitudestring = (longitude >= 0) ? longitude + "E" : longitude + "W";
		if (parseInt(latitude) == 999) {
			return "no data";
		} else {
			val = latitudestring + ", " + longitudestring + " ";
			if (osm > 0)
				val += getOSMLink(latitude, longitude);
			return val;
		}
	} else {
		return "";
	}
}
function getAddToQSO(logline) {
	retval = "";
	if (qso > 0) {
		callsign = logline.substring(logline.indexOf("from") + 5, logline.indexOf("to")).trim();
		retval = '<div class="bd-clipboard"><button type="button" class="btn-cpQSO" title="Copy to QSO" id="' + callsign + '" onclick="copyToQSO(\'' + callsign + '\')">Copy</button></div>';
	}
	return retval;
}

function getOSMLink(latitude, longitude) {
	//https://www.openstreetmap.org/?mlat=49.2317&mlon=6.7920#map=12/49.2317/6.7920
	return '<a target="_new" href="https://www.openstreetmap.org/?mlat='+latitude+'&mlon='+longitude+'#map=12/'+latitude+'/'+longitude+'"><span class="iconify" data-icon="oi:signpost" data-inline="false"></span></a>';
}

function clocktime() {
	var now = new Date(),
		h = now.getHours(),
		m = now.getMinutes(),
		s = now.getSeconds();
	m = leadingZero(m);
	s = leadingZero(s);
	return h + ':' + m + ':' + s;

}

function leadingZero(zahl) {
	zahl = (zahl < 10 ? '0' : '' )+ zahl;  
	return zahl;
}

function copyToQSO(callsign) {
	$(document).ready(function() {
		var date = new Date().toISOString().split('T');
		t_qso.row.add( [
			callsign,
			getLocaltimeFromTimestamp(date[0] + " " + date[1].substring(0, date[1].indexOf("."))),
			""
		] ).draw(false);
	});
	alert("" + callsign + " added to in QSO-Tab");
	
}

function getCurrentTXing() {
	tx = null;
	if (txingdata != null) {
		
		tx = txingdata.split(";");
		tx[3] = Math.round((Date.now() - Date.parse(txtimestamp.replace(" ","T")+".000Z"))/1000);
		t_qso.rows( function ( idx, data, node ) {
			if(data[0] == tx[0]){
				data[2] = getLocaltimeFromTimestamp(txtimestamp);
				$('#inQSO').dataTable().fnUpdate(data,idx,undefined,false);
			}
		}).draw(false);
	}
	t_ct.clear().draw(false);
	if (tx != null) {
		t_ct.row.add( [
			tx[0],
			tx[1],
			tx[2],
			tx[3]
		] ).draw(false);
	}
}

function getGatewayCallsign(line) {
	return line.substring(31, 42).trim();
}

function getGatewayIpAndPort(line) {
	return line.substring(44, line.indexOf("/60") - 2).trim();
}

function getConnectedSince(line) {
	retval = line.substr(line.indexOf("/60") + 3);
	if (retval.indexOf(":") > 0) {
		return retval.substr(retval.indexOf(":") + 1);
	} else {
		return null;
	}
}

function getLastHeard(document, event) {
// 00000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222223333333333
// 01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
// M: 2020-11-28 10:10:09.729 Currently linked repeaters/gateways:
// M: 2020-11-28 10:10:09.729     DB1ZD     : 3/60
// M: 2020-11-28 10:10:09.729     2622-DL   : 1/60
// M: 2020-11-28 10:10:09.729     DO8DHH    : 0/60
// M: 2021-04-03 20:14:52.208      DG9VH     : 192.168.178.33:42011 2/60
// M: 2021-04-03 20:14:52.209      DG9VH     : 88.68.80.167:58093 3/60

// M: 2020-11-28 10:11:26.555 Received data from DL5STX     to ALL        at 2622-DL
// M: 2020-11-28 10:11:27.317 Received end of transmission
// M: 2020-11-28 11:02:25.347 Network watchdog has expired
	$(document).ready(function() {
		lines = event.data.split("\n");
		lines.forEach(function(line, index, array) {
			logIt(line);
			if (!inDashboardBlacklist(line)) {
				txing = false;
				var duration = 0;
				
				// Check, if begin or end of transmission
				
				if (line.length > 0 && (((line.indexOf("ata from") > 0 || line.indexOf("Network watchdog has expired") > 0 || line.indexOf("Received end of transmission") > 0) && showBlockedTX == 0 && line.indexOf("blocked/") < 0) || showBlockedTX == 1 && (line.indexOf("ata from") > 0 || line.indexOf("Network watchdog has expired") > 0 || line.indexOf("Received end of transmission") > 0))) {
					// Begin of transmission
					if (line.indexOf("ata from") > 0) {
						
						txing = true;
						if (line.indexOf("blocked/") > 0) {
							txingdata = null;
						} else {
							txingdata = line.substring(line.indexOf("from") + 5, line.indexOf("to")).trim() + ";" + getTarget(line)  + ";" + getGateway(line);
						}
						logIt("txingdata: " + txingdata);
						
						txtimestamp = getRawTimestamp(line);
						var rowIndexes = [],
						timestamp = getTimestamp(line),
						callsign = getCallsign(line),
						target = getTarget(line),
						gateway = getGateway(line),
						duration = getDuration(line),
						addToQSO = getAddToQSO(line);
						duration = "TXing";
						voicemode = getVoiceMode(line);
						if (line.indexOf("blocked/") > 0) {
							duration = "muted";
						}
						logIt(callsign);
						t_lh.rows( function ( idx, data, node ) {
							if(data[1] == callsign){
								logIt("Adding " + callsign + " to Array!");
								rowIndexes.push(idx);
							}
							return false;
						});
						logIt("rowIndexes: " + rowIndexes);
						if (rowIndexes[0] == "0") {
							rowIndexes[0] = rowIndexes[1];
						}
						if (rowIndexes[0]) {
							
							newData = [
								timestamp,
								callsign,
								target,
								gateway,
								duration,
								voicemode,
								"",
								addToQSO
							]
							t_lh.row(rowIndexes[0]).data( newData ).draw(false);
							var row = t_lh.row(rowIndexes[0]).node();
							if (line.indexOf("blocked/") > 0) {
								$(row).removeClass('red');
							} else {
								$(row).addClass('red');
							}
						} else {
							t_lh.row.add( [
								timestamp,
								callsign,
								target,
								gateway,
								duration,
								voicemode,
								"",
								addToQSO
							] ).draw(false);
							var row = t_lh.row(t_lh.data().length - 1).node();
							if (line.indexOf("blocked/") > 0) {
								$(row).removeClass('red');
							} else {
								$(row).addClass('red');
							}
						}
					}
					// End of transmission
					if (line.indexOf("Network watchdog has expired") > 0 || line.indexOf("Received end of transmission") > 0 || line.indexOf("Removed from blockeds") > 0 ) {
						var rowIndexes = [];
						if (line.indexOf("Network watchdog has expired") > 0) {
							logIt("Network Watchdog!");
						}
						if (line.indexOf("Received end of transmission") > 0) {
							logIt("end of transmission!");
						}
						
						duration = Math.round(Date.parse(getRawTimestamp(line).replace(" ","T")+".000Z")/1000 - Date.parse(txtimestamp.replace(" ","T")+".000Z")/1000);
						logIt("Length: " + t_lh.data().length);
						logIt("duration: " + duration);
						logIt("TxTimestamp: " + txtimestamp);
						t_lh.rows( function ( idx, data, node ) {
							if(data[0] == getLocaltimeFromTimestamp(txtimestamp)){
								rowIndexes.push(idx);
							}
							return false;
						});
						logIt(rowIndexes);
						if (rowIndexes[0]) {
							if (rowIndexes[0] == "0") {
								rowIndexes[0] = rowIndexes[1];
							}
							
							var temp = t_lh.row(rowIndexes[0]).data();
							
							newData = [
								temp[0],
								temp[1],
								temp[2],
								temp[3],
								duration,
								temp[5],
								getCoordinates(line),
								temp[7]
							]
							t_lh.row(rowIndexes[0]).data( newData ).draw(false);
							var row = t_lh.row(rowIndexes[0]).node();
							$(row).removeClass('red');
						} else {
							var temp = t_lh.row(t_lh.data().length - 1).data();
							temp[4] = duration;
							logIt("temp[4]: " + temp[4]);
							var row = t_lh.row(t_lh.data().length - 1).node();
							$(row).removeClass('red');
							$('#lastHeard').dataTable().fnUpdate(temp,t_lh.data().length - 1,undefined,false);
						}
						txing = false;
						txingdata = null;
					}
				}
			}
		});
	});
}

function getAllHeard(document, event) {
	$(document).ready(function() {
		lines = event.data.split("\n");
		lines.forEach(function(line, index, array) {
			logIt(line);
			if (!inDashboardBlacklist(line)) {
				txing = false;
				var duration = 0;
				
				// Check, if begin or end of transmission
				
				if (line.length > 0 && (((line.indexOf("ata from") > 0 || line.indexOf("Network watchdog has expired") > 0 || line.indexOf("Received end of transmission") > 0) && showBlockedTX == 0 && line.indexOf("blocked/") < 0) || showBlockedTX == 1 && (line.indexOf("ata from") > 0 || line.indexOf("Network watchdog has expired") > 0 || line.indexOf("Received end of transmission") > 0))) {
					// Begin of transmission
					if (line.indexOf("ata from") > 0) {
						txing = true;
						
						txtimestamp = getRawTimestamp(line);
						var rowIndexes = [],
						timestamp = getTimestamp(line),
						callsign = getCallsign(line),
						target = getTarget(line),
						gateway = getGateway(line),
						duration = getDuration(line);
						duration = "TXing";
						voicemode = getVoiceMode(line);
						logIt(callsign);
						
						t_allh.row.add( [
							timestamp,
							callsign,
							target,
							gateway,
							duration,
							voicemode,
							""
						] ).draw(false);
						var row = t_allh.row(t_allh.data().length - 1).node();
						if (line.indexOf("blocked/") > 0) {
							$(row).removeClass('red');
						} else {
							$(row).addClass('red');
						}
					}
					// End of transmission
					if (((line.indexOf("Network watchdog has expired") > 0 || line.indexOf("Received end of transmission") > 0) && showBlockedTX == 0 && line.indexOf("blocked/") < 0) || showBlockedTX == 1 && (line.indexOf("ata from") > 0 || line.indexOf("Network watchdog has expired") > 0 || line.indexOf("Received end of transmission") > 0)) {
						var rowIndexes = [];
						if (line.indexOf("Network watchdog has expired") > 0) {
							logIt("Network Watchdog!");
						}
						if (line.indexOf("Received end of transmission") > 0) {
							logIt("end of transmission!");
						}
						
						duration = Math.round(Date.parse(getRawTimestamp(line).replace(" ","T")+".000Z")/1000 - Date.parse(txtimestamp.replace(" ","T")+".000Z")/1000);
						logIt("Length: " + t_allh.data().length);
						logIt("duration: " + duration);
						logIt("TxTimestamp: " + txtimestamp);
						t_allh.rows( function ( idx, data, node ) {
							logIt(getLocaltimeFromTimestamp(txtimestamp));
							if(data[0] == getLocaltimeFromTimestamp(txtimestamp)){
								rowIndexes.push(idx);
							}
							return false;
						});
						logIt(rowIndexes);
						if (rowIndexes[0]) {
							if (rowIndexes[0] == "0") {
								rowIndexes[0] = rowIndexes[1];
							}
							
							var temp = t_allh.row(rowIndexes[0]).data();
							
							newData = [
								temp[0],
								temp[1],
								temp[2],
								temp[3],
								duration,
								temp[5],
								getCoordinates(line)
							]
							t_allh.row(rowIndexes[0]).data( newData ).draw(false);
							var row = t_allh.row(rowIndexes[0]).node();
							$(row).removeClass('red');
						} else {
							var temp = t_allh.row(t_allh.data().length - 1).data();
							temp[4] = duration;
							logIt("temp[4]: " + temp[4]);
							var row = t_allh.row(t_allh.data().length - 1).node();
							$(row).removeClass('red');
							$('#allHeard').dataTable().fnUpdate(temp,t_allh.data().length - 1,undefined,false);
						}
						txing = false;
					}
				}
			}
		});
	});
}

function addToGateways(timestamp, connected_since, gateway, ip_port) {
	var newGateway = new Array();
	newGateway[0] = timestamp;
	newGateway[1] = connected_since;
	newGateway[2] = gateway;
	newGateway[3] = ip_port;
	array_gateways.push(newGateway);
}

function removeFromGateways(gateway, ip_port) {
	for (i = 0; i < array_gateways.length; ++i ) {
		actual_gateway = array_gateways[i];
		if (actual_gateway[2] == gateway && actual_gateway[3] == ip_port) {
			array_gateways.splice(i, 1);
		}
	}
}

function insertOrUpdateGatways(line) {
	timestamp = getTimestamp(line)
	gateway = getGatewayCallsign(line);
	ip_port = getGatewayIpAndPort(line);
	updated = false;
	for (i = 0; i < array_gateways.length; ++i){
		actual_gateway = array_gateways[i];
		if (actual_gateway[2] == gateway && actual_gateway[3] == ip_port) {
			var newGateway = new Array();
			newGateway[0] = timestamp;
			newGateway[1] = actual_gateway[1];
			newGateway[2] = gateway;
			newGateway[3] = ip_port;
			array_gateways[i] = newGateway;
			updated = true;
		}
	}
	if (updated == false) {
		connected_since = getConnectedSince(line);
		if (connected_since == null)
			addToGateways(timestamp, "unknown", gateway, ip_port);
		else
			addToGateways(timestamp, getLocaltimeFromTimestamp(connected_since), gateway, ip_port);
	}
}

function getAddedGateway(line) {
	return line.substring(line.indexOf("Adding ") + 7, line.indexOf("(")).trim();
}

function getRemovedGateway(line) {
	return line.substring(line.indexOf("Removing ") + 9, line.indexOf("(")).trim();
}

function getAddedIpAndPort(line) {
	return line.substring(line.indexOf(" (") + 2, line.indexOf(")"));
}

// 00000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222223333333333
// 01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
// M: 2021-04-03 14:46:10.970 Adding DG9VH      (192.168.178.33:42011)
// M: 2021-04-03 19:36:20.891 Removing DG9VH      (88.68.80.167:59579) unlinked
// M: 2020-11-28 10:10:09.729 Currently linked repeaters/gateways:
// M: 2020-11-28 10:10:09.729     DB1ZD     : 3/60
// M: 2020-11-28 10:10:09.729     2622-DL   : 1/60
// M: 2020-11-28 10:10:09.729     DO8DHH    : 0/60
function getGateways(document, event) {
	$(document).ready(function() {
		lines = event.data.split("\n");
		lines.forEach(function(line, index, array) {
			if (line.indexOf("Starting") > 0) {
				array_gateways = [];
			}
			if (line.indexOf("Adding") > 0 ) {
				addToGateways(getTimestamp(line), getTimestamp(line), getAddedGateway(line), getAddedIpAndPort(line));
			}
			if (line.indexOf("Removing") > 0 ) {
				removeFromGateways(getRemovedGateway(line), getAddedIpAndPort(line));
			}
			if( (Date.now() - Date.parse(getRawTimestamp(line).replace(" ","T")+".000Z"))/1000 < 125) {
				
				if (line.indexOf("Currently linked repeaters") > 0 ) {
					t_gw.clear().draw(false);
					fill_mgw = false;
					fill_gw = true;
				}
				if (line.indexOf("/60") > 0 && fill_gw) {
					insertOrUpdateGatways(line);
				}
			 
				t_gw.clear().draw(false);
				array_gateways.forEach(function(gateway){
					t_gw.row.add( [
						gateway[0],
						gateway[1],
						gateway[2],
						gateway[3]
					] ).draw(false);
				});
			}
		});
	});
}

function getMutedGateways(document, event) {
	$(document).ready(function() {
		lines = event.data.split("\n");
		lines.forEach(function(line, index, array) {
			if( (Date.now() - Date.parse(getRawTimestamp(line).replace(" ","T")+".000Z"))/1000 < 125) {
				if (line.indexOf("Currently muted repeaters") > 0 ) {
					t_mgw.clear().draw(false);
					fill_gw = false;
					fill_mgw = true;
				}
				if (line.indexOf("/60") > 0 && fill_mgw) {
					t_mgw.row.add( [
						getTimestamp(line),
						"",
						getGatewayCallsign(line),
						getGatewayIpAndPort(line)
					] ).draw(false);
				}
			}
		});
	});
}

function getSysInfo(document, event) {
	$(document).ready(function() {
		if (event.data.startsWith("REFLECTORINFO")) {
			logIt(event.data);
			data = event.data;
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("ysfreflector_version").innerHTML = data.substring(data.indexOf("ysfreflector_version:") + 21, data.indexOf(" ysfreflector_ctime"));
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("built").innerHTML = data.substring(data.indexOf("ysfreflector_ctime:") + 19);
		}
		if (event.data.startsWith("SYSINFO")) { 
			logIt(event.data);
			data = event.data;
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("cputemp").innerHTML = parseFloat(data.substring(data.indexOf("cputemp:") + 8, data.indexOf(" "))).toFixed(1);
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("cpufrg").innerHTML = Math.round(data.substring(data.indexOf("cpufrg:") + 7, data.indexOf(" ")));
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("cpuusage").innerHTML = data.substring(data.indexOf("cpuusage:") + 9, data.indexOf(" "));
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("cpu_load1").innerHTML = data.substring(data.indexOf("cpu_load1:") + 10, data.indexOf(" "));
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("cpu_load5").innerHTML = data.substring(data.indexOf("cpu_load5:") + 10, data.indexOf(" "));
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("cpu_load15").innerHTML = data.substring(data.indexOf("cpu_load15:") + 11, data.indexOf(" "));
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("ram_total").innerHTML = Math.round(data.substring(data.indexOf("ram_total:") + 10, data.indexOf(" ")));
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("ram_used").innerHTML = Math.round(data.substring(data.indexOf("ram_used:") + 9, data.indexOf(" ")));
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("ram_free").innerHTML = Math.round(data.substring(data.indexOf("ram_free:") + 9, data.indexOf(" ")));
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("ram_percent_used").innerHTML = data.substring(data.indexOf("ram_percent_used:") + 17, data.indexOf(" "));
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("disk_total").innerHTML = parseFloat(data.substring(data.indexOf("disk_total:") + 11, data.indexOf(" "))).toFixed(3);
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("disk_used").innerHTML = parseFloat(data.substring(data.indexOf("disk_used:") + 10, data.indexOf(" "))).toFixed(3);
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("disk_free").innerHTML = parseFloat(data.substring(data.indexOf("disk_free:") + 10, data.indexOf(" "))).toFixed(3);
			data = data.substring(data.indexOf(" ") + 1);
			document.getElementById("disk_percent_used").innerHTML = data.substring(data.indexOf("disk_percent_used:") + 18);
		}
	});
}

function activateDefaultTab(name) {
	var element = document.getElementById(name + "-tab");
	element.classList.add("active");
	
	var element = document.getElementById(name);
	element.classList.add("show");
	element.classList.add("active");
}

$(document).ready(function() {
	defaultSet = false;
	for (i = 0; i < document.getElementById("myTab").children.length; ++i) {
		tabname = document.getElementById("myTab").children[i].getAttribute("name");
		if (eval(tabname) == 0) {
			document.getElementById("myTab").children[i].style.display="none";
			document.getElementById(tabname).style.display="none";
		}
		if (eval(tabname) == 2) {
			activateDefaultTab(tabname);
			defaultSet = true;
		}
	}
});
