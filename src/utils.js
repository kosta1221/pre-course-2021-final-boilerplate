const API_KEY = "$2b$10$PYeB129VVI.8sNSyjYpP.e0K9xEjSX4ZRT5es2CtqYdbXszzWuIZy"; // Assign this variable to your JSONBIN.io API key if you choose to use it.
const DB_NAME = "my-todo";

// Gets data from persistent storage by the given key and returns it
async function getPersistent(key) {
	let response = await fetch("https://api.jsonbin.io/b/60130fbdef99c57c734b2f3f", {
		headers: {
			"X-Auth-Token": key,
			"Content-Type": "application/json",
		},
	});

	if (response.ok) {
		let json = await response.json();
		return json;
	} else {
		alert("HTTP-Error: " + response.status);
	}
}

// Saves the given data into persistent storage by the given key.
// Returns 'true' on success.
async function setPersistent(key, data) {
	return true;
}
