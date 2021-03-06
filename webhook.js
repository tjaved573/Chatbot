
// - Have a bot which can pull out information about movies (use IMDB API), 
// novels (Goodreads API), news and weather (BBC API).
// deploy it on heroku


const express = require('express');
const bodyParser= require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000;
const apiaiApp = require('apiai')('a91d1df9e36c4916ab59741dcfba0e4c');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


const server = app.listen(PORT, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
    console.log('Address of server is ', server.address());
  });

app.get('/webhook', (req, res) => {  // The server response functions are stored in the res parameter; How server responds
                                     // req is a variable that stores all the information for the incoming request from the client

  let challenge = req.query['hub.challenge'];
  let VERIFY_TOKEN = "123";
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === VERIFY_TOKEN){
    console.log('WEBHOOK_VERIFIED');
    // res.status(200).send('Event Received')  
    res.status(200).send(challenge); // 200 - OK, return challenge if tokens match
  }else {
    console.log("enters here ", req.query['hub.verify_token']); // print the verify token
    res.sendStatus(401);  // Unauthorized token,
  }
});

// REQUEST BODY (req): DATA SENT BY THE CLIENT TO THE SERVER
app.post('/webhook', (req, res) => {
  console.log("request body = ", req.body);
  if (req.body.object === 'page'){    // checks if this is an event from a page subscription
    req.body.entry.forEach((entry) => {
      let webhook_event = entry.messaging[0];
      console.log("Webhook event: ", webhook_event);
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text){
          sendMessage(event);
        }
      });
    });
    res.status(200).send('EVENT_RECEIVED');   // OK response
  } else{
    res.sendStatus(404);  // PageNotFound token
  }
});

// SEND BACK MSG (POST) TO THE CLIENT FROM SERVER
// RESPONSE BODY(res): DATA SENT BY THE API TO THE CLIENT
const request = require('request');
function sendMessage(event){
    let sender = event.sender.id;
    let text = event.message.text;

    // Echo User Message Back
    // request({
    //   url: 'https://graph.facebook.com/v2.6/me/messages',
    //   qs: {access_token: 'EAAnOvWxAGJwBAFVDuLV9XBtNpLlhAt57vJntZC6CjirUbfxBwekJJ2msw9K8QKvk6jhxZC1mmqrhYJh8wMTvMxLigxicXUnH6uVK18YsVR5OPzRNRpJZCSVxiZAMxUm1kJYVfacWQaoZBSPhL5PZB7oavYe09DDrZBiYDR2fy2ICgZDZD'},
    //   method: 'POST',
    //   json: {
    //     recipient: {id: sender},
    //     message: {text: text}
    //   }
    // }, function (error, response) {
    //   if (error) {
    //       console.log('Error sending message: ', error);
    //   } else if (response.body.error) {
    //       console.log('Error: ', response.body.error);
    //   }
    // });

  // Small talk using apiai  
  // integrate call to DialogFlow
    let apiai = apiaiApp.textRequest(text, {
      sessionId: 'tabby_cat' // use any arbitrary id
    });

    apiai.on('response', (response) => {
      // Got a response from api.ai. Let's POST to Facebook Messenger
      let aiText = response.result.fulfillment.speech;

      request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: 'EAAnOvWxAGJwBAEdaNe9uKE87t1D2tgqOto9xscYrynwkAOTWTsEvaabq1OeZANm67XJraIkjueS8jrrCRsExeAqq0TdKgz4nQaMmeKZB2IpZAmCC6TtWIFO2NsCvmDwQ95wKlerZAZA54uzkQUvr1lAB5KD4A22TOGPInHZCoZC8wZDZD'},
        method: 'POST',
        json: {
          recipient: {id: sender},
          message: {text: aiText}
        }
      }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
      });
    });

    apiai.on('error', (error) => {
      console.log(error);
    });

    apiai.end();
}

// deploy to heroku:

