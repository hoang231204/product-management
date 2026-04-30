const checkStatusParents = require("./check-status-parents");
const getChildren = require("./get-children");
module.exports = (arr, status, id)=>{
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
                req.flash("error", "Danh mục cha chưa được kích hoạt!");
                const backUrl = req.get("Referrer");
                return res.redirect(backUrl);
            }
        }
    return ids;
}