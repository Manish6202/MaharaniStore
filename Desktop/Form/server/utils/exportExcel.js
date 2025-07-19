const ExcelJS = require('exceljs');
const Player = require('../models/Player');
const path = require('path');

const exportPlayersToExcel = async () => {
  const players = await Player.find();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Players');

  worksheet.columns = [
    { header: 'Name', key: 'name', width: 20 },
    { header: 'Age', key: 'age', width: 10 },
    { header: 'Address', key: 'address', width: 25 },
    { header: 'Mobile', key: 'mobile', width: 15 },
    { header: 'Playing Style', key: 'playingStyle', width: 20 },
    { header: 'Player Type', key: 'playerType', width: 20 },
    { header: 'Unavailability', key: 'unavailability', width: 20 },
    { header: 'Remarks', key: 'remarks', width: 20 }
  ];

  players.forEach(player => worksheet.addRow(player));

  const filePath = path.join(__dirname, '../uploads/players.xlsx');
  await workbook.xlsx.writeFile(filePath);
  return filePath;
};

module.exports = { exportPlayersToExcel };
