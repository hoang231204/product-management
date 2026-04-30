//console.log(window.location.href)
//BỘ LỌC
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
//TÌM KIẾM
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

//PHÂN TRANG
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
const showAlert = document.querySelector("[show-alert]")
if(showAlert){
    const data_time = showAlert.getAttribute("data-time")
    const time = parseInt(data_time)
    const closeAlert = showAlert.querySelector("[close-alert]")
    closeAlert.addEventListener("click",()=>{
        showAlert.classList.add("alert-hidden")
    })
    setTimeout(()=>{
        showAlert.classList.add("alert-hidden")
    },time)
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
