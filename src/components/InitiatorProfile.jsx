import React from 'react'

export default function InitiatorProfile({ assistant }) {
  return (
    <div className="chat-widget__initiator-profile">
      <span className="assistant-welcome">
        {assistant.welcome}
      </span>
      <span className="img">
        <img src={assistant.image} alt="image" />
      </span>
      <span className="w-start-profile">
        <div className="w-name">{assistant.name}</div>
        <div className="w-role">{assistant.role}</div>
      </span>
    </div>
  )
}
