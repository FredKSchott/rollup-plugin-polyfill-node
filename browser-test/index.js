var rollup = require( 'rollup' );
var nodePolyfills = require('..');
rollup.rollup({
  input: 'browser-test/main.js',
  plugins: [
    nodePolyfills(),
  ]
}).then( function ( bundle ) {
  return bundle.write({
    format: 'iife',
    file: 'browser-test/dist/bundle.js'
  });
}).then(function () {
  console.log('done');
  process.exit();
}).catch(function (e) {
  console.log('oh noes!');
  console.log(e);
  process.exit(1);
});
