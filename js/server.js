const fs = require('fs')
const io = require('socket.io').listen(5001)
const dl = require('delivery')
const xlsx = require('xlsx');
const path = require('path');

let buff = ''
let fileName = ''
io.sockets.on('connection', function(socket) {
  let delivery = dl.listen(socket);
  delivery.on('receive.success', function(file) {
    fileName = file.name
    fs.writeFile(file.name, file.buffer, function(err) {
      if (err) {
        console.error(err);;
      } else {
        console.log("File saved");
      }
    })

  })
  socket.on('receiveResults', () => {
    let workbook = xlsx.readFile(path.join(__dirname ,'../', fileName))
    workbook.SheetNames.forEach((sheetName) => {
      buff += xlsx.utils.sheet_to_html(workbook.Sheets[sheetName])
    })
    socket.send(buff)
    buff = ''
    fs.unlinkSync(path.join(__dirname ,'../', fileName))
  })
})
