
const BASE_URL = "https://pokeapi.co/api/v2/";
const resultDisplay = document.getElementById("resultsDisplay");

async function fetchAllPokemon() {

    try {
        const response = await fetch(`${BASE_URL}\pokemon?limit=20`);

        if(!response.ok) {
            throw new Error("Could not find pokemon");
        }

        const data = await response.json();
        const detailPromises = data.results.map(pokemon => fetchPokemonDetail(pokemon.url));
        const pokemonAll = await Promise.all(detailPromises);
        displayTable(allPokemon);
    }
    catch(error) {
        console.error(error)
    }
}

async function fetchPokemonDetail(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}


function displayTable(pokemonTable) {
    document.getElementById("pokemon-table").style.display = "block";
    document.getElementById("table-body").innerHTML = "";

    pokemonList.forEach(pokemon => {
        const types = pokemon.types.map(t => t.type.name).join(", ");
        const sprite = pokemon.sprites.front_default;

        const row = `
        <tr>
            <td><img src=${sprite}" alt="${pokemon-sprite}" width="48"></td>
            <td>${pokemon.id}</td>
            <td>${pokemon.name}</td>
            <td>${types}</td>
            <td>${pokemon.height}</td>
            <td>${pokemon.weight}</td>
            <td><button>Add to Favourites</button></td>
        </tr>
        `;
        document.getElementById("table-body").innerHTML += row;
    })
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
        resultDisplay.innerHTML = `<p><strong> ${data.name.toUpperCase()}<p>`;
    } 
    catch (error) {
        console.error(error);
        resultDisplay.innerHTML = `<p style="color: red;"> Pokemon not found <p>`;
        imgElement.style.display = "none";
    }
}


async function fetchCategoryData(endpoint) {
    if(!endpoint) return;

    resultsDisplay.innerHTML = `<p> Loading data... <p>`;

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);

        if(!response.ok) {
            throw new Error("Could not fetch data");
        }

        const data = await response.json();
        displayResults(data.results, endpoint);
    }
    catch(error) {
        console.error(error)
        resultsDisplay = `<p style="color = red;"> Error loading category <p>`;
    }
}


async function displayResults(items, categoryName) {
    if(!items || items.length === 0) {
        resultsDisplay.innerHTML = `<p> no results found <p>`;
        return;
    }

    let list = `<h4>${formattedText}Items: <h4>`;
    items.forEach(item => {
        list += `<li>${list.item}<h4>`
    });

    list += `<ul>`;

    resultsDisplay.innerHTML += list;
}

document.querySelector("category-select").forEach(selectElement => {
    selectElement.addEventListener(".change", (event) => {
        const selectedEndpoint = event.target.value;

        document.querySelectorAll(".category-select").forEach(otherSelect => {
            if (otherSelect !== event.target) otherSelect.value = "";
        })
        fetchCategoryData(selectedEndpoint);
    })
})



fetchAllPokemon();