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

/**테이블 만들기  */
app.get("/table", (req, res) => {
	const createBoardQuery = `
    CREATE TABLE 게시글 (
      글번호 INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
      글제목 VARCHAR(50),
      글내용 VARCHAR(2000),
      작성자 VARCHAR(11),
      작성일 DATETIME
    )
  `;

	const createCommentQuery = `
  CREATE TABLE 댓글 (
    댓글번호 INT AUTO_INCREMENT NOT NULL,
    게시글번호 INT,
    댓글작성자 VARCHAR(12),
    내용 VARCHAR(50),
    작성일 DATETIME,
    FOREIGN KEY (게시글번호) REFERENCES 게시글(글번호) ON DELETE CASCADE,
    CONSTRAINT pk_댓글 PRIMARY KEY (댓글번호, 게시글번호)
  )
`;

	connection.query(
		createBoardQuery,
		(boardError, boardResults, boardFields) => {
			if (boardError) {
				console.error("Error creating table:", boardError);
				res.status(500).send("Error creating table");
			} else {
				console.log("테이블이 성공적으로 만들어졌습니다.");

				connection.query(
					createCommentQuery,
					(commentError, commentResults, commentFields) => {
						if (commentError) {
							console.error(
								"Error creating 댓글 table:",
								commentError
							);
							res.status(500).send("Error creating 댓글 table");
						} else {
							console.log(
								"댓글 태이블이 성공적으로 만들어졌습니다."
							);
							res.send("모든테이블이 성공적으로 만들어졌습니다.");
						}
					}
				);
			}
		}
	);
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

// 게시글 삭제하기
app.delete("/board/delete/:id", (req, res) => {
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
	const searchField = req.query.searchField;
	const searchText = req.query.searchText;

	let query = "";
	if (searchField === "제목+내용") {
		query = `SELECT * FROM 게시글 WHERE 글제목  LIKE '%${searchText}%' OR 글내용 LIKE '%${searchText}%'`;
	} else if (searchField === "작성자") {
		query = `SELECT * FROM 게시글 WHERE 작성자 LIKE '%${searchText}%'`;
	} else {
		query = `SELECT *
		FROM 게시글
		INNER JOIN 댓글 ON 게시글.글번호 = 댓글.게시글번호
		WHERE 댓글.내용 LIKE '%${searchText}%'`;
	}

	connection.query(query, (error, results) => {
		if (error) {
			console.log("Error executing search query:", error);
			res.status(500).send("Error searching for posts or comments");
		} else {
			res.send(results);
		}
	});
});

// 댓글 작성하기
app.post("/api/posts/comment", (req, res) => {
	const { idx, user, comment } = req.body;

	connection.query(
		"INSERT INTO 댓글 (게시글번호, 댓글작성자, 내용, 작성일) VALUES (?, ?, ?, NOW())",
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

// 댓글 삭제하기
app.delete("/comment/delete/:id", (req, res) => {
	const id = req.params.id;

	connection.query(
		"DELETE FROM 댓글 WHERE 댓글번호 = ?",
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
