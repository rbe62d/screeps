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
        // Game.rooms.W5N3.memory.remotebuild = "w5n1"
        // Game.rooms.W7N2.memory.remotebuild = "w6n1"
        // console.log("remote w7n3")
    } else if ((t+500)%1500  == 0) {
        // Game.rooms.W5N3.memory.remotebuild = "w5n1"
        // Game.rooms.W7N2.memory.remotebuild = "w6n1"
        // Game.rooms.W8N3.memory.remotebuild = "w8n2"
        // console.log("remote w7n4")
    } else if ((t+1000)%1500  == 0) {
        // Game.rooms.W5N3.memory.remotebuild = "w5n1"
        // Game.rooms.W7N2.memory.remotebuild = "w6n1"
        // Game.rooms.W8N3.memory.remotebuild = "w7n4"
        // console.log("remote w7n4")
    }

    for (let spawnName in Game.spawns) {
        Game.spawns[spawnName].spawnController();
        // Game.spawns[spawnName].buildController2();

        let name = spawnName.substring(0,6);
        if (name == 'spawn1') {
            Game.spawns[spawnName].buildController();
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