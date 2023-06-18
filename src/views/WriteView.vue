<template>
  <div class="write">
    <main class="board">
      <textarea
        v-model="writer"
        class="writer"
        maxlength="11"
        placeholder="작성자"
      ></textarea>
      <textarea
        v-model="title"
        class="title"
        maxlength="50"
        placeholder="글제목"
      ></textarea>
      <textarea v-model="text" class="field"></textarea>
      <div @click="savePost()" class="btn submit">글쓰기</div>
    </main>
  </div>
</template>

<script>
import axios from "axios";

export default {
  components: {},
  data() {
    return {
      title: "",
      text: "",
      writer: "",
    };
  },
  setup() {},
  created() {},
  mounted() {},
  unmounted() {},
  methods: {
    savePost() {
      //줄바꿈 처리 지정

      if (!this.title) {
        this.title = "제목없음";
      }

      if (this.text === "") {
        this.text = "내용이 입력되지 않았습니다";
      }

      if (!this.writer) {
        this.writer = "이름없음";
      }

      const processedText = this.text.replace(/\n/g, "<br>");

      axios
        .post("http://localhost:4001/api/posts/board", {
          title: this.title,
          text: processedText,
          writer: this.writer,
        })
        .then((response) => {
          console.log("글이 성공적으로 저장되었습니다");
        })
        .catch((error) => {
          console.log("오류발생", error);
        });

      this.$router.push("/bulletin");
    },
  },
};
</script>

<style scoped>
* {
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
}

a {
  text-decoration: none;
}

ul,
ol,
li {
  list-style: none;
}

.write {
  width: 1400px;
  height: 800px;
  margin: auto;
  position: relative;
  padding: 15px;
}

.board {
  position: absolute;
  width: 1150px;
  height: auto;
  left: 100px;
  top: 70px;
  padding: 10px;
}

/**작성자 */
.writer {
  border: 1px solid #42b983;
  position: absolute;
  top: -40px;
  height: 35px;
  padding: 10px;
  width: 200px;
  overflow: hidden;
}

/**제목 */
.title {
  border: 1px solid #b0b0b0;
  display: inline-block;
  width: 80%;
  height: 35px;
  margin-bottom: 10px;
  padding: 10px;
  overflow: hidden;
}

.field {
  border: 1px solid #b0b0b0;
  display: inline-block;
  width: 80%;
  height: 500px;
  padding: 10px;
}

/*btn*/
.btn {
  width: 80px;
  height: 35px;
  display: inline-block;
  font-size: 12px;
  text-align: center;
  vertical-align: middle;
  border: 1px solid #b0b0b0;
  cursor: pointer;
}

.submit {
  border: 1px solid #b0b0b0;
  position: absolute;
  bottom: -30px;
  right: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
