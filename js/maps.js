var maps
var maps_c
var maps_goalSet

function maps_init_local() {
    maps = {
        0: new Array(),
        1: new Array(),
        2: new Array(),
        3: new Array(),
        all: new Array(),
    }
    __mapdata.forEach(function(md) {
        maps_parse(md)
    })
}

function maps_init_ajax() {
    maps = {
        0: new Array(),
        1: new Array(),
        2: new Array(),
        3: new Array(),
        all: new Array(),
    }
    var rqIdx = new XMLHttpRequest()
    rqIdx.open('GET', 'assets/map.idx', false)
    rqIdx.send()
    var index = rqIdx.responseText
    for(var line in index.split('\n')) {
        if(line.length == 0) { continue }
        var rq = new XMLHttpRequest()
        rq.open('GET', 'assets/' + line, false)
        rq.send()
        maps_parse(rq.responseText.split('\n'))
    }
}

function maps_init() {
    maps_init_local()
}

function maps_parse(lines) {
    var exits = lines.shift().split(' ')
    var mapData = {
        exits: new Array(exits[0] == 'yes', exits[1] == 'yes', exits[2] == 'yes', exits[3] == 'yes'),
        spawns: new Array(),
        treasures: new Array(),
        layout: new Array(),
    }

    var row = 0
    lines.forEach(function(unprocessed) {
        var line = new String(unprocessed)
        for(var i = 0; i < line.length; ++i) {
            mapData.layout[i * 36 + row] = false
            switch(line[i]) {
            case '@':
                mapData.layout[i * 36 + row] = true
                break
            case 'O':
                mapData.spawns.push({
                    x: i,
                    y: row,
                    type: 'O',
                })
                break
            case 'X':
                mapData.spawns.push({
                    x: i,
                    y: row,
                    type: 'X',
                })
                break
            case 'T':
                treasures.push({
                    x: i,
                    y: row,
                })
            }
        }
        ++row
    })

    var seed = maps.all.length
    maps.all.push(mapData)
    for(var i = 0; i < 4; ++i) {
        if(mapData.exits[i]) {
            maps[i].push(seed)
        }
    }
}

function maps_new() {
    maps_c = 100
    maps_goalSet = false
    var spawnRoom = new Room(Math.floor(Math.random()) % maps.all.length, 0, 0)
    spawnRoom.map.spawns = new Array()
    var numRooms = maps_generateMapRec(spawnRoom, false)
    return {
        spawnRoom: spawnRoom,
        numRooms: numRooms,
    }
}

function maps_offsetFor(i) {
    switch(i) {
    case 0:
        return {
            x: 720,
            y: 0,
        }
    case 1:
        return {
            x: 0,
            y: -720,
        }
    case 2:
        return {
            x: -720,
            y: 0,
        }
    case 3:
        return {
            x: 0,
            y: 720,
        }
    }
}

function maps_generateMapRec(r, canBeGoalRoom) {
    var num = 1
    if(maps_c > 0) { --maps_c }
    if(canBeGoalRoom && 
            (maps_c <= 0 ||
            (!maps_goalSet && Math.floor(Math.random()) % 100 == 0))) {
       r.makeGoalRoom()
       maps_goalSet = true
       return num
    }
    for(var i = 0; i < 4; ++i) {
        if(!r.map.exits[i]) { continue }
        if(maps_c <= 0) {
            r.sealExit(i)
            continue
        }
        var seed = maps[i][Math.floor(Math.random() % maps[i].length)]
        var offset = maps_offsetFor(i)
        r.adjacent[i] = new Room(seed, r.x + offset.x, r.y + offset.y)
        var j = (i + 2) % 4
        r.adjacent[i].adjacent[j] = r
        r.adjacent[i].map.exits[j] = false
        r.map.exits[i] = false
        num += maps_generateMapRec(r.adjacent[i], true)
    }
    return num
}
