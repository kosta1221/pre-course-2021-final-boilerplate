const express = require("express");
const fs = require("fs");
const uuid = require("uuid");
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
			res.status(500).json({ message: "Internal server error", error: err });
		}
	}
});

// GET request to /b/{id} returns the details of the object
// Currently works on http://localhost:3000/b/todos
app.get("/b/:id", (req, res) => {
	const { id } = req.params;
	if (!fs.existsSync(`./todos/${id}.json`)) {
		res.status(400).json({ message: "Invalid bin id" });
	} else {
		fs.readFile(`./todos/${id}.json`, (err, data) => {
			if (err) {
				res.status(500).json({ message: "Internal server error", error: err });
			} else res.send(data);
		});
	}
});

// POST request to /b - create new object and return the new object
app.post("/b", (req, res) => {
	const { body } = req;
	if (Object.keys(body).length === 0) {
		res.status(400).json({
			message: "Bin can't be blank!",
		});
	} else {
		const id = uuid.v4();
		body.id = id;
		fs.writeFile(`./todos/${id}.json`, JSON.stringify(body, null, 4), (err) => {
			if (err) {
				res.status(500).json({ message: "Internal server error", error: err });
			} else {
				console.log(`New bin id: ${id}`);
				res.status(201).json(body);
			}
		});
	}
});

// PUT request to /b/{id} get in the body params updated object and return the updated object
app.put("/b/:id", (req, res) => {
	const { id } = req.params;
	const { body } = req;
	if (!fs.existsSync(`./todos/${id}.json`)) {
		res.status(400).json({
			message: "Bin id not found",
		});
	} else {
		body.id = id;
		fs.writeFile(`./todos/${id}.json`, JSON.stringify(body, null, 4), (err) => {
			if (err) {
				res.status(500).json({ message: "Internal server error", error: err });
			} else {
				console.log(`Updated bin id: ${id}`);
				res.status(201).json(body);
			}
		});
	}
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
