import { useEffect, useState } from 'react'
import NewlineDecoder from 'newline-decoder'
import pearPipe from 'pear-pipe'

const pipe = pearPipe()

export default function useWorker () {
  const [invite, setInvite] = useState('')
  const [messages, setMessages] = useState([])
  const [videos, setVideos] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const lineDecoder = new NewlineDecoder()
    pipe.on('data', (data) => {
      const str = Buffer.from(data).toString()
      for (const line of lineDecoder.push(str)) {
        try {
          const obj = JSON.parse(line)
          if (obj.tag === 'invite') {
            setInvite(obj.data)
          } else if (obj.tag === 'messages') {
            setMessages(obj.data)
          } else if (obj.tag === 'videos') {
            setVideos(obj.data)
          } else if (obj.tag === 'error') {
            console.log(obj.data)
            setError(obj.data)
          } else if (obj.tag === 'log') {
            console.log(obj.data)
          }
        } catch (err) {
          write('error', `${line} ~ ${err}`)
        }
      }
    })
    return () => pipe.end()
  }, [])

  return {
    invite,
    videos,
    messages,
    error,
    addMessage: (message) => write('add-message', message),
    addVideo: (filePath) => write('add-video', filePath),
    clearError: () => setError('')
  }
}

function write (tag, data) {
  pipe.write(JSON.stringify({ tag, data }) + '\n')
}
