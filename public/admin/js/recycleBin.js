//XÓA VĨNH VIỄN
const buttonsDel = document.querySelectorAll("[button-hard-delete]")
if(buttonsDel.length>0){
    const formDel = document.querySelector("[form-hard-delete]")
    const path = formDel.getAttribute("data-path")
    buttonsDel.forEach(buttonDel =>{
        buttonDel.addEventListener("click",()=>{
           const check = confirm("Xóa vĩnh viễn sản phẩm?")
           if(check ==true){
                const dataId = buttonDel.getAttribute("data-id")
                const action = `${path}/${dataId}?_method=DELETE`
                formDel.action = action;
                formDel.submit();
           }
          
        })
    })
}
//KHÔI PHỤC
const buttonsRestore = document.querySelectorAll("[button-restore]")
if(buttonsRestore.length>0){
    const formRes = document.querySelector("[ form-restore]")
    const path = formRes.getAttribute("data-path")
    buttonsRestore.forEach(buttonRes =>{
        buttonRes.addEventListener("click",()=>{
            const dataId = buttonRes.getAttribute("data-id")
            const action = `${path}/${dataId}?_method=PATCH`
            formRes.action = action;
            formRes.submit();
        })
       
    })
}