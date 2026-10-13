import { useEffect, useState } from 'react';

export default function Temporizador() {
  const [min, setMin] = useState(10);
  const [seg, setSeg] = useState(0);
  const [corre, setCorre] = useState(false);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!corre) return;
    const t = setInterval(() => {
      setSeg((s) => {
        if (s <= 1) {
          clearInterval(t);
          setCorre(false);
          setListo(true);
          navigator.vibrate?.([300, 150, 300, 150, 300]);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [corre]);

  const iniciar = () => { setListo(false); setSeg(min * 60); setCorre(true); };
  const parar = () => { setCorre(false); setSeg(0); setListo(false); };
  const mm = String(Math.floor(seg / 60)).padStart(2, '0');
  const ss = String(seg % 60).padStart(2, '0');

  return (
    <div className="temporizador" role="timer">
      {corre || seg > 0 ? (
        <>
          <output className="tiempo">{mm}:{ss}</output>
          <button className="sec" onClick={parar}>Detener</button>
        </>
      ) : (
        <>
          {listo && <strong className="listo">¡Tiempo!</strong>}
          <label>
            <input type="number" min="1" max="600" value={min} onChange={(e) => setMin(Math.max(1, +e.target.value || 1))} />
            <span> min</span>
          </label>
          <button className="sec" onClick={iniciar}>Iniciar temporizador</button>
        </>
      )}
    </div>
  );
}
