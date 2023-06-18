<template>
  <div class="bulletin">
    <header>
      <div class="search__wrap">
        <select
          class="search__field"
          v-model="searchField"
          @change="handleSearch()"
        >
          <option value="제목+내용">제목+내용</option>
          <option value="작성자">작성자</option>
          <option value="댓글">댓글내용</option>
        </select>
        <input
          type="text"
          placeholder="검색"
          class="search"
          v-model="searchText"
          @keyup.enter="getSearch()"
        />
      </div>
      <div class="btn__write__wrap">
        <div class="btn write" @click="goToWrite()">글쓰기</div>
      </div>
    </header>

    <main>
      <h2>전체 게시글</h2>
      <select class="page cursor" v-model="pageSize" @change="handlePageData">
        <option value="10">10개씩 보기</option>
        <option value="30">30개씩 보기</option>
        <option value="50">50개씩 보기</option>
      </select>
      <section class="board__wrap">
        <ul class="board__list">
          <h4 class="theme">글제목</h4>
          <li
            class="board cursor"
            :key="list.글번호"
            v-for="list in bulletinLists"
          >
            <div @click="postId(list.글번호)">{{ list.글제목 }}</div>
          </li>
        </ul>
        <ul class="board__writer">
          <h4 class="theme">작성자</h4>

          <li
            class="board writer"
            :key="list.글번호"
            v-for="list in bulletinLists"
          >
            {{ list.작성자 }}
          </li>
        </ul>
        <ul class="board__date">
          <h4 class="theme">작성일자</h4>

          <li
            class="board date"
            :key="list.글번호"
            v-for="list in bulletinLists"
          >
            {{ formatDate(list.작성일) }}
          </li>
        </ul>
      </section>

      <div class="pagingbox">
        <ul class="page__wrap">
          <li
            class="allPage cursor"
            v-for="page in pageList"
            :key="page"
            @click="pageChange(page)"
            :class="{ on: currentPage === page }"
          >
            {{ page }}
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "BulletinView",
  components: {},
  data() {
    return {
      bulletinLists: {},
      bulletinNum: 0,
      pageSize: "10",
      pageNum: "1",

      searchField: "제목+내용",

      currentPage: 1,
      pageList: [],

      idx: "",
      searchText: "",
    };
  },
  setup() {},
  created() {
    this.makeTotlaPage();
    this.getData();
  },
  mounted() {},
  unmounted() {},
  methods: {
    makeTotlaPage() {
      let pageSize = this.pageSize;

      axios
        .get("http://localhost:4001/totalPage", {
          params: {
            pageSize: pageSize,
          },
        })
        .then((response) => {
          let pageSet = response.data;

          console.log(this.pageList.length);
          if (this.pageList.length > 0) {
            this.pageList = [];
          }

          for (let i = 0; i < pageSet; i++) {
            this.pageList.push(i + 1);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    },

    getData() {
      const vm = this;
      let pageSize = vm.pageSize;
      let pageNum = vm.pageNum;

      axios
        .get("http://localhost:4001/board", {
          params: {
            pageSize: pageSize,
            pageNum: pageNum,
          },
        })
        .then(function (response) {
          vm.bulletinLists = response.data;
          console.log(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    handlePageData() {
      this.makeTotlaPage();
      this.getData();
    },
    pageChange(page) {
      this.currentPage = page;
      this.pageNum = page;
      this.getData();
      console.log("click");
      console.log(this.pageNum);
    },

    /*
    goToPage(pageNumber) {
      this.currentPage = pageNumber;
      this.getData();
    },*/
    goToWrite() {
      this.$router.push("/write");
    },
    postId(idx) {
      const vm = this;

      vm.$router.push({
        name: "board",
        params: { idx },
      });
    },
    getSearch() {
      const searchField = this.searchField;
      const searchText = this.searchText;

      axios
        .get("http://localhost:4001/search", {
          params: {
            searchField,
            searchText,
          },
        })
        .then((response) => {
          this.bulletinLists = response.data;
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    handleSearch() {
      return;
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

.bulletin {
  top: 0px;
  width: 1200px;
  height: 1400px;
  position: relative;
  margin: auto;
  padding: 15px;
}

/*header*/
header {
  display: flex;
}

/*search*/
.search__wrap {
  width: 70%;
  height: 70px;
  display: flex;
  align-items: center;
}

.search {
  width: 100%;
  height: 35px;
  border: 1px solid #b0b0b0;
}

/*btn*/
.btn {
  display: inline-block;
  width: 100px;
  height: 35px;
  border: 1px solid #b0b0b0;
  cursor: pointer;
}

/*글쓰기 기능*/
.btn__write__wrap {
  position: absolute;
  top: 30px;
  right: 30px;
  width: 80px;
  height: 60px;
}

.write {
  border: 1px solid #b0b0b0;
  width: 80px;
  height: 30px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

/*페이징 기능*/
.page {
  border: 1px solid #b0b0b0;
  width: 120px;
  height: 25px;
  position: absolute;
  right: 10px;
  top: 10px;
}

main {
  height: auto;
  position: relative;
  min-height: 600px;
}

main h2 {
  position: absolute;
  top: 0px;
}

/*게시글 공통옵션 */

/**board */
.board {
  height: 25px;
  padding: 3px;
  text-align: left;
  margin: 10px;
  left: 0px;
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  border-bottom: 1px solid #42b983;
}

/**게시글 위치 */
.board__wrap {
  position: relative;
  top: 50px;
  border: 2px solid #b0b0b0;
  width: 100%;
  height: auto;
  padding: 0px;
}

/**작성자 위치 */
.board__writer {
  position: absolute;
  width: 100px;
  padding: 0px;
  top: 0px;
}

.board__list {
  position: relative;
  width: 800px;
  left: 100px;
  padding: 0px;
}

/*날짜 위치*/
.board__date {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 265px;
  padding: 0px;
}

.date {
  display: flex;
  align-items: center;
  justify-content: center;
}

/*페이지 박스 */
.pagingbox {
  position: relative;
  height: 20px;
  width: 100%;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px;
}

.page__wrap {
  width: 100%;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.allPage {
  font-size: 13px;
  text-align: center;
  margin-right: 10px;
}

.on {
  font-weight: bold;
  color: #42b983;
}

.cursor {
  cursor: pointer;
}

.search__field {
  border: 1px solid #b0b0b0;
  margin-right: 10px;
  height: 35px;
  width: 110px;
  padding: 3px;
}

.theme {
  margin: 10px 0px 15px 0px;
}
</style>
