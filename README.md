# 🛒 eComm — Full Stack E-Commerce App

A fully functional e-commerce application built with **Spring Boot**, **React**, **MySQL**, and **Razorpay**.  
Supports user authentication (custom + Google OAuth2), product listings, cart, checkout, order history, and admin management.

## ✨ Features

- 🔐 User Registration & Login (Custom + Google OAuth2)
- 📦 Product Management (Add, Update, Delete – Admin)
- 🛍️ Cart & Checkout with Razorpay Integration
- 📃 Order Management & History
- 🔒 JWT Authentication with Cookie-based storage
- 🧠 AI-based product description generation using Spring AI
- 📤 Forgot Password & Reset with token link
- 📋 Admin Dashboard (Product & Order Oversight)

---

## ⚙️ Tech Stack
------------------------------------------------------------
| Layer        | Tech                                       |
|--------------|--------------------------------------------|
| Frontend     | React, Axios, React Router                 |
| Backend      | Spring Boot 3, Spring Security, OAuth2, JWT|
| AI           | Spring AI (Gemini 2.0 Flash integration)   |     
| Payment      | Razorpay REST API                          |  
| Database     | MySQL (with JPA/Hibernate)                 |
| Deployment   | Render (backend hosting),                  | 
|              | Vercel(frontend)                           |
|              | Aiven(database)                            |
-------------------------------------------------------------
---

## 🚀 Setup Instructions

### 🔧 Backend (Spring Boot)

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

### 🌐 Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### 🔐 Auth & Security
- Custom JWT-based login stores token in HttpOnly cookies

- Google OAuth2 login support (via Spring Security OAuth)

- Role-based access control for protected routes

- All requests secured via filters and token validation

### 💸 Payments
- Integrated with Razorpay REST API

- Backend creates and verifies orders

- Webhook endpoint for payment confirmation

- Payment status stored in Order entity

### 🧠 AI Integration
- Used for generating product descriptions automatically

- Uses Spring AI to connect with OpenAI (ChatGPT API)

- Sends prompt based on product name and category

### Contributing
Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.​




