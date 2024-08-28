//notes-
//debugging tips in code.js: 
//if gusto na magdebug or trace sa functionality sa functions kay doon magdebug sa apps script mismo na ide
//sa apps script na ide is ang contents sa code.gs lang ang madedebug, pag sa client side na (pag file name kay .html) no choice kundi console.log ang pagdedebug.

var spreadsheetIdinDataBase = '1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c';


function doGet(e) {
  if (!e.parameter.page) {
    var htmloutput = HtmlService.createTemplateFromFile('CableMap').evaluate().setTitle('Map View');
    return htmloutput;
  }
  else if (e.parameter['page'] == 'gantt') {
    var htmloutput = HtmlService.createTemplateFromFile('gantt-chart' + '/' + 'index').evaluate().setTitle('Gantt Chart View');
    return htmloutput;
  }
  else if (e.parameter['page'] == 'stats') {
    var htmloutput = HtmlService.createTemplateFromFile('dashboard' + '/' + 'dashboard').evaluate().setTitle('Dashboard View');
    return htmloutput;
  }

}

function onEdit(e) {
  var range = e.range;
  var sheetName = range.getSheet().getName();

  if (sheetName == "location" || sheetName == "cables") {
    updateMap(); // Call the function to update the map
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


function updateMap() {
  var html = HtmlService.createHtmlOutputFromFile('CableMap')
    .setTitle('Map View');
  SpreadsheetApp.getUi().showModalDialog(html, 'Map View');
}

function addDataToSheet(cableSystemName, pointName, longitude, latitude) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();

  sheet.getRange(lastRow + 1, 1).setValue(cableSystemName);
  sheet.getRange(lastRow + 1, 2).setValue(pointName);
  sheet.getRange(lastRow + 1, 3).setValue(longitude);
  sheet.getRange(lastRow + 1, 4).setValue(latitude);
}

function addCableConnectionToSheet(pointFrom, pointTo, cableName, cableSystem) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var locationsSheet = ss.getSheetByName('location');
  var cablesSheet = ss.getSheetByName('cables');

  var locationsData = locationsSheet.getDataRange().getValues(); // Get all data from locations sheet

  // Find the latitude and longitude for Point From and Point To
  var pointFromData = locationsData.find(function (row) {
    return row[1] === pointFrom; // Assuming Point Name is in column B
  });

  var pointToData = locationsData.find(function (row) {
    return row[1] === pointTo; // Assuming Point Name is in column B
  });

  if (pointFromData && pointToData) {
    var latitudeFrom = pointFromData[3]; // Assuming Latitude is in column D
    var longitudeFrom = pointFromData[2]; // Assuming Longitude is in column C
    var latitudeTo = pointToData[3]; // Assuming Latitude is in column D
    var longitudeTo = pointToData[2]; // Assuming Longitude is in column C

    // Add data to the cables sheet
    cablesSheet.appendRow([cableSystem, cableName, pointFrom, latitudeFrom, longitudeFrom, pointTo, latitudeTo, longitudeTo]);
  }
}

function getSJCLocations() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('location');
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues(); // Assuming data starts from row 2 and columns A to E

  // Convert the data into an array of objects
  var locations = data.map(function (row) {
    return {
      cableSystem: row[0],
      pointName: row[1],
      longitude: parseFloat(row[3]),
      latitude: parseFloat(row[2]),
      // Assuming the cable system name is in column A
    };
  });

  return locations;
}


function getSJCData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var cablesSheet = ss.getSheetByName('cables');
  var data = cablesSheet.getRange(2, 1, cablesSheet.getLastRow() - 1, 9).getValues(); // Starting from row 2, columns A to G

  // Convert data into an array of objects
  var cables = data.map(function (row) {
    return {
      cableSystem: row[0],
      cableName: row[1],
      pointFrom: row[2],
      latitudeFrom: row[3],
      longitudeFrom: row[4],
      pointTo: row[5],
      latitudeTo: row[6],
      longitudeTo: row[7],
      disableenable: row[8],
    };
  });

  return cables;
}


