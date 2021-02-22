/* DOM Elements declaration */
const controlSection = document.querySelector(".control-section");
const viewSection = document.querySelector(".view-section");
const addButton = document.querySelector("#add-button");
const textInput = document.querySelector("#text-input");
const todoForm = document.querySelector("#todo-form");
const prioritySelector = document.querySelector("#priority-selector");
const counter = document.querySelector("#counter");
const loader = document.querySelector("#loader");
const sortButton = document.querySelector("#sort-button");
const sortingMethodSelector = document.querySelector("#sorting-method-selector");
const sortingOrderButton = document.querySelector("#sorting-order-button");
const sortingImage = document.querySelector("#sorting-image");
const allElementsInBodyExceptLoader = document.querySelectorAll("body :not(#loader)");
const moveTodosHere = document.querySelector("#move-todos-here");
const binIdText = document.querySelector("#bin-id-text");

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
const completedTodosHeaderContent = document.querySelector("#completed-todos-header-content");

const RED_ARROW_DOWN_SRC = "/images/240px-Red_Arrow_Down.svg.png";
const GREEN_ARROW_UP_SRC = "/images/Green_Arrow_Up.png";
const deletedTodos = [];

let currentWantedBinId = sessionStorage.getItem("currentWantedBinId");
let todoList = [];
let completedTodos = [];
let todoCount = 0;
let completedTodoCount = 0;
let sortingOrder = true; // true for descending, false for ascending
let sortingOrderForCompleted = true; // true for descending, false for ascending

/* A function for loading data from Jsonbin.io */
async function loadDataFromApi(binId = null) {
	/* if (!window.location.href.includes("/index.html")) {
		window.location.href = "./index.html";
	} */
	console.log(currentWantedBinId);
	console.log(binId);
	if (binId === null) {
		if (confirm("For admin site press 'OK'")) {
			window.location.href = "./admin.html";
		} else {
			binId = currentWantedBinId = prompt(
				"Please input your bin id:",
				"e20a3315-0e2f-442c-8df9-2f661c932dfd"
			);
		}
	}

	try {
		const loadedData = await getPersistent(binId);

		binIdText.innerText = `Bin id: ${currentWantedBinId}`;

		console.log("Loaded data promise:");
		console.log(loadedData);

		if (Array.isArray(loadedData["my-todo"])) {
			todoList = loadedData["my-todo"];
		} else if (loadedData["my-todo"]) {
			todoList.push(loadedData["my-todo"]);
		}

		if (Array.isArray(loadedData["completed-todos"])) {
			completedTodos = loadedData["completed-todos"];
		} else if (loadedData["completed-todos"]) {
			completedTodos.push(loadedData["completed-todos"]);
		}

		//WARNING! UNCOMMENTING THIS WILL CAUSE A TEST TO FAIL. Used to change  default sort of todoList upon page load.
		/* todoList = todoList.sort(sortingSpecifier(true, "priority")); */

		if (todoList.length > 0) {
			for (todo of todoList) {
				displayTodo(false, todo);
				incrementAndDisplayTodoCount(true);
			}
		}

		if (completedTodos.length > 0) {
			for (completedTodo of completedTodos) {
				displayTodo(true, completedTodo);
				incrementAndDisplayCompletedTodoCount(true);
			}
		} else {
			completedTodosSection.style.position = "relative";
			completedTodosHeaderContent.style.display = "none";
			moveTodosHere.style.display = "flex";
			completedTodosSection.style.minHeight = "200px";
		}
	} catch (error) {
		console.log("There was an error. ", error);
	}
}

