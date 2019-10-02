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

        if (this.spawning != null) {
            //can't work so don't
        } else if (creepsList.length == 0 && room.energyAvailable > 200) {
            name = 'harvester' + Game.time;
            memory['role'] = 'harvester';
            body = [WORK,CARRY,MOVE];
        } else if (harvesters.length + contharvesters.length == 0 && room.energyAvailable < 700) {
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
        } else if(room.controller.level < 8 && upgraders.length < 2) {
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
            memory['home'] = memory['targetRoom'];
            body = this.genWorker();

            room.memory.remotebuild = "";
        } else if(room.memory.remoteupgrade != "") {
            name = 'remoteupgrader' + Game.time;
            memory['role'] = 'remoteupgrader';
            memory['targetRoom'] = room.memory.remoteupgrade
            memory['home'] = memory['targetRoom'];
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

StructureSpawn.prototype.buildController2 =
    function () {
        if (Game.time%100) {
            if (this.room.controller.level == 2) {
                let temppos = new RoomPosition(this.pos.x-2, this.pos.y+2, this.room.name)
        
                let found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_EXTENSION)
                }
                temppos = new RoomPosition(this.pos.x-1, this.pos.y+2, this.room.name)
        
                found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_EXTENSION)
                }
                temppos = new RoomPosition(this.pos.x-3, this.pos.y+2, this.room.name)
        
                found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_EXTENSION)
                }
                temppos = new RoomPosition(this.pos.x-2, this.pos.y+1, this.room.name)
        
                found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_EXTENSION)
                }
                temppos = new RoomPosition(this.pos.x-2, this.pos.y+3, this.room.name)
        
                found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_EXTENSION)
                }
            } else if (this.room.controller.level == 3) {
                let temppos = new RoomPosition(this.pos.x, this.pos.y+1, this.room.name)
        
                let found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_TOWER)
                }

                temppos = new RoomPosition(this.pos.x+2, this.pos.y-2, this.room.name)
        
                found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_EXTENSION)
                }
                temppos = new RoomPosition(this.pos.x+1, this.pos.y-2, this.room.name)
        
                found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_EXTENSION)
                }
                temppos = new RoomPosition(this.pos.x+3, this.pos.y-2, this.room.name)
        
                found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_EXTENSION)
                }
                temppos = new RoomPosition(this.pos.x+2, this.pos.y-1, this.room.name)
        
                found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_EXTENSION)
                }
                temppos = new RoomPosition(this.pos.x+2, this.pos.y-3, this.room.name)
        
                found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_EXTENSION)
                }
            } else if (this.room.controller.level == 4) {
                let temppos = new RoomPosition(this.pos.x, this.pos.y-1, this.room.name)
        
                let found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_STORAGE)
                }
            }
        }
    }

StructureSpawn.prototype.buildController =
    function() {
        if(Game.time%100 == 0) {
            let rootx = this.pos.x + 1;
            let rooty = this.pos.y;

            this.room.memory.anchor = {'x': rootx, 'y': rooty};

            let level = this.room.controller.level;

            for (let building in layout[level]['buildings']) {
                for (let posmod of layout[level]['buildings'][building]['pos']) {
                    let temppos = new RoomPosition(rootx + posmod.x, rooty + posmod.y, this.room.name);

                    let found = temppos.lookFor(LOOK_STRUCTURES)
                    if (found.length == 0) {
                        if (building == 'spawn') {
                            if (posmod.x == -1) {
                                temppos.createConstructionSite(STRUCTURE_SPAWN, 'spawn1-' + this.room.name.toLowerCase());
                            } else if (posmod.x == -4) {
                                temppos.createConstructionSite(STRUCTURE_SPAWN, 'spawn2-' + this.room.name.toLowerCase());
                            } else if (posmod.x == 4) {
                                temppos.createConstructionSite(STRUCTURE_SPAWN, 'spawn3-' + this.room.name.toLowerCase());
                            }
                        } else if (building == 'extension') {
                            temppos.createConstructionSite(STRUCTURE_EXTENSION)
                        } else if (building == 'tower') {
                            temppos.createConstructionSite(STRUCTURE_TOWER)
                        } else if (building == 'storage') {
                            temppos.createConstructionSite(STRUCTURE_STORAGE)
                        } else if (building == 'terminal') {
                            temppos.createConstructionSite(STRUCTURE_TERMINAL)
                        } else if (building == 'link') {
                            temppos.createConstructionSite(STRUCTURE_LINK)
                        } else if (building == 'lab') {
                            temppos.createConstructionSite(STRUCTURE_LAB)
                        } else if (building == 'powerSpawn') {
                            temppos.createConstructionSite(STRUCTURE_POWER_SPAWN)
                        } else if (building == 'nuker') {
                            temppos.createConstructionSite(STRUCTURE_NUKER)
                        } else if (building == 'road') {
                            temppos.createConstructionSite(STRUCTURE_ROAD)
                        } else if (building == 'observer') {
                            temppos.createConstructionSite(STRUCTURE_OBSERVER)
                        }
                    }
                }
            }
        }
    }

