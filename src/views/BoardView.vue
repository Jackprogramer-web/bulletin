<template>
  <div class="board">
    <header class="title__wrap">
      <h1 class="title">{{ title }}</h1>
      <h4 class="writer">
        {{ writer }}<span class="board__idx">({{ idx }})</span>
      </h4>
      <div class="date">{{ formatDate(date) }}</div>
    </header>

    <div class="delete"></div>
    <div class="text__wrap">
      <p class="text" v-html="text"></p>
      <div class="btn cursor delete" @click="deleteBoard()">글 삭제하기</div>
    </div>
    <section class="contents">
      <div class="comment__lists">
        <ul class="user__wrap">
          <h4 class="theme">작성자</h4>

          <li
            class="list user"
            :key="list.댓글번호"
            v-for="list in commentList"
          >
            {{ list.댓글작성자 }}
          </li>
        </ul>
        <ul class="comment__wrap">
          <h4 class="theme">댓글</h4>

          <li
            class="list comment"
            :key="list.댓글번호"
            v-for="list in commentList"
          >
            {{ list.내용 }}
          </li>
        </ul>
        <ul class="date__wrap">
          <h4 class="theme">작성일자</h4>

          <li
            class="list comment__date"
            :key="list.댓글번호"
            v-for="list in commentList"
          >
            {{ formatDate(list.작성일) }}
          </li>
        </ul>
        <ul class="comment__delete__wrap">
          <li
            class="list comment__delete cursor"
            :key="list.댓글번호"
            v-for="list in commentList"
            @click="commentDeleteChangeHandle(list.댓글번호)"
          >
            x
          </li>
        </ul>
      </div>
      <div class="comment__write">
        <h2>댓글입력</h2>
        <div class="input__box">
          <textarea
            placeholder="작성자"
            class="input input__writer"
            v-model="user"
          />
          <textarea
            placeholder="댓글 내용 적고 Enter"
            class="input input__comment"
            v-model="comment"
            @keyup.enter="commentAddChangeHandle()"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "boardView",
  components: {},
  props: {
    idx: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      title: "",
      text: "",
      writer: "",
      date: "",

      user: "",
      comment: null,
      commentList: {},
    };
  },
  setup() {},
  created() {
    this.getPostData();
    this.getComment();
  },
  mounted() {},
  unmounted() {},
  methods: {
    getPostData() {
      const idx = this.idx;
      axios
        .get(`http://localhost:4001/board/${idx}`)
        .then((response) => {
          this.title = response.data.글제목;
          this.text = response.data.글내용;
          this.writer = response.data.작성자;
          this.date = response.data.작성일;
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    deleteBoard() {
      const idx = this.idx;
      axios
        .delete(`http://localhost:4001/board/delete/${idx}`)
        .then((response) => {
          console.log(`댓글번호 ${idx}가 삭제되었습니다.`);
        })
        .catch(function (error) {
          console.log(error);
        });

      this.$router.push("/bulletin");
    },
    writeComment() {
      if (this.user === "") {
        this.user = "이름없음";
        console.log(this.user);
      }

      if (this.comment === "") {
        this.comment = "추천합니다";
      }

      const idx = this.idx;
      const user = this.user;
      const comment = this.comment;
      console.log(idx);

      return axios
        .post("http://localhost:4001/api/posts/comment", {
          idx,
          user,
          comment,
        })
        .then((response) => {
          console.log("댓글이 성공적으로 저장되었습니다");
        })
        .catch((error) => {
          console.log("오류발생", error);
        });
    },
    getComment() {
      const idx = this.idx;
      axios
        .get(`http://localhost:4001/comment/${idx}`)
        .then((response) => {
          this.commentList = response.data;
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    deleteComment(idx) {
      console.log(idx);
      return axios
        .delete(`http://localhost:4001/comment/delete/${idx}`)
        .then((response) => {
          console.log(`글번호 ${idx}가 삭제되었습니다.`);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    commentAddChangeHandle() {
      this.writeComment().then(() => {
        this.getComment();
      });
      this.comment = "";
      this.user = "";
    },
    commentDeleteChangeHandle(idx) {
      this.deleteComment(idx).then(() => {
        this.getComment();
      });
    },

    formatDate(date) {
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      };

      return new Date(date).toLocaleString("en-US", options);
    },
  },
};
</script>

<style scoped>
* {
  margin: 0px;
  border: 0px;
  box-sizing: border-box;
}

a {
  text-decoration: none;
}

ul,
li,
ol {
  list-style: none;
}

.board {
  top: 100px;
  width: 1200px;
  height: 2500px;
  position: relative;
  margin: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.board__idx {
  font-size: 12px;
  font-weight: 200;
  margin-left: 5px;
  color: #42b983;
}

/*title */
.title__wrap {
  position: absolute;
  top: 30px;
  left: 120px;
  width: 80%;
  height: 100px;
  text-align: left;
  border-bottom: 1px solid #b0b0b0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: left;
}

/**제목 */
.title {
  width: 100%;
  height: 100%;
  font-size: 30px;
}

/**작성자 */
.writer {
  font-size: 14px;
  margin: 0px 0px 5px 0px;
}

/**날짜 */
.date {
  font-size: 10px;
}

/** 본문내용*/
.text__wrap {
  position: absolute;
  padding: 0px;
  top: 150px;
  left: 120px;
  border: 1px solid #b0b0b0;
  width: 80%;
  height: 1000px;
  text-align: left;
  padding: 10px;
}

.text {
  width: 100%;
  height: 100%;
}

.date__wrap {
  position: absolute;
  right: 15px;
}

/**하단전체*/
.contents {
  position: relative;
  top: 1200px;
  left: -10px;
  width: 100%;
  height: auto;
  text-align: left;
  padding: 10px;
  border: 1px solid #b0b0b0;
}

.contents h6 {
  font-size: 15px;
  margin-bottom: 10px;
}

/**댓글리스트 */
.comment__lists {
  position: relative;
  min-height: 400px;
  height: auto;
  width: 100%;
  margin-bottom: 35px;
  margin: 0px 0px 100px 0px;
  overflow-y: scroll;
}

.comment__lists::-webkit-scrollbar {
  width: 0px;
}

/**댓글 리스트 틀  */
.user__wrap {
  position: absolute;
  left: 0px;
  width: 140px;
  height: 100%;
  padding: 0px;
}

.comment__wrap {
  position: absolute;
  width: 800px;
  height: 100%;
  left: 160px;
  padding: 0px;
}

/**댓글 자체 */
.list {
  height: 25px;
  position: relative;
  font-size: 15px;
  display: flex;
  align-items: center;
  padding-left: 5px;
}

.list::after {
  content: "";
  background: #42b983;
  width: 100%;
  height: 1px;
  position: absolute;
  bottom: 0;
  left: 0; /* 추가: 왼쪽 정렬 */
}

/*댓글 작성 */
.comment__write {
  width: 100%;
  height: 150px;
}

.input__box {
  position: relative;
  height: 100%;
}

.input {
  border: 1px solid #b0b0b0;
  padding: 10px;
  overflow: hidden;
}

.input__writer {
  position: absolute;
  width: 140px;
  height: 35px;
  top: 0px;
}

.input__comment {
  position: absolute;
  top: 0px;
  left: 160px;
  width: 800px;
  height: 100px;
}

/**버튼(삭제, 댓글등록) */
.btn {
  width: 80px;
  height: 35px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  border: 1px solid #b0b0b0;
}

.cursor {
  cursor: pointer;
}

.cursor:hover {
  color: #42b983;
}

.delete {
  margin-top: 15px;
  position: absolute;
  right: 0px;
  font-size: 12px;
  padding-top: 7px;
}

.comment__delete__wrap {
  position: absolute;
  top: 51px;
  right: 0px;
  padding: 0px;
}

.comment__delete {
  top: 0px;
}

.theme {
  margin: 10px 0px 20px;
  text-align: center;
}
</style>
