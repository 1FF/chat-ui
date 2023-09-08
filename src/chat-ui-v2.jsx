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

window.backEndVars = {};
backEndVars.tm566 =  '<div>Billed every <span class="js-duration">1</span> month(s)</div>';

localStorage.setItem('__pd', '{"amount":"19.90","amountInUSD":19.9,"upfrontAmount":null,"currency":"USD","trial_in_days":0,"period":"M","frequency":1,"frequencyInMonths":1,"billingOptionType":"subscription","planId":"9412109c-9639-4ab9-b406-419e46d58a1c","provider":"primer","isDisplayPricePlan":true,"displayPlanPrice":"$19.90","purchasable_uuid":"0e769afd-6a7a-4ddc-8455-dbdc18a11a1d","customer_uuid":"0161d4a4-dfee-4cec-9971-847593bda27f","purchasable_type":"meal-plan-and-vip-content"}')

const container = document.getElementById('chatbot-container');
const root = createRoot(container);
root.render(
  <StrictMode>
    <Chatbot config={config} />
  </StrictMode>
);