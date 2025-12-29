import ui from 'pear-electron'
import { useEffect, useState, useRef } from 'react'
import { createRoot } from 'react-dom/client'

import useWorker from '../lib/use-worker'

function App () {
  const { invite, videos, messages, addMessage } = useWorker()
  const videoRef = useRef(null)
  const videosRef = useRef(videos)

  const [input, setInput] = useState('')

  useEffect(() => {
    ui.media.status.camera().then(status => {
      if (status !== 'granted') ui.media.access.camera()
    })
    ui.media.status.microphone().then(status => {
      if (status !== 'granted') ui.media.access.microphone()
    })
  }, [])

  useEffect(() => {
    videosRef.current = videos
  }, [videos])

  useEffect(() => {
    let stop = false
    const video = videoRef.current
    const mediaSource = new window.MediaSource()
    video.src = URL.createObjectURL(mediaSource)

    mediaSource.addEventListener('sourceopen', async () => {
      const sb = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.640028"')
      let fragIdx = 0
      while (!stop) {
        const fragment = videosRef.current?.[fragIdx]
        if (!fragment) {
          await new Promise(resolve => setTimeout(resolve, 100))
          continue
        }
        const res = await fetch(fragment.info.link)
        const data = await res.arrayBuffer()
        sb.appendBuffer(data)
        await new Promise(resolve => sb.addEventListener('updateend', resolve, { once: true }))
        video.play()
        fragIdx += 1
      }
    })
    return () => {
      stop = true
    }
  }, [])

  const onSend = () => {
    addMessage(input)
    setInput('')
  }

  return (
    <div className='bg-blue-500 min-h-screen p-4'>
      <div className='bg-white p-4 mb-4'>
        <p>Invite: {invite}</p>
        <video ref={videoRef} controls autoPlay width={480} />
        <div className='mb-2 flex'>
          <input
            type='text'
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Type a comment...'
            className='flex-1 p-2 border border-gray-300'
          />
          <button className='bg-white text-blue-500 px-4' onClick={onSend}>Send</button>
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
