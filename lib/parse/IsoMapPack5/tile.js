'use strict';

const notWritable = { 'writable': false };

class Tile {

	/**
	 *	Wrapper to easily interact with a tile
	 *
	 *	@constructor
	 *
	 *	@property {Number} x - The x coordinate of the tile
	 *	@property {Number} y - The y coordinate of the tile
	 *	@property {Number} type - The TileTypeIndex of the tile
	 *	@property {Number} subtype - The TileSubtypeIndex of the tile
	 *	@property {Number} height - The height / level of the tile
	 *	@property {Number} unknown - Nobody knows
	 */
	constructor(x, y, type, subtype, height, unknown) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.subtype = subtype;
		this.height = height;
		this.unknown = unknown;

		Object.defineProperties(this, { 'x': notWritable, 'y': notWritable });
	}

	static get DataLength() {
		return 11;
	}
}

module.exports = Tile;