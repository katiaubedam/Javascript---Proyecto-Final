let url = "https://api.rawg.io/api/games"
let key = "45f1911e0b704221bf434d90324730cb"

// Se llama a esta función cuando se hace una búsqueda y se presiona Enter.
// Mucho más user-friendly que obligar al usuario a pulsar un botón
function checkEnterPress(event){
    if (event.key === "Enter"){
        search(`&search=${document.getElementById("searchbar").value}${getParams()}`)
    }
}

// Realiza una búsqueda personalizada al cargar la página principal en caso
// de que haya parámetros GET indicados
function firstSearch() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let filter = urlParams.get("filter")
    let filterId = urlParams.get("filterId")

    if (filter && filterId) {
        switch (filter) {
            case "platform":
                search(`&platforms=${filterId}`)
                break;
            case "genre":
                search(`&genres=${filterId}`)
                break;
            default:
                search()
        }

        // El menú de filtros se muestra desplegado desde el principio si existen parámetros
        document.getElementById('sidebar_filters').style.maxHeight = '500px'
        document.getElementById('sidebar_filters').setAttribute("visible", "visible")
        document.getElementById('sidebar_link_filters_mobile').setAttribute("class", "sidebar_link_selected")
        document.getElementById('sidebar_link_index_mobile').classList.remove("sidebar_link_selected")
        document.getElementById('sidebar_link_index_mobile').setAttribute("class", "sidebar_link")
        document.getElementsByClassName(`filter_${filterId}`)[0].setAttribute("class", "sidebar_link_mini_selected")
        document.getElementById(`filter_${filterId}`).setAttribute("class", "sidebar_link_mini_selected")

    } else {
        search()
    }
}

// Devuelve los parámetros GET en un string. Se usa para el botón "mostrar más..."
// Probablemente se pueda optimizar ya que uso código de la función anterior
function getParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let filter = urlParams.get("filter")
    let filterId = urlParams.get("filterId")
    let params = ""

    if (filter && filterId) {
        switch (filter) {
            case "platform":
                params = `&platforms=${filterId}`
                break;
            case "genre":
                params = `&genres=${filterId}`
                break;
        }
    }

    return params
}


// Función principal de búsqueda. Llama a mi API con los parámetros (opcionales) que le indiquemos...
function search(query){
    // Detecta si venimos desde el botón "mostrar más....". En tal caso, no mostramos icono de carga
    if (!query || query.indexOf("&page") == -1) showLoadIcon()

    let urlFinal = query ? (`${url}?key=${key}${query}`) : `${url}?key=${key}`

    fetch(urlFinal)
    .then(
        (respuesta) => respuesta.json()
    ).then(
        (datos) => {
            // Si la llamada a la API incluye el parámetro page significa que va a añadir
            // más cards al div existente y por lo tanto NO vacía el contenido
            if (!query || query.indexOf("&page") == -1) emptyContent()

            if (datos.results.length > 0) {
                let juegos = datos.results
            
                for (const i in juegos) {
                    buildCard(juegos[i], false)
                }

                if (document.getElementById('search_more')) document.getElementById('search_more').remove()

                // Si existe la posibilidad de mostrar más resultados...
                if (datos.next) {
                    let searchMoreDiv = document.createElement('div')
                    searchMoreDiv.id = "search_more"
                    let page = datos.next.substring(datos.next.indexOf('&page'))
                    query = getParams()
                    page = page.replace(query, "")
    
                    // JURO QUE ESTO NO LO ENTIENDO
                    // No me deja llamar a la función search, pero si llamo a otra función
                    // que a su vez llama a search, entonces sí. ¡Viva el vino!

                    searchMoreDiv.innerHTML = `<div class="search_more_link" id="search_more_link" onclick="searchMore('${page}${query}')" >Mostrar más...</div>`
                    document.getElementById("main").appendChild(searchMoreDiv)
                }
                

            } else if (datos.count == 0) {
                showError(`Ningún resultado encontrado. Por favor, vuelve a intentarlo`)
            } else {
                showError(`Ha ocurrido un error (${datos.error}). Por favor, vuelve a intentarlo`)
            }
            
        }
    ).catch (
        (error) => showError(`Ha ocurrido un error (${error.message}). Por favor, vuelve a intentarlo`)
    )
}

// Función absurda, pero llamar directamente a search desde el botón no me funciona because potato
// Al menos la aprovecho para dar feedback del tiempo de carga
function searchMore(query) {
    document.getElementById('search_more_link').innerHTML = "Espera..."
    search(query)
}

