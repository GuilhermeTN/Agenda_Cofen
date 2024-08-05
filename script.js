document.getElementById('formulario').addEventListener('submit', function(event) {
  event.preventDefault();

  const departamentoInput = document.getElementById('departamento');
  const andarInput = document.getElementById('andar');
  const pessoasInput = document.getElementById('pessoas');
  const ramalInput = document.getElementById('ramal');

  if (!departamentoInput || !andarInput || !pessoasInput || !ramalInput) {
    console.error('Não foi possível encontrar um dos elementos de entrada.');
    return;
  }

  const formData = {
    departamento: departamentoInput.value,
    andar: andarInput.value,
    pessoas: pessoasInput.value,
    ramal: ramalInput.value
  };

  fetch('/saveForm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    addRowToTable(formData);
    showNotification();
  })
  .catch((error) => {
    console.error('Error:', error);
  });
});

async function deleteRow(ramal, row) {
  console.log('Deleting row with ramal:', ramal);

  try {
    const response = await fetch('/deleteForm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ramal })
    });

    const data = await response.json();
    console.log('Server response:', data); // Log da resposta do servidor

    // Assuming successful deletion, remove row from table
    if (data.success) {
      row.remove(); // Remove a linha da tabela imediatamente
      showNotification2(); // Opcional: mostrar uma notificação de sucesso
    } else {
      console.error('Erro ao deletar o ramal:', data.error);
    }
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
  }
}


function addRowToTable(data) {
  const table = document.getElementById('minhaTabela');
  const newRow = table.insertRow();

  const departamentoCell = newRow.insertCell(0);
  const andarCell = newRow.insertCell(1);
  const pessoasCell = newRow.insertCell(2);
  const ramalCell = newRow.insertCell(3);

  departamentoCell.textContent = data.departamento;
  andarCell.textContent = data.andar;
  pessoasCell.textContent = data.pessoas;
  ramalCell.textContent = data.ramal;

  // Add delete button with event listener
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="fa-regular fa-trash-can fa-2x"></i>';
  deleteButton.onclick = function() {
    deleteRow(data.ramal, newRow);
  };
  ramalCell.appendChild(deleteButton);
}

function showNotification() {
  const notification = document.getElementById('notification');
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}
function showNotification2() {
  const notification = document.getElementById('notification2');
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

async function fetchData() {
  try {
      const response = await fetch('data.json');
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
              <span class="ramal" style="padding-left:4.5%" onclick="copyRamal('${data.ramal}')">${data.ramal}</span>
              <span class="mensagem-copiado">Ramal copiado com sucesso!</span>
              <button style="margin-left:50%; border:none; background: none;" onclick="deleteRow('${data.ramal}', this.parentElement.parentElement)"><i style="color:#ffffff; cursor:pointer"; class="fa-regular fa-trash-can fa-lg "></i></button>
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

function filtrarPordepartamento() {
  const departamentoSelecionado = document.getElementById('selecionardepartamento').value;
  const linhas = document.querySelectorAll('#minhaTabela tr');
  linhas.forEach(linha => {
    const departamento = linha.querySelector('td:first-child').textContent;
    if (departamentoSelecionado === '' || departamento === departamentoSelecionado) {
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
  const selecionardepartamento = document.getElementById("selecionardepartamento");
  const linhasTabela = document.querySelectorAll("#minhaTabela tr");
  const ramais = document.querySelectorAll('.ramal');

  meuInput.addEventListener('keyup', function () {
    const filtro = meuInput.value.toUpperCase();
    linhasTabela.forEach(linha => {
      const valorTxt = linha.children[2].textContent.toUpperCase();
      linha.style.display = valorTxt.includes(filtro) ? "" : "none";
    });
  });

  selecionardepartamento.addEventListener('change', function () {
    const departamentoSelecionado = selecionardepartamento.value.toUpperCase();
    linhasTabela.forEach(linha => {
      const departamento = linha.children[0].textContent.toUpperCase();
      linha.style.display = departamento === departamentoSelecionado || departamentoSelecionado === "" ? "" : "none";
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
