var roles = {
    harvester: require('role.harvester'),
    contharvester: require('role.contharvester'),
    ferry: require('role.ferry'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    claimer: require('role.claimer'),
    remotebuilder: require('role.remotebuilder'),
    remoteupgrader: require('role.remoteupgrader')
}

Creep.prototype.runRole =
    function() {
        roles[this.memory.role].run(this);
    };

Creep.prototype.runOtherRole =
    function(other) {
        roles[other].run(this);
    };

Creep.prototype.getEnergy =
    function (useContainer, useSource) {
        let conts = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER) && _.sum(structure.store) >= this.carryCapacity;
            }
        });

        let storage = this.room.storage;

        if(useContainer && storage != undefined && storage.store[RESOURCE_ENERGY] >= this.carryCapacity)
        {
            if(this.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(storage, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        }
        else if(useContainer && conts.length > 0) {
            const closest = this.pos.findClosestByPath(conts);
            if(this.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(closest, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        }
        else if (useSource) {
            let sources = this.room.find(FIND_SOURCES, {
                filter: (structure) => {
                    return structure.energy > 0;
                }
            });
            const closest = this.pos.findClosestByPath(sources);

            if(this.harvest(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(closest, {visualizePathStyle: {stroke: '#ffff00'}});
            }
        }
    };

Creep.prototype.depositEnergy =
    function () {
        // let targets = this.room.find(FIND_MY_STRUCTURES, {
        //         filter: (structure) => {
        //             return (structure.structureType == STRUCTURE_EXTENSION ||
        //                 structure.structureType == STRUCTURE_SPAWN ||
        //                 structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        //         }
        //     });

        let targets = this.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    // return (structure.structureType == STRUCTURE_EXTENSION ||
                    //     structure.structureType == STRUCTURE_SPAWN ||
                    //     structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                    return structure.energy < structure.energyCapacity;
                }
            });

        if(targets.length > 0) {
            const closest = this.pos.findClosestByPath(targets);

            if(this.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            let store = this.room.storage;

            if(store != undefined && store.store[RESOURCE_ENERGY] < 0.5 * store.storeCapacity) {
                if (this.transfer(store, RESOURCE_ENERGY) != OK) {
                    this.moveTo(store, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    };