if (!window.location.href.includes("/admin.html")) {
	if (currentWantedBinId) {
		loadDataFromApi(currentWantedBinId);
	} else {
		loadDataFromApi();
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* A function for padding numbers to 2 digits. This is necessary for Date.gethours(), Date.getMinutes, etc. */
function twoDigits(number) {
	if (0 <= number && number < 10) {
		return "0" + number.toString();
	}
	return number.toString();
}

/* A function for converting date in MS to my mySQL format strings (local time) */
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

/* A function for converting date in MS to my mySQL format strings (local time) */
function toMyDateForSmallerScreens(dateInMS) {
	const dateObject = new Date(dateInMS);

	return (
		twoDigits(1 + dateObject.getMonth()) +
		"/" +
		twoDigits(dateObject.getDate()) +
		" " +
		twoDigits(dateObject.getHours()) +
		":" +
		twoDigits(dateObject.getMinutes())
	);
}

/* A function for pushing todo tasks to todoList*/
async function pushTodo(text, priority, date) {
	const dataToPush = { text, priority, date };

	todoList.push(dataToPush);
	await setPersistent(currentWantedBinId, todoList, completedTodos);
}

/* A function for pushing todo tasks to completedTodos */
async function pushTodoToCompleted(text, priority, date, updateServer) {
	completedTodos.push({ text, priority, date, dateCompleted: new Date().getTime() });

	if (updateServer) {
		await setPersistent(currentWantedBinId, todoList, completedTodos);
	}
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

		if (indexOfTodoToDelete > -1) {
			completedTodos.splice(indexOfTodoToDelete, 1);
			await setPersistent(currentWantedBinId, todoList, completedTodos);
		}
		// If it's the last completed todo and it's deleted, show 'move-todos-here'
		if (completedTodos.length < 1) {
			completedTodosSection.style.position = "relative";
			completedTodosHeaderContent.style.display = "none";
			moveTodosHere.style.display = "flex";
			moveTodosHere.style.color = "white";
			completedTodosSection.style.minHeight = "200px";
		}
	} else if (!isCompleted) {
		const indexOfTodoToDelete = findIndexOfObjectWithProperty(todoList, "date", dateInMS);

		if (indexOfTodoToDelete > -1) {
			deletedTodos.push(todoList.splice(indexOfTodoToDelete, 1));
			await setPersistent(currentWantedBinId, todoList, completedTodos);
		}
	}
}

/* A function for displaying todo's on the page. Default value is set to todolists' last todo. This is for calling the function without specifying a parameter. Otherwise the displayed todo will be the parameter with which the function was called. */
function displayTodo(isCompleted, todo = todoList[todoList.length - 1]) {
	const todoContainer = document.createElement("div");
	todoContainer.classList.add("todo-container");
	todoContainer.classList.add("draggable");
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
	todoCreatedAt.setAttribute("id", "todo-created-at-long-version");
	todoCreatedAt.setAttribute("data-date-ms", todo.date);

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

	/* Create shorter version of date for use in media queries. Ideally I would just put them before todoText but this way it fails test number 6 (which is poorly written, because It forces me to not have elements between todoPriority, todoCreatedAt and todoText.)*/
	const todoCreatedAtShortVersion = document.createElement("div");
	todoCreatedAtShortVersion.classList.add("todo-created-at");
	todoCreatedAtShortVersion.setAttribute("id", "todo-created-at-short-version");
	todoCreatedAtShortVersion.setAttribute("data-date-ms", todo.date);
	todoContainer.appendChild(todoCreatedAtShortVersion);
	todoCreatedAtShortVersion.innerText = toMyDateForSmallerScreens(todo.date);

	// This is for adding mousedown handlers on todocontainers upon creation
	todoContainer.addEventListener("mousedown", mouseDownHandler);
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

		let todoListIterator = 0;

		for (const todoContainer of viewSection.getElementsByClassName("todo-container")) {
			todoContainer.children[0].innerText = todoList[todoListIterator].priority;
			todoContainer.children[1].dataset.dateMs = todoList[todoListIterator].date;
			todoContainer.children[1].innerText = toMySqlFormat(todoList[todoListIterator].date);
			todoContainer.children[2].innerText = todoList[todoListIterator].text;
			todoListIterator++;
		}
	} else if (isCompleted) {
		// Same thing but with relevance to completed-todos-section
		completedTodos = completedTodos.sort(
			sortingSpecifier(sortingOrderForCompleted, sortingMethodSelectorForCompleted.value)
		);

		let completedTodosIterator = 0;

		for (const todoContainer of completedTodosSection.getElementsByClassName("todo-container")) {
			todoContainer.children[0].innerText = completedTodos[completedTodosIterator].priority;

			todoContainer.children[1].dataset.dateMs = completedTodos[completedTodosIterator].date;

			todoContainer.children[1].innerText = toMySqlFormat(
				completedTodos[completedTodosIterator].date
			);
			todoContainer.children[2].innerText = completedTodos[completedTodosIterator].text;

			completedTodosIterator++;
		}
	}
}

