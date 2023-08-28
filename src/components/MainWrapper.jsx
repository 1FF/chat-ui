import React from "react";

const MainWrapper = ({
  children,
  containerId,
}) => {
  return (
    <div id={containerId || "chatbot-container"} class="js-hider chat-container">
      {children}
    </div>
  );
};

export default MainWrapper;
