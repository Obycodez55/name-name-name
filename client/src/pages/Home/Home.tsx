export function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-game-bg">
      <h1 className="text-4xl font-bold mb-4 text-white">
        Welcome to the Game
      </h1>
      <p className="text-lg mb-8 text-gray-300">Get ready to play!</p>
      <button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
        Start Game
      </button>
    </div>
  );
}
