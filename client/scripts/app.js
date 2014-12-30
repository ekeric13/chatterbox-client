var app = {}

app.server = 'https://api.parse.com/1/classes/chatterbox'

app.init = function(){
  app.bindEvents();
  app.fetch();
  app.refreshMessageList();
}

app.send = function(message){
  var cleanMessage = app.cleanMessage(message);
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(cleanMessage),
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
    data : {'order':'-createdAt'},
    success: app.addAllMessages,
    error: function(data) {
      console.log("data error", data)
    }
  });
}

app.addAllMessages = function(data){
  _.each(data.results, app.addMessage);
}

app.clearMessages = function(){
  $("#chats").children().remove();
}

app.addMessage = function(message) {
  var temp = _.template("<div> <span><strong><%- username %></strong> : </span> <%- chatMessage %>  </div>");
  var appendee = temp({username: message.username, chatMessage: message.text});
  $("#chats").append(appendee);
}

app.refreshMessageList = function(){
  setInterval(function(){
    app.clearMessages();
    app.fetch();
  }, 5000);
}

app.triggerSend = function(e) {
  e.preventDefault();
  // var indexLetter = window.location.search.search(/[=]/gi) + 1
  // var username = window.location.search.substring(indexLetter);
// http://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
  // var username = window.location.search.gsub(/username=()/, '');
  var messageText = e.target[0].value;
  app.addMessage({username: "username", text: messageText});
  app.send({username: "username", text: messageText, roomname: "roomname"})
};

app.cleanMessage = function(message){
  message['username'] = _.escape(message.username);
  message['text'] = _.escape(message.text);
  message['roomname'] = _.escape(message.roomname);
  return message;
}

app.bindEvents = function() {
  $('#message-form').on('submit', app.triggerSend);
};

$(function() {
  app.init();
});
