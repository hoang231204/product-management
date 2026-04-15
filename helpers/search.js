module.exports = (query)=>{
    let item = query.keyword;
    const regex = new RegExp(item,'i');
    return regex;
}