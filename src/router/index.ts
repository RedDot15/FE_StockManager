import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores/auth.store";

// Layouts
import DefaultLayout from "../layouts/DefaultLayout.vue";
import AuthLayout from "../layouts/AuthLayout.vue";

// Views
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import ProductList from "../views/ProductList.vue";
import VendorList from "../views/VendorList.vue";
import InvoiceList from "../views/InvoiceList.vue";
import StatsView from "../views/StatsView.vue";
import NotFound from "../views/NotFound.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/auth",
    component: AuthLayout,
    children: [{ path: "login", name: "LoginView", component: LoginView }],
  },
  {
    path: "/",
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/dashboard" },
      { path: "dashboard", name: "DashboardView", component: DashboardView },
      { path: "products", name: "ProductList", component: ProductList },
      { path: "vendors", name: "VendorList", component: VendorList },
      { path: "invoices", name: "InvoiceList", component: InvoiceList },
      {
        path: "statistics",
        name: "StatsView",
        component: StatsView,
        meta: { requiresAdmin: true },
      },
    ],
  },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Initialize auth state from localStorage if not already done
  if (
    (!authStore.accessToken && localStorage.getItem("accessToken")) ||
    (!authStore.user && localStorage.getItem("user")) ||
    (!authStore.refreshTokenValue && localStorage.getItem("refreshToken"))
  ) {
    authStore.initializeAuth();
  }

  const isAuthenticated = authStore.isAuthenticated;
  const isAdmin = authStore.isAdmin;

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  if (requiresAuth && !isAuthenticated) {
    next({ name: "LoginView" });
  } else if (requiresAdmin && !isAdmin) {
    // Redirect non-admins from admin pages
    next({ name: "DashboardView" });
  } else {
    next();
  }
});

export default router;
