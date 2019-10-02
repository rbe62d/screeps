module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = false;
        } else if (!creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            if (2 * creep.room.energyAvailable < creep.room.energyCapacityAvailable && creep.room.storage != undefined && creep.room.storage.store[RESOURCE_ENERGY] > 5000) {
                if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
            } else {
                let dropped = creep.room.find(FIND_DROPPED_RESOURCES, {
                    filter: (r) => {
                        return r.resourceType == RESOURCE_ENERGY;
                    }
                })

                let tombs = creep.room.find(FIND_TOMBSTONES, {
                    filter: (r) => {
                        return r.store[RESOURCE_ENERGY] > 0;
                    }
                })

                if (dropped.length > 0) {
                    let closest = creep.pos.findClosestByPath(dropped);

                    if(creep.pickup(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                } else if (tombs.length > 0) {
                    let closest = creep.pos.findClosestByPath(tombs);

                    if(creep.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                } else {
                    let containers = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            return s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0;//creep.carryCapacity;
                        }
                    });
                    
                    if (containers.length > 0) {
                        let max = 0;
                        //let closest;
                        let set = [];
                        for (let thing of containers) {
                            if (thing.store[RESOURCE_ENERGY] > max + 50 || _.sum(thing.store) == thing.storeCapacity) {
                                max = thing.store[RESOURCE_ENERGY];
                                // closest = thing;
                            }
                        }
                        for (let thing of containers) {
                            if (thing.store[RESOURCE_ENERGY] == max) {
                                set.push(thing);
                            }
                        }

                        let closest = creep.pos.findClosestByPath(set);

                        if(creep.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(closest, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                    }
                }
            }
        }
        else {
            creep.depositEnergy();
        }
    }
};