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
    event.target.elements.keyword.value = ""
})
}
//SHOW-ALERT
const showAlert = document.querySelectorAll("[show-alert]");
if (showAlert.length > 0) {
  showAlert.forEach(alert => {
    
    const data_time = alert.getAttribute("data-time");
    const time = parseInt(data_time) || 3000;
    const closeAlert = alert.querySelector("[close-alert]");
    if (closeAlert) { 
      closeAlert.addEventListener("click", () => {
        alert.classList.add("alert-hidden");
      });
    }
    setTimeout(() => {
      alert.classList.add("alert-hidden");
    }, time);
  });
}
//CHANGE QUANTITY
const quantityInputs = document.querySelectorAll(`input[name="quantity"]`);
if(quantityInputs.length > 0){
    const cartCard = document.querySelector(".cart-card");
    const cartSummary = document.querySelector(".cart-summary");
    const setCartLoading = () => {
      if(cartCard){
        cartCard.classList.add("is-loading");
      }
      if(cartSummary){
        cartSummary.classList.add("is-loading");
      }
    }

    const updateCartQuantity = (productId, nextQuantity) => {
      const quantity = Math.max(1, Number(nextQuantity) || 1);
      setCartLoading();
      window.location.href = `/carts/update/${productId}?quantity=${quantity}`;
    }

    quantityInputs.forEach(input=>{
        input.addEventListener("change",(event)=>{
          const newQuantity = event.target.value;
          const productId = input.getAttribute("product-id");
          updateCartQuantity(productId, newQuantity);
        })
    })

    const qtyButtons = document.querySelectorAll("[cart-qty-action]");
    if(qtyButtons.length > 0){
      qtyButtons.forEach(button => {
        button.addEventListener("click", () => {
          const control = button.closest(".cart-qty-control");
          if(!control){
            return;
          }
          const input = control.querySelector('input[name="quantity"]');
          if(!input){
            return;
          }
          const action = button.getAttribute("cart-qty-action");
          const currentValue = Number(input.value) || 1;
          const nextQuantity = action === "increase" ? currentValue + 1 : currentValue - 1;
          const productId = input.getAttribute("product-id");
          updateCartQuantity(productId, nextQuantity);
        })
      })
    }
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
// CANCEL ORDER
const cancelButtons = document.querySelectorAll("[button-cancel]");
if(cancelButtons.length>0){
  const formCancel = document.querySelector("[form-cancel]")
  if(formCancel){
    const path = formCancel.getAttribute("data-path")
    cancelButtons.forEach(button=>{
      button.addEventListener("click",(event)=>{
        const confirmCancel = confirm("Bạn có chắc muốn hủy đơn hàng này không?")
        if(!confirmCancel){
          return;
        }
        const orderId = button.getAttribute("data-id")
        formCancel.action = `${path}/${orderId}?_method=PATCH`
        formCancel.submit()
      })
    })
  }
}
//FILTER
const filterButtons = document.querySelectorAll("[button-category]")
if(filterButtons.length>0){
    let url = new URL(window.location.href)
    filterButtons.forEach(button=>{
        button.addEventListener("click",()=>{
            const slug = button.getAttribute("data-slug")
            if(slug){
                url.searchParams.set("slugCategory", slug);
                url.searchParams.set("page",1)
            }
            else{
                url.searchParams.delete("slugCategory")
            }
            window.location.href = url;
        })
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
