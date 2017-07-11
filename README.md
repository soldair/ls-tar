# ls-tar
ls a tar with gnu tar in child processes. 

this is a silly wrapper around `tar -tvf` that manages spawning only up to a number of processes your system can handle.

warning. this may only work on linux as it parses the string output of gnutar.
use node tar for x platform. https://www.npmjs.com/package/tar

## example

```js
const ls = require('ls-tar')

ls('./my-tar.tgz', function(err,result){
  console.log(result)
})
```

result is an object.

```js


```

## api

`ls(tar,cb)` default export. `ls = require('ls-tar')`
  - 




