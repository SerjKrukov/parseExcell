// const fs = require('fs')
// const dl = require('delivery')
// const xlsx = require('xlsx');

const bodyParser = require('body-parser')
const logger = require('morgan')
const express = require('express');
// const socketIO = require('socket.io');
const path = require('path');
const mongodb = require('mongodb');

// const urlDB = 'mongodb://localhost:27017/testdb';
const urlPath = process.env.MONGOLAB_URI;
const PORT = process.env.PORT || 5001;
const INDEX = path.join(__dirname,'./public/' , 'index.html');

// console.log(urlPath.slice(urlPath.lastIndexOf("/") + 1));
let urlDB = urlPath.slice(urlPath.lastIndexOf("/") + 1);
let db;

const server = express()
server.use(bodyParser.json())
server.use(logger('dev'))
server.use(express.static('public'))
// server.use((req, res, next) => {
//     res.sendFile(INDEX) 
//     next()
//   })
  server.get("/", (req, res) => {
    res.sendFile(INDEX);
  })
mongodb.MongoClient.connect(urlPath, (error, client) => {
  console.log('we are at connection side');
  console.log('urlPath ' + urlPath);
  console.log('urlDB ' + urlDB);
  server.post("/newItems/:table", (req, res, next) => {
    let table = req.params.table;
    let items = req.body;
    // console.log(table);
    // console.log(items);
    db = client.db(urlDB);
    db.collection(table).insert(items, (error, results) => {
      if (error) console.error(error)
      console.log(`successfully save data to ${table} collection`);
    })
    // client.close();
    var response = {
      // status  : 200,
      success : table
  }
    // res.status(200);
    // res.send(table);
    res.status(200).send(JSON.stringify(response));
    // res.send(JSON.stringify(response));
  })

  server.get("/newItems/:table", (req, res, next) => {
    let table = req.params.table;
    db = client.db(urlDB);
    db.collection(table).find({},{sort: {_id: 1}})
      .toArray((error, newItems) => {
        if (error) return next(error);
        res.send(newItems);
      });
      
  });
})


server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
// const io = socketIO(server);


// let buff = ''
// let fileName = ''

// io.on('connection', function(socket) {
//   let delivery = dl.listen(socket);
//   delivery.on('receive.success', function(file) {
//     fileName = file.name
//     fs.writeFile(file.name, file.buffer, function(err) {
//       if (err) {
//         console.error(err);;
//       } else {
//         console.log("File saved");
//       }
//     })

//   })
//   socket.on('receiveResults', () => {
//     let workbook = xlsx.readFile(path.join(__dirname , fileName))
//     workbook.SheetNames.forEach((sheetName) => {
//       buff += xlsx.utils.sheet_to_html(workbook.Sheets[sheetName])
//     })
//     socket.send(buff)
//     buff = ''
//     fs.unlinkSync(path.join(__dirname , fileName))
//   })
// })
