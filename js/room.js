function Spwn(num, x, y, type) {
    this.num = num
    this.active = false
    this.ticks = 0
    this.x = x
    this.y = y
    this.type = type
    this.loop = function(room) {
    return
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

function cpy1(o) {
    var r = new Array()
    for(var i in o) {
        if(i) r.push(true)
        else r.push(false)
    }
    return r
}

function cpyS(s) {
    var r = new Array()
    s.forEach(function(d) {
        r.push(new Spwn(50, d.x / 36, d.y / 36, d.type))
    })
    return r
}

function cpyL(l) {
    var r = new Array()
    l.forEach(function(blk) {
        if(blk) r.push(true)
        else r.push(false)
    })
    return r
}

function Map(seed) {
    var mapData = maps.all[seed]
    this.exits = cpy1(mapData.exits)
    this.spawns = cpyS(mapData.spawns)
    this.layout = cpyL(mapData.layout)
    this.width = function() { return 36 }
    this.height = function() { return 36 }
    this.cellL = function() { return 20 } 

    if(this.exits[0]) {
        var i = 0
        for(var j = 12; j < this.width() - 12; ++j) {
            this.layout[i * this.width() + j] = false
        }
    }
    if(this.exits[1]) {
        var j = this.height() - 1
        for(var i = 12; i < this.width() - 12; ++i) {
            this.layout[i * this.width() + j] = false
        }
    }
    if(this.exits[2]) {
        var i = this.width() - 1
        for(var j = 12; j < this.height() - 12; ++j) {
            this.layout[i * this.width() + j] = false
        }
    }
    if(this.exits[3]) {
        var j = 0
        for(var i = 12; i < this.width() - 12; ++i) {
            this.layout[i * this.width() + j] = false
        }
    }
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

    var self = this
    self.sealExit = function(i) {
        if(i == 2) {
            var i = 0
            for(var j = 12; j < self.map.width() - 12; ++j) {
                self.map.layout[i * self.map.width() + j] = true
            }
        } else if(i == 3) {
            var j = self.map.height() - 1
            for(var i = 12; i < self.map.width() - 12; ++i) {
                self.map.layout[i * self.map.width() + j] = true
            }
        } else if(i == 0) {
            var i = self.map.width() - 1
            for(var j = 12; j < self.map.height() - 12; ++j) {
                self.map.layout[i * self.map.width() + j] = true
            }
        } else if(i == 1) {
            var j = 0
            for(var i = 12; i < self.map.width() - 12; ++i) {
                self.map.layout[i * self.map.width() + j] = true
            }
        }
        self.map.exits[i] = false
    }

    self.makeGoalRoom = function() {
        if(self.map.exits[2]) {
            var i = 0
            for(var j = 12; j < self.map.width() - 12; ++j) {
                self.map.layout[i * self.map.width() + j] = true
            }
            self.map.exits[2] = false
        }
        if(self.map.exits[3]) {
            var j = self.map.height() - 1
            for(var i = 12; i < self.map.width() - 12; ++i) {
                self.map.layout[i * self.map.width() + j] = true
            }
            self.map.exits[3] = false
        }
        if(self.map.exits[0]) {
            var i = self.map.width() - 1
            for(var j = 12; j < self.map.height() - 12; ++j) {
                self.map.layout[i * self.map.width() + j] = true
            }
            self.map.exits[0] = false
        }
        if(self.map.exits[1]) {
            var j = 0
            for(var i = 12; i < self.map.width() - 12; ++i) {
                self.map.layout[i * self.map.width() + j] = true
            }
            self.map.exits[1] = false
        }
        for(var i = 1; i < self.map.width() - 1; ++i) {
            for(var j = 1; j < self.map.height() - 1; ++j) {
                self.map.layout[i * self.map.width() + j] = false
            }
        }
        self.map.spawns = new Array()
    }
}
