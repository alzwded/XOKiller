var ctx
var buffer
//var enemies
var room
var spawnRoom
var pX, pY
var dup, ddown, dleft, dright
var hit = false
var clickFrames
var mouse = {
    x: 0,
    y: 0,
    down: false,
}
var SFX = {
    gun: false,
    pop: false,
    sizzle: false,
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

function reset() {
    SFX.pop.play()
    hit = false
    clickFrames = 0

    pX = 90
    pY = 110

    spawnRoom = new Room(0, 0, 0)
    room = spawnRoom
    var w = spawnRoom.map.width() * spawnRoom.map.cellL()
    var h = spawnRoom.map.height() * spawnRoom.map.cellL()
    room.adjacent[0] = new Room(1, w, 0)
    room.adjacent[0].adjacent[2] = spawnRoom
    room.adjacent[1] = new Room(2, 0, -h)
    room.adjacent[1].adjacent[3] = spawnRoom
    room.adjacent[2] = new Room(3, -w, 0)
    room.adjacent[2].adjacent[0] = spawnRoom
    room.adjacent[3] = new Room(4, 0, h)
    room.adjacent[3].adjacent[1] = spawnRoom
    //rooms[0].map.spawns = new Array()

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
    // THE TEST ENEMY!
    //enemies[0] = new Enem('O', -0.2, 0.2)
    //enemies[0].loop = function() {}

    room.enemies = enemies
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

    SFX.gun = new Array(
        new Audio('assets/gun.wav'),
        new Audio('assets/gun.wav'),
        new Audio('assets/gun.wav'),
        new Audio('assets/gun.wav'))
    SFX.pop = new Audio('assets/pop.wav')
    SFX.sizzle = new Array(
        new Audio('assets/sizzle-short.wav'),
        new Audio('assets/sizzle-short.wav'),
        new Audio('assets/sizzle-short.wav'),
        new Audio('assets/sizzle-short.wav'))

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

function loop_shooting(room) {
    if(!mouse.down) { return }
    if(clickFrames > 0) { return }
    else {
        SFX.gun[SFX.iGun()].play()
        clickFrames = Math.floor(60/4)
    }

    var pp = { x: 320, y: 240 }

    if(mouse.x == pp.x && mouse.y == pp.y) { return }

    var d = Math.sqrt( (pp.y - mouse.y) * (pp.y - mouse.y) + (pp.x - mouse.x) * (pp.x - mouse.x) )
    var theta = Math.acos((mouse.x - pp.x) / d)

    if(mouse.y < pp.y) {
        theta = -theta
    }

    var x = (pX - room.x + 320) / (room.map.width() * room.map.cellL())
    var y = (pY - room.y + 240) / (room.map.height() * room.map.cellL())
    room.bullets.push(new Bllt(x, y, theta))
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

function translateToRoomCoordinates(newP) {
    return {
        x: (newP.x + pX - room.x + 320) / (room.map.width() * room.map.cellL()),
        y: (newP.y + pY - room.y + 240) / (room.map.height() * room.map.cellL()),
    }
}

function tryMovePC(newP, p, oldP) {
    var xCell = enem_cell(p.x, room.map.width())
    var yCell = enem_cell(p.y, room.map.height())
    var oldXCell = enem_cell(oldP.x, room.map.width())
    var oldYCell = enem_cell(oldP.y, room.map.height())

    if(xCell < 0 && room.adjacent[2]) {
        if(enem_can(room.adjacent[2].map, xCell + room.adjacent[2].map.width(), yCell)) {
            pX += newP.x
            pY += newP.y
            room = room.adjacent[2]
            return true
        } else if(enem_can(room.adjacent[2].map, xCell + room.adjacent[2].map.width(), oldYCell)) {
            pX += newP.x
            room = room.adjacent[2]
            return true
        }
    } else if(xCell >= room.map.width() && room.adjacent[0]) {
        if(enem_can(room.adjacent[0].map, xCell - room.map.width(), yCell)) {
            pX += newP.x
            pY += newP.y
            room = room.adjacent[0]
            return true
        } else if(enem_can(room.adjacent[0].map, xCell - room.map.width(), oldYCell)) {
            pX += newP.x
            room = room.adjacent[0]
            return true
        }
    } else if(yCell < 0 && room.adjacent[1]) {
        if(enem_can(room.adjacent[1].map, xCell, yCell + room.adjacent[1].map.height())) {
            pX += newP.x
            pY += newP.y
            room = room.adjacent[1]
            return true
        } else if(enem_can(room.adjacent[1].map, oldXCell, yCell + room.adjacent[1].map.height())) {
            pY += newP.y
            room = room.adjacent[1]
            return true
        }
    } else if(yCell >= room.map.height() && room.adjacent[3]) {
        if(enem_can(room.adjacent[3].map, xCell, yCell - room.map.height())) {
            pX += newP.x
            pY += newP.y
            room = room.adjacent[3]
            return true
        } else if(enem_can(room.adjacent[3].map, oldXCell, yCell - room.map.height())) {
            pY += newP.y
            room = room.adjacent[3]
            return true
        }
    }

    if(enem_can(room.map, xCell, yCell)) {
        pX += newP.x
        pY += newP.y
        return true
    } else if(enem_can(room.map, oldXCell, yCell)) {
        pY += newP.y
        return true
    } else if(enem_can(room.map, xCell, oldYCell)) {
        pX += newP.x
        return true
    }
    return false
}

function movePC() {
    var speed = 5
    var newP = processKeyboard(speed)
    var pInRoom = translateToRoomCoordinates(newP)
    var oldP = {
        x: (pX - room.x + 320) / (room.map.width() * room.map.cellL()),
        y: (pY - room.y + 240) / (room.map.height() * room.map.cellL()),
    }
    if(!tryMovePC(newP, pInRoom, oldP)) {
        newP = processKeyboard(speed / 2)
        pInRoom = translateToRoomCoordinates(newP)
        if(!tryMovePC(newP, pInRoom, oldP)) {
            newP = processKeyboard(speed / 4)
            pInRoom = translateToRoomCoordinates(newP)
            tryMovePC(newP, pInRoom, oldP)
        }
    }
}

var ticks = 0
function loop() {
    if(!running) { return }
    var backCtx = buffer.getContext('2d')
    backCtx.fillStyle = "#000000"
    backCtx.fillRect(0,0,680,480)

    if(clickFrames > 0) { --clickFrames }
    loop_shooting(room)

    movePC()

    var rx = room.x - pX
    var ry = room.y - pY
    room.loop(rx, ry)
    room.draw(backCtx, rx, ry)
    room.adjacent.forEach(function(r) {
        if(!r) { return }
        var arx = r.x - pX
        var ary = r.y - pY
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