function getMIForDataTable(sheetName) {
  var spreadsheetId = spreadsheetIdinDataBase;
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var dataRange = sheet.getDataRange();
  var values = dataRange.getDisplayValues();
  values.shift();  // Assuming you want to remove the header row
  return values;
}



//this function is used to update data either in notification sheet and in start date sheet
//if data is updated in the notification sheet the update cascade into the start date sheet
function updateRowMI(sheetName, key, updatedData) {
  var spreadsheetId = spreadsheetIdinDataBase;
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var startSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Start Date');
  var startData = startSheet.getDataRange().getValues();
  var data = sheet.getDataRange().getValues();

  var status;

  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == key) {
      // Update the row with the new data
      for (var k = 0; k < updatedData.length; k++) {
        sheet.getRange(i + 1, k + 1).setValue(updatedData[k]);
        // Format the cell as plain text
        sheet.getRange(i + 1, k + 1).setNumberFormat('yyyy-mm-dd hh:mm');
      }
      status = "success";
    }
  }
  for (var i = 0; i < startData.length; i++) {
    if (startData[i][0] == key) {
      if (status == "success") {
        for (var k = 0; k < updatedData.length; k++) {
          startSheet.getRange(i + 1, k + 1).setValue(updatedData[k]);
          startSheet.getRange(i + 1, k + 1).setNumberFormat('yyyy-mm-dd hh:mm');
        }
      }
    }
  }
  return status;
}

//this one is used to delete any ticket or data either in start date sheet or notifications sheet
//parameters accepted are sheetname and ticketnumber (col1)
function deleteRowMI(sheetName, col1) {
  var spreadsheetId = spreadsheetIdinDataBase;
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var startSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Start Date');
  var startData = startSheet.getDataRange().getValues();
  var data = sheet.getDataRange().getValues();
  var status;
  // Find the row index based on the col1
  var rowIndex = -1;
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == col1) {
      rowIndex = i + 1;
      status = 'success'; // Adding 1 to convert from 0-based index to 1-based index
      break;
    }
  }
  var rowIndexStart = -1;
  for (var i = 0; i < startData.length; i++) {
    if (startData[i][0] == col1) {
      rowIndexStart = i + 1; // Adding 1 to convert from 0-based index to 1-based index
      startSheet.deleteRow(rowIndexStart);
      break;
    }
  }


  // If rowIndex is found, delete the row
  if (rowIndex !== -1) {
    sheet.deleteRow(rowIndex);
    return status;
  }
}

function addDataToSheetMI(sheetName, majorIncidents) {
  var spreadsheetId = spreadsheetIdinDataBase;
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  // Convert all values to strings
  var majorIncidentsAsString = majorIncidents.map(String);

  // Append the row to the sheet
  sheet.appendRow(majorIncidentsAsString);

  // Set the format of the cells to treat the values as strings
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(lastRow, 1, 1, majorIncidentsAsString.length);
  range.setNumberFormat('yyyy-mm-dd hh:mm');
  return 'success';
}

function addDataToSheetNotif(sheetName, majorIncidents) {
  var spreadsheetId = spreadsheetIdinDataBase;
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  // Convert all values to strings
  var majorIncidentsAsString = majorIncidents.map(String);

  // Append the row to the sheet
  sheet.appendRow(majorIncidentsAsString);

  // Set the format of the cells to treat the values as strings
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(lastRow, 1, 1, majorIncidentsAsString.length);
  range.setNumberFormat('yyyy-mm-dd hh:mm');


  return 'success';
}

