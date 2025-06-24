import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./index.css";
import { setupAxiosInterceptors } from "./services/api";

// Setup Axios interceptors to handle auth tokens
setupAxiosInterceptors();

const app = createApp(App);
app.use(createPinia());
app.use(router);

app.mount("#app");
