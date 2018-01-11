$(function() {
  let tableNames = [];
  let tableColumns = [];
  let headers = [];
  let sha1 = new Hashes.SHA1;
  $('div#nameSetters').hide();
  $('span.mapping').hide();
  $('input[type=button]#saveData').hide();

  $('span#manualMapping').on('click', function() {
    $('div#nameSetters').slideToggle();
  });


  var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
  function handleFile(e) {
    var files = e.target.files, f = files[0];
    var reader = new FileReader();
    let out = document.getElementById('outOnPage');
    tableNames = [];
    tableColumns = [];
    $('select#tableNames').children().remove();
    $('select#columnNames').children().remove();
    reader.onload = function(e) {
      out.innerHTML = '';
      var data = e.target.result;
      if(!rABS) data = new Uint8Array(data);
      var workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array'});
      workbook.SheetNames.forEach(function(sheetName) {
        tableNames.push(sheetName);
        out.innerHTML += XLSX.utils.sheet_to_html(workbook.Sheets[sheetName])
      });

      $('span.mapping').show();
      $('input[type=button]#saveData').show();
      $('table').each(function(index) {
        $(this).attr("id", `table${index}`).prepend("<thead>").prepend("<caption>");
        let l = 0;
        let columnNames = [];
        $(this).children('tbody').children('tr:first').children('td').each(function() {
          l += $(this).prop('colspan') ? parseInt($(this).prop('colspan')) : 1;
        })
        tableColumns.push(l);
        for(let i = 0; i < l; i++) {
          $(this).find("thead").append("<th>");
          columnNames.push(`th${i}`);
        }
        headers[index] = columnNames;
        // console.log(tableNames[index] ,index, tableColumns[index]);
      });
      // console.log(headers);
      tableNames.forEach(function(tableName, index) {
        $('select#tableNames').append($("<option>", {
          value: index,
          name: tableName,
          text: tableName
        }))
      });

      $('select#tableNames').trigger('change');
      
    };

  if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
}

$('span#defaultMapping').on('click', function() {
  for(let t = 0; t < tableNames.length; t++) {
    $(`table#table${t} caption`).text(`${tableNames[t]}`);
    for(let h = 0; h < tableColumns[t]; h++) {
      $(`table#table${t} thead`).children().eq(h).text(headers[t][h]);
    }
    
  }
});



$('select#tableNames').on('change', function() {
  let text = $(this).find('option:selected').attr('name');
  $('input[type=text]#tableName').val(text);
  let val = $(this).find('option:selected').val();
  
  for(let i = 0; i < tableColumns[val]; i++) {
    $('select#columnNames').append($("<option>", {
      value: i,
      name: headers[val][i],
      text: headers[val][i]
    }))
  }
  $('select#columnNames').trigger("change");
});

$('select#columnNames').on('change', function() {
  let text = $(this).find("option:selected").attr("name");
  $('input[type=text]#columnName').val(text);
});

$('input[type=button]#setTableName').on("click", function() {
  let text = $('input[type=text]#tableName').val();
  let id = $('select#tableNames').val();
  if (text.length < 1) {
    alert('table need a name');
    $('select#tableNames').trigger('change');
    return;
  }
  $(`table#table${id} caption`).text(text);
  tableNames[id] = text;
  $('select#tableNames option').eq(id).attr("name", text).text(text);
});

$('input[type=button]#setColumnName').on('click', function() {
  text = $('input[type=text]#columnName').val();
  idTable = $('select#tableNames').val();
  idCol = $('select#columnNames').find('option:selected').val();
  // console.log(idTable);
  if (text.length < 1) {
    alert("Column need a name");
    $('select#columnNames').trigger('change');
    return;
  }
  for(let i = 0; i < headers[idTable].length; i++) {
    if(i == idCol) continue;
    if(text == headers[idTable][i]) {
      alert("Column need an unique name");
      $('select#columnNames').trigger('change');
      return;
    }
  }
  
  $(`table#table${idTable} thead th`).eq(idCol).text(text);
  headers[idTable][idCol] = text;
  $('select#columnNames option').eq(idCol).attr('name', text).text(text);
});

$('input[type=button]#saveData').on('click', function() {
  
  // console.log(headers[0][2]);
  // let id = $('select#tableNames').val();
  for(let id = 0; id < tableNames.length; id++) {
    let data = [];
    $(`table#table${id} tbody tr`).each(function(index) {
      row = {};
      $(this).find('td').each(function(cell) {
        row[ headers[id][cell] ] = sha1.hex($(this).html());
      })
      data.push(row);
    });
    // console.log(JSON.stringify(data));
    saveItems(tableNames[id], JSON.stringify(data), id);
  }


});

$('input[type=button]#getData').on('click', function() {
  console.log("hello");
  for(let i = 0; i < tableNames.length; i++) {
    console.log(sha1.hex(tableNames[i]));
  }
});

  function saveItems(_table, _data, _id) {
    // console.log(_table);
    $.ajax({
      url: `/newItems/${_table}`,
      contentType: "application/json",
      type: "POST",
      data: _data,
      dataType: "json",
      success: function(resp) {
        // console.log(resp['success']);
        let newId = `return${_id}`;
        // $('div#outOnPage').prepend($("<span>", {
        //   text: resp['success'],
        //   id: newId
        // }));
        getAddedData(newId, resp['success']);
      },
      error: function(err) {
        console.error(err)
      }
      
    });
  }

  function getAddedData(_id, _table) {
    // let _table = $(`span#${_id}`).text()
    // console.log(_table);
    $.ajax({
      url: `/newItems/${_table}`,
      type: 'GET',
      success: function(resp) {
        console.log(resp);
        $('div#outOnPage').prepend($('<div>', {id: _table}));
        
        $(`div#${_table}`).append($('<button>', {
          id: `button${_table}`,
          text: _table
        }))
        .append($('<div>', {id: `${_table}Data`}));
        $(`div#${_table}Data`).hide();

        $(`button#button${_table}`).on('click', function() {
          $(`div#${_table}Data`).slideToggle();
        })

        for(let i = 0; i < resp.length; i++) {
          $(`div#${_table}Data`)
          .append($('<div>', {
            id: `${resp[i]['_id']}Data`
          }))
          $(`div#${resp[i]['_id']}Data`).append($('<button>', {
            id: resp[i]['_id'],
            text: resp[i]['_id'],
            style: "display: block"
          }))
          .append($('<div>', {id: `${resp[i]['_id']}Object`}))
          let keys = Object.keys(resp[i]);
          $(`button#${resp[i]['_id']}`).on('click', function() {
            $(this).siblings().slideToggle();
          });

          for(let j = 0; j < keys.length; j++) {
            $(`div#${resp[i]['_id']}Object`).hide().append($('<div>', {text: `${keys[j]} : ${resp[i][keys[j]]}`}))
          }
        }

        console.log(resp[0]['_id']);
      },
      error: function(err) {
        console.error(err);
      }
    })
  }

  // function getData(_id) {
  //   let _table = tableNames[_id];
  //   // console.log(_table);
  //   $.ajax({
  //     url: `/newItems/${_table}`,
  //     type: 'GET',
  //     success: function(resp) {
  //       console.log(resp);
  //       $('div#outOnPage').prepend($('<div>', {id: _table}));
        
  //       $(`div#${_table}`).append($('<button>', {
  //         id: `button${_table}`,
  //         text: _table
  //       }))
  //       .append($('<div>', {id: `${_table}Data`}));
  //       $(`div#${_table}Data`).hide();

  //       $(`button#button${_table}`).on('click', function() {
  //         $(`div#${_table}Data`).slideToggle();
  //       })

  //       for(let i = 0; i < resp.length; i++) {
  //         $(`div#${_table}Data`).append($('<div>', {
  //           id: resp[i]['_id'],
  //           text: resp[i]['_id']
  //         }))

  //         let keys = Object.keys(resp[i]);
  //         $(`div#${resp[i]['_id']}`).append($('<div>')).on('click', function() {
  //           $(this).children('div').slideToggle();
  //         });

  //         for(let j = 0; j < keys.length; j++) {
  //           $(`div#${resp[i]['_id']} div`).hide().append($('<p>', {text: `${keys[j]} : ${resp[i][keys[j]]}`}))
  //         }
  //       }

  //       console.log(resp[0]['_id']);
  //     },
  //     error: function(err) {
  //       console.error(err);
  //     }
  //   })
  // }

let input_dom_element = document.getElementById('fileinputBr');
input_dom_element.addEventListener('change', handleFile, false);
})
