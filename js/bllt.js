function inTriangle_side(p, p1, p2) {
    return (p.x - p2.x) * (p1.y - p2.y) - (p1.x - p2.x) * (p.y - p2.y) < 0.0
}

function inTriangle(x, y, p1, p2, p3) {
    var myP = { x: x, y: y }

    var t1 = inTriangle_side(myP, p1, p2)
    var t2 = inTriangle_side(myP, p2, p3)
    var t3 = inTriangle_side(myP, p3, p1)

    return t1 == t2 && t2 == t3
}

function Bllt(x, y, theta) {
    this.x = x
    this.y = y
    this.theta = theta
    this.getInitHP = function() { return 50 }
    this.hp = this.getInitHP()
    this.width = 1
    this.speed = 0.9/80
    this.getDamage = function() { return 3.5 }
    this.getDecrement = function() { return 3 }
    this.getMaxWidth = function() { return 80 }
    this.getNumIncreaseFrames = function() { return 24 }
    this.color = "#F0F0E0"

    var self = this
    this.getWallPenalty = function() { return self.getInitHP() / 2 }
    this.loop = function(room) {
        --self.hp
        if(self.width < self.getMaxWidth()) {
            self.width += self.getMaxWidth() / self.getNumIncreaseFrames()
        }
        var sin_theta = Math.sin(self.theta)
        var cos_theta = Math.cos(self.theta)
        var newX = self.x + self.speed * cos_theta
        var newY = self.y + self.speed * sin_theta
        var invX = self.x - self.speed * cos_theta
        var invY = self.y - self.speed * sin_theta

        var l = self.width / 2 / (room.map.width() * room.map.cellL()) + (1.e-2 / 2)
        var sq = new Array()
        sq[0] = { x: newX - l * sin_theta, y: newY + l * cos_theta }
        sq[1] = { x: newX + l * sin_theta, y: newY - l * cos_theta }
        sq[2] = { x: invX - l * sin_theta, y: invY + l * cos_theta }
        sq[3] = { x: invX + l * sin_theta, y: invY - l * cos_theta }

        room.enemies.forEach(function(enem) {
            if(inTriangle(enem.x, enem.y, sq[0], sq[1], sq[2])
                    || inTriangle(enem.x, enem.y, sq[1], sq[2], sq[3])) {
                enem.hp -= self.getDamage() * (self.getMaxWidth() / self.width)
                self.hp -= self.getDecrement()
                SFX.rqSizzle = true
            }
        })

        var xCell = enem_cell(newX, room.map.width())
        var yCell = enem_cell(newY, room.map.height())
        if(!enem_can(room.map, xCell, yCell)) {
            self.hp -= self.getWallPenalty()
        }

        if(xCell < 0 &&
                enem_can(room.adjacent[2].map, xCell + room.map.width(), yCell)) {
            transfers.push(new Transfer(self, room.bullets, room.adjacent[2].bullets, 1.0, 0.0))
        } else if(yCell < 0 &&
                enem_can(room.adjacent[1].map, xCell, yCell + room.map.height())) {
            transfers.push(new Transfer(self, room.bullets, room.adjacent[1].bullets, 0.0, 1.0))
        } else if(xCell > room.map.width() &&
                enem_can(room.adjacent[0].map, xCell - room.map.width(), yCell)) {
            transfers.push(new Transfer(self, room.bullets, room.adjacent[0].bullets, -1.0, 0.0))
        } else if(yCell > room.map.height() &&
                enem_can(room.adjacent[3].map, xCell, yCell - room.map.height())) {
            transfers.push(new Transfer(self, room.bullets, room.adjacent[3].bullets, 0.0, -1.0))
        }

        self.x = newX
        self.y = newY
    }

    this.draw = function(ctx, x, y) {
        var l = self.width / 2
        var sin_theta = Math.sin(self.theta)
        var cos_theta = Math.cos(self.theta)

        ctx.beginPath()
        ctx.lineWidth = 6
        ctx.strokeStyle = self.color
        ctx.moveTo(x - l * sin_theta, y + l * cos_theta)
        ctx.lineTo(x + l * sin_theta, y - l * cos_theta)
        ctx.stroke()
    }
}
