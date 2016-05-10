'use strict';

const lzo = require('lzo');
const Tile = require('./tile');

const metaSize = 4;
const maxChunkSize = 8192;

let t1 = [ ],
	t2 = [ ];

class IsoMapPack5 {

	/**
	 *	Parses data from the IsoMapPack5 ini section
	 *
	 *	@static
	 *
	 *	@param {Buffer} data - The base64-decoded data
	 *
	 *	@return {Array.<Tile>} The parsed tiles
	 */
	static parse(data) {
		let rawData = new Buffer(0),
			tiles = [ ],
			tileBuf;

		// As long as stere are chunks left, decompress them and push them to rawData
		while(data.length > 0) {
			let in_len = data.readUInt16LE(0),
				out_len = data.readUInt16LE(2),
				chunk = lzo.decompress( data.slice(metaSize, metaSize + in_len), out_len );

			t1.push({ in_len, out_len });

			rawData = Buffer.concat([ rawData, chunk ]);
			data = data.slice(metaSize + in_len);
		}

		// Parse all the tiles! http://goo.gl/ULOjhn
		while(rawData.length > 0) {
			tileBuf = rawData.slice(0, Tile.DataLength);

			tiles.push(new Tile(
				tileBuf.readInt16LE(0), // x-Coordinate
				tileBuf.readInt16LE(2), // y-Coordinate
				tileBuf.readUInt32LE(4), // TileTypeIndex
				tileBuf[8], // TileSubtypeIndex
				tileBuf[9], // Level (Height)
				tileBuf[10] // Unknown
			));

			rawData = rawData.slice(Tile.DataLength);
		}

		return tiles;
	}

	/**
	 *	Serializes an Array of tiles
	 *
	 *	@static
	 *
	 *	@param {Array.<Tile>} tiles - An array of tiles
	 *
	 *	@return {Buffer} The compressed and encoded data
	 */
	static serialize(tiles) {
		let rawData = new Buffer(tiles.length * Tile.DataLength),
			offset;

		// Concat all tiles into one Buffer
		tiles.forEach((tile, i) => {
			offset = i * Tile.DataLength;

			rawData.writeInt16LE(tile.x, offset);
			rawData.writeInt16LE(tile.y, offset + 2);
			rawData.writeUInt32LE(tile.type, offset + 4);
			rawData[offset + 8] = tile.subtype;
			rawData[offset + 9] = tile.height;
			rawData[offset + 10] = tile.unknown;
		});

		let compressedData = new Buffer(0),
			meta = new Buffer(metaSize); // Allocate the memory for metadata only once, not for every chunk

		// Split the data into chunks and compress them
		while(rawData.length > 0) {
			let chunk = rawData.slice(0, maxChunkSize),
				compressed = lzo.compress(chunk),
				out_len = chunk.length,
				in_len = compressed.length;

			t2.push({ in_len, out_len });

			meta.writeUInt16LE(in_len, 0);
			meta.writeUInt16LE(out_len, 2);

			compressedData = Buffer.concat([ compressedData, meta, compressed ]);

			rawData = rawData.slice(out_len);
		}

		t1.forEach((v, i) => console.log('Chunk #' + (i + 1), '-- Read from file:', v, '-- Serialized:', t2[i]));

		return compressedData;
	}

}

IsoMapPack5.Tile = Tile;

module.exports = IsoMapPack5;