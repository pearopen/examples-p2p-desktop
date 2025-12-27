import FramedStream from 'framed-stream'
import pearPipe from 'pear-pipe'
import { useEffect, useState } from 'react'

import HRPC from '../spec/hrpc'

const pipe = pearPipe()
const stream = new FramedStream(pipe)
const rpc = new HRPC(stream)
stream.pause()

export default function useWorker () {
  const [invite, setInvite] = useState('')
  const [videos, setVideos] = useState([])
  const [messages, setMessages] = useState([])

  useEffect(() => {
    rpc.onInvite((data) => setInvite(data))
    rpc.onVideos((data) => setVideos(data))
    rpc.onMessages((data) => setMessages(data))
    stream.resume()
    return () => pipe.end()
  }, [])

  return {
    invite,
    videos,
    messages,
    addMessage: (message) => rpc.addMessage(message)
  }
}
