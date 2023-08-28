import React from "react";

const Head = ({ assistant }) => {
  return (
    <div class="chat-widget__head">
      <div class="chat-widget__info">
        <span class="img">
          <img src={assistant.image} alt="image" />
        </span>
        <span class="chat-widget__role">
          <span class="widget-name">{assistant.name}</span>
          <span class="widget-role">{assistant.role}</span>
        </span>
      </div>
    </div>
  );
};

export default Head;
