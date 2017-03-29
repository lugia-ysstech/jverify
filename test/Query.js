/**
 * Created by liguoxin on 2017/3/29.
 */
const User = require('./User');

module.exports = {
  getName () {
    return User.getName();
  },

  getAge () {
    return User.age;
  },
};
