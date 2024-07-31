function doGet(e) {
  var htmloutput = HtmlService.createTemplateFromFile('CableMap').evaluate().setTitle('Map View');

  return htmloutput;
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
  var values = dataRange.getValues();
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
        sheet.getRange(i + 1, k + 1).setNumberFormat('@');
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
  range.setNumberFormat('@'); // Set format to treat values as text

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
  range.setNumberFormat('@'); // Set format to treat values as text

  return 'success';
}

function getCableNames() {
  var ss = SpreadsheetApp.openById('1vW8zgcrQC02iRLkWJSOIjfnqN5_lRNMgNjV6IBZF__c'); // Use openById to open the spreadsheet
  var sheet = ss.getSheetByName('Notifications'); // Assuming your sheet name is "Notification"
  var lastRow = sheet.getLastRow();
  var cableNamesRange = sheet.getRange('B2:L' + lastRow); // Assuming cable names are in columns B and J starting from row 2
  var data = cableNamesRange.getValues(); // Fetch cable names data by row

  var sheetstart = ss.getSheetByName('Start Date'); // Assuming your sheet name is "Notification"
  var lastRowstart = sheetstart.getLastRow();
  var cableNamesRangestart = sheetstart.getRange('B2:L' + lastRowstart); // Assuming cable names are in columns B and J starting from row 2
  var datastart = cableNamesRangestart.getValues(); // Fetch cable names data by row



  var combinedCableNames = [];
  var combinedCableNamesStart = [];

  // Process each row separately
  data.forEach(function (row) {
    var cableNameB = row[0].toUpperCase().trim(); // Convert cable name from column B to uppercase and trim whitespace
    var cableNameJ = row[8].toUpperCase().trim(); // Convert cable name from column J to uppercase and trim whitespace
    var cableNameK = row[9].toUpperCase().trim(); // Convert cable name from column J to uppercase and trim whitespace
    var cableNameL = row[10].toUpperCase().trim(); // Convert cable name from column J to uppercase and trim whitespace
    // Combine cable names from columns B and J into one array element
    var combinedName = cableNameB + ' ' + cableNameJ + ' ' + cableNameK + ' ' + cableNameL;
    combinedCableNames.push(combinedName); // Add combined name to the array
  });

  datastart.forEach(function (rowstart) {
    var cableNameBstart = rowstart[0].toUpperCase().trim(); // Convert cable name from column B to uppercase and trim whitespace
    var cableNameJstart = rowstart[8].toUpperCase().trim(); // Convert cable name from column J to uppercase and trim whitespace
    var cableNameKstart = rowstart[9].toUpperCase().trim(); // Convert cable name from column J to uppercase and trim whitespace
    var cableNameLstart = rowstart[10].toUpperCase().trim(); // Convert cable name from column J to uppercase and trim whitespace
    // Combine cable names from columns B and J into one array element
    var combinedNamestart = cableNameBstart + ' ' + cableNameJstart + ' ' + cableNameKstart + ' ' + cableNameLstart;
    combinedCableNamesStart.push(combinedNamestart); // Add combined name to the array
  });

  // Return combined cable names to the client-side JavaScript
  return { combinedCableNames: combinedCableNames, combinedCableNamesStart: combinedCableNamesStart };
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

