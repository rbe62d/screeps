module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
            creep.memory.working = false;
        } else if (!creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = true;
        }

        if(creep.memory.working) {
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
                let closest = creep.pos.findClosestByRange(dropped);

                if(creep.pickup(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(closest, {swampCost: 2, visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else if (tombs.length > 0) {
                let closest = creep.pos.findClosestByRange(tombs);

                if(creep.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(closest, {swampCost: 2, visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else if (ruins.length > 0) {
                let closest = creep.pos.findClosestByRange(ruins);

                if(creep.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(closest, {swampCost: 2, visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                    // console.log('uh ' + creep.name + ' ' + creep.room.name)
                if (creep.memory.contid == undefined || creep.memory.contid == null || creep.memory.contid == '') {
                    let containers = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            return s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0;
                        }
                    });
                    
                    if (containers.length > 0) {
                        containers.sort((a,b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
                        creep.memory.contid = containers[0].id;
                    }
                }

                const closest = Game.getObjectById(creep.memory.contid);

                if (closest != null) {
                    if (creep.pos.inRangeTo(closest, 1)) {
                        creep.withdraw(closest, RESOURCE_ENERGY);
                        creep.memory.contid = '';  
                    } else {
                        creep.travelTo(closest, {swampCost: 2, visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                } else {
                    creep.memory.contid = '';
                }
            }
        }
        else {
            let store = creep.room.storage;
            if(store != undefined) {
                if (store.store[RESOURCE_ENERGY] < 0.8 * store.storeCapacity) {
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