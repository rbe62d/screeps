StructureSpawn.prototype.spawnController = 
    function() {
        let room = this.room;

        let creepsList = _.filter(Game.creeps, c => c.room.name == room.name);

        let harvesters = _.filter(creepsList, c => c.memory.role == 'harvester');
        let contharvesters = _.filter(creepsList, c => c.memory.role == 'contharvester');
        let ferrys = _.filter(creepsList, c => c.memory.role == 'ferry');
        let upgraders = _.filter(creepsList, c => c.memory.role == 'upgrader');
        let builders = _.filter(creepsList, c => c.memory.role == 'builder');

        let csites = room.find(FIND_MY_CONSTRUCTION_SITES);

        let name;
        let body = [];
        let memory = {
            home: room.name
        }

        let sources = room.find(FIND_SOURCES);

        if (this.spawning != null) {
            //can't work so don't
        } else if (creepsList.length == 0 && room.energyAvailable > 200) {
            name = 'harvester' + Game.time;
            memory['role'] = 'harvester';
            body = [WORK,CARRY,MOVE];
        } else if (harvesters.length + contharvesters.length == 0) {
            name = 'harvester' + Game.time;
            memory['role'] = 'harvester';
            body = this.genWorker();
        } else if(room.energyCapacityAvailable < 700 && harvesters.length < 5) {
            name = 'harvester' + Game.time;
            memory['role'] = 'harvester';
            body = this.genWorker();
        } else if(ferrys.length < 1 && contharvesters.length > 0) {
            name = 'ferry' + Game.time;
            memory['role'] = 'ferry';
            body = this.genFerry();
        } else if(ferrys.length < contharvesters.length && room.energyCapacityAvailable < 1200) {
            name = 'ferry' + Game.time;
            memory['role'] = 'ferry';
            body = this.genFerry();
        } else if(room.energyCapacityAvailable >= 700 && contharvesters.length < sources.length) {
            name = 'contharvester' + Game.time;
            memory['role'] = 'contharvester';
            if (room.energyAvailable > 600) {
                body = [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE];

                for (let source of sources) {
                    if (!_.some(creepsList, c => c.memory.role == 'contharvester' && c.memory.sourceID == source.id)) {
                        memory['sourceID'] = source.id;
                    }
                }
            }
        } else if(room.controller.level == 8 && upgraders.length < 1) {
            name = 'upgrader' + Game.time;
            memory['role'] = 'upgrader';
            body = this.genWorker();
        } else if(room.controller.level < 8 && upgraders.length < 3) {
            name = 'upgrader' + Game.time;
            memory['role'] = 'upgrader';
            body = this.genWorker();
        } else if(csites.length > 0 && builders.length < 1) {
            name = 'builder' + Game.time;
            memory['role'] = 'builder';
            body = this.genWorker();
        } else if(room.memory.claim != "") {
            name = 'claimer' + Game.time;
            memory['role'] = 'claimer';
            memory['targetRoom'] = room.memory.claim
            if (room.energyAvailable > 650) {
                body = [CLAIM, MOVE];
            }
            room.memory.claim = "";
        } else if(room.memory.remotebuild != "") {
            name = 'remotebuilder' + Game.time;
            memory['role'] = 'remotebuilder';
            memory['targetRoom'] = room.memory.remotebuild
            body = this.genWorker();

            room.memory.remotebuild = "";
        } else if(room.memory.remoteupgrade != "") {
            name = 'remoteupgrader' + Game.time;
            memory['role'] = 'remoteupgrader';
            memory['targetRoom'] = room.memory.remoteupgrade
            body = this.genWorker();

            room.memory.remoteupgrade = "";
        }

        // Game.rooms.W8N3.memory.remoteupgrade = ""
        // Game.rooms.W8N3.memory.remotebuild = ""
        // Game.rooms.W8N3.memory.claim = ""
        if (!this.spawning && name != undefined && body.length != 0) {
            console.log('Spawning new ' + memory['role'] + ' for room ' + memory['home'] + ': ' + name);
            
            this.spawnCreep(body, name, {memory: memory})
        }
    };

StructureSpawn.prototype.genWorker = 
    function() {
        let body = [];
            if (this.room.storage != undefined && this.room.storage.store[RESOURCE_ENERGY] > 100000 && this.room.energyAvailable > 2400) {
                body = [WORK,WORK,WORK,WORK,WORK,WORK,
                        WORK,WORK,WORK,WORK,WORK,WORK,
                        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
            } else if (this.room.storage != undefined && this.room.storage.store[RESOURCE_ENERGY] > 100000 && this.room.energyAvailable > 1800) {
                body = [WORK,WORK,WORK,WORK,WORK,WORK,
                        WORK,WORK,WORK,
                        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                        CARRY,CARRY,CARRY,
                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                        MOVE,MOVE,MOVE];
            } else if (this.room.energyAvailable > 1200) {
                body = [WORK,WORK,WORK,WORK,WORK,WORK,
                        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
            } else if (this.room.energyAvailable > 600) {
                body = [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
            } else if (this.room.energyAvailable > 400) {
                body = [WORK,WORK,CARRY,CARRY,MOVE,MOVE];
            } else if (this.room.energyAvailable > 200) {
                body = [WORK,CARRY,MOVE];
            }

        return body;
    }

StructureSpawn.prototype.genFerry =
    function() {
        let body = [];
        if (this.room.energyAvailable > 2400) {
            body = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        } else if (this.room.energyAvailable > 1800) {
            body = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        } else if (this.room.energyAvailable > 1200) {
            body = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        } else if (this.room.energyAvailable > 600) {
            body = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
        } else if (this.room.energyAvailable > 400) {
            body = [CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE];
        } else if (this.room.energyAvailable > 200) {
            body = [CARRY,CARRY,
                    MOVE,MOVE];
        }
        return body;
    }