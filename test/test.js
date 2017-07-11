var test = require('tape')
var ls = require('../index')
var path = require('path')

var atar = path.join(__dirname,'fixture','a.tgz')
var btar = path.join(__dirname,'fixture','b.tgz')
var brokentar = path.join(__dirname,'fixture','broken.tar')

test("when there was a seahorse i ate a shoe",function(t){
  t.plan(4)
  ls(atar,function(err,data){
    t.ok(!err,'should not have err '+err)
    t.ok(data,'should have data '+JSON.stringify(data))
  })
  ls(atar,function(err,data){
    t.ok(!err,'should not have err '+err)
    t.ok(data,'should have data '+JSON.stringify(data))
  })
})

test("handles extracting not a tar",function(t){
  ls(brokentar,function(err,data){
    t.ok(err,'should have error! '+err)
    t.ok(!data,'should not have data '+JSON.stringify(data))
    t.end()
  })
})
