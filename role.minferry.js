module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.store.getUsedCapacity() == creep.store.getCapacity()) {
            creep.memory.working = false;
        } else if (!creep.memory.working && creep.store.getUsedCapacity() == 0) {
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
                        return r.resourceType != RESOURCE_ENERGY;
                    }
                })

                let tombs = creep.room.find(FIND_TOMBSTONES, {
                    filter: (r) => {
                        return _.sum(r.store) - r.store[RESOURCE_ENERGY] > 0;
                    }
                })

                let ruins = creep.room.find(FIND_RUINS, {
                    filter: (r) => {
                        return _.sum(r.store) - r.store[RESOURCE_ENERGY] > 0;
                    }
                })

                if (dropped.length > 0) {
                    let closest = creep.pos.findClosestByRange(dropped);

                    if (!creep.pos.inRangeTo(closest, 1)) {
                        creep.travelTo(closest);
                    } else {
                        // for (const resourceType in closest.store) {
                        //     if (resourceType != RESOURCE_ENERGY) {
                        //         creep.pickup(closest, resourceType);
                        //     }
                        // }
                        creep.pickup(closest);
                    }
                } else if (tombs.length > 0) {
                    let closest = creep.pos.findClosestByRange(tombs);

                    if (!creep.pos.inRangeTo(closest, 1)) {
                        creep.travelTo(closest);
                    } else {
                        for (const resourceType in closest.store) {
                            if (resourceType != RESOURCE_ENERGY) {
                                creep.withdraw(closest, resourceType);
                            }
                        }
                    }
                } else if (ruins.length > 0) {
                    let closest = creep.pos.findClosestByRange(ruins);

                    if (!creep.pos.inRangeTo(closest, 1)) {
                        creep.travelTo(closest);
                    } else {
                        for (const resourceType in closest.store) {
                            if (resourceType != RESOURCE_ENERGY) {
                                creep.withdraw(closest, resourceType);
                            }
                        }
                    }
                } else {
                    let containers = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            return s.structureType == STRUCTURE_CONTAINER && s.store.getUsedCapacity() - s.store[RESOURCE_ENERGY] > 0;//creep.store.getCapacity();
                        }
                    });
                    
                    if (containers.length > 0) {
                        let closest = creep.pos.findClosestByRange(containers);

                        if (!creep.pos.inRangeTo(closest, 1)) {
                            creep.travelTo(closest);
                        } else {
                            for (const resourceType in closest.store) {
                                if (resourceType != RESOURCE_ENERGY) {
                                    creep.withdraw(closest, resourceType);
                                }
                            }
                        }
                    }
                }
            }
        }
        else {
            // else {
            //     creep.depositEnergy();
            // }

            let terminal = creep.room.terminal;
            let store = creep.room.storage;
            if (terminal != undefined) {
                if (!creep.pos.inRangeTo(terminal, 1)) {
                    creep.travelTo(terminal);
                } else {
                    for (const resourceType in creep.carry) {
                        creep.transfer(terminal, resourceType);
                    }
                }
            } else if(store != undefined) {
                if (!creep.pos.inRangeTo(store, 1)) {
                    creep.travelTo(store);
                } else {
                    for (const resourceType in creep.carry) {
                        creep.transfer(store, resourceType);
                    }
                }
            } 

            // creep.depositEnergy();
        }
    }
};