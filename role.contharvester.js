module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // creep.suicide();
        if (creep.memory.targetRoom == undefined || creep.room.name == creep.memory.targetRoom) {
            const source = Game.getObjectById(creep.memory.sourceID);
            let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => {return s.structureType == STRUCTURE_CONTAINER}
            });
    
            let container = null;
            if (containers.length > 0) {
                // let anchor = new RoomPosition(creep.room.memory.anchor.x, creep.room.memory.anchor.y, creep.room.name);
                container = creep.pos.findClosestByPath(containers);
            }
    
            if(creep != undefined && creep.store != undefined && creep.store[RESOURCE_ENERGY] == 0) {
                let targets = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
    
                if (container == null) {
                    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(source, {ignoreCreeps: true, visualizePathStyle: {stroke: '#ffaa00'}});
                    } else if (creep.pos.findInRange(FIND_SOURCES, 1).length != 0) {
                        creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)
                    }
                } else {
                    if (creep.pos.isEqualTo(container.pos)) {
                        if (source.energy > 0) {
                            creep.harvest(source);
                        }
                    } else {
                        creep.travelTo(container);
                    }
                }
            } else {
                let targets = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
                if(targets.length) {
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(targets[0], {ignoreCreeps: true, stuckValue: 50 , visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else if (container != null && creep.store[RESOURCE_ENERGY] == creep.store.getCapacity() && container.hits < container.hitsMax) {
                    if(creep.repair(container) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(container, {ignoreCreeps: true, stuckValue: 50 , visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else { 
                    if (container != null && container.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        // creep.drop(RESOURCE_ENERGY)
                        // creep.harvest(source);
                        if (source.energy > 0) {
                            creep.harvest(source);
                        }
                    }
                }
            }
        } else {
            let targetRoom = creep.memory.targetRoom;
            let sourceID = creep.memory.sourceID;
            let targetx = Memory.rooms[targetRoom].sources[sourceID].x;
            let targety = Memory.rooms[targetRoom].sources[sourceID].y;

            creep.travelTo(new RoomPosition(targetx, targety, targetRoom), {ignoreCreeps: true, stuckValue: 5 , visualizePathStyle: {stroke: '#ffffff'}})
        }
    }
};