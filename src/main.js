
const BASE_URL = "https://pokeapi.co/api/v2/";
let favourites = JSON.parse(localStorage.getItem("favourites")) ?? [];
const resultDisplay = document.getElementById("resultsDisplay");
const searchForm = document.getElementById("search-form");
const validationMessage = document.getElementById("validation-message");

let allPokemon = [];
let filteredPokemon = [];
let currentOffset = 0;
const LIMIT = 20;
let isLoading = false;

async function fetchAllPokemon() {

    if(isLoading) return;
    isLoading = true;

    document.getElementById("loadingIndicator").textContent = "Loading...";


    try {
        const response = await fetch(`${BASE_URL}pokemon?limit=${LIMIT}&offset=${currentOffset}`);
        const data = await response.json();


        const detailPromises = data.results.map(pokemon => fetchPokemonDetail(pokemon.url));
        const newPokemon = await Promise.all(detailPromises);

        allPokemon = [...allPokemon, ...newPokemon];
        filteredPokemon = allPokemon;
        currentOffset += LIMIT;
        displayTable(allPokemon);
    }
    catch(error) {
        console.error(error)
    }
    finally {
        isLoading = false;
        document.getElementById("loadingIndicator").textContent = "";
    }
}

function setUpInfiniteScroll() {
    const sentinel = document.getElementById("infinite-scroll");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                fetchAllPokemon(currentOffset);
            }
        });
    }, {
        threshold : 1.0
    });
    observer.observe(sentinel);
}


const fetchPokemonDetail = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function applySearch(searchTerm) {
    filteredPokemon = allPokemon.filter(pokemon =>
    pokemon.name.includes(searchTerm.toLowerCase())
    )
    displayTable(filteredPokemon);
}

function applyFilter(type) {
    filteredPokemon = allPokemon.filter(pokemon => {
        if(type === "") return true;
        return pokemon.types.some(t => t.type.name === type);
    })
    displayTable(filteredPokemon);
}

function applySort(value) {
    const sorted = [...filteredPokemon];


    if(value === "id-asc") {
        sorted.sort((a, b) => a.id - b.id)
    } else if(value === "height-asc") {
        sorted.sort((a, b) => a.height - b.height)
    }else if(value === "weight-asc") {
        sorted.sort((a, b) => a.weight - b.weight)
    }

    displayTable(sorted);
}


const toggleFavourites = (pokemon) => {
    const alreadySaved = favourites.some(fav => fav.id === pokemon.id);

    if(alreadySaved) {
        favourites = favourites.filter(fav => fav.id !== pokemon.id)
    } else {
        favourites.push(pokemon)
    }

    localStorage.setItem("favourites", JSON.stringify(favourites));
    renderFavourites();
    displayTable(filteredPokemon);
}

const renderFavourites = () => {
    const list = document.getElementById("favourites-list");

    if(favourites.length === 0) {
        list.innerHTML = `<p class="favourites-empty">No favourites saved</p>`;
        return;
    }

    list.innerHTML = favourites.map(pokemon => `
        <div class="fav-item">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" width="40">
            <span>${pokemon.name}</span>
            <button onclick="toggleFavourites(${JSON.stringify(pokemon).replace(/"/g, '&quot;')})">Remove</button>
        </div>
        `).join("");
}


function displayTable(pokemonList) {
    document.getElementById("pokemon-table").style.display = "block";
    document.getElementById("table-body").innerHTML = "";

    pokemonList.forEach(pokemon => {

        const isFavourite = favourites.some(fav => fav.id === pokemon.id);

        const typeColors = {
            fire: "ff6b35",
            water: "4fc3f7",
            grass: "81c784",
            electric: "fff176",
        }

        const types = pokemon.types.map(t => {
            const color = typeColors[t.type.name] ?? "e0e0e0";

            return `<span style="background: #${color}; padding: 2px 6px; border-radius: 4px;">
                        ${t.type.name}
                    </span>`
        }).join("");

        const allText = pokemon.name ? pokemon.name : "unknown";

        const sprite = pokemon.sprites.front_default;

        const row = `
        <tr>
            <td><img src="${sprite}" alt="${pokemon.name}" width="48"></td>
            <td>${pokemon.id}</td>
            <td>${pokemon.name}</td>
            <td>${types}</td>
            <td>${pokemon.height}</td>
            <td>${pokemon.weight}</td>
            <td>
                <button class="fav-btn" data-id="${pokemon.id}">
                    ${isFavourite ? "Remove from favourites" : "Favourite"}
                </button>
            </td>
        </tr>
        `;
        document.getElementById("table-body").innerHTML += row;
    });

    document.querySelectorAll(".fav-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            const id = parseInt(e.target.dataset.id);
            const pokemon = allPokemon.find(p => p.id === id);
            toggleFavourites(pokemon);
        });
    });
}

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const input = document.getElementById("pokemonName").value.trim();
    const isValid = validateSearch(input);

    if(isValid) {
        validationMessage.textContent = "";
        applySearch(input);
    }
});

const validateSearch = (input) => {
    if(input === "") {
        showError("Enter a name");
        return false;
    }

    if(input.length < 2) {
        showError("Name is too short");
        return false;
    }

    const onlyLetters = /^[a-zA-Z\-]+$/.test(input);
    if(!onlyLetters) {
        showError("Only use letters")
        return false;
    }

    return true;
}

const showError = (message) => {
    validationMessage.textContent = message;
    validationMessage.style.color = "red";
}



async function fetchPokemon() {

    const imgElement = document.getElementById("pokemonSprite");
    const pokemonName = document.getElementById("pokemonName").value.trim().toLowerCase();

    if(!pokemonName) return;

    try {
        const response = await fetch(`${BASE_URL}pokemon/${pokemonName}`);

        if(!response.ok) {
            throw new Error("could not fetch data");
        }

        const data = await response.json();
        imgElement.src = data.sprites.front_default;
        imgElement.style.display = "block";
        resultDisplay.innerHTML = `<p><strong> ${data.name.toUpperCase()}</strong><p>`;
    } 
    catch (error) {
        console.error(error);
        resultDisplay.innerHTML = `<p style="color: red;"> Pokemon not found <p>`;
        imgElement.style.display = "none";
    }
}


document.getElementById("pokemonName").addEventListener("input", (e) => {
    const value = e.target.value.trim();

    if(value.length > 0) {
        validationMessage.textContent = "";
    }

    applySearch(value);
})

document.getElementById("typeFilter").addEventListener("change", (e) => {
    applyFilter(e.target.value);
})

document.getElementById("statSorter").addEventListener("change", (e) => {
    applySort(e.target.value);
})

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("pokemonName").value.trim();
    const isValid = validateSearch(input);
    if(isValid) {
        validationMessage.textContent = "";
        fetchPokemon();
    }
});



fetchAllPokemon(0);
renderFavourites();
setUpInfiniteScroll();