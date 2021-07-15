//Global Variables
const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const server = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
});
const io = require('socket.io')(server, {
    cors: {
        origin: "*"
    }
});

var i = -1;
var users = [];
var messages = [];
var userLists = [];

io.on('connection', (socket) => {
    i++;
    console.log(`user connected ${i}`);

    socket.on('serverConnect', (response) => {
        let wtId = response.wtId;
        let master = false

        if (wtId == null) {
            wtId = socket.id;
            wtId += ("room" + i);
        }

        if (io.sockets.adapter.rooms.get(wtId) == undefined) {
            master = true;
        }

        var user = { wtId: wtId, username: response.username, userId: socket.id, master: master };

        users.push(user);

        socket.join(user.wtId);

        url = "https://www.youtube.com/watch?v=" + response.videoId + "&wt=" + user.wtId;

        socket.emit("data", { username: user.username, wtId: user.wtId, url: url, userId: user.userId, master: master });

        socket.broadcast.to(user.wtId).emit("message", { username: user.username, message: { name: user.username, message: ' has joined!', type: "createjoinleave" } });
        socket.broadcast.to(user.wtId).emit("newUser", { user: user });

        const messageObj = messages.find(msg => msg.wtId == user.wtId);
        if (messageObj != null) {
            messageObj.userCount++;
            messageObj.message.push({ name: user.username, message: ' has joined!', type: "createjoinleave" });
        } else {
            messages.push({ wtId: user.wtId, userCount: 1, message: [{ name: user.username, message: ' has joined!', type: "createjoinleave" }] });
        }

        const userObj = userLists.find(list => list.wtId == user.wtId);
        if (userObj != null) {
            userObj.userCount++;
            userObj.users.push(user);
        } else {
            userLists.push({ wtId: user.wtId, userCount: 1, users: [user] });
        }
    });

    socket.on('message', (message) => {
        const user = users.find(user => user.userId == message.userId);
        const messageObj = messages.find(msg => msg.wtId == message.wtId);

        messageObj.message.push(message.message);

        socket.broadcast.to(user.wtId).emit('message', message);
    });

    socket.on('getMessages', (response) => {
        const messageArr = messages.find(msg => msg.wtId == response.wtId);

        socket.emit("messages", messageArr);
    });

    socket.on('vidData', (response) => {
        socket.broadcast.to(response.wtId).emit('vidData', response);
    });

    socket.on('userList', (response) => {
        let list = userLists.find(list => list.wtId == response.wtId);

        socket.emit("userList", { userList: list.users });
    });

    socket.on('changeUsername', (response) => {
        let user = users.find(user => user.userId == response.userId);

        let oldName = user.username;

        user.username = response.name;

        let msg = `${oldName} has changed their username to ${user.username}`;

        socket.emit('newName', { name: user.username });
        socket.emit("message", { username: user.username, message: { name: user.username, message: msg, type: "changeUsername" } });

        socket.broadcast.to(response.wtId).emit("message", { username: user.username, message: { name: user.username, message: msg, type: "changeUsername" } });

        const messageObj = messages.find(message => message.wtId == response.wtId);

        messageObj.message.push({ name: user.username, message: msg, type: "changeUsername" });

        let list = userLists.find(list => list.wtId == response.wtId);

        socket.emit("newUserList", { userList: list.users });
        socket.broadcast.to(response.wtId).emit("newUserList", { userList: list.users });
    });

    socket.on('changeMaster', (response) => {
        let oldMaster = users.find(user => user.userId == response.userId);
        let newMaster = users.find(user => user.userId == response.userIdChange);

        oldMaster.master = false;
        newMaster.master = true;

        let msg = `${newMaster.username} has been set to master`;

        socket.broadcast.to(response.wtId).emit("message", { username: newMaster.username, message: { name: newMaster.username, message: msg, type: "createjoinleave" } });
        socket.emit("message", { username: newMaster.username, message: { name: newMaster.username, message: msg, type: "createjoinleave" } });

        socket.broadcast.to(response.userIdChange).emit("masterControls", { master: newMaster.master });
        socket.emit("masterControls", { master: oldMaster.master });

        const messageObj = messages.find(message => message.wtId == response.wtId);
        messageObj.message.push({ name: newMaster.username, message: msg, type: "createjoinleave" });

        let list = userLists.find(list => list.wtId == response.wtId);

        socket.emit("newUserList", { userList: list.users });
        socket.broadcast.to(response.wtId).emit("newUserList", { userList: list.users });
    });

    socket.on('sendDisconnect', (response) => {
        const user = users.find(user => user.userId == response.userId);

        const messageObj = messages.find(msg => msg.wtId == response.wtId);

        messageObj.userCount--;

        if (messageObj.userCount == 0) {
            messages = messages.filter(msg => msg.wtId != response.wtId);
            console.log("Messages deleted");
        } else {
            messageObj.message.push({ name: user.username, message: ' has left!', type: "createjoinleave" });
        }

        let userObj = userLists.find(list => list.wtId == response.wtId);

        userObj.users = userObj.users.filter(id => id.userId != response.userId);

        userObj.userCount--;

        if (userObj.userCount == 0) {
            userLists = userLists.filter(list => list.wtId != response.wtId);
        } else {
            if (user.master) {
                userObj.users[0].master = true;

                socket.broadcast.to(response.wtId).emit("newUserList", { userList: userObj.users });
                io.to(userObj.users[0].userId).emit("setMaster", {});

                socket.broadcast.to(response.wtId).emit('message', { wtId: response.wtId, message: { name: userObj.users[0].username, message: ' has been set to master', type: "createjoinleave" } });
            }
        }

        socket.broadcast.to(response.wtId).emit('message', { wtId: response.wtId, message: { name: user.username, message: ' has left!', type: "createjoinleave" } });
        console.log(`user left ${user.username}`);

        users = users.filter(user => user.userId != response.userId);
    });
});