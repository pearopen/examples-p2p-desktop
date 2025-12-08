import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Runtime from 'pear-electron'

import useWorker from './use-worker'

function App () {
  const { invite, messages, videos, error, addMessage, addVideo, clearError } = useWorker()

  const [input, setInput] = useState('')
  const [playerId, setPlayerId] = useState()

  const handleDrop = (e) => {
    e.preventDefault()
    onAddFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleSelect = (e) => {
    for (const file of e.target.files) {
      const filePath = Runtime.media.getPathForFile(file)
      addVideo(filePath)
    }
  }

  const onAddFiles = (files) => {
    for (const file of files) {
      const filePath = Runtime.media.getPathForFile(file)
      addVideo(filePath)
    }
  }

  const onSend = (videoId) => {
    addMessage({ text: input, info: { videoId } })
    setInput('')
  }

  return (
    <div className='bg-blue-500 min-h-screen p-4'>
      {error && (
        <div className='bg-red-500 text-white p-2 flex items-center justify-between'>
          <pre>{error}</pre>
          <button className='cursor-pointer' onClick={() => clearError()}>X</button>
        </div>
      )}
      <div className='mb-2 wrap-anywhere'>{`Invite: ${invite}`}</div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className='border-2 border-dashed border-blue-500 p-2 mb-6 bg-white text-center'
      >
        <p>Drag and drop files here, or click to select</p>
        <input
          type='file'
          multiple
          className='hidden'
          id='fileInput'
          onChange={handleSelect}
        />
        <label htmlFor='fileInput' className='cursor-pointer text-blue-500 underline'>Browse files</label>
      </div>
      <div className='bg-white p-4 mb-4'>
        <h2 className='text-lg font-bold mb-2'>Videos</h2>
        <ul>
          {videos.map((video) => {
            const comments = messages.filter(msg => msg.info.videoId === video.id)
            return (
              <li key={video.id}>
                <div key={video.id} className='border-b py-1 flex items-center gap-1'>
                  <span className='flex-1'>{video.name}</span>
                  <button
                    className='bg-blue-500 text-white p-2'
                    onClick={() => {
                      setPlayerId(prev => prev === video.id ? undefined : video.id)
                    }}
                  >
                    {playerId === video.id ? 'Stop' : 'Play'}
                  </button>
                </div>
                {playerId === video.id && (
                  <>
                    <video className='mb-2 w-full' controls src={video.link} autoPlay />
                    <div className='mb-2 flex'>
                      <input
                        type='text'
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder='Type a comment...'
                        className='flex-1 p-2 border border-gray-300'
                      />
                      <button className='bg-white text-blue-500 px-4' onClick={() => onSend(video.id)}>Send</button>
                    </div>
                    <div className='border-b bg-white mb-4'>
                      <h2 className='font-bold'>Comments ({comments.length})</h2>
                      <ul>
                        {comments.map((msg, idx) => (
                          <li key={idx} className='border-b py-1'>{`${msg.text} ~ ${msg.info.name} ~ ${new Date(msg.info.at).toISOString()} ~ ${msg.id}`}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
