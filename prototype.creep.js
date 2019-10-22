var roles = {
    harvester: require('role.harvester'),
    contharvester: require('role.contharvester'),
    ferry: require('role.ferry'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    claimer: require('role.claimer'),
    remotebuilder: require('role.remotebuilder'),
    remoteupgrader: require('role.remoteupgrader'),
    eman: require('role.eman'),
    scout: require('role.scout'),
    remotedestroyer: require('role.remotedestroyer'),
    minharvester: require('role.minharvester'),
    minferry: require('role.minferry'),
    settler: require('role.settler'),
}

Creep.prototype.runRole =
    function() {
        if (!this.spawning) {
            try {
                roles[this.memory.role].run(this);
            } catch (error) {
                console.log('creep: ' + this.name + ' (room ' + this.room.name + ') errored ' + error);
                // console.log('spawning ' + this.spawning)
            }
        }
    };

Creep.prototype.runOtherRole =
    function(other) {
        roles[other].run(this);
    };

Creep.prototype.getEnergy =
    function (useContainer, useSource) {
        let conts = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER) && _.sum(structure.store) >= this.store.getCapacity();
            }
        });

        let storage = this.room.storage;

        if(useContainer && storage != undefined && storage.store[RESOURCE_ENERGY] >= this.store.getCapacity())
        {
            if(this.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.travelTo(storage, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        }
        else if(useContainer && conts.length > 0) {
            // const closest = this.pos.findClosestByPath(conts);
            // if(this.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //     this.travelTo(closest, {visualizePathStyle: {stroke: '#ff0000'}});
            // }

            // let max = 0;
            // //let closest;
            // let set = [];
            // for (let thing of conts) {
            //     if (thing.store[RESOURCE_ENERGY] > max + 100 || _.sum(thing.store) == thing.storeCapacity) {
            //         max = thing.store[RESOURCE_ENERGY];
            //         // closest = thing;
            //     }
            // }
            // for (let thing of conts) {
            //     if (thing.store[RESOURCE_ENERGY] == max) {
            //         set.push(thing);
            //     }
            // }

            // let closest = this.pos.findClosestByPath(set);
            

            // conts.sort((a,b) => a.store[RESOURCE_ENERGY] > b.store[RESOURCE_ENERGY] ? 1 : (a.store[RESOURCE_ENERGY] < b.store[RESOURCE_ENERGY] ? -1 : 0));
            conts.sort((a,b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
            const closest = conts[0];

            if(this.withdraw(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.travelTo(closest, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else if (useSource) {
            let sources = this.room.find(FIND_SOURCES, {
                filter: (s) => {
                    return s.energy > 0;
                }
            });
            const closest = this.pos.findClosestByPath(sources);

            if(this.harvest(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.travelTo(closest, {visualizePathStyle: {stroke: '#ffff00'}});
            }
        }
    };

Creep.prototype.depositEnergy =
    function () {
        // console.log('in dep')
        let targets = this.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.store != undefined && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0; // structure.store[RESOURCE_ENERGY] < structure.store.getCapacity();
                    // return structure.store[RESOURCE_ENERGY] < structure.store.getCapacity();
                }
            });

        // console.log('targets len: ' + targets.length)

        if(targets.length > 0) {
            const closest = this.pos.findClosestByPath(targets);

            if(this.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.travelTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            let store = this.room.storage;

            if(store != undefined && store.store[RESOURCE_ENERGY] < 0.5 * store.store.getCapacity()) {
                if (this.transfer(store, RESOURCE_ENERGY) != OK) {
                    this.travelTo(store, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    };

Creep.prototype.fillExtensions =
    function () {
        let targets = this.room.find(FIND_MY_STRUCTURES, {
                filter: (s) => {
                    return (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) && s.energy < s.energyCapacity;
                }
            });

        if(targets.length > 0) {
            const closest = this.pos.findClosestByPath(targets);

            if(this.transfer(closest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.travelTo(closest, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    };