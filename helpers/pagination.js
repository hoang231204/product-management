module.exports = (query,countData)=>{
    let objectPagination = {
        currentPage:null,
        limitPage:null,
        skipPage:null,
        totalPage:null,
    }
    if(query.page){
        objectPagination.currentPage = parseInt(query.page);
    }
    else{
        objectPagination.currentPage = 1;
    }
    objectPagination.limitPage = 5;
    objectPagination.skipPage = (objectPagination.currentPage - 1)*objectPagination.limitPage;
    objectPagination.totalPage = Math.ceil(countData/objectPagination.limitPage);
    return objectPagination;
}