import FramedStream from 'framed-stream'
import pearPipe from 'pear-pipe'
import { useEffect, useState } from 'react'

import HRPC from '../spec/hrpc'

const pipe = pearPipe()
const stream = new FramedStream(pipe)
const rpc = new HRPC(stream)
stream.pause()

export default function useWorker () {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    rpc.onMessages((data) => setMessages(data))
    stream.resume()
    return () => pipe.end()
  }, [])

  return {
    messages,
    addMessage: (text) => rpc.addMessage(text)
  }
}
