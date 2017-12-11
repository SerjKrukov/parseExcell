const fs = require('fs')
const dl = require('delivery')
const xlsx = require('xlsx');

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 5001;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);


let buff = ''
let fileName = ''

io.on('connection', function(socket) {
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
