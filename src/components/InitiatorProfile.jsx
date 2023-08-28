import React from 'react'

export default function InitiatorProfile({ assistant }) {
  return (
    <div class="chat-widget__initiator-profile">
      <span class="assistant-welcome">
        {assistant.welcome}
      </span>
      <span class="img">
        <img src={assistant.image} alt="image" />
      </span>
      <span class="w-start-profile">
        <div class="w-name">{assistant.name}</div>
        <div class="w-role">{assistant.role}</div>
      </span>
    </div>
  )
}
