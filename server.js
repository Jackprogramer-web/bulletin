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

// GET
// 먼저 전체 페이지 갯수를 받아오자.
app.get("/totalPage", (req, res) => {
	const pageSize = req.query.pageSize;
	connection.query(
		"SELECT COUNT(*) AS total FROM 게시글",
		(error, results) => {
			if (error) {
				console.error("Error executing query:", error);
				res.status(500).json({ error: "An error occurred" });
				return;
			}

			const totalData = results[0].total;
			const totalPage = Math.ceil(totalData / pageSize);

			res.json(totalPage);
		}
	);
});

// 페이지 n개씩 보는거, 몇번째 page인지에 따라 제공되는 데이터가 다르다.
app.get("/board", (req, res) => {
	const pageSize = parseInt(req.query.pageSize);
	const pageNum = parseInt(req.query.pageNum);

	const offset = (pageNum - 1) * pageSize;

	// 게시글 조회
	connection.query(
		"SELECT * FROM 게시글 LIMIT ?, ?",
		[offset, pageSize],
		(error, results, fields) => {
			if (error) {
				console.error("Error executing query:", error);
				res.status(500).json({ error: "An error occurred" });
				return;
			}

			res.send(results);
		}
	);
});

// 전체 댓글 데이터
app.get("/comment", (req, res) => {
	connection.query("select * from 댓글", function (error, results, fields) {
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

		let id = parseInt(req.params.id);

		const targetBoard = results.find((board) => board["글번호"] === id);

		if (targetBoard) {
			res.send(targetBoard); // 찾은 객체를 전체로 반환하거나 원하는 작업 수행
		} else {
			res.send(`글번호가 ${id}인 객체를 찾을 수 없습니다.`);
		}
	});
});

// 해당 글에 대한 댓글 불러오기
app.get("/comment/:id", (req, res) => {
	let id = parseInt(req.params.id);
	connection.query(
		"select * from 댓글 where 게시글번호 = ?",
		[id],
		function (error, results, fields) {
			if (error) {
				console.error("Error executing query:", error);
				res.status(500).json({ error: "An error occurred" });
				return;
			} else {
				res.send(results);
			}
		}
	);
});

// POST
// 게시글 작성하기
app.post("/api/posts/board", (req, res) => {
	const { title, text, writer } = req.body;

	connection.query(
		"INSERT INTO 게시글 (글제목, 글내용, 작성자, 작성일) VALUES (?, ?, ?, NOW())",
		[title, text, writer],
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

// 댓글 작성하기
app.post("/api/posts/comment", (req, res) => {
	const { idx, user, comment } = req.body;

	connection.query(
		"INSERT INTO 댓글 (게시글번호, 작성자, 내용, 작성일) VALUES (?, ?, ?, NOW())",
		[idx, user, comment],
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

// 게시글 삭제하기
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

//글 검색하기 req.query사용
// text를 query받는다 -> sql문에서 테이블에 해당 내용이 포함되는 튜플을 찾는다
// 해당 튜플을 가지고 있는 글을 홈화면에 비춘다.

app.get("/search", (req, res) => {
	const { searchText } = req.query;
	console.log(req.query);
	console.log(req.query.searchText);

	connection.query(
		"select * from 게시글 as b LEFT join 댓글 AS c ON b.글번호 = c.게시글번호 where b.글내용 LIKE CONCAT('%', ?, '%') or b.글제목 like CONCAT('%', ?, '%') OR c.내용 like CONCAT('%', ?, '%')",
		[searchText, searchText, searchText],
		function (error, results, fields) {
			if (error) {
				console.error("Error executing query:", error);
				res.status(500).json({ error: "An error occurred" });
				return;
			}

			results.forEach((result) => {
				if (result.작성자 === null) {
					result.작성자 = "이름없음";
				}
				console.log(result.작성자);
			});

			res.send(results);
		}
	);
});

app.listen(port);
