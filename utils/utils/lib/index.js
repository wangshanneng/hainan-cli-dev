"use strict";

/**
 * 检查给定的值是否是一个对象。
 * @param {*} obj - 要检查的值。
 * @returns {boolean} - 如果值是对象，则返回true；否则返回false。
 */
function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

module.exports = {
  isObject,
};
