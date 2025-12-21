import FramedStream from 'framed-stream'
import pearPipe from 'pear-pipe'
import { useEffect, useState } from 'react'

import HRPC from '../spec/hrpc'

const pipe = pearPipe()
const stream = new FramedStream(pipe)
const rpc = new HRPC(stream)
stream.pause()

export default function useWorker () {
  const [rooms, setRooms] = useState([])
  const [messages, setMessages] = useState([])

  useEffect(() => {
    rpc.onRooms((data) => setRooms(data))
    rpc.onMessages((data) => setMessages(data))
    stream.resume()
    return () => pipe.end()
  }, [])

  return {
    rooms,
    messages,
    addRoom: (name) => rpc.addRoom(name),
    joinRoom: (invite) => rpc.joinRoom(invite),
    addMessage: (text, roomId) => rpc.addMessage({ text, roomId })
  }
}
