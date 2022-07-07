import {fileURLToPath} from 'url';

const hello = 'file:///hello world';

if (
  fileURLToPath(hello) !== '/hello world'
) {
  done(new Error('invalid object'));
}

done();
