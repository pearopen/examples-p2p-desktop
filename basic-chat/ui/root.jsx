import { useState } from 'react'
import { createRoot } from 'react-dom/client'

import useWorker from './use-worker'

function App () {
  const { invite, messages, error, addMessage, clearError } = useWorker()

  const [input, setInput] = useState('')

  const onSend = () => {
    addMessage(input)
    setInput('')
  }

  return (
    <div className='bg-blue-500 min-h-screen p-4'>
      <div className='mb-2'>{`Invite: ${invite}`}</div>
      <div className='mb-4 flex'>
        <input
          type='text'
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='Type a message...'
          className='flex-1 p-2 border border-gray-300'
        />
        <button className='bg-white text-blue-500 px-4 py-2' onClick={onSend}>Send</button>
      </div>
      <div className='bg-white p-4'>
        <h2 className='text-lg font-bold mb-2'>Messages</h2>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx} className='border-b py-1'>{`${msg.text} ~ ${msg.info.name} ~ ${new Date(msg.info.at).toISOString()} ~ ${msg.id}`}</li>
          ))}
        </ul>
      </div>
      {error && (
        <div className='bg-red-500 text-white p-2 flex items-center justify-between'>
          <pre>{error}</pre>
          <button className='cursor-pointer' onClick={() => clearError()}>X</button>
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
