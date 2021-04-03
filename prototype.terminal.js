StructureTerminal.prototype.runRole =
    function() {
        if (this.cooldown == 0) {
            const targetRoom = this.room.name

            // if (Game.market.credits > 10000) {}

            if (Game.market.credits > 10000 && (this.room.storage == undefined || this.room.storage.store[RESOURCE_ENERGY] < 50000)) {
                // let amt = Math.min(this.store.getFreeCapacity(), , order.remainingAmount)
                let wantAmt = this.store.getFreeCapacity();
                if (this.room.storage == undefined) {
                    wantAmt = Math.min(wantAmt, 50000);
                } else {
                    wantAmt = Math.min(wantAmt, 50000 - this.store[RESOURCE_ENERGY]);
                }

                // let orders = Game.market.getAllOrders(order => order.resourceType == RESOURCE_ENERGY && order.type == ORDER_BUY
                //     && order.roomName == targetRoom);
                
                // if (orders.length == 0) {
                //     Game.market.createOrder({
                //         type: ORDER_BUY,
                //         resourceType: RESOURCE_ENERGY,
                //         price: 3,
                //         totalAmount: wantAmt,
                //         roomName: targetRoom
                //     });
                // }

                let orders = Game.market.getAllOrders(order => order.resourceType == RESOURCE_ENERGY &&
                        order.type == ORDER_SELL && Game.market.calcTransactionCost(wantAmt, targetRoom, order.roomName) <= this.store[RESOURCE_ENERGY]);

                if (orders.length > 0) {
                    let amt = Math.min(this.store[RESOURCE_ENERGY], orders[0].remainingAmount);
                    Game.market.deal(orders[0].id, amt, this.room.name);
                    // break;
                }
            } else {
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
    }