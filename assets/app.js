/* Árvore da família — aplicação
   Os dados vêm de dados.js (PESSOAS, RAIZ, TITULO). Nada aqui precisa ser editado para incluir pessoas ou fotos. */
"use strict";
(() => {

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function h(tag, attrs, ...filhos) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "style") e.style.cssText = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? "" : v);
  }
  for (const f of filhos.flat()) if (f != null && f !== false) e.append(f.nodeType ? f : document.createTextNode(f));
  return e;
}
const preencher = (el, ...filhos) => el.replaceChildren(...filhos.flat().filter(f => f != null && f !== false && f !== ""));
const SVGNS = "http://www.w3.org/2000/svg";
function s(tag, attrs = {}) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

const ICONES = {
  arvore: '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="12" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v9M12 12H5v4.5M12 12h7v4.5"/>',
  geracoes: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  parentesco: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  busca: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  lua: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  menos: '<path d="M5 12h14"/>',
  ajustar: '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/>',
  raiz: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/>',
  fechar: '<path d="M6 6l12 12M18 6 6 18"/>',
  compartilhar: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  localizar: '<circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="1.5"/>',
  trocar: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
};
const ico = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[n]}</svg>`;
const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="var(--primary)"/><path d="M16 25V14M16 18l-5-5M16 16l5-5M16 21l-7-3M16 20l7-3" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';

let toastTimer;
function aviso(txt) {
  const t = $("#toast");
  t.textContent = txt;
  t.classList.add("mostra");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("mostra"), 2400);
}
const armazenamento = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* sem armazenamento */ } },
};

// ---------------------------------------------------------------------------
// Modelo da família
// ---------------------------------------------------------------------------
const porId = new Map(PESSOAS.map(p => [p.id, p]));
const P = id => porId.get(id);
const GERACOES = { 1: "Raízes", 2: "Filhos", 3: "Netos", 4: "Bisnetos", 5: "Trinetos", 6: "Tetranetos" };
const ordinal = g => `${g}ª geração`;

const pendente = p => p.nome.startsWith("[PREENCHER]");
const nomeDe = p => pendente(p) ? "Nome a definir" : p.nome;
const detalhePendente = p => p.nome.replace("[PREENCHER]", "").trim();
const COMPOSTOS = new Set(["Maria", "João", "José", "Ana", "Luiz", "Luis", "Júlio"]);
function curto(p) {
  if (pendente(p)) return "A definir";
  const w = p.nome.split(/\s+/);
  if (w.length <= 3) return p.nome;
  let i = 1;
  if (COMPOSTOS.has(w[0])) { while (i < w.length - 1 && /^(de|da|do|dos|das)$/.test(w[i])) i++; i++; }
  return [...w.slice(0, i), w[w.length - 1]].join(" ");
}
function iniciais(p) {
  if (pendente(p)) return "?";
  const w = p.nome.split(/\s+/).filter(x => !/^(de|da|do|dos|das|e)$/.test(x));
  return (w[0][0] + (w.length > 1 ? w[w.length - 1][0] : "")).toUpperCase();
}

const filhosDe = id => PESSOAS.filter(p => p.pais.includes(id));
function conjugesDe(id) {
  const r = new Set();
  for (const f of filhosDe(id)) for (const x of f.pais) if (x !== id) r.add(x);
  if (P(id).conjuge) r.add(P(id).conjuge);
  for (const o of PESSOAS) if (o.conjuge === id) r.add(o.id);
  return [...r];
}
function irmaosDe(id) {
  const p = P(id);
  if (!p.pais.length) return [];
  return PESSOAS.filter(o => o.id !== id && o.pais.some(x => p.pais.includes(x))).map(o => o.id);
}
// Caminho da raiz até a pessoa, seguindo a linha de sangue
function linhagem(id) {
  const cam = [];
  let cur = P(id);
  while (cur) {
    cam.unshift(cur.id);
    if (cur.id === RAIZ) return cam;
    const pai = cur.pais.find(x => x === RAIZ || P(x).pais.length);
    cur = pai ? P(pai) : null;
  }
  return null;
}

// Gênero só é usado para flexionar os termos de parentesco. Vem do campo "sexo" (opcional)
// ou do rótulo de relação já escrito na planilha; na dúvida, usa a forma neutra.
const REL_F = /^(Filha|Neta|Bisneta|Trineta|Matriarca)$/;
const REL_M = /^(Filho|Neto|Bisneto|Trineto|Patriarca)$/;
const genero = p => p.sexo || (REL_F.test(p.relacao) ? "F" : REL_M.test(p.relacao) ? "M" : null);
const TERMOS = {
  filho: ["filho", "filha", "filho(a)"], neto: ["neto", "neta", "neto(a)"], bisneto: ["bisneto", "bisneta", "bisneto(a)"],
  trineto: ["trineto", "trineta", "trineto(a)"], tetraneto: ["tetraneto", "tetraneta", "tetraneto(a)"],
  pai: ["pai", "mãe", "pai/mãe"], avo: ["avô", "avó", "avô/avó"], bisavo: ["bisavô", "bisavó", "bisavô/bisavó"],
  trisavo: ["trisavô", "trisavó", "trisavô/trisavó"], tetravo: ["tetravô", "tetravó", "tetravô/tetravó"],
  irmao: ["irmão", "irmã", "irmão(ã)"], meio: ["meio-irmão", "meia-irmã", "meio-irmão(ã)"], sobrinho: ["sobrinho", "sobrinha", "sobrinho(a)"], tio: ["tio", "tia", "tio(a)"],
  primo: ["primo", "prima", "primo(a)"], genro: ["genro", "nora", "genro/nora"], sogro: ["sogro", "sogra", "sogro(a)"],
  cunhado: ["cunhado", "cunhada", "cunhado(a)"], concunhado: ["concunhado", "concunhada", "concunhado(a)"],
  enteado: ["enteado", "enteada", "enteado(a)"], conj: ["marido", "esposa", "cônjuge"], art: ["do", "da", "do(a)"],
};
const t = (p, k) => { const g = genero(p); return TERMOS[k][g === "M" ? 0 : g === "F" ? 1 : 2]; };
const DESC = [null, "filho", "neto", "bisneto", "trineto", "tetraneto"];
const ASC = [null, "pai", "avo", "bisavo", "trisavo", "tetravo"];

// O que B é de A, sabendo que A sobe `a` gerações e B sobe `b` gerações até o ancestral comum
function termo(pB, a, b) {
  if (a === 0) return DESC[b] ? t(pB, DESC[b]) : "descendente";
  if (b === 0) return ASC[a] ? t(pB, ASC[a]) : "ancestral";
  if (a === 1 && b === 1) return t(pB, "irmao");
  if (a === 1) return b === 2 ? t(pB, "sobrinho") : `${t(pB, "sobrinho")}-${DESC[b - 1] ? t(pB, DESC[b - 1]) : "descendente"}`;
  if (b === 1) return a === 2 ? t(pB, "tio") : `${t(pB, "tio")}-${ASC[a - 1] ? t(pB, ASC[a - 1]) : "ancestral"}`;
  return `${t(pB, "primo")} de ${Math.min(a, b) - 1}º grau`;
}
function subir(id) {
  const dist = new Map([[id, 0]]), via = new Map(), fila = [id];
  while (fila.length) {
    const c = fila.shift();
    for (const x of P(c).pais) if (!dist.has(x)) { dist.set(x, dist.get(c) + 1); via.set(x, c); fila.push(x); }
  }
  return { dist, via };
}
function sangue(a, b) {
  const A = subir(a), B = subir(b);
  let m = null;
  for (const [x, da] of A.dist) if (B.dist.has(x)) {
    const db = B.dist.get(x);
    if (!m || da + db < m.a + m.b) m = { x, a: da, b: db };
  }
  if (!m) return null;
  const desce = (S, alvo) => { const c = [m.x]; while (c[c.length - 1] !== alvo) c.push(S.via.get(c[c.length - 1])); return c; };
  return { ...m, caminho: [...desce(A, a).reverse(), ...desce(B, b).slice(1)] };
}
function parentesco(a, b) {
  const pa = P(a), pb = P(b);
  if (a === b) return { mesmo: true, caminho: [a] };
  if (conjugesDe(a).includes(b)) return { termo: t(pb, "conj"), caminho: [a, b] };

  const r = sangue(a, b);
  if (r) {
    // Primos de gerações diferentes: explica pela pessoa da mesma geração (ex.: "primo do pai")
    let detalhe = null;
    if (r.a >= 2 && r.b >= 2 && r.a !== r.b) {
      const grau = `${Math.min(r.a, r.b) - 1}º grau`;
      const x = r.a > r.b ? P(r.caminho[r.a - r.b]) : P(r.caminho[r.caminho.length - 1 - (r.b - r.a)]);
      detalhe = r.a > r.b
        ? `${curto(pb)} e ${curto(x)} (${r.a - r.b === 1 ? t(x, "pai") : t(x, ASC[r.a - r.b])} de ${curto(pa)}) são primos de ${grau}.`
        : `${curto(pa)} e ${curto(x)} (${r.b - r.a === 1 ? t(x, "pai") : t(x, ASC[r.b - r.a])} de ${curto(pb)}) são primos de ${grau}.`;
    }
    const meio = r.a === 1 && r.b === 1 && pa.pais.length === 2 && pb.pais.length === 2 && !pa.pais.every(x => pb.pais.includes(x));
    return { termo: meio ? t(pb, "meio") : termo(pb, r.a, r.b), detalhe, caminho: r.caminho };
  }
  // B entrou na família pelo casamento
  for (const c of conjugesDe(b)) {
    const q = sangue(a, c); if (!q) continue;
    const cam = [...q.caminho, b];
    if (q.a === 0 && q.b === 1) return { termo: t(pb, "genro"), caminho: cam };
    if (q.a === 1 && q.b === 1) return { termo: t(pb, "cunhado"), caminho: cam };
    return { termo: `${t(pb, "conj")} ${t(P(c), "art")} ${termo(P(c), q.a, q.b)}`, afinidade: true, caminho: cam };
  }
  // A entrou na família pelo casamento
  for (const c of conjugesDe(a)) {
    const q = sangue(c, b); if (!q) continue;
    const cam = [a, ...q.caminho];
    if (q.a === 1 && q.b === 0) return { termo: t(pb, "sogro"), caminho: cam };
    if (q.a === 1 && q.b === 1) return { termo: t(pb, "cunhado"), caminho: cam };
    if (q.a === 0 && q.b === 1) return { termo: t(pb, "enteado"), caminho: cam };
    return { termo: `${termo(pb, q.a, q.b)} ${t(P(c), "art")} ${t(P(c), "conj")}`, afinidade: true, caminho: cam };
  }
  // Os dois entraram pelo casamento
  for (const c1 of conjugesDe(a)) for (const c2 of conjugesDe(b)) {
    const q = sangue(c1, c2); if (!q) continue;
    const cam = [a, ...q.caminho, b];
    if (q.a === 1 && q.b === 1) return { termo: t(pb, "concunhado"), caminho: cam };
    return {
      termo: "parente por afinidade", caminho: cam,
      detalhe: `${curto(pb)} é casado(a) com ${curto(P(c2))}, que é ${termo(P(c2), q.a, q.b)} de ${curto(P(c1))}, cônjuge de ${curto(pa)}.`,
    };
  }
  return { termo: "sem parentesco registrado", caminho: [] };
}

// ---------------------------------------------------------------------------
// Fotos: procura fotos/<id>.jpg (ou o campo "foto") uma única vez por pessoa
// ---------------------------------------------------------------------------
const fotos = new Map();
function urlMiniatura(p) {
  return `miniaturas/${p.id}.webp`;
}
function avatar(p, extra = "") {
  const d = h("span", { class: `av ${pendente(p) ? "pend" : ""} ${extra}`, "data-av": p.id, style: `--gc: var(--g${p.g})` }, iniciais(p));
  const url = fotos.get(p.id);
  if (url) { d.classList.add("com-foto"); d.append(h("img", { src: urlMiniatura(p), alt: "", onerror: e => { e.currentTarget.onerror = null; e.currentTarget.src = url; } })); }
  return d;
}
function carregarFotos() {
  for (const p of PESSOAS) {
    if (pendente(p)) continue;
    const url = p.foto || `fotos/${p.id}.jpg`;
    const img = new Image();
    img.onload = () => {
      fotos.set(p.id, url);
      for (const d of $$(`[data-av="${p.id}"]`)) {
        if (d.querySelector("img")) continue;
        d.classList.add("com-foto");
        d.append(h("img", { src: urlMiniatura(p), alt: "", onerror: e => { e.currentTarget.onerror = null; e.currentTarget.src = url; } }));
      }
    };
    img.src = url;
  }
}

// ---------------------------------------------------------------------------
// Layout da árvore (usado pela árvore gráfica e pelo leque da abertura)
// ---------------------------------------------------------------------------
const CW = 150, CH = 192, GC = 22, GS = 30, GV = 96, ML = 50, MARGEM = 190;

function unidade(id) {
  const sp = conjugesDe(id);
  const membros = sp.length === 2 ? [sp[0], id, sp[1]] : [id, ...sp];
  const filhos = filhosDe(id);
  const outro = f => f.pais.find(x => x !== id) || "";
  const chaves = [...new Set(filhos.map(outro))].sort((x, y) => membros.indexOf(x) - membros.indexOf(y));
  const grupos = chaves.map(c => ({ com: c, filhos: filhos.filter(f => outro(f) === c).map(f => unidade(f.id)) }));
  const todos = grupos.flatMap(g => g.filhos);
  const uw = membros.length * CW + (membros.length - 1) * GC;
  const kw = todos.reduce((soma, n) => soma + n.w, 0) + Math.max(0, todos.length - 1) * GS;
  return { id, membros, grupos, todos, uw, kw, w: Math.max(uw, kw) };
}
function posicionar(n, esq, prof, cards) {
  n.prof = prof;
  n.y = prof * (CH + GV);
  const cx = esq + n.w / 2;
  n.pos = {};
  let x = cx - n.uw / 2;
  for (const m of n.membros) { n.pos[m] = x; cards.push({ id: m, x, y: n.y, prof, conjuge: m !== n.id }); x += CW + GC; }
  let k = cx - n.kw / 2;
  for (const f of n.todos) { posicionar(f, k, prof + 1, cards); k += f.w + GS; }
}
const RAIZ_U = unidade(RAIZ);
const CARDS = [];
posicionar(RAIZ_U, MARGEM, 0, CARDS);
const POS = new Map(CARDS.map(c => [c.id, c]));
const PROF_MAX = Math.max(...CARDS.map(c => c.prof));
const LARG = MARGEM + RAIZ_U.w + 60;
const ALT = (PROF_MAX + 1) * (CH + GV) - GV + 40;
const unidades = [];
(function coletar(n) { unidades.push(n); n.todos.forEach(coletar); })(RAIZ_U);

// ---------------------------------------------------------------------------
// Abertura
// ---------------------------------------------------------------------------
function montarAbertura() {
  const familia = TITULO.replace(/^Família\s+/i, "");
  $("#nome-familia").textContent = familia;
  document.title = TITULO;

  const nGer = new Set(PESSOAS.map(p => p.g)).size;
  $("#numeros").append(
    h("li", {}, h("strong", {}, String(PESSOAS.length)), h("span", {}, "pessoas")),
    h("li", {}, h("strong", {}, String(nGer)), h("span", {}, "gerações")),
    h("li", {}, h("strong", {}, String(filhosDe(RAIZ).length)), h("span", {}, "ramos")),
  );
  $('[data-entrar="arvore"]').innerHTML = `Explorar a árvore ${ico("seta")}`;
  $('[data-entrar="parentesco"]').innerHTML = `${ico("parentesco")} Descobrir parentesco`;

  // Leque: cada ponto é uma pessoa, cada anel é uma geração
  const svg = $("#leque");
  const R = [0, 72, 128, 184, 238, 290];
  const rMax = R[Math.min(PROF_MAX, R.length - 1)];
  svg.setAttribute("viewBox", `${-rMax - 14} ${-rMax - 14} ${2 * rMax + 28} ${rMax + 30}`);
  const ang = c => Math.PI + (0.03 + 0.94 * (c.x + CW / 2 - MARGEM) / RAIZ_U.w) * Math.PI;
  const ponto = c => {
    if (c.prof === 0) { const i = RAIZ_U.membros.indexOf(c.id); return [(i - (RAIZ_U.membros.length - 1) / 2) * 16, -4]; }
    const a = ang(c), r = R[c.prof];
    return [r * Math.cos(a), r * Math.sin(a)];
  };
  for (let d = 1; d <= PROF_MAX; d++) svg.append(s("path", { class: "arco", d: `M${-R[d]},0A${R[d]},${R[d]} 0 0 1 ${R[d]},0` }));
  for (const u of unidades) {
    const [px, py] = ponto(POS.get(u.id));
    for (const f of u.todos) {
      const c = POS.get(f.id);
      const [fx, fy] = ponto(c);
      const a = ang(c), rm = (R[u.prof] + R[c.prof]) / 2;
      svg.append(s("path", {
        class: "ramo-l", d: `M${px},${py}Q${rm * Math.cos(a)},${rm * Math.sin(a)} ${fx},${fy}`,
        style: `--d:${0.3 + u.prof * 0.22}s`,
      }));
    }
  }
  for (const c of CARDS) {
    const p = P(c.id), [x, y] = ponto(c);
    svg.append(s("circle", {
      class: `ponto ${c.conjuge ? "conj" : ""} ${pendente(p) ? "pend" : ""}`,
      cx: x, cy: y, r: c.conjuge ? 3.4 : c.prof === 0 ? 6.5 : 5,
      style: `fill: var(--g${p.g}); ${c.conjuge ? `stroke: var(--g${p.g});` : ""} --d:${0.35 + c.prof * 0.22 + Math.random() * 0.12}s`,
    }));
  }
}

// ---------------------------------------------------------------------------
// Árvore gráfica com arrastar e zoom
// ---------------------------------------------------------------------------
const vp = $("#arvore-vp"), palco = $("#palco");
const V = { x: 0, y: 0, k: 1 };
const KMIN = 0.12, KMAX = 2.2;
let arrastou = false;

function montarArvore() {
  palco.style.width = `${LARG}px`;
  palco.style.height = `${ALT}px`;
  const svg = s("svg", { width: LARG, height: ALT, viewBox: `0 0 ${LARG} ${ALT}` });

  for (let d = 0; d <= PROF_MAX; d++) {
    const y = d * (CH + GV);
    const g = d + 1;
    palco.append(
      h("div", { class: "rot-ger", style: `top:${y + CH / 2 - 34}px; --gc: var(--g${g})` }, h("b", {}, String(g).padStart(2, "0")), h("span", {}, GERACOES[g] || ordinal(g))),
    );
    if (d > 0) palco.append(h("div", { class: "faixa-ger", style: `top:${y - GV / 2}px; width:${LARG}px` }));
  }

  const cotovelo = (ax, ay, bx, by, busY) => {
    const dx = bx - ax;
    if (Math.abs(dx) < 1) return `M${ax},${ay}V${by}`;
    const r = Math.min(14, Math.abs(dx) / 2), sg = Math.sign(dx);
    return `M${ax},${ay}V${busY - r}Q${ax},${busY} ${ax + sg * r},${busY}H${bx - sg * r}Q${bx},${busY} ${bx},${busY + r}V${by}`;
  };

  for (const u of unidades) {
    const bx = u.pos[u.id];
    for (const sp of u.membros) {
      if (sp === u.id) continue;
      const x1 = Math.min(bx, u.pos[sp]) + CW, x2 = Math.max(bx, u.pos[sp]), mx = (x1 + x2) / 2, y = u.y + ML;
      const g = s("g", { class: "alianca", "data-a": u.id, "data-b": sp });
      g.append(s("line", { x1, y1: y, x2, y2: y }), s("circle", { cx: mx - 3, cy: y, r: 4.5 }), s("circle", { cx: mx + 3, cy: y, r: 4.5 }));
      svg.append(g);
    }
    const busY = u.y + CH + GV / 2;
    for (const gr of u.grupos) {
      let ax, ay;
      if (gr.com) { ax = (Math.min(bx, u.pos[gr.com]) + CW + Math.max(bx, u.pos[gr.com])) / 2; ay = u.y + ML + 5; }
      else { ax = bx + CW / 2; ay = u.y + CH; }
      for (const f of gr.filhos) {
        const cx = f.pos[f.id] + CW / 2;
        svg.append(s("path", { class: "lig", d: cotovelo(ax, ay, cx, f.y, busY), "data-f": f.id }));
      }
    }
  }
  palco.prepend(svg);

  for (const c of CARDS) {
    const p = P(c.id);
    const rel = pendente(p) ? `${p.relacao} · a preencher` : p.relacao;
    palco.append(h("button", {
      class: `no ${c.conjuge ? "no-conj" : ""} ${pendente(p) ? "no-pend" : ""}`,
      style: `left:${c.x}px; top:${c.y}px; --gc: var(--g${p.g})`,
      "data-id": p.id, title: pendente(p) ? detalhePendente(p) : p.nome,
      onclick: () => { if (!arrastou) abrirPerfil(p.id); },
    }, avatar(p), h("span", { class: "no-nome" }, nomeDe(p)), h("span", { class: "no-rel" }, rel)));
  }

  $("#controles").append(
    h("button", { class: "icone", "aria-label": "Aproximar", html: ico("mais"), onclick: () => zoomCentro(1.3) }),
    h("button", { class: "icone", "aria-label": "Afastar", html: ico("menos"), onclick: () => zoomCentro(1 / 1.3) }),
    h("button", { class: "icone", "aria-label": "Ver árvore inteira", html: ico("ajustar"), onclick: () => ajustar(true) }),
    h("button", { class: "icone", "aria-label": "Ir para a raiz", html: ico("raiz"), onclick: () => vistaInicial(true) }),
  );
  interacao();
}

function aplicar(anim) {
  palco.classList.toggle("anim", !!anim);
  palco.style.transform = `translate(${V.x}px, ${V.y}px) scale(${V.k})`;
  const tam = 24 * V.k;
  vp.style.backgroundSize = `${tam}px ${tam}px`;
  vp.style.backgroundPosition = `${V.x}px ${V.y}px`;
}
const limitar = k => Math.min(KMAX, Math.max(KMIN, k));
function zoomEm(px, py, k) {
  k = limitar(k);
  V.x = px - (px - V.x) * k / V.k;
  V.y = py - (py - V.y) * k / V.k;
  V.k = k;
  aplicar();
}
function areaUtil() {
  const r = vp.getBoundingClientRect();
  const painelAberto = $("#painel").classList.contains("aberto") && innerWidth > 720;
  return { w: r.width - (painelAberto ? $("#painel").offsetWidth : 0), h: r.height, r };
}
function zoomCentro(f) {
  const a = areaUtil();
  zoomEm(a.w / 2, a.h / 2, V.k * f);
  aplicar(true);
}
function ajustar(anim) {
  const a = areaUtil();
  V.k = limitar(Math.min(a.w / LARG, a.h / ALT) * 0.95);
  V.x = (a.w - LARG * V.k) / 2;
  V.y = (a.h - ALT * V.k) / 2;
  aplicar(anim);
}
function vistaInicial(anim) {
  const a = areaUtil();
  const kFit = Math.min(a.w / LARG, a.h / ALT) * 0.95;
  if (kFit >= 0.5) return ajustar(anim);
  const raiz = POS.get(RAIZ);
  V.k = a.w < 500 ? 0.62 : 0.8;
  const centro = raiz.x + RAIZ_U.uw / 2;
  V.x = a.w / 2 - centro * V.k;
  V.y = 28;
  aplicar(anim);
}
function focar(id, anim = true) {
  const c = POS.get(id);
  if (!c) return;
  const a = areaUtil();
  V.k = Math.max(V.k, a.w < 500 ? 0.75 : 0.9);
  V.x = a.w / 2 - (c.x + CW / 2) * V.k;
  V.y = (innerWidth <= 720 && $("#painel").classList.contains("aberto") ? a.h * 0.2 : a.h / 2) - (c.y + CH / 2) * V.k;
  aplicar(anim);
}

function interacao() {
  const ptrs = new Map();
  let ini = null, pinca = null;
  const esconderDica = () => $("#dica").classList.add("some");
  setTimeout(esconderDica, 6000);

  vp.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    arrastou = false;
    ini = { x: e.clientX, y: e.clientY, vx: V.x, vy: V.y };
    if (ptrs.size === 2) {
      const [a, b] = [...ptrs.values()];
      pinca = { d: Math.hypot(a.x - b.x, a.y - b.y), k: V.k };
    }
    palco.classList.remove("anim");
  });
  addEventListener("pointermove", e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2 && pinca) {
      const [a, b] = [...ptrs.values()], r = vp.getBoundingClientRect();
      zoomEm((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, pinca.k * Math.hypot(a.x - b.x, a.y - b.y) / pinca.d);
      arrastou = true;
      esconderDica();
      return;
    }
    if (ptrs.size === 1 && ini) {
      const dx = e.clientX - ini.x, dy = e.clientY - ini.y;
      if (!arrastou && Math.hypot(dx, dy) > 5) { arrastou = true; vp.classList.add("arrastando"); esconderDica(); }
      if (arrastou) { V.x = ini.vx + dx; V.y = ini.vy + dy; aplicar(); }
    }
  });
  const fim = e => {
    if (!ptrs.delete(e.pointerId)) return;
    if (ptrs.size < 2) pinca = null;
    if (ptrs.size === 1) { const [a] = [...ptrs.values()]; ini = { x: a.x, y: a.y, vx: V.x, vy: V.y }; }
    if (!ptrs.size) { ini = null; vp.classList.remove("arrastando"); }
  };
  addEventListener("pointerup", fim);
  addEventListener("pointercancel", fim);
  vp.addEventListener("wheel", e => {
    e.preventDefault();
    const r = vp.getBoundingClientRect();
    zoomEm(e.clientX - r.left, e.clientY - r.top, V.k * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)));
    esconderDica();
  }, { passive: false });
}

function destacar(id) {
  $$(".no.sel, .no.dest, .lig.dest, .alianca.dest", palco).forEach(e => e.classList.remove("sel", "dest"));
  if (!id) { palco.classList.remove("focando"); return; }
  let conj = new Set([id]);
  const base = linhagem(id) || conjugesDe(id).map(linhagem).find(Boolean);
  if (base) base.forEach(x => conj.add(x));
  conjugesDe(id).forEach(x => conj.add(x));
  filhosDe(id).forEach(f => conj.add(f.id));
  for (const x of conj) $(`.no[data-id="${x}"]`, palco)?.classList.add("dest");
  $(`.no[data-id="${id}"]`, palco)?.classList.add("sel");
  $$(".lig", palco).forEach(l => {
    const f = P(l.dataset.f);
    if (conj.has(f.id) && f.pais.some(x => conj.has(x))) l.classList.add("dest");
  });
  $$(".alianca", palco).forEach(g => { if (conj.has(g.dataset.a) && conj.has(g.dataset.b)) g.classList.add("dest"); });
  palco.classList.add("focando");
}

// ---------------------------------------------------------------------------
// Galeria por geração
// ---------------------------------------------------------------------------
function montarGeracoes() {
  const pag = h("div", { class: "pagina" },
    h("header", { class: "cab-sec" },
      h("p", { class: "sobre-titulo" }, `${new Set(PESSOAS.map(p => p.g)).size} gerações`),
      h("h2", {}, "Galeria da família"),
      h("p", { class: "desc" }, "Cada rosto, uma história. Os cartões seguem a ordem da árvore, com cada família reunida."),
    ),
  );
  const gens = [...new Set(PESSOAS.map(p => p.g))].sort((a, b) => a - b);
  for (const g of gens) {
    const pessoas = PESSOAS.filter(p => p.g === g).sort((a, b) => (POS.get(a.id)?.x ?? 1e9) - (POS.get(b.id)?.x ?? 1e9));
    pag.append(h("section", { class: "ger", style: `--gc: var(--g${g})` },
      h("div", { class: "ger-cab" },
        h("span", { class: "ger-num" }, String(g).padStart(2, "0")),
        h("h3", {}, GERACOES[g] || ordinal(g)),
        h("p", {}, `${pessoas.length} ${pessoas.length === 1 ? "pessoa" : "pessoas"}`)),
      h("div", { class: "grade" }, pessoas.map(retrato)),
    ));
  }
  $("#v-geracoes").append(pag);
}
function retrato(p) {
  const conj = !p.pais.length && p.id !== RAIZ;
  let meta;
  if (pendente(p)) meta = detalhePendente(p);
  else if (p.pais.length) meta = `de ${p.pais.map(x => curto(P(x))).join(" & ")}`;
  else { const c = conjugesDe(p.id); meta = c.length ? `♥ ${c.map(x => curto(P(x))).join(", ")}` : ""; }
  return h("button", {
    class: `retrato ${conj ? "conj" : ""} ${pendente(p) ? "pend" : ""}`, style: `--gc: var(--g${p.g})`,
    onclick: () => abrirPerfil(p.id),
  }, avatar(p), h("strong", {}, nomeDe(p)), h("span", { class: "r-rel" }, p.relacao), meta && h("span", { class: "r-meta" }, meta));
}

// ---------------------------------------------------------------------------
// Parentesco
// ---------------------------------------------------------------------------
const par = { a: null, b: RAIZ };
function montarParentesco() {
  const opcoes = sel => {
    const gens = [...new Set(PESSOAS.map(p => p.g))].sort((a, b) => a - b);
    for (const g of gens) {
      const og = h("optgroup", { label: `${ordinal(g)} · ${GERACOES[g] || ""}` });
      PESSOAS.filter(p => p.g === g && !pendente(p)).forEach(p => og.append(h("option", { value: p.id }, p.nome)));
      sel.append(og);
    }
  };
  const selA = h("select", { id: "par-a" }), selB = h("select", { id: "par-b" });
  opcoes(selA); opcoes(selB);
  par.a = PESSOAS.find(p => p.g === Math.max(...PESSOAS.map(q => q.g)) && !pendente(p))?.id || RAIZ;
  selA.onchange = () => { par.a = selA.value; renderParentesco(); };
  selB.onchange = () => { par.b = selB.value; renderParentesco(); };

  $("#v-parentesco").append(h("div", { class: "pagina", style: "max-width: 820px" },
    h("header", { class: "cab-sec" },
      h("p", { class: "sobre-titulo" }, "Calculadora"),
      h("h2", {}, "Como somos parentes?"),
      h("p", { class: "desc" }, "Escolha duas pessoas e descubra o grau de parentesco, com o caminho que as liga na árvore."),
    ),
    h("div", { class: "seletores" },
      h("div", { class: "campo" }, h("label", { for: "par-a" }, "Pessoa"), selA),
      h("button", {
        class: "icone trocar", "aria-label": "Inverter", html: ico("trocar"),
        onclick: () => { [par.a, par.b] = [par.b, par.a]; renderParentesco(); },
      }),
      h("div", { class: "campo" }, h("label", { for: "par-b" }, "Em relação a"), selB),
    ),
    h("div", { class: "resultado", id: "resultado", "aria-live": "polite" }),
    h("p", { class: "nota-parentesco" }, "Primos de 1º grau são os primos-irmãos (filhos de irmãos)."),
  ));
  renderParentesco();
}
function renderParentesco() {
  $("#par-a").value = par.a;
  $("#par-b").value = par.b;
  const A = P(par.a), B = P(par.b), r = parentesco(par.a, par.b);
  const frase = r.mesmo
    ? h("p", { class: "frase" }, "Escolha duas pessoas diferentes.")
    : r.termo === "sem parentesco registrado"
      ? h("p", { class: "frase" }, "Não há ligação registrada entre ", h("strong", {}, curto(A)), " e ", h("strong", {}, curto(B)), ".")
      : h("p", { class: "frase" }, h("strong", {}, curto(B)), " é ", h("em", {}, r.termo), " de ", h("strong", {}, curto(A)), ".");

  const cam = h("ol", { class: "caminho", "aria-label": "Caminho na árvore" });
  const conjuges = (x, y) => conjugesDe(x).includes(y);
  r.caminho.forEach((id, i) => {
    const p = P(id);
    const li = h("li", { class: i === 0 || i === r.caminho.length - 1 ? "ponta" : "" });
    if (i) li.append(h("span", { class: `elo ${conjuges(r.caminho[i - 1], id) ? "casal" : ""}` }, conjuges(r.caminho[i - 1], id) ? "♥" : "—"));
    li.append(h("button", { onclick: () => abrirPerfil(id) }, avatar(p), h("small", {}, curto(p))));
    cam.append(li);
  });
  preencher($("#resultado"),frase, r.detalhe && h("p", { class: "detalhe" }, r.detalhe), r.caminho.length > 1 && cam);
}

// ---------------------------------------------------------------------------
// Perfil
// ---------------------------------------------------------------------------
const painel = $("#painel"), veu = $("#veu");
let perfilAtual = null;

function abrirPerfil(id) {
  const p = P(id);
  perfilAtual = id;
  const lin = linhagem(id);
  const cj = conjugesDe(id), irm = irmaosDe(id), fil = filhosDe(id).map(f => f.id);

  const secao = (titulo, ...conteudo) => h("section", { class: "pn-sec" }, h("h3", {}, titulo), ...conteudo);
  const lista = ids => h("div", { class: "lista-pessoas" }, ids.map(x => {
    const q = P(x);
    return h("button", { class: `pessoa-linha ${pendente(q) ? "pend" : ""}`, onclick: () => abrirPerfil(x) },
      avatar(q), h("span", {}, h("b", {}, nomeDe(q)), h("small", {}, pendente(q) ? detalhePendente(q) : q.relacao)));
  }));

  const av = avatar(p);
  av.addEventListener("click", () => fotos.has(id) && verFoto(fotos.get(id)));

  const dados = [["Nascimento", p.nascimento], ["Falecimento", p.falecimento], ["Local", p.local]].filter(d => d[1]);
  const galeria = (p.galeria || []).filter(Boolean);
  const naArvore = !$("#v-arvore").hidden;

  preencher(painel,
    h("div", { class: "pn-barra" }, h("span", { class: "pn-alca" }),
      h("button", { class: "icone", "aria-label": "Fechar", html: ico("fechar"), onclick: fecharPerfil })),
    h("header", { class: "pn-cab", style: `--gc: var(--g${p.g})` },
      av,
      h("p", { class: "pn-sobre" }, `${ordinal(p.g)} · ${GERACOES[p.g] || ""}`),
      h("h2", {}, nomeDe(p)),
      h("p", { class: "pn-rel" }, pendente(p) ? detalhePendente(p) : p.relacao),
    ),
    h("div", { class: "pn-acoes" },
      !naArvore && h("button", { class: "btn btn-peq", html: `${ico("localizar")} Ver na árvore`, onclick: () => { trocarAba("arvore"); abrirPerfil(id); } }),
      !pendente(p) && h("button", { class: "btn btn-peq", html: `${ico("parentesco")} Parentesco`, onclick: () => {
        if (par.a !== id) { par.b = par.a && par.a !== id ? par.a : RAIZ; par.a = id; }
        fecharPerfil(); trocarAba("parentesco"); renderParentesco();
      } }),
      h("button", { class: "btn btn-peq", html: `${ico("compartilhar")} Compartilhar`, onclick: () => compartilhar(p) }),
    ),
    pendente(p) && h("p", { class: "pn-aviso" }, "Este nome ainda não foi preenchido. Sabe quem é? Avise quem cuida da árvore da família."),
    h("div", { class: "pn-corpo" },
      dados.length > 0 && secao("Dados", h("dl", { class: "dados" }, dados.flatMap(([k, v]) => [h("dt", {}, k), h("dd", {}, v)]))),
      p.historia && secao("História", h("p", { class: "pn-texto" }, p.historia)),
      lin && lin.length > 1 && secao("Linhagem", h("ol", { class: "linhagem" }, lin.map(x => {
        const q = P(x);
        return h("li", { class: x === id ? "atual" : "", style: `--gc: var(--g${q.g})` },
          h("button", { onclick: () => x !== id && abrirPerfil(x) }, h("small", {}, `G${q.g}`), h("span", {}, nomeDe(q))));
      }))),
      !lin && cj.length > 0 && secao("Na família", h("p", { class: "pn-texto" }, `Faz parte da família pelo casamento com ${cj.map(x => nomeDe(P(x))).join(" e ")}.`)),
      p.pais.length > 0 && secao("Pais", lista(p.pais)),
      cj.length > 0 && secao(cj.length > 1 ? "Cônjuges" : "Cônjuge", lista(cj)),
      irm.length > 0 && secao(`Irmãos · ${irm.length}`, lista(irm)),
      fil.length > 0 && secao(`Filhos · ${fil.length}`, lista(fil)),
      galeria.length > 0 && secao("Fotos", h("div", { class: "galeria" }, galeria.map(src =>
        h("button", { onclick: () => verFoto(src), "aria-label": "Ampliar foto" }, h("img", { src, alt: "", loading: "lazy" }))))),
    ),
  );
  painel.scrollTop = 0;
  painel.classList.add("aberto");
  veu.classList.add("aberto");
  painel.setAttribute("aria-hidden", "false");
  history.replaceState(null, "", `#${id}`);
  if (!$("#v-arvore").hidden) { destacar(id); focar(id); }
}
function fecharPerfil() {
  if (!painel.classList.contains("aberto")) return;
  painel.classList.remove("aberto");
  veu.classList.remove("aberto");
  painel.setAttribute("aria-hidden", "true");
  perfilAtual = null;
  destacar(null);
  history.replaceState(null, "", location.pathname + location.search);
}
async function compartilhar(p) {
  const url = `${location.origin}${location.pathname}#${p.id}`;
  const dados = { title: `${nomeDe(p)} · ${TITULO}`, text: `Conheça ${nomeDe(p)} na árvore da ${TITULO}`, url };
  try {
    if (navigator.share) { await navigator.share(dados); return; }
    await navigator.clipboard.writeText(url);
    aviso("Link copiado");
  } catch (e) {
    if (e && e.name === "AbortError") return;
    prompt("Copie o link:", url);
  }
}
function verFoto(src) {
  const v = $("#visor");
  v.replaceChildren(h("img", { src, alt: "" }));
  v.onclick = () => v.close();
  v.showModal();
}

