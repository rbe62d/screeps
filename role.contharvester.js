module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        const source = Game.getObjectById(creep.memory.sourceID);
        let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => {return s.structureType == STRUCTURE_CONTAINER}
        });

        let container = null;
        if (containers.length > 0) {
            let anchor = new RoomPosition(creep.room.memory.anchor.x, creep.room.memory.anchor.y, creep.room.name);
            container = anchor.findClosestByPath(containers);
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
                    creep.harvest(source);
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
            } else if (container != null && container.hits < container.hitsMax) {
                if(creep.repair(container) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(container, {ignoreCreeps: true, stuckValue: 50 , visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else { 
                if (container != null && container.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    // creep.drop(RESOURCE_ENERGY)
                    creep.harvest(source);
                }
            }
        }
    }
};