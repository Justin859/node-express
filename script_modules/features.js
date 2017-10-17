
   // could be a temporary fix for source img problem with facebook api
var imgFix = function (str) {
    str = str.split(".");
    str[1] = "xx";
    str = str.join(".");
    return str;
};

var lengthFix = function (str) {
    strArr = str.split(' ');
    strArr.forEach(function(item) {
        if (item.length > 25) {
        str = str.slice(0, 25);
        }
    });
    return str;
};

module.exports = { imgFix: imgFix, lengthFix: lengthFix }