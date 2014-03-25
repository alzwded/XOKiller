function Plyr(x, y) {
    var self = this
    self.room = null
    self.clickFrames = 0
    self.pos = {
        x: 90,
        y: 110,
    }
    self.translateToRoomCoordinates = function(newP) {
        return {
            x: (newP.x + self.pos.x - self.room.x + 320) / (self.room.map.width() * self.room.map.cellL()),
            y: (newP.y + self.pos.y - self.room.y + 240) / (self.room.map.height() * self.room.map.cellL()),
        }
    }

    self.tryMovePC = function(newP, p, oldP) {
        var room = self.room
        var xCell = enem_cell(p.x, room.map.width())
        var yCell = enem_cell(p.y, room.map.height())
        var oldXCell = enem_cell(oldP.x, room.map.width())
        var oldYCell = enem_cell(oldP.y, room.map.height())

        if(xCell < 0 && room.adjacent[2]) {
            if(enem_can(room.adjacent[2].map, xCell + self.room.adjacent[2].map.width(), yCell)) {
                self.pos.x += newP.x
                self.pos.y += newP.y
                self.room = self.room.adjacent[2]
                return true
            } else if(enem_can(room.adjacent[2].map, xCell + self.room.adjacent[2].map.width(), oldYCell)) {
                self.pos.x += newP.x
                self.room = self.room.adjacent[2]
                return true
            }
        } else if(xCell >= self.room.map.width() && self.room.adjacent[0]) {
            if(enem_can(self.room.adjacent[0].map, xCell - self.room.map.width(), yCell)) {
                self.pos.x += newP.x
                self.pos.y += newP.y
                self.room = self.room.adjacent[0]
                return true
            } else if(enem_can(self.room.adjacent[0].map, xCell - self.room.map.width(), oldYCell)) {
                self.pos.x += newP.x
                self.room = self.room.adjacent[0]
                return true
            }
        } else if(yCell < 0 && self.room.adjacent[1]) {
            if(enem_can(self.room.adjacent[1].map, xCell, yCell + self.room.adjacent[1].map.height())) {
                self.pos.x += newP.x
                self.pos.y += newP.y
                self.room = self.room.adjacent[1]
                return true
            } else if(enem_can(self.room.adjacent[1].map, oldXCell, yCell + self.room.adjacent[1].map.height())) {
                self.pos.y += newP.y
                self.room = self.room.adjacent[1]
                return true
            }
        } else if(yCell >= self.room.map.height() && self.room.adjacent[3]) {
            if(enem_can(self.room.adjacent[3].map, xCell, yCell - self.room.map.height())) {
                self.pos.x += newP.x
                self.pos.y += newP.y
                self.room = self.room.adjacent[3]
                return true
            } else if(enem_can(self.room.adjacent[3].map, oldXCell, yCell - self.room.map.height())) {
                self.pos.y += newP.y
                self.room = self.room.adjacent[3]
                return true
            }
        }

        if(enem_can(self.room.map, xCell, yCell)) {
            self.pos.x += newP.x
            self.pos.y += newP.y
            return true
        } else if(enem_can(self.room.map, oldXCell, yCell)) {
            self.pos.y += newP.y
            return true
        } else if(enem_can(self.room.map, xCell, oldYCell)) {
            self.pos.x += newP.x
            return true
        }
        return false
    }

    self.move = function() {
        var speed = 5
        var newP = processInput(speed)
        var pInRoom = self.translateToRoomCoordinates(newP)
        var room = self.room
        var oldP = {
            x: (self.pos.x - room.x + 320) / (room.map.width() * room.map.cellL()),
            y: (self.pos.y - room.y + 240) / (room.map.height() * room.map.cellL()),
        }
        if(!self.tryMovePC(newP, pInRoom, oldP)) {
            newP = processInput(speed / 2)
            pInRoom = self.translateToRoomCoordinates(newP)
            if(!self.tryMovePC(newP, pInRoom, oldP)) {
                newP = processInput(speed / 4)
                pInRoom = self.translateToRoomCoordinates(newP)
                self.tryMovePC(newP, pInRoom, oldP)
            }
        }
    }

    self.loopShooting = function() {
        // TODO refractor this as it relies on mouse input
        //      it will need to support analog joystick input as
        //      well as a trigger
        if(!mouse.down) { return }
        if(self.clickFrames > 0) {
            --self.clickFrames
            return
        } else {
            SFX.gun[SFX.iGun()].play()
            self.clickFrames = Math.floor(60/4)
        }

        var pp = { x: 320, y: 240 }

        if(mouse.x == pp.x && mouse.y == pp.y) { return }

        var d = Math.sqrt( (pp.y - mouse.y) * (pp.y - mouse.y) + (pp.x - mouse.x) * (pp.x - mouse.x) )
        var theta = Math.acos((mouse.x - pp.x) / d)

        if(mouse.y < pp.y) {
            theta = -theta
        }

        var x = (PC.pos.x - PC.room.x + 320) / (PC.room.map.width() * PC.room.map.cellL())
        var y = (PC.pos.y - PC.room.y + 240) / (PC.room.map.height() * PC.room.map.cellL())
        PC.room.bullets.push(new Bllt(x, y, theta))
    }
}
