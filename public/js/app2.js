$(function() {
var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
function handleFile(e) {
  var files = e.target.files, f = files[0];
  var reader = new FileReader();
  let out = document.getElementById('outOnPage');
  reader.onload = function(e) {
    out.innerHTML = '';
    var data = e.target.result;
    if(!rABS) data = new Uint8Array(data);
    var workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array'});
    workbook.SheetNames.forEach(function(sheetName) {
      out.innerHTML += XLSX.utils.sheet_to_html(workbook.Sheets[sheetName])
    });
    out.innerHTML = XLSX.utils.sheet_to_html(worksheet);
  };
  if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
}
let input_dom_element = document.getElementById('fileinputBr');
input_dom_element.addEventListener('change', handleFile, false);
})
