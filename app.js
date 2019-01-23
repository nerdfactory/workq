const app = new Vue({
  el: ".main",
  data: {
    query: "",
    results: [],
    pageSize: 3,
    endCursor: null,
    hasNextPage: null,
    errors: null
  },
  methods: {
    posts: function(first, after) {
       return fetch("http://localhost:4000/graphiql", {
        body: JSON.stringify({
          query: "query posts($pageSize: Int!, $endCursor: ID) { posts(first: $pageSize, after: $endCursor) { pageInfo { hasNextPage endCursor } edges { node { title url } } } }",
          variables: {pageSize: first, endCursor: after}
        }),
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
    },
    sub: function(event) {
      this.posts(this.pageSize, null)
      .then(response => response.json())
      .then((resp) => {
        console.log(resp);
        this.results = resp.data.posts.edges.map(edge => (edge.node));
        this.endCursor = resp.data.posts.pageInfo.endCursor;
        this.hasNextPage = resp.data.posts.pageInfo.hasNextPage;
        this.errors = null;
      })
      .catch((error) => {
        console.log(error)
        this.results = [];
        this.hasNextPage = null;
        this.errors = "Something went wrong!"
      })
      event.preventDefault();
    },
    next: function(event) {
      this.posts(this.pageSize, this.endCursor)
      .then(response => response.json())
      .then((resp) => {
        console.log(resp);
        this.results = this.results.concat(resp.data.posts.edges.map(edge => (edge.node)));
        this.endCursor = resp.data.posts.pageInfo.endCursor;
        this.hasNextPage = resp.data.posts.pageInfo.hasNextPage;
      })
      event.preventDefault();
    }
  },
  template: `
  <div class="main">
    <div class="search-form">
      <form action="#">
        <legend class="search-form__legend">Search for posts</legend>
        <input class="search-form__text" v-model="query" type="text" name="query" value="" placeholder="" disabled="disabled">
        <input class="search-form__button" v-on:click="sub" type="submit" value="Search" disabled="disabled" method="POST">
      </form>
    </div>
    <div class="search-results">
      <li v-for="result in results"><a :href="result.url" target="_blank">{{result.title}}</a></li>
      <a v-if="hasNextPage" v-on:click="next" href="#">load more</a>
    </div>
    <div v-if="errors" class="search-errors"><p>{{errors}}</p></div>
  </div>
  `
})
