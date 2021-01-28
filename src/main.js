const controlSection = document.querySelector(".control-section");
const viewSection = document.querySelector(".view-section");
const addButton = document.querySelector("#addbutton");
const textInput = document.querySelector("#text-input");
const prioritySelector = document.querySelector("#priority-selector");
const toDoList = [];

/* A function for adding todo tasks */
function createTodo() {
	let todoText = textInput.innerText;
	let todoCreatedAt;
	let todoPriority = prioritySelector.value;

	return { todoText, todoCreatedAt, todoPriority };
}

/* A function for adding todo's to todo list */
function addTodo() {
	toDoList.unshift(createTodo());
}

/* addButton.addEventListener("click", ); */
