
export function Lobby() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Lobby</h1>
      <p className="text-lg mb-8">Waiting for players to join...</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded">Start Game</button>
    </div>
  );
}
