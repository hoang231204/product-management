const checkStatusParentsMulti = (categories, parentId, idsSelectedSet) => {
    if (parentId==null) return true;
    const parent = categories.find(item => item._id.toString() === parentId);
    if (!parent){
        return true;
    }
    if (parent.status === "active" || idsSelectedSet.has(parent._id.toString())) {
        return checkStatusParentsMulti(categories, parent.parent_id?.toString(), idsSelectedSet);
    }
    
    return false;
}
module.exports = checkStatusParentsMulti;