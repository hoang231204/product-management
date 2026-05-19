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
    console.log(closeAlert)
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
  let url = new URL(window.location.href);
    quantityInputs.forEach(input=>{
        input.addEventListener("change",(event)=>{
          console.log(input)
          const newQuantity = event.target.value;
          const productId = input.getAttribute("product-id");
          window.location.href = `/cart/update/${productId}?quantity=${newQuantity}`;
        })
    })
}