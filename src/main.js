const controlSection = document.querySelector(".control-section");
const viewSection = document.querySelector(".view-section");
const addButton = document.querySelector("#addbutton");
const textInput = document.querySelector("#text-input");
const prioritySelector = document.querySelector("#priority-selector");
const toDoList = [];

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
	let todoText = textInput.innerText;
	let todoCreatedAt = toMySqlFormat(new Date());
	let todoPriority = prioritySelector.value;

	return { todoText, todoCreatedAt, todoPriority };
}

/* A function for adding todo's to todo list */
function addTodo() {
	toDoList.unshift(createTodo());
}

/* addButton.addEventListener("click", ); */
