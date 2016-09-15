/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;
var t = TrelloPowerUp.iframe();

var repoInput = document.getElementById('repourl');

t.render(function(){
  return Promise.all([
    t.get('board', 'shared','repoURL'),
  ])
  .spread(function(repoURL){
    repoInput.value = repoURL;
  })
  .then(function(){
    t.sizeTo('#content')
    .done();
  })
});

document.getElementById('save').addEventListener('click', function(){
  return t.set('board', 'shared','repoURL', repoInput.value)
            .then(function(){
              t.closePopup();
            })
})
