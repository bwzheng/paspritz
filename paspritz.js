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
var port = process.env.PORT || 8080;

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'passenger_avenue') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

function sendGenericMessage(recipientId, messageText) {
  var messageData = {
      recipient: {
        id: recipientId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
              title: "rift",
              subtitle: "Next-generation virtual reality",
              item_url: "https://www.oculus.com/en-us/rift/",
              image_url: "http://messengerdemo.parseapp.com/img/rift.png",
              buttons: [{
                type: "web_url",
                url: "https://www.oculus.com/en-us/rift/",
                title: "Open Web URL"
              }, {
                type: "postback",
                title: "Call Postback",
                payload: "Payload for first bubble",
              }],
            }, {
              title: "touch",
              subtitle: "Your Hands, Now in VR",
              item_url: "https://www.oculus.com/en-us/touch/",
              image_url: "http://messengerdemo.parseapp.com/img/touch.png",
              buttons: [{
                type: "web_url",
                url: "https://www.oculus.com/en-us/touch/",
                title: "Open Web URL"
              }, {
                type: "postback",
                title: "Call Postback",
                payload: "Payload for second bubble",
              }]
            }]
          }
        }
      }
    };

    callSendAPI(messageData);

}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function sendAttachmentMessage(recipientId, messageText){
  var messageData = {
    recipient:{
      id:recipientId
    },
    "message":{
      "attachment":{
        "type":"image",
        "payload":{
          "url":messageText
        }
      }
    }
  }
  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      // console.error(response);
      // console.error(error);
    }
  });
}

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  var messageId = message.mid;
  var messageText = message.text;
  var messageAttachments = message.attachments;

  console.log(messageAttachments);
  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    if (messageAttachments[0].hasOwnProperty('url')) {
      request(messageAttachments[0].url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = extractor(body);
          spritzify(data.text, function () {
            cloudinary.uploader.upload(gifname, function(result) {
              console.log(result)
              fs.unlinkSync(gifname);
              sendAttachmentMessage(senderID, result.url);
            })
          });

        }
      })
    } else {
      sendTextMessage(senderID, "Message with attachment received");
    }

  }
  //console.log("Message data: ", event.message);

}

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
