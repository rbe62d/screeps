module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let fix = creep.memory.working;
        if (Math.floor(Math.random() * 10) == 0) {
            creep.memory.working = !creep.memory.working;
        }

        let structs = _.filter(Game.structures, s => s.room.name == creep.room.name && s.structureType != STRUCTURE_LINK && s.energy <= s.energyCapacity - 100);
        let waitpos = new RoomPosition(creep.room.memory.anchor['x']+1, creep.room.memory.anchor['y']-1, creep.room.name)

        if (creep.room.energyCapacityAvailable != creep.room.energyAvailable && _.sum(creep.carry) == 0 && creep.room.storage != undefined && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
            
            let err = creep.withdraw(creep.room.storage, RESOURCE_ENERGY, Math.min(creep.carryCapacity, creep.room.energyCapacityAvailable - creep.room.energyAvailable));
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.storage, {ignoreCreeps: fix, visualizePathStyle: {stroke: '#ffaa00'}});
            } else {
                // let waitpos = new RoomPosition(creep.room.memory.anchor['x']+1, creep.room.memory.anchor['y']-1, creep.room.name)
                if (!creep.pos.isEqualTo(waitpos)) {
                    creep.moveTo(waitpos, {ignoreCreeps: fix});
                }
            }
        } else if (_.sum(creep.carry) > 0 && creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
            // creep.depositEnergy();
            creep.fillExtensions();
        } else if (structs.length > 0) {// && creep.room.storage != undefined && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
            // console.log('here structs')
            if(_.sum(creep.carry) == 0 && creep.room.storage != undefined && creep.room.storage.store[RESOURCE_ENERGY] > 0) {
                // console.log('hello')
                let deficit = 0;
                // console.log('here:' + deficit);
                // console.log(deficit)
                for (let tower of structs) {
                    deficit += tower.energyCapacity - tower.energy;
                }
                let err = creep.withdraw(creep.room.storage, RESOURCE_ENERGY, Math.min(creep.carryCapacity, deficit, creep.room.storage.store[RESOURCE_ENERGY]));
                // console.log('here:' + deficit + ' ' + Game.time);
                // console.log(deficit)
                if(err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage, {ignoreCreeps: fix, visualizePathStyle: {stroke: '#ffaa00'}});
                } else {
                    // let waitpos = new RoomPosition(creep.room.memory.anchor['x']+1, creep.room.memory.anchor['y']-1, creep.room.name)
                    // let waitpos = new RoomPosition(this.pos.x-2, this.pos.y+2, this.room.name)
                    if (!creep.pos.isEqualTo(waitpos)) {
                        creep.moveTo(waitpos, {ignoreCreeps: fix});
                    }
                }
            } else if (_.sum(creep.carry) > 0) {
                // console.log('fug' + Game.time)
                // creep.depositEnergy();
                let tower = creep.pos.findClosestByPath(structs);
                if(creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(tower, {ignoreCreeps: fix, visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                // let waitpos = new RoomPosition(creep.room.memory.anchor['x']+1, creep.room.memory.anchor['y']-1, creep.room.name)
                // let waitpos = new RoomPosition(this.pos.x-2, this.pos.y+2, this.room.name)
                if (!creep.pos.isEqualTo(waitpos)) {
                    creep.moveTo(waitpos, {ignoreCreeps: fix});
                }
            }
        } else if (creep.room.terminal != undefined && creep.room.terminal.store[RESOURCE_ENERGY] < creep.room.terminal.storeCapacity*0.3) {
            if (_.sum(creep.carry) == 0) {
                if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY, Math.min(creep.carryCapacity, creep.room.terminal.storeCapacity*0.3 - creep.room.terminal.store[RESOURCE_ENERGY], creep.room.storage.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(waitpos, {ignoreCreeps: fix})
                }
            } else {
                if (creep.transfer(creep.room.terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(waitpos, {ignoreCreeps: fix})
                }
            }
        } else {
            // let waitpos = new RoomPosition(this.pos.x-2, this.pos.y+2, this.room.name)
            if (!creep.pos.isEqualTo(waitpos)) {
                creep.moveTo(waitpos, {ignoreCreeps: fix});
            }
        }
    }
};