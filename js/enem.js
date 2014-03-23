var enem_transfers = new Array()

function executeTransfers() {
    enem_transfers.forEach(function(tsfr) {
        tsfr.from.removeIf(function(elem) {
            return elem == tsfr.who
        });
        tsfr.to.push(tsfr.who)
        tsfr.who.x += tsfr.correctionX
        tsfr.who.y += tsfr.correctionY
    })

    enem_transfers = new Array()
}

function Transfer(who, from, to, correctionX, correctionY) {
    this.who = who
    this.from = from
    this.to = to
    this.correctionX = correctionX
    this.correctionY = correctionY
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
        var xCell = enem_cell(newX, map.width())
        var yCell = enem_cell(newY, map.height())
        if(xCell < 0) {
            // check adjacent(2) and transfer if possible
            if(enem_can(map.adjacent[2], xCell + map.adjacent[2].width(), yCell)) {
                this.x = newX
                this.y = newY
                transfers.push(new Transfer(this, map.enemies, map.adjacent[2].enemies, 1.0, 0.0))
            } else if(enem_can(map.adjacent[2], xCell + map.adjacent[2].width(), enem_cell(this.y, map.height()))) {
                this.x = newX
                transfers.push(new Transfer(this, map.enemies, map.adjacent[2].enemies, 1.0, 0.0))
            }
        }
        if(yCell < 0) {
            // check adjacent(1) and transfer if possible
            if(enem_can(map.adjacent[1], xCell, yCell + map.adjacent[1].height())) {
                
                this.x = newX
                this.y = newY
                transfers.push(new Transfer(this, map.enemies, map.adjacent[1].enemies, 0.0, 1.0))
            } else if(enem_can(map.adjacent[1], enem_cell(this.x, map.adjacent[1].width()), newY)) {
                this.y = newY
                transfers.push(new Transfer(this, map.enemies, map.adjacent[1].enemies, 0.0, 1.0))
            }
        }
        if(xCell >= map.width()) {
            // check adjacent (0) and transfer if possible
            if(enem_can(map.adjacent[0], xCell - map.adjacent[0].width(), yCell)) {
                this.x = newX
                this.y = newY
                transfers.push(new Transfer(this, map.enemies, map.adjacent[0].enemies, -1.0, 0.0))
            } else if(enem_can(map.adjacent[0], xCell - map.adjacent[0].width(), enem_cell(this.y, map.adjacent[0].height()))) {
                this.x = newX
                transfers.push(new Transfer(this, map.enemies, map.adjacent[0].enemies, -1.0, 0.0))
            }
        }
        if(yCell >= map.height()) {
            // check adjacent (3) and transfer if possible
            if(enem_can(map.adjacent[3], xCell, yCell - map.adjacent[3].height())) {
                this.x = newX
                this.y = newY
                transfers.push(new Transfer(this, map.enemies, map.adjacent[3].enemies, 0.0, -1.0))
            } else if(enem_can(map.adjacent[3], enem_cell(this.x, map.adjacent[3].width()), yCell - map.adjacent[3].height())) {
                this.y = newY
                transfers.push(new Transfer(this, map.enemies, map.adjacent[3].enemies, 0.0, -1.0))
            }
        }

        if(enem_can(map, enem_cell(newX, map.width()), enem_cell(newY, map.height()))) {
            this.x = newX
            this.y = newY
        } else if(enem_can(map, enem_cell(this.x, map.width()), enem_cell(newY, map.height()))) {
            this.y = newY
        } else if(enem_can(map, enem_cell(newX, map.width()), enem_cell(this.y, map.height()))) {
            this.x = newX
        }
    }
}

function enem_cell(x, w) {
    return Math.floor(x * w)
}

function enem_can(map, cellX, cellY) {
    return !map.layout[cellX * map.width() + cellY]
}