/* A handler function for adding a todo to completedTodos */
function addTodoToCompletedHandler(event) {
	let closestCompleteTodoButton;

	if (event.type === "click") {
		closestCompleteTodoButton = event.target.closest(".complete-todo-button");
	} else if (event.type === "mouseup") {
		closestCompleteTodoButton = event.target.querySelector(".complete-todo-button");
	}

	if (closestCompleteTodoButton) {
		const correspondingTodo = closestCompleteTodoButton.parentNode;

		const dateOfCorrespondingTodoInMs = +correspondingTodo.querySelector(".todo-created-at").dataset
			.dateMs;
		const textOfCorrespondingTodo = correspondingTodo.querySelector(".todo-text").innerText;
		const priorityOfCorrespondingTodo = correspondingTodo.querySelector(".todo-priority").innerText;

		completedTodosSection.appendChild(correspondingTodo);
		correspondingTodo.querySelector(".complete-todo-button").remove();

		pushTodoToCompleted(
			textOfCorrespondingTodo,
			priorityOfCorrespondingTodo,
			dateOfCorrespondingTodoInMs,
			false
		);

		// Async call
		deleteTodoByDateInMs(false, dateOfCorrespondingTodoInMs);

		incrementAndDisplayTodoCount(false);
		incrementAndDisplayCompletedTodoCount(true);
	}

	// If move-todos-here is showing, stop showing it

	if (moveTodosHere.style.display === "flex") {
		completedTodosHeaderContent.style.display = "block";
		completedTodosSection.style.position = "static";
		moveTodosHere.style.display = "none";
		completedTodosSection.style.minHeight = "";
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
	if (sortingImage.src.includes(RED_ARROW_DOWN_SRC)) {
		sortingImage.src = sortingImage.src.replace(RED_ARROW_DOWN_SRC, GREEN_ARROW_UP_SRC);
		sortingOrder = false;
	} else if (sortingImage.src.includes(GREEN_ARROW_UP_SRC)) {
		sortingImage.src = sortingImage.src.replace(GREEN_ARROW_UP_SRC, RED_ARROW_DOWN_SRC);
		sortingOrder = true;
	}
});

/* Event listener for sorting-order-button-for-completed */
sortingOrderButtonForCompleted.addEventListener("click", (event) => {
	if (sortingImageForCompleted.src.includes(RED_ARROW_DOWN_SRC)) {
		sortingImageForCompleted.src = sortingImageForCompleted.src.replace(
			RED_ARROW_DOWN_SRC,
			GREEN_ARROW_UP_SRC
		);
		sortingOrderForCompleted = false;
	} else if (sortingImageForCompleted.src.includes(GREEN_ARROW_UP_SRC)) {
		sortingImageForCompleted.src = sortingImageForCompleted.src.replace(
			GREEN_ARROW_UP_SRC,
			RED_ARROW_DOWN_SRC
		);
		sortingOrderForCompleted = true;
	}
});

