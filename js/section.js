/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();

var config = {
    apiKey: "AIzaSyAFzkiNICNkype3L2V_j8QJPJ8YZ1-Omno",
    authDomain: "athome-scrapper.firebaseapp.com",
    databaseURL: "https://athome-scrapper.firebaseio.com",
    //storageBucket: "<BUCKET>.appspot.com",
};
firebase.initializeApp(config);
var db = firebase.database();
var announcersRef = db.ref("athome-announcers");
var propertiesRef = db.ref("athome-properties");

t.render(function(){
  // make sure your rendering logic lives here, since we will
  // recall this method as the user adds and removes attachments
  // from your section
  t.card('attachments')
  .get('attachments')
  .filter(function(attachment){
    return attachment.url.indexOf('http://athome-properties') == 0;
  })
  .then(function(e){
    var ref = db.ref(e[0].url.substring(7));
    ref.on('value', function(snapshot) {
      var val = snapshot.val();
      if(val){
        document.getElementById('link').setAttribute('href',val.atHomeUrl);
        document.getElementById('desc').innerHTML = val.description;
      }
      t.sizeTo('#content');
    });
  });
});
