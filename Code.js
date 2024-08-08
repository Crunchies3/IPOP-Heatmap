function doGet(e) {
  if (!e.parameter.page) {
    var htmloutput = HtmlService.createTemplateFromFile('CableMap').evaluate().setTitle('Map View');
    return htmloutput;
  }
  else if (e.parameter['page'] == 'gantt') {
    var htmloutput = HtmlService.createTemplateFromFile('gantt-chart' + '/' + 'index').evaluate().setTitle('Gantt Chart View');
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

function getAddress(address) {
  var response = Maps.newGeocoder().geocode(address);
  var returnArray = [];
  for (var i = 0; i < response.results.length; i++) {
    var result = response.results[i];
    Logger.log('%s: %s, %s', result.formatted_address, result.geometry.location.lat,
      result.geometry.location.lng);

    returnArray.push([result.geometry.location.lat, result.geometry.location.lng]);
  }
  return returnArray;
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

function getSJCLocationsByCableSystem(cableSystem) {
  var spreadsheetId = '1HfAXyfUdzDBBIj09Av5jhtJsazf3fI2WhXs8BbOZ4Zs';
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('location');
  var data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues(); // Assuming data starts from row 2 and columns A to D

  // Filter the data based on the cable system
  var filteredLocations = data.filter(function (row) {
    return row[0] === cableSystem;
  });

  // Convert the filtered data into an array of objects
  var locations = filteredLocations.map(function (row) {
    return {
      cableSystem: row[0],
      pointName: row[1],
      longitude: parseFloat(row[2]),
      latitude: parseFloat(row[3]),
    };
  });

  return locations;
}

function getSJCDataByCableSystem(cableSystem) {
  var spreadsheetId = '1HfAXyfUdzDBBIj09Av5jhtJsazf3fI2WhXs8BbOZ4Zs';
  var cablesSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('cables');
  var data = cablesSheet.getRange(2, 1, cablesSheet.getLastRow() - 1, 9).getValues(); // Starting from row 2, columns A to I

  // Filter the data based on the cable system
  var filteredCables = data.filter(function (row) {
    return row[0] === cableSystem;
  });

  // Convert filtered data into an array of objects
  var cables = filteredCables.map(function (row) {
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
  var spreadsheetId = '1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c';
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var dataRange = sheet.getDataRange();
  var values = dataRange.getDisplayValues();
  values.shift();  // Assuming you want to remove the header row
  return values;
}

function getDataForGraphCS() {
  var spreadsheetId = '1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c';
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Dashboard');

  // Define the range B2:E6
  var startRow = 2;
  var startColumn = 2;
  var numRows = 5; // 5 rows
  var numColumns = 4; // 4 columns

  // Get the range
  var dataRange = sheet.getRange(startRow, startColumn, numRows, numColumns);

  // Get the values from the range
  var values = dataRange.getValues();

  // Flatten the values array to match the sequence you described
  var flattenedValues = [];
  for (var row = 0; row < numRows; row++) {
    for (var col = 0; col < numColumns; col++) {
      flattenedValues.push(values[row][col]);
    }
  }

  return flattenedValues;
}

function getDataForGraphRC() {
  var spreadsheetId = '1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c';
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Dashboard');

  // Define the new range B10:E18
  var startRow = 10;
  var startColumn = 2;
  var numRows = 9; // 9 rows (from row 10 to row 18)
  var numColumns = 4; // 4 columns

  // Get the range
  var dataRange = sheet.getRange(startRow, startColumn, numRows, numColumns);

  // Get the values from the range
  var values = dataRange.getValues();

  // Flatten the values array to match the sequence you described
  var flattenedValues = [];
  for (var row = 0; row < numRows; row++) {
    for (var col = 0; col < numColumns; col++) {
      flattenedValues.push(values[row][col]);
    }
  }

  return flattenedValues;
}

function getDataForPieChart() {
  // Spreadsheet ID
  var spreadsheetId = '1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c';

  // Get data range from Sheet1
  var sheet1 = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Notifications');
  var numRows1 = sheet1.getLastRow() - 1; // Exclude header row

  // Get data range from Sheet2
  var sheet2 = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Start Date');
  var numRows2 = sheet2.getLastRow() - 1; // Exclude header row

  // Get data range from Sheet3
  var sheet3 = SpreadsheetApp.openById(spreadsheetId).getSheetByName('End Date');
  var numRows3 = sheet3.getLastRow() - 1; // Exclude header row

  // Combine counts from all sheets
  var totalValues = [numRows1, numRows2, numRows3];

  return totalValues;
}

function updateRowMI(sheetName, key, updatedData) {
  var spreadsheetId = '1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c';
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == key) {
      // Update the row with the new data
      for (var k = 0; k < updatedData.length; k++) {
        sheet.getRange(i + 1, k + 1).setValue(updatedData[k]);
        // Format the cell as plain text
        sheet.getRange(i + 1, k + 1).setNumberFormat('yyyy-mm-dd hh:mm');
      }

      // Log success
      console.log('Update successful');
      return 'success';
    }
  }
}


function deleteRowMI(sheetName, col1) {
  var spreadsheetId = '1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c';
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();

  // Find the row index based on the col1
  var rowIndex = -1;
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == col1) {
      rowIndex = i + 1; // Adding 1 to convert from 0-based index to 1-based index
      break;
    }
  }

  // If rowIndex is found, delete the row
  if (rowIndex !== -1) {
    sheet.deleteRow(rowIndex);
    return 'success';
  }
}

function addDataToSheetMI(sheetName, majorIncidents) {
  var spreadsheetId = '1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c';
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
  var spreadsheetId = '1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c';
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

function getCableNames() {
  var ss = SpreadsheetApp.openById('1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c');
  var sheet = ss.getSheetByName('Notifications');
  var lastRow = sheet.getLastRow();
  var cableNamesRange = sheet.getRange('B2:L' + lastRow);
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
    const cableNameB = row[0].trim(); //this extracts the cable System
    const cableNameJ = row[8].trim(); //this extracts the Affected Segment1
    const cableNameK = row[9].trim(); //this extracts the Affected Segment2
    const cableNameL = row[10].trim();  //this extracts the Affected Segment3

    const notifiedDate = formatDates(row[1]);
    const startDate = formatDates(row[2]);
    const endDate = formatDates(row[3]);

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


    let bool1 = processCableSegments(firstCable, startDate, endDate, notifiedDate);
    let bool2 = processCableSegments(secondCable, startDate, endDate, notifiedDate);
    let bool3 = processCableSegments(thirdCable, startDate, endDate, notifiedDate);

    if (!(bool1 || bool2 || bool3)) {
      if (cableNameL !== "") addToCombinedCableNames(cableNameB, cableNameL, notifiedDate, startDate, endDate);
      if (cableNameK !== "") addToCombinedCableNames(cableNameB, cableNameK, notifiedDate, startDate, endDate);
      addToCombinedCableNames(cableNameB, cableNameJ, notifiedDate, startDate, endDate);
    }

    function addToCombinedCableNames(cableSystem, cableColumn, notifiedDate, startDate, endDate) {
      const combinedName = `${cableSystem} ${cableColumn}`;
      combinedCableNames.push({
        combinedName: combinedName,
        notifiedDate: notifiedDate,
        startDate: startDate,
        endDate: endDate
      });
    }


    function processCableSegments(cableSegments, startDate, endDate, notifiedDate) {
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
              endDate: endDate
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
function getCurrentDateTableFormat() {
  const now = new Date();

  // Get the components of the date
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  // Format as YYYY-MM-DD Hour:Minute
  const formattedDate = `${year}-${month}-${day} ${hour}:${minute}`;

  return formattedDate;
}


function copyToStartTableWithTheCurrentDate(sheetType, ticketNumber) {
  var ss = SpreadsheetApp.openById('1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c');
  var sheet = ss.getSheetByName('Notifications');
  var lastRow = sheet.getLastRow();
  var dataRange = sheet.getRange('A1:R' + lastRow);
  var data = dataRange.getValues();

  var sheetToTransferOrCopy = ss.getSheetByName(sheetType);
  var sheetRange = sheetToTransferOrCopy.getRange('C2:E');


  //getting startDate sheet
  var sheetStart = ss.getSheetByName('Start Date');
  var sheetStartData = sheetStart.getDataRange().getValues();




  var currentDate = getCurrentDateTableFormat();
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


function transferNotifToStartandEndDate() {
  var ss = SpreadsheetApp.openById('1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c');
  var sheet = ss.getSheetByName('Notifications');
  var lastRow = sheet.getLastRow();
  var dataRange = sheet.getRange('A1:R' + lastRow);
  var data = dataRange.getValues();

  //getting start date sheet 
  var startDateSheet = ss.getSheetByName('Start Date');
  var endDateSheet = ss.getSheetByName('End Date');


  var currentDate = getCurrentDateTableFormat();
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

  } else {
    Logger.log('No rows to copy or date is already on the Start Date');
  }

  if (rowsToTransfer.length > 0) {
    endDateSheet.getRange(endDateSheet.getLastRow() + 1, 1, rowsToTransfer.length, rowsToTransfer[0].length).setValues(rowsToTransfer);
    Logger.log(`${rowsToTransfer.length} rows copied to End Date.`);

    //Delete the rows from the notif and start sheet
    rowsToDelete.forEach(row => {
      const rowIndex = data.indexOf(row) + 3; // Adding 2 to account for the header row and zero-based index
      sheet.deleteRow(rowIndex);
      startDateSheet.deleteRow(rowIndex);
    });
  }

}


function getFullPaths() {
  const ss = SpreadsheetApp.openById('1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c');
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
  var ss = SpreadsheetApp.openById('1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c');
  var sheet = ss.getSheetByName('Segment'); // Assuming your sheet name is "Segment"
  var dataRange = sheet.getRange('A2:C'); // Assuming your data starts from row 2 and columns A to C

  var data = dataRange.getValues(); // Fetch data from the range

  var dropdownData = data.map(function (row) {
    return { cableSystem: row[0], name: row[1], value: row[2] };
  });

  // Return the data to the client-side JavaScript
  return dropdownData;
}

function checkTroubleTicketExistence(troubleTicket) {
  var ss = SpreadsheetApp.openById('1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c');
  var sheet = ss.getSheetByName('End Date'); // Change sheet name if necessary
  var data = sheet.getDataRange().getValues();

  // Check if trouble ticket exists in the sheet
  var ticketExists = data.some(function (row) {
    return row[0] === troubleTicket; // Assuming trouble ticket is in the first column
  });

  return ticketExists;
}


function extractDates(cablesystem) {
  const ss = SpreadsheetApp.openById('1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c');
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

function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}