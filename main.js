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

    for (let spawnName in Game.spawns) {
        Game.spawns[spawnName].spawnController();
    }

    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        tower.runRole();
    }


    for(var name in Game.creeps) {
        Game.creeps[name].runRole();
    }
}