//the one responsible for fetching all the affected cable names and utilizing it on the polylines in the front-end
//commented the start date sheet for future niche purposes
function getCableNames() {
  var ss = SpreadsheetApp.openById(spreadsheetIdinDataBase);
  var sheet = ss.getSheetByName('Notifications');
  var lastRow = sheet.getLastRow();
  var cableNamesRange = sheet.getRange('A2:N' + lastRow);
  var data = cableNamesRange.getValues(); //getting the notif rows of affected segment


  // var sheetstart = ss.getSheetByName('Start Date');
  // var lastRowstart = sheetstart.getLastRow();
  // var cableNamesRangestart = sheetstart.getRange('B2:L' + lastRowstart);
  // var datastart = cableNamesRangestart.getValues(); //getting the start rows of affected segment


  var combinedCableNames = []; //this array stores all the affected segments/cablelines on the notification sheet (yellow)
  var combinedCableNamesStart = []; //this array stores all the affected segments/cablelines on the Start Date sheet (red)

  const fullPaths = getFullPaths();

  //processing the notif values
  data.forEach(function (row) {
    const cableNameB = row[1].trim(); //this extracts the cable System
    const cableNameJ = row[9].trim(); //this extracts the Affected Segment1
    const cableNameK = row[10].trim(); //this extracts the Affected Segment2
    const cableNameL = row[11].trim();  //this extracts the Affected Segment3

    var incidentType = row[8].trim();
    var ticketName = row[0];
    var location = row[12];
    var rootCauseHigh = row[13];


    const notifiedDate = formatDates(row[2]);
    const startDate = formatDates(row[3]);
    const endDate = formatDates(row[4]);

    if (cableNameB != "" && cableNameJ != "") {
      var index = fullPaths.findIndex(({ value }) => value === cableNameB + " " + cableNameJ);
      if (index >= 0) {
        var firstCable = fullPaths[index];
      }
    }
    if (cableNameK != "") {
      var index = fullPaths.findIndex(({ value }) => value === cableNameB + " " + cableNameK);
      if (index >= 0) {
        var secondCable = fullPaths[index];
      }
    }
    if (cableNameL != "") {
      var index = fullPaths.findIndex(({ value }) => value === cableNameB + " " + cableNameL);
      if (index >= 0) {
        var thirdCable = fullPaths[index];
      }
    }


    let bool1 = processCableSegments(firstCable, startDate, endDate, notifiedDate, incidentType, ticketName, location, rootCauseHigh);
    let bool2 = processCableSegments(secondCable, startDate, endDate, notifiedDate, incidentType, ticketName, location, rootCauseHigh);
    let bool3 = processCableSegments(thirdCable, startDate, endDate, notifiedDate, incidentType, ticketName, location, rootCauseHigh);

    if (!(bool1 || bool2 || bool3)) {
      if (cableNameL !== "") addToCombinedCableNames(cableNameB, cableNameL, notifiedDate, startDate, endDate, incidentType, ticketName, location, rootCauseHigh);
      if (cableNameK !== "") addToCombinedCableNames(cableNameB, cableNameK, notifiedDate, startDate, endDate, incidentType, ticketName, location, rootCauseHigh);
      addToCombinedCableNames(cableNameB, cableNameJ, notifiedDate, startDate, endDate, incidentType, ticketName, location, rootCauseHigh);
    }

    function addToCombinedCableNames(cableSystem, cableColumn, notifiedDate, startDate, endDate, incidentType, ticketName, location, rootCauseHigh) {
      const combinedName = `${cableSystem} ${cableColumn}`;
      combinedCableNames.push({
        combinedName: combinedName,
        notifiedDate: notifiedDate,
        startDate: startDate,
        endDate: endDate,
        incidentType: incidentType,
        ticketName: ticketName,
        location: location,
        rootCauseHigh: rootCauseHigh
      });
    }


    function processCableSegments(cableSegments, startDate, endDate, notifiedDate, incidentType, ticketName, location, rootCauseHigh) {
      if (cableSegments != undefined || cableSegments != null) {
        var objectLength = Object.keys(cableSegments).length;
      }
      if (objectLength > 0) {
        for (var i = 1; i < objectLength; i++) {
          const pathKey = `path${i}`;
          if (cableSegments[pathKey] === "") {
            break;
          }
          else {
            combinedCableNames.push({
              combinedName: cableSegments[pathKey],
              notifiedDate: notifiedDate,
              startDate: startDate,
              endDate: endDate,
              incidentType: incidentType,
              ticketName: ticketName,
              location: location,
              rootCauseHigh: rootCauseHigh
            });
          }
        }
        return true;
      }
      return false;
    }
  });

  //processing the start date values
  // datastart.forEach(function (rowstart) {
  //   const cableNameBstart = rowstart[0].trim(); //this extracts the cable System
  //   const cableNameJstart = rowstart[8].trim(); //this extracts the Affected Segment1
  //   const cableNameKstart = rowstart[9].trim(); //this extracts the Affected Segment2
  //   const cableNameLstart = rowstart[10].trim();  //this extracts the Affected Segment3



  //   const firstCable1 = gettingSegments(rowstart[8].trim());  //passing the Affected Segment1 to check if its a full path
  //   const secondCable2 = gettingSegments(rowstart[9].trim()); //passing the Affected Segment2 to check if its a full path
  //   const thirdCable3 = gettingSegments(rowstart[10].trim()); //passing the Affected Segment3 to check if its a full path

  //   function processCableSegments(cableSegments) {
  //     //cableSegment is a 2d array, debug nyo nalang para makita nyo structure
  //     if (cableSegments && cableSegments[0] && cableSegments[0][0]) {
  //       for (let i = 0; i < cableSegments.length; i++) {
  //         for (let k = 0; k < cableSegments[i].length; k++) {
  //           if (cableSegments[i] === "" || cableSegments[i][k] === "") {
  //             continue;
  //           }
  //           const part2 = cableSegments[i][k].trim();
  //           combinedCableNamesStart.push(part2);
  //         }
  //       }
  //     }
  //   }

  //   processCableSegments(firstCable1);
  //   processCableSegments(secondCable2);
  //   processCableSegments(thirdCable3);

  //   const combinedNameStart = ${cableNameBstart} ${cableNameJstart} ${cableNameKstart}, ${cableNameLstart};
  //   combinedCableNamesStart.push(combinedNameStart);
  // });
  // Return combined cable names to the client-side JavaScript
  return { combinedCableNames: combinedCableNames, combinedCableNamesStart: combinedCableNamesStart };
}

