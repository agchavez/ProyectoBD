/*
Tarea_1 Bases de datos 1
@author agchavez@unah.hn
@date 2020/11/24
@version 0.1
*/
const indexDB = window.indexedDB
if(indexDB){ // Comprobar si se logro acceder al indexDB
    var prompter = 0 //Variable para almacenar el puntero
    var count = 0 // Variable para almacenar la cantidad maxima de valores almacenados
    var lastid = 0 // Almacena el id anterior del puntero
    var previousid = 0 //Temporalmente almacena el id anterior del
    var firstid = 0 // Almacena el id del primer valor ingresado
    var db 
    const request = indexDB.open('listDB',2) //abrir la base de datos listDB
    request.onsuccess =()=>{ //Crear la base de datos 
        db = request.result //almacenar el resultado en la variable global db
    }
    request.onupgradeneeded =()=>{//Actualizar la base de datos 
        db = request.result
        var objectStore = db.createObjectStore("list", 
        {autoIncrement:true,
        keyPath: 'id'}); //Crear el objectStore asignando la variable id como llave primeria y auto incremental
        objectStore.createIndex("id","id",{unique:true}); //Crear la variable id
        objectStore.createIndex("descrip","description",{unique: false}); //Crear la variable descrip que va guardar la descripcion ingresada por el usuario
        objectStore.createIndex("next","next",{unique: false}); //Crear la variable next que va almacenar el id del siguiente valor en la lista de la base de datos
    }
    request.onerror =()=>{
        alert("Database error");// Si se produce un error al crear la base de datos lanzara un mensaje de error
    }
    

    // Funcion para guardar nuevos valores al final de la lista 
    function save(value){
            const transaction = db.transaction(['list'],
            'readwrite') //hacer un llamado a  una nueva transaccion de la base de datos enviandole el nombre y el que tipo de accion a utilizar en este caso de lectura y escritura
            const objetStore = transaction.objectStore('list')
            if(count == 0){// si la variable global count es igual a  significa que no hay ningun valor almancenado
            const request = objetStore.add(
                {
                    descrip: value,
                    next: null
                });//agrear un nuevo campo a la base de datos con el descrip =  value y el next = null porque es el primer valor almacenado
                idfirst = 1;// variable global del primer valor de la lista = 1 
                lastid = 1;
                alert("Valor almacenado con exito")// Mensaje de notificacion que se ha guarado con exito el valor
                document.getElementById("ipvalue").value = "";// Limpiar el input del formulario
                return
            }else{ // En el caso que el count sea mayor que cero significa que ya hay valores almacenados en la base de datos
                nextid = lastid; // Se toma el ultimo id almacenado en al base de datos
                lastid = lastid + 1; // Con el ultimo id almacenado se le suma un valor para hacer referencia al siguiente valor porque es auto incremental
                const request = objetStore.add(
                {
                    descrip: value,
                    next: null
                }); // agregar el nuevo valor a ala base de datos
                getData(nextid, lastid);// llamar a la funcion getData con los valores de nextid y lastid
                document.getElementById("ipvalue").value = ""; // Limpiar el input
                alert("Valor almacenado con exito");// lanzar mensaje de notificacio que se ha almacenado con exito el nuevo valor 
                
            }
    }
    //Funcion getData utilizado para hacer busqueda del ultimo valor almacenado para despues modificacr su dato .next con el valor del nuevo id
    function getData(id,nextid){
        var transaction2 = db.transaction(['list'], 'readonly');//Nueva solicitud de escritura
        var objectStore = transaction2.objectStore('list');
        var request2 = objectStore.get(id);// Buscar los datos por id 
        request2.onsuccess = function(event) {
        let data = request2.result; // Obtener el json del valor almacenado
        data.next = nextid; //cambiar el valor del next al nuevo id 
        modificar(data); // llamar a la funcion modificar enviandole el nuevo Json modificado
    }
    }

    //Funcion para modificar que recibe el nuevo valor a modificar
    function modify(value){
        var transaction = db.transaction(['list'], 'readonly'); //Solicitud de escritura 
        var objectStore = transaction.objectStore('list');
        var request = objectStore.get(prompter); // buscar el valor que coincida con el puntero actual
        request.onsuccess = function(event) {
        let data = request.result;
        data.descrip = value;// Modificar el valor 
        modificar(data) //Llamar a la funcion modificar
        alert('Valor modificado')// Notificar que el valor se ha almacenado con exito
        }
    }
    // Funcion par eliminar el valor al que hace referencia el puntero
    function remove(){ 
        previous() // Llamar a la funcion previus que obtiene el id anterior al puntero
        var transaction = db.transaction(['list'], 'readonly'); //Solicitud de lectura
        var objectStore = transaction.objectStore('list');
        var request = objectStore.get(prompter);//Buscar el valor que corresponda al puntero actual
        request.onsuccess = function(event) {
            let data = request.result;
            if(prompter != firstid){
                removetemp();
                alterRemove(data.next)
                return
            }if(prompter == lastid){
                alterRemove(null);
                removetemp();

            }else{
                removetemp();
                firstid = prompter
                return
            }
        }
    }
    function previous(val=false){
        if(prompter != firstid){
            var transaction = db.transaction(["list"]);
            var objectStore = transaction.objectStore("list");
            var request = objectStore.openCursor();
            request.onerror = function(event) {
            };
            request.onsuccess = function(event) {
                cursor = event.target.result;
                if(cursor.value.next == prompter){
                    if(val){
                        document.getElementById("ipvalue").value = cursor.value.descrip;
                        prompter = cursor.value.id;
                        return
                    }else{
                        previousid = cursor.value.id;
                        return
                    }
                    
                        
                }
                cursor.continue();   
            }
            request.onerror = function(event){
                alert('Primer valor')
            }
        
        }else{
            alert('El valor actual es el pirmer almacenado en la cola')
        }
    }
    function removetemp(){
        var transaction = db.transaction(['list'],'readwrite');
        var objectStore = transaction.objectStore('list');
        var requestremove = objectStore.delete(prompter);
        requestremove.onsuccess = function(event) {
            alert('Valor eliminado')
            document.getElementById("ipvalue").value = ""
        }
    }
    function alterRemove(id){
        console.log(previousid)
        var transaction = db.transaction(['list'], 'readonly');
        var objectStore = transaction.objectStore('list');
        var request = objectStore.get(previousid);
        request.onsuccess = function(event) {
        let data = request.result;
        console.log(id)
        data.next = id;
        console.log(data)
        modificar(data)
        }
    }
    // Funcion encargada de buscar cual es el primer valor ingresado en la base de datos
    function first(){
        var transaction = db.transaction(["list"]);
        var objectStore = transaction.objectStore("list");
        var request = objectStore.openCursor();
        request.onerror = function(event) {
        };
        request.onsuccess = function(event) {
            cursor = event.target.result.value;
            document.getElementById("ipvalue").value = cursor.descrip;
            prompter = cursor.id
            firstid = cursor.id
        
            
        };
    }
    // Funcion que realiza una busqueda de los datos del puntero actual obteniendo el valor .next del campo y llama a la funcion show(id)
    function next(){ 
        var transaction2 = db.transaction(['list'], 'readonly');
        var objectStore = transaction2.objectStore('list');
        var request2 = objectStore.get(prompter)
        request2.onsuccess = function(event) {
        let data = request2.result
        if(data.next){
            show(data.next)
        }else{
            alert("El valor actual es el ultimo almacenado en la cola")
        } 
        }
    }
    // Funcion encargada de mostrar en el cuadro de texto, que recibe un id y realiza una busqueda de los datos del mismo
    function show(id){
        var transaction = db.transaction(["list"], 'readonly');
        var objectStore = transaction.objectStore("list");
        var request = objectStore.get(id);
        request.onsuccess = function(event) {
            let data = request.result
            prompter = data.id
            document.getElementById("ipvalue").value = data.descrip;
        };
    }
   
    //Funcion que recibe un dato anteriormente almacenado en la base de datos el cual es modificado
    function modificar(data){
        var transaction = db.transaction(["list"], 'readwrite');
        var objectStore = transaction.objectStore("list");
        var requestUpdate = objectStore.put(data);
        requestUpdate.onerror = function(event) {
            alert('ERROR')
            };
        requestUpdate.onsuccess = function(event) {
            };
    }
    // Funcion encargada de obtener todos los radio del formulario y comprueba cuales de los radios esta siendo seleccionado
    function fn_run(){
        const value = document.getElementById("ipvalue").value
        const radios = document.querySelectorAll('input[name="action"]');
        for (const radio of radios) {
            if (radio.checked) {
                if(radio.id == 'save'){
                    save(value);
                    return;
                }else if(radio.id == 'remove'){
                    remove(value);
                    return;
                }else if(radio.id == 'first'){
                    first();
                    return;
                }else if(radio.id == 'next'){
                    next();
                    return;
                }else if(radio.id == 'previous'){
                    previous(true);
                    return;
                }
                else if(radio.id == 'latest'){
                    latest(true);
                    return;
                }
                else if(radio.id == 'modify'){
                    modify(value);
                    return;
                }
            
            }
        }
        alert("No se ha seleccionado ninguna opcion")
    }
    // Funcion que tomacomo arametro un booleano que cuando esta en true busca cual es el ultimo valor almacenado en la DB y si esta en 
    // false cambia el valor de la variable global lastid con el ultimo id de la lisya
    function latest(val){
        var transaction = db.transaction(["list"]);
        var objectStore = transaction.objectStore("list");
        var request = objectStore.openCursor();
        request.onerror = function(event) {
        };
        request.onsuccess = function(event) {
            cursor = event.target.result;
            if(cursor.value.next == null){
                if(val){
                    document.getElementById("ipvalue").value = cursor.value.descrip;
                    prompter = cursor.value.id;
                    console.log('entro1');
                    return
                }else{
                    lastid = cursor.value.id;
                    return
                }
            }
            cursor.continue();
        };
    }
    //Funcion que cuenta cuantos campos estan almacenados en la base de datos 
    function counts(){
        var transaction = db.transaction(['list'], 'readonly');
        var objectStore = transaction.objectStore('list');
        var countRequest = objectStore.count();
        countRequest.onsuccess = function() {
        count = countRequest.result;
        if(count>0){
            latest(false);
        }
        
        }
        
    };
    // Funcion ejecutada al darle click al boton aceptar
    function run(){
        counts();
        setTimeout(fn_run,200)
    }
    // Funcion para limpiar el caudro de texto
    function runclear(){
        document.getElementById("ipvalue").value = "";
    }
    }

    


