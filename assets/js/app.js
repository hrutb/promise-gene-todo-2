let base_url = `https://jsonplaceholder.typicode.com`
let todo_url  =`${base_url}/todos` ;  



const spinner =document.getElementById('spinner');
const titleControl= document.getElementById('title');
const completedControl= document.getElementById('completed');
const todoContainer=document.getElementById('todoContainer');

const addTodo = document.getElementById('addTodo');
const updateTodo = document.getElementById('updateTodo');

const todoFrom = document.getElementById('todoForm');

let todoArr = [] ; 

function  snackbar(msg,icon){ 
           swal.fire({ 
                  title:msg,
                  icon:icon,
                  timer:3000
           })
}


function tooltip(){ 
           $(function () {
                $('[data-toggle="tooltip"]').tooltip()
                })           
}

function makeApiCall(method,url,body=null){ 
        
       return new Promise((resolve,reject)=>{ 
                 spinner.classList.remove('d-none')   
              let xhr = new XMLHttpRequest(); 
                  xhr.open(method,url)
                  xhr.send(body ? JSON.stringify(body):null); 
        
                  xhr.onload = function(){ 
                 
                    if(xhr.status>=200 && xhr.status<=299){ 
                          let res = JSON.parse(xhr.response);
                               console.log(todoArr);
                             
                           if(method==='GET'){
                              if(Array.isArray(res)){

                                   todoArr = [...res].reverse()
                                   resolve(todoArr);
                              }else{

                                   resolve(res);
                                 }
                                    
                           }else if(method==='POST'){ 
                                 let Obj = {...body,id:res.id} 
                                 resolve(Obj)

                           }else if(method==="PATCH" || method==="PUT"){ 
                                resolve(res); 

                           }else{ 
                                 reject(res)
                           }
                       }
                  }
                  
                  xhr.onerror = function(){
                        reject(xhr);     
                  }
        })
     

}


function createCards(arr){
              todoArr  =Object.values(arr);    
    let res = ' '; 

         arr.forEach((ele,i)=>{  
             res +=   `<tr id=${ele.id}>
                                <td>${arr.length-i}</td>
                                <td>${ele.title}</td>
                                <td><span class="badge ${ele.completed ? "bg-success" :"bg-danger"}">${ele.completed ? "Completed":"Pending"}</td>
                                <td><i onclick="onEdit(this)" class="fa-solid fa-pen-to-square text-primary fa-2x"  onclick="onEdit(this)"></i></td>
                                <td><i onclick="onRemove(this)" class="fa-solid fa-trash text-danger fa-2x"  onclick="onEdit(this)"></i></td>
                             </tr>`
                        });
     
       todoContainer.innerHTML= res;  
}



function fetchTodo(){ 
        
    makeApiCall('GET',todo_url,null)
     .then((res)=>{ 
           createCards(res);
     })
     .catch(()=>{ 
          snackbar( 'FAILED TO LOAD','error');

     })
     .finally(()=>{ 
          spinner.classList.add('d-none');
     })
} 


fetchTodo(); 




function onSubmit(eve){
         eve.preventDefault();
            
         let newTodo= { 
                 title:titleControl.value,
                 completed:completedControl.value ==='true'
         }
          todoArr.push(newTodo)
       makeApiCall('POST', todo_url,newTodo)
        .then((res)=>{ 
               singleTodo(res);  
               todoFrom.reset();    
          })
        .catch(()=>{ 
              snackbar('failed to submit todo', 'error');
        })
        .finally(()=>[ 
            spinner.classList.add('d-none')
        ])
}



function  singleTodo(newTodo){ 
     let tr=  document.createElement('tr'); 
         tr.id= newTodo.id; 
        tr.innerHTML =   `<tr>
                                <td>${todoArr.length-1}</td>
                                <td>${newTodo.title}</td>
                                <td><span class="badge ${newTodo.completed? "bg-success" :"bg-danger"}">${newTodo.completed ? "Completed":"Pending"}</span></td>
                                <td><i onclick="onEdit(this)" class="fa-solid fa-pen-to-square text-primary fa-2x" ></i></td>
                                <td><i onclick="onRemove(this)" class="fa-solid fa-trash text-danger fa-2x"></i></td>
                         </tr>`      
       todoContainer.prepend(tr);     
}




function onRemove(ele){ 
      let removeId= ele.closest('tr').id; 
         localStorage.setItem('removeId',removeId);
       let removeUrl = `${todo_url}/${removeId}`;

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
            }).then((result) => {
            if (result.isConfirmed) {

                makeApiCall('DELETE',removeUrl,null)
                  .then(()=>{
                        removeTodo();
                       
                     })               
                   .catch(()=>{ 
                         snackbar('Failed to delete', 'error')    
                      })
                    .finally(()=>{ 
                         spinner.classList.add('d-none')
                    })
                  }
            });


}

function  removeTodo(){  
            let remove = localStorage.getItem('removeId');
            document.getElementById(remove).remove();
}


function onEdit(ele){ 
      let editId= ele.closest('tr').id;  
       localStorage.setItem('editId',editId);
      let editUrl = `${todo_url}/${editId}`;

      makeApiCall('GET',editUrl, null) 
            .then((res)=>{
                editTodo(res);
                 window.scrollTo({top:0,behavior:'smooth'})
                })               
             .catch(()=>{ 
                 snackbar('Failed to Edit todo', 'error')    
               })
             .finally(()=>{ 
                spinner.classList.add('d-none')
               })

}


function editTodo(editObj){
                titleControl.value= editObj.title ;
                completedControl.value = editObj.completed==='true' ? "Complete": 'Pending';

               addTodo.classList.add('d-none'); 
               updateTodo.classList.remove('d-none'); 

}

function onUpdate(){ 
      let update = localStorage.getItem("editId"); 
      let updateUrl = `${todo_url}/${update}`; 
      
      let updateObj= { 
                 title:titleControl.value ,
                 completed:completedControl.value ==='true'
        }  
           makeApiCall('PATCH', updateUrl,updateObj)
             .then(()=>{
                  updateTr(updateObj);
                 snackbar('Todo is updated...!','success');
                })               
             .catch(()=>{ 
                 snackbar('Failed to update todo', 'error');    
               })
             .finally(()=>{ 
                spinner.classList.add('d-none');
               })
}


function  updateTr(updateObj){
    let update = localStorage.getItem('editId'); 
      let tr= document.getElementById(update);
               tr.innerHTML =`<tr>
                                <td>${todoArr.length}</td>
                                <td>${updateObj.title}</td>
                                <td><span class="badge ${updateObj.completed ? "bg-success" :"bg-danger"}"> ${ updateObj.completed ? "Completed":"Pending"}</span></td>
                                <td><i onclick="onEdit(this)" class="fa-solid fa-pen-to-square text-primary fa-2x" ></i></td>
                                <td><i onclick="onRemove(this)" class="fa-solid fa-trash text-danger fa-2x"></i></td>
                         </tr>` 
          // tr[1].innerText= updateObj.title ; 
          // tr[2].innerText = updateObj.completed;

        addTodo.classList.remove('d-none'); 
        updateTodo.classList.add('d-none');  

        tr.scrollIntoView({block:'center',behavior:'smooth'})
        todoFrom.reset();

         
}



todoFrom.addEventListener('submit', onSubmit); 
updateTodo.addEventListener('click', onUpdate);