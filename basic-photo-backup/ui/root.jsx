import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Runtime from 'pear-electron'

import useWorker from '../lib/use-worker'

function App () {
  const { videos, messages, addVideo, addMessage } = useWorker()

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

  const renderPlayer = () => {
    const video = videos.find(v => v.id === playerId)
    if (!video) return null
    const comments = messages.filter(msg => msg.info.videoId === video.id)
    return (
      <div className='flex flex-col gap-2'>
        <button
          className='cursor-pointer bg-gray-200 p-2'
          onClick={() => setPlayerId()}
        >
          Back
        </button>
        <div className='mb-4'>
          {video.type.startsWith('image/')
            ? (
              <img src={video.info.link} alt={video.name} className='w-full' />
              )
            : (
              <video src={video.info.link} controls autoPlay className='w-full' />
              )}
        </div>
        <div className='mb-2 flex'>
          <input
            type='text'
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Type a comment...'
            className='flex-1 p-2 border border-gray-300'
          />
          <button className='bg-blue-500 text-white px-4 ml-2' onClick={() => onSend(video.id)}>
            Send
          </button>
        </div>
        <div className='border-b bg-white mb-4'>
          <h2 className='font-bold'>Comments ({comments.length})</h2>
          <ul>
            {comments.map((msg, idx) => (
              <li key={idx} className='border-b py-1'>{`${msg.text} ~ ${msg.info.name} ~ ${new Date(msg.info.at).toISOString()} ~ ${msg.id}`}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const renderGallery = () => {
    return (
      <div className='flex flex-wrap gap-4'>
        {videos.map((video) => {
          return (
            <div
              key={video.id}
              onClick={() => setPlayerId(video.id)}
              className='cursor-pointer w-60 shadow-xl'
            >
              {video.type.startsWith('image/')
                ? (
                  <img
                    src={video.info.preview || video.info.link}
                    alt={video.name}
                    className='w-full h-40 object-cover'
                  />
                  )
                : (
                  <video
                    src={video.info.link}
                    className='w-full h-40 object-cover'
                    controls={false}
                    muted
                    preload='metadata'
                  />
                  )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className='bg-blue-500 min-h-screen p-4'>
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
        <h2 className='text-lg font-bold mb-2'>Gallery</h2>
        {playerId ? renderPlayer() : renderGallery()}
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
