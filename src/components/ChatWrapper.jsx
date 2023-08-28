import React, { useEffect, useState } from "react";

export default function ChatWrapper({ children }) {
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
    <div className="chat-widget" style={{ height }}>
      {children}
    </div>
  );
}
