##Notes on Life and Lineage 

###Gotchas
-**Modals**:
 -Only one can be shown at once
 -Animation must be fully finished before another can be triggered
 -This is ~600ms
 -Using something like:
 ```ts
 setShowModal(false);
 wait(600).then(()=>{
     setShowSecondModal(true);
 })
 ```
