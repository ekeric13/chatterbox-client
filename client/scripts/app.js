var app = {}

app.server = 'https://api.parse.com/1/classes/chatterbox'

app.init = function(){
  app.fetch();
  setInterval(app.fetch, 1000);
}

app.send = function(message){
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
}

app.fetch = function(){
  $.ajax({
    url: app.server,
    type: 'GET',
    success: app.addAllMessages,
    error: function(data) {
      console.log("data error", data)
    }
  });
}

app.addAllMessages = function(data){
  var results = data.results
  for (var i = 0; i < results.length; i++){
    app.addMessage(results[i])
  }
}

app.clearMessages = function(){
  $("#chats").children().remove();
}

app.addMessage = function(message) {
  var temp = _.template("<div> <span><strong><%- username %></strong> : </span> <%- chatMessage %>  </div>");
  var appendee = temp({username: message.username, chatMessage: message.text});
  $("#chats").append(appendee);
}

$(function() {
  app.init();
});
