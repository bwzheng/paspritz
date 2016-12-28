//Lets require/import the HTTP module
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var randomstring = require("randomstring");
var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'dxvi5x7yo',
  api_key: '927284733168267',
  api_secret: 'N6eeV39X6iAxVw7LYpLzFJSHREw'
});
var PAGE_ACCESS_TOKEN = "EAARMDbQZCF4MBAFa0dOGjpPKlZBH7uZAu5vsOx54qF1OpoK36D6TlyLXkFqorkfApSZAfRb7ixrCfOHA0wvV3XHWrj5bItaJ9w1CQIWVKKuKRGxSnj6wmbI8NYSCVtSZA1ChjHV1QRbSsqqC8pi2dNfBvMpWhakSjIvqtMlemlQZDZD"
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
var extractor = require('unfluff');
const fs = require('fs');
var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(600, 135)
  , ctx = canvas.getContext('2d');

var GIFEncoder = require('gifencoder');
var gifname = '';
var myImage = new Image();
myImage.src = 'download.png';

//Lets define a port we want to listen to
var port = process.env.PORT || 3000;

app.post('/message', function (req, res) {
  var data = req.body;
  console.log(data);
  request(data.url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var data = extractor(body);
      spritzify(data.text, function(){
        cloudinary.uploader.upload(gifname, function(result) {
          console.log(JSON.stringify(result, null, 4))
          fs.unlinkSync(gifname);
          res.json({link: result.url});
          res.sendStatus(200);
        })
      });

    }
  })
});

function spritzify(input, callback){

    var wpm = 300;
    var ms_per_word = 60000/wpm;

    // Split on any spaces.
    var all_words = input.split(/\s+/);

    // The reader won't stop if the selection starts or ends with spaces
    if (all_words[0] == "")
    {
        all_words = all_words.slice(1, all_words.length);
    }

    if (all_words[all_words.length - 1] == "")
    {
        all_words = all_words.slice(0, all_words.length - 1);
    }

    var word = '';
    var result = '';

    // Preprocess words
    var temp_words = all_words.slice(0); // copy Array
    var t = 0;

    for (var i=0; i<all_words.length; i++){

        if(all_words[i].indexOf('.') != -1){
            temp_words[t] = all_words[i]
        }

        // Double up on long words and words with commas.
        if((all_words[i].indexOf(',') != -1 || all_words[i].indexOf(':') != -1 || all_words[i].indexOf('-') != -1 || all_words[i].indexOf('(') != -1|| all_words[i].length > 8) && all_words[i].indexOf('.') == -1){
            temp_words.splice(t+1, 0, all_words[i]);
            temp_words.splice(t+1, 0, all_words[i]);
            t++;
            t++;
        }

        // Add an additional space after punctuation.
        if(all_words[i].indexOf('.') != -1 || all_words[i].indexOf('!') != -1 || all_words[i].indexOf('?') != -1 || all_words[i].indexOf(':') != -1 || all_words[i].indexOf(';') != -1|| all_words[i].indexOf(')') != -1){
            temp_words.splice(t+1, 0, " ");
            temp_words.splice(t+1, 0, " ");
            temp_words.splice(t+1, 0, " ");
            t++;
            t++;
            t++;
        }

        t++;

    }

    all_words = temp_words.slice(0);
    var encoder = new GIFEncoder(600, 135);
    gifname = randomstring.generate() + '.gif';
    encoder.createReadStream().pipe(fs.createWriteStream(gifname));

    encoder.start();
    encoder.setRepeat(-1);   // 0 for repeat, -1 for no-repeat
    encoder.setQuality(10); // image quality. 10 is default.
    encoder.setDelay((all_words.length/250)/all_words.length * 60 * 1000);  // frame delay in ms
    for (var i=0; i < all_words.length; i++) {
      ctx.drawImage(myImage, 0, 0, 600, 135);
      pivot(all_words[i])
      encoder.addFrame(ctx);
    }
    encoder.finish();
    callback();
}

// Find the red-character of the current word.
function pivot(word){
    var length = word.length;

    var bestLetter = 1;
    switch (length) {
        case 1:
            bestLetter = 1; // first
            break;
        case 2:
        case 3:
        case 4:
        case 5:
            bestLetter = 2; // second
            break;
        case 6:
        case 7:
        case 8:
        case 9:
            bestLetter = 3; // third
            break;
        case 10:
        case 11:
        case 12:
        case 13:
            bestLetter = 4; // fourth
            break;
        default:
            bestLetter = 5; // fifth
    };

    var start = word.slice(0, bestLetter-1);
    var middle = word.slice(bestLetter-1,bestLetter);
    var end = word.slice(bestLetter, length) + "\n";

    ctx.font = '81px Arial';
    var startwidth = ctx.measureText(start);
    var middlewidth = ctx.measureText(middle);
    var indent = 210-startwidth.width-middlewidth.width/2;
    ctx.fillText(start, indent, 95);
    ctx.fillStyle="#FF0000"
    ctx.fillText(middle, 210-middlewidth.width/2, 96);
    ctx.fillStyle="#000000"
    ctx.fillText(end, indent + startwidth.width + middlewidth.width, 96);
}

app.listen(port, function () {
  console.log('Listening on port ' +  port);
})
