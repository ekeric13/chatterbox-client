var app = {}

var query = window.location.search;
app.username = _.escape(query.substring(query.indexOf('=') + 1, query.length));
app.userFriends = [];

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
  _.each(data.results.reverse(), app.addMessage);
}

app.clearMessages = function(){
  $("#chats").children().remove();
}

app.addMessage = function(message) {
  var temp = _.template("<div> <span class='username'><%- username %>: </span> <%- chatMessage %>  </div>");
  _.each(app.userFriends, function(username) {
    if (message['username'] === username) {
      temp = _.template("<div> <span class='username'><strong><%- username %>:</strong> </span> <%- chatMessage %>  </div>");
    }
  });
  var messageToAdd = temp({username: message.username, chatMessage: message.text});
  $("#chats").prepend(messageToAdd);
}

app.refreshMessageList = function(){
  setInterval(function(){
    app.clearMessages();
    app.fetch();
  }, 5000);
}

app.handleSubmit = function(e) {
  e.preventDefault();
  var messageText = $("#send input").val()
  app.addMessage({username: app.username, text: messageText});
  app.send({username: app.username, text: messageText, roomname: "roomname"});
  $("#send input#message-value").val("");
};

app.cleanMessage = function(message){
  message['username'] = app.username;
  message['text'] = _.escape(message.text);
  message['roomname'] = _.escape(message.roomname);
  return message;
}

app.addFriend = function(e) {
  e.preventDefault();
  var friendUsername = e.target.innerText.substring(0, e.target.innerText.length - 2);
  app.userFriends.push(friendUsername);
}

app.bindEvents = function() {
  $(document).on('submit', '#send', app.handleSubmit);
  $(document).on('click', '.username', app.addFriend);
};

$(function() {
  app.init();
});
