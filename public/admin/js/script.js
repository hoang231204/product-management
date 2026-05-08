//console.log(window.location.href)
//FILTER
const filterButtons = document.querySelectorAll("[button-status]")
if(filterButtons.length>0){
    let url = new URL(window.location.href)
    filterButtons.forEach(button=>{
        button.addEventListener("click",()=>{
            const status = button.getAttribute("button-status")
            if(status){
                url.searchParams.set("status", status);
                url.searchParams.set("page",1)
            }
            else{
                url.searchParams.delete("status")
            }
            window.location.href = url;
        })
    })
}
//SEARCH
const formSearch = document.querySelector("#form-search")
if(formSearch){
    formSearch.addEventListener("submit",(event)=>{
    event.preventDefault();
    //console.log(event.target.elements.keyword.value)
    const value = event.target.elements.keyword.value;
    let url = new URL(window.location.href)
    if(value){
        url.searchParams.set("keyword",value)
        url.searchParams.set("page",1)
    }
    else{
        url.searchParams.delete("keyword")
    }
    window.location.href = url
})
}

//PAGINATION
    const buttonsPage = document.querySelectorAll(".page-link")
    if(buttonsPage){
        let url = new URL(window.location.href)
        buttonsPage.forEach(button =>{
            button.addEventListener("click",()=>{
                const buttonPage = button.getAttribute("button-page")

                    url.searchParams.set("page",buttonPage)

                
                window.location.href = url;
            })
        })
    }

//SHOW-ALERT
const showAlert = document.querySelectorAll("[show-alert]")
if(showAlert){
    showAlert.forEach(alert => {
        const data_time = alert.getAttribute("data-time")
        const time = parseInt(data_time)
        const closeAlert = alert.querySelector("[close-alert]")
        closeAlert.addEventListener("click",()=>{
            alert.classList.add("alert-hidden")
    })
    setTimeout(()=>{
        alert.classList.add("alert-hidden")
    },time)
    })
}
//CHANGE STATUS
const buttonsChange = document.querySelectorAll("[button-change-status]")
const form = document.querySelector("[form-change-status]")
const path = form.getAttribute("data-path")
if(buttonsChange.length>0){
    buttonsChange.forEach(button => {
        button.addEventListener("click",()=>{
            const currentStatus = button.getAttribute("data-status")
            //console.log(currentStatus)
            const id = button.getAttribute("data-id")
            //console.log(id)
            let statusChange;
            switch (currentStatus) {
            case "active":
                statusChange = "inactive";
                break;
            case "inactive":
                statusChange = "active";
                break;
            case "pending":
                statusChange = "active";
                break;
            case "low_stock":
                statusChange = "active"; 
                break;
            default:
                statusChange = "active"; 
            }
            const action = path + `/${statusChange}/${id}?_method=PATCH`
            form.action = action;
            console.log(action)
            form.submit();
        })
    })
}
//DELETE
const buttonsDelete = document.querySelectorAll("[button-delete]")
if(buttonsDelete.length>0){
    const formDelete = document.querySelector("[form-delete]")
    const pathDel = formDelete.getAttribute("data-path")
    buttonsDelete.forEach(buttonDelete =>{
        buttonDelete.addEventListener("click",()=>{
                const check = confirm('Bạn chắc chắn xóa?')
                if(check ==true){
                    const id = buttonDelete.getAttribute("data-id")
                    const action =`${pathDel}/${id}?_method=PATCH`
                    formDelete.action = action;
                    formDelete.submit();
                }
                
            })
            
        })
    }
//EDIT
const buttonsEdit = document.querySelectorAll("[button-edit]");
const formEdit = document.querySelector("[form-edit]");
if(formEdit){
    const dataPathEdit = formEdit.getAttribute("data-path");
}
if(buttonsEdit.length>0){
    buttonsEdit.forEach(buttonEdit=>{
      buttonEdit.addEventListener("click",()=>{
        const id = buttonEdit.getAttribute("idEdit");
        const action = `${dataPathEdit}/${id}?_method=PATCH`;
        formEdit.action = action;
        formEdit.submit();
      })
    })
}  


// PREVIEW IMAGE
const formCreate = document.querySelector("[form-upload]")
if(formCreate){
    const uploadImage= formCreate.querySelector("[upload-image]")
    const uploadImageInput = document.querySelector("[upload-image-input]")
    const uploadImagePreview = document.querySelector("[upload-image-preview]")

    uploadImageInput.addEventListener("change",(event)=>{
    const [file] = event.target.files;
    if(file){
      uploadImagePreview.src = URL.createObjectURL(file)
    }
  })
  const buttonRemoveImage = document.querySelector(".btn-remove-image")
  buttonRemoveImage.addEventListener("click",()=>{
    uploadImageInput.value = "";
    uploadImagePreview.src = "";
  })
}
//SORT
const sort = document.querySelector("[sort]");
if(sort){
    const sortSelect = sort.querySelector("[sort-select]");
    let url = new URL(window.location.href);
    sortSelect.addEventListener("change",(event)=>{
        const value = event.target.value;
        const [type,order] = value.split("-");
        url.searchParams.set("sortBy",type);
        url.searchParams.set("sortType",order);
        window.location.href = url; 
    })
    const clear = sort.querySelector("[sort-clear]");
    clear.addEventListener("click",()=>{
        url.searchParams.delete("sortBy");
        url.searchParams.delete("sortType");
        window.location.href = url;
    })
    const sortBy = url.searchParams.get("sortBy");
    const sortType = url.searchParams.get("sortType");
    if(sortBy && sortType){
        const selectedOption = sortSelect.querySelector(`option[value="${sortBy}-${sortType}"]`);
        if(selectedOption){
            selectedOption.selected = true;
        }
    }
}
