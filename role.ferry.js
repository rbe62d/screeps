module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        {
            let homeroom = Game.rooms[creep.memory.home];
            if (creep.body.length < 48 && homeroom.energyAvailable == homeroom.energyCapacityAvailable && homeroom.energyAvailable / 150 > creep.body.length+2) {
                creep.say("Peace out!");
                creep.suicide();
            }
        }
        let store = creep.room.storage;
        // if (creep.pos.inRangeTo(store, 1)) {
        //     creep.memory.target = '';
        // }
        let tarjet = Game.getObjectById(creep.memory.target);
        if (tarjet == undefined) {
            creep.memory.target = '';
        }

        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == creep.store.getCapacity()) {
            creep.memory.working = false;
            delete creep.memory.target;
        } else if (!creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = true;
            delete creep.memory.target;
        }

        // if(creep.memory.working) {
        if (creep.memory.target != undefined && creep.memory.target != "") {
            let targ = Game.getObjectById(creep.memory.target);
            if (creep.pos.inRangeTo(targ, 1)) {
                for(const resourceType in targ.store) {
                    creep.withdraw(targ, resourceType);
                }
                creep.memory.target = ''
            } else {
                creep.travelTo(targ, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else if(creep.store.getFreeCapacity(RESOURCE_ENERGY) >= 0.6 * creep.store.getCapacity()) {
            if (creep.memory.target != undefined) {

            }

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
                    creep.memory.target = closest.id;
                }
            } else if (ruins.length > 0) {
                let closest = creep.pos.findClosestByRange(ruins);

                if(creep.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(closest, {swampCost: 2, visualizePathStyle: {stroke: '#ffaa00'}});
                    creep.memory.target = closest.id;
                }
            } else {
                    // console.log('uh ' + creep.name + ' ' + creep.room.name)
                if (creep.memory.target == undefined || creep.memory.target == null || creep.memory.target == '') {
                    let containers = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            return s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0.5 * creep.store.getFreeCapacity(RESOURCE_ENERGY);
                        }
                    });
                    
                    if (containers.length > 0) {
                        containers.sort((a,b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
                        creep.memory.target = containers[0].id;
                    } else {
                        creep.runOtherRole("minferry");
                    }
                }

                const closest = Game.getObjectById(creep.memory.target);

                if (closest != null) {
                    if (creep.pos.inRangeTo(closest, 1)) {
                        creep.withdraw(closest, RESOURCE_ENERGY);
                        creep.memory.target = '';  
                    } else {
                        creep.travelTo(closest, {swampCost: 2, visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                } else if (creep.memory.target == '') {
                    // creep.memory.target = '';
                    creep.travelTo(new RoomPosition(creep.room.memory.anchor.x-3, creep.room.memory.anchor.y, creep.room.name))
                }
            }
        } else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) < 0.6 * creep.store.getCapacity()) {
            if(store != undefined) {
                if (store.store[RESOURCE_ENERGY] < 0.8 * store.storeCapacity) {
                    // if (creep.transfer(store, RESOURCE_ENERGY) != OK) {
                    //     creep.travelTo(store, {visualizePathStyle: {stroke: '#ffffff'}});
                    // }
                    // if (creep.pos.inRangeTo(store, 1) && creep.store.getFreeCapacity(RESOURCE_ENERGY) != creep.store.getCapacity()) {
                    //     for(const resourceType in creep.store) {
                    //         creep.transfer(store, resourceType);
                    //     }
                    // }
                    if (creep.pos.inRangeTo(store, 1)) {
                        for(const resourceType in creep.store) {
                            creep.transfer(store, resourceType);
                        }
                        creep.memory.target = '';
                    } else {
                        creep.travelTo(store, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    creep.depositEnergy();
                }
            }
            // } else {
            //     creep.depositEnergy();
            // }

            // creep.depositEnergy();
        }
    }
};