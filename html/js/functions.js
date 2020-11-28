var txingdata = null;
var txtimestamp = null;

setInterval(getCurrentTXing, 1000);
// 00000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222223333333333
// 01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
// M: 2020-11-28 10:10:09.729 Currently linked repeaters/gateways:
// M: 2020-11-28 10:10:09.729     DB1ZD     : 3/60
// M: 2020-11-28 10:10:09.729     2622-DL   : 1/60
// M: 2020-11-28 10:10:09.729     DO8DHH    : 0/60
// M: 2020-11-28 10:11:26.555 Received data from DL5STX     to ALL        at 2622-DL
// M: 2020-11-28 10:11:27.317 Received end of transmission

function logIt(message) {
	if (debug == 1 || message.startsWith("Logtailer-Errormessage:")) {
		console.log(message);
	}
}

function getTimestamp(logline) {
	return logline.substring(3,22);
}

function getCallsign(logline) {
	callsign = logline.substring(logline.indexOf("from") + 5, logline.indexOf("to")).trim();
	if (qrz == 1) {
		return '<a target="_new" href="https://qrz.com/db/' + callsign + '">' + callsign + '</a>';
	} else {
		return callsign;
	}
}

// 00000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222223333333333
// 01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
// M: 2020-11-28 11:12:41.770 Received data from DO1KHI     to ALL        at DB0WK
// M: 2020-11-28 10:10:09.729 Currently linked repeaters/gateways:
// M: 2020-11-28 10:10:09.729     DB1ZD     : 3/60
// M: 2020-11-28 10:10:09.729     2622-DL   : 1/60
// M: 2020-11-28 10:10:09.729     DO8DHH    : 0/60
// M: 2020-11-28 10:11:26.555 Received data from DL5STX     to ALL        at 2622-DL
// M: 2020-11-28 10:11:27.317 Received end of transmission

function getTarget(logline) {
	if(logline.indexOf("at") > 0 ) {
		return logline.substring(logline.indexOf("to") + 3, logline.lastIndexOf("at"));
	} else {
		val = logline.substring(logline.indexOf("to") + 3);
		if (val.indexOf(",") > 0) {
			val = val.substring(0, val.indexOf(","));
		}
		return val;
	}
}

function getGateway(logline) {
	if(logline.indexOf("at ") > 0) {
		return logline.substring(logline.indexOf("at ") + 3);
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

function getAddToQSO(logline) {
	callsign = logline.substring(logline.indexOf("from") + 5, logline.indexOf("to")).trim();
	retval = '<div class="bd-clipboard"><button type="button" class="btn-cpQSO" title="Copy to QSO" id="' + callsign + '" onclick="copyToQSO(\'' + callsign + '\')">Copy</button></div>';
	return retval;
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
		t_qso.row.add( [
			callsign,
			new Date().toUTCString()
		] ).draw();
	});
	alert("" + callsign + " added to in QSO-Tab");
	
}

function getCurrentTXing() {
	tx = null;
	if (txingdata != null) {
		tx = txingdata.split(";");
		tx[3] = Math.round((Date.now() - Date.parse(txtimestamp.replace(" ","T")+".000Z"))/1000);
	}
	t_ct.clear().draw();
	if (tx != null) {
		t_ct.row.add( [
			tx[0],
			tx[1],
			tx[2],
			tx[3]
		] ).draw();
	}
}

function getGatewayCallsign(line) {
	return line.substring(31, 41);
}

