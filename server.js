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

// 글 목록 확인
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

// 해당글 불러오기
app.get("/board/:id", (req, res) => {
	connection.query("select * from 게시글", function (error, results, fields) {
		if (error) {
			console.error("Error executing query:", error);
			res.status(500).json({ error: "An error occurred" });
			return;
		}

		console.log(results);
		let id = parseInt(req.params.id);
		const targetBoard = results.find((board) => board["글번호"] === id);

		if (targetBoard) {
			res.send(targetBoard); // 찾은 객체를 전체로 반환하거나 원하는 작업 수행
		} else {
			console.log("글번호가 1인 객체를 찾을 수 없습니다.");
		}
	});
});

// 글쓰기
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

// 글삭제하기
app.delete("/api/delete/:id", (req, res) => {
	const id = req.params.id;
	connection.query(
		"DELETE FROM 게시글 WHERE 글번호 = (?)",
		[id],
		function (error, results, fields) {
			if (error) {
				console.error("에러가 발생했음", error);
				res.status(500).json({ error: "An error occurred" });
				return;
			}
			res.json(results);
			console.log("삭제 완료");
		}
	);
});

app.listen(port);
