
import React from 'react'

export default function MessagesWrapper({ children }) {
  return (
    <div class="chat-widget__messages" id="scroll-incrementor">
      <div class="chat-widget__messages-container" id="message-incrementor">
        {children}
      </div>
    </div>
  )
}