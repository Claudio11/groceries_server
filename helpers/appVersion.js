let AppVersionRoom  = {
    joinRoom(client, room){
        console.log('JOIN ROOM: ', room);
        client.appVersionRoom = room;
        client.join(client.appVersionRoom);  
    },
    leaveRoom(client, room) {
        console.log('LEAVE ROOM: ', room);
        client.leave(room);
        client.broadcast.to(room).emit('user-leave-room', client.id);
    },
    leaveCurrentRoom(client) {
        console.log('LEAVE CURRENT ROOM: ', client.appVersionRoom);
        if(client.appVersionRoom){
            client.leave(client.appVersionRoom);
            client.broadcast.to(client.appVersionRoom).emit('user-leave-room', client.id);
        }
    },
    getCurrentRoom(client) {
        return client.appVersionRoom;
    }
}

export default AppVersionRoom;