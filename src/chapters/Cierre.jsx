import { useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { GASTO_COFOG } from '../engine/irpf';
import { HundredField } from '../figures/marks';
import { dec, eur, pct } from '../utils/format';

const NOCHE = '#0e1214';
const TINTA = '#e8e6df';
const SENAL = '#58a4af';
const APAGADO = '#7d858a';

/**
 * EL CIERRE — la contraportada.
 *
 * Después de veintitrés figuras, quien llega hasta aquí quiere llevarse algo.
 * Esta página invertida resume el informe en seis cifras y las entrega en una
 * imagen descargable de 1200 × 630 —la proporción de una tarjeta social— para
 * que el trabajo salga de la pestaña. El dibujo se hace en canvas, con los
 * mismos números que la página: no hay servidor detrás ni imagen prefabricada.
 */
export default function Cierre() {
  const { bruto, anio, pagas, nomina, marginal, percentil, getShareURL } = useFiscal();
  const [estado, setEstado] = useState('idle');
  const [copiado, setCopiado] = useState(false);

  const cuna = Math.max(0, nomina.costeLab - nomina.salarioNeto);
  const social = GASTO_COFOG.grupos[0];
  const parteSocial =
    social.partidas.reduce((a, p) => a + p.valor, 0) / GASTO_COFOG.total;

  const bloques = [
    { key: 'neto', label: 'Renta neta', value: Math.round((nomina.salarioNeto / Math.max(nomina.costeLab, 1)) * 100), color: TINTA },
    { key: 'irpf', label: 'IRPF', value: Math.round((nomina.irpfFinal / Math.max(nomina.costeLab, 1)) * 100), color: APAGADO },
    { key: 'ss', label: 'Cotizaciones', value: Math.round(((nomina.cotTra + nomina.cotEmp) / Math.max(nomina.costeLab, 1)) * 100), color: SENAL },
  ];

  const cifras = [
    ['Cuña fiscal', pct(nomina.cunaFiscal * 100)],
    ['Tipo efectivo IRPF', pct(nomina.tipoEfectivoIRPF * 100)],
    ['Marginal total', pct(marginal.tipoMarginalTotal * 100)],
    ['Percentil salarial', `${Math.round(percentil)} de 100`],
  ];

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(getShareURL());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2400);
    } catch {
      // el portapapeles puede estar bloqueado; no rompe nada
    }
  };

  const descargar = async () => {
    setEstado('trabajando');
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const c = document.createElement('canvas');
      c.width = 1200;
      c.height = 630;
      const x = c.getContext('2d');

      x.fillStyle = NOCHE;
      x.fillRect(0, 0, 1200, 630);

      // cabecera
      x.fillStyle = TINTA;
      x.font = '700 26px Inter, system-ui, sans-serif';
      x.letterSpacing = '4px';
      x.fillText('FISCALSCOPE', 64, 76);
      x.letterSpacing = '0px';
      x.fillStyle = APAGADO;
      x.font = '400 17px Inter, system-ui, sans-serif';
      x.fillText(`Tu sueldo bajo el microscopio fiscal · ${anio}`, 64, 106);

      x.strokeStyle = '#232a2d';
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(64, 132);
      x.lineTo(1136, 132);
      x.stroke();

      // la cifra
      x.fillStyle = APAGADO;
      x.font = '600 15px Inter, system-ui, sans-serif';
      x.letterSpacing = '2px';
      x.fillText('DE UN BRUTO DE', 64, 190);
      x.letterSpacing = '0px';

      x.fillStyle = TINTA;
      x.font = '800 78px Inter, system-ui, sans-serif';
      x.fillText(eur(bruto), 64, 262);

      x.fillStyle = APAGADO;
      x.font = '600 15px Inter, system-ui, sans-serif';
      x.letterSpacing = '2px';
      x.fillText('TE QUEDAN', 64, 320);
      x.letterSpacing = '0px';

      x.fillStyle = SENAL;
      x.font = '800 96px Inter, system-ui, sans-serif';
      x.fillText(eur(nomina.salarioNeto), 64, 404);

      x.fillStyle = APAGADO;
      x.font = '400 19px Inter, system-ui, sans-serif';
      x.fillText(`${eur(nomina.salarioNeto / pagas)} al mes en ${pagas} pagas`, 64, 438);

      // las cuatro cifras
      let cx = 64;
      x.font = '600 13px Inter, system-ui, sans-serif';
      for (const [k, v] of cifras) {
        x.fillStyle = APAGADO;
        x.letterSpacing = '1.5px';
        x.font = '600 13px Inter, system-ui, sans-serif';
        x.fillText(k.toUpperCase(), cx, 512);
        x.letterSpacing = '0px';
        x.fillStyle = TINTA;
        x.font = '800 30px Inter, system-ui, sans-serif';
        x.fillText(v, cx, 548);
        cx += 268;
      }

      // los cien bloques del coste laboral
      const S = 13;
      const G = 4;
      let i = 0;
      for (const g of bloques) {
        for (let k = 0; k < g.value && i < 100; k++, i++) {
          x.fillStyle = g.color;
          x.fillRect(820 + (i % 10) * (S + G), 170 + Math.floor(i / 10) * (S + G), S, S);
        }
      }
      x.fillStyle = APAGADO;
      x.font = '600 13px Inter, system-ui, sans-serif';
      x.letterSpacing = '1.5px';
      x.fillText('DE CADA 100 € DE COSTE LABORAL', 820, 152);
      x.letterSpacing = '0px';
      x.font = '400 15px Inter, system-ui, sans-serif';
      x.fillText(`${bloques[0].value} € llegan a tu cuenta`, 820, 372);
      x.fillText(`${bloques[1].value + bloques[2].value} € corresponden a IRPF y cotizaciones`, 820, 396);

      // pie
      x.fillStyle = '#4d5559';
      x.font = '400 13px Inter, system-ui, sans-serif';
      x.fillText('Cálculo propio sobre BOE · AEAT · TGSS · INE — estimación orientativa, no asesoramiento fiscal', 64, 596);

      const blob = await new Promise(r => c.toBlob(r, 'image/png'));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fiscalscope-${anio}-${Math.round(bruto)}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setEstado('hecho');
      setTimeout(() => setEstado('idle'), 2400);
    } catch {
      setEstado('idle');
    }
  };

  return (
    <section id="cierre" className="fs-chapter fs-night fs-cierre" aria-labelledby="cierre-t">
      <div className="fs-page">
        <div className="fs-cierre-grid">
          <div>
            <span className="fs-stamp">Tu resumen · {anio}</span>
            <h2 id="cierre-t" className="fs-title" style={{ marginTop: 14 }}>
              Llévatelo
              <br />
              contigo
            </h2>
            <p className="fs-kicker">
              Todo el informe, en seis cifras. La tarjeta se dibuja con tus números en este mismo
              navegador: no se envía nada a ningún sitio.
            </p>

            <div className="fs-cierre-acciones">
              <button type="button" className="fs-btn fs-btn-fuerte" onClick={descargar}>
                {estado === 'trabajando'
                  ? 'Dibujando…'
                  : estado === 'hecho'
                    ? 'Descargada ✓'
                    : 'Descargar tarjeta'}
              </button>
              <button type="button" className="fs-btn" onClick={copiar}>
                {copiado ? 'Enlace copiado ✓' : 'Copiar enlace'}
              </button>
            </div>
            <p className="fs-note" style={{ marginTop: 14 }}>
              El enlace conserva tu sueldo, tu año y tu perfil: quien lo abra verá exactamente estas
              cifras.
            </p>
          </div>

          {/* la tarjeta, en la página, con la misma composición que la imagen */}
          <figure className="fs-tarjeta">
            <header className="fs-tarjeta-head">
              <span className="fs-masthead-name">FiscalScope</span>
              <span className="fs-stamp">{anio}</span>
            </header>

            <p className="fs-label">De un bruto de</p>
            <p className="fs-tarjeta-bruto num">{eur(bruto)}</p>
            <p className="fs-label" style={{ marginTop: 10 }}>Te quedan</p>
            <p className="fs-tarjeta-neto num">{eur(nomina.salarioNeto)}</p>
            <p className="fs-note" style={{ marginTop: 2 }}>
              {eur(nomina.salarioNeto / pagas)} al mes en {pagas} pagas
            </p>

            <dl className="fs-tarjeta-cifras">
              {cifras.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd className="num">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="fs-tarjeta-cien">
              <span className="fs-label">De cada 100 € de coste laboral</span>
              <svg className="fs-svg" viewBox="0 0 250 34" style={{ maxWidth: 260, marginTop: 8 }} aria-hidden="true">
                <HundredField groups={bloques} columns={25} size={7} gap={2.6} y={2} />
              </svg>
              <p className="fs-note" style={{ marginTop: 8 }}>
                <strong>{bloques[0].value} €</strong> llegan a tu cuenta ·{' '}
                {dec((cuna / Math.max(nomina.costeLab, 1)) * 100)} % corresponde a IRPF y cotizaciones;{' '}
                según la correspondencia COFOG, {pct(parteSocial * 100, 0)} se asignaría a protección social.
              </p>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
