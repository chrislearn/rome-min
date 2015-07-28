var utilFile = require('./util-file');
var path = require('path');
var postcss = require('postcss');
var base64 = require('base64-stream');
var Promise = require("bluebird");

// function isPathAbsolute(path) {
//   return /^(?:\/|[a-z]+:\/\/)/.test(path);
// }
var fs = require("fs"),
    util = require("util");

var mime = require("mime");
function base64Image(src) {
    var data = fs.readFileSync(src).toString("base64");
    return util.format("data:%s;base64,%s", mime.lookup(src), data);
}

module.exports = function(srcPath, distPath){
  var html = utilFile.read(srcPath), basePath = path.parse(srcPath).dir;
  var cheerio = require('cheerio'), $ = cheerio.load(html), cssFiles = [], js = '', css = '';
  $('script[src]').each(function(){
    var $this = $(this), src = $this.attr('src');
    if (!path.isAbsolute(src)){
      $this.remove();
      try{
        js += utilFile.read(path.resolve(basePath, src));
      }catch (e){
        console.log(e);
      }
    }
  });
  $('link[rel="stylesheet"]').each(function(){
    var $this = $(this), src = $this.attr('href'), base = path.parse(src).dir;
    if (!path.isAbsolute(src)){
      $this.remove();
      cssFiles.push({base: base, content: utilFile.read(path.resolve(basePath, src))});
    }
  });
  var urlRegex = /url\(['"]?([^)'"]+)['"]?\)/;
  cssFiles.forEach(function(cssFile){
    css += postcss([function(css){
      console.log('==========css.options', css.optiions)
      css.eachDecl(function(decl){
        if (decl.prop.indexOf('background') === 0 || decl.prop.indexOf('border-image') === 0 && decl.value.indexOf("url") >= 0){
          var result = urlRegex.exec(decl.value);
          if (result && result.length === 2){
            var url = result[1];
            if (!path.isAbsolute(url)){
              //var data = new Buffer(utilFile.read(path.resolve(basePath, cssFile.base, url))).toString('base64');
              var url = path.relative(basePath, path.resolve(basePath, cssFile.base, url));
              decl.value = decl.value.replace(urlRegex, 'url(' + url + ')');
            }
          }
        }
      });
    }]).process(cssFile.content).css;
  });
  if (css.length > 0){
    $('html>head').append('<style>'+ css + '</style>');
  }
  if (js.length > 0){
    $('html>body').append('<script>' + js + '</script>');
  }

  $('img[rome-embed]').each(function(){
    var $this = $(this).removeAttr('rome-embed'), src = $this.attr('src');
    $this.attr('src', base64Image(path.resolve(basePath, src)))
  });

  var minify = require('html-minifier').minify, minHtml = minify($.html(), {
    removeComments: true,
    removeCommentsFromCDATA: true,
    collapseWhitespace: true,
    caseSensitive: true,
    minifyJS: true,
    minifyCSS: true,
  });
  if (distPath){
    utilFile.write(path.resolve(basePath, distPath), minHtml);
  }
  return minHtml;
};
