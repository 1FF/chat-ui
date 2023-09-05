import React from 'react'

const MessagesWrapper = ({ children }) => {
  return (
    <div className="chat-widget__messages" id="scroll-incrementor">
      <div className="chat-widget__messages-container" id="message-incrementor">
        {children}
      </div>
    </div>
  )
}

export default MessagesWrapper;