Room.prototype.gatherIntel =
    function(homeroomname = '') {
        if (Memory.roomData == undefined) {
            Memory.roomData = {}
        }
        if (Memory.roomData[this.name] == undefined) {
            Memory.roomData[this.name] = {};
        }

        let homeroom;
        if (homeroomname !== '') {
            homeroom = Game.rooms[homeroomname];
            // console.log("gather here");
            if (homeroom.memory.nearby == undefined) {
                // console.log("gather here 1");
                homeroom.memory.nearby = [];
            }
            // console.log(homeroom.memory.nearby)

            if (Game.map.getRoomLinearDistance(homeroomname, this.name) <= 10 && homeroom.memory.nearby.indexOf(this.name) < 0) {
                homeroom.memory.nearby.push(this.name);
            }
            // console.log("lel " + homeroom.memory.nearby)
        }

        let enemies = this.find(FIND_HOSTILE_CREEPS);
        let enemyStructures = this.find(FIND_HOSTILE_STRUCTURES);

        let foundsources = this.find(FIND_SOURCES);

        // let sourceids = [];
        Memory.roomData[this.name].sources = {}
        for (let source of foundsources) {
            // sourceids.push(source.id);
            Memory.roomData[this.name].sources[source.id] = {}
            Memory.roomData[this.name].sources[source.id].x = source.pos.x
            Memory.roomData[this.name].sources[source.id].y = source.pos.y
        }

        if (this.controller != undefined) {
            Memory.roomData[this.name].controller = {}
            Memory.roomData[this.name].controller.x = this.controller.pos.x
            Memory.roomData[this.name].controller.y = this.controller.pos.y
        }

        Memory.roomData[this.name].name = this.name;

        if (enemies.length > 1) {
            Memory.roomData[this.name].type = 'enemy';
            Memory.roomData[this.name].rescout = Game.time + 1500;
        } else if (this.controller != undefined && ((this.controller.owner != undefined && !this.controller.my) || (this.controller.reservation != undefined && !this.controller.my))) {
            Memory.roomData[this.name].type = 'enemy';
            Memory.roomData[this.name].rescout = Game.time + 1500;
        } else if (enemyStructures.length > 0 && this.controller != undefined && this.controller.owner == undefined && this.controller.reservation == undefined) {
            Memory.roomData[this.name].type = 'abandoned';
            Memory.roomData[this.name].rescout = Game.time + 300;
        } else if (this.controller != undefined && this.controller.my) {
            Memory.roomData[this.name].type = 'mine';
            Memory.roomData[this.name].rescout = Infinity;
        } else {
            Memory.roomData[this.name].type = 'explored';
            Memory.roomData[this.name].rescout = Game.time + 300;
        }

        this.addExits(homeroomname);
    }

Room.prototype.addExits =
    function(homeroomname) {
        let exits = []; 
        let squares = Game.map.describeExits(this.name);
        for (let tile in squares) {
            exits.push(squares[tile]);
        }

        for (let exit of exits) {
            if (Memory.roomData[exit] == undefined) {
                Memory.roomData[exit] = {};
                Memory.roomData[exit].type = 'unexplored';

            }
            if (homeroomname !== '') {
                let homeroom = Game.rooms[homeroomname];
                // console.log(homeroomname + ' ' + this.name);
                if (Game.map.getRoomLinearDistance(homeroomname, exit) <= 10 && homeroom.memory.nearby.indexOf(exit) < 0) {//!(exit in homeroom.memory.nearby)) {
                    homeroom.memory.nearby.push(exit);
                }
            }
        }
    }