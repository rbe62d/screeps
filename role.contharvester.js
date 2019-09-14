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
                } else {
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
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
                creep.drop(RESOURCE_ENERGY)
                creep.harvest(source);
            }
        }
    }
};