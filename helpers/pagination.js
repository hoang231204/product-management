module.exports = (query,countData,limit)=>{
    let objectPagination = {
        currentPage: 1,
        limitPage: limit || 8,
        skipPage: null,
        totalPage: null,
    }
    if(query.page){
        objectPagination.currentPage = parseInt(query.page);
    }
    objectPagination.skipPage = (objectPagination.currentPage - 1)*objectPagination.limitPage;
    objectPagination.totalPage = Math.ceil(countData/objectPagination.limitPage);
    return objectPagination;
}