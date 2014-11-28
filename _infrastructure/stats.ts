import utils = require('./modules/fileutils')
import path = require('path')
import fs = require('fs')

// TODO: parse argv to match regular expressions on paths

var filter = utils.createFileFilter(".d.ts$");
	filter = filter.concat(utils.createDirFilter("!_.*", "."));

var checkExp = {
	objectAnnotation: new RegExp(':[\s]*Object', 'g'),
	anyAnnotation: new RegExp(':[\s]*any', 'g'),
	mixedAnnotation: new RegExp(':[\s]*{}', 'g'),
}

var stats = {
	totalFiles: 0,
	files: {}
}

var baseDir = path.join(__dirname, '..');
var files = utils.getFiles(baseDir, [], filter)

var fpath, relName, content = "";
for (var i in files) {
	fpath = files[i]
	relName = fpath.substr(baseDir.length + path.sep.length)
	content = fs.readFileSync(fpath, 'utf8');

	stats.files[relName] = {}

	for (var name in checkExp) {
		stats.files[relName][name] = countRegexp(content, checkExp[name])
		if (typeof stats[name] === 'undefined')
			stats[name] = 0

		stats[name] += stats.files[relName][name];
	}
	stats.totalFiles++;
}

var count = 0;
function countRegexp(content: string, exp: RegExp) {
	count = 0;
	content.replace(exp, countRegexpReplace)
	return count
}
function countRegexpReplace(match) {
	count++;
	return match
}

for (var p in stats) {
	if (typeof stats[p] === 'number')
		console.log('  '+ p + ' => ' + stats[p])
}

var detail = false;

if (detail) {
	// Info about files
	for (var relName in stats.files) {
		var tot = 0;
		for (var c in stats.files[relName]) {
			tot += stats.files[relName][c]
		}

		if (tot) {
			console.log("  " + relName)
			console.log(stats.files[relName])
		}

	}
}

