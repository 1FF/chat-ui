import React, { useEffect, useState } from "react";

const ChatWrapper = ({ children, shouldShowChat }) => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const setInitialHeight = () => {
      setHeight(window.innerHeight);
    };

    setInitialHeight();
    return () => {
      window.removeEventListener("resize", setInitialHeight);
    };
  }, []);
  
  return (
    <div className={`chat-widget ${shouldShowChat ? '' : 'hidden'}`} style={{ height }}>
      {children}
    </div>
  )
}

export default ChatWrapper;