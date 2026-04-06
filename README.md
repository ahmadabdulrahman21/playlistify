🎵 Playlistify

Playlistify is a full-stack music streaming web application built with Next.js (App Router), React, and MongoDB.
The application fetches music from an external API, allows users to play tracks, and provides user account management with a clean and modern UI.

🚀 Features

🎧 Play music from an external music API

🔍 Browse and explore songs

👤 User authentication (login, change password, delete account)

✏️ Edit user profile

⚡ Backend powered by Next.js API routes

💾 MongoDB integration using Mongoose

🎨 Modular and responsive UI using CSS Modules

🛠 Tech Stack
Frontend

Next.js (App Router)

React

CSS Modules

Backend

Next.js API Routes

MongoDB

Mongoose

📂 Project Structure
```text
playlistify/
├── public/
│ └── images/
├── src/
│ ├── app/
│ │ ├── (auth)/
│ │ │ ├── login/
│ │ │ ├── change-password/
│ │ │ └── delete-user/
│ │ ├── api/
│ │ ├── components_footer/
│ │ ├── edit-profile/
│ │ ├── music/
│ │ ├── player/
│ │ ├── error.jsx
│ │ ├── layout.jsx
│ │ ├── loading.jsx
│ │ └── page.jsx
│ ├── lib/
│ │ └── mongodb.js
│ ├── models/
│ │ └── User.js
│ └── globals.css
├── .env.local
├── next.config.mjs
├── package.json
└── README.md
```


⚙️ Installation \& Setup
1️⃣ Clone the repository
git clone https://github.com/ahmadabdulrahman21/playlistify.git
cd playlistify

2️⃣ Install dependencies
```text
npm install
```
3️⃣ Environment Variables

Create a .env.local file in the root directory:

MONGODB\_URI=your\_mongodb\_connection\_string
MUSIC\_API\_KEY=your\_external\_music\_api\_key

4️⃣ Run the development server
```text
npm run dev
```


Open http://localhost:3000
in your browser.

🔌 API Routes

The backend is handled using Next.js API routes located in:

src/app/api/



These routes manage:

User authentication

Profile updates

Data fetching from the external music API

🎨 Styling

Scoped styling with CSS Modules

Global styles in globals.css

Dedicated .module.css files for each page and component

🧪 Error \& Loading Handling

loading.jsx for loading states	

error.jsx for graceful error handling

🌱 Future Improvements

🎶 Playlist creation \& favorites

🔐 JWT or NextAuth authentication

🌙 Dark mode

📊 Music recommendations

👤 Author

Ahmad Abbdulrahman
Frontend Developer

GitHub: https://github.com/ahmadabdulrahman21

