import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import useWorker from '../lib/use-worker';
function App() {
    const { rooms, messages, addRoom, joinRoom, addMessage } = useWorker();
    const [selectedRoomId, setSelectedRoomId] = useState();
    const [roomNameInput, setRoomNameInput] = useState('');
    const [roomInviteInput, setRoomInviteInput] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const roomId = selectedRoomId || rooms[0]?.id;
    const roomMessages = roomId ? messages.filter((msg)=>msg.roomId === roomId) : [];
    const onCreateRoom = ()=>{
        if (!roomNameInput) {
            alert('Please enter a room name');
            return;
        }
        addRoom(roomNameInput);
        setRoomNameInput('');
    };
    const onJoinRoom = ()=>{
        if (!roomInviteInput) {
            alert('Please enter a room invite');
            return;
        }
        joinRoom(roomInviteInput);
        setRoomInviteInput('');
    };
    const onSendMessage = ()=>{
        addMessage(messageInput, roomId);
        setMessageInput('');
    };
    const renderMessages = ()=>{
        if (!roomId) return null;
        return /*#__PURE__*/ _jsxs("div", {
            className: "bg-blue-500 min-h-screen p-4",
            children: [
                /*#__PURE__*/ _jsxs("div", {
                    className: "mb-4 wrap-anywhere",
                    children: [
                        "Room Invite: ",
                        rooms.find((item)=>item.id === roomId)?.info?.invite
                    ]
                }),
                /*#__PURE__*/ _jsxs("div", {
                    className: "mb-4 flex",
                    children: [
                        /*#__PURE__*/ _jsx("input", {
                            type: "text",
                            value: messageInput,
                            onChange: (e)=>setMessageInput(e.target.value),
                            placeholder: "Type chat message...",
                            className: "flex-1 p-2 border border-gray-300"
                        }),
                        /*#__PURE__*/ _jsx("button", {
                            className: "bg-white text-blue-500 px-4 py-2",
                            onClick: onSendMessage,
                            children: "Send"
                        })
                    ]
                }),
                /*#__PURE__*/ _jsxs("div", {
                    className: "bg-white p-4",
                    children: [
                        /*#__PURE__*/ _jsx("h2", {
                            className: "text-lg font-bold mb-2",
                            children: "Messages"
                        }),
                        /*#__PURE__*/ _jsx("ul", {
                            children: roomMessages.map((msg, idx)=>/*#__PURE__*/ _jsx("li", {
                                    className: "border-b py-1",
                                    children: `${msg.text} ~ ${msg.info.name} ~ ${new Date(msg.info.at).toISOString()} ~ ${msg.id}`
                                }, idx))
                        })
                    ]
                })
            ]
        });
    };
    const renderRooms = ()=>{
        return /*#__PURE__*/ _jsxs("div", {
            className: "bg-white min-h-screen p-4",
            children: [
                /*#__PURE__*/ _jsx("h2", {
                    className: "text-lg font-bold mb-2",
                    children: "Rooms"
                }),
                /*#__PURE__*/ _jsx("ul", {
                    children: rooms.map((room, idx)=>/*#__PURE__*/ _jsxs("li", {
                            className: "border-b py-2 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ _jsxs("div", {
                                    children: [
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "font-semibold",
                                            children: room.name
                                        }),
                                        /*#__PURE__*/ _jsx("div", {
                                            className: "text-xs text-gray-500",
                                            children: room.id
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ _jsx("button", {
                                    className: `ml-2 px-3 py-1 rounded ${roomId === room.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`,
                                    onClick: ()=>setSelectedRoomId(room.id),
                                    children: roomId === room.id ? '✅' : '➡️'
                                })
                            ]
                        }, idx))
                })
            ]
        });
    };
    return /*#__PURE__*/ _jsxs("div", {
        className: "bg-green-500 min-h-screen p-4",
        children: [
            /*#__PURE__*/ _jsxs("div", {
                className: "mb-4 flex",
                children: [
                    /*#__PURE__*/ _jsx("input", {
                        type: "text",
                        value: roomNameInput,
                        onChange: (e)=>setRoomNameInput(e.target.value),
                        placeholder: "Type room name...",
                        className: "flex-1 p-2 border border-gray-300"
                    }),
                    /*#__PURE__*/ _jsx("button", {
                        className: "bg-white text-green-500 px-4 py-2",
                        onClick: onCreateRoom,
                        children: "Create"
                    })
                ]
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "mb-4 flex",
                children: [
                    /*#__PURE__*/ _jsx("input", {
                        type: "text",
                        value: roomInviteInput,
                        onChange: (e)=>setRoomInviteInput(e.target.value),
                        placeholder: "Type room invite...",
                        className: "flex-1 p-2 border border-gray-300"
                    }),
                    /*#__PURE__*/ _jsx("button", {
                        className: "bg-white text-green-500 px-4 py-2",
                        onClick: onJoinRoom,
                        children: "Join"
                    })
                ]
            }),
            /*#__PURE__*/ _jsxs("div", {
                className: "flex gap-4",
                children: [
                    /*#__PURE__*/ _jsx("div", {
                        className: "w-1/4",
                        children: renderRooms()
                    }),
                    /*#__PURE__*/ _jsx("div", {
                        className: "flex-1",
                        children: renderMessages()
                    })
                ]
            })
        ]
    });
}
createRoot(document.getElementById('root')).render(/*#__PURE__*/ _jsx(App, {}));
