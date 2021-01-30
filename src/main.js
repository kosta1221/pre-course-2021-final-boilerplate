const controlSection = document.querySelector(".control-section");
const viewSection = document.querySelector(".view-section");
const addButton = document.querySelector("#add-button");
const textInput = document.querySelector("#text-input");
const todoForm = document.querySelector("#todo-form");
const prioritySelector = document.querySelector("#priority-selector");
const counter = document.querySelector("#counter");
const sortButton = document.querySelector("#sort-button");
const sortingMethodSelector = document.querySelector("#sorting-method-selector");
const sortingOrderButton = document.querySelector("#sorting-order-button");
const sortingImage = document.querySelector("#sorting-image");

const RED_ARROW_DOWN_SRC = "/images/240px-Red_Arrow_Down.svg.png";
const GREEN_ARROW_UP_SRC = "/images/Green_Arrow_Up.png";

const deletedTodos = [];
let todoList = [];
let todoCount = 0;
let sortingOrder = true; // true for descending, false for ascending

/* A function for loading data from Jsonbin.io */
async function loadDataFromApi() {
	const loadedData = await getPersistent(API_KEY);
	console.log(loadedData);
	if (Array.isArray(loadedData.record["my-todo"])) {
		todoList = loadedData.record["my-todo"];
	} else if (loadedData.record["my-todo"]) todoList.push(loadedData.record["my-todo"]);

	console.log(todoList);
	console.log(todoCount);

	if (todoList.length > 0) {
		for (todo of todoList) {
			displayTodo(todo);
			incrementAndDisplayTodoCount(true);
			console.log(todoCount);
		}
	}
}

loadDataFromApi();

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* A function for padding numbers to 2 digits. This is necessary for Date.gethours(), Date.getMinutes, etc. */
function twoDigits(number) {
	if (0 <= number && number < 10) {
		return "0" + number.toString();
	}
	return number.toString();
}

/* A function for converting date objects to my mySQL format strings (local time) */
function toMySqlFormat(dateInMS) {
	const dateObject = new Date(dateInMS);

	return (
		dateObject.getFullYear() +
		"-" +
		twoDigits(1 + dateObject.getMonth()) +
		"-" +
		twoDigits(dateObject.getDate()) +
		" " +
		twoDigits(dateObject.getHours()) +
		":" +
		twoDigits(dateObject.getMinutes()) +
		":" +
		twoDigits(dateObject.getSeconds())
	);
}

/* A function for pushing todo tasks to todoList*/
async function pushTodo(text, priority, date) {
	const dataToPush = { text, priority, date };

	todoList.push(dataToPush);
	await setPersistent(API_KEY, todoList);
}

/* A function for finding an index of an object in an array based on a value of its property */
function findIndexOfObjectWithProperty(array, prop, value) {
	for (let i = 0; i < array.length; i++) {
		if (array[i][prop] == value) {
			return i;
		}
	}
	return -1;
}

/* A function for deleting a todo based on its date in milliseconds */
async function deleteTodoByDateInMs(dateInMS) {
	const indexOfTodoToDelete = findIndexOfObjectWithProperty(todoList, "date", dateInMS);
	console.log(indexOfTodoToDelete);
	if (indexOfTodoToDelete > -1) {
		deletedTodos.push(todoList.splice(indexOfTodoToDelete, 1));
		await setPersistent(API_KEY, todoList);
	}
	console.log(deletedTodos);
	console.log(todoList);
}

/* A function for displaying todo's on the page. Default value is set to todolists' last todo. This is for calling the function without specifying a parameter. Otherwise the displayed todo will be the parameter with which the function was called. */
function displayTodo(todo = todoList[todoList.length - 1]) {
	console.log(todo);
	console.log(todoList);

	const todoContainer = document.createElement("div");
	todoContainer.classList.add("todo-container");
	viewSection.appendChild(todoContainer);

	const todoPriority = document.createElement("div");
	todoPriority.classList.add("todo-priority");
	todoContainer.appendChild(todoPriority);
	todoPriority.innerText = todo.priority;

	const todoCreatedAt = document.createElement("div");
	todoCreatedAt.classList.add("todo-created-at");
	todoCreatedAt.setAttribute("data-date-ms", todo.date);
	console.log(todoCreatedAt.dataset.dateMs); // Attributes are converted to camelCase
	todoContainer.appendChild(todoCreatedAt);
	todoCreatedAt.innerText = toMySqlFormat(todo.date);

	const todoText = document.createElement("div");
	todoText.classList.add("todo-text");
	todoContainer.appendChild(todoText);
	todoText.innerText = todo.text;

	const deleteButton = document.createElement("button");
	deleteButton.classList.add("delete-button");
	todoContainer.appendChild(deleteButton);
	deleteButton.innerText = "Delete";
}

