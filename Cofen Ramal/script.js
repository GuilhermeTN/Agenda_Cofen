function redirecionar(){
  window.location.href = "http://cofen.gov.br"
}

async function fetchData() {
  try {
      const response = await fetch('../data.json');
      const data = await response.json();
      console.log("chegou aqui")
      return data;
  } catch (error) {
      console.error('Erro ao carregar o JSON:', error);
      return [];
  }
}

function createTableRow(data) {
  return `
      <tr>
          <td>${data.departamento}</td>
          <td>${data.andar}</td>
          <td>${data.pessoas}</td>
          <td class="container-ramal">
              <span class="ramal" onclick="copyRamal('${data.ramal}')">${data.ramal}</span>
              <span class="mensagem-copiado">Ramal copiado com sucesso!</span>
          </td>
      </tr>
  `;
}

async function loadTable() {
  const data = await fetchData();
  const tableBody = document.getElementById('minhaTabela');
  tableBody.innerHTML = data.map(createTableRow).join('');
  addEventListeners();
}

function filtrarPorSetor() {
  const setorSelecionado = document.getElementById('selecionarSetor').value;
  const linhas = document.querySelectorAll('#minhaTabela tr');
  linhas.forEach(linha => {
    const setor = linha.querySelector('td:first-child').textContent;
    if (setorSelecionado === '' || setor === setorSelecionado) {
      linha.style.display = '';
    } else {
      linha.style.display = 'none';
    }
  });
}

function copyRamal(ramal) {
  navigator.clipboard.writeText(ramal).then(() => {
    console.log('Ramal copiado:', ramal);
  }).catch(err => {
    console.error('Erro ao copiar ramal:', err);
  });
}

function addEventListeners() {
  const meuInput = document.getElementById("meuInput");
  const selecionarSetor = document.getElementById("selecionarSetor");
  const linhasTabela = document.querySelectorAll("#minhaTabela tr");
  const ramais = document.querySelectorAll('.ramal');

  meuInput.addEventListener('keyup', function () {
    const filtro = meuInput.value.toUpperCase();
    linhasTabela.forEach(linha => {
      const valorTxt = linha.children[2].textContent.toUpperCase();
      linha.style.display = valorTxt.includes(filtro) ? "" : "none";
    });
  });

  selecionarSetor.addEventListener('change', function () {
    const setorSelecionado = selecionarSetor.value.toUpperCase();
    linhasTabela.forEach(linha => {
      const setor = linha.children[0].textContent.toUpperCase();
      linha.style.display = setor === setorSelecionado || setorSelecionado === "" ? "" : "none";
    });
  });

  ramais.forEach(ramal => {
    ramal.addEventListener('click', function () {
      const numeroRamal = ramal.textContent.trim();
      copiarParaClipboard(numeroRamal);
      const mensagemElemento = ramal.nextElementSibling;
      mensagemElemento.style.display = 'inline';
      setTimeout(() => {
        mensagemElemento.style.display = 'none';
      }, 2000);
    });
  });
}

function copiarParaClipboard(texto) {
  const areaTransferencia = document.createElement('textarea');
  areaTransferencia.value = texto;
  document.body.appendChild(areaTransferencia);
  areaTransferencia.select();
  document.execCommand('copy');
  document.body.removeChild(areaTransferencia);
}

let ordemAscendente = true;

function ordenarTabela(coluna) {
  const tbody = document.getElementById("minhaTabela");
  const linhas = [...tbody.rows];
  const iconesChevron = document.querySelectorAll('.fa-solid');

  iconesChevron.forEach(icone => {
    icone.classList.remove("fa-chevron-up");
    icone.classList.remove("fa-chevron-down");
  });

  linhas.sort((a, b) => {
    const valorA = a.cells[coluna].textContent.trim().toUpperCase();
    const valorB = b.cells[coluna].textContent.trim().toUpperCase();
    if (valorA < valorB) return -1;
    if (valorA > valorB) return 1;
    return 0;
  });

  if (!ordemAscendente) {
    linhas.reverse();
    iconesChevron[coluna].classList.add("fa-chevron-up");
  } else {
    iconesChevron[coluna].classList.add("fa-chevron-down");
  }

  tbody.innerHTML = "";
  linhas.forEach(linha => {
    tbody.appendChild(linha);
  });

  ordemAscendente = !ordemAscendente;
}

window.onload = loadTable;



