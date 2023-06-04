// express 연결
const express = require("express");
const app = express();
const port = 4001;

// bodyParser 연결
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// mariaDB연결
const mariadb = require("mysql");

//cors
const cors = require("cors");
app.use(cors());

const connection = mariadb.createConnection({
	host: "localhost",
	port: "3306",
	user: "root",
	password: "1234",
	database: "bulletin",
});

// 서버 연결 확인
connection.connect((err) => {
	if (err) {
		console.error("error", err);
	} else {
		console.log("connect!!");
	}
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

		res.send(results);
	});
});

app.get("/board/:id", (req, res) => {
	connection.query("select * from 게시글", function (error, results, fields) {
		if (error) {
			console.error("Error executing query:", error);
			res.status(500).json({ error: "An error occurred" });
			return;
		}

		let id = req.params.id;
		let idx = id - 1;
		res.send(results[idx]);
	});
});

app.post("/api/posts", (req, res) => {
	const { title, text } = req.body;

	connection.query(
		"INSERT INTO 게시글 (글제목, 글내용, 작성일) VALUES (?, ?, NOW())",
		[title, text],
		function (error, results, fields) {
			if (error) {
				console.error("에러가 발생했음", error);
				res.status(500).json({ error: "An error occurred" });
				return;
			}
			res.json(results);
		}
	);
});

app.listen(port);
