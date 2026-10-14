// Dados da árvore genealógica (atualizado a partir da planilha "Arvore_genealogica_base_estruturada CORRIGIDA").
//
// Campos de cada pessoa:
//   id       – código único (não mude depois de criado)
//   nome     – nome completo
//   g        – geração (1 a 6)
//   sexo     – "F" ou "M"; flexiona os termos de parentesco (tia, sogra, prima…)
//   relacao  – texto exibido abaixo do nome
//   pais     – ids do pai e/ou da mãe (vazio para quem entrou na família por casamento)
//   conjuge  – (opcional) id do cônjuge, só é necessário quando o casal NÃO tem filhos cadastrados
//   foto     – (opcional) caminho da foto; se omitido, o site procura fotos/<id>.jpg
//   galeria  – (opcional) lista de fotos extras, ex.: ["fotos/P001-casamento.jpg", "fotos/P001-1960.jpg"]
//   nascimento, falecimento, local, historia – (opcionais) aparecem no cartão da pessoa

const PESSOAS = [
  { id: "P001", nome: "Maria de Jesus Pacheco Guimarães", g: 1, sexo: "F", relacao: "Matriarca", pais: [], foto: "fotos/Professora Maria de Jesus Pacheco Guimarães.jpeg" },
  { id: "P002", nome: "Samuel Amaral Guimarães", g: 1, sexo: "M", relacao: "Patriarca", pais: [], foto: "fotos/Samuel Amaral Guimarães.jpeg" },

  { id: "P003", nome: "Maria da Conceição Moreira de Andrade", g: 2, sexo: "F", relacao: "Filha", pais: ["P001", "P002"], foto: "fotos/Maria da Conceição Moreira de Andrade.jpeg" },
  { id: "P004", nome: "Circeia Terezinha Guimarães de Souza", g: 2, sexo: "F", relacao: "Filha", pais: ["P001", "P002"], foto: "fotos/Circeia Terezinha.jpeg" },
  { id: "P005", nome: "Maria José Pacheco Guimarães", g: 2, sexo: "F", relacao: "Filha", pais: ["P001", "P002"], foto: "fotos/Maria José Pacheco Guimarães.jpeg" },
  { id: "P006", nome: "Augustinho Moreira de Andrade", g: 2, sexo: "M", relacao: "Cônjuge de filha", pais: [], foto: "fotos/Augustinho Moreira de Andrade.jpeg" },
  { id: "P007", nome: "Ubaldino Clemente de Souza", g: 2, sexo: "M", relacao: "Cônjuge de filha", pais: [], foto: "fotos/Ubaldino Clemente de Souza.jpeg" },
  { id: "P008", nome: "Walter Ogibowski", g: 2, sexo: "M", relacao: "Cônjuge de filha", pais: [], foto: "fotos/Walter Ogibowski.jpeg" },
  { id: "P009", nome: "Adélio Gomes", g: 2, sexo: "M", relacao: "Cônjuge de filha", pais: [] },

  { id: "P010", nome: "Soeli Moreira do Nascimento", g: 3, sexo: "F", relacao: "Neta", pais: ["P003", "P006"], foto: "fotos/Soeli Moreira do Nascimento.jpeg" },
  { id: "P011", nome: "Silvio Fernando de Andrade", g: 3, sexo: "M", relacao: "Neto", pais: ["P003", "P006"], foto: "fotos/Silvio Fernando de Andrade.jpeg" },
  { id: "P012", nome: "Silvani Moreira de Andrade", g: 3, sexo: "F", relacao: "Neta", pais: ["P003", "P006"], foto: "fotos/Silvani Moreira de Andrade.jpeg" },
  { id: "P013", nome: "Antonio Moreira de Andrade", g: 3, sexo: "M", relacao: "Neto", pais: ["P003", "P006"], foto: "fotos/Antônio Moreira de Andrade.jpeg" },
  { id: "P014", nome: "Maria Helena Moreira de Andrade", g: 3, sexo: "F", relacao: "Neta", pais: ["P003", "P006"], foto: "fotos/Maria Helena Moreira de Andrade.jpeg" },
  { id: "P015", nome: "Marisa Moreira de Andrade", g: 3, sexo: "F", relacao: "Neta", pais: ["P003", "P006"], foto: "fotos/Mariza Moreira de Andrade.jpeg" },
  { id: "P072", nome: "Cristina Moreira de Andrade - In Memoriam", g: 3, sexo: "F", relacao: "Neta", pais: ["P003", "P006"], foto: "" },
  { id: "P016", nome: "Rita Moreira de Andrade", g: 3, sexo: "F", relacao: "Neta", pais: ["P003", "P006"], foto: "fotos/Rita Moreira de Andrade.jpeg" },
  { id: "P017", nome: "Sandro Moreira de Andrade", g: 3, sexo: "M", relacao: "Neto", pais: ["P003", "P006"], foto: "fotos/Sandro Moreira de Andrade.jpeg" },
  { id: "P018", nome: "Ivone de Souza Braga", g: 3, sexo: "F", relacao: "Neta", pais: ["P004", "P007"], foto: "fotos/Ivone Clemente de Souza.jpeg" },
  { id: "P019", nome: "Wilson Clemente de Souza - In Memoriam", g: 3, sexo: "M", relacao: "Neto", pais: ["P004", "P007"], foto: "fotos/Wilson Clemente de Souza.jpeg" },
  { id: "P020", nome: "Marcos Antônio Clemente de Souza - In Memoriam", g: 3, sexo: "M", relacao: "Neto", pais: ["P004", "P007"], foto: "fotos/Marcos Antônio Clemente de Souza.jpeg" },
  { id: "P021", nome: "Luiz Alberto Ogibowski", g: 3, sexo: "M", relacao: "Neto", pais: ["P005", "P008"], foto: "fotos/Luiz Alberto Ogibowski.jpeg" },
  { id: "P022", nome: "José Gomes", g: 3, sexo: "M", relacao: "Neto", pais: ["P005", "P009"], foto: "fotos/José Gomes.jpeg" },
  { id: "P023", nome: "Zico Pedroso do Nascimento", g: 3, sexo: "M", relacao: "Cônjuge de neta", pais: [], foto: "fotos/Zico Pedroso do Nascimento.jpeg" },
  { id: "P024", nome: "Maria Ribeiro de Andrade", g: 3, sexo: "F", relacao: "Cônjuge de neto", pais: [], foto: "fotos/Maria Ribeiro de Andrade.jpeg" },
  { id: "P025", nome: "Valdir Correia", g: 3, sexo: "M", relacao: "Cônjuge de neta", pais: [], foto: "fotos/Valdir Correia.jpeg" },
  { id: "P026", nome: "Marilda Moreira de Andrade", g: 3, sexo: "F", relacao: "Cônjuge de neto", pais: [], foto: "fotos/Marilda Moreira de Andrade.jpeg" },
  { id: "P027", nome: "Luis Carlos Calixto Braga", g: 3, sexo: "M", relacao: "Cônjuge de neta", pais: [], foto: "fotos/Luis Carlos Calixto Braga.jpeg" },
  { id: "P028", nome: "Claudete Maria Schneider Ogibowski", g: 3, sexo: "F", relacao: "Cônjuge de neto", pais: [], foto: "fotos/Claudete Maria Schneider Ogibowski.jpeg" },
  { id: "P029", nome: "Larissa Ully Batista Gomes", g: 3, sexo: "F", relacao: "Cônjuge de neto", pais: [], foto: "fotos/Larissa Ully Batista Gomes.jpeg" },

  { id: "P030", nome: "Fernanda de Cassia Nascimento Camargo", g: 4, sexo: "F", relacao: "Bisneta", pais: ["P010", "P023"], foto: "fotos/Fernanda de Cássia Nascimento Camargo.jpeg" },
  { id: "P031", nome: "Leonardo Pedroso do Nascimento", g: 4, sexo: "M", relacao: "Bisneto", pais: ["P010", "P023"], foto: "fotos/Leonardo Pedroso do Nascimento.jpeg" },
  { id: "P032", nome: "Paula Suliane de Andrade", g: 4, sexo: "F", relacao: "Bisneta", pais: ["P011", "P024"], foto: "fotos/Paula Suliane de Andrade.jpeg" },
  { id: "P033", nome: "Fábio Moreira de Andrade", g: 4, sexo: "M", relacao: "Bisneto", pais: ["P011", "P024"], foto: "fotos/Fabio Fernando de Andrade.jpeg" },
  { id: "P034", nome: "Amanda Maria de Andrade Correia", g: 4, sexo: "F", relacao: "Bisneta", pais: ["P012", "P025"], foto: "fotos/Amanda Maria Andrade Correia.jpeg" },
  { id: "P035", nome: "Alef Morgado de Andrade", g: 4, sexo: "M", relacao: "Bisneto", pais: ["P013", "P071"], foto: "fotos/Alef Morgado de Andrade.jpeg" },
  { id: "P036", nome: "João Eugenio Moreira de Andrade", g: 4, sexo: "M", relacao: "Bisneto", pais: ["P015"], foto: "fotos/João Eugênio Andrade de Souza.jpeg" },
  { id: "P037", nome: "Amélia Maria de Andrade Oliveira", g: 4, sexo: "F", relacao: "Bisneta", pais: ["P016"], foto: "fotos/Amélia Maria de Andrade Oliveira.jpeg" },
  { id: "P038", nome: "Anthony Moreira de Andrade", g: 4, sexo: "M", relacao: "Bisneto", pais: ["P017", "P026"], foto: "fotos/Anthony Moreira de Andrade.jpeg" },
  { id: "P039", nome: "Pedro Antonio Ogibowski", g: 4, sexo: "M", relacao: "Bisneto", pais: ["P021", "P028"], foto: "fotos/Pedro Antônio Ogibowski.jpeg" },
  { id: "P040", nome: "Mariana Ogibowski", g: 4, sexo: "F", relacao: "Bisneta", pais: ["P021", "P028"], foto: "fotos/Mariana Ogibowski.jpeg" },
  { id: "P041", nome: "Rafael José Gomes", g: 4, sexo: "M", relacao: "Bisneto", pais: ["P022", "P029"], foto: "fotos/Rafael José Gomes.jpeg" },
  { id: "P042", nome: "Maria Carolina Gomes", g: 4, sexo: "F", relacao: "Bisneta", pais: ["P022", "P029"], foto: "fotos/Maria Carolina Gomes.jpeg" },
  { id: "P043", nome: "Júlio César Fernandes Camargo", g: 4, sexo: "M", relacao: "Cônjuge de bisneta", pais: [], foto: "fotos/Júlio César Fernandez Camargo.jpeg" },
  { id: "P044", nome: "Daniele Aparecida Lobachinski", g: 4, sexo: "F", relacao: "Cônjuge de bisneto", pais: [], conjuge: "P031", foto: "fotos/Danieli Aparecida Lobachinski.jpeg" },
  // CONFIRMAR: a planilha não diz de quem é cônjuge; assumido Pedro Antônio (P039) pelo sobrenome.
  { id: "P045", nome: "Carolina Rodrigues Depaoli Ogibowski", g: 4, sexo: "F", relacao: "Cônjuge de bisneto", pais: [], conjuge: "P039", foto: "fotos/Carolina Rodrigues Depaoli Ogibowski.jpeg" },

  { id: "P046", nome: "Gabriel Nascimento Camargo", g: 5, sexo: "M", relacao: "Trineto", pais: ["P030", "P043"], foto: "fotos/Gabriel Nascimento Camargo.jpeg" },
  { id: "P047", nome: "Gustavo Nascimento Camargo", g: 5, sexo: "M", relacao: "Trineto", pais: ["P030", "P043"], foto: "fotos/Gustavo Nascimento Camargo.jpeg" },
  { id: "P048", nome: "Guilherme Nascimento Camargo", g: 5, sexo: "M", relacao: "Trineto", pais: ["P030", "P043"], foto: "fotos/Guilherme Nascimento Camargo.jpeg" },
  { id: "P049", nome: "Bianca Calixto Braga", g: 4, sexo: "F", relacao: "Bisneta", pais: ["P018", "P027"], foto: "fotos/Bianca Calixto Braga.jpeg" },
  { id: "P050", nome: "Bruna Braga Volpe", g: 4, sexo: "F", relacao: "Bisneta", pais: ["P018", "P027"], foto: "fotos/Bruna Braga Volpe.jpeg" },
  { id: "P051", nome: "Luiz Carlos Calixto Braga Junior", g: 4, sexo: "M", relacao: "Bisneto", pais: ["P018", "P027"], foto: "fotos/Luis Carlos Calixto Braga Junior.jpeg" },
  { id: "P052", nome: "Noah Leonardo Pedroso do Nascimento", g: 5, sexo: "M", relacao: "Trineto", pais: ["P031", "P044"], foto: "fotos/Noah Leonardo Pedroso do Nascimento.jpeg" },
  { id: "P053", nome: "João Leonardo Pedroso do Nascimento", g: 5, sexo: "M", relacao: "Trineto", pais: ["P031", "P044"], foto: "fotos/João Leonardo Pedroso do Nascimento.jpeg" },
  { id: "P054", nome: "Gustavo Andrade Teixeira", g: 5, sexo: "M", relacao: "Trineto", pais: ["P032", "P068"], foto: "fotos/Gustavo Andrade Teixeira.jpeg" },
  { id: "P055", nome: "Murilo Basso de Andrade", g: 5, sexo: "M", relacao: "Trineto", pais: ["P033"], foto: "fotos/Murilo Basso de Andrade.jpeg" },

  { id: "P056", nome: "Ricardo Volpe", g: 4, sexo: "M", relacao: "Cônjuge de bisneta", pais: [], foto: "fotos/Ricardo Volpe.jpeg" },
  { id: "P057", nome: "Isabela Braga de Lara", g: 5, sexo: "F", relacao: "Trineta", pais: ["P049"], foto: "fotos/Isabela Braga de Lara.jpeg" },
  { id: "P058", nome: "Henrique Braga de Lara", g: 5, sexo: "M", relacao: "Trineto", pais: ["P049"], foto: "fotos/Henrique Braga de Lara.jpeg" },
  { id: "P059", nome: "Pedro Augusto Braga Volpe", g: 5, sexo: "M", relacao: "Trineto", pais: ["P050", "P056"], foto: "fotos/Pedro Augusto Braga Volpe.jpeg" },
  { id: "P060", nome: "Samuel Braga Volpe", g: 5, sexo: "M", relacao: "Trineto", pais: ["P050", "P056"], foto: "fotos/Samuel Braga Volpe.jpeg" },
  { id: "P061", nome: "Giovana Lacerda Braga", g: 5, sexo: "F", relacao: "Trineta", pais: ["P051", "P062"], foto: "fotos/Giovana Lacerda Braga.jpeg" },
  { id: "P062", nome: "Márcia Lacerda Braga", g: 4, sexo: "F", relacao: "Cônjuge de bisneto", pais: [], foto: "fotos/Marcia Lacerda Braga.jpeg" },
  { id: "P063", nome: "Juliana Lacerda Braga", g: 5, sexo: "F", relacao: "Trineta", pais: ["P051", "P062"], foto: "fotos/Juliana Lacerda Braga.jpeg" },
  { id: "P064", nome: "Marcos Paulo de Souza", g: 4, sexo: "M", relacao: "Bisneto", pais: ["P020"], foto: "fotos/Marcos Paulo de Souza.jpeg" },
  { id: "P065", nome: "Samuel de Souza", g: 4, sexo: "M", relacao: "Bisneto", pais: ["P020"], foto: "fotos/Samuel de Souza.jpeg" },
  { id: "P066", nome: "Bento Bonin Braga", g: 6, sexo: "M", relacao: "Tetraneto", pais: ["P058"], foto: "fotos/Bento Bonin Braga.jpeg" },
  { id: "P067", nome: "Giovane Andrade Teixeira", g: 5, sexo: "M", relacao: "Trineto", pais: ["P032", "P068"], foto: "fotos/Giovane Andrade Teixeira.jpeg" },
  { id: "P068", nome: "Anderson Antunes Teixeira", g: 4, sexo: "M", relacao: "Cônjuge de bisneta", pais: [], conjuge: "P032", foto: "fotos/Anderson Antunes Teixeira.jpeg" },
  { id: "P069", nome: "Ana Beatriz Ribeiro Camargo", g: 5, sexo: "F", relacao: "Cônjuge de trineto(a)", pais: [], conjuge: "P046", foto: "fotos/Ana Beatriz Ribeiro Camargo.jpeg" },
  { id: "P070", nome: "Maria Eduarda Moliani Dangui", g: 4, sexo: "F", relacao: "Cônjuge de bisneto(a)", pais: [], foto: "fotos/Maria Eduarda Moliani Dangui.jpeg" },
  { id: "P071", nome: "Ireni Morgado", g: 3, sexo: "F", relacao: "Divorciada", pais: [], foto: "fotos/Ireni Morgado.jpeg" },
];

const RAIZ = "P001";
const TITULO = "Família Pacheco Guimarães";
