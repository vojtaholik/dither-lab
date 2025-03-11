import { loadAllShaders } from "./_components/utils/shader-loader";
import DitheringApp from "./_components/dithering-app";

export default async function Home() {
  const shaders = await loadAllShaders();

  return (
    <main className="flex flex-col items-center justify-center">
      <DitheringApp shaders={shaders} />
    </main>
  );
}
