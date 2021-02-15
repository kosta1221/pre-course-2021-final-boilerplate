const API_KEY = "$2b$10$LhqzBGYWSVI2u1NzlPTNQOwDUTlcwHwMkW7ajbIvAWNLuvldvmvlK"; // Assign this variable to your JSONBIN.io API key if you choose to use it.
const DB_NAME = "my-todo";
const URL = "https://api.jsonbin.io/v3/b/60130f82ef99c57c734b2f2f";

// Gets data from persistent storage by the given key and returns it
function getPersistent(key) {
	/* Show loader, make screen unclickable */
	allElementsInBodyExceptLoader.forEach((element) => {
		element.style.filter = "blur(3px)";
		document.body.style.background = "#808080";
	});
	document.body.style.pointerEvents = "none";
	loader.style.display = "block";
	/* End of code for showing loader */

	let fetchPromise = fetch(URL + "/latest", {
		headers: {
			"X-MASTER-KEY": key,
			"Content-Type": "application/json;charset=utf-8",
		},
	});

	return fetchPromise.then((response) => {
		if (!response.ok) {
			throw new Error("HTTP-Error: " + response.status);
		}

		/* Hide loader, make screen unclickable */
		allElementsInBodyExceptLoader.forEach((element) => {
			element.style.filter = "";
			document.body.style.background = "";
		});
		document.body.style.pointerEvents = "auto";
		loader.style.display = "none";
		/* End of code for hiding loader*/

		return response.json();
	});
}

// Saves the given data into persistent storage by the given key.
// Returns 'true' on success.
function setPersistent(key, todoList, completedTodos) {
	/* Show loader, make screen unclickable */
	allElementsInBodyExceptLoader.forEach((element) => {
		element.style.filter = "blur(3px)";
		document.body.style.background = "#808080";
	});
	document.body.style.pointerEvents = "none";
	loader.style.display = "block";
	/* End of code for showing loader */

	let fetchPromise = fetch(URL, {
		method: "PUT",
		headers: {
			"X-MASTER-KEY": key,
			"Content-Type": "application/json;charset=utf-8",
		},
		body: JSON.stringify({ "my-todo": todoList, "completed-todos": completedTodos }),
	});

	fetchPromise.then((response) => {
		if (!response.ok) {
			throw new Error("HTTP-Error: " + response.status);
		}

		/* Hide loader, make screen unclickable */
		allElementsInBodyExceptLoader.forEach((element) => {
			element.style.filter = "";
			document.body.style.background = "";
		});
		document.body.style.pointerEvents = "auto";
		loader.style.display = "none";
		/* End of code for hiding loader*/

		console.log("Response status: " + response.status);
	});
}
