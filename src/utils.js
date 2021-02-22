const API_KEY = "$2b$10$LhqzBGYWSVI2u1NzlPTNQOwDUTlcwHwMkW7ajbIvAWNLuvldvmvlK";
const DB_NAME = "my-todo";
const URL = "http://localhost:3000/b";

/* Show loader, make screen unclickable */
function showLoader() {
	allElementsInBodyExceptLoader.forEach((element) => {
		element.style.filter = "blur(3px)";
		document.body.style.background = "#808080";
	});
	document.body.style.pointerEvents = "none";
	loader.style.display = "block";
}

/* Hide loader, make screen unclickable */
function hideLoader() {
	allElementsInBodyExceptLoader.forEach((element) => {
		element.style.filter = "";
		document.body.style.background = "";
	});
	document.body.style.pointerEvents = "auto";
	loader.style.display = "none";
}

// Delete a bin from the backend using the bin's id
function deleteBin(binId) {
	showLoader();
	let fetchPromise = fetch(URL + "/" + binId, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
	});

	fetchPromise.then((response) => {
		hideLoader();
		console.log("Response status: " + response.status);
	});
}

// Create a new bin using backend
function createNewBin(data) {
	showLoader();
	let fetchPromise = fetch(URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
		body: JSON.stringify(data),
	});

	fetchPromise.then((response) => {
		hideLoader();
		console.log("Response status: " + response.status);
	});
}

// Gets data of all bins from backend
function getAllBinsPersistent() {
	showLoader();
	let fetchPromise = fetch(URL, {
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
	});

	return fetchPromise.then((response) => {
		if (!response.ok) {
			throw new Error("HTTP-Error: " + response.status);
		}

		hideLoader();
		return response.json();
	});
}

// Gets data from backend by bin id and returns it
function getPersistent(binId) {
	showLoader();
	let fetchPromise = fetch(URL + "/" + binId, {
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
	});

	return fetchPromise.then((response) => {
		if (!response.ok) {
			throw new Error("HTTP-Error: " + response.status);
		}

		hideLoader();
		return response.json();
	});
}

// send a PUT request to the backend, using the id of the bin to update, and the updated data.
function setPersistent(binId, todoList, completedTodos) {
	showLoader();
	let fetchPromise = fetch(URL + "/" + binId, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
		body: JSON.stringify({ "my-todo": todoList, "completed-todos": completedTodos }),
	});

	fetchPromise.then((response) => {
		if (!response.ok) {
			throw new Error("HTTP-Error: " + response.status);
		}

		hideLoader();
		console.log("Response status: " + response.status);
	});
}
