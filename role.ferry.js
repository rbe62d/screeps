module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
            creep.memory.working = false;
        } else if (!creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
            // if (2 * creep.room.energyAvailable < creep.room.energyCapacityAvailable && creep.room.storage != undefined && creep.room.storage.store[RESOURCE_ENERGY] > 5000) {
            //     if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //             creep.travelTo(creep.room.storage, {visualizePathStyle: {stroke: '#ffaa00'}});
            //         }
            // } else 
            {
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

                let ruins = creep.room.find(FIND_RUINS, {
                    filter: (r) => {
                        return r.store[RESOURCE_ENERGY] > 0;
                    }
                })

                if (dropped.length > 0) {
                    let closest = creep.pos.findClosestByPath(dropped);

                    if(creep.pickup(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(closest, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                } else if (tombs.length > 0) {
                    let closest = creep.pos.findClosestByPath(tombs);

                    if(creep.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(closest, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                } else if (ruins.length > 0) {
                    let closest = creep.pos.findClosestByPath(ruins);

                    if(creep.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(closest, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                } else {
                    let containers = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            return s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0;//creep.carryCapacity;
                        }
                    });
                    
                    if (containers.length > 0) {
                        

                        containers.sort((a,b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
                        const closest = containers[0];

                        if(creep.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.travelTo(closest, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                    }
                }
            }
        }
        else {
            let store = creep.room.storage;
            if(store != undefined) {
                if (store.store[RESOURCE_ENERGY] < 0.5 * store.storeCapacity) {
                    if (creep.transfer(store, RESOURCE_ENERGY) != OK) {
                        creep.travelTo(store, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            } else {
                creep.depositEnergy();
            }

            // creep.depositEnergy();
        }
    }
};