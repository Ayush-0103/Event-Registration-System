# 📌 Event Attendance System  

Streamline your event management with **QR code-based registration and attendance tracking**.  
Experience **seamless check-ins** and **real-time analytics**.  

🔗 **Live Demo**: [Click here to try the app](https://event-registration-system-4ejh.vercel.app/)  

---

## ✨ Features  

- **Easy Registration** – Quick and simple event registration with instant QR code generation and email confirmations.  
- **QR Code Scanning** – Lightning-fast attendance marking with duplicate prevention.  
- **Real-time Tracking** – Monitor attendance live with a dashboard and instant notifications.  
- **Analytics & Reports** – Generate reports and export data in Excel, CSV, or JSON formats.  
- **Admin Dashboard** – Manage events, participants, and attendance in one place.  
- **Sample Data** – Populate the system with realistic sample data for testing and demos.  

---

## 🚀 Deployment  

This project is deployed on **Vercel**.  
You can access the live application here:  

🔗 **Live Link** → [https://event-registration-system-4ejh.vercel.app/](https://event-registration-system-4ejh.vercel.app/)  

---

## 🛠️ Environment Setup  

Follow these steps to run the project locally:  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/YOUR_USERNAME/event-attendance-system.git
cd event-attendance-system
2️⃣ Install Dependencies
bash
Copy code
npm install   # or yarn install
3️⃣ Set Environment Variables
Create a .env file in the root directory and add the following:

env
Copy code
DATABASE_URL=your_database_url
EMAIL_SERVICE_API_KEY=your_email_service_key
QR_SECRET_KEY=your_qr_secret
4️⃣ Run the Application
bash
Copy code
npm run dev   # for development
npm run build && npm start   # for production

📸 Screenshots / Demo

Feature	Screenshot
<img width="1887" height="892" alt="image" src="https://github.com/user-attachments/assets/bb2127e1-a377-41df-9fc4-0c39881e2a61" />

Registration Page
<img width="437" height="807" alt="image" src="https://github.com/user-attachments/assets/9a4e637c-5b29-4ebd-a3b0-182121d9c939" />

QR Code Generation
<img width="399" height="872" alt="image" src="https://github.com/user-attachments/assets/dfd4b633-83ec-4961-b1bb-8d922995f0be" />

Admin Dashboard
<img width="1618" height="809" alt="image" src="https://github.com/user-attachments/assets/b0e0a9f1-7e79-435b-9038-b790204fe1d9" />

Analytics & Reports
<img width="1570" height="852" alt="image" src="https://github.com/user-attachments/assets/c596a199-7d48-4dd9-a291-37ec69273df6" />


📊 Tech Stack
Frontend: React.js / Next.js / TailwindCSS

Backend: Node.js / Express

Database: MongoDB / PostgreSQL / MySQL

Deployment: Vercel

Other Tools: QR Code Generator, Email Service (e.g., Nodemailer, SendGrid)

🤝 Contributing
We welcome contributions! Please follow these steps:

Fork the repository

Create a new branch (feature-branch)

Commit your changes with clear messages

Open a pull request

📝 Commit Guidelines
Use clear and descriptive commit messages.

Example format:

vbnet
Copy code
feat: add QR code scanning feature
fix: resolve duplicate attendance issue
docs: update README with setup steps
