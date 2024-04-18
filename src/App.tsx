import { useEffect, useRef } from "react";
import "./App.css";
import { levelBuilder } from "./game-logic/canvas-builder";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    levelBuilder(canvasRef.current!);
  }, []);
  return (
    <>
      <canvas ref={canvasRef}></canvas>
    </>
  );
}

export default App;
