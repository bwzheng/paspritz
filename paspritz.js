//Lets require/import the HTTP module
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var randomstring = require("randomstring");
var path = require('path');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
var extractor = require('unfluff');
var sharp = require('sharp');
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
const PORT=80;

app.post('/webhook', function (req, res) {
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


//We need a function which handles requests and send response
function handleRequest(request, response){
    var text = "If you look up 'tea' in the first cookery book that comes to hand you will probably find that it is unmentioned; or at most you will find a few lines of sketchy instructions which give no ruling on several of the most important points. This is curious, not only because tea is one of the main stays of civilization in this country, as well as in Eire, Australia and New Zealand, but because the best manner of making it is the subject of violent disputes. When I look through my own recipe for the perfect cup of tea, I find no fewer than eleven outstanding points. On perhaps two of them there would be pretty general agreement, but at least four others are acutely controversial. Here are my own eleven rules, every one of which I regard as golden: First of all, one should use Indian or Ceylonese tea. China tea has virtues which are not to be despised nowadays — it is economical, and one can drink it without milk — but there is not much stimulation in it. One does not feel wiser, braver or more optimistic after drinking it. Anyone who has used that comforting phrase 'a nice cup of tea' invariably means Indian tea. Secondly, tea should be made in small quantities — that is, in a teapot. Tea out of an urn is always tasteless, while army tea, made in a cauldron, tastes of grease and whitewash. The teapot should be made of china or earthenware. Silver or Britanniaware teapots produce inferior tea and enamel pots are worse; though curiously enough a pewter teapot (a rarity nowadays) is not so bad. Thirdly, the pot should be warmed beforehand. This is better done by placing it on the hob than by the usual method of swilling it out with hot water. Fourthly, the tea should be strong. For a pot holding a quart, if you are going to fill it nearly to the brim, six heaped teaspoons would be about right. In a time of rationing, this is not an idea that can be realized on every day of the week, but I maintain that one strong cup of tea is better than twenty weak ones. All true tea lovers not only like their tea strong, but like it a little stronger with each year that passes — a fact which is recognized in the extra ration issued to old-age pensioners. Fifthly, the tea should be put straight into the pot. No strainers, muslin bags or other devices to imprison the tea. In some countries teapots are fitted with little dangling baskets under the spout to catch the stray leaves, which are supposed to be harmful. Actually one can swallow tea-leaves in considerable quantities without ill effect, and if the tea is not loose in the pot it never infuses properly. Sixthly, one should take the teapot to the kettle and not the other way about. The water should be actually boiling at the moment of impact, which means that one should keep it on the flame while one pours. Some people add that one should only use water that has been freshly brought to the boil, but I have never noticed that it makes any difference. Seventhly, after making the tea, one should stir it, or better, give the pot a good shake, afterwards allowing the leaves to settle. Eighthly, one should drink out of a good breakfast cup — that is, the cylindrical type of cup, not the flat, shallow type. The breakfast cup holds more, and with the other kind one's tea is always half cold before one has well started on it. Ninthly, one should pour the cream off the milk before using it for tea. Milk that is too creamy always gives tea a sickly taste. Tenthly, one should pour tea into the cup first. This is one of the most controversial points of all; indeed in every family in Britain there are probably two schools of thought on the subject. The milk-first school can bring forward some fairly strong arguments, but I maintain that my own argument is unanswerable. This is that, by putting the tea in first and stirring as one pours, one can exactly regulate the amount of milk whereas one is liable to put in too much milk if one does it the other way round. Lastly, tea — unless one is drinking it in the Russian style — should be drunk without sugar. I know very well that I am in a minority here. But still, how can you call yourself a true tealover if you destroy the flavour of your tea by putting sugar in it? It would be equally reasonable to put in pepper or salt. Tea is meant to be bitter, just as beer is meant to be bitter. If you sweeten it, you are no longer tasting the tea, you are merely tasting the sugar; you could make a very similar drink by dissolving sugar in plain hot water. Some people would answer that they don't like tea in itself, that they only drink it in order to be warmed and stimulated, and they need sugar to take the taste away. To those misguided people I would say: Try drinking tea without sugar for, say, a fortnight and it is very unlikely that you will ever want to ruin your tea by sweetening it again. These are not the only controversial points to arise in connexion with tea drinking, but they are sufficient to show how subtilized the whole business has become. There is also the mysterious social etiquette surrounding the teapot (why is it considered vulgar to drink out of your saucer, for instance?) and much might be written about the subsidiary uses of tealeaves, such as telling fortunes, predicting the arrival of visitors, feeding rabbits, healing burns and sweeping the carpet. It is worth paying attention to such details as warming the pot and using water that is really boiling, so as to make quite sure of wringing out of one's ration the twenty good, strong cups of that two ounces, properly handled, ought to represent."
    spritzify(text)
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write('<img src="' + canvas.toDataURL() + '" />');
    response.end();
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
    console.log("Hey");
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

app.listen(PORT, function () {
  console.log('Listening on port 80!')
})
