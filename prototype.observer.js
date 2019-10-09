require('prototype.room');

StructureObserver.prototype.collect = 
    function() {
        // let homeroom = Game.rooms[observing];
        let homeroom = this.room;
        let observing = homeroom.memory.observing.shift();
        let obsRoom = Game.rooms[observing];

        if (obsRoom != undefined) {
            obsRoom.gatherIntel(homeroom.name);

            if (homeroom.memory.observing.length > 0) {
                this.observeRoom(homeroom.memory.observing[0]);
            }
        } else {
            homeroom.memory.observing.unshift(observing);
            this.observeRoom(observing);
        }
    }

StructureObserver.prototype.makeList =
    function() {
        let homeroom = this.room;
        homeroom.memory.observing = [];
        // console.log('hom')
        // console.log(homeroom.memory.observing.length)

        if (homeroom.memory.nearby != undefined) {
            for (let ruum of homeroom.memory.nearby) {
                // console.log(ruum)
                if (Memory.roomData[ruum] != undefined && Memory.roomData[ruum].type == 'unexplored') {
                    homeroom.memory.observing.unshift(ruum);
                } else if (Memory.roomData[ruum] != undefined && Memory.roomData[ruum].type != 'mine' && Memory.roomData[ruum].rescout <= Game.time) {
                    homeroom.memory.observing.push(ruum);
                }
            }
            for (let ruum in Memory.roomData) {
                if (homeroom.memory.nearby.indexOf(ruum) < 0 && Game.map.getRoomLinearDistance(homeroom.name, ruum) <= 10) {
                    homeroom.memory.observing.unshift(ruum);
                }
            }
        } else {
            homeroom.memory.nearby = []
        }

        if (homeroom.memory.observing.length == 1 && homeroom.memory.observing[0] == null) {
            homeroom.memory.observing = []
        }        

        if (homeroom.memory.observing.length > 0) {
            this.observeRoom(homeroom.memory.observing[0]);
        }
    }

StructureObserver.prototype.runRole =
    function() {
        if (this.room.memory.observing == undefined || this.room.memory.observing == null) {
            this.room.memory.observing = [];
        }
        // console.log(this.room.memory.observing)
        if (this.room.memory.observing.length == 0 && Game.time%10 == 0) {
            this.makeList();
            // console.log('checked list: ' + this.room.memory.observing.length + ' found');
        } else if (this.room.memory.observing.length > 0) {
            this.collect();
        }
    }