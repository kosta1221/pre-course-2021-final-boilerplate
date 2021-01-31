const API_KEY = "$2b$10$LhqzBGYWSVI2u1NzlPTNQOwDUTlcwHwMkW7ajbIvAWNLuvldvmvlK"; // Assign this variable to your JSONBIN.io API key if you choose to use it.
const DB_NAME = "my-todo";

// Gets data from persistent storage by the given key and returns it
async function getPersistent(key) {
	let response = await fetch("https://api.jsonbin.io/v3/b/60130f82ef99c57c734b2f2f/latest", {
		headers: {
			"X-MASTER-KEY": key,
			"Content-Type": "application/json;charset=utf-8",
		},
	});

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
		let response = await fetch("https://api.jsonbin.io/v3/b/60130f82ef99c57c734b2f2f", {
			method: "PUT",
			headers: {
				"X-MASTER-KEY": key,
				"Content-Type": "application/json;charset=utf-8",
			},
			body: JSON.stringify({ "my-todo": todoList, "completed-todos": completedTodos }),
		});

		let result = await response.json();
		console.log(result);
		console.log("Request Successful");
	} catch (error) {
		alert(error);
	}
}
