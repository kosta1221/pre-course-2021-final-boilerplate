/* DOM Elements declaration */
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

/* DOM Elements for completed todo's */
const completedTodosSection = document.querySelector(".completed-todos-section");
const completedCounter = document.querySelector("#completed-counter");
const sortingMethodSelectorForCompleted = document.querySelector(
	"#sorting-method-selector-for-completed"
);
const sortButtonForCompleted = document.querySelector("#sort-button-for-completed");
const sortingOrderButtonForCompleted = document.querySelector(
	"#sorting-order-button-for-completed"
);
const sortingImageForCompleted = document.querySelector("#sorting-image-for-completed");

const RED_ARROW_DOWN_SRC = "/images/240px-Red_Arrow_Down.svg.png";
const GREEN_ARROW_UP_SRC = "/images/Green_Arrow_Up.png";

const deletedTodos = [];
let todoList = [];
let completedTodos = [];
let todoCount = 0;
let completedTodoCount = 0;
let sortingOrder = true; // true for descending, false for ascending
let sortingOrderForCompleted = true; // true for descending, false for ascending

/* A function for loading data from Jsonbin.io */
async function loadDataFromApi() {
	const loadedData = await getPersistent(API_KEY);
	console.log("Promise received (loaded data): ");
	console.log(loadedData);

	if (Array.isArray(loadedData.record["my-todo"])) {
		todoList = loadedData.record["my-todo"];
	} else if (loadedData.record["my-todo"]) {
		todoList.push(loadedData.record["my-todo"]);
	}

	if (Array.isArray(loadedData.record["completed-todos"])) {
		completedTodos = loadedData.record["completed-todos"];
	} else if (loadedData.record["completed-todos"]) {
		completedTodos.push(loadedData.record["completed-todos"]);
	}
	console.log("todoList: ");
	console.log(todoList);
	console.log("completedTodos: ");
	console.log(completedTodos);
	console.log("todoCount: " + todoCount);
	console.log("completedTodoCount: " + todoCount);

	//WARNING! UNCOMMENTING THIS WILL CAUSE A TEST TO FAIL. Used to change  default sort of todoList upon page load.
	/* todoList = todoList.sort(sortingSpecifier(true, "priority"));
	console.log(todoList); */

	if (todoList.length > 0) {
		for (todo of todoList) {
			displayTodo(false, todo);
			incrementAndDisplayTodoCount(true);
			console.log("todoCount: " + todoCount);
		}
	}

	if (completedTodos.length > 0) {
		for (completedTodo of completedTodos) {
			displayTodo(true, completedTodo);
			incrementAndDisplayCompletedTodoCount(true);
			console.log("completedTodoCount: " + completedTodoCount);
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
	await setPersistent(API_KEY, todoList, completedTodos);
}

/* A function for pushing todo tasks to completedTodos */
async function pushTodoToCompleted(text, priority, date) {
	completedTodos.push({ text, priority, date, dateCompleted: new Date().getTime() });

	await setPersistent(API_KEY, todoList, completedTodos);
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

/* A function for deleting a todo based on its date in milliseconds, either from todoList of from completedTodos */
async function deleteTodoByDateInMs(isCompleted, dateInMS) {
	if (isCompleted) {
		const indexOfTodoToDelete = findIndexOfObjectWithProperty(completedTodos, "date", dateInMS);
		console.log(indexOfTodoToDelete);
		if (indexOfTodoToDelete > -1) {
			completedTodos.splice(indexOfTodoToDelete, 1);
			await setPersistent(API_KEY, todoList, completedTodos);
		}
		console.log(deletedTodos);
		console.log(todoList);
	} else if (!isCompleted) {
		const indexOfTodoToDelete = findIndexOfObjectWithProperty(todoList, "date", dateInMS);
		console.log(indexOfTodoToDelete);
		if (indexOfTodoToDelete > -1) {
			deletedTodos.push(todoList.splice(indexOfTodoToDelete, 1));
			await setPersistent(API_KEY, todoList, completedTodos);
		}
		console.log(deletedTodos);
		console.log(todoList);
	}
}

/* A function for displaying todo's on the page. Default value is set to todolists' last todo. This is for calling the function without specifying a parameter. Otherwise the displayed todo will be the parameter with which the function was called. */
function displayTodo(isCompleted, todo = todoList[todoList.length - 1]) {
	console.log("Todo to be displayed: ");
	console.log(todo);

	const todoContainer = document.createElement("div");
	todoContainer.classList.add("todo-container");
	if (!isCompleted) {
		viewSection.appendChild(todoContainer);
	} else {
		completedTodosSection.appendChild(todoContainer);
	}

	const todoPriority = document.createElement("div");
	todoPriority.classList.add("todo-priority");
	todoContainer.appendChild(todoPriority);
	todoPriority.innerText = todo.priority;

	const todoCreatedAt = document.createElement("div");
	todoCreatedAt.classList.add("todo-created-at");
	todoCreatedAt.setAttribute("data-date-ms", todo.date);
	console.log(
		"The following number is todo-created-at's data-date-ms which should be equal to todo's date in ms:"
	);
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

	if (!isCompleted) {
		const completeTodoButton = document.createElement("button");
		completeTodoButton.classList.add("complete-todo-button");
		todoContainer.appendChild(completeTodoButton);
		completeTodoButton.innerText = "✔";
	}
}

/* A function for either incrementing or decrementing todoCount and displaying it in the counter heading */
function incrementAndDisplayTodoCount(add) {
	if (add) {
		counter.innerText = ++todoCount;
	} else if (!add) {
		counter.innerText = --todoCount;
	}
}

/* A function for either incrementing or decrementing completedTodoCount and displaying it in the completed-todos-section */
function incrementAndDisplayCompletedTodoCount(add) {
	if (add) {
		completedCounter.innerText = ++completedTodoCount;
	} else if (!add) {
		completedCounter.innerText = --completedTodoCount;
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
function sortTodosAndRearrangeViewSection(isCompleted) {
	if (!isCompleted) {
		todoList = todoList.sort(sortingSpecifier(sortingOrder, sortingMethodSelector.value));
		console.log(todoList);

		let todoListIterator = 0;

		console.log(viewSection.getElementsByClassName("todo-container"));

		for (const todoContainer of viewSection.getElementsByClassName("todo-container")) {
			console.log(todoContainer);

			todoContainer.children[0].innerText = todoList[todoListIterator].priority;
			console.log(
				todoListIterator + "'s Original date in ms: " + todoContainer.children[1].dataset.dateMs
			);

			todoContainer.children[1].dataset.dateMs = todoList[todoListIterator].date;

			console.log(
				todoListIterator + "'s date in ms after sort: " + todoContainer.children[1].dataset.dateMs
			);

			todoContainer.children[1].innerText = toMySqlFormat(todoList[todoListIterator].date);
			todoContainer.children[2].innerText = todoList[todoListIterator].text;

			todoListIterator++;
		}
	} else if (isCompleted) {
		// Same thing but with relevance to completed-todos-section
		completedTodos = completedTodos.sort(
			sortingSpecifier(sortingOrderForCompleted, sortingMethodSelectorForCompleted.value)
		);
		console.log(completedTodos);

		let completedTodosIterator = 0;

		console.log(completedTodosSection.getElementsByClassName("todo-container"));

		for (const todoContainer of completedTodosSection.getElementsByClassName("todo-container")) {
			console.log(todoContainer);

			todoContainer.children[0].innerText = completedTodos[completedTodosIterator].priority;
			console.log(
				completedTodosIterator +
					"'s Original date in ms: " +
					todoContainer.children[1].dataset.dateMs
			);

			todoContainer.children[1].dataset.dateMs = completedTodos[completedTodosIterator].date;

			console.log(
				completedTodosIterator +
					"'s date in ms after sort: " +
					todoContainer.children[1].dataset.dateMs
			);

			todoContainer.children[1].innerText = toMySqlFormat(
				completedTodos[completedTodosIterator].date
			);
			todoContainer.children[2].innerText = completedTodos[completedTodosIterator].text;

			completedTodosIterator++;
		}
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

	displayTodo(false);

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

/* Event listener for sorting-order-button-for-completed */
sortingOrderButtonForCompleted.addEventListener("click", (event) => {
	console.log(sortingImageForCompleted);
	if (sortingImageForCompleted.src.includes(RED_ARROW_DOWN_SRC)) {
		console.log(sortingImageForCompleted.src);

		sortingImageForCompleted.src = sortingImageForCompleted.src.replace(
			RED_ARROW_DOWN_SRC,
			GREEN_ARROW_UP_SRC
		);
		sortingOrderForCompleted = false;

		console.log(sortingImageForCompleted.src);
	} else if (sortingImageForCompleted.src.includes(GREEN_ARROW_UP_SRC)) {
		console.log(sortingImageForCompleted.src);

		sortingImageForCompleted.src = sortingImageForCompleted.src.replace(
			GREEN_ARROW_UP_SRC,
			RED_ARROW_DOWN_SRC
		);
		sortingOrderForCompleted = true;

		console.log(sortingImageForCompleted.src);
	}
	console.log("sorting order:" + sortingOrderForCompleted);
});

/* Event listener for sort button (sorting todo's) */
sortButton.addEventListener("click", () => {
	console.log(JSON.stringify(todoList));
	sortTodosAndRearrangeViewSection(false);
});

/* Event listener for sort-button-for-completed (sorting completed todo's) */
sortButtonForCompleted.addEventListener("click", () => {
	sortTodosAndRearrangeViewSection(true);
});

/* Event listener for delete buttons (deleting todo's) in view section*/
viewSection.addEventListener("click", (event) => {
	const closestDeleteButton = event.target.closest(".delete-button");
	if (closestDeleteButton) {
		const correspondingTodo = closestDeleteButton.parentNode;
		console.log(correspondingTodo);

		const dateOfCorrespondingTodoInMs = correspondingTodo.querySelector(".todo-created-at").dataset
			.dateMs;
		console.log(dateOfCorrespondingTodoInMs);

		deleteTodoByDateInMs(false, dateOfCorrespondingTodoInMs);
		incrementAndDisplayTodoCount(false);
		correspondingTodo.remove();
	}
});

/* Event listener for delete buttons (deleting todo's) in comleted-todos-section*/
completedTodosSection.addEventListener("click", (event) => {
	const closestDeleteButton = event.target.closest(".delete-button");
	if (closestDeleteButton) {
		const correspondingTodo = closestDeleteButton.parentNode;
		console.log(correspondingTodo);

		const dateOfCorrespondingTodoInMs = correspondingTodo.querySelector(".todo-created-at").dataset
			.dateMs;
		console.log(dateOfCorrespondingTodoInMs);

		deleteTodoByDateInMs(true, dateOfCorrespondingTodoInMs);
		incrementAndDisplayCompletedTodoCount(false);
		correspondingTodo.remove();
	}
});

/* Event listener for complete-todo-buttons (completing todo's) */
viewSection.addEventListener("click", (event) => {
	const closestCompleteTodoButton = event.target.closest(".complete-todo-button");
	if (closestCompleteTodoButton) {
		const correspondingTodo = closestCompleteTodoButton.parentNode;
		console.log(correspondingTodo);

		const dateOfCorrespondingTodoInMs = +correspondingTodo.querySelector(".todo-created-at").dataset
			.dateMs;
		const textOfCorrespondingTodo = correspondingTodo.querySelector(".todo-text").innerText;
		const priorityOfCorrespondingTodo = correspondingTodo.querySelector(".todo-priority").innerText;
		console.log(textOfCorrespondingTodo);
		console.log(priorityOfCorrespondingTodo);
		console.log(dateOfCorrespondingTodoInMs);

		pushTodoToCompleted(
			textOfCorrespondingTodo,
			priorityOfCorrespondingTodo,
			dateOfCorrespondingTodoInMs
		);
		completedTodosSection.appendChild(correspondingTodo);
		correspondingTodo.querySelector(".complete-todo-button").remove();

		deleteTodoByDateInMs(false, dateOfCorrespondingTodoInMs);
		incrementAndDisplayTodoCount(false);
		incrementAndDisplayCompletedTodoCount(true);
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
