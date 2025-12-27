import { useEffect, useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import useWorker from '../lib/use-worker'

function App () {
  const { videos, messages, addMessage } = useWorker()
  const videoRef = useRef(null)

  const [input, setInput] = useState('')

  const firstLink = videos[0]?.info?.link

  useEffect(() => {
    if (!firstLink) return
    const video = videoRef.current
    if (!video) return
    console.log('🚀 ~ App ~ firstLink:', firstLink)
    console.log('🚀 ~ App ~ video:', video)

    const mediaSource = new window.MediaSource()
    video.src = URL.createObjectURL(mediaSource)
    mediaSource.addEventListener('sourceopen', async () => {
      const res = await fetch(firstLink)
      const data = await res.arrayBuffer()
      const sb = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.640028"')
      sb.appendBuffer(data)
    })
  }, [firstLink])

  const onSend = (videoId) => {
    addMessage({ text: input, info: { videoId } })
    setInput('')
  }

  return (
    <div className='bg-blue-500 min-h-screen p-4'>
      <div className='bg-white p-4 mb-4'>
        <video ref={videoRef} controls autoPlay width={640} />
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
          <h2 className='font-bold'>Comments ({messages.length})</h2>
          <ul>
            {messages.map((msg, idx) => (
              <li key={idx} className='border-b py-1'>{`${msg.text} ~ ${msg.info.name} ~ ${new Date(msg.info.at).toISOString()} ~ ${msg.id}`}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
