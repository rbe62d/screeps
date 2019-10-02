module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        const source = Game.getObjectById(creep.memory.sourceID);
        let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => {return s.structureType == STRUCTURE_CONTAINER}
        });

        let container = null;
        if (containers.length > 0) {container = creep.pos.findClosestByPath(containers);}

        if(creep.carry.energy < creep.carryCapacity) {
            if (container == null) {
                if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                } else if (creep.pos.findInRange(FIND_SOURCES, 1).length != 0) {
                    creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER)
                }
            } else {
                if (creep.pos.isEqualTo(container.pos)) {
                    creep.harvest(source);
                } else {
                    creep.moveTo(container);
                }
            }
        }
        else {
            let targets = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 0);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {ignoreCreeps: true, visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if (container != null && container.hits < container.hitsMax) {
                if(creep.repair(container) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, {ignoreCreeps: true, visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else { 
                if (_.sum(container.store) < container.storeCapacity) {
                    creep.drop(RESOURCE_ENERGY)
                    creep.harvest(source);
                }
            }
        }
    }
};