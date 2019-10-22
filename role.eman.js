module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // let fix = creep.memory.working;
        // if (Math.floor(Math.random() * 10) == 0) {
        //     creep.memory.working = !creep.memory.working;
        // }

        // let structs = _.filter(Game.structures, s => s.room.name == creep.room.name && s.structureType != STRUCTURE_LINK && s.structureType != STRUCTURE_STORAGE && s.store != undefined && s.store.getFreeCapacity(RESOURCE_ENERGY) > 100);
        // let waitpos = new RoomPosition(creep.room.memory.anchor['x']+2, creep.room.memory.anchor['y']-3, creep.room.name)

        // // console.log(structs.length)

        // if (creep.room.energyCapacityAvailable != creep.room.energyAvailable && creep.store.getUsedCapacity() == 0 && creep.room.storage != undefined && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
        //     // console.log('here');
        //     let err = creep.withdraw(creep.room.storage, RESOURCE_ENERGY, Math.min(creep.store.getCapacity(), creep.room.energyCapacityAvailable - creep.room.energyAvailable, creep.room.storage.store[RESOURCE_ENERGY]));
        //     if(err == ERR_NOT_IN_RANGE) {
        //         creep.travelTo(creep.room.storage, {ignoreCreeps: fix, visualizePathStyle: {stroke: '#ffaa00'}});
        //     } else {
        //         // let waitpos = new RoomPosition(creep.room.memory.anchor['x']+1, creep.room.memory.anchor['y']-1, creep.room.name)
        //         if (!creep.pos.isEqualTo(waitpos)) {
        //             creep.travelTo(waitpos, {ignoreCreeps: fix});
        //         }
        //     }
        // } else if (creep.store.getCapacity() > 0 && creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
        //     // creep.depositEnergy();
        //     creep.fillExtensions();
        // } else if (structs.length > 0) {// && creep.room.storage != undefined && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
        //     // console.log('here structs')
        //     if(creep.store.getUsedCapacity() == 0 && creep.room.storage != undefined && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
        //         // console.log('hello')
        //         let deficit = 0;
        //         // console.log('here:' + deficit);
        //         // console.log(deficit)
        //         for (let tower of structs) {
        //             deficit += tower.store.getFreeCapacity(RESOURCE_ENERGY);
        //         }
        //         let err = creep.withdraw(creep.room.storage, RESOURCE_ENERGY, Math.min(creep.store.getCapacity(), deficit, creep.room.storage.store[RESOURCE_ENERGY]));
        //         // console.log('here:' + deficit + ' ' + Game.time);
        //         // console.log(deficit)
        //         if(err == ERR_NOT_IN_RANGE) {
        //             creep.travelTo(creep.room.storage, {ignoreCreeps: fix, visualizePathStyle: {stroke: '#ffaa00'}});
        //         } else {
        //             // let waitpos = new RoomPosition(creep.room.memory.anchor['x']+1, creep.room.memory.anchor['y']-1, creep.room.name)
        //             // let waitpos = new RoomPosition(this.pos.x-2, this.pos.y+2, this.room.name)
        //             if (!creep.pos.isEqualTo(waitpos)) {
        //                 creep.travelTo(waitpos, {ignoreCreeps: fix});
        //             }
        //         }
        //     } else if (creep.store.getUsedCapacity() > 0) {
        //         // console.log('fug' + Game.time)
        //         creep.depositEnergy();
        //         // let tower = creep.pos.findClosestByPath(structs);
        //         // if(creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        //         //     creep.travelTo(tower, {ignoreCreeps: fix, visualizePathStyle: {stroke: '#ffaa00'}});
        //         // }
        //     } else {
        //         // let waitpos = new RoomPosition(creep.room.memory.anchor['x']+1, creep.room.memory.anchor['y']-1, creep.room.name)
        //         // let waitpos = new RoomPosition(this.pos.x-2, this.pos.y+2, this.room.name)
        //         if (!creep.pos.isEqualTo(waitpos)) {
        //             creep.travelTo(waitpos, {ignoreCreeps: fix});
        //         }
        //     }
        // } else if (creep.room.terminal != undefined && creep.room.terminal.store[RESOURCE_ENERGY] < creep.room.terminal.store.getCapacity()*0.3) {
        //     if (creep.store.getUsedCapacity() == 0) {
        //         if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY, Math.min(creep.carryCapacity, creep.room.terminal.store.getCapacity()*0.3 - creep.room.terminal.store[RESOURCE_ENERGY], creep.room.storage.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) {
        //             creep.travelTo(waitpos, {ignoreCreeps: fix})
        //         }
        //     } else {
        //         if (creep.transfer(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        //             creep.travelTo(waitpos, {ignoreCreeps: fix})
        //         }
        //     }
        // } else {
        //     // let waitpos = new RoomPosition(this.pos.x-2, this.pos.y+2, this.room.name)
        //     if (!creep.pos.isEqualTo(waitpos)) {
        //         creep.travelTo(waitpos, {ignoreCreeps: fix});
        //     }
        // }

        let waitpos = new RoomPosition(creep.room.memory.anchor['x']+2, creep.room.memory.anchor['y']-3, creep.room.name)
        let room = creep.room;
        let towers = room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 100});
        let nuker = room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_NUKER})[0];
        let labs = room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_LAB});

        if (room.energyAvailable != room.energyCapacityAvailable) {
            if (creep.store[RESOURCE_ENERGY] > 0) {
                creep.fillExtensions();
            } else {
                if (room.terminal != undefined && room.terminal.store[RESOURCE_ENERGY] > room.storage.store[RESOURCE_ENERGY]) {
                    if (creep.withdraw(room.terminal, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(RESOURCE_ENERGY), room.terminal.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(room.terminal);
                    }
                } else if (room.storage.store[RESOURCE_ENERGY] > 0) {
                    if (creep.withdraw(room.storage, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(RESOURCE_ENERGY), room.storage.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(room.storage);
                    }
                } else if (!creep.pos.isEqualTo(waitpos)) {
                    creep.travelTo(waitpos);
                }
            }
        } else if (towers.length > 0) {
            if (creep.store[RESOURCE_ENERGY] > 0) {
                creep.depositEnergy();
            } else {
                if (room.terminal != undefined && room.terminal.store[RESOURCE_ENERGY] > room.storage.store[RESOURCE_ENERGY]) {
                    if (creep.withdraw(room.terminal, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(RESOURCE_ENERGY), room.terminal.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(room.terminal);
                    }
                } else if (room.storage.store[RESOURCE_ENERGY] > 0) {
                    if (creep.withdraw(room.storage, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(RESOURCE_ENERGY), room.storage.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(room.storage);
                    }
                } else if (!creep.pos.isEqualTo(waitpos)) {
                    creep.travelTo(waitpos);
                }
            }
        } else if (creep.store[RESOURCE_ENERGY] > 0) {
            if (creep.transfer(room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.travelTo(room.storage);
            }
        } else {
            if (!creep.pos.isEqualTo(waitpos)) {
                creep.travelTo(waitpos);
            }
        }
    }
};