'use strict';

/**
 * Helper functions to allow for easy iteration of the parsed ini object
 * 
 * @namespace Parser
 *
 * @property {Object} parsers - A list of all parsers
 */
class Parser {

	/**
	 * Calls the parser for the given section
	 *
	 * @static
	 * @memberOf Parser
	 *
	 * @param {String} section - the name of the section
	 * @param {Any} data - The data to pass to the parser
	 * @param {Boolean} [specialParse=false] - Indicates whether to __parse if existent
	 */
	static parse(section, data, specialParse) {
		let p = Parser.getParser(section);

		if(!p)
			return data;

		else if(specialParse && p.hasOwnProperty('__parse'))
			return p.__parse(data);

		else if(p.hasOwnProperty('parse'))
			return p.parse(data);

		else
			throw new ReferenceError('No parsing function found for ' + section);
	}

	/**
	 * Calls the serializer for the given section
	 *
	 * @static
	 * @memberOf Parser
	 * 
	 * @param {String} section - The name of the section
	 * @param {Any} data - The data to serialize
	 * @param {Boolean} specialSerialize - Indicates whether to call the __serialize function of a parser
	 */
	static serialize(section, data, specialSerialize) {
		let p = Parser.getParser(section);

		if(!p)
			return data;

		else if(specialSerialize && p.hasOwnProperty('__serialize'))
			return p.__serialize(data);

		else if(p.hasOwnProperty('serialize'))
			return p.serialize(data);

		else
			throw new ReferenceError('No serializing function found for ' + section);
	}

	/**
	 * Get the parser for a specific ini section
	 * 
	 * @param {String} section - The section to get the parser for
	 */
	static getParser(section) {
		return Parser.parsers[section] || null;
	}
}

Parser.parsers = {
	'IsoMapPack5': require('./IsoMapPack5')
};

module.exports = Parser;