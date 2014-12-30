var app = {}

var query = window.location.search;
app.username = _.escape(query.substring(query.indexOf('=') + 1, query.length));
app.userFriends = [];
app.rooms = [];
app.currentRoom;

app.server = 'https://api.parse.com/1/classes/chatterbox'

app.init = function(){
  app.bindEvents();
  app.fetch(function(data){
    app.addMessages(data);
    app.loadRooms(data);
  });
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

app.fetch = function(callback){
  $.ajax({
    url: app.server,
    type: 'GET',
    data : {'order':'-createdAt'},
    success: callback,
    error: function(data) {
      console.log("data error", data)
    }
  });
}

app.addMessages = function(data, roomFilter){
  if (!roomFilter){
    _.each(data.results.reverse(), app.addMessage);
  } else {
    var filtered = _.filter(data.results.reverse(), function(message){
      return message["roomname"] === roomFilter
    })
    _.each(filtered, app.addMessage);
  }
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

app.handleSubmit = function(e) {
  e.preventDefault();
  var messageText = $("#send input").val()
  app.addMessage({username: app.username, text: messageText});
  app.send({username: app.username, text: messageText, roomname: app.currentRoom});
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

app.addRoom = function(e) {
  e.preventDefault();

  var roomname = $("#new-room input").val()
  if (app.rooms.indexOf(roomname) === -1 ){
    app.rooms.push(roomname);
    var temp = _.template("<li> <a href='#' class='room'> <%- roomname %> </a> </li>")
    var roomToAdd = temp({roomname: roomname})
    $("#roomSelect").append(roomToAdd);
  } else {
    alert('Roomname already exists!');
  }

  app.currentRoom = roomname;
  $("#new-room input#room-value").val("");
}

app.filterRoomMessages = function(e){
  var roomname = e.target.innerText;

  // clear message
  app.clearMessages();
  // highlight roomname

  app.currentRoom = roomname;
  app.fetch(function(data) {
    app.addMessages(data, app.currentRoom);
  });

}

app.loadMessages = function(e){
  e.preventDefault();
  app.clearMessages();
  app.fetch(function(data){
    app.addMessages(data, app.currentRoom)
  })
}

app.loadRooms = function(data) {
  var temp = _.template("<li> <a href='#' class='room'> <%- roomname %> </a> </li>");
  var rooms = [];

  _.each(data.results, function(message){
    rooms.push(message["roomname"])
  })

  var uniqueRooms = rooms.filter(function(room, index){
    return rooms.indexOf(room) === index;
  });

  _.each(uniqueRooms, function(room){
    if (!(room === undefined) && !(room === "")) {
      var roomToAdd = temp({ roomname: room });
      $('#roomSelect').append(roomToAdd);
    }
  })

  // _.each(data.results, function(message) {
  //   // duplicate roomnames and null values
  //   console.log(message['roomname'])
  //   // our app.rooms is an empty array i think. it is only the ones we created. data.results gives us all the rooms in the from the chatroom
  //   if (!(message['roomname'] === undefined) || app.rooms.indexOf(message['roomname']) >= 0) {
  //     // var roomToAdd = temp({ roomname: message['roomname'] });
  //     // $('#roomSelect').append(roomToAdd);
  //   }
  // });
};

app.bindEvents = function() {
  $(document).on('submit', '#send', app.handleSubmit);
  $(document).on('click', '.username', app.addFriend);
  $(document).on("submit", "#new-room", app.addRoom);
  $(document).on("click", ".room", app.filterRoomMessages)
  $(document).on("click", "#load-messages", app.loadMessages)
};

$(function() {
  app.init();
});
