// express 연결
const express = require("express");
const app = express();
const port = 4001;

// mariaDB연결
const mariadb = require("mysql");

const connection = mariadb.createConnection({
	host: "localhost",
	port: "3306",
	user: "root",
	password: "1234",
	database: "bulletin",
});

app.get("/", (req, res) => {
	res.send("hello ");
});

app.get("/board", (req, res) => {
	connection.query("select * from 게시글", function (error, results, fields) {
		if (error) {
			console.error("Error executing query:", error);
			res.status(500).json({ error: "An error occurred" });
			return;
		}
		res.json(results);
	});
});

app.listen(port);
