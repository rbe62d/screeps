module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // creep.suicide()
        let storageEnergyAmount = 50000;
        let termEnergyAmount = 50000;

        let storage = creep.room.storage;
        let terminal = creep.room.terminal;
        let factory = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_FACTORY})[0];
        let link = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_LINK})[0];
        let towers = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_TOWER});
        let spawn = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_SPAWN})[0];
        let nuker = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_NUKER})[0];

        let tombs = creep.pos.findInRange(FIND_TOMBSTONES, 1);
        let resources = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1);

        if (creep.room.name == 'W5N1') {
            // console.log(creep.store.getUsedCapacity())
        }

        if (terminal != undefined && storage != undefined && terminal.store[RESOURCE_ENERGY] >= 0 && (storage.store[RESOURCE_ENERGY] < storageEnergyAmount || storage.store[RESOURCE_ENERGY] < terminal.store[RESOURCE_ENERGY])) {
            if (creep.store.getUsedCapacity() > 0) {
                for (let resource in creep.store) {
                    creep.transfer(storage, resource);
                }
            } else {
                creep.withdraw(terminal, RESOURCE_ENERGY);
            }
        } else if (terminal != undefined && storage != undefined && terminal.store[RESOURCE_ENERGY] < termEnergyAmount) {
            let randomPropertyFunc = function (obj) {
                    let keys = Object.keys(obj)
                    return keys[ keys.length * Math.random() << 0];
                };

            if (creep.store.getUsedCapacity() - creep.store[RESOURCE_ENERGY] > 0) {
                for (let resource in creep.store) {
                    if (resource != RESOURCE_ENERGY) {
                        creep.transfer(storage, resource);
                    }
                }
            } else if (terminal.store.getFreeCapacity() <= 10000 && creep.store.getFreeCapacity() > 0) {
                let maxAmount = 0;
                let maxResource = '';
                for (let resource in terminal.store) {
                    if (resource != RESOURCE_ENERGY && terminal.store[resource] > maxAmount) {
                        maxAmount = terminal.store[resource];
                        maxResource = resource;
                    }
                }

                creep.withdraw(terminal, maxResource);

                // let randResource = randomPropertyFunc(terminal.store);
                // console.log(creep.room.name + ': random randomPropertyFunc: ' + randResource)
            } else if (terminal.store.getFreeCapacity() == 0 && creep.store.getFreeCapacity() == 0) {
                for (let resource in creep.store) {
                    creep.transfer(storage, resource);
                }


                // let randResource = randomPropertyFunc(terminal.store);
                // console.log(creep.room.name + ': random randomPropertyFunc: ' + randResource)
            } else if (creep.store[RESOURCE_ENERGY] > 0) {
                creep.transfer(terminal, RESOURCE_ENERGY);
            } else if (storage.store[RESOURCE_ENERGY] > storageEnergyAmount + creep.store.getCapacity()) {
                // console.log('else withdraw: ' + (storage.store[RESOURCE_ENERGY]) + ' , ' + Math.min(creep.store.getFreeCapacity(), 20000 - terminal.store[RESOURCE_ENERGY], storage.store[RESOURCE_ENERGY]))
                creep.withdraw(storage, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(), termEnergyAmount - terminal.store[RESOURCE_ENERGY], storage.store[RESOURCE_ENERGY]));
            }
            // if (creep.store.getUsedCapacity() - creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {

            // } else if (terminal.store.getFreeCapacity() == 0 && creep.store.getUsedCapacity() == 0) {
                
            //     // creep.withdraw(terminal)
            // }
        }
    }
};