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
