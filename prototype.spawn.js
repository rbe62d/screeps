StructureSpawn.prototype.spawnController = 
    function() {
        let room = this.room;

        let creepsList = _.filter(Game.creeps, c => c.memory.home == room.name);

        let harvesters = _.filter(creepsList, c => c.memory.role == 'harvester');
        let contharvesters = _.filter(creepsList, c => c.memory.role == 'contharvester');
        let ferrys = _.filter(creepsList, c => c.memory.role == 'ferry');
        let upgraders = _.filter(creepsList, c => c.memory.role == 'upgrader');
        let builders = _.filter(creepsList, c => c.memory.role == 'builder');
        let emans = _.filter(creepsList, c => c.memory.role == 'eman');
        let scouts = _.filter(creepsList, c => c.memory.role == 'scout');
        let remotedestroys = _.filter(creepsList, c => c.memory.role == 'remotedestroy');
        let minferrys = _.filter(creepsList, c => c.memory.role == 'minferry');
        let minharvesters = _.filter(creepsList, c => c.memory.role == 'minharvester');

        let csites = room.find(FIND_MY_CONSTRUCTION_SITES);
        let mins = room.find(FIND_MINERALS)[0];
        let extractor = mins.pos.findInRange(FIND_STRUCTURES, 0, {filter: s => s.structureType == STRUCTURE_EXTRACTOR})[0];
        let mincont = mins.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType == STRUCTURE_CONTAINER})[0];

        let name;
        let body = [];
        let mem = {
            home: room.name
        }


        if (room.controller.level >= 3 && remotedestroys.length < 1 && Game.time % 1500 == 0) {
            let abandonedrooms = [];
            for (let ruum in Memory.roomData) {
                if (room.memory.nearby.indexOf(ruum) >= 0 && Game.map.getRoomLinearDistance(room.name, ruum) <= 2 && Memory.roomData[ruum].type == 'abandoned') {
                    abandonedrooms.push(ruum)
                }
            }
            if (abandonedrooms.length > 0) {
               room.memory.remotedestroy = abandonedrooms[0];
            }
        }

        let sources = room.find(FIND_SOURCES);

        if (this.spawning != null) {
            //can't work so don't
        } else if (creepsList.length == 0 && room.energyAvailable > 200) {
            name = 'harvester' + Game.time;
            mem['role'] = 'harvester';
            body = this.genWorker();
        } else if (harvesters.length + contharvesters.length == 0 && room.energyAvailable < 700) {
            name = 'harvester' + Game.time;
            mem['role'] = 'harvester';
            body = this.genWorker();
        } else if(room.energyCapacityAvailable < 700 && harvesters.length < 5) {
            name = 'harvester' + Game.time;
            mem['role'] = 'harvester';
            body = this.genWorker();
        } else if (room.storage != undefined && emans.length < 1) {
            name = 'eman' + Game.time;
            mem['role'] = 'eman';
            body = this.genEman();
        } else if(ferrys.length < 1 && contharvesters.length > 0) {
            name = 'ferry' + Game.time;
            mem['role'] = 'ferry';
            body = this.genFerry();
        } else if(ferrys.length < contharvesters.length && room.energyCapacityAvailable < 1200) {
            name = 'ferry' + Game.time;
            mem['role'] = 'ferry';
            body = this.genFerry();
        } else if(room.energyCapacityAvailable >= 700 && contharvesters.length < sources.length) {
            name = 'contharvester' + Game.time;
            mem['role'] = 'contharvester';
            if (room.energyAvailable > 600) {
                body = [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE];

                for (let source of sources) {
                    if (!_.some(creepsList, c => c.memory.role == 'contharvester' && c.memory.sourceID == source.id)) {
                        mem['sourceID'] = source.id;
                    }
                }
            }
        } else if(room.controller.level == 8 && upgraders.length < 1) {
            name = 'upgrader' + Game.time;
            mem['role'] = 'upgrader';
            body = this.genWorker();
        } else if(room.controller.level < 8 && upgraders.length < 3) {
            name = 'upgrader' + Game.time;
            mem['role'] = 'upgrader';
            body = this.genWorker();
        } else if(csites.length > 0 && builders.length < 1) {
            name = 'builder' + Game.time;
            mem['role'] = 'builder';
            body = this.genWorker();
        // } else if (scouts.length < 1) {
        } else if (room.controller.level >= 6 && mins.mineralAmount > 0 && extractor != undefined && mincont != undefined && minharvesters.length < 1) {
            name = 'minharvester' + Game.time;
            mem['role'] = 'minharvester';
            body = this.genMinHarvester();
        } else if (minferrys.length < minharvesters.length) {
            name = 'minferry' + Game.time;
            mem['role'] = 'minferry';
            body = this.genFerry();
        } else if (scouts.length < 1 && room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_OBSERVER}).length == 0) {
            name = 'scout' + Game.time;
            mem['role'] = 'scout';
            body = [MOVE];
        } else if(room.memory.claim != "") {
            name = 'claimer' + Game.time;
            mem['role'] = 'claimer';
            mem['targetRoom'] = room.memory.claim
            if (room.energyAvailable > 650) {
                body = [CLAIM, MOVE];
            }
            room.memory.claim = "";
        } else if(room.memory.remotebuild != "") {
            name = 'remotebuilder' + Game.time;
            mem['role'] = 'remotebuilder';
            mem['targetRoom'] = room.memory.remotebuild
            mem['home'] = mem['targetRoom'];
            body = this.genWorker();

            room.memory.remotebuild = "";
        } else if(room.memory.remoteupgrade != "") {
            name = 'remoteupgrader' + Game.time;
            mem['role'] = 'remoteupgrader';
            mem['targetRoom'] = room.memory.remoteupgrade
            mem['home'] = mem['targetRoom'];
            body = this.genWorker();

            room.memory.remoteupgrade = "";
        } else if(room.memory.remotedestroy != "") {
            name = 'remotedestroyer' + Game.time;
            mem['role'] = 'remotedestroyer';
            mem['targetRoom'] = room.memory.remotedestroy
            body = this.genDestroyer();

            room.memory.remotedestroy = "";
        } 

        if (!this.spawning && name != undefined && body.length != 0) {
            let energyOrder = this.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_EXTENSION && (Math.abs(this.room.memory.anchor.x - s.pos.x) + Math.abs(this.room.memory.anchor.y - s.pos.y) <= 5)});

            let moreExt = this.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_EXTENSION && (Math.abs(this.room.memory.anchor.x - s.pos.x) + Math.abs(this.room.memory.anchor.y - s.pos.y) > 5)})
            energyOrder = energyOrder.concat(moreExt);
            let spawns = this.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_SPAWN})
            energyOrder = energyOrder.concat(spawns);

            this.spawnCreep(body, name, {memory: mem, energyStructures: energyOrder})
        }
    };

