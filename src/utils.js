const API_KEY = "$2b$10$LhqzBGYWSVI2u1NzlPTNQOwDUTlcwHwMkW7ajbIvAWNLuvldvmvlK"; // Assign this variable to your JSONBIN.io API key if you choose to use it.
const DB_NAME = "my-todo";

// Gets data from persistent storage by the given key and returns it
async function getPersistent(key) {
	/* Loader styling */
	allElementsInBodyExceptLoader.forEach((element) => {
		element.style.filter = "blur(3px)";
		document.body.style.background = "#808080";
	});

	loader.style.display = "block";
	/* Loader styling end */

	let response = await fetch("https://api.jsonbin.io/v3/b/60130f82ef99c57c734b2f2f/latest", {
		headers: {
			"X-MASTER-KEY": key,
			"Content-Type": "application/json;charset=utf-8",
		},
	});

	/* Some more loader styling */
	allElementsInBodyExceptLoader.forEach((element) => {
		element.style.filter = "";
		document.body.style.background = "";
	});

	loader.style.display = "none";
	/* Loader styling end */

	if (response.ok) {
		let json = await response.json();
		console.log("JSONbin Loaded Successfully");
		return json;
	} else {
		alert("HTTP-Error: " + response.status);
	}
}

// Saves the given data into persistent storage by the given key.
// Returns 'true' on success.
async function setPersistent(key, todoList, completedTodos) {
	try {
		/* Loader styling */
		allElementsInBodyExceptLoader.forEach((element) => {
			element.style.filter = "blur(3px)";
			document.body.style.background = "#808080";
		});

		loader.style.display = "block";
		/* Loader styling end */

		let response = await fetch("https://api.jsonbin.io/v3/b/60130f82ef99c57c734b2f2f", {
			method: "PUT",
			headers: {
				"X-MASTER-KEY": key,
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({ "my-todo": todoList, "completed-todos": completedTodos }),
		});

		let result = await response.json();

		/* Some more loader styling */
		allElementsInBodyExceptLoader.forEach((element) => {
			element.style.filter = "";
			document.body.style.background = "";
		});

		loader.style.display = "none";
		/* Loader styling end */

		console.log(result);
		console.log("Request Successful");
	} catch (error) {
		alert(error);
	}
}
