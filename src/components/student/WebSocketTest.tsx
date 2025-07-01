import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const WebSocketTest = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [eventsData, setEventsData] = useState<string[]>([]);
  const [identityInput, setIdentityInput] = useState('');
  const [identityResult, setIdentityResult] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Kết nối tới server WebSocket khi component mount
  useEffect(() => {
    // const socketInstance = io("https://successful-laura-tsondev-c5a7fe4d.koyeb.app/events", {
    //   reconnection: true,
    // });

    const socketInstance = io('http://localhost:3000/events', {
      reconnection: true,
    });

    setSocket(socketInstance);

    // Xử lý khi kết nối thành công
    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    // Xử lý sự kiện 'events'
    socketInstance.on('test', (data) => {
      setEventsData((prev) => [...prev, JSON.stringify(data)]);
    });

    // Xử lý sự kiện 'identity'
    socketInstance.on('identity', (data: number) => {
      setIdentityResult(data);
    });

    // Xử lý lỗi kết nối
    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // Cleanup khi component unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Hàm gửi sự kiện 'events'
  const handleSendEvents = () => {
    if (socket) {
      socket.emit('test', { test: 'data' });
    }
  };

  // Hàm gửi sự kiện 'identity'
  const handleSendIdentity = () => {
    if (socket && identityInput) {
      socket.emit('identity', Number(identityInput));
      setIdentityInput('');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">WebSocket Test</h1>
      <p>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</p>

      <div className="my-4">
        <h2 className="text-xl font-semibold">Test 'events' Event</h2>
        <Button onClick={handleSendEvents} disabled={!isConnected}>
          Send Events
        </Button>
        <ul className="mt-2">
          {eventsData.map((data, index) => (
            <li key={index} className="border-b py-1">
              {data}
            </li>
          ))}
        </ul>
      </div>

      <div className="my-4">
        <h2 className="text-xl font-semibold">Test 'identity' Event</h2>
        <div className="flex gap-2">
          <Input type="number" value={identityInput} onChange={(e) => setIdentityInput(e.target.value)} placeholder="Enter a number" disabled={!isConnected} />
          <Button onClick={handleSendIdentity} disabled={!isConnected}>
            Send Identity
          </Button>
        </div>
        {identityResult !== null && <p className="mt-2">Result: {identityResult}</p>}
      </div>
    </div>
  );
};

export default WebSocketTest;
