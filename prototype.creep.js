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
    middleman: require('role.middleman'),
    attacker: require('role.attacker'),
}

Creep.prototype.runRole =
    function() {
        if (!this.spawning) {
            try {
                if (this.memory.role == undefined) {
                    this.suicide()
                } else {
                    roles[this.memory.role].run(this);
                }
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
        let terminal = this.room.terminal;

        if (useContainer && terminal != undefined && terminal.store[RESOURCE_ENERGY] > 0 && (storage == undefined || terminal.store[RESOURCE_ENERGY] > storage.store[RESOURCE_ENERGY])) {
            if(this.withdraw(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.travelTo(terminal, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        } else if(useContainer && storage != undefined && storage.store[RESOURCE_ENERGY] >= this.store.getCapacity()) {
            if(this.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.travelTo(storage, {visualizePathStyle: {stroke: '#ff0000'}});
            }
        } else if(useContainer && conts.length > 0) {
            if (this.memory.contid == undefined || this.memory.contid == null || this.memory.contid == '') {
                let containers = this.room.find(FIND_STRUCTURES, {
                    filter: (s) => {
                        return s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0;
                    }
                });
                
                if (containers.length > 0) {
                    containers.sort((a,b) => b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]);
                    this.memory.contid = containers[0].id;
                }
            }

            const closest = Game.getObjectById(this.memory.contid);

            if (closest != null) {
                if (this.pos.inRangeTo(closest, 1)) {
                    this.withdraw(closest, RESOURCE_ENERGY);
                    this.memory.contid = '';  
                } else {
                    this.travelTo(closest, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                this.memory.contid = '';
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
                this.travelTo(closest, {maxRooms: 1});
            }
        }
    };

Creep.prototype.depositEnergy =
    function () {
        let targets = this.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) && structure.store != undefined && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0; // structure.store[RESOURCE_ENERGY] < structure.store.getCapacity();
                }
            });


        if(targets.length > 0) {
            const closest = this.pos.findClosestByRange(targets);

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
        const targets = this.room.getEnergyStructures(true);

        if (targets.length == 0) {
            console.log('WHY ARE YOU HEAR!')
        } else if (this.pos.isNearTo(targets[0])) {
            this.transfer(targets[0], RESOURCE_ENERGY);

            // if (targets.length > 1) {
            //     console.log(this.name + ': travelTo next');
            //                 this.travelTo(targets[1]);
            // }
        } else {
                // console.log(this.name + ': travelTo current');
            
            this.travelTo(targets[0], {range: 1, maxOps: 100, freshMatrix: false, maxRooms: 1});

            // this.moveTo(targets[0])
        }
    };