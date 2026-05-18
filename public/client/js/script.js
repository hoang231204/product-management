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