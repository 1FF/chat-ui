import React, { useEffect, useState } from "react";

const ChatWrapper = ({ children }) => {
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    setHeight(window.innerHeight);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="chat-widget" style={{ height }}>
      {children}
    </div>
  );
};

export default ChatWrapper;
