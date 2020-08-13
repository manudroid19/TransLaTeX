const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const formidable = require('formidable')
const path = require('path');
const fs = require('fs')


app.use(express.static('public'));
app.set('view engine', 'ejs');


app.get('/', function (req, res) {
  res.render('./index');
})

app.get('/convert', function (req, res) {
  file=req.query.file
  res.render('convert');
})


app.use(bodyParser.urlencoded({ extended: true }));

app.post('/', function (req, res) {
  res.render('index');
  console.log(req.body.city);
})
var sizeLimitBytes = 2000;
app.post('/uploadSourceTex', (req, res) => {
  new formidable.IncomingForm().parse(req)
    .on('field', (name, field) => {
      console.log('Field', name, field)
    })
    .on('fileBegin', (name, file) => {
      fpath = __dirname + '/uploads/' + file.name
      while (fs.existsSync(fpath)) {
        fpath=fpath+"_"
      }
      file.path = fpath
    })
    .on('file', (name, file) => {
      console.log('Uploaded file', name, file.name)
      if(file.path.substring(file.path.length-1)=="_"){
        fpath = __dirname + '/uploads/' + file.name
        while (fs.existsSync(fpath)) {
          if(getFilesizeInBytes(fpath)==getFilesizeInBytes(file.path)){
            var f1 = fs.readFileSync(fpath);
            var f2 = fs.readFileSync(file.path);
            if (fpath!=file.path && f1.equals(f2)) {
              console.log("Borrando", file.path)
              fs.unlink(file.path, (err) => {
                if (err) {
                  console.error(err)
                  return
                }
              })
              file.path=fpath
              break
            }
          }
          fpath=fpath+"_"
        }
      }
      res.writeHead(301,
        {Location: '../convert?file='+path.basename(file.path)}
      );
    })
    .on('aborted', () => {
      console.error('Request aborted by the user')
    })
    .on('error', (err) => {
      console.error('Error', err)
    })
    .on('end', () => {
      res.end()
    })
    .maxFileSize = 500 * 1024 * 1024;
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

function getFilesizeInBytes(filename) {
    var stats = fs.statSync(filename)
    var fileSizeInBytes = stats["size"]
    return fileSizeInBytes
}