/* A function for either incrementing or decrementing todoCount and displaying it in the counter heading */
function incrementAndDisplayTodoCount(add) {
	if (add) {
		counter.innerText = ++todoCount;
	} else if (!add) {
		counter.innerText = --todoCount;
	}
}

/* A function which determines in which order to perform a sort by a boolean parameter. Note that it returns a function which I used to override Array.sort's default sorting method. */
function sortingSpecifier(largestToSmallest, property) {
	if (largestToSmallest) {
		return function (a, b) {
			return b[property] - a[property];
		};
	} else if (!largestToSmallest) {
		return function (a, b) {
			return a[property] - b[property];
		};
	}
}

/* A function for sorting todoList array and rearranging the corresponding HTML elements on the page */
function sortTodosAndRearrangeViewSection() {
	todoList = todoList.sort(sortingSpecifier(sortingOrder, sortingMethodSelector.value));
	console.log(todoList);

	let todoListIterator = 0;

	for (const todoContainer of document.getElementsByClassName("todo-container")) {
		console.log(todoContainer);

		todoContainer.children[0].innerText = todoList[todoListIterator].priority;
		todoContainer.children[1].innerText = toMySqlFormat(todoList[todoListIterator].date);
		todoContainer.children[2].innerText = todoList[todoListIterator].text;

		todoListIterator++;
	}
}

/* Event listener for the "Add Task" button */
todoForm.addEventListener("submit", (event) => {
	event.preventDefault();

	let todoText = textInput.value;
	let todoPriority = prioritySelector.value;
	let todoCreatedAt = new Date().getTime();

	/* const dataToPush = { text: todoText, priority: todoPriority, date: todoCreatedAt }; */

	pushTodo(todoText, todoPriority, todoCreatedAt);

	displayTodo();

	incrementAndDisplayTodoCount(true);
	todoForm.reset();
});

/* Event listener for sorting-order-button */
sortingOrderButton.addEventListener("click", (event) => {
	console.log(sortingImage);
	if (sortingImage.src.includes(RED_ARROW_DOWN_SRC)) {
		console.log(sortingImage.src);

		sortingImage.src = sortingImage.src.replace(RED_ARROW_DOWN_SRC, GREEN_ARROW_UP_SRC);
		sortingOrder = false;

		console.log(sortingImage.src);
	} else if (sortingImage.src.includes(GREEN_ARROW_UP_SRC)) {
		console.log(sortingImage.src);

		sortingImage.src = sortingImage.src.replace(GREEN_ARROW_UP_SRC, RED_ARROW_DOWN_SRC);
		sortingOrder = true;

		console.log(sortingImage.src);
	}
	console.log("sorting order:" + sortingOrder);
});

/* Event listener for sort button (sorting todo's) */
sortButton.addEventListener("click", () => {
	console.log(JSON.stringify(todoList));
	sortTodosAndRearrangeViewSection();
});

/* Event listener for delete buttons (deleting todo's) */
viewSection.addEventListener("click", (event) => {
	const closestDeleteButton = event.target.closest(".delete-button");
	if (closestDeleteButton) {
		const correspondingTodo = closestDeleteButton.parentNode;
		console.log(correspondingTodo);

		const dateOfCorrespondingTodoInMs = correspondingTodo.querySelector(".todo-created-at").dataset
			.dateMs;
		console.log(dateOfCorrespondingTodoInMs);

		deleteTodoByDateInMs(dateOfCorrespondingTodoInMs);

		correspondingTodo.remove();
	}
});

/* These 2 listeners below are used for custom validation message for my input. Inspiration from - https://stackoverflow.com/questions/5272433/html5-form-required-attribute-set-custom-validation-message */
textInput.addEventListener("invalid", (event) => {
	event.target.setCustomValidity("");
	if (!event.target.validity.valid) {
		event.target.setCustomValidity("You need your task to have a name, bro");
	}
});

textInput.addEventListener("input", (event) => {
	event.target.setCustomValidity("");
});
