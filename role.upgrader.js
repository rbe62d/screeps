module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        let MESSAGE = 'Who put this sign here?!';

        let control = creep.room.controller;

        if(creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('🔄 harvest');
        } else if(!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.working) {
            if (control.my && (control.sign == undefined || control.owner.username != control.sign.username || MESSAGE != control.sign.text)) {
                if (creep.signController(control, MESSAGE) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(control);
                }
            } else if(creep.upgradeController(control) == ERR_NOT_IN_RANGE) {
                creep.moveTo(control, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            creep.getEnergy(true,true)
        }
    }
};