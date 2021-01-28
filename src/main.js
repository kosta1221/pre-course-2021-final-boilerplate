const controlSection = document.querySelector(".control-section");
const viewSection = document.querySelector(".view-section");
const addButton = document.querySelector("#add-button");
const textInput = document.querySelector("#text-input");
const todoForm = document.querySelector("#todo-form");
const prioritySelector = document.querySelector("#priority-selector");
const counter = document.querySelector("#counter");

const todoList = [];
let todoCount = 0;

/* A function for padding numbers to 2 digits. This is necessary for Date.gethours(), Date.getMinutes, etc. */
function twoDigits(number) {
	if (0 <= number && number < 10) {
		return "0" + number.toString();
	}
	return number.toString();
}

/* A function for converting date objects to my mySQL format strings */
function toMySqlFormat(date) {
	return (
		date.getUTCFullYear() +
		"-" +
		twoDigits(1 + date.getUTCMonth()) +
		"-" +
		twoDigits(date.getUTCDate()) +
		" " +
		twoDigits(date.getUTCHours()) +
		":" +
		twoDigits(date.getUTCMinutes()) +
		":" +
		twoDigits(date.getUTCSeconds())
	);
}

/* A function for creating todo tasks */
function createTodo() {
	let todoText = textInput.value;
	let todoCreatedAt = toMySqlFormat(new Date());
	let todoPriority = prioritySelector.value;

	return { todoText, todoCreatedAt, todoPriority };
}

/* A function for adding todo's to todo list and displaying them on the page */
function addAndDisplayTodo() {
	todoList.unshift(createTodo());
	const todo = todoList[0];
	console.log(todo);

	const todoContainer = document.createElement("div");
	todoContainer.classList.add("todo-container");
	viewSection.appendChild(todoContainer);

	const todoPriority = document.createElement("div");
	todoPriority.classList.add("todo-priority");
	todoContainer.appendChild(todoPriority);
	todoPriority.innerText = todo.todoPriority;

	const todoCreatedAt = document.createElement("div");
	todoCreatedAt.classList.add("todo-created-at");
	todoContainer.appendChild(todoCreatedAt);
	todoCreatedAt.innerText = todo.todoCreatedAt;

	const todoText = document.createElement("div");
	todoText.classList.add("todo-text");
	todoContainer.appendChild(todoText);
	todoText.innerText = todo.todoText;
}

function incrementAndDisplayTodoCount(add) {
	if (add) {
		counter.innerText = "You Have " + ++todoCount + " Todos";
	} else if (!add) {
		counter.innerText = "You Have " + --todoCount + " Todos";
	}
}

todoForm.addEventListener("submit", (event) => {
	event.preventDefault();

	addAndDisplayTodo();
	incrementAndDisplayTodoCount(true);
	todoForm.reset();
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
