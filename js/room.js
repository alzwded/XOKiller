function Spwn(num, x, y, type) {
    this.num = num
    this.active = false
    this.ticks = 0
    this.x = x
    this.y = y
    this.type = type
    this.loop = function(room) {
        ++this.ticks
        if(this.num == 0) {
            this.loop = function() {}
            return
        }
        if(this.num > 0) {
            if(this.ticks == 60) {
                this.num--
                this.ticks = 0
                room.enemies.push(new Enem(type, x, y))
            }
        } else {
            if(this.ticks == -this.num) {
                this.ticks = 0
                room.enemies.push(new Enem(type, x, y))
            }
        }
    }
}

function Map(seed) {
    this.exits = new Array(null, null, null, null)
    this.spawns = new Array()
    this.layout = new Array()
    this.width = function() { return 36 }
    this.height = function() { return 36 }
    this.cellL = function() { return 20 } 
    for(var i = 0; i < this.width(); ++i) {
        for(var j = 0; j < this.height(); ++j) {
            if(i == 0 || (i == this.width()-1) || j == 0 || (j == this.height()-1)) {
                this.layout[i * this.width() + j] = true
            } else {
                this.layout[i * this.width() + j] = false
            }
        }
    }
    this.layout[18 * this.width() + 11] = true
    this.layout[17 * this.width() + 11] = true
    this.layout[16 * this.width() + 11] = true
    this.layout[15 * this.width() + 11] = true
    this.layout[19 * this.width() +  7] = true
    this.layout[19 * this.width() +  8] = true
    this.layout[19 * this.width() +  9] = true
    this.layout[19 * this.width() + 11] = true
    this.layout[19 * this.width() + 12] = true
    this.layout[19 * this.width() + 13] = true
    this.layout[ 7 * this.width() + 10] = true
    this.layout[ 7 * this.width() + 11] = true
    this.layout[ 9 * this.width() + 12] = true
    this.layout[10 * this.width() + 12] = true
    this.layout[10 * this.width() + 11] = true

    this.spawns.push(new Spwn(100, 0.055, 0.23, '0'))
    this.spawns.push(new Spwn(100, 0.6, 0.2, '0'))
}

function Room(seed, x, y) {
    this.map = new Map(seed)
    this.enemies = new Array()
    this.adjacent = new Array(null, null, null, null)
    this.x = x
    this.y = y
    this.bullets = new Array()

    this.draw = function(ctx, x, y) {
        ctx.strokeStyle = "cyan"
        ctx.fillStyle = "cyan"
        ctx.lineWidth = 3
        ctx.beginPath()
        for(var i = 0; i < this.map.width(); ++i) {
            for(var j = 0; j < this.map.height(); ++j) {
                if(this.map.layout[i * this.map.width() + j]) {
                    ctx.moveTo(x + i * this.map.cellL(), y + j * this.map.cellL())
                    ctx.lineTo(x + (i + 1) * this.map.cellL(), y + j * this.map.cellL())
                    ctx.lineTo(x + (i + 1) * this.map.cellL(), y + (j + 1) * this.map.cellL())
                    ctx.lineTo(x + i * this.map.cellL(), y + (j + 1) * this.map.cellL())
                    ctx.lineTo(x + i * this.map.cellL(), y + j * this.map.cellL())
                }
            }
        }
        ctx.closePath()
        ctx.stroke()
        ctx.fill()

        ctx.beginPath()
        ctx.strokeStyle = "#FF00FF"
        ctx.lineWidth = 5
        var w = this.map.width() * this.map.cellL()
        var h = this.map.height() * this.map.cellL()
        this.map.spawns.forEach(function(spwn) {
            var sx = x + spwn.x * w
            var sy = y + spwn.y * h
            ctx.moveTo(sx - 10, sy - 10)
            ctx.lineTo(sx + 10, sy - 10)
            ctx.lineTo(sx + 10, sy + 10)
            ctx.lineTo(sx - 10, sy + 10)
            ctx.lineTo(sx - 10, sy - 10)
        })
        ctx.closePath()
        ctx.stroke()

        var map = this.map
        var fx = function(ex) {
            return ex * map.width() * map.cellL() + x
        }
        var fy = function(ey) {
            return ey * map.height() * map.cellL() + y
        }
        this.enemies.forEach(function(enem) {
            // compute absolute x and y from room offset
            enem.draw(ctx, fx(enem.x), fy(enem.y))
        })

        var self = this
        self.bullets.forEach(function(bllt) {
            bllt.draw(ctx, fx(bllt.x), fy(bllt.y))
        })

    }

    this.loop = function(rx, ry) {
        var spawns = this.map.spawns
        var r = this
        spawns.forEach(function(spwn) {
            spwn.loop(r)
        })
        spawns.removeIf(function(spwn) {
            return spwn.num == 0
        })

        // x and y are computed relative to the room
        // if adjacent room, add or substract 1 depending on which one it is
        var x = (320 - rx) / (r.map.width() * r.map.cellL())
        var y = (240 - ry) / (r.map.height() * r.map.cellL())

        this.bullets.forEach(function(bllt) {
            bllt.loop(r)
        })

        this.bullets.removeIf(function(bllt) {
            return bllt.hp <= 0
        })

        var map = this.map
        this.enemies.forEach(function(enem) {
            enem.loop(x, y, r)
        })

        this.enemies.removeIf(function(enem) {
            return enem.hp <= 0 && enem.frame > 20
        })
    }
}
