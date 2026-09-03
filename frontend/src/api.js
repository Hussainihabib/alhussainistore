// import axios from "axios";

// const api = axios.create({
//   baseURL:
//     import.meta.env.VITE_API_URL ||
//     "http://localhost:5000/api",
// });

// api.interceptors.request.use((config) => {
//   const url = config.url || "";
//   const method = (
//     config.method || "get"
//   ).toLowerCase();

//   const customerToken =
//     localStorage.getItem(
//       "ahg_customer_token"
//     );

//   const adminToken =
//     localStorage.getItem(
//       "ahg_admin_token"
//     );

//   const isAdminPage =
//     window.location.pathname.startsWith(
//       "/admin"
//     );

//   /*
//     ADMIN AUTH
//   */
//   if (
//     url.startsWith("/auth/admin/")
//   ) {
//     if (adminToken) {
//       config.headers.Authorization =
//         `Bearer ${adminToken}`;
//     }

//     return config;
//   }

//   /*
//     CUSTOMER AUTH
//   */
//   if (
//     url === "/auth/me" ||
//     url.startsWith("/auth/profile") ||
//     url.startsWith(
//       "/auth/addresses"
//     )
//   ) {
//     if (customerToken) {
//       config.headers.Authorization =
//         `Bearer ${customerToken}`;
//     }

//     return config;
//   }

//   /*
//     CUSTOMER ORDERS
//     These MUST always use customer token.
//   */
//   if (
//     url === "/orders/my" ||
//     url.startsWith("/orders/my/")
//   ) {
//     if (customerToken) {
//       config.headers.Authorization =
//         `Bearer ${customerToken}`;
//     }

//     return config;
//   }

//   /*
//     CUSTOMER ORDER CREATION
//   */
//   if (
//     url === "/orders" &&
//     method === "post"
//   ) {
//     if (customerToken) {
//       config.headers.Authorization =
//         `Bearer ${customerToken}`;
//     }

//     return config;
//   }

//   /*
//     ADMIN ORDER MANAGEMENT
//   */
//   if (
//     (url === "/orders" &&
//       method === "get") ||
//     (url.startsWith("/orders/") &&
//       !url.startsWith(
//         "/orders/my"
//       ))
//   ) {
//     if (adminToken) {
//       config.headers.Authorization =
//         `Bearer ${adminToken}`;
//     }

//     return config;
//   }

//   /*
//     ADMIN APIs
//   */
//   if (url.startsWith("/admin")) {
//     if (adminToken) {
//       config.headers.Authorization =
//         `Bearer ${adminToken}`;
//     }

//     return config;
//   }

//   /*
//     ADMIN PRODUCT / CATEGORY /
//     UPLOAD WRITE REQUESTS
//   */
//   const isAdminWrite =
//     isAdminPage &&
//     [
//       "post",
//       "patch",
//       "put",
//       "delete",
//     ].includes(method) &&
//     (
//       url.startsWith("/products") ||
//       url.startsWith("/categories") ||
//       url.startsWith("/upload")
//     );

//   if (isAdminWrite) {
//     if (adminToken) {
//       config.headers.Authorization =
//         `Bearer ${adminToken}`;
//     }

//     return config;
//   }

//   /*
//     DEFAULT CUSTOMER TOKEN
//   */
//   if (customerToken) {
//     config.headers.Authorization =
//       `Bearer ${customerToken}`;
//   }

//   return config;
// });

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================================
   REQUEST INTERCEPTOR
========================================= */

api.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    const method = (
      config.method || "get"
    ).toLowerCase();

    const customerToken =
      localStorage.getItem(
        "ahg_customer_token"
      );

    const adminToken =
      localStorage.getItem(
        "ahg_admin_token"
      );

    const isAdminPage =
      window.location.pathname.startsWith(
        "/admin"
      );

    /* =========================================
       ADMIN AUTH
    ========================================= */

    if (
      url.startsWith("/auth/admin/")
    ) {
      if (adminToken) {
        config.headers.Authorization =
          `Bearer ${adminToken}`;
      }

      return config;
    }

    /* =========================================
       CUSTOMER AUTH
    ========================================= */

    if (
      url === "/auth/me" ||
      url.startsWith("/auth/profile") ||
      url.startsWith("/auth/addresses")
    ) {
      if (customerToken) {
        config.headers.Authorization =
          `Bearer ${customerToken}`;
      }

      return config;
    }

    /* =========================================
       CUSTOMER ORDERS
    ========================================= */

    if (
      url === "/orders/my" ||
      url.startsWith("/orders/my/")
    ) {
      if (customerToken) {
        config.headers.Authorization =
          `Bearer ${customerToken}`;
      }

      return config;
    }

    /* =========================================
       CUSTOMER ORDER CREATION
    ========================================= */

    if (
      url === "/orders" &&
      method === "post"
    ) {
      if (customerToken) {
        config.headers.Authorization =
          `Bearer ${customerToken}`;
      }

      return config;
    }

    /* =========================================
       ADMIN ORDER MANAGEMENT
    ========================================= */

    if (
      (
        url === "/orders" &&
        method === "get"
      ) ||
      (
        url.startsWith("/orders/") &&
        !url.startsWith("/orders/my")
      )
    ) {
      if (adminToken) {
        config.headers.Authorization =
          `Bearer ${adminToken}`;
      }

      return config;
    }

    /* =========================================
       ADMIN ROUTES
    ========================================= */

    if (
      url.startsWith("/admin")
    ) {
      if (adminToken) {
        config.headers.Authorization =
          `Bearer ${adminToken}`;
      }

      return config;
    }

    /* =========================================
       ADMIN PRODUCT / CATEGORY / UPLOAD
       WRITE REQUESTS
    ========================================= */

    const isAdminWrite =
      isAdminPage &&
      [
        "post",
        "patch",
        "put",
        "delete",
      ].includes(method) &&
      (
        url.startsWith("/products") ||
        url.startsWith("/categories") ||
        url.startsWith("/upload")
      );

    if (isAdminWrite) {
      if (adminToken) {
        config.headers.Authorization =
          `Bearer ${adminToken}`;
      }

      return config;
    }

    /* =========================================
       DEFAULT CUSTOMER TOKEN
    ========================================= */

    if (customerToken) {
      config.headers.Authorization =
        `Bearer ${customerToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================
   RESPONSE INTERCEPTOR
========================================= */

api.interceptors.response.use(
  (response) => response,

  (error) => {
    console.error(
      "API Error:",
      error.response?.data ||
      error.message
    );

    return Promise.reject(error);
  }
);

export default api;