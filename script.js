
const BASE_URL = "https://pokeapi.co/api/v2/";
const resultDisplay = document.getElementById("resultsDisplay");


async function fetchPokemon() {

    const imgElement = document.getElementById("pokemonSprite");
    const pokemonName = document.getElementById("pokemonName").value.trim().toLowerCase();

    if(!pokemonName) return;

    try {
        const response = await fetch(`${BASE_URL}pokemon${pokemonName}`);

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