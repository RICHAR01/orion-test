'use strict';

const mongoURI = 'mongodb://4dm1n4n1m3:p4ssw0rdb34t@ds145329.mlab.com:45329/anibeat';

console.log('Connecting to MongoDB using the URI: ' + mongoURI);

module.exports = [
  {
    "name": "mongodb",
    "store": "mongodb",
    "url": mongoURI
  }
];

