console.log('the  bot is starting');
var http = require('http');
var request = require('request');
var Twit = require('twit');
var fs = require('fs');
var exec = require('child_process').exec;
var T = new Twit({
  consumer_key:         'o2oNMNOMxrSEl2G6vssDIBvKY',
  consumer_secret:      'C88cwSKh9pBlU3XMrawauH6oCa1Jjy0UVxaFrA09ZEoGTcUehK',
  access_token:         '929418220620173313-4XW58UTD2a4fdNm89Xqg1pm0d0YDME0',
  access_token_secret:  'ZtiALdKjya5btd8WZlFvYfsNGTjYaY2t3rpYgV9hzfzTZ',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
})

var url = 'https://www.reddit.com/r/aww.json';
var picUrl;
var parsedJSON;
var prevURLs = ['a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a','a'];

tweetIt();
setInterval(tweetIt, 1000*60*60*5);
function tweetIt()
{
  request(url, function (error, response, body)
  {
    parsedJSON = JSON.parse(body);

    var picFound = false;
    var i = 2;
    while (!picFound)
    {
      var picUrl = parsedJSON.data.children[i].data.url
      var len = picUrl.length;
      var sstring = picUrl.substring(len - 3, len);
      console.log(sstring);
      var recentlyPosted = false;
      for (var j = 0; j < prevURLs.length; j++)
        if (prevURLs[j] === picUrl)
        {
          recentlyPosted = true;
          break;
        }
      if (sstring === 'jpg' && !recentlyPosted)
        picFound = true;
      else
        i++;
    }
    prevURLs.pop();
    prevURLs.unshift(picUrl);
    console.log(prevURLs);
    console.log(i);
//    picUrl = parsedJSON.data.children[i].data.url;
    var uid = parsedJSON.data.children[i].data.author;
    console.log(picUrl);
    var cmd = 'java DownloadImage ' + picUrl;
    exec(cmd, processing);

    function processing()
    {
      if (sstring === 'jpg')
        var filename = 'image.jpg';
      else if (sstring === 'png')
        var filename = 'image.png';
      var params =
      {
        encoding: 'base64'
      }
      var b64content = fs.readFileSync(filename, params);
      T.post('media/upload', {media_data: b64content},uploaded);

      function uploaded(err, data, response)
      {
        if (err) console.log('1 ' + err);
        var id = data.media_id_string;
        console.log(id);
        var tweet =
        {
          media_ids: [id],
          status: 'u/' + uid
        }
        T.post('statuses/update', tweet ,tweeted);
        function tweeted(err,data,response) //callback function for when the picture is tweeted
        {
          if (err)
            console.log(err);
        }
      }
    }
  });
}
