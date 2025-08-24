import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Socket } from "socket.io-client";

type Props = {
    socket: Socket;
    name: string;
    roomId: string;
}

type Message = {
    roomId: string;
    name: string;
    currentMessage: string;
    time: string;
}

function ChatWindow({ socket, name, roomId }: Props) {
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const [messageList, setMessageList] = useState<Message[]>([]);
    const { pathname } = useLocation();
    const latestMessage = useRef<HTMLDivElement>(null);

    const sendMessage = () => {
        if (currentMessage.trim() !== "") {
            const messageData: Message = {
                roomId,
                name,
                currentMessage: currentMessage,
                time: new Date().toLocaleTimeString()
            };
            socket.emit("send_message", messageData);
            setCurrentMessage("");
        }
    }

    useEffect(() => {
        findLatestMessage();
        const handleReceivedMessage = (receivedMessageData: Message) => {
            setMessageList((list) => [...list, receivedMessageData]);
        };
        socket.on("received_message", handleReceivedMessage);
        return () => {
            socket.off("received_message", handleReceivedMessage);
        };
    }, [socket, messageList]);

    const findLatestMessage = () => {
        latestMessage.current?.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 flex flex-col">
                <div className="flex bg-white p-4 gap-3 mt-6"
                    style={{ borderTopLeftRadius: "10px", borderTopRightRadius: "10px" }}>
                    <div className="w-10 h-10 mt-2">
                        <img src="/conversation.png" alt="" />
                    </div>
                    {(pathname === "/home/help") ?
                        (<div>
                            <h2 className="text-xl font-bold"> WanderLust Team </h2>
                            <p className="text-gray-400">online</p>
                        </div>) :
                        (<div>
                            <h2 className="text-xl font-bold"> User </h2>
                            <p className="text-gray-400">online</p>
                        </div>)}
                </div>
                <div className="flex-1 bg-gray-300 flex flex-col max-h-[300px] overflow-y-auto scrollbar-hide"
                    style={{ maxHeight: `calc(100vh - 200px)` }}>
                    {messageList.map((messageContent, index) => (
                        <div key={index} className="py-1 px-2">
                            <div className={messageContent.name === name
                                ? `text-lg bg-blue-600 mr-0 ml-10 rounded text-white flex flex-col`
                                : `text-lg bg-gray-100 mr-10 ml-0 rounded flex flex-col`}>
                                <p className="p-2 mb-0">{messageContent.currentMessage}</p>
                                <div className="text-sm flex justify-end">
                                    <p className="mr-2">{messageContent.time}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={latestMessage}></div>
                </div>
                <div className="bg-white p-2 flex items-center"
                    style={{ borderBottomLeftRadius: "10px", borderBottomRightRadius: "10px" }}>
                    <input
                        type="text"
                        placeholder="Type something..."
                        className="flex-1 mr-2 border rounded px-4 py-2"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                    />
                    <div style={{ width: "50px", height: "50px" }}>
                        <img src="/send.png" alt=""
                            className="text-white p-2 rounded"
                            onClick={sendMessage}
                        />
                    </div>
                </div>
            </div>
        </div >
    );
}

export default ChatWindow;
