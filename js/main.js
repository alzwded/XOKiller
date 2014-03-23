var ctx
var buffer
//var enemies
var rooms
var pX, pY
var dup, ddown, dleft, dright
var hit = false

function reset() {
    hit = false

    pX = 90
    pY = 110

    rooms = new Array()
    rooms[0] = new Room(0, 100, 50)

    var enemies = new Array()
    //enemies[0] = new Enem('O', 0.2, 0.2)
    //enemies[1] = new Enem('O', 0.1, 0.2)
    //for(var k = 0; k < 200; ++k) {
    //    var d = (k+1)/200
    //    enemies[2 + k] = new Enem('O', 0.05 + 0.1*d, 0.2 + 0.06*d)
    //}
    //enemies[200] = new Enem('O', 0.6, 0.2)
    //enemies[201] = new Enem('O', 1.0, 1.0)
    //enemies[201].loop = function() {}

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
        if(dright) {
        } else {
            pX -= speed
        }
    } else if(dright) {
        if(dleft) {
        } else {
            pX += speed
        }
    }

    rooms.forEach(function(r) {
        var rx = r.x - pX
        var ry = r.y - pY
        r.draw(backCtx, rx, ry)

        var spawns = r.map.spawns
        spawns.forEach(function(spwn) {
            spwn.loop(r)
        })
        spawns.removeIf(function(spwn) {
            return spwn.num == 0
        })

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

    executeTransfers()

    ctx.drawImage(buffer, 0, 0)

    if(hit) {
        reset()
    }
}
