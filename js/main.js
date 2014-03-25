var ctx
var buffer
//var enemies
var spawnRoom
var dup, ddown, dleft, dright
var hit = false
var mouse = {
    x: 0,
    y: 0,
    down: false,
}
var SFX = {
    gun:  new Array(
        new Audio('assets/gun.wav'),
        new Audio('assets/gun.wav'),
        new Audio('assets/gun.wav'),
        new Audio('assets/gun.wav')),
    pop: new Audio('assets/pop.wav'),
    sizzle: new Array(
        new Audio('assets/sizzle-short.wav'),
        new Audio('assets/sizzle-short.wav'),
        new Audio('assets/sizzle-short.wav'),
        new Audio('assets/sizzle-short.wav')),
    rqSizzle: false,
    __iGun: 0,
    iGun: function() {
        this.__iGun = (this.__iGun + 1) % 4
        return this.__iGun
    },
    __iSizzle: 0,
    iSizzle: function() {
        this.__iSizzle = (this.__iSizzle + 1) % (4 * 30)
        return Math.floor(this.__iSizzle / 30)
    }
}
var running = true
var PC

function reset() {
    SFX.pop.play()
    hit = false

    PC = new Plyr(360, 360)

    spawnRoom = new Room(0, 0, 0)
    PC.room = spawnRoom
    var w = spawnRoom.map.width() * spawnRoom.map.cellL()
    var h = spawnRoom.map.height() * spawnRoom.map.cellL()
    spawnRoom.adjacent[0] = new Room(1, w, 0)
    spawnRoom.adjacent[0].adjacent[2] = spawnRoom
    spawnRoom.adjacent[1] = new Room(2, 0, -h)
    spawnRoom.adjacent[1].adjacent[3] = spawnRoom
    spawnRoom.adjacent[2] = new Room(3, -w, 0)
    spawnRoom.adjacent[2].adjacent[0] = spawnRoom
    spawnRoom.adjacent[3] = new Room(4, 0, h)
    spawnRoom.adjacent[3].adjacent[1] = spawnRoom
    //rooms[0].map.spawns = new Array()

    //var enemies = new Array()
    //enemies[0] = new Enem('O', 0.2, 0.2)
    //enemies[1] = new Enem('O', 0.1, 0.2)
    //for(var k = 0; k < 200; ++k) {
    //    var d = (k+1)/200
    //    enemies[2 + k] = new Enem('O', 0.05 + 0.1*d, 0.2 + 0.06*d)
    //}
    //enemies[200] = new Enem('O', 0.6, 0.2)
    //enemies[201] = new Enem('O', 1.0, 1.0)
    //enemies[201].loop = function() {}
    // THE TEST ENEMY!
    //enemies[0] = new Enem('O', -0.2, 0.2)
    //enemies[0].loop = function() {}

    //room.enemies = enemies
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

    c.onmousedown = function(e) {
        e.preventDefault()
        mouse.down = true
        mouse.x = e.offsetX
        mouse.y = e.offsetY
    }

    c.onmouseup = function(e) {
        e.preventDefault()
        mouse.down = false
    }

    c.onmousemove = function(e) {
        e.preventDefault()
        mouse.x = e.offsetX
        mouse.y = e.offsetY
    }

    c.onclick = function(e) {
        e.preventDefault()

    }

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
        case 27:
            running = !running
        }
    }

    reset()

    setInterval(loop, 17)
}

function processInput(speed) {
    // TODO this will be something like an average of
    //      all non-zero inputs. Or based on selection
    return processKeyboard(speed)
}

function processKeyboard(speed) {
    var newP = {
        x: 0,
        y: 0,
    }

    if(dup) {
        if(ddown) {
        } else if(dleft) {
            newP.y = -speed * Math.sin(Math.PI / 4)
            newP.x = -speed * Math.cos(Math.PI / 4)
        } else if(dright) {
            newP.y = -speed * Math.sin(Math.PI / 4)
            newP.x = +speed * Math.cos(Math.PI / 4)
        } else {
            newP.y = -speed
        }
    } else if(ddown) {
        if(dup) {
        } else if(dleft) {
            newP.y = +speed * Math.sin(Math.PI / 4)
            newP.x = -speed * Math.cos(Math.PI / 4)
        } else if(dright) {
            newP.y = +speed * Math.sin(Math.PI / 4)
            newP.x = +speed * Math.cos(Math.PI / 4)
        } else {
            newP.y = +speed
        }
    } else if(dleft) {
        if(dright) {
        } else {
            newP.x = -speed
        }
    } else if(dright) {
        if(dleft) {
        } else {
            newP.x = +speed
        }
    }

    return newP
}

var ticks = 0
function loop() {
    if(!running) { return }
    var backCtx = buffer.getContext('2d')
    backCtx.fillStyle = "#000000"
    backCtx.fillRect(0,0,680,480)

    PC.loopShooting()
    PC.move()

    var rx = PC.room.x - PC.pos.x
    var ry = PC.room.y - PC.pos.y
    PC.room.loop(rx, ry)
    PC.room.draw(backCtx, rx, ry)
    PC.room.adjacent.forEach(function(r) {
        if(!r) { return }
        var arx = r.x - PC.pos.x
        var ary = r.y - PC.pos.y
        r.loop(arx, ary)
        r.draw(backCtx, arx, ary)
    })

    executeTransfers()

    if(SFX.rqSizzle) {
        SFX.sizzle[SFX.iSizzle()].play()
        SFX.rqSizzle = false
    }

    backCtx.fillStyle = "white"
    backCtx.fillRect(317, 237, 6, 6)

    ticks++
    if(ticks >= 120) {
        ticks = 0
    }
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
    }

    ctx.drawImage(buffer, 0, 0)

    if(hit) {
        reset()
    }
}
