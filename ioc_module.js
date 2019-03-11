'use strict';

const MultiHttpSocketAdapter = require('./dist/commonjs/index').MultiHttpSocketAdapter;

function registerInContainer(container) {

  container.register('MultiHttpSocketAdapter', MultiHttpSocketAdapter)
    .dependencies('container')
    .configure('http:http_extension')
    .singleton();
}

module.exports.registerInContainer = registerInContainer;
