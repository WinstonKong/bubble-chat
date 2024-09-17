# Bubble Chat

This repository holds the source code for the frontend of a real-time chat application.

- The backend repository is [bubble-chat-server](https://github.com/WinstonKong/bubble-chat-server).

## Features

- **Real-time messaging**
- **Group chats**
- **Add Friends**

## Technology Stack

- **Next.js**
- **React.js**
- **Tailwind CSS**
- **Socket.IO**
- **Auth.js**

## Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/WinstonKong/bubble-chat.git
   ```

2. **Install dependencies:**

   ```bash
   cd bubble-chat
   pnpm install
   ```

3. **Configuration:**

   Create a file named `.env` from the `.env.example` file and add any required configuration variables.

4. **Build and Run the Development Server:**

   ```bash
   pnpm run dev
   ```

## Usage

Once you run `pnpm run dev`, the Bubble Chat frontend will be accessible in your web browser.

For full functionality, including real-time features and interaction with other users, you'll also need to run the companion backend server, [bubble-chat-server](https://github.com/WinstonKong/bubble-chat-server).

## License

[GPL](LICENSE)
