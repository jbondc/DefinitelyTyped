
import fs = require('fs');
import path = require('path');

export function getFiles($dir, $files = [], $filter = []) {
	var fileFilter = []
	var dirFilter = []

	for (var i in $filter) {
		if ($filter[i].directory) {
			dirFilter.push($filter[i])
		} else {
			fileFilter.push($filter[i])
		}
	}

	return _getFiles($dir, $files, fileFilter, dirFilter)
}

export function createDirFilter(...$expr) {
	if (Array.isArray($expr[0]))
		$expr = $expr[0]

	return _createFilter($expr, true);
}

export function createFileFilter(...$expr) {
	if (Array.isArray($expr[0]))
		$expr = $expr[0]

	return _createFilter($expr, false);
}

function _createFilter($expr: string[], isDir = false) {
	var r: RegExpFilter
	var res = []
	var expr = ""
	var exclude = false

	for (var i in $expr) {
		expr = $expr[i]
		if (expr[0] === '!') {
			r = <RegExpFilter>new RegExp(expr.substr(1))
			r.exclude = true
		} else {
			r = <RegExpFilter>new RegExp(expr)
		}

		if (expr === '.*' || expr === '.')
			r.all = true;

		if (isDir)
			r.directory = true

		res.push(r)
	}

	return res;
}

interface RegExpFilter extends RegExp {
	exclude: boolean
	directory: boolean
	all: boolean
}

function _getFiles($dir: string, $files: any, $fileFilter: RegExpFilter[], $dirFilter: RegExpFilter[]) {
	try {
		var list = fs.readdirSync($dir)
	} catch (e) {
		if (fs.statSync($dir).isFile()) {
			if (matchFilter($dir, $fileFilter) === true)
				$files.push($dir);

			return $files
		}
		throw e;
	}

	var fpath = "",
		fname = ""

	for (var i in list) {
		if (!list.hasOwnProperty(i))
			continue;

		fname = list[i]
		fpath = $dir + path.sep + fname;

		if (fs.statSync(fpath).isDirectory()) {
			if (matchFilter(fname, $dirFilter) === true) {
				_getFiles(fpath, $files, $fileFilter, $dirFilter)
			}
			continue
		}

		if (matchFilter(fname, $fileFilter) === false)
			continue;

		$files.push(fpath);
	}
	return $files;
}

function matchFilter($name, $filter: RegExpFilter[]) {
	var fexp: RegExpFilter
	var match = false,
		res = [];

	for (var m in $filter) {
		fexp = $filter[m];
		if (fexp.all === true)
			return true

		res = $name.match(fexp)
		if (res !== null) {
			if (!fexp.exclude)
				match = true
			break;
		}
	}

	return match
}
