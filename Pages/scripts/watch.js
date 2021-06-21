const chatcontainer = document.getElementById('chat');

var addMessage = function(name, type, message) {
    if (type == "createjoinleave") {
        let chatMessage = '<p id="message"><i><b>' + name + '<b> ' + message + '</i></p>';
        chatcontainer.innerHTML += chatMessage;
    }
};

addMessage("HIIIII", "createjoinleave", "Hello");
addMessage("Omar", "createjoinleave", "Hello");