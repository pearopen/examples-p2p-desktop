import { useState } from 'react'
import { createRoot } from 'react-dom/client'

import useWorker from '../lib/use-worker'

function App () {
  const { rooms, messages, addRoom, joinRoom, addMessage } = useWorker()

  const [selectedRoomId, setSelectedRoomId] = useState()
  const [roomNameInput, setRoomNameInput] = useState('')
  const [roomInviteInput, setRoomInviteInput] = useState('')
  const [messageInput, setMessageInput] = useState('')

  const roomId = selectedRoomId || rooms[0]?.id
  const roomMessages = messages[roomId] || []

  const onCreateRoom = () => {
    if (!roomNameInput) {
      alert('Please enter a room name')
      return
    }
    addRoom(roomNameInput)
    setRoomNameInput('')
  }

  const onJoinRoom = () => {
    if (!roomInviteInput) {
      alert('Please enter a room invite')
      return
    }
    joinRoom(roomInviteInput)
    setRoomInviteInput('')
  }

  const onSendMessage = () => {
    addMessage(messageInput, roomId)
    setMessageInput('')
  }

  const renderMessages = () => {
    if (!roomId) return null
    return (
      <div className='bg-blue-500 min-h-screen p-4'>
        <div className='mb-4 wrap-anywhere'>
          Room Invite: {rooms.find(item => item.id === roomId)?.invite}
        </div>
        <div className='mb-4 flex'>
          <input
            type='text'
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            placeholder='Type chat message...'
            className='flex-1 p-2 border border-gray-300'
          />
          <button className='bg-white text-blue-500 px-4 py-2' onClick={onSendMessage}>Send</button>
        </div>
        <div className='bg-white p-4'>
          <h2 className='text-lg font-bold mb-2'>Messages</h2>
          <ul>
            {roomMessages.map((msg, idx) => (
              <li key={idx} className='border-b py-1'>{`${msg.text} ~ ${msg.info.name} ~ ${new Date(msg.info.at).toISOString()} ~ ${msg.id}`}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  const renderRooms = () => {
    return (
      <div className='bg-white min-h-screen p-4'>
        <h2 className='text-lg font-bold mb-2'>Rooms</h2>
        <ul>
          {rooms.map((room, idx) => (
            <li key={idx} className='border-b py-2 flex items-center justify-between'>
              <div>
                <div className='font-semibold'>{room.name}</div>
                <div className='text-xs text-gray-500'>{room.id}</div>
              </div>
              <button
                className={`ml-2 px-3 py-1 rounded ${roomId === room.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setSelectedRoomId(room.id)}
              >
                {roomId === room.id ? '✅' : '➡️'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className='bg-green-500 min-h-screen p-4'>
      <div className='mb-4 flex'>
        <input
          type='text'
          value={roomNameInput}
          onChange={e => setRoomNameInput(e.target.value)}
          placeholder='Type room name...'
          className='flex-1 p-2 border border-gray-300'
        />
        <button className='bg-white text-green-500 px-4 py-2' onClick={onCreateRoom}>Create</button>
      </div>
      <div className='mb-4 flex'>
        <input
          type='text'
          value={roomInviteInput}
          onChange={e => setRoomInviteInput(e.target.value)}
          placeholder='Type room invite...'
          className='flex-1 p-2 border border-gray-300'
        />
        <button className='bg-white text-green-500 px-4 py-2' onClick={onJoinRoom}>Join</button>
      </div>
      <div className='flex gap-4'>
        <div className='w-1/4'>
          {renderRooms()}
        </div>
        <div className='flex-1'>
          {renderMessages()}
        </div>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
