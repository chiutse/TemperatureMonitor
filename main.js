var http = require('http');
var url = require('url');
var querystring = require('querystring');
var port = 3000;
var server;
var token = "P7zlANXN30KXQHaDzzjorQ=="; // token for 

var latestUpdateTime = "";
var currentTemp = "1";
var currentHum = "1";

var emailAddress = "<EMAIL>";
var tempWarning = 40;
var humWarning = 90;

var saveJson = false;
var saveJsonPath = "C:\\data.json";

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '<YOUR GMAIL ACCOUNT>',
      pass: '<YOUR GMAIL PASSWORD>'
    }
  });

server = http.createServer((req, res) => {
    console.log("Request from " + req.connection.remoteAddress);
    var body = "";
    var q = url.parse(req.url, true);
    var data = q.query;

    if (token == data.token && data.temp && data.hum) {
        latestUpdateTime = new Date();
        currentTemp = data.temp;
        currentHum = data.hum;

        console.log("Updated.");
        console.log(">" + data.temp + "C " + data.hum + "% @ " + latestUpdateTime );        

        if(currentTemp >= tempWarning)
        {
            SendEmail("[TemperatureMonitor] Temperature Warning", "Temperature : " + currentTemp + " @ " + latestUpdateTime);
        }
        if(currentHum >= humWarning)
        {
            SendEmail("[TemperatureMonitor] Humidity Warning", "Humidity : " + currentHum + " @ " + latestUpdateTime);
        }

        if(saveJson)
        {
            SaveAsJson();
        }
    }

    req.on('data', function (chunk) {
        body += chunk;
    });

    req.on('end', function () {
        body = querystring.parse(body);
        res.statusCode = 200;
        if (data.format == "json") {
            res.setHeader('Content-Type', 'application/json;charset=utf8');
            res.write("{");
            res.write("\"key\":\"1\",\"label\":\"Server\",");
            res.write("\"temp\":\"" + currentTemp + "\",\"hum\":\"" + currentHum + "\",\"date\":\"" + latestUpdateTime + "\"");
            res.write("}");
            res.end("");
        }
        else {
            res.setHeader('Content-Type', 'text/html;charset=utf8');
            res.write("<html><head><title>Temperature Monitor</title></head><body>")
            res.write("== Temperature Monitor ==");
            res.write("<br>");
            res.write("TEMPERATURE : " + currentTemp + "<br> HUMIDITY : " + currentHum + "% <br> " + latestUpdateTime + "<br>");
            res.write("</body></html>");
            res.end("");
        }
    });
});

server.listen(port, () => {
    console.log('Listening on port ' + port);
});

function SendEmail(subject, text)
{
    var mailOptions = {
        from: '"Temperature Monitor" <routertomail@gmail.com>',
        to: emailAddress,
        subject: subject,
        text: text
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });    
}

function SaveAsJson()
{
    var jsondata = "{" + "\"key\":\"1\",\"label\":\"Server\"," + "\"temp\":\"" + currentTemp + "\",\"hum\":\"" + currentHum + "\",\"date\":\"" + latestUpdateTime + "\"}";
    var fs = require('fs');
    fs.writeFile(saveJsonPath, jsondata, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("Saved.");
    });     
}