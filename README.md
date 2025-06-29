### About

Web app that lets you speak naturally to a PDF document, built using [Ultravox AI](https://ultravox.ai/) voice AI platform.

### Try it out
From /ultravox-doc-chat/
- run `npm install`
- run `npm run start` to start the frontend
- run `node server.js` to run the backend

### Structure
1. Frontend sends request for call to backend
2. Backend adds API keys to request and sends to Ultravox
3. Ultravox creates call url, sends to backend
4. Backend sends call url to frontend 
5. Frontend joins the call via call url
