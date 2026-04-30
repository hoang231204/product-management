let count = 0;
const createTree = (categories,parentId = null)=>{
        const tree=[];
        categories.forEach((item)=>{
            if(item.parent_id == parentId){
                const newItem = item.toObject();
                newItem.index = ++count;
                const children = createTree(categories,item._id);
                if(children.length > 0){
                    newItem.children = children;
                }
                tree.push(newItem);
            }
        })
        return tree;
}
module.exports = (categories, parentId = null) => {
    count = 0;
    return createTree(categories, parentId);
}