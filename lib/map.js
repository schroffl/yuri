'use strict';

const ini = require('ini');
const lzo = require('lzo');

const Tile = require('./tile');

class CCMap {

	/**
		Wrapper for editing RA2/YR maps

		@constructor

		@param {Object} meta - Some meta data (like map dimensions etc.)
		@param {Array} tiles - A parsed array of all tiles on the map (ini section IsoMapPack5)
	*/
	constructor(meta, tiles) {
		this.tiles = tiles;
		this.meta = meta;
	}

	/**
		Get a tile at a certain position

		@method

		@param x - The x coordinate
		@param y - The y coordinate
	*/
	getTile(x, y) {
		return this.tiles.filter(tile => tile.x == x && tile.y == y).shift();
	}

	/**
		Instantiate a new map from a given ini string

		@static
	
		@param {String} data - The ini file as a string
	*/
	static from(data) {
		let obj = ini.parse(data),
			lines = [ ],
			tiles = [ ];

		for(const line in obj.IsoMapPack5)
			lines.push(obj.IsoMapPack5[line]);

		delete obj.IsoMapPack5;

		let rawString = new Buffer(lines.join(''), 'base64'),
			rawByteArray = [ ];

		// As long as there are still chunks left, concat them into the byte array
		while(rawString.length > 0) {
			// Extract the input- and output length 
			let in_len = rawString.readUInt16LE(0),
				out_len = rawString.readUInt16LE(2),
				chunk = lzo.decompress(rawString.slice(4, 4 + in_len));

			rawByteArray = rawByteArray.concat(Array.from(chunk));

			// Slice the first 4 bytes (in_len, out_len) and the current chunk
			rawString = rawString.slice(4 + in_len);
		}

		let rawData = new Buffer(rawByteArray),
			tileBuf;

		// Parse all the tiles! http://goo.gl/ULOjhn
		while(rawData.length > 0) {
			tileBuf = rawData.slice(0, Tile.DataLength);

			let x = tileBuf.readUInt16LE(0),
				y = tileBuf.readUInt16LE(2),
				type = tileBuf.readUInt32LE(4),
				subtype = tileBuf[8],
				height = tileBuf[9],
				unknown = tileBuf[10];

			tiles.push(new Tile(x, y, type, subtype, height, unknown));

			rawData = rawData.slice(Tile.DataLength);
		}

		return new CCMap(obj, tiles);
	}

	/**
		Serialize an instance of CCMap back into an ini string

		@static

		@param {CCMap}
	*/
	static serialize(map) {
		let obj = map.meta,
			rawByteArray = [ ];

		obj.IsoMapPack5 = { };

		console.log('Serializing', map.tiles.length, 'tiles');

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

		let rawData = new Buffer(rawByteArray),
			compressedByteArray = [ ];

		while(rawData.length > 0) {
			let chunk = rawData.slice(0, 8192),
				data = lzo.compress(chunk),
				out_len = chunk.length,
				in_len = data.length,
				meta = new Buffer(4);

			meta.writeUInt16LE(in_len, 0);
			meta.writeUInt16LE(out_len, 2);

			compressedByteArray = compressedByteArray.concat(Array.from(Buffer.concat([ meta, data ])));

			rawData = rawData.slice(8192);
		}

		let compressedData = new Buffer(compressedByteArray),
			rawString = compressedData.toString('base64'),
			index = 1;

		while(rawString.length > 0) {
			obj.IsoMapPack5[index++] = rawString.slice(0, 70);
			rawString = rawString.slice(70);
		}

		return ini.stringify(obj);
	}
}

module.exports = CCMap;

// let file = 'C:\\Program Files (x86)\\Origin Games\\Command and Conquer Red Alert II\\test.yrm';
// let map = CCMap.from(require('fs').readFileSync(file).toString());

// require('fs').writeFileSync(file, CCMap.serialize(map));