// ---------------------------------------------------------------------------
// Busca
// ---------------------------------------------------------------------------
const busca = $("#busca"), buscaInput = $("#busca-input"), buscaLista = $("#busca-lista");
const semAcento = x => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
let resultados = [], ativo = 0;

function abrirBusca() {
  buscaInput.value = "";
  renderBusca();
  busca.showModal();
  buscaInput.focus();
}
function renderBusca() {
  const q = semAcento(buscaInput.value.trim());
  const nomes = PESSOAS.filter(p => !pendente(p));
  resultados = q ? nomes.filter(p => semAcento(p.nome).includes(q)).slice(0, 12) : nomes.filter(p => p.g <= 2);
  ativo = 0;
  preencher(buscaLista,
    !q && h("div", { class: "busca-rotulo" }, "Raízes e filhos"),
    ...resultados.map((p, i) => {
      const nome = h("b");
      const pos = q ? semAcento(p.nome).indexOf(q) : -1;
      if (pos >= 0) nome.append(p.nome.slice(0, pos), h("mark", {}, p.nome.slice(pos, pos + q.length)), p.nome.slice(pos + q.length));
      else nome.textContent = p.nome;
      return h("button", {
        class: "pessoa-linha", role: "option", "aria-selected": String(i === 0),
        onclick: () => escolher(p.id), onmousemove: () => marcar(i),
      }, avatar(p), h("span", {}, nome, h("small", {}, `${p.relacao} · ${ordinal(p.g)}`)));
    }),
    q && !resultados.length && h("div", { class: "busca-vazio" }, "Ninguém encontrado com esse nome."),
  );
}
function marcar(i) {
  ativo = i;
  $$(".pessoa-linha", buscaLista).forEach((b, j) => b.setAttribute("aria-selected", String(j === i)));
  $$(".pessoa-linha", buscaLista)[i]?.scrollIntoView({ block: "nearest" });
}
function escolher(id) {
  busca.close();
  if ($("#app").hidden) entrar("arvore");
  abrirPerfil(id);
}
buscaInput.addEventListener("input", renderBusca);
buscaInput.addEventListener("keydown", e => {
  if (e.key === "ArrowDown") { e.preventDefault(); marcar(Math.min(resultados.length - 1, ativo + 1)); }
  else if (e.key === "ArrowUp") { e.preventDefault(); marcar(Math.max(0, ativo - 1)); }
  else if (e.key === "Enter" && resultados[ativo]) { e.preventDefault(); escolher(resultados[ativo].id); }
});
busca.addEventListener("click", e => { if (e.target === busca) busca.close(); });

