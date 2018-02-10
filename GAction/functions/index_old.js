'use strict';

const functions = require('firebase-functions');
const firebase = require('firebase');
const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;

var config = {
  apiKey: "AIzaSyASRdKqRbOboySlIowPqZvdiC2JMf4giM0",
  authDomain: "test2-15937.firebaseapp.com",
  databaseURL: "https://test2-15937.firebaseio.com",
  projectId: "test2-15937",
  storageBucket: "test2-15937.appspot.com",
  messagingSenderId: "600173537147"
};
firebase.initializeApp(config);

exports.greeting = functions.https.onRequest((req, res) => {
  const app = new ActionsSdkApp({request: req, response: res});
  
  function responseHandler (app) {
    // intent contains the name of the intent you defined in `initialTriggers`
    let intent = app.getIntent();

    const responses = ['Sounds great!', 'Will do!', 'Understood'];

    firebase.database().ref('/').set({
      intent: intent,
      rawMessage: app.getRawInput()
    });
    
    switch (intent) {
      case app.StandardIntents.MAIN:
        app.ask('Drony is airbourne. What do you want to do?', ['I didn\'t understand']);
        break;
      default:
        app.tell(responses[Math.floor(Math.random()*responses.length)]);
    }
  }
  
  app.handleRequest(responseHandler);
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((req, res) => {
  
  firebase.database().ref('/').set({
    request: req
  });
  
});