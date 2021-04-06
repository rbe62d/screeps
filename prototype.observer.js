// require('prototype.room');

StructureObserver.prototype.collect = 
    function() {
        let homeroom = this.room;
        let observing = Memory.bases[homeroom.name].observing.shift();
        let obsRoom = Game.rooms[observing];

        if (obsRoom != undefined) {
            obsRoom.gatherIntel(homeroom.name);

            if (Memory.bases[homeroom.name].observing.length > 0) {
                this.observeRoom(Memory.bases[homeroom.name].observing[0]);
            }
        } else {
            Memory.bases[homeroom.name].observing.unshift(observing);
            this.observeRoom(observing);
        }
    }

StructureObserver.prototype.makeList =
    function() {
        let homeroom = this.room;
        Memory.bases[homeroom.name].observing = [];


        for (let roomname of Memory.rooms) {
            if (Game.map.getRoomLinearDistance(homeroom.name, ruum) <= 10) {
                if (Memory.rooms[roomname].type == 'unexplored') {
                    Memory.bases[homeroom.name].observing.unshift(roomname);
                } else if (Memory.rooms[roomname].type != 'base' && Memory.rooms[roomname].rescout <= Game.time) {
                    Memory.bases[homeroom.name].observing.push(roomname);
                }
            }
        }

        if (Memory.bases[homeroom.name].observing.length == 1 && Memory.bases[homeroom.name].observing[0] == null) {
            Memory.bases[homeroom.name].observing = []
        }        

        if (Memory.bases[homeroom.name].observing.length > 0) {
            this.observeRoom(Memory.bases[homeroom.name].observing[0]);
        }
    }

StructureObserver.prototype.runRole =
    function() {
        if (this.room.memory.observing == undefined || this.room.memory.observing == null) {
            this.room.memory.observing = [];
        }
        if (this.room.memory.observing.length == 0 && Game.time%10 == 0) {
            this.makeList();
        } else if (this.room.memory.observing.length > 0) {
            this.collect();
        }
    }