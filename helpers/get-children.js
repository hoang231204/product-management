const getChildren = (arr,id)=>{
    let children=[];
    arr.forEach(item=>{
        if(item.parent_id == id){
            const childrenId = item._id.toString();
            children.push(childrenId);
            const childChildren = getChildren(arr,item._id);
            children = children.concat(childChildren);
        }
    })
    return children;
}
module.exports = getChildren;