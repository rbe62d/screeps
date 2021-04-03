module.exports = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // creep.suicide()
        let storageEnergyAmount = 50000;
        let termEnergyAmount = 50000;
        let termMinEnergyAmount = 10000;

        let storage = creep.room.storage;
        let terminal = creep.room.terminal;
        let factory = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_FACTORY})[0];
        let link = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_LINK})[0];
        let towers = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_TOWER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0});
        let spawn = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_SPAWN})[0];
        let nuker = creep.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_NUKER})[0];

        let tombs = creep.pos.findInRange(FIND_TOMBSTONES, 1);
        let resources = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1);

        if (creep.store.getUsedCapacity() > 0 && creep.store[RESOURCE_ENERGY] == 0) {
            if (terminal) {
                for (let resource in creep.store) {
                    creep.transfer(terminal, resource);
                }
            } else if (storage) {
                for (let resource in creep.store) {
                    creep.transfer(storage, resource);
                }
            }
        } else if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && storage && storage.store[RESOURCE_ENERGY] > 10000) {
            if (creep.store[RESOURCE_ENERGY] < spawn.store.getFreeCapacity(RESOURCE_ENERGY)) {
                creep.withdraw(storage, RESOURCE_ENERGY, spawn.store.getFreeCapacity(RESOURCE_ENERGY));
            } else {
                creep.transfer(spawn, RESOURCE_ENERGY);
            }
        } else if (towers.length > 0 && storage && storage.store[RESOURCE_ENERGY] > 10000) {
            if (creep.store[RESOURCE_ENERGY] < towers[0].store.getFreeCapacity(RESOURCE_ENERGY)) {
                creep.withdraw(storage, RESOURCE_ENERGY, towers[0].store.getFreeCapacity(RESOURCE_ENERGY));
            } else {
                creep.transfer(towers[0], RESOURCE_ENERGY);
            }
        } else if (terminal && storage && terminal.store[RESOURCE_ENERGY] < termMinEnergyAmount && (storage.store[RESOURCE_ENERGY] > 2000 || creep.store[RESOURCE_ENERGY])) {
            if (creep.store.getUsedCapacity() > 0) {
                creep.transfer(terminal, RESOURCE_ENERGY);
            } else {
                creep.withdraw(storage, RESOURCE_ENERGY);
            }
        } else if (terminal != undefined && storage != undefined && (terminal.store[RESOURCE_ENERGY] > termMinEnergyAmount+800 || creep.store[RESOURCE_ENERGY]) && (storage.store[RESOURCE_ENERGY] < storageEnergyAmount || storage.store[RESOURCE_ENERGY] < terminal.store[RESOURCE_ENERGY])) {
            if (creep.store.getUsedCapacity() > 0) {
                for (let resource in creep.store) {
                    creep.transfer(storage, resource);
                }
            } else {
                creep.withdraw(terminal, RESOURCE_ENERGY);
            }
        } else if (terminal != undefined && storage != undefined && (storage.store.getUsedCapacity() - storage.store.getUsedCapacity(RESOURCE_ENERGY) > 0) && creep.store.getUsedCapacity() == 0) {
            if (creep.store.getUsedCapacity() == 0) {
                for (let resource in storage.store) {
                    if (resource != RESOURCE_ENERGY) {
                        creep.withdraw(storage, resource);
                    }
                }
            } else {
                for (let resource in creep.store) {
                    if (resource != RESOURCE_ENERGY) {
                        creep.transfer(terminal, resource);
                    } else {
                        creep.transfer(storage, resource);
                    }
                }
            }
        } else if (creep.store.getUsedCapacity() - creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            for (let resource in creep.store) {
                creep.transfer(terminal, resource);
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
            } else if (terminal.store.getFreeCapacity() == 0 && creep.store.getFreeCapacity() == 0) {
                for (let resource in creep.store) {
                    creep.transfer(storage, resource);
                }
            } else if (creep.store[RESOURCE_ENERGY] > 0) {
                creep.transfer(terminal, RESOURCE_ENERGY);
            } else if (storage.store[RESOURCE_ENERGY] > storageEnergyAmount + creep.store.getCapacity()) {
                creep.withdraw(storage, RESOURCE_ENERGY, Math.min(creep.store.getFreeCapacity(), termEnergyAmount - terminal.store[RESOURCE_ENERGY], storage.store[RESOURCE_ENERGY]));
            }

            // if (creep.store.getUsedCapacity() - creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {

            // } else if (terminal.store.getFreeCapacity() == 0 && creep.store.getUsedCapacity() == 0) {
                
            //     // creep.withdraw(terminal)
            // }
        } else if (creep.store[RESOURCE_ENERGY] > 0 && storage != undefined && storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            creep.transfer(storage, RESOURCE_ENERGY);
        }
    }
};