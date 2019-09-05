StructureSpawn.prototype.spawnController = 
    function() {
        let room = this.room;

        let creepsList = _.filter(Game.creeps, c => c.memory.home == room.name);

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

        if (creepsList.length == 0 && room.energyAvailable > 200) {
            name = 'harvester' + Game.time;
            memory['role'] = 'harvester';
            body = [WORK,CARRY,MOVE];
        } else if(room.energyAvailable < 800 && harvesters.length < 6) {
            name = 'harvester' + Game.time;
            memory['role'] = 'harvester';
            if (room.energyAvailable > 600) {
                body = [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
            } else if (room.energyAvailable > 400) {
                body = [WORK,WORK,CARRY,CARRY,MOVE,MOVE];
            } else if (room.energyAvailable > 200) {
                body = [WORK,CARRY,MOVE];
            }
        } else if(room.energyAvailable >= 800 && contharvesters.length < sources.length) {
            name = 'contharvester' + Game.time;
            memory['role'] = 'contharvester';
            if (room.energyAvailable > 600) {
                body = [WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE];

                for (let source of sources) {
                    if (!_.some(creepsList, c => c.memory.role == 'contharvester' && c.memory.sourceID == source.id)) {
                        memory['sourceID'] = source.id;
                    }
                }
            }
        } else if(ferrys.length < 1 /*contharvesters.length*/) {
            name = 'ferry' + Game.time;
            memory['role'] = 'ferry';

            if (room.energyAvailable > 1200) {
                body = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
            } else if (room.energyAvailable > 600) {
                body = [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
            } else if (room.energyAvailable > 400) {
                body = [CARRY,CARRY,CARRY,CARRY,
                        MOVE,MOVE,MOVE,MOVE];
            } else if (room.energyAvailable > 200) {
                body = [CARRY,CARRY,
                        MOVE,MOVE];
            }
        } else if(csites.length > 0 && builders.length < 2 && upgraders.length + builders.length < 2) {
            name = 'builder' + Game.time;
            memory['role'] = 'builder';
            if (room.energyAvailable > 1200) {
                body = [WORK,WORK,WORK,WORK,WORK,WORK,
                        CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
                        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
            } else if (room.energyAvailable > 600) {
                body = [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
            } else if (room.energyAvailable > 400) {
                body = [WORK,WORK,CARRY,CARRY,MOVE,MOVE];
            } else if (room.energyAvailable > 200) {
                body = [WORK,CARRY,MOVE];
            }
        } else if(upgraders.length + builders.length < 1) {
            name = 'upgrader' + Game.time;
            memory['role'] = 'upgrader';
            if (room.energyAvailable > 600) {
                body = [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE];
            } else if (room.energyAvailable > 400) {
                body = [WORK,WORK,CARRY,CARRY,MOVE,MOVE];
            } else if (room.energyAvailable > 200) {
                body = [WORK,CARRY,MOVE];
            }
        }

        if (!this.spawning && name != undefined && body.length != 0) {
            console.log('Spawning new ' + memory['role'] + ' for room ' + memory['home'] + ': ' + name);
            // this.spawnCreep(body, name, {memory: {role: role, home: home}});
            
            this.spawnCreep(body, name, {memory: memory})
        }
    };