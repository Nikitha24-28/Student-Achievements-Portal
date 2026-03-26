# Student Achievement Portal

A full-stack web application designed to manage and track student achievements efficiently. The system enables students to submit event participation details while providing admins with tools to verify, manage, and analyze student performance.

---

## Overview

The Student Achievement Portal is built to streamline the process of recording and managing student achievements in a centralized platform.

It allows:
- Students to submit and track their achievements  
- Admins to verify and manage submissions  
- Institutions to maintain structured achievement records  

Such systems improve transparency, organization, and accessibility of student data in academic environments.

---

## Problem Statement

Managing student achievements manually leads to:
- Data redundancy and inconsistency  
- Lack of centralized records  
- Time-consuming verification processes  
- Difficulty in tracking student progress  

This project solves these issues by providing a **digital, role-based management system**.

---

## Features

### Student Features
- View all available/verified events  
- Submit event participation details  
- Update event summaries  
- View personal achievement history  

### Admin Features
- Approve / reject event submissions  
- View all student data and achievements  
- Filter records based on criteria  
- Manage and monitor system data  

### Core Functionalities
- Role-based access control  
- CRUD operations for events and achievements  
- Real-time data fetching via APIs  
- Structured relational database management  

---

## System Architecture

Frontend (React)
↓
Backend (Node.js + Express APIs)
↓
Database (MySQL)


### Workflow:
1. User interacts with React UI  
2. Requests are sent to Express APIs  
3. Backend processes logic  
4. Data is stored/retrieved from MySQL  
5. Response is displayed on frontend  

---

## Tech Stack

### Frontend
- React.js  
- HTML, CSS, JavaScript  
- Axios (for API calls)

### Backend
- Node.js  
- Express.js  

### Database
- MySQL (Relational Database)

---

## 📊 Database Design

- **student** → Stores student details  
- **login_info** → Stores authentication and user roles  
- **events** → Stores event details  
- **event_registrations** → Tracks student registrations for events  
- **event_history** → Stores completed events and student submissions
 
---

## 📁 Project Structure
Student-Achievements-Portal/                                                                       
│── frontend/ # React application                                                                     
│── backend/ # Node + Express server                                                              
│── routes/ # API routes                                                          
│── controllers/ # Business logic                                                               
│── models/ # Database queries                                                                 
│── config/ # DB configuration                                                            
│── package.json                                                                           
│── README.md                                                            


---

## ▶️ How to Run

### 1. Clone the repository
```bash
git clone https://github.com/Nikitha24-28/Student-Achievements-Portal.git
cd Student-Achievements-Portal
```

# Set up Backend 
```bash 
cd backend
npm install
npm start
```
Configure MySQL connection in .env or config file
Create required database and tables

# Set up Frontend 
```bash 
cd frontend
npm install
npm run dev
```

Future Improvements                                                   
📥 Export student data as reports (PDF/Excel)                                                            
📊 Dashboard analytics (charts & insights)                                                                
🔐 JWT-based authentication                                                                        
🌐 Deployment on cloud (AWS / Vercel)                                                                   
📱 Mobile-friendly UI                                                                            

💡 Key Learnings                                                                          
Building full-stack applications using MERN-like architecture (without MongoDB)                                                                  
Designing relational databases using MySQL                                                                     
Creating RESTful APIs with Express                                                           
Handling real-world data workflows (submission → approval → storage)                                                             
Managing role-based access systems                                                         
 

🤝 Contributing                                         
Contributions are welcome! Feel free to fork and enhance the project.
