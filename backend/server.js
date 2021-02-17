const express = require("express");
const fs = require("fs");

const app = express();

// turning request into JSON
app.use(express.json());

// GET request to /b returns a list of objects
app.get("/b", (req, res) => {
	const files = fs.readdirSync("./todos");
	const todos = [];
	if (files.length === 0) {
		res.send("There are no files.");
	} else {
		try {
			files.forEach((file) => {
				todos.push(JSON.parse(fs.readFileSync(`./todos/${file}`)));
			});
			res.send(todos);
		} catch (err) {
			console.log("ERROR" + err);
		}
	}
});

// GET request to /b/{id} returns the details of the object
// Currently works on http://localhost:3000/b/todos
app.get("/b/:id", (req, res) => {
	const { id } = req.params;
	fs.readFile(`./todos/${id}.json`, (err, data) => {
		if (err) {
			res.status(500).json({ message: "ERROR!", error: err });
		} else res.send(data);
	});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
