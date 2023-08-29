import React from 'react'
import { extractStringWithBrackets, replaceLinksWithAnchors, replaceStringInCurlyBracketsWithStrong } from '../lib/helpers';


// additional logic for:
// - handling hidden resend icon
// - modifying the messages from the assistant
// - returning the extracted string we must escape this behavior

export default function MessageBubble({ content, isAssistant = true }) {
  const { extractedString, updatedMessage } = extractStringWithBrackets(content);

  return (
    isAssistant
      ? <span className="assistant js-assistant">
        <span className="js-assistant-message">
          {replaceLinksWithAnchors(replaceStringInCurlyBracketsWithStrong(updatedMessage))}
        </span>
      </span>
      : <span className="user js-user">
        {content}
        <span className="resend-icon hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0V0z" />
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
        </span>
      </span>
  )
}
