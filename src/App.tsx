import { useEffect, useRef } from "react";
import "./App.css";
import { levelBuilder } from "./game-logic/canvas-builder";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const element = <h1>Hello, world!</h1>;
  useEffect(() => {
    console.log(element);

    levelBuilder(canvasRef.current!);
  }, []);
  return (
    <>
      <canvas ref={canvasRef}></canvas>
    </>
  );
}

export default App;
