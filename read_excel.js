/* eslint-disable @typescript-eslint/no-require-imports */
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

function readAndPrint(filePaths) {
  const result = {};
  for (const fp of filePaths) {
    try {
      const workbook = xlsx.readFile(fp);
      const fileData = {};
      
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        
        // Save first 10 rows
        fileData[sheetName] = {
          totalRows: data.length,
          preview: data.slice(0, 10)
        };
      }
      result[path.basename(fp)] = fileData;
    } catch (e) {
      result[path.basename(fp)] = { error: e.message };
    }
  }
  fs.writeFileSync('excel_output.json', JSON.stringify(result, null, 2));
}

const files = [
  'C:\\Users\\sarthak\\Project Automation\\streamliner-app\\Project List.xlsx',
  'C:\\Users\\sarthak\\Project Automation\\streamliner-app\\N - 2527 GI GL LINE 1350 MM @180 MPM.xlsx'
];

readAndPrint(files);