StructureSpawn.prototype.genWorker = 
    function() {
        let body = [];

        if (this.room.storage != undefined && this.room.storage.store[RESOURCE_ENERGY] > 100000) {
            let numberOfParts = Math.floor(this.room.energyAvailable / 200);
            numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
            for (let i = 0; i < numberOfParts; i++) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
            }
        } else {
            let numberOfParts = Math.floor(this.room.energyAvailable / 200);
            numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3), 6);
            for (let i = 0; i < numberOfParts; i++) {
                body.push(WORK);
                body.push(CARRY);
                body.push(MOVE);
            }
        }

        return body;
    }

StructureSpawn.prototype.genFerry =
    function() {
        let body = [];
        if (this.room.controller.level < 4) {
            let numberOfParts = Math.floor(this.room.energyAvailable / 100);
            numberOfParts = Math.min(numberOfParts, Math.floor(50 / 2));
            for (let i = 0; i < numberOfParts; i++) {
                body.push(CARRY);
                body.push(MOVE);
            }
        } else {
            let numberOfParts = Math.floor(this.room.energyAvailable / 150);
            numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
            for (let i = 0; i < numberOfParts; i++) {
                body.push(CARRY);
                body.push(CARRY);
                body.push(MOVE);
            }
        }
        return body;
    }

