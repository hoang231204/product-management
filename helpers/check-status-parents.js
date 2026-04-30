const checkStatusParents = (arr,parentId) => {
    if(parentId == null){
        return true;
    }
    for (const item of arr) {
        if (item._id.toString() === parentId.toString()) {
            if (item.status === "inactive") {
                return false;
            }
            return checkStatusParents(arr, item.parent_id);
        }
    }
}
module.exports = checkStatusParents;