const layout = {
        1: {'name':'layout','shard':'shard0','rcl':'1','buildings':{'spawn':{'pos':[{'x':-1,'y':0}]}}},
        
        2: {'name':'layout','shard':'shard0','rcl':'2','buildings':{'extension':{'pos':[{'x':-2,'y':-3},{'x':-3,'y':-2},{'x':-2,'y':-2},{'x':-4,'y':-1},{'x':-3,'y':-1}]},'spawn':{'pos':[{'x':-1,'y':0}]}}},
        
        3: {'name':'layout','shard':'shard0','rcl':'3','buildings':{'extension':{'pos':[{'x':-2,'y':-3},{'x':-3,'y':-2},{'x':-2,'y':-2},{'x':-4,'y':-1},{'x':-3,'y':-1},{'x':-4,'y':1},{'x':-3,'y':1},{'x':-3,'y':2},{'x':-2,'y':2},{'x':-2,'y':3}]},'tower':{'pos':[{'x':-1,'y':-1}]},'spawn':{'pos':[{'x':-1,'y':0}]}}},
        
        4: {'name':'layout','shard':'shard0','rcl':'4','buildings':{'extension':{'pos':[{'x':-1,'y':-5},{'x':-2,'y':-4},{'x':-1,'y':-4},{'x':-3,'y':-3},{'x':-2,'y':-3},{'x':-1,'y':-3},{'x':-4,'y':-2},{'x':-3,'y':-2},{'x':-2,'y':-2},{'x':-5,'y':-1},{'x':-4,'y':-1},{'x':-3,'y':-1},{'x':-5,'y':1},{'x':-4,'y':1},{'x':-3,'y':1},{'x':-4,'y':2},{'x':-3,'y':2},{'x':-2,'y':2},{'x':-3,'y':3},{'x':-2,'y':3}]},'tower':{'pos':[{'x':-1,'y':-1}]},'spawn':{'pos':[{'x':-1,'y':0}]},'storage':{'pos':[{'x':1,'y':0}]}}},
        
        5: {'name':'layout','shard':'shard0','rcl':'5','buildings':{'extension':{'pos':[{'x':-2,'y':-6},{'x':-4,'y':-5},{'x':-3,'y':-5},{'x':-1,'y':-5},{'x':-5,'y':-4},{'x':-2,'y':-4},{'x':-1,'y':-4},{'x':-5,'y':-3},{'x':-3,'y':-3},{'x':-2,'y':-3},{'x':-1,'y':-3},{'x':-6,'y':-2},{'x':-4,'y':-2},{'x':-3,'y':-2},{'x':-2,'y':-2},{'x':-5,'y':-1},{'x':-4,'y':-1},{'x':-3,'y':-1},{'x':-5,'y':1},{'x':-4,'y':1},{'x':-3,'y':1},{'x':-4,'y':2},{'x':-3,'y':2},{'x':-2,'y':2},{'x':-3,'y':3},{'x':-2,'y':3},{'x':-1,'y':3},{'x':-2,'y':4},{'x':-1,'y':4},{'x':-1,'y':5}]},'tower':{'pos':[{'x':-1,'y':-1},{'x':1,'y':1}]},'spawn':{'pos':[{'x':-1,'y':0}]},'link':{'pos':[{'x':0,'y':0}]},'storage':{'pos':[{'x':1,'y':0}]}}},
        
        6: {'name':'layout','shard':'shard0','rcl':'6','buildings':{'extension':{'pos':[{'x':-2,'y':-6},{'x':-4,'y':-5},{'x':-3,'y':-5},{'x':-1,'y':-5},{'x':-5,'y':-4},{'x':-2,'y':-4},{'x':-1,'y':-4},{'x':-5,'y':-3},{'x':-3,'y':-3},{'x':-2,'y':-3},{'x':-1,'y':-3},{'x':-6,'y':-2},{'x':-4,'y':-2},{'x':-3,'y':-2},{'x':-2,'y':-2},{'x':-5,'y':-1},{'x':-4,'y':-1},{'x':-3,'y':-1},{'x':-5,'y':1},{'x':-4,'y':1},{'x':-3,'y':1},{'x':-6,'y':2},{'x':-4,'y':2},{'x':-3,'y':2},{'x':-2,'y':2},{'x':-5,'y':3},{'x':-3,'y':3},{'x':-2,'y':3},{'x':-1,'y':3},{'x':1,'y':3},{'x':-5,'y':4},{'x':-2,'y':4},{'x':-1,'y':4},{'x':1,'y':4},{'x':2,'y':4},{'x':-4,'y':5},{'x':-3,'y':5},{'x':-1,'y':5},{'x':1,'y':5},{'x':-2,'y':6}]},'road':{'pos':[{'x':-1,'y':-6},{'x':-2,'y':-5},{'x':0,'y':-5},{'x':-3,'y':-4},{'x':0,'y':-4},{'x':-4,'y':-3},{'x':0,'y':-3},{'x':-5,'y':-2},{'x':-1,'y':-2},{'x':0,'y':-2},{'x':1,'y':-2},{'x':-6,'y':-1},{'x':-2,'y':-1},{'x':1,'y':-1},{'x':2,'y':-1},{'x':-5,'y':0},{'x':-4,'y':0},{'x':-3,'y':0},{'x':-2,'y':0},{'x':2,'y':0},{'x':-6,'y':1},{'x':-2,'y':1},{'x':-1,'y':1},{'x':2,'y':1},{'x':-5,'y':2},{'x':-1,'y':2},{'x':0,'y':2},{'x':1,'y':2},{'x':-4,'y':3},{'x':0,'y':3},{'x':-3,'y':4},{'x':0,'y':4},{'x':-2,'y':5},{'x':0,'y':5},{'x':2,'y':5},{'x':-1,'y':6},{'x':1,'y':6}]},'lab':{'pos':[{'x':1,'y':-3},{'x':2,'y':-3},{'x':2,'y':-2}]},'tower':{'pos':[{'x':-1,'y':-1},{'x':1,'y':1}]},'terminal':{'pos':[{'x':0,'y':-1}]},'spawn':{'pos':[{'x':-1,'y':0}]},'link':{'pos':[{'x':0,'y':0}]},'storage':{'pos':[{'x':1,'y':0}]}}},
        
        7: {'name':'layout','shard':'shard0','rcl':'7','buildings':{'extension':{'pos':[{'x':-2,'y':-6},{'x':-4,'y':-5},{'x':-3,'y':-5},{'x':-1,'y':-5},{'x':-5,'y':-4},{'x':-2,'y':-4},{'x':-1,'y':-4},{'x':-5,'y':-3},{'x':-3,'y':-3},{'x':-2,'y':-3},{'x':-1,'y':-3},{'x':-6,'y':-2},{'x':-4,'y':-2},{'x':-3,'y':-2},{'x':-2,'y':-2},{'x':-5,'y':-1},{'x':-4,'y':-1},{'x':-3,'y':-1},{'x':-5,'y':1},{'x':-4,'y':1},{'x':-3,'y':1},{'x':3,'y':1},{'x':4,'y':1},{'x':5,'y':1},{'x':-6,'y':2},{'x':-4,'y':2},{'x':-3,'y':2},{'x':-2,'y':2},{'x':2,'y':2},{'x':3,'y':2},{'x':4,'y':2},{'x':-5,'y':3},{'x':-3,'y':3},{'x':-2,'y':3},{'x':-1,'y':3},{'x':1,'y':3},{'x':2,'y':3},{'x':3,'y':3},{'x':-5,'y':4},{'x':-2,'y':4},{'x':-1,'y':4},{'x':1,'y':4},{'x':2,'y':4},{'x':-4,'y':5},{'x':-3,'y':5},{'x':-1,'y':5},{'x':1,'y':5},{'x':3,'y':5},{'x':-2,'y':6},{'x':2,'y':6}]},'road':{'pos':[{'x':-1,'y':-6},{'x':1,'y':-6},{'x':-2,'y':-5},{'x':0,'y':-5},{'x':1,'y':-5},{'x':2,'y':-5},{'x':-3,'y':-4},{'x':0,'y':-4},{'x':3,'y':-4},{'x':-4,'y':-3},{'x':0,'y':-3},{'x':4,'y':-3},{'x':-5,'y':-2},{'x':-1,'y':-2},{'x':0,'y':-2},{'x':1,'y':-2},{'x':5,'y':-2},{'x':-6,'y':-1},{'x':-2,'y':-1},{'x':1,'y':-1},{'x':2,'y':-1},{'x':5,'y':-1},{'x':6,'y':-1},{'x':-5,'y':0},{'x':-4,'y':0},{'x':-3,'y':0},{'x':-2,'y':0},{'x':2,'y':0},{'x':3,'y':0},{'x':4,'y':0},{'x':5,'y':0},{'x':-6,'y':1},{'x':-2,'y':1},{'x':-1,'y':1},{'x':2,'y':1},{'x':6,'y':1},{'x':-5,'y':2},{'x':-1,'y':2},{'x':0,'y':2},{'x':1,'y':2},{'x':5,'y':2},{'x':-4,'y':3},{'x':0,'y':3},{'x':4,'y':3},{'x':-3,'y':4},{'x':0,'y':4},{'x':3,'y':4},{'x':-2,'y':5},{'x':0,'y':5},{'x':2,'y':5},{'x':-1,'y':6},{'x':1,'y':6}]},'spawn':{'pos':[{'x':-4,'y':-4},{'x':-1,'y':0}]},'lab':{'pos':[{'x':1,'y':-4},{'x':1,'y':-3},{'x':2,'y':-3},{'x':2,'y':-2},{'x':3,'y':-2},{'x':3,'y':-1}]},'tower':{'pos':[{'x':-1,'y':-1},{'x':-6,'y':0},{'x':1,'y':1}]},'terminal':{'pos':[{'x':0,'y':-1}]},'link':{'pos':[{'x':0,'y':0}]},'storage':{'pos':[{'x':1,'y':0}]}}},
        
        8: {'name':'layout','shard':'shard0','rcl':'8','buildings':{'extension':{'pos':[{'x':-2,'y':-6},{'x':2,'y':-6},{'x':-4,'y':-5},{'x':-3,'y':-5},{'x':-1,'y':-5},{'x':3,'y':-5},{'x':4,'y':-5},{'x':-5,'y':-4},{'x':-2,'y':-4},{'x':-1,'y':-4},{'x':5,'y':-4},{'x':-5,'y':-3},{'x':-3,'y':-3},{'x':-2,'y':-3},{'x':-1,'y':-3},{'x':5,'y':-3},{'x':-6,'y':-2},{'x':-4,'y':-2},{'x':-3,'y':-2},{'x':-2,'y':-2},{'x':6,'y':-2},{'x':-5,'y':-1},{'x':-4,'y':-1},{'x':-3,'y':-1},{'x':-5,'y':1},{'x':-4,'y':1},{'x':-3,'y':1},{'x':3,'y':1},{'x':4,'y':1},{'x':5,'y':1},{'x':-6,'y':2},{'x':-4,'y':2},{'x':-3,'y':2},{'x':-2,'y':2},{'x':2,'y':2},{'x':3,'y':2},{'x':4,'y':2},{'x':6,'y':2},{'x':-5,'y':3},{'x':-3,'y':3},{'x':-2,'y':3},{'x':-1,'y':3},{'x':1,'y':3},{'x':2,'y':3},{'x':3,'y':3},{'x':5,'y':3},{'x':-5,'y':4},{'x':-2,'y':4},{'x':-1,'y':4},{'x':1,'y':4},{'x':2,'y':4},{'x':5,'y':4},{'x':-4,'y':5},{'x':-3,'y':5},{'x':-1,'y':5},{'x':1,'y':5},{'x':3,'y':5},{'x':4,'y':5},{'x':-2,'y':6},{'x':2,'y':6}]},'road':{'pos':[{'x':-1,'y':-6},{'x':1,'y':-6},{'x':-2,'y':-5},{'x':0,'y':-5},{'x':1,'y':-5},{'x':2,'y':-5},{'x':-3,'y':-4},{'x':0,'y':-4},{'x':3,'y':-4},{'x':-4,'y':-3},{'x':0,'y':-3},{'x':4,'y':-3},{'x':-5,'y':-2},{'x':-1,'y':-2},{'x':0,'y':-2},{'x':1,'y':-2},{'x':5,'y':-2},{'x':-6,'y':-1},{'x':-2,'y':-1},{'x':1,'y':-1},{'x':2,'y':-1},{'x':5,'y':-1},{'x':6,'y':-1},{'x':-5,'y':0},{'x':-4,'y':0},{'x':-3,'y':0},{'x':-2,'y':0},{'x':2,'y':0},{'x':3,'y':0},{'x':4,'y':0},{'x':5,'y':0},{'x':-6,'y':1},{'x':-2,'y':1},{'x':-1,'y':1},{'x':2,'y':1},{'x':6,'y':1},{'x':-5,'y':2},{'x':-1,'y':2},{'x':0,'y':2},{'x':1,'y':2},{'x':5,'y':2},{'x':-4,'y':3},{'x':0,'y':3},{'x':4,'y':3},{'x':-3,'y':4},{'x':0,'y':4},{'x':3,'y':4},{'x':-2,'y':5},{'x':0,'y':5},{'x':2,'y':5},{'x':-1,'y':6},{'x':1,'y':6}]},'tower':{'pos':[{'x':0,'y':-6},{'x':-1,'y':-1},{'x':-6,'y':0},{'x':6,'y':0},{'x':1,'y':1},{'x':0,'y':6}]},'spawn':{'pos':[{'x':-4,'y':-4},{'x':-1,'y':0},{'x':4,'y':4}]},'lab':{'pos':[{'x':1,'y':-4},{'x':2,'y':-4},{'x':1,'y':-3},{'x':2,'y':-3},{'x':3,'y':-3},{'x':2,'y':-2},{'x':3,'y':-2},{'x':4,'y':-2},{'x':3,'y':-1},{'x':4,'y':-1}]},'observer':{'pos':[{'x':4,'y':-4}]},'terminal':{'pos':[{'x':0,'y':-1}]},'link':{'pos':[{'x':0,'y':0}]},'storage':{'pos':[{'x':1,'y':0}]},'nuker':{'pos':[{'x':0,'y':1}]},'powerSpawn':{'pos':[{'x':-4,'y':4}]}}},

        0: {'name':'textExport','shard':'shard0','rcl':'8','buildings':{'road':{'pos':[{'x':-2,'y':-6},{'x':-1,'y':-6},{'x':0,'y':-6},{'x':1,'y':-6},{'x':2,'y':-6},{'x':-4,'y':-5},{'x':-3,'y':-5},{'x':-2,'y':-5},{'x':-1,'y':-5},{'x':0,'y':-5},{'x':1,'y':-5},{'x':2,'y':-5},{'x':3,'y':-5},{'x':4,'y':-5},{'x':-5,'y':-4},{'x':-4,'y':-4},{'x':-3,'y':-4},{'x':-2,'y':-4},{'x':-1,'y':-4},{'x':0,'y':-4},{'x':1,'y':-4},{'x':2,'y':-4},{'x':3,'y':-4},{'x':4,'y':-4},{'x':5,'y':-4},{'x':-5,'y':-3},{'x':-4,'y':-3},{'x':-3,'y':-3},{'x':-2,'y':-3},{'x':-1,'y':-3},{'x':0,'y':-3},{'x':1,'y':-3},{'x':2,'y':-3},{'x':3,'y':-3},{'x':4,'y':-3},{'x':5,'y':-3},{'x':-6,'y':-2},{'x':-5,'y':-2},{'x':-4,'y':-2},{'x':-3,'y':-2},{'x':-2,'y':-2},{'x':-1,'y':-2},{'x':0,'y':-2},{'x':1,'y':-2},{'x':2,'y':-2},{'x':3,'y':-2},{'x':4,'y':-2},{'x':5,'y':-2},{'x':6,'y':-2},{'x':-6,'y':-1},{'x':-5,'y':-1},{'x':-4,'y':-1},{'x':-3,'y':-1},{'x':-2,'y':-1},{'x':-1,'y':-1},{'x':0,'y':-1},{'x':1,'y':-1},{'x':2,'y':-1},{'x':3,'y':-1},{'x':4,'y':-1},{'x':5,'y':-1},{'x':6,'y':-1},{'x':-6,'y':0},{'x':-5,'y':0},{'x':-4,'y':0},{'x':-3,'y':0},{'x':-2,'y':0},{'x':-1,'y':0},{'x':0,'y':0},{'x':1,'y':0},{'x':2,'y':0},{'x':3,'y':0},{'x':4,'y':0},{'x':5,'y':0},{'x':6,'y':0},{'x':-6,'y':1},{'x':-5,'y':1},{'x':-4,'y':1},{'x':-3,'y':1},{'x':-2,'y':1},{'x':-1,'y':1},{'x':0,'y':1},{'x':1,'y':1},{'x':2,'y':1},{'x':3,'y':1},{'x':4,'y':1},{'x':5,'y':1},{'x':6,'y':1},{'x':-6,'y':2},{'x':-5,'y':2},{'x':-4,'y':2},{'x':-3,'y':2},{'x':-2,'y':2},{'x':-1,'y':2},{'x':0,'y':2},{'x':1,'y':2},{'x':2,'y':2},{'x':3,'y':2},{'x':4,'y':2},{'x':5,'y':2},{'x':6,'y':2},{'x':-5,'y':3},{'x':-4,'y':3},{'x':-3,'y':3},{'x':-2,'y':3},{'x':-1,'y':3},{'x':0,'y':3},{'x':1,'y':3},{'x':2,'y':3},{'x':3,'y':3},{'x':4,'y':3},{'x':5,'y':3},{'x':-5,'y':4},{'x':-4,'y':4},{'x':-3,'y':4},{'x':-2,'y':4},{'x':-1,'y':4},{'x':0,'y':4},{'x':1,'y':4},{'x':2,'y':4},{'x':3,'y':4},{'x':4,'y':4},{'x':5,'y':4},{'x':-4,'y':5},{'x':-3,'y':5},{'x':-2,'y':5},{'x':-1,'y':5},{'x':0,'y':5},{'x':1,'y':5},{'x':2,'y':5},{'x':3,'y':5},{'x':4,'y':5},{'x':-2,'y':6},{'x':-1,'y':6},{'x':0,'y':6},{'x':1,'y':6},{'x':2,'y':6}]}}}
}