function getLastHeard(document, event) {
// 00000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222223333333333
// 01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
// M: 2020-11-28 10:10:09.729 Currently linked repeaters/gateways:
// M: 2020-11-28 10:10:09.729     DB1ZD     : 3/60
// M: 2020-11-28 10:10:09.729     2622-DL   : 1/60
// M: 2020-11-28 10:10:09.729     DO8DHH    : 0/60
// M: 2020-11-28 10:11:26.555 Received data from DL5STX     to ALL        at 2622-DL
// M: 2020-11-28 10:11:27.317 Received end of transmission
// M: 2020-11-28 11:02:25.347 Network watchdog has expired
	$(document).ready(function() {
		lines = event.data.split("\n");
		lines.forEach(function(line, index, array) {
			logIt(line);
			txing = false;
			var duration = 0;
			
			if (line.length > 0 && (line.indexOf("Received") > 0 || line.indexOf("Network watchdog") > 0)) {
				if (line.indexOf("Received data") > 0) {
					txing = true;
					
					txingdata = line.substring(line.indexOf("from") + 5, line.indexOf("to")).trim() + ";" + getTarget(line)  + ";" + getGateway(line);
					txtimestamp = getTimestamp(line);
				}
				/*
				var duration = 0;
				if (line.indexOf("Network watchdog") > 0 || line.indexOf("end of transmission") > 0) {
					
					txingdata = null;
					duration = Math.round(Date.parse(getTimestamp(line).replace(" ","T")+".000Z")/1000 - Date.parse(txtimestamp.replace(" ","T")+".000Z")/1000);
					t_lh.row(0).data[4] = duration;
				}
				*/
				if (line.indexOf("Network watchdog") > 0 || line.indexOf("end of transmission") > 0) {
					logIt("Network Watchdog!");
					var rowIndexes = [];
					t_lh.rows( function ( idx, data, node ) {
						if(data[0] == txtimestamp){
							rowIndexes.push(idx);
						}
					});
					
					duration = Math.round(Date.parse(getTimestamp(line).replace(" ","T")+".000Z")/1000 - Date.parse(txtimestamp.replace(" ","T")+".000Z")/1000);
					/*
					newData = [
						t_lh.row(t_lh.data().length - 1).data[0],
						t_lh.row(t_lh.data().length - 1).data[1],
						t_lh.row(t_lh.data().length - 1).data[2],
						t_lh.row(t_lh.data().length - 1).data[3],
						duration,
						getAddToQSO(line)
					]*/
					//logIt(t_lh.row(t_lh.data().length - 1).data[1]);
					logIt("Length: " + t_lh.data().length);
					//t_lh.row(t_lh.data().length).data[4] = duration;
					//t_lh.draw();
					
					var temp = t_lh.row(t_lh.data().length - 1).data();
					temp[4] = duration;
					$('#lastHeard').dataTable().fnUpdate(temp,t_lh.data().length - 1,undefined,false);
					txing = false;
					txingdata = null;
				}
				
				logIt("txingdata: " + txingdata + "|" + txtimestamp);
				getCurrentTXing();
				
				if (line.indexOf("Network watchdog") < 0 && line.indexOf("end of transmission") < 0) {
					var rowIndexes = [],
					timestamp = getTimestamp(line),
					callsign = getCallsign(line),
					target = getTarget(line),
					gateway = getGateway(line),
					duration = getDuration(line),
					addToQSO = getAddToQSO(line);
					if (txing) {
						duration = "TXing";
					}
					t_lh.rows( function ( idx, data, node ) {
						if(data[1] == callsign){
							rowIndexes.push(idx);
						}
						return false;
					});
					if (rowIndexes[0]) {
						
						newData = [
							timestamp,
							callsign,
							target,
							gateway,
							duration,
							addToQSO
						]
						t_lh.row(rowIndexes[0]).data( newData ).draw(false);
						
					} else {
						t_lh.row.add( [
							timestamp,
							callsign,
							target,
							gateway,
							duration,
							addToQSO
						] ).draw();
					}
				}
				var row = t_lh.row(rowIndexes[0]).node();
				if (txing) {
					$(row).addClass('red');
				} else {
					$(row).removeClass('red');
				}
				var temp = t_lh.row(rowIndexes[0]).data();
				temp[4] = duration;
				$('#lastHeard').dataTable().fnUpdate(temp,rowIndexes[0],undefined,false);
			}
		});
	});
}
// 00000000001111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000111111111122222222223333333333
// 01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
// M: 2020-11-28 10:10:09.729 Currently linked repeaters/gateways:
// M: 2020-11-28 10:10:09.729     DB1ZD     : 3/60
// M: 2020-11-28 10:10:09.729     2622-DL   : 1/60
// M: 2020-11-28 10:10:09.729     DO8DHH    : 0/60
function getGateways(document, event) {
	$(document).ready(function() {
		lines = event.data.split("\n");
		lines.forEach(function(line, index, array) {
			if( (Date.now() - Date.parse(getTimestamp(line).replace(" ","T")+".000Z"))/1000 < 125) {
				if (line.indexOf("Currently linked repeaters") > 0 ) {
					t_gw.clear().draw(false);
				}
				if (line.indexOf("/60") > 0 ) {
					t_gw.row.add( [
						getTimestamp(line),
						getGatewayCallsign(line)
					] ).draw(false);
				}
			}
		});
	});
}

function getSysInfo(document, event) {
	$(document).ready(function() {
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

$(document).ready(function() {
	if(showCurrTXTab == 0){
		document.getElementById("myTab").children[0].style.display="none";
		document.getElementById("currtx").style.display="none";
	}
	if(showLastHeardTab == 0){
		document.getElementById("myTab").children[1].style.display="none";
		document.getElementById("lastheard").style.display="none";
	}
	if(showGatewaysTab == 0){
		document.getElementById("myTab").children[2].style.display="none";
		document.getElementById("gateways").style.display="none";
	}
	if(showInQSOTab == 0){
		document.getElementById("myTab").children[3].style.display="none";
		document.getElementById("qso").style.display="none";
	}
	if(showSysInfoTab == 0){
		document.getElementById("myTab").children[4].style.display="none";
		document.getElementById("sysinfo").style.display="none";
	}
	if(showAboutTab == 0){
		document.getElementById("myTab").children[5].style.display="none";
		document.getElementById("about").style.display="none";
	}
	
	switch (defaultTab) {
		case "CurrTXTab":
			var element = document.getElementById("currtx-tab");
			element.classList.add("active");
			element = document.getElementById("currtx");
			element.classList.add("show");
			element.classList.add("active");
			break;
		case "LastHeardTab":
			var element = document.getElementById("lastheard-tab");
			element.classList.add("active");
			
			var element = document.getElementById("lastheard");
			element.classList.add("show");
			element.classList.add("active");
			break;
		case "GatewaysTab":
			var element = document.getElementById("gateways-tab");
			element.classList.add("active");
			
			var element = document.getElementById("gateways");
			element.classList.add("show");
			element.classList.add("active");
			break;
		case "InQSOTab":
			var element = document.getElementById("qso-tab");
			element.classList.add("active");
			
			var element = document.getElementById("qso");
			element.classList.add("show");
			element.classList.add("active");
			break;
		case "SysInfoTab":
			var element = document.getElementById("sysinfo-tab");
			element.classList.add("active");
			
			var element = document.getElementById("sysinfo");
			element.classList.add("show");
			element.classList.add("active");
			break;
		case "AboutTab":
			var element = document.getElementById("about-tab");
			element.classList.add("active");
			
			var element = document.getElementById("about");
			element.classList.add("show");
			element.classList.add("active");
			break;
		default:
			var element = document.getElementById("currtx-tab");
			element.classList.add("active");
			
			element = document.getElementById("currtx");
			element.classList.add("show");
			element.classList.add("active");
			break;
	}
});
