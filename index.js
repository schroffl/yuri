'use strict';

const fs = require('fs');

const CCMap = require('./lib/map');
const file = './test/test.yrm';

let map = CCMap.from(fs.readFileSync(file).toString());

console.log(map.getTile(5, 50)); // => type = 543 (pavement)