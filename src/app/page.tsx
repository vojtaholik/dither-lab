import { loadAllShaders } from "./_components/utils/shader-loader";
import DitheringApp from "./_components/dithering-app";

export default async function Home() {
  const shaders = await loadAllShaders();

  return (
    <main className="flex flex-col items-center justify-center">
      <LogoLink />
      <DitheringApp shaders={shaders} />
    </main>
  );
}

const LogoLink = () => {
  return (
    <a
      href="https://vojta.io?ref=dither-lab"
      className="fixed md:left-3 p-3 group top-3 flex items-center gap-2"
      target="_blank"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="23"
        height="19"
        fill="none"
        viewBox="0 0 23 19"
      >
        <path
          fill="currentColor"
          d="M0 0h3.8v3.8H0zm3.8 3.8h3.8v3.8H3.8zm0 3.8h3.8v3.8H3.8zm7.6 3.8h3.8v3.8h-3.8zM3.8 0h3.8v3.8H3.8zm3.8 0h3.8v3.8H7.6zm0 7.6h3.8v3.8H7.6zm0-3.8h3.8v3.8H7.6zm0 7.6h3.8v3.8H7.6zM15.2 0H19v3.8h-3.8zM19 0h3.8v3.8H19zM7.6 15.2h3.8V19H7.6z"
        />
      </svg>
      <span className="p-3 text-xs opacity-0 group-hover:left-5 left-0 top-2 absolute w-16 group-hover:opacity-100 transition-all ease-in-out duration-300">
        ojta.io
      </span>
    </a>
  );
};