//this function is the one responsible for populating the gantt chart
function fetchPast3monthsAndCurrDate() {
  var ss = SpreadsheetApp.openById(spreadsheetIdinDataBase);
  var sheet1 = ss.getSheetByName('End Date');
  var sheet2 = ss.getSheetByName('Notifications');

  var data1 = getSheetData(sheet1);
  var data2 = getSheetData(sheet2);

  var threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 12);

  var ganttChartDatas = [];

  ganttChartDatas = ganttChartDatas.concat(processData(data1, threeMonthsAgo));
  ganttChartDatas = ganttChartDatas.concat(processData(data2, threeMonthsAgo));

  return ganttChartDatas;
}

function getSheetData(sheet) {
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
}

function processData(data, threeMonthsAgo) {
  var ganttChartDatas = [];

  data.forEach(function(row) {
    var endDate = new Date(row[4]);
    if (endDate == "Invalid Date" || endDate < threeMonthsAgo) {
      return;
    }

    var segments = [
      row[9] ? row[1] + " " + row[9] : undefined,
      row[10] ? row[1] + " " + row[10] : undefined,
      row[11] ? row[1] + " " + row[11] : undefined
    ];

    segments.forEach(function(affectedSegment) {
      if (affectedSegment) {
        ganttChartDatas.push({
          referenceNo: row[0],
          cableSystem: row[1],
          affectedSegment: affectedSegment,
          startDate: row[3].toString(),
          endDate: endDate.toString(),
          incidentType: row[8],
          location: row[12],
          rootCause: row[13],
          impact : row[7]
        });
      }
    });
  });

  return ganttChartDatas;
}
//this function is the one responsible for populating necessary datas in the dashboard
function getAllCableNames() {
  var ss = SpreadsheetApp.openById(spreadsheetIdinDataBase);
  var combinedCableNames = [];
  var sheetNames = ['End Date', 'Notifications']
  for (let i = 0; i < sheetNames.length; i++) {
    console.log(sheetNames[i]);
    var sheet = ss.getSheetByName(sheetNames[i]);
    var lastRow = sheet.getLastRow();
    var cableNamesRange = sheet.getRange('A2:N' + lastRow);
    var data = cableNamesRange.getValues(); //getting the notif rows of affected segment


    // var sheetstart = ss.getSheetByName('Start Date');
    // var lastRowstart = sheetstart.getLastRow();
    // var cableNamesRangestart = sheetstart.getRange('B2:L' + lastRowstart);
    // var datastart = cableNamesRangestart.getValues(); //getting the start rows of affected segment


    //this array stores all the affected segments/cablelines on the notification sheet (yellow)

    var fullPaths = getFullPaths();

    //processing the notif values
    data.forEach(function (row) {
      const cableNameB = row[1].trim(); //this extracts the cable System
      const cableNameJ = row[9].trim(); //this extracts the Affected Segment1
      const cableNameK = row[10].trim(); //this extracts the Affected Segment2
      const cableNameL = row[11].trim();  //this extracts the Affected Segment3

      var incidentType = row[8].trim();
      var ticketName = row[0];
      var location = row[12];
      var rootCauseHigh = row[13];

      var notifiedDate = '';
      var startDate = '';
      var endDate = '';
      if (row[2] != '') {
        notifiedDate = formatDates(row[2]);
      }

      if (row[3] != '') {
        startDate = formatDates(row[3]);
      }

      if (row[4] != '') {
        endDate = formatDates(row[4]);
      }


      if (cableNameB != "" && cableNameJ != "") {
        var index = fullPaths.findIndex(({ value }) => value === cableNameB + " " + cableNameJ);
        if (index >= 0) {
          var firstCable = fullPaths[index];
        }
      }
      if (cableNameK != "") {
        var index = fullPaths.findIndex(({ value }) => value === cableNameB + " " + cableNameK);
        if (index >= 0) {
          var secondCable = fullPaths[index];
        }
      }
      if (cableNameL != "") {
        var index = fullPaths.findIndex(({ value }) => value === cableNameB + " " + cableNameL);
        if (index >= 0) {
          var thirdCable = fullPaths[index];
        }
      }


      let bool1 = processCableSegments(firstCable, startDate, endDate, notifiedDate, incidentType, ticketName, location, rootCauseHigh);
      let bool2 = processCableSegments(secondCable, startDate, endDate, notifiedDate, incidentType, ticketName, location, rootCauseHigh);
      let bool3 = processCableSegments(thirdCable, startDate, endDate, notifiedDate, incidentType, ticketName, location, rootCauseHigh);

      if (!(bool1 || bool2 || bool3)) {
        if (cableNameL !== "") addToCombinedCableNames(cableNameB, cableNameL, notifiedDate, startDate, endDate, incidentType, ticketName, location, rootCauseHigh);
        if (cableNameK !== "") addToCombinedCableNames(cableNameB, cableNameK, notifiedDate, startDate, endDate, incidentType, ticketName, location, rootCauseHigh);
        addToCombinedCableNames(cableNameB, cableNameJ, notifiedDate, startDate, endDate, incidentType, ticketName, location, rootCauseHigh);
      }

      function addToCombinedCableNames(cableSystem, cableColumn, notifiedDate, startDate, endDate, incidentType, ticketName, location, rootCauseHigh) {
        const combinedName = `${cableSystem} ${cableColumn}`;
        combinedCableNames.push({
          combinedName: combinedName,
          notifiedDate: notifiedDate,
          startDate: startDate,
          endDate: endDate,
          incidentType: incidentType,
          ticketName: ticketName,
          location: location,
          rootCauseHigh: rootCauseHigh
        });
      }


      function processCableSegments(cableSegments, startDate, endDate, notifiedDate, incidentType, ticketName, location, rootCauseHigh) {
        if (cableSegments != undefined || cableSegments != null) {
          var objectLength = Object.keys(cableSegments).length;
        }
        if (objectLength > 0) {
          for (var i = 1; i < objectLength; i++) {
            var pathKey = `path${i}`;
            if (cableSegments[pathKey] === "") {
              break;
            }
            else {
              combinedCableNames.push({
                combinedName: cableSegments[pathKey],
                notifiedDate: notifiedDate,
                startDate: startDate,
                endDate: endDate,
                incidentType: incidentType,
                ticketName: ticketName,
                location: location,
                rootCauseHigh: rootCauseHigh
              });
            }
          }
          return true;
        }
        return false;
      }
    });
  }
  console.log(combinedCableNames);
  return { combinedCableNames: combinedCableNames };
}

