# Phone catalog
Phone Catalog - Modern Electronics Store Website

This project showcases a modern online store website designed to help users discover and purchase the latest phones, tablets, and accessories. The site provides detailed product specifications, comparison features, a dynamic catalog with filtering options, and an intuitive shopping experience.

---

# Live demo
[DEMO](https://viktorstupin.github.io/my-react-phone-catalog/)

---

# Figma  reference
[FIGMA](https://www.figma.com/file/BUusqCIMAWALqfBahnyIiH/Phone-catalog-(V2)-Original-Dark)

# Technologies used
Core
  React (v18.2.0) – UI framework
  TypeScript (v5.0.2) – Type safety
  SCSS (v7.0.3) – Styling

State Management
  Redux Toolkit (v1.9.5) – Application state
  Redux Persist (v6.0.0) – State persistence

UI/UX
  React Router (v6.14.2) – Navigation
  Swiper (v10.0.4) – Image galleries
  use-react-router-breadcrumbs (v4.0.1) – Navigation breadcrumbs
  React Loading Skeleton (v3.3.1) – Loading states

Development & Deployment
  Vite (v4.4.5) – Build tool
  ESLint (v8.45.0) – Code quality
  GitHub Pages – Hosting and deployment

---

# Getting started

Clone the repository:
  git clone https://github.com//ViktorStupin/my-react-phone-catalog.git
  cd my-react-phone-catalog

Install dependencies:
  npm install or yarn install

Run the project locally:
  npm start or yarn start

---

# Features

Responsive Design: Optimized for different screen sizes and devices, responses on width 320px, 640px, 1200px, 1440px,

Navigation: react-router-dom library is used in the application to enable navigation between multiple pages, and URL-based search parameters saved when navigating

Favorites & Cart: adding phones, tablets, and accessories to favorites or shopping cart, with total price calculation,

Product Filtering: Filter products by capacity and color inside product card.
Sorting: Sort products based on criterias: year, price, alphabetically.

Search: Filter products using query parameters.

Pagination: Navigate through large lists of products, opportunity to choose number of items per page, and number of pages depends on this.

Sticky Header: Keeps the header visible as you scroll.

Scroll to Top Button: Easily return to the top of the page.

Loader: Indicates loading status for a better user experience.
