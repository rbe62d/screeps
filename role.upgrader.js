module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let MESSAGE = 'Who put this sign here?!';

        let control = creep.room.controller;

        if(creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        } else if(!creep.memory.working && creep.store[RESOURCE_ENERGY] == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.working) {
            if (creep.pos.findInRange(FIND_SOURCES, 1).length > 0) {
                creep.travelTo(control, {visualizePathStyle: {stroke: '#ffffff'}});
            } else {
                if (control.my && (control.sign == undefined || control.owner.username != control.sign.username || MESSAGE != control.sign.text)) {
                    if (creep.signController(control, MESSAGE) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(control);
                    }
                } else if(creep.upgradeController(control) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(control, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        } else {
            creep.getEnergy(true,true)
        }
    }
};