var transfers = new Array()

function executeTransfers() {
    transfers.forEach(function(tsfr) {
        tsfr.from.removeIf(function(elem) {
            return elem == tsfr.who
        });
        tsfr.to.push(tsfr.who)
        tsfr.who.x += tsfr.correctionX
        tsfr.who.y += tsfr.correctionY
    })

    transfers = new Array()
}

function Transfer(who, from, to, correctionX, correctionY) {
    this.who = who
    this.from = from
    this.to = to
    this.correctionX = correctionX
    this.correctionY = correctionY
}
