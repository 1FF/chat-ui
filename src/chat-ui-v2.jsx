import React, { StrictMode } from "react";
import Chatbot from "../src/Chatbot.jsx";
import { createRoot } from 'react-dom/client';

const config = {
  url: 'https://chat-ws.test',
  assistantConfig: { ctaTextContent: 'goodbuy' },
  translations: { error: 'custom error tmsg', paymentLoaderTexts: [] },
};

const container = document.getElementById('chatbot-container');
const root = createRoot(container);
root.render(
  <StrictMode>
    <Chatbot config={config} />
  </StrictMode>
);


