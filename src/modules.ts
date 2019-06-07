const EMPTY_PATH = require.resolve('../polyfills/empty.js');

export interface NodePolyfillsOptions {
  fs?: boolean;
  crypto?: boolean;
  baseDir?: string;
  include?: Array<string | RegExp> | string | RegExp | null;
  exclude?: Array<string | RegExp> | string | RegExp | null;
}

export function builtinsResolver(opts: NodePolyfillsOptions) {
  const libs = new Map();

  libs.set('process', require.resolve('../polyfills/process-es6'));
  libs.set('buffer', require.resolve('../polyfills/buffer-es6'));
  libs.set('util', require.resolve('../polyfills/util'));
  libs.set('sys', libs.get('util'));
  libs.set('events', require.resolve('../polyfills/events'));
  libs.set('stream', require.resolve('../polyfills/stream'));
  libs.set('path', require.resolve('../polyfills/path'));
  libs.set('querystring', require.resolve('../polyfills/qs'));
  libs.set('punycode', require.resolve('../polyfills/punycode'));
  libs.set('url', require.resolve('../polyfills/url'));
  libs.set('string_decoder', require.resolve('../polyfills/string-decoder'));
  libs.set('http', require.resolve('../polyfills/http'));
  libs.set('https', require.resolve('../polyfills/http'));
  libs.set('os', require.resolve('../polyfills/os'));
  libs.set('assert', require.resolve('../polyfills/assert'));
  libs.set('constants', require.resolve('../polyfills/constants'));
  libs.set('_stream_duplex', require.resolve('../polyfills/readable-stream/duplex'));
  libs.set('_stream_passthrough', require.resolve('../polyfills/readable-stream/passthrough'));
  libs.set('_stream_readable', require.resolve('../polyfills/readable-stream/readable'));
  libs.set('_stream_writable', require.resolve('../polyfills/readable-stream/writable'));
  libs.set('_stream_transform', require.resolve('../polyfills/readable-stream/transform'));
  libs.set('timers', require.resolve('../polyfills/timers'));
  libs.set('console', require.resolve('../polyfills/console'));
  libs.set('vm', require.resolve('../polyfills/vm'));
  libs.set('zlib', require.resolve('../polyfills/zlib'));
  libs.set('tty', require.resolve('../polyfills/tty'));
  libs.set('domain', require.resolve('../polyfills/domain'));

  // not shimmed
  libs.set('dns', EMPTY_PATH);
  libs.set('dgram', EMPTY_PATH);
  libs.set('child_process', EMPTY_PATH);
  libs.set('cluster', EMPTY_PATH);
  libs.set('module', EMPTY_PATH);
  libs.set('net', EMPTY_PATH);
  libs.set('readline', EMPTY_PATH);
  libs.set('repl', EMPTY_PATH);
  libs.set('tls', EMPTY_PATH);
  libs.set('fs', EMPTY_PATH);
  libs.set('crypto', EMPTY_PATH);

  if (opts.fs) {
    libs.set('fs', require.resolve('../polyfills/browserify-fs'));
  }
  if (opts.crypto) {
    libs.set('crypto', require.resolve('../polyfills/crypto-browserify'));
  }

  return (importee: string) => {
    if (importee && importee.slice(-1) === '/') {
      importee === importee.slice(0, -1);
    }
    if (libs.has(importee)) {
      return libs.get(importee);
    }
    return null;
  }
}
