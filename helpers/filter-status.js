module.exports = (query, type) => {
    let allStatuses = [
        { name: "Tất cả", status: "", class: "" },
        { name: "Hoạt động", status: "active", class: "" },
        { name: "Dừng hoạt động", status: "inactive", class: "" },
        { name: "Sắp hết", status: "low_stock", class: "" },
        { name: "Chờ duyệt", status: "pending", class: "" },
        { name: "Đã xác nhận", status: "confirmed", class: "" },
        { name: "Đang giao hàng", status: "shipping", class: "" },
        { name: "Đã giao hàng", status: "delivered", class: "" },
        { name: "Đã hủy", status: "canceled", class: "" }
    ];
    const productStatuses = ["", "active", "inactive", "low_stock", "pending"];
    const orderStatuses = ["", "pending", "confirmed", "shipping", "delivered", "canceled"];
    let filterStatus = [];
    if(type === 'order'){
        filterStatus = allStatuses.filter(item => orderStatuses.includes(item.status))
    }
    if(type === 'product'){
        filterStatus = allStatuses.filter(item => productStatuses.includes(item.status))
    }
    if(query.status){
        const index = filterStatus.findIndex(item => item.status == query.status)
        filterStatus[index].class = "active"
    }else{
        const index = filterStatus.findIndex(item => item.status === "")
        filterStatus[index].class = "active"
    }
    return filterStatus;
}