StructureSpawn.prototype.genEman =
    function() {
        let body = [];

        let numberOfParts = Math.floor(this.room.energyAvailable / 150);
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
            body.push(CARRY);
            body.push(MOVE);
        }
        return body;
    }

StructureSpawn.prototype.genDestroyer =
    function() {
        let body = [];

        let numberOfParts = Math.floor(this.room.energyAvailable / 150);
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 2));
        for (let i = 0; i < numberOfParts; i++) {
            body.push(WORK);
            body.push(MOVE);
        }
        return body;
    }

StructureSpawn.prototype.genMinHarvester =
    function() {
        let body = [];

        let numberOfParts = Math.floor(this.room.energyAvailable / 350);
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 4));
        for (let i = 0; i < numberOfParts; i++) {
            body.push(WORK);
            body.push(WORK);
            body.push(WORK);
            body.push(MOVE);
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

            this.room.memory.type = 'base';

            this.room.memory.anchor = {'x': rootx, 'y': rooty};

            let level = this.room.controller.level;

            let roadAnchors = []
            roadAnchors.push(new RoomPosition(rootx+7, rooty, this.room.name));
            roadAnchors.push(new RoomPosition(rootx-7, rooty, this.room.name));
            roadAnchors.push(new RoomPosition(rootx, rooty+7, this.room.name));
            roadAnchors.push(new RoomPosition(rootx, rooty-7, this.room.name));

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
                            // temppos.createConstructionSite(STRUCTURE_POWER_SPAWN)
                        } else if (building == 'nuker') {
                            // temppos.createConstructionSite(STRUCTURE_NUKER)
                        } else if (building == 'road') {
                            temppos.createConstructionSite(STRUCTURE_ROAD)
                        } else if (building == 'observer') {
                            temppos.createConstructionSite(STRUCTURE_OBSERVER)
                        }
                    }
                }
            }

            if (level >= 4) {
                let sources = this.room.find(FIND_SOURCES);

                for (let i in sources) {
                    let source = sources[i];

                    let target = source.pos.findClosestByPath(roadAnchors, {ignoreCreeps: true});

                    if (target != null && target != undefined) {
                        let path = source.pos.findPathTo(target, {swampCost: 1.01, ignoreCreeps: true});

                        for (let square of path) {
                            let temppos = new RoomPosition(square['x'], square['y'], this.room.name);
                            temppos.createConstructionSite(STRUCTURE_ROAD);
                        }
                    }
                }

                let controller = this.room.controller;

                let target = controller.pos.findClosestByPath(roadAnchors, {ignoreCreeps: true});

                if (target != null && target != undefined) {
                    let path = controller.pos.findPathTo(target, {swampCost: 1.01, ignoreCreeps: true});

                    for (let square of path) {
                        let temppos = new RoomPosition(square['x'], square['y'], this.room.name);
                        temppos.createConstructionSite(STRUCTURE_ROAD);
                    }
                }
            }
            if (level >= 6) {
                let mins = this.room.find(FIND_MINERALS)[0];
                let extractor = this.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_EXTRACTOR})[0];

                if (extractor == undefined) {
                    mins.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
                }

                let target = mins.pos.findClosestByPath(roadAnchors, {ignoreCreeps: true});
                if (target != null && target != undefined) {
                    let path = mins.pos.findPathTo(target, {swampCost: 1.01, ignoreCreeps: true});

                    for (let square of path) {
                        let temppos = new RoomPosition(square['x'], square['y'], this.room.name);
                        temppos.createConstructionSite(STRUCTURE_ROAD);
                    }


                    let temppos = new RoomPosition(path[0]['x'], path[0]['y'], this.room.name);
                    temppos.createConstructionSite(STRUCTURE_CONTAINER);
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