/**
 * Created by liguoxin on 2017/3/29.
 */
const User = require('./User');

module.exports = {
  getName () {
    return User.getName();
  },
  add (a, b) {
    return User.add.bind(this)(a, b);
  },
  getAge () {
    return User.age;
  },
};
