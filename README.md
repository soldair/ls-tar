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

result is an array of entires. each entry has a name and size.

```js
[{"name":"a/","size":"0"},{"name":"a/file.txt","size":"8"}]

```

## api

`ls(tar,cb)` 
  - default export. `ls = require('ls-tar')`
  - tar is the file you want to list. can be gzipped
  - cb(err,entries) the callback

`ls.stream(tar,cb)`
  - tar. the tarball
  - cb(err,stream)
    - stream as an object stream on entires 
    - `{"name":"a/file.txt","size":"8"}`
    - errors from tar are emitted as errors on the stream. you must handle them.



