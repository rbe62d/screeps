module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        const source = creep.room.find(FIND_MINERALS)[0];
        let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => {return s.structureType == STRUCTURE_CONTAINER}
        });

        let container = null;
        if (containers.length > 0) {container = creep.pos.findClosestByPath(containers);}

        // console.log('a')
        // console.log(container)
        // console.log('s')
        // console.log(containers)
        // console.log('s')
        // console.log(source)

        if (container != undefined && container != null) {
            if (creep.pos.isEqualTo(container.pos)) {
                if (container.store.getUsedCapacity() < container.store.getCapacity() && Game.time%5 == 0) {
                    creep.harvest(source);
                }
            } else {
                creep.travelTo(container);
            }
        }
    }
};