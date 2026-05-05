const BASE_URL = "https://pokeapi.co/api/v2/";

async function getAll() {
    const res = await fetch(BASE_URL);

    if(!res.ok) {
        throw new Error(`Pokemon not found: ${name}`);
    }

    const data = res.json();



}

