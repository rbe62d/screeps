require('prototype.creep');
require('prototype.tower');
require('prototype.spawn')

module.exports.loop = function () {

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    let t = Game.time
    if (t%1500 == 0) {
        Game.rooms.W5N3.memory.remotebuild = "w4n3"
        // console.log("remote w7n3")
    } else if ((t+500)%1500  == 0) {
        // Game.rooms.W8N3.memory.remotebuild = "w8n2"
        // console.log("remote w7n4")
    } else if ((t+1000)%1500  == 0) {
        // Game.rooms.W8N3.memory.remotebuild = "w7n4"
        // console.log("remote w7n4")
    }

    for (let spawnName in Game.spawns) {
        Game.spawns[spawnName].spawnController();

        if (Game.time%100) {
            if (Game.spawns[spawnName].room.controller.level == 3) {
                let temppos = new RoomPosition(Game.spawns[spawnName].pos.x, Game.spawns[spawnName].pos.y+1, Game.spawns[spawnName].room.name)
        
                const found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_TOWER)
                } 
            } else if (Game.spawns[spawnName].room.controller.level == 4) {
                let temppos = new RoomPosition(Game.spawns[spawnName].pos.x, Game.spawns[spawnName].pos.y-1, Game.spawns[spawnName].room.name)
        
                const found = temppos.lookFor(LOOK_STRUCTURES)
                if (found.length == 0) {
                    temppos.createConstructionSite(STRUCTURE_STORAGE)
                } 
            }
        }
    }

    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        tower.runRole();
    }


    for(var name in Game.creeps) {
        Game.creeps[name].runRole();
    }
}