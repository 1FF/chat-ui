import React from "react";
import Chatbot from "../src/Chatbot.jsx";
import { createRoot } from 'react-dom/client';

const container = document.getElementById('chatbot-container');
const root = createRoot(container); 
root.render(<Chatbot />);