function getCurrentDateTableFormat(now) {

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  // Format as YYYY-MM-DD Hour:Minute
  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}`;

  return formattedDate;
}

//this function is used for when the user bruteforces to push the send to start date button or send to end date button in the modals
function copyToStartTableWithTheCurrentDate(sheetType, ticketNumber) {
  var ss = SpreadsheetApp.openById(spreadsheetIdinDataBase);
  var sheet = ss.getSheetByName('Notifications');
  var lastRow = sheet.getLastRow();
  var dataRange = sheet.getRange('A1:R' + lastRow);
  var data = dataRange.getValues();

  var sheetToTransferOrCopy = ss.getSheetByName(sheetType);
  var sheetRange = sheetToTransferOrCopy.getRange('C2:E');


  //getting startDate sheet
  var sheetStart = ss.getSheetByName('Start Date');
  var sheetStartData = sheetStart.getDataRange().getValues();




  var currentDate = getCurrentDateTableFormat(new Date());
  console.log(currentDate);

  var rowToCopy = null;
  var rowIndex = -1;
  if (sheetType == 'Start Date') {
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] === ticketNumber) { // Assuming ticket number is in the first column (index 0)
        rowToCopy = data[i].slice(); // Clone the row
        rowIndex = i;
        break;
      }
    }

    if (rowToCopy[17] != "Yes") {
      rowToCopy[3] = currentDate;
      rowToCopy[17] = 'Yes';

      sheetToTransferOrCopy.appendRow(rowToCopy);
      sheetRange.setNumberFormat('yyyy-mm-dd hh:mm');
      sheet.getRange(rowIndex + 1, 18).setValue('Yes'); // Update status in the original sheet
      sheet.getRange(rowIndex + 1, 4).setValue(currentDate); // Update status in the original sheet
    } else {
      Logger.log('Data is already on the Start Date Cell');
    }
  }

  if (sheetType == 'End Date') {
    var rowToCopyEndDate = null;
    var rowIndexEndDate = -1;

    for (var i = 1; i < sheetStartData.length; i++) {
      if (sheetStartData[i][0] === ticketNumber) { // Assuming ticket number is in the first column (index 0)
        rowToCopyEndDate = sheetStartData[i].slice(); // Clone the row
        rowIndexEndDate = i;
        break;
      }
    }
    if (rowToCopyEndDate) {
      rowToCopyEndDate[4] = currentDate; // Update end date (assuming it’s in the 5th column)

      // Append the updated row to the End Date sheet
      sheetToTransferOrCopy.appendRow(rowToCopyEndDate);
      sheetRange.setNumberFormat('yyyy-mm-dd hh:mm');

      // Delete the row from the Start Date sheet
      sheetStart.deleteRow(rowIndexEndDate + 1); // Adjust for 1-based index

      // Delete the row from the Notifications sheet
      for (var j = 0; j < data.length; j++) {
        if (data[j][0] === ticketNumber) {
          sheet.deleteRow(j + 1); // Adjust for 1-based index
          break;
        }
      }
    } else {
      Logger.log('Data is not found in Start Date sheet.');
    }
  }
}

//the only function that works in automation of copying the ticket to start date sheet if the current date matches the start date
//this function also sends the ticket to end date sheet automatically if the end date is lesser than the current date
//when the ticket is send to the end date, it deletes the ticket data on the notifications sheet and start date sheet.
function transferNotifToStartandEndDate() {
  var ss = SpreadsheetApp.openById(spreadsheetIdinDataBase);
  var sheet = ss.getSheetByName('Notifications');
  var lastRow = sheet.getLastRow();
  var dataRange = sheet.getRange('A1:R' + lastRow);
  var data = dataRange.getValues();

  var startDateSheet = ss.getSheetByName('Start Date');
  var endDateSheet = ss.getSheetByName('End Date');


  var currentDate = getCurrentDateTableFormat(new Date());
  console.log(currentDate);
  var formattedCurrentDate = formatDates(currentDate);



  const headers = data[0];
  const startDateIndex = headers.indexOf('Start Date and Time (UTC)');
  const copiedStatusIndex = headers.indexOf('Started?');
  const endDateIndex = headers.indexOf('End Date and Time (UTC)');


  if (startDateIndex === -1 || copiedStatusIndex === -1) {
    Logger.log('Start Date or Copied column not found');
    return;
  }

  const rowsToCopy = [];
  const rowsToTransfer = [];
  const updatedRows = [];
  const rowsToDelete = [];

  data.slice(1).forEach((row, index) => {
    const startDate = row[startDateIndex];
    const endDate = row[endDateIndex]
    const formattedStartDate = formatDates(startDate);
    const formattedEndDate = formatDates(endDate);
    const copiedStatus = row[copiedStatusIndex];

    if (formattedStartDate === formattedCurrentDate && copiedStatus !== 'Yes') {
      rowsToCopy.push(row);
      updatedRows.push(index + 2); // Adding 2 to account for the header row and zero-based index
    }

    if (formattedCurrentDate > formattedEndDate) {
      rowsToTransfer.push(row);
      rowsToDelete.push(index + 2);
    }

  });


  if (rowsToCopy.length > 0) {
    startDateSheet.getRange(startDateSheet.getLastRow() + 1, 1, rowsToCopy.length, rowsToCopy[0].length).setValues(rowsToCopy);
    Logger.log(`${rowsToCopy.length} rows copied.`);

    // Update the 'Copied' column in the source sheet
    updatedRows.forEach(rowNum => {
      sheet.getRange(rowNum, copiedStatusIndex + 1).setValue('Yes'); // Adding 1 to convert zero-based index to 1-based index
    });

    addToActivityLog('SystemStart', rowsToCopy[0][0], "");

  } else {
    Logger.log('No rows to copy or date is already on the Start Date');
  }

  if (rowsToTransfer.length > 0) {
    endDateSheet.getRange(endDateSheet.getLastRow() + 1, 1, rowsToTransfer.length, rowsToTransfer[0].length).setValues(rowsToTransfer);
    Logger.log(`${rowsToTransfer.length} rows copied to End Date.`);

    //Delete the rows from the notif and start sheet
    rowsToDelete.forEach(row => {
      const ticketId = data[row -1][0];
      console.log(ticketId);
      deleteRowMI('Notifications',ticketId);
       addToActivityLog('SystemEnd',ticketId , "");
    });
  }

}

//used in extracting the cable segments in those chosen cable routes that contains multiple subcables
function getFullPaths() {
  const ss = SpreadsheetApp.openById(spreadsheetIdinDataBase);
  var segmentRows = ss.getSheetByName('Segment');
  var lastRow = segmentRows.getLastRow();
  var dataRange = segmentRows.getRange('C2:I' + lastRow);
  var data = dataRange.getValues();
  var fullPaths = [];

  for (var i = 0; i < data.length; i++) {
    for (var k = 0; k < data[i].length; k++) {
      if (data[i][k + 1] !== "") {
        var splitter = data[i][k + 1].split(' ');
        var cableType = splitter[0];
        fullPaths.push({
          value: cableType + " " + data[i][k],
          path1: data[i][k + 1],
          path2: data[i][k + 2],
          path3: data[i][k + 3],
          path4: data[i][k + 4],
          path5: data[i][k + 5],
          path6: data[i][k + 6],
        });
        break;
      } else {
        break;
      }
    }
  }

  return fullPaths;
}

function getSampleData() {
  var ss = SpreadsheetApp.openById(spreadsheetIdinDataBase);
  var sheet = ss.getSheetByName('Segment'); 
  var dataRange = sheet.getRange('A2:C');

  var data = dataRange.getValues();

  var dropdownData = data.map(function (row) {
    return { cableSystem: row[0], name: row[1], value: row[2] };
  });

  return dropdownData;
}

function checkTroubleTicketExistence(troubleTicket) {
  var ss = SpreadsheetApp.openById(spreadsheetIdinDataBase);
  var sheet = ss.getSheetByName('End Date'); 
  var data = sheet.getDataRange().getValues();

  var ticketExists = data.some(function (row) {
    return row[0] === troubleTicket; 
  });

  return ticketExists;
}

//mostly used in the addpolyline client side
function extractDates(cablesystem) {
  const ss = SpreadsheetApp.openById(spreadsheetIdinDataBase);
  var notifRows = ss.getSheetByName('Notifications').getDataRange().getValues().slice(1);

  if (cablesystem !== 'All') {
    notifRows = filteringDates(notifRows, cablesystem);
  }

  var dates = notifRows.map(row => [row[1], row[2], row[3], row[4], row[9], row[10], row[11]]);

  //formatting dates
  for (const row of dates) {
    if (row[1]) {
      row[1] = formatDates(row[1]);
    }
    if (row[2]) {
      row[2] = formatDates(row[2]);
    }
    if (row[3]) {
      row[3] = formatDates(row[3]);
    }
  }
  return dates;
}

function filteringDates(sheetData, cablesystem) {
  var rows = sheetData.filter(row => {
    const cableSystem = row[1];
    return cableSystem === cablesystem
  });
  return rows;
}

function formatDates(dateString) {
  const originalDate = new Date(dateString);
  const formatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedDate = formatter.format(originalDate);
  return formattedDate;
}

//used in self auto refresh functionality in the client side
function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

//used in adding activity log in every activity the user does
function addToActivityLog(activityType, troubleTicket, incidentTypeAdd) {
  const ss = SpreadsheetApp.openById(spreadsheetIdinDataBase);
  var activitySheet = ss.getSheetByName('Activity History');

  var currentDate = getCurrentDateTableFormat(new Date());
  var notifToPush = "";
  var actions = "";
  var personsEmail = Session.getActiveUser().getEmail();
  if (activityType === 'Add') {
    var notifToPush = 'Added a New ' + incidentTypeAdd + ' Ticket ( ' + troubleTicket + " )";
    actions = 'Added';
  }
  else if (activityType === 'Delete') {
    var notifToPush = 'Deleted an Existing Ticket ( ' + troubleTicket + ' )';
    actions = 'Deleted';
  }
  else if (activityType === "Update") {
    var notifToPush = ' Updated the Ticket ( ' + troubleTicket + ' )';
    actions = 'Updated';
  }
  else if (activityType === "toStartDate") {
    var notifToPush = ' Copied the Ticket to Start Date. ( ' + troubleTicket + ' )';
    actions = 'Sent to start';
  }
  else if (activityType === "toEndDate") {
    var notifToPush = ' Sent the Ticket to End Date ( ' + troubleTicket + ' )';
    actions = 'Sent to end';
  }
  else if (activityType === "SystemStart") {
    var notifToPush = 'The system automatically copied the ticket to Start Date ( ' + troubleTicket + ' )';
    actions = 'System';
    personsEmail = 'System';
  }
  else if (activityType === "SystemEnd") {
    var notifToPush = 'The system automatically send the ticket to End Date ( ' + troubleTicket + ' )';
    actions = 'System';
    personsEmail = 'System';
  }

  var rowData = [[currentDate, personsEmail, troubleTicket, notifToPush, actions]];

  var lastRow = activitySheet.getLastRow();

  var range = activitySheet.getRange(lastRow + 1, 1, 1, 5);

  range.setValues(rowData);

  activitySheet.getRange(1, 1, lastRow, 1).setNumberFormat('yyyy-mm-dd hh:mm');
}


//used in displaying activity logs on the client side
function fetchActivityLogs() {
  const ss = SpreadsheetApp.openById(spreadsheetIdinDataBase);
  var activitySheet = ss.getSheetByName('Activity History');
  var data = activitySheet.getDataRange().getValues().slice(1);

  for (var i = 0; i < data.length; i++) {
    data[i][0] = getCurrentDateTableFormat(data[i][0]);
  }
  return data;
}