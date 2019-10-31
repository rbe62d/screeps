StructureTerminal.prototype.runRole =
    function() {
        if (this.cooldown == 0) {
            const targetRoom = this.room.name

            for (let resource in this.store) {
                // console.log(targetRoom + ' has: ' + resource)
                let orders = Game.market.getAllOrders(order => order.resourceType == resource &&
                    order.type == ORDER_BUY && Game.market.calcTransactionCost(Math.min(this.store[resource], order.remainingAmount), targetRoom, order.roomName) <= this.store[RESOURCE_ENERGY]);

                if (orders.length > 0) {
                    let amt = Math.min(this.store[resource], orders[0].remainingAmount);
                    Game.market.deal(orders[0].id, amt, this.room.name);
                    break;
                }
            }
        }
    }