/* Event listener for sort button (sorting todo's) */
sortButton.addEventListener("click", () => {
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

		const dateOfCorrespondingTodoInMs = correspondingTodo.querySelector(".todo-created-at").dataset
			.dateMs;

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

		const dateOfCorrespondingTodoInMs = correspondingTodo.querySelector(".todo-created-at").dataset
			.dateMs;

		deleteTodoByDateInMs(true, dateOfCorrespondingTodoInMs);
		incrementAndDisplayCompletedTodoCount(false);
		correspondingTodo.remove();
	}
});

/* Event listener for complete-todo-buttons (completing todo's) */
viewSection.addEventListener("click", addTodoToCompletedHandler);

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* The code below is for dragging & dropping exclusively. This was very hard to implement. I've followed these amazing guides:
https://htmldom.dev/drag-and-drop-element-in-a-list/
https://htmldom.dev/make-a-draggable-element/
https://javascript.info/mouse-drag-and-drop */

// The current dragging item
let draggingElement;

// The current position of mouse relative to the dragging element
let x = 0;
let y = 0;

let placeholder;
let isDraggingStarted = false;

/* A handler function for mousedown events which is added to all elements with class draggable in displayTodo() */
const mouseDownHandler = (event) => {
	if (event.target.tagName != "BUTTON") {
		draggingElement = event.target.closest(".draggable");

		/* Calculate the mouse position INSIDE of the element and RELATIVE to it- this is super helpful for understanding getBoundingClientRect() - https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect */
		const elementRectangle = draggingElement.getBoundingClientRect();
		x = event.pageX - elementRectangle.left - window.scrollX;
		y = event.pageY - elementRectangle.top - window.scrollY;

		// Setting display of all buttons of draggable element to none while being dragged
		for (const button of draggingElement.querySelectorAll("button")) {
			button.style.display = "none";
		}
		// Disable transition effects while being dragged and make it above everything else
		draggingElement.style.transition = "none";
		draggingElement.style.zIndex = "2";

		// keeping width normal while dragging
		draggingElement.style.width = `${elementRectangle.width}px`;

		// Show the move-todos-here div
		if (
			event.target.parentNode === viewSection ||
			event.target.parentNode.parentNode === viewSection
		) {
			completedTodosSection.style.position = "relative";
			completedTodosHeaderContent.style.display = "none";
			moveTodosHere.style.display = "flex";
			completedTodosSection.style.minHeight = "200px";
		}

		// Attach the listeners to `document`
		document.addEventListener("mousemove", mouseMoveHandler);
		document.addEventListener("mouseup", mouseUpHandler);
	}
};

/* A handler function for mouseup events for draggable elements */
const mouseUpHandler = (event) => {
	// Remove the placeholder
	placeholder && placeholder.parentNode.removeChild(placeholder);
	// Reset the flag
	isDraggingStarted = false;

	// Remove the position styles
	draggingElement.style.removeProperty("top");
	draggingElement.style.removeProperty("left");
	draggingElement.style.removeProperty("position");

	// UNCOMMENT IF YOU WANT VISIBLE BUTTONS FOR todo-containers
	// Setting back buttons of draggable element to visible
	for (const button of draggingElement.querySelectorAll("button")) {
		button.style.display = "inline-block";
	}

	// Enable transition effects, set z-index back to normal
	draggingElement.style.transition = "";
	draggingElement.style.zIndex = "0";

	// Setting width back to 100% once it's within the proper structure again to maintain responsiveness
	draggingElement.style.width = "100%";

	x = null;
	y = null;
	draggingElement = null;

	/* If dragged to completed todo's, add to completed todo's on mouseup. */
	const completedTodosRectangle = completedTodosSection.getBoundingClientRect();
	if (
		event.pageX > completedTodosRectangle.left + scrollX &&
		event.pageX < completedTodosRectangle.right + scrollX &&
		event.pageY < completedTodosRectangle.bottom + scrollY &&
		event.pageY > completedTodosRectangle.top + scrollY &&
		(event.target.parentNode === viewSection || event.target.parentNode.parentNode === viewSection)
	) {
		addTodoToCompletedHandler(event);
	}

	// If move-todos-here is showing, and there are completed todos, stop showing it on mouseup

	if (moveTodosHere.style.display === "flex" && completedTodos.length > 0) {
		completedTodosHeaderContent.style.display = "block";
		completedTodosSection.style.position = "static";
		moveTodosHere.style.display = "none";
		completedTodosSection.style.minHeight = "";
	}

	// Remove the handlers of `mousemove` and `mouseup`
	document.removeEventListener("mousemove", mouseMoveHandler);
	document.removeEventListener("mouseup", mouseUpHandler);
};

