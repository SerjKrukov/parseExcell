// $(function() {
//   let socket = io.connect('http://localhost:5001');
//   socket.on('connect', function() {
//     let delivery = new Delivery(socket);

//     delivery.on('delivery.connect', function(delivery) {
//       $('input[type=button]#buttonUpload').on('click', function() {
//         let file = $('input[type=file]#fileinput')[0].files[0];
//         delivery.send(file);

//       });
//     });
//     delivery.on('send.success', function(fileUID) {
//       console.log("File was successfully send");
//       socket.emit("receiveResults");
//     })
//   })
//   .on('message', function(buff) {
//     $('div#outOnPage').html(buff);
//   })
// })
