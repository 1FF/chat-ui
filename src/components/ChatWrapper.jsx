import React, { useEffect, useState } from "react";

const ChatWrapper = ({ children, theme }) => {
  const [height, setHeight] = useState('100%');

  useEffect(() => {
    setHeight(window.innerHeight);
  }, []);

  return (
    <div className={`chat-widget ${theme}`} style={{ height }}>
      {children}
    </div>
  )
}

export default ChatWrapper;