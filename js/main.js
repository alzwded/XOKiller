var ctx
var buffer
//var enemies
var rooms
var pX, pY
var dup, ddown, dleft, dright
var hit = false

function Spwn(num, x, y, type) {
    this.num = num
    this.active = false
    this.ticks = 0
    this.x = x
    this.y = y
    this.type = type
    this.loop = function(map) {
        if(this.ticks == 300) {
            map.enemies.push(new Enem(type, x, y))
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
}

function Room(seed, x, y) {
    this.map = new Map(seed)
    this.enemies = new Array()
    this.adjacent = new Array(null, null, null, null)
    this.x = x
    this.y = y

    this.draw = function(ctx, x, y) {
        ctx.strokeStyle = "cyan"
        ctx.fillStyle = "cyan"
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
    }
}

function Enem(type, x, y) {
    this.type = type
    this.x = x
    this.y = y
    this.hp = Math.round(Math.random() * 10.0 + 1.0)
    this.frame = 0
    this.getColor = function() {
        var red = 255 - this.hp
        var green = this.hp
        return "rgb(" + red + ", " + green + ", 0)"
    }
    this.draw = function(ctx, x, y) {
        if(this.hp > 0) {
            ctx.beginPath()
            ctx.arc(x, y, 5, 0, 2 * Math.PI, false)
            ctx.closePath()
            ctx.strokeStyle = this.getColor()
            ctx.lineWidth = 2
            ctx.stroke()
            //ctx.font = "10px Monospace"
            //ctx.fillStyle = "#FFFFFF"
            //ctx.fillText(this.hp, x, y - 10)
            //ctx.fillStyle = this.getColor()
            //ctx.fillRect(x - 10/2 + 10 * this.hp/25, y - 14, 10 * this.hp/25, 4)
        } else {
            switch(Math.floor((this.frame / 3) % 4)) {
            case 0:
                ctx.fillStyle = "#FFFFFF"
                ctx.fillRect(x - 4, y - 2, 7, 4)
                break
            case 1:
                ctx.fillStyle = "#FF0000"
                ctx.fillRect(x - 2, y - 3, 4, 7)
                break
            case 2:
                ctx.fillStyle = "#00FF00"
                ctx.fillRect(x - 3, y - 2, 7, 4)
                break
            case 3:
                ctx.fillStyle = "#0000FF"
                ctx.fillRect(x - 2, y - 4, 4, 7)
                break
            }
            this.frame++
        }
    }
    this.corr = function() { return (0.7/80)/0.7 }
    this.speed = function() { return 0.4/80 }
    this.loop = function(x, y, map) {
        var ly = y - this.y
        var lx = x - this.x
        var d = Math.sqrt( ly * ly + lx * lx)
        if(Math.abs(d) < 1.e-2) { hit = true; return }
        var cosA = lx / d
        var sinA = ly / d
        var corr = this.corr()
        var newX = this.x + this.speed() * cosA + Math.random() * corr - corr/2
        var newY = this.y + this.speed() * sinA + Math.random() * corr - corr/2

        if(!map.layout[map.width() * Math.floor(newX * map.width()) + Math.floor(newY * map.height())]) {
            this.x = newX
            this.y = newY
        } else if(!map.layout[map.width() * Math.floor(this.x * map.width()) + Math.floor(newY * map.height())]) {
            this.y = newY
        } else if(!map.layout[map.width() * Math.floor(newX * map.width()) + Math.floor(this.y * map.height())]) {
            this.x = newX
        }
    }
}

function reset() {
    hit = false

    pX = 90
    pY = 110

    rooms = new Array()
    rooms[0] = new Room(0, 100, 50)

    var enemies = new Array()
    enemies[0] = new Enem('O', 0.2, 0.2)
    enemies[1] = new Enem('O', 0.1, 0.2)
    for(var k = 0; k < 200; ++k) {
        var d = (k+1)/200
        enemies[2 + k] = new Enem('O', 0.05 + 0.1*d, 0.2 + 0.06*d)
    }
    enemies[200] = new Enem('O', 0.6, 0.2)
    enemies[201] = new Enem('O', 1.0, 1.0)
    enemies[201].loop = function() {}

    rooms[0].enemies = enemies
}

function initCanvas() {
    Array.prototype.removeIf = function(cb) {
        var i = 0
        while (i < this.length) {
            if (cb(this[i])) {
                this.splice(i, 1)
            }
            else {
                ++i
            }
        }
    }

    var c = document.getElementById("surface")
    ctx = c.getContext("2d")

    buffer = document.createElement('canvas')
    buffer.width = c.width
    buffer.height = c.height

    document.body.onkeydown = function(e) {
        switch(e.which) {
        case 65: // a
            dleft = true
            break
        case 68: // d
            dright = true
            break
        case 83: // s
            ddown = true
            break
        case 87: // w
            dup = true
            break
        }
    }
    document.body.onkeyup = function(e) {
        switch(e.which) {
        case 65: // a
            dleft = false
            break
        case 68: // d
            dright = false
            break
        case 83: // s
            ddown = false
            break
        case 87: // w
            dup = false
            break
        }
    }

    reset()

    setInterval(loop, 17)
}

var ticks = 0
function loop() {
    var backCtx = buffer.getContext('2d')
    backCtx.fillStyle = "#000000"
    backCtx.fillRect(0,0,680,480)

    var speed = 5
    if(dup) {
        if(ddown) {
        } else if(dleft) {
            pY -= speed * Math.sin(Math.PI / 4)
            pX -= speed * Math.cos(Math.PI / 4)
        } else if(dright) {
            pY -= speed * Math.sin(Math.PI / 4)
            pX += speed * Math.cos(Math.PI / 4)
        } else {
            pY -= speed
        }
    } else if(ddown) {
        if(dup) {
        } else if(dleft) {
            pY += speed * Math.sin(Math.PI / 4)
            pX -= speed * Math.cos(Math.PI / 4)
        } else if(dright) {
            pY += speed * Math.sin(Math.PI / 4)
            pX += speed * Math.cos(Math.PI / 4)
        } else {
            pY += speed
        }
    } else if(dleft) {
        pX -= speed
    } else if(dright) {
        pX += speed
    }


    rooms.forEach(function(r) {
        var rx = r.x - pX
        var ry = r.y - pY
        r.draw(backCtx, rx, ry)
        var enemies = r.enemies
        enemies.forEach(function(enem) {
            // compute absolute x and y from room offset
            var x = enem.x * r.map.width() * r.map.cellL() + rx
            var y = enem.y * r.map.height() * r.map.cellL() + ry
            enem.draw(backCtx, x, y)
        })

        // x and y are computed relative to the room
        // if adjacent room, add or substract 1 depending on which one it is
        var x = (320 - rx) / (r.map.width() * r.map.cellL())
        var y = (240 - ry) / (r.map.height() * r.map.cellL())
        //console.log(rx + " " + ry + " " + x + " " + y + " " + pX + " " + pY)

        enemies.forEach(function(enem) {
            enem.loop(x, y, r.map)
        })

        enemies.removeIf(function(enem) {
            return enem.hp <= 0 && enem.frame > 20
        })
    })

    backCtx.fillStyle = "white"
    backCtx.fillRect(317, 237, 6, 6)

    ticks++
    if(ticks < 60) {
        var l = (ticks%60)/60 * 640
        backCtx.fillStyle = "cyan"
        backCtx.fillRect(0, 0, l, 2)
        backCtx.fillStyle = "black"
        backCtx.fillRect(l, 0, 640 - l, 2)
    } else if(ticks < 120) {
        var l = ((ticks-60)%60)/60 * 640
        backCtx.fillStyle = "black"
        backCtx.fillRect(0, 0, l, 2)
        backCtx.fillStyle = "cyan"
        backCtx.fillRect(l, 0, 640 - l, 2)
    } else {
        ticks = 0
    }

    ctx.drawImage(buffer, 0, 0)

    if(hit) {
        reset()
    }
}
