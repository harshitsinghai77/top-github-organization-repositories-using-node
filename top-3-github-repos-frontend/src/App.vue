<template>
  <main id="app">
    <div class="query">
      <div class="wrapper queryform">
        <h2 class="title-heading">
          Top 10 repositories of an organisation in Github by stars.
        </h2>

        <a-input-search
          size="large"
          placeholder="Enter organization"
          v-model="query"
          @search="onSearch"
          enterButton
        />
        <a-row v-if="noDataFound" :gutter="16">
          <div v-for="(a, index) in repositories" :key="index">
            <a-col :span="8">
              <div class="repo-cards">
                <a-card v-bind:loading="loading" v-bind:title="a.name">
                  Stars: {{ a.stars }}
                </a-card>
              </div>
            </a-col>
          </div>
        </a-row>
        <div v-else class="not-found">
          <h1 class="title">
            Oh no 😢. No repositories found. Make sure you're finding
            organizations repositories and not personal repositories
          </h1>
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="sass">
@import url('https://fonts.googleapis.com/css?family=Roboto')
@import "App.sass"
</style>

<script>
import axios from "axios";

export default {
  name: "app",
  data: function () {
    return {
      repositories: [],
      query: "",
      noDataFound: true,
      loading: false,
    };
  },

  methods: {
    onSearch(value) {
      this.loading = true;
      this.noDataFound = true;
      this.repositories = [0, 1, 2];
      axios
        .get("https://app-webase.herokuapp.com/repos", {
          params: {
            org: value,
          },
        })
        .then((res) => {
          const { status, results } = res.data;
          if (status) {
            this.repositories = results;
            this.query = "";
            this.loading = false;
          } else {
            this.noDataFound = false;
            this.loading = false;
          }
        });
    },
  },
};
</script>
