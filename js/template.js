/* global TrelloPowerUp */
/* global firebase */

var WHITE_ICON = './images/icon-white.svg';
var GRAY_ICON = './images/icon-gray.svg';
var ROOM_ICON = './images/bed.png';
var EURO_ICON = './images/euro.png';

var Promise = TrelloPowerUp.Promise;

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

var boardButtonCallback = function(t){
  return t.popup({
    title: 'Popup List Example',
    items: [
      {
        text: 'Open Overlay',
        callback: function(t){
          return t.overlay({
            url: './overlay.html',
            args: { rand: (Math.random() * 100).toFixed(0) }
          })
          .then(function(){
            return t.closePopup();
          });
        }
      },
      {
        text: 'Open Board Bar',
        callback: function(t){
          return t.boardBar({
            url: './board-bar.html',
            height: 200
          })
          .then(function(){
            return t.closePopup();
          });
        }
      }
    ]
  });
};

var getAtHomeValue = function (t, options) {
  return t.card("attachments").get("attachments").map(function(t) {
      return t.url
  }).filter(function(t) {
      return t.indexOf('http://athome-properties') == 0
  }).then(function(e) {
      if(e.length > 0)
      {
        return firebase.database().ref(e[0].substring(7)).once('value');
      }
  });
}

var getBadges = function(t, options){
  return getAtHomeValue(t, options)
    .then(function(data){
      var val = data && data.val();
      if(val){
        return [
        {
          title: 'Rooms', // for detail badges only
          text: val['bedrooms_num'],
          icon: ROOM_ICON,
          color: 'yellow'
        },
        {
          title: 'Price', // for detail badges only
          text: Number(val['price']).toLocaleString(),
          icon: EURO_ICON,
          color: 'green'
        }];
      }
  });
};

var setKeyCallback = function(key, val) {
  var attachments = [{ 
      name: 'FirebaseKey', 
      url: "athome-properties/socoma/"+key,
    },
    { 
      name: val.title, 
      url: val.atHomeUrl,
  }];
  for (var i=1; i<=10;i++){
    if(val.pictures['picture'+i]) {
      attachments.push({ 
        name: 'picture'+i,
        url: val.pictures['picture'+i],
      });
    }
  }
  return function(t) {
    var promisses = attachments.map(function(attachement){t.attach(attachement);});
    Promise.all(promisses)
    .then(function(){
      return t.closePopup();
    })
  }
};

var cardButtonCallback = function(t){
  var items = [];
  return propertiesRef.once("value", function(data) {
    var vals = data.val();
    var keys = Object.keys(vals['socoma'])
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var val = vals['socoma'][key];
      var attachments = [{ 
      name: 'FirebaseKey', 
      url: "athome-properties/socoma/"+key,
        },
        { 
          name: val.title, 
          url: val.atHomeUrl,
      }];
      for (var j=1; j<=10;j++){
        if(val.pictures['picture'+j]) {
          attachments.push({ 
            name: 'picture'+j,
            url: val.pictures['picture'+j],
          });
        }
      }
      items.push({
        text: val.title,
        callback: setKeyCallback(key, val),
      });
    }
  }).then(function(){
    return t.popup({
      title: 'Announce Search',
      items: items,
      search: {
        count: 5,
        placeholder: 'Search for an Announce',
        empty: 'No annouce found'
    }})
  });
};

TrelloPowerUp.initialize({
  'attachment-sections': function(t, options){
    // options.entries is a list of the attachments for this card
    // you can look through them and 'claim' any that you want to
    // include in your section.
    
    // we will just claim urls for firebase and athome
    var claimed = options.entries.filter(function(attachment){
      return attachment.url.indexOf('http://athome-properties') == 0
    });

    // you can have more than one attachment section on a card
    // you can group items together into one section, have a section
    // per attachment, or anything in between.
    if(claimed && claimed.length > 0){
      // if the title for your section requires a network call or other
      // potentially length operation you can provide a function for the title
      // that returns the section title. If you do so, provide a unique id for
      // your section
      return [{
        icon: GRAY_ICON,
        title: 'Property information',
        claimed: claimed,
        content: {
          type: 'iframe',
          url: t.signUrl('./section.html'),
          height: 230
        }
      }];
    } else {
      return [];
    }
  },
  'attachment-thumbnail': function(t, options){
    if(options.url.indexOf('http://athome-properties') == 0){
      return [];
    }
    throw t.NotHandled();  
  },
  'board-buttons': function(t, options){
    return [{
      icon: WHITE_ICON,
      text: 'AtHome',
      callback: boardButtonCallback
    }];
  },
  'card-badges': function(t, options){
    return getBadges(t, options);
  },
  'card-buttons': function(t, options) {
    return [{
      icon: GRAY_ICON,
      text: 'AtHome Link',
      callback: cardButtonCallback
    }];
  },
  'card-detail-badges': function(t, options) {
    return getBadges(t, options);
  },
  'card-from-url': function(t, options) {
  },
  'format-url': function(t, options) {
  },
  'show-settings': function(t, options){
    return t.popup({
      title: 'Settings',
      url: './settings.html',
      height: 184
    });
  },
});
