//CHANGE STATUS
const buttonsChange = document.querySelectorAll("[button-change-status]")
    //console.log(buttonsChange)
const form = document.querySelector("[form-change-status]")
const path = form.getAttribute("data-path")
    //console.log(path)
if(buttonsChange.length>0){
    buttonsChange.forEach(button => {
        button.addEventListener("click",()=>{
            const currentStatus = button.getAttribute("data-status")
            //console.log(currentStatus)
            const id = button.getAttribute("id")
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
//CHANGEMULTI STATUS - DELETE - POSITION
const checkboxMulti = document.querySelector("[check-box-multi]")
if(checkboxMulti){
    const inputCheckAll = checkboxMulti.querySelector("input[name='checkAll']")
    const inputsId = checkboxMulti.querySelectorAll("input[ name='id']")
    inputCheckAll.addEventListener("click",()=>{
        if(inputCheckAll.checked){
        inputsId.forEach(input=>{
            input.checked = true;
        })
        }
        else{
            inputsId.forEach(input=>{
            input.checked = false;
        })
        }
    })
    inputsId.forEach(input=>{
        input.addEventListener("click",()=>{
            const countchecked = checkboxMulti.querySelectorAll("input[ name='id']:checked").length
            const countInput = checkboxMulti.querySelectorAll("input[ name='id']").length
            if(countchecked!=countInput){
                inputCheckAll.checked = false;
            }
            else{
                inputCheckAll.checked = true;
            }
        })
    })
}
const formChangeMulti = document.querySelector("[form-change-multi]")
if(formChangeMulti){
    formChangeMulti.addEventListener("submit",(event)=>{
        event.preventDefault();
        const typeChange = formChangeMulti.querySelector("[name='type']").value
        if(typeChange == "delete"){
            const isConfirm = confirm("Bạn chắc chắn xóa?")
            if(!isConfirm) return;
        }
        const inputsChecked = checkboxMulti.querySelectorAll("input[ name='id']:checked")
        if(inputsChecked.length>0){
          const idsChecked = formChangeMulti.querySelector("input[ name='ids']")
          let ids=[];
          inputsChecked.forEach(input=>{
              if(typeChange == "change-position"){
                const newPosition = input.closest("tr").querySelector("input[name='position']").value;
                ids.push(`${input.value}-${newPosition}`)
              }else{
                ids.push(input.value);
              }
          })
          ids = ids.join(",");
          idsChecked.value = ids;
          formChangeMulti.submit();
          
        }else{
            alert("Hãy chọn 1 sản phẩm!")
        }
    })
}
//XÓA SẢN PHẨM
const buttonsDelete = document.querySelectorAll("[button-delete]")
if(buttonsDelete.length>0){
    const formDelete = document.querySelector("[form-delete]")
    const pathDel = formDelete.getAttribute("data-path")
    buttonsDelete.forEach(buttonDelete =>{
        buttonDelete.addEventListener("click",()=>{
                const check = confirm('Bạn chắc chắn xóa sản phẩm?')
                if(check ==true){
                    const id = buttonDelete.getAttribute("idDel")
                    const action =`${pathDel}/${id}?_method=DELETE`
                    formDelete.action = action;
                    formDelete.submit();
                }
                
            })
            
        })
    }
//SỬA SẢN PHẨM
const buttonsEdit = document.querySelectorAll("[button-edit]");
const formEdit = document.querySelector("[form-edit]");
const pathEdit = formEdit.getAttribute("data-path");
if(buttonsEdit.length>0){
    buttonsEdit.forEach(buttonEdit=>{
      buttonEdit.addEventListener("click",()=>{
        const id = buttonEdit.getAttribute("idEdit");
        const action = `${pathEdit}/${id}`;
        formEdit.action = action;
        formEdit.submit();
      })
    })
}  
