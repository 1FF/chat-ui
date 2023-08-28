import React from 'react';
import MainWrapper from './components/MainWrapper';
import ChatWrapper from './components/MainWrapper';
import "./styles/index.css";

const assistant = {
  name: 'Emily Fitzgerald',
  position: 'Lead Nutrition Expert, PhD',
}

const Chatbot = (props) => {
  return (
    <MainWrapper>
      <ChatWrapper>
        <header className="w-full bg-head px-4 py-[14px] flex items-start justify-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 12H4M4 12L10 6M4 12L10 18" stroke="var(--head-title)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <span className="w-5 h-[40px]">
            <img src="https://storage.1forfit.com/4oZrkOwbOQcSIGJopBG5qsf0CmBbVDKDqflzEkXq.jpg" alt="assistant-profile" />
          </span>

          <div>
            <h3 className="text-head-title">{assistant.name}</h3>
            <p className="text-head-subtitle">{assistant.position}</p>
          </div>
        </header>

      </ChatWrapper>
    </MainWrapper>
  );
};

export default Chatbot;
