// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
const splitPosixPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

// Split a filename into [root, dir, basename, ext], win version
// 'root' is a drive letter, like 'C:', or '\\host' for UNC, or nothing.
const splitWinPathRe =
    /^([a-zA-Z]:|[\/\\]{2}(?:[\s\S]*?(?=[\/\\]))?)?([\s\S]*?)((?:\.{1,2}|[^\/\\]+?|)(\.[^.\/\\]*|))(?:[\/\\]*)$/;

function splitPath(filename, posix = true) {
  return posix
    ? splitPosixPathRe.exec(filename).slice(1)
    : splitWinPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
export function resolve() {
  return _resolve(...arguments, true);
}
function _resolve() {
  var resolvedPath = '',
    resolvedAbsolute = false,
    posix = arguments[arguments.length - 1],
    sep = posix ? '/' : '\\',
    maxArgumentIndex = arguments.length - 2;

  for (var i = maxArgumentIndex; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : sep;

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + sep + resolvedPath;
    resolvedAbsolute = _isAbsolute(path, posix);
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split(sep), function(p) {
    return !!p;
  }), !resolvedAbsolute).join(sep);

  return ((resolvedAbsolute ? sep : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
export function normalize(path) {
  return _normalize(path, true);
}
function _normalize(path, posix) {
  const sep = posix ? '/' : '\\',
    isPathAbsolute = _isAbsolute(path, posix),
    trailingSlash = substr(path, -1) === sep;

  // Normalize the path
  path = normalizeArray(filter(path.split(sep), function(p) {
    return !!p;
  }), !isPathAbsolute).join(sep);

  if (!path && !isPathAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += sep;
  }

  return (isPathAbsolute ? sep : '') + path;
};

// posix version
export function isAbsolute(path) {
  return _isAbsolute(path, true);
}
function _isAbsolute(path, posix) {
  return posix
    ? path.charAt(0) === '/'
    : splitPath(path, posix)[0].charAt(0) === '\\';
}

// posix version
export function join() {
  return _join(arguments, true);
}
function _join(args, posix) {
  const sep = posix ? '/' : '\\',
    paths = Array.prototype.slice.call(args, 0);
  return _normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join(sep), sep);
}

// path.relative(from, to)
// posix version
export function relative(from, to) {
  return _relative(from, to, true);
}
function _relative(from, to, posix) {
  const sep = posix ? '/' : '\\';

  from = resolve(from).substr(1);
  to = resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split(sep));
  var toParts = trim(to.split(sep));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join(sep);
}

export var sep = '/';
export var delimiter = ':';

// posix version
export function dirname(path) {
  return _dirname(path, true);
}
function _dirname(path, posix) {
  var result = splitPath(path, posix),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
}

// posix version
export function basename(path, ext) {
  return _basename(path, ext, true);
}
function _basename(path, ext, posix) {
  var f = splitPath(path, posix)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
}

// posix version
export function extname(path) {
  return _extname(path, true);
}
function _extname(path, posix) {
  return splitPath(path, posix)[3];
}

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
  ? function (str, start, len) { return str.substr(start, len) }
  : function (str, start, len) {
      if (start < 0) {
        start = str.length + start;
      }
      return str.substr(start, len);
    };

export const posix = {
  basename: basename,
  delimiter: ':',
  dirname: dirname,
  extname: extname,
  join: join,
  normalize: normalize,
  relative: relative,
  resolve: resolve,
  sep: '/'
};

export const win32 = {
  basename: function (path, ext) {
    return _basename(path, ext, false);
  },
  delimiter: ';',
  dirname: function (path) {
    return _dirname(path, false);
  },
  extname: function(path) {
    return _extname(path, false);
  },
  join: function () {
    return _join(arguments, false);
  },
  normalize: function (path) {
    return _normalize(path, false);
  },
  relative: function (from, to) {
    return _relative(from, to, false);
  },
  resolve: function () {
    return _resolve(...arguments, false);
  },
  sep: '\\'
};

export default {
  basename: basename,
  delimiter: delimiter,
  dirname: dirname,
  extname: extname,
  isAbsolute: isAbsolute,
  join: join,
  normalize: normalize,
  posix: posix,
  relative: relative,
  resolve: resolve,
  sep: sep,
  win32: win32
};
