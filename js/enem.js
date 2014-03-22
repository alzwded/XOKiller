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

