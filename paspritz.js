//Lets require/import the HTTP module
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var randomstring = require("randomstring");
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
var imgur = require('imgur');
imgur.setCredentials('bowenzheng1998@gmail.com', 'passengeravenue2016', '4850c7facaa6e89');
//Lets define a port we want to listen to
var port = process.env.PORT || 8080;

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === <VERIFY_TOKEN>) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.post('/webhook', function (req, res) {
  res.send({
    speech: "Just a second",
    displayText: "Just a second"
  });
  var intent = req.body.result.metadata.intentName
  var params = req.body.result.parameters
  if (intent == "Do url"){
    request(params.url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = extractor(body);
        spritzify(data.text, function () {
          imgur.uploadFile(gifname)
            .then(function (json) {
                console.log(json.data.link);
                fs.unlinkSync(gifname);
                res.send({
                  speech: "Here's the article",
                  displayText: json.data.link,
                  source: "Imgur"
                });
            })
            .catch(function (err) {
                console.error(err.message);
                fs.unlinkSync(gifname);
                res.send({
                  speech: "Something's wrong, please try again.",
                  displayText: "Something's wrong, please try again.",
                });
            });
        });

      }
    })
  }


})

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
    callback()
    // var currentWord = 0;
    // var running = true;
    // var spritz_timers = new Array();
    //
    // document.getElementById("spritz_toggle").addEventListener("click", function() {
    //     if(running) {
    //         stopSpritz();
    //     } else {
    //         startSpritz();
    //     }
    // });

    // function updateValues(i) {
    //
    //     var p = pivot(all_words[i]);
    //     // document.getElementById("spritz_result").innerHTML = p;
    //     currentWord = i;
    //     return p
    //
    // }

    // function startSpritz() {
    //
    //     document.getElementById("spritz_toggle").style.display = "block";
    //     document.getElementById("spritz_toggle").textContent = "Pause";
    //
    //     running = true;
    //
    //     spritz_timers.push(setInterval(function() {
    //         updateValues(currentWord);
    //         currentWord++;
    //         if(currentWord >= all_words.length) {
    //             currentWord = 0;
    //             stopSpritz();
    //         }
    //     }, ms_per_word));
    // }
    //
    // function stopSpritz() {
    //     for(var i = 0; i < spritz_timers.length; i++) {
    //         clearTimeout(spritz_timers[i]);
    //     }
    //
    //     document.getElementById("spritz_toggle").textContent = "Play";
    //     running = false;
    // }
    //
    // startSpritz();
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
