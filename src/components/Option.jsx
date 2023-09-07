import React from 'react'

const Option = ({ config }) => {
  return (
    config.link
      ? <a onClick={config.handler} href={config.link} >
        {config.content}
      </a>
      : <div onClick={config.handler} href={config.link} >
        {config.content}
      </div>
  )
}

export default Option