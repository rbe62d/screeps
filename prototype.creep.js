var roles = {
    harvester: require('role.harvester'),
    contharvester: require('role.contharvester'),
    ferry: require('role.ferry'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder')
}

Creep.prototype.runRole =
    function() {
        roles[this.memory.role].run(this);
    };

Creep.prototype.getEnergy =
    function (useContainer, useSource) {
        let store = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_STORAGE && _.sum(structure.store) >= this.carryCapacity;
            }
        });

        let targets = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_EXTENSION) && structure.energy >= 50;
            }
        });
        
        if(useContainer && store.length > 0) {
            const closest = store[0]
            if(this.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(closest, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        }
        else if (useContainer && this.room.energyAvailable > 2*this.carryCapacity && targets.length > 0) {
            const closest = this.pos.findClosestByPath(targets);

            if(this.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.moveTo(closest, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        } else if (useSource) {
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