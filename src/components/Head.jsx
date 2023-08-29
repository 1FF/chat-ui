import React from "react";

const Head = ({ assistant }) => {
  return (
    <div className="chat-widget__head">
      <div className="chat-widget__info">
        <span className="img">
          <img src={assistant.image} alt="image" />
        </span>
        <span className="chat-widget__role">
          <span className="widget-name">{assistant.name}</span>
          <span className="widget-role">{assistant.role}</span>
        </span>
      </div>
    </div>
  );
};

export default Head;
