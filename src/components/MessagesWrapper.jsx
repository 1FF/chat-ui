
import React from 'react'

export default function MessagesWrapper({ children }) {
  return (
    <div className="chat-widget__messages" id="scroll-incrementor">
      <div className="chat-widget__messages-container" id="message-incrementor">
        {children}
      </div>
    </div>
  )
}