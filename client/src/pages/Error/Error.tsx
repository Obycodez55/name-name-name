
export function Error() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Error</h1>
      <p className="text-lg mb-8">Something went wrong!</p>
      <button className="bg-red-500 text-white px-4 py-2 rounded">Go Back</button>
    </div>
  );
}