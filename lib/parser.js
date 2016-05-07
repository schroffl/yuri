'use strict';

const ini = require('ini');
const lzo = require('lzo');

const CCMap = require('./map');
const Tile = require('./tile');

class Parser {

	/**
		Parses map data

		@param {String} data - The map data

		@return A new instance of CCMap
	*/
	static parse(data) {
		
	}

	/**
		Serializes an instance of CCMap back into an ini string

		@param {CCMap} map

		@return The serialized ini string
	*/
	static serialize(map) {
		let obj = map.meta,
			rawByteArray = [ ];

		obj.IsoMapPack5 = { };

		map.tiles.forEach(tile => {
			let tileBuf = new Buffer(Tile.DataLength);

			tileBuf.writeUInt16LE(tile.x, 0);
			tileBuf.writeUInt16LE(tile.y, 2);
			tileBuf.writeUInt32LE(tile.type, 4);
			tileBuf[8] = tile.subtype;
			tileBuf[9] = tile.height;
			tileBuf[10] = tile.unknown;

			rawByteArray = rawByteArray.concat(Array.from(tileBuf));
		});
	}
}

