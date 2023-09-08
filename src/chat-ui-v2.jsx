import React, { StrictMode } from "react";
import Chatbot from "../src/Chatbot.jsx";
import { createRoot } from 'react-dom/client';
import { assistant } from "./lib/config/assistant.js";

const config = {
  url: 'https://chat-ws.test',
  assistantConfig: {
    ...assistant,
    ctaTextContent: 'goodbuy',
  },
  translations: {
    tm1224: 'Your payment is in progress',
    error: 'custom error tmsg',
    paymentLoaderTexts: ['processing', 'processing', 'processing', 'processing', 'processing', 'processing', 'processing 3'],
    ctaTextContent: 'Pay now'
  },
  theme: 'dark'
};

const container = document.getElementById('chatbot-container');
const root = createRoot(container);
root.render(
  <StrictMode>
    <Chatbot config={config} />
  </StrictMode>
);