// Contruye una card con información de un juego.
function buildCard(juego, removeCard) {
    let contenido = `
        <div class="card_img_container"><img class="card_img" onclick="window.location.href = 'game.html?id=${juego.id}'" src='${juego.background_image}' alt="${juego.name}"></div>
        <div class="card_title_container">
        <h3 onclick="window.location.href = 'game.html?id=${juego.id}'">${juego.name}</h3>`


    if (juego.metacritic) {
        if (parseInt(juego.metacritic) > 75) {
            contenido += `<p class="card_metacritic_good">${juego.metacritic}</p></div>`
        } else if (parseInt(juego.metacritic) > 49) {
            contenido += `<p class="card_metacritic_medium">${juego.metacritic}</p></div>`
        } else {
            contenido += `<p class="card_metacritic_bad">${juego.metacritic}</p></div>`
        }
    } else {
        contenido += `</div>`
    }

    contenido += `<p><b>Plataformas:</b>`

    for (const i in juego.parent_platforms) {
        switch (juego.parent_platforms[i].platform.name) {
            case "PC":
                contenido += `<img class="card_icon" src="images/icon-windows.png" alt="PC">`
                break;
            case "PlayStation":
                contenido += `<img class="card_icon" src="images/icon-playstation.png" alt="PC">`
                break;
            case "Xbox":
                contenido += `<img class="card_icon" src="images/icon-xbox.png" alt="PC">`
                break;
            case "Nintendo":
                contenido += `<img class="card_icon" src="images/icon-switch.png" alt="PC">`
                break;
            case "Apple Macintosh":
                contenido += `<img class="card_icon" src="images/icon-ios.png" alt="PC">`
                break;
            case "Linux":
                contenido += `<img class="card_icon" src="images/icon-linux.png" alt="PC">`
                break;
            case "Android":
                contenido += `<img class="card_icon" src="images/icon-android.png" alt="PC">`
                break;
            case "SEGA":
                contenido += `<img class="card_icon" src="images/icon-sega.png" alt="PC">`
                break;
        }
    }

    contenido += `</p>`

    let fechaLanzamiento = new Date(juego.released).toLocaleString("es-ES", {dateStyle: "medium", formatMatcher: "basic"})
    contenido += `<div class="card_star_container">
    <p><b>Fecha de lanzamiento:</b> ${fechaLanzamiento.toString()}</p>`

    if (localStorage.getItem(juego.id)) {
        contenido += `<p class="card_star" id="card_star_${juego.id}" title="Haz click para quitar este juego de tus favoritos">★</p></div>`
    } else {
        contenido += `<p class="card_star" id="card_star_${juego.id}" title="Haz click para añadir este juego a tus favoritos">☆</p></div>`
    }

    let card = document.createElement('div')
    card.setAttribute('class', 'card')
    card.setAttribute('id', `card_${juego.id}`)
    card.innerHTML = contenido
    document.getElementById("main_content").appendChild(card)

    // Añade el listener del evento click al botón de la estrellita
    // Debe hacerse así para poder pasar el juego como objeto a la función
    document.getElementById(`card_star_${juego.id}`).addEventListener("click", function() { toggleFavorite(juego, removeCard) })
}


function showError(error){
    let contenido = `<div></div>
        <div>${error}</div>`

    document.getElementById("main_content").innerHTML = contenido
}


function toggleFavorite(juego, removeCard) {

    // Si la card se ha creado en favoritos, al eliminar el fav se eliminará también la card
    // Si se ha creado desde index.html, no se elimina la card, solo se cambia el icono de la estrella

    if (localStorage.getItem(juego.id)) {
        localStorage.removeItem(juego.id)

        if (removeCard) {
            document.getElementById(`card_${juego.id}`).remove()
        } else {
            document.getElementById(`card_star_${juego.id}`).innerHTML = "☆"
            document.getElementById(`card_star_${juego.id}`).setAttribute("title", "Haz click para añadir este juego a tus favoritos")
        }
    } else {
        localStorage.setItem(juego.id, JSON.stringify(juego))
        document.getElementById(`card_star_${juego.id}`).innerHTML = "★"
    }
}

function getFavorites() {
    if (localStorage.length > 0) {

        emptyContent()

        for (let i = 0; i < localStorage.length; i++){
            let juego = JSON.parse(localStorage.getItem(localStorage.key(i)))

            buildCard(juego, true)
        }
    }
}

// En caso de solicitar a la API información de un juego concreto, se debe hacer
// una llamada diferente (dos, en realidad).
function getGame() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let gameId = urlParams.get("id")

    if (gameId) {
        fetch(`${url}/${gameId}?key=${key}`)
        .then(
            (respuesta) => respuesta.json()
        ).then(
            (datos) => {
                if (datos.id) {

                    // Las imágenes del juego se obtienen con una llamada a la API distinta :S
                    fetch(`${url}/${gameId}/screenshots?key=${key}`)
                    .then(
                        (respuesta) => respuesta.json()
                    ).then(
                        (datosImg) => {
                            datos.images = datosImg.results
                            buildInfoGame(datos)
                            document.getElementById("loadbox").remove()
                    })
                    
                } else {
                    showError(`Ha ocurrido un error. Por favor, vuelve a intentarlo`)
                }
        }
        ).catch (
            (error) => showError(`Ha ocurrido un error (${error.message}). Por favor, vuelve a intentarlo`)
        )

    } else {
        document.getElementById("game_content_info").innerHTML = `Oops! No se ha encontrado el juego que buscas... Inténtalo de nuevo`
    }
}

