"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main>
      <p>Algo salió mal al cargar esta pantalla.</p>
      <button onClick={reset}>Intentar de nuevo</button>
    </main>
  );
}
