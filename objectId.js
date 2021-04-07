//606e3693629c613d849890be

// 12 bytes

// 4 bytes: timestamp
// 3 bytes: machine identifier
// 2 bytes: process identifier
// 3 bytes: counter


// 1 byte = 8 bits
// 2 ^ 8 = 256
// 2 ^ 24 = 16M

const mongoose = require('mongoose');
const id = mongoose.Types.ObjectId()
console.log(id);
console.log(id.getTimestamp());

console.log(mongoose.Types.ObjectId.isValid(id));