// Imprime toda la información necesaria para la ficha expandida de un juego concreto (game.html)
function buildInfoGame(juego) {
    document.getElementById("game_content_image").style.backgroundImage = `url("${juego.background_image}")`

    let contenido = `<div class="game_content_info_title">
        <h2>${juego.name}</h2>`

    if (localStorage.getItem(juego.id)) {
        contenido += `<p class="game_content_info_star" id="card_star_${juego.id}" title="Haz click para quitar este juego de tus favoritos">★</p>`
    } else {
        contenido += `<p class="game_content_info_star" id="card_star_${juego.id}" title="Haz click para añadir este juego a tus favoritos">☆</p>`
    }

    contenido += `</div>
        <div class="game_content_info_grid">
        <div><h4>Plataformas</h4><p>`

        for (const i in juego.parent_platforms) {
            contenido += i == juego.parent_platforms.length - 1 ? `${juego.parent_platforms[i].platform.name}` : `${juego.parent_platforms[i].platform.name}, `
        }

    contenido += `</p></div>
    <div><h4>Géneros</h4><p>`
    
    for (const i in juego.genres) {
        contenido += i == juego.genres.length - 1 ? `${juego.genres[i].name}` : `${juego.genres[i].name}, `
    }

    contenido += `</p></div>
    <div><h4>Desarrolladores</h4><p>`

    for (const i in juego.developers) {
        contenido += i == juego.developers.length - 1 ? `${juego.developers[i].name}` : `${juego.developers[i].name}, `
    }

    contenido += `</p></div><div><h4>Distribuidoras</h4><p>`

    for (const i in juego.publishers) {
        contenido += i == juego.publishers.length - 1 ? `${juego.publishers[i].name}` : `${juego.publishers[i].name}, `
    }

    contenido += `</p></div><div><h4>Fecha de lanzamiento</h4>
    <p>${new Date(juego.released).toLocaleString("es-ES", {dateStyle: "medium", formatMatcher: "basic"}).toString()}</p>
    </div>`

    contenido += `<div><h4>Metascore</h4>`
    
    if (juego.metacritic) {
        if (parseInt(juego.metacritic) > 75) {
            contenido += `<p class="card_metacritic_good">${juego.metacritic}</p>`
        } else if (parseInt(juego.metacritic) > 49) {
            contenido += `<p class="card_metacritic_medium">${juego.metacritic}</p>`
        } else {
            contenido += `<p class="card_metacritic_bad">${juego.metacritic}</p>`
        }
    } else {
        contenido += `<p>Desconocido</p>`
    }

    contenido += `</div></div>
    <h4>Sinopsis</h4>
    <div class="game_content_info_sinopsis">${juego.description}</div>`

    if (juego.images) {

        contenido += `<h4>Capturas:</h4>
        <div class="game_content_info_pics">`

        for (const i in juego.images) {
            contenido += `<img class="game_content_info_pic" src="${juego.images[i].image}">`
        }

        contenido += `</div>`
    }
    
    document.getElementById("game_content_info").innerHTML += contenido

    // Añade el listener del evento click al botón de la estrellita
    // Debe hacerse así para poder pasar el juego como objeto a la función
    document.getElementById(`card_star_${juego.id}`).addEventListener("click", function() { toggleFavorite(juego, false) })
}

function emptyContent() {
    document.getElementById("main_content").innerHTML = ""
}


// Abre o cierra de forma suave el menú de filtros
// Y sin frameworks!!!
function toggleFilters() {
    if (document.getElementById('sidebar_filters').getAttribute("visible") == "visible") {
        document.getElementById('sidebar_filters').style.maxHeight = '0px'
        document.getElementById('sidebar_filters').setAttribute("visible", "none")
    } else {
        document.getElementById('sidebar_filters').style.maxHeight = '500px'
        document.getElementById('sidebar_filters').setAttribute("visible", "visible")
    }
    
    if (document.getElementById('sidebar_filters_mobile').getAttribute("visible") == "visible") {
        document.getElementById('sidebar_filters_mobile').style.maxHeight = '0px'
        document.getElementById('sidebar_filters_mobile').setAttribute("visible", "none")
    } else {
        document.getElementById('sidebar_filters_mobile').style.maxHeight = '500px'
        document.getElementById('sidebar_filters_mobile').setAttribute("visible", "visible")
    }
}

function showLoadIcon() {
    let contenido = `<div></div>
    <div class="loadbox">
        <div class="loadbox_icon"></div>
    </div>`

    if (document.getElementById('search_more')) document.getElementById('search_more').remove()
    document.getElementById("main_content").innerHTML = contenido
}