/* A handler function for what happens when moving draggable elements */
const mouseMoveHandler = (event) => {
	const draggingElementRectangle = draggingElement.getBoundingClientRect();

	if (!isDraggingStarted) {
		// Update the flag
		isDraggingStarted = true;

		// Let the placeholder take the height of dragging element
		// So the next element won't move up
		placeholder = document.createElement("div");
		placeholder.classList.add("placeholder");
		draggingElement.parentNode.insertBefore(placeholder, draggingElement.nextSibling);

		// Set the placeholder's height
		placeholder.style.height = `${draggingElementRectangle.height}px`;
	}

	// Set position for dragging element
	draggingElement.style.position = "absolute";
	draggingElement.style.top = `${event.pageY - y}px`;
	draggingElement.style.left = `${event.pageX - x}px`;

	/* Next segment is for moving the element up/down the list(view/completed section) */

	// The current order:
	// previousElement
	// draggingElement
	// placeholder
	// nextElement
	const previousElement = draggingElement.previousElementSibling;
	const nextElement = placeholder.nextElementSibling;

	// User moves the dragging element to the top
	if (previousElement && isAbove(draggingElement, previousElement)) {
		// The current order    -> The new order
		// previousElement      -> placeholder
		// draggingElement      -> draggingElement
		// placeholder          -> previousElement

		swap(placeholder, draggingElement);
		swap(placeholder, previousElement);
		return;
	}

	// User moves the dragging element to the bottom
	if (nextElement && isAbove(nextElement, draggingElement)) {
		// The current order    -> The new order
		// draggingElement      -> nextElement
		// placeholder          -> placeholder
		// nextElement          -> draggingElement

		swap(nextElement, placeholder);
		swap(nextElement, draggingElement);
	}

	// This is purely a workaround to mimic my hover effect, because while dragging an item you cannot hover on something else! Sadly I couldn't find how to add transition on non-hover effects.
	const completedTodosRectangle = completedTodosSection.getBoundingClientRect();
	if (
		event.pageX > completedTodosRectangle.left + scrollX &&
		event.pageX < completedTodosRectangle.right + scrollX &&
		event.pageY < completedTodosRectangle.bottom + scrollY &&
		event.pageY > completedTodosRectangle.top + scrollY &&
		(event.target.parentNode === viewSection || event.target.parentNode.parentNode === viewSection)
	) {
		moveTodosHere.style.color = "indigo";
		moveTodosHere.style.fontSize = "larger";
	} else {
		moveTodosHere.style.color = "white";
		moveTodosHere.style.fontSize = "medium";
	}
};

/* A function for checking if one node is above the other or not */
const isAbove = function (nodeA, nodeB) {
	// Get the bounding rectangle of nodes
	const rectA = nodeA.getBoundingClientRect();
	const rectB = nodeB.getBoundingClientRect();

	return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
};

/* A function for swapping 2 nodes */
const swap = function (nodeA, nodeB) {
	const parentA = nodeA.parentNode;

	// If nodeB is equal to nodeA's next sibling, siblingA will be nodeA. Otherwise siblingA will be nodeA's next sibling.
	const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

	// Move `nodeA` to before the `nodeB`
	nodeB.parentNode.insertBefore(nodeA, nodeB);

	// Move `nodeB` to before the sibling of `nodeA`
	parentA.insertBefore(nodeB, siblingA);
};
