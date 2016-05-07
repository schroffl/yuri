'use strict';

const notWritable = { 'writable': false };

class Tile {

	constructor(x, y, type, subtype, height, unknown) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.subtype = subtype;
		this.height = height;
		this.unknown = unknown;

		Object.defineProperties(this, { 'x': notWritable, 'y': notWritable });
	}
}

module.exports = Tile;
module.exports.DataLength = 11;