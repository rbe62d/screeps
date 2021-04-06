module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let tarjet = Game.getObjectById(creep.memory.target);
        if (tarjet != undefined) {
            if (!creep.pos.inRangeTo(tarjet, 2)) {
                creep.travelTo(tarjet)
                return
            }
        }

        if (creep.store[RESOURCE_ENERGY] < 0.4 * creep.store.getCapacity() && creep.room.name != creep.memory.targetRoom) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.targetRoom));
        } else if (creep.store[RESOURCE_ENERGY] < 0.4 * creep.store.getCapacity()) {
            if (creep.memory.target == undefined || creep.memory.target == null || creep.memory.target == '') {
                let containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => {
                        return s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0.4 * creep.store.getFreeCapacity(RESOURCE_ENERGY);
                    }
                });
                
                if (containers.length > 0) {
                    containers.sort((a,b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
                    creep.memory.target = containers[0].id;
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
            }
        } else if (creep.store[RESOURCE_ENERGY] >= 0.4 * creep.store.getCapacity() && creep.room.name != creep.memory.home) {
            creep.travelTo(new RoomPosition(25, 25, creep.memory.home));
        } else if (creep.store[RESOURCE_ENERGY] >= 0.4 * creep.store.getCapacity()) {
            let storage = creep.room.storage;

            if (storage) {
                if (creep.pos.inRangeTo(storage, 1)) {
                    creep.transfer(storage, RESOURCE_ENERGY);
                    creep.memory.target = '';  
                } else {
                    creep.travelTo(storage, {swampCost: 2, visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
    }
};