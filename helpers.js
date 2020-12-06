// gets rid of all fields from obj except those in projection
function project(obj, fieldsToKeep) {
    let projectedObj = {}
    for(let key in fieldsToKeep) {
        projectedObj[key] = obj[key];
    }
    return projectedObj;
  }


module.exports = {
    project
};