import { loadAllShaders } from "./_components/utils/shader-loader";
import DitheringApp from "./_components/dithering-app";

export default async function Home() {
  const shaders = await loadAllShaders();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-8">WebGL Dithering App</h1>
      <DitheringApp shaders={shaders} />
    </main>
  );
}
