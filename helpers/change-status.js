const checkStatusParents = require("./check-status-parents");
const getChildren = require("./get-children");
module.exports = (arr, status, id, req, res)=>{
    const ids = []
        if(status === "inactive"){
            ids.push(id);
            const childrenId = getChildren(arr, id);
            ids.push(...childrenId);
        }
        else{
            const parentId = arr.find(item => item._id.toString() === id).parent_id;
            const checkStatus = checkStatusParents(arr, parentId);
            if(checkStatus == true){
                ids.push(id);
            }
            else{
                return;
            }
        }
    return ids;
}