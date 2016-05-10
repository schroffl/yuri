'use strict';

class Parser {

	static parse(section, data) {
		if(!parsers.hasOwnProperty(section))
			throw new ReferenceError('No parser found for section ' + section);

		else if(parsers[section].hasOwnProperty('__parse'))
			return parsers[section].__parse(data);

		else
			return parsers[section].parse(data);
	}

	static serialize(section, data) {
		if(!parsers.hasOwnProperty(section))
			throw new ReferenceError('No parser found for section ' + section);

		else if(parsers[section].hasOwnProperty('__serialize'))
			return parsers[section].__serialize(data);
		
		else
			return parsers[section].serialize(data);
	}
}

const parsers = Parser.parsers = {
	'IsoMapPack5': require('./IsoMapPack5')
};

module.exports = Parser;