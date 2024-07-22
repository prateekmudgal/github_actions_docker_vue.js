<template>
  <div id="app">
    <h1>{{ message }}</h1>
    <p>{{ backendMessage }}</p>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      message: 'Welcome to Vue.js Frontend!',
      backendMessage: ''
    };
  },
  mounted() {
    // Fetch data from backend
    fetch('http://localhost:3000/api/data')
      .then(response => response.json())
      .then(data => {
        this.backendMessage = data.message;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }
};
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 20px;
}
</style>
