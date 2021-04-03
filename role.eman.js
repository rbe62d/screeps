module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {

        let bodysize = {
        	1: 6,
        	2: 9,
        	3: 15,
        	4: 24,
        	5: 36,
        	6: 45,
        	7: 48,
        	8: 48,
        }

        let options = {range: 1, restrictDistance: 16}
        if (Game.time%100 == 0) {
            options.freshMatrix = true;
        }
        // if (creep.room.name == 'E1N5') {
        //     options = {freshMatrix: true};
        // }


        // if (Game.time - creep.name.substr(4) < 50000 && creep.body.length >= bodysize[creep.room.controller.level] && creep.ticksToLive < 200 && creep.room.energyAvailable >= 1000 && creep.room.storage != undefined && creep.room.storage.store[RESOURCE_ENERGY] > 30000) {
        //     // creep.runOtherRole('renew');
        //     creep.memory.state = 'renew';
        // }
        

        let spawns = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_SPAWN && !s.spawning});
        if (creep.ticksToLive > 1400 || creep.room.energyAvailable < 1000 || spawns.length == 0) {
            delete creep.memory.state;
        }

        if (creep.body.length < bodysize[creep.room.controller.level] && creep.room.energyAvailable >= 50*bodysize[creep.room.controller.level] && spawns.length > 0) {
        	creep.memory.state = 'recycle';
        } else if (creep.memory.state == 'recycle' && spawns.length == 0) {
        	delete creep.memory.state;
        }

        if (creep.memory.state != undefined && creep.memory.state == 'renew') {
            if (creep.store[RESOURCE_ENERGY] > 0) {
                let closest = creep.pos.findClosestByRange(spawns);

                if (closest != undefined && closest != null) {
                    if (creep.pos.inRangeTo(closest, 1)) {
                        closest.renewCreep(creep);
                        creep.transfer(closest, RESOURCE_ENERGY)
                    } else {
                        creep.travelTo(closest, options);
                    }
                }
            } else {
                if (creep.pos.inRangeTo(creep.room.storage, 1)) {
                    creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
                } else {
                    creep.travelTo(creep.room.storage, options);
                }
            }
        } else if (creep.memory.state != undefined && creep.memory.state == 'recycle') {
        	let closest = creep.pos.findClosestByRange(spawns);

        	if (closest != undefined && closest != null) {
        	    if (creep.pos.inRangeTo(closest, 1)) {
        	        closest.recycleCreep(creep);
        	        // creep.transfer(closest, RESOURCE_ENERGY)
        	    } else {
        	        creep.travelTo(closest, options);
        	    }
        	}
        } else {


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
                            creep.travelTo(room.terminal, options);
                        }
                    } else if (room.storage.store[RESOURCE_ENERGY] > 0) {
                        if (creep.withdraw(room.storage, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(RESOURCE_ENERGY), room.storage.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(room.storage, options);
                        }
                    } else if (!creep.pos.isEqualTo(waitpos)) {
                        creep.travelTo(waitpos, options);
                    }
                }
            } else if (towers.length > 0) {
                if (creep.store[RESOURCE_ENERGY] > 0) {
                    // creep.depositEnergy();
                    const closest = creep.pos.findClosestByRange(towers);
                    if (creep.pos.inRangeTo(closest, 1)) {
                        creep.transfer(closest, RESOURCE_ENERGY);
                    } else {
                        creep.travelTo(closest, options);
                    }
                } else {
                    if (room.terminal != undefined && room.terminal.store[RESOURCE_ENERGY] > room.storage.store[RESOURCE_ENERGY]) {
                        if (creep.withdraw(room.terminal, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(RESOURCE_ENERGY), room.terminal.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(room.terminal, options);
                        }
                    } else if (room.storage.store[RESOURCE_ENERGY] > 0) {
                        if (creep.withdraw(room.storage, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(RESOURCE_ENERGY), room.storage.store[RESOURCE_ENERGY])) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(room.storage, options);
                        }
                    } else if (!creep.pos.isEqualTo(waitpos)) {
                        options.range = 0;
                        creep.travelTo(waitpos, options);
                        // creep.travelTo(waitpos);
                    }
                }
            } else if (creep.store[RESOURCE_ENERGY] > 0) {
                if (creep.transfer(room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(room.storage, options);
                }
            } else {
                if (!creep.pos.isEqualTo(waitpos)) {
                    options.range = 0;
                    creep.travelTo(waitpos, options);
                    // creep.travelTo(waitpos, {freshMatrix: true});
                }
            }


        }
    }
};