// ---------------------------------------------------------------------------
// Navegação e tema
// ---------------------------------------------------------------------------
let arvorePronta = false;
function trocarAba(nome) {
  for (const b of $$(".aba")) b.setAttribute("aria-selected", String(b.dataset.aba === nome));
  for (const v of $$(".vista")) {
    const ativa = v.id === `v-${nome}`;
    if (ativa && v.hidden) { v.hidden = false; v.classList.remove("entra"); void v.offsetWidth; v.classList.add("entra"); }
    else if (!ativa) v.hidden = true;
  }
  if (nome === "arvore" && !arvorePronta) { arvorePronta = true; vistaInicial(false); }
  if (nome !== "arvore") destacar(null);
  armazenamento.set("aba", nome);
}
function entrar(aba) {
  $("#inicio").hidden = true;
  $("#app").hidden = false;
  trocarAba(aba);
}

function aplicarTema(tema) {
  if (tema) document.documentElement.dataset.theme = tema;
  const escuro = tema ? tema === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  $$("[data-tema]").forEach(b => { b.innerHTML = ico(escuro ? "sol" : "lua"); });
  $('meta[name="theme-color"]').setAttribute("content", escuro ? "#0f1512" : "#f4efe6");
}
$$("[data-tema]").forEach(b => b.addEventListener("click", () => {
  const atual = document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const novo = atual === "dark" ? "light" : "dark";
  armazenamento.set("tema", novo);
  aplicarTema(novo);
}));

addEventListener("keydown", e => {
  const digitando = /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName);
  if ((e.key === "/" && !digitando) || (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey))) {
    e.preventDefault();
    if (!busca.open) abrirBusca();
  } else if (e.key === "Escape" && !busca.open && !$("#visor").open) fecharPerfil();
});
addEventListener("resize", () => { if (!$("#v-arvore").hidden && !perfilAtual) aplicar(); });

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------
aplicarTema(armazenamento.get("tema"));
montarAbertura();
$("#marca").innerHTML = `<img class="logo-colegio-topo" src="assets/logo-colegio.webp" alt="" /><span>${TITULO.replace(/^Família\s+/i, "")}</span>`;
$("#abrir-busca").innerHTML = `${ico("busca")}<span>Buscar pessoa…</span><kbd>/</kbd>`;
$("#busca-ico").outerHTML = ico("busca");
const ROTULOS = { arvore: "Árvore", geracoes: "Gerações", parentesco: "Parentesco" };
$$(".aba").forEach(b => { b.innerHTML = `${ico(b.dataset.aba)}<span>${ROTULOS[b.dataset.aba]}</span>`; b.onclick = () => trocarAba(b.dataset.aba); });
$$("[data-entrar]").forEach(b => b.addEventListener("click", () => entrar(b.dataset.entrar)));
$("#marca").addEventListener("click", () => { fecharPerfil(); $("#app").hidden = true; $("#inicio").hidden = false; scrollTo(0, 0); });
$("#abrir-busca").addEventListener("click", abrirBusca);
veu.addEventListener("click", fecharPerfil);

montarArvore();
montarGeracoes();
montarParentesco();
carregarFotos();

// Link direto para uma pessoa (ex.: site/#P012) pula a abertura
const alvo = location.hash.slice(1);
if (porId.has(alvo)) { entrar("arvore"); abrirPerfil(alvo); }

})();
