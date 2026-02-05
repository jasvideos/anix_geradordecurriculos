function atualizar() {
    const campos = ['nome', 'cargo', 'email', 'tel', 'endereco', 'estado-civil', 'nascimento', 'resumo'];
    
    campos.forEach(campo => {
        const valor = document.getElementById(`in-${campo}`).value;
        const output = document.getElementById(`out-${campo}`);
        
        if (output) {
            output.innerText = valor;
            if (campo === 'resumo') {
                const section = output.closest('section');
                if (section) section.style.display = valor.trim() ? 'block' : 'none';
            }
        }
    });
}

function mascaraData(input) {
    let v = input.value.replace(/\D/g, ""); // Remove tudo o que não é dígito
    if (v.length > 8) v = v.slice(0, 8); // Limita a 8 números

    if (v.length > 4) {
        v = v.replace(/^(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
    } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,2})/, "$1/$2");
    }
    
    input.value = v;
    atualizar();
}

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function exportPDF() {
    mostrarPopupDoacao(executarExportPDF);
}

async function executarExportPDF() {
    const { jsPDF } = window.jspdf;
    const elemento = document.getElementById('resume-preview');
    
    // Alerta o usuário para aguardar
    const btn = document.querySelector('.btn-download');
    btn.innerText = "⏳ Gerando PDF...";

    const canvas = await html2canvas(elemento, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save("meu-curriculo.pdf");
    
    btn.innerText = "📥 Baixar Currículo em PDF";
}
function mudarModelo(nomeDoModelo) {
    const preview = document.getElementById('resume-preview');
    
    // Remove todas as classes de modelo possíveis
    preview.classList.remove('modelo-moderno', 'modelo-minimalista', 'modelo-vibrante');
    
    // Adiciona a classe do modelo escolhido
    preview.classList.add(nomeDoModelo);
}
function carregarFoto(event) {
    const output = document.getElementById('out-foto');
    const arquivo = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function() {
        // Apenas define a imagem carregada. O CSS cuida de mostrar/esconder.
        output.src = reader.result; 
    }

    if (arquivo) {
        reader.readAsDataURL(arquivo);
    }
}

// Garante que o espaço da foto seja exibido (ou não) de acordo com o CSS na carga inicial.
document.addEventListener('DOMContentLoaded', () => {
    const foto = document.getElementById('out-foto');
    if (foto) {
        // Remove qualquer estilo 'display' inline para que as regras do CSS sejam aplicadas.
        foto.style.display = ''; 
    }

    // Adiciona o listener para o input de foto, garantindo que o upload funcione.
    const inputFoto = document.getElementById('in-foto');
    if (inputFoto) {
        inputFoto.addEventListener('change', carregarFoto);
    }

    // Adiciona um campo de experiência vazio ao iniciar
    adicionarExperiencia();
    adicionarFormacao();
    adicionarCurso();

    // Inicializa a visibilidade das seções (esconde se estiverem vazias)
    renderizarHabilidades();
    atualizarExperiencia();
    atualizarFormacao();
    atualizarCursos();

    // Esconde o resumo inicialmente se estiver vazio
    const outResumo = document.getElementById('out-resumo');
    if (outResumo && !document.getElementById('in-resumo').value) {
        const sec = outResumo.closest('section');
        if (sec) sec.style.display = 'none';
    }
});

async function gerarResumoIA() {
    const cargo = document.getElementById('in-cargo').value;
    const resumoInput = document.getElementById('in-resumo');

    if (!cargo) {
        alert("Por favor, preencha o campo 'Cargo' primeiro para que a IA possa gerar um resumo personalizado.");
        return;
    }

    const sugestoes =  [
        `Profissional apaixonado por atuar como ${cargo}, com foco em entregar resultados de alta qualidade. Possuo habilidade em trabalhar em equipe e resolver problemas complexos de forma criativa. Busco oportunidades para aplicar meu conhecimento e crescer junto com a empresa.`,
        `Como ${cargo}, dedico-me a aprimorar processos e garantir a excelência em cada projeto. Sou organizado, proativo e estou sempre em busca de novos desafios que permitam o desenvolvimento contínuo das minhas competências.`,
        `Atuando como ${cargo}, trago uma visão estratégica e orientada para a inovação. Tenho facilidade de adaptação e comunicação, visando sempre contribuir para um ambiente de trabalho colaborativo e produtivo.`,
        `Em busca da minha primeira oportunidade como ${cargo}, sou um profissional dedicado e ansioso para aprender. Tenho facilidade em trabalhar em equipe, responsabilidade e muita vontade de contribuir para o crescimento da empresa enquanto desenvolvo minhas habilidades profissionais.`
    ];

    // Exibe as sugestões no popup
    exibirSugestoes(sugestoes);
    
}

function exibirSugestoes(sugestoes) {
    const popup = document.getElementById('ia-popup');
    const sugestoesContainer = document.getElementById('ia-sugestoes');

    // Limpa sugestões anteriores
    sugestoesContainer.innerHTML = '';

    sugestoes.forEach((sugestao, index) => {
        const btn = document.createElement('button');
        btn.innerText = sugestao;
        btn.classList.add('btn-ia');
        btn.style.width = '100%';
        btn.style.marginBottom = '5px';
        btn.onclick = function() {
            document.getElementById('in-resumo').value = sugestao;
            atualizar();
            fecharPopup();
        };
        sugestoesContainer.appendChild(btn);
    });

    popup.style.display = 'block'; // Exibe o popup
}

function fecharPopup() {
    document.getElementById('ia-popup').style.display = 'none';
}

function adicionarExperiencia() {
    const container = document.getElementById('container-exp');
    const div = document.createElement('div');
    div.className = 'exp-item';
    
    // Cria os inputs HTML para Empresa, Cargo, Inicio e Fim
    div.innerHTML = `
        <button class="btn-remover" onclick="removerItem(this)" title="Remover item">&times;</button>
        <div class="grid-inputs" style="margin-bottom: 5px; grid-template-columns: 1fr 1fr;">
            <input type="text" placeholder="Empresa" class="exp-empresa" oninput="atualizarExperiencia()">
            <input type="text" placeholder="Cargo" class="exp-cargo" oninput="atualizarExperiencia()">
        </div>
        <div class="grid-inputs" style="margin-bottom: 0; grid-template-columns: 1fr 1fr;">
            <input type="text" placeholder="Início (ex: 2020)" class="exp-inicio" oninput="atualizarExperiencia()">
            <input type="text" placeholder="Final (ex: Atual)" class="exp-fim" oninput="atualizarExperiencia()">
        </div>
    `;
    container.appendChild(div);
}

function atualizarExperiencia() {
    const itens = document.querySelectorAll('.exp-item');
    let htmlFinal = "";
    
    itens.forEach(item => {
        const empresa = sanitizeHTML(item.querySelector('.exp-empresa').value);
        const cargo = sanitizeHTML(item.querySelector('.exp-cargo').value);
        const inicio = sanitizeHTML(item.querySelector('.exp-inicio').value);
        const fim = sanitizeHTML(item.querySelector('.exp-fim').value);
        
        if (empresa || cargo) {
            htmlFinal += `<div style="margin-bottom: 15px;"><b>${empresa}</b><br>${cargo}<br><span style="color: #555; font-size: 0.9em;">${inicio} - ${fim}</span></div>`;
        }
    });
    
    document.getElementById('out-exp').innerHTML = htmlFinal;
    const section = document.getElementById('out-exp').closest('section');
    if (section) section.style.display = htmlFinal ? 'block' : 'none';
}

function adicionarFormacao() {
    const container = document.getElementById('container-edu');
    const div = document.createElement('div');
    div.className = 'edu-item';
    
    div.innerHTML = `
        <button class="btn-remover" onclick="removerItem(this)" title="Remover item">&times;</button>
        <div class="grid-inputs" style="margin-bottom: 5px; grid-template-columns: 1fr 1fr;">
            <input type="text" placeholder="Instituição" class="edu-inst" oninput="atualizarFormacao()">
            <input type="text" placeholder="Curso" class="edu-curso" oninput="atualizarFormacao()">
        </div>
        <div class="grid-inputs" style="margin-bottom: 0; grid-template-columns: 1fr 1fr;">
            <input type="text" placeholder="Grau/Nível" class="edu-grau" oninput="atualizarFormacao()">
            <input type="text" placeholder="Período" class="edu-periodo" oninput="atualizarFormacao()">
        </div>
    `;
    container.appendChild(div);
}

function atualizarFormacao() {
    const itens = document.querySelectorAll('.edu-item');
    let htmlFinal = "";
    
    itens.forEach(item => {
        const inst = sanitizeHTML(item.querySelector('.edu-inst').value);
        const curso = sanitizeHTML(item.querySelector('.edu-curso').value);
        const grau = sanitizeHTML(item.querySelector('.edu-grau').value);
        const periodo = sanitizeHTML(item.querySelector('.edu-periodo').value);
        
        if (inst || curso) {
            htmlFinal += `<div style="margin-bottom: 15px;"><b>${curso}</b><br>${inst} - ${grau}<br><span style="color: #555; font-size: 0.9em;">${periodo}</span></div>`;
        }
    });
    
    document.getElementById('out-edu').innerHTML = htmlFinal;
    const section = document.getElementById('out-edu').closest('section');
    if (section) section.style.display = htmlFinal ? 'block' : 'none';
}

function adicionarCurso() {
    const container = document.getElementById('container-cursos');
    const div = document.createElement('div');
    div.className = 'curso-item';
    
    div.innerHTML = `
        <button class="btn-remover" onclick="removerItem(this)" title="Remover item">&times;</button>
        <div class="grid-inputs" style="margin-bottom: 5px; grid-template-columns: 1fr 1fr;">
            <input type="text" placeholder="Instituição" class="curso-inst" oninput="atualizarCursos()">
            <input type="text" placeholder="Curso" class="curso-nome" oninput="atualizarCursos()">
        </div>
        <div class="grid-inputs" style="margin-bottom: 0; grid-template-columns: 1fr;">
            <input type="text" placeholder="Período" class="curso-periodo" oninput="atualizarCursos()">
        </div>
    `;
    container.appendChild(div);
}

function atualizarCursos() {
    const itens = document.querySelectorAll('.curso-item');
    let htmlFinal = "";
    
    itens.forEach(item => {
        const inst = sanitizeHTML(item.querySelector('.curso-inst').value);
        const curso = sanitizeHTML(item.querySelector('.curso-nome').value);
        const periodo = sanitizeHTML(item.querySelector('.curso-periodo').value);
        
        if (inst || curso) {
            htmlFinal += `<div style="margin-bottom: 15px;"><b>${curso}</b><br>${inst}<br><span style="color: #555; font-size: 0.9em;">${periodo}</span></div>`;
        }
    });
    
    document.getElementById('out-cursos').innerHTML = htmlFinal;
    const section = document.getElementById('out-cursos').closest('section');
    if (section) section.style.display = htmlFinal ? 'block' : 'none';
}

function removerItem(botao) {
    const item = botao.closest('.exp-item, .edu-item, .curso-item');
    if (item) {
        const containerId = item.parentElement.id;
        item.remove();

        // Chamar a função de atualização correta para o preview
        if (containerId === 'container-exp') {
            atualizarExperiencia();
        } else if (containerId === 'container-edu') {
            atualizarFormacao();
        } else if (containerId === 'container-cursos') {
            atualizarCursos();
        }
    }
}

// --- LÓGICA DE HABILIDADES ---
let habilidadesSelecionadas = [];

function abrirPopupHabilidades() {
    const popup = document.getElementById('habilidades-popup');
    const container = document.getElementById('lista-habilidades-popup');
    container.innerHTML = '';

    const opcoes = [
        "Liderança", "Negociação", "Adaptabilidade", "Comunicação eficaz",
        "Autoconfiança", "Resiliência", "Autoconhecimento", "Pensamento crítico",
        "Trabalho em equipe", "Criatividade", "Proatividade", "Inteligência emocional",
        "Resolução de problemas", "Foco em resultados", "Gestão do tempo"
    ];

    opcoes.forEach(skill => {
        const btn = document.createElement('button');
        btn.innerText = skill;
        btn.className = 'btn-ia'; 
        btn.style.flex = '1 0 40%'; // Botões ocupam espaço proporcional
        btn.onclick = () => {
            adicionarHabilidade(skill);
            fecharPopupHabilidades();
        };
        container.appendChild(btn);
    });

    popup.style.display = 'block';
}

function fecharPopupHabilidades() {
    document.getElementById('habilidades-popup').style.display = 'none';
}

function adicionarHabilidade(skill) {
    if (!habilidadesSelecionadas.includes(skill)) {
        habilidadesSelecionadas.push(skill);
        renderizarHabilidades();
    }
}

function removerHabilidade(index) {
    habilidadesSelecionadas.splice(index, 1);
    renderizarHabilidades();
}

function renderizarHabilidades() {
    // Atualiza Editor (Tags com botão de remover)
    const containerEditor = document.getElementById('container-habilidades-editor');
    containerEditor.innerHTML = habilidadesSelecionadas.map((skill, index) => 
        `<span class="tag-skill">${skill} <span onclick="removerHabilidade(${index})" style="cursor:pointer; font-weight:bold; margin-left:5px; color:red;">&times;</span></span>`
    ).join('');

    // Atualiza Preview (Lista)
    const containerPreview = document.getElementById('out-habilidades');
    containerPreview.innerHTML = habilidadesSelecionadas.map(h => `<li>${h}</li>`).join('');
    const section = containerPreview.closest('section');
    if (section) section.style.display = habilidadesSelecionadas.length ? 'block' : 'none';
}

function compartilharWhatsapp() {
    mostrarPopupDoacao(executarCompartilharWhatsapp);
}

async function executarCompartilharWhatsapp() {
    const { jsPDF } = window.jspdf;
    const elemento = document.getElementById('resume-preview');
    const btn = document.querySelector('.btn-whatsapp');
    const textoOriginal = btn.innerText;

    btn.innerText = "⏳ Gerando...";

    try {
        const canvas = await html2canvas(elemento, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        
        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], "meu-curriculo.pdf", { type: "application/pdf" });

        // Verifica se é celular. No computador, forçamos o download + link para evitar o menu do sistema sem WhatsApp.
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Tenta compartilhar o arquivo nativamente (Apenas se for Mobile)
        if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Meu Currículo',
                text: 'Segue meu currículo em anexo.'
            });
        } else {
            // Fallback para Desktop: Baixa o PDF e abre o WhatsApp Web.
            pdf.save("meu-curriculo.pdf"); // Inicia o download do PDF

            const texto = encodeURIComponent("Olá! Acabei de gerar meu currículo. O arquivo foi baixado no seu computador, agora é só anexá-lo aqui na conversa.");
            window.open(`https://wa.me/?text=${texto}`, '_blank');
            alert("Seu currículo foi baixado! Agora, anexe o arquivo 'meu-curriculo.pdf' na conversa do WhatsApp que abriu.");
        }
    } catch (error) {
        console.error("Erro ao compartilhar:", error);
        alert("Ocorreu um erro ao tentar compartilhar.");
    } finally {
        btn.innerText = textoOriginal;
    }
}

function mostrarPopupDoacao(callback) {
    let popup = document.getElementById('doacao-popup');
    
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'doacao-popup';
        popup.className = 'ia-popup'; // Reutiliza o estilo do modal existente
        
        popup.innerHTML = `
            <div class="ia-popup-content" style="text-align: center;">
                <h3 style="color: #667eea; margin-top: 0; font-size: 18px;">Curtiu o app? ☕</h3>
                <p style="font-size: 15px; line-height: 1.6; color: #555; margin: 20px 0;">
                    Se ele te ajudou, você pode retribuir com qualquer valor para apoiar o desenvolvedor. <br>
                    Toda doação é voluntária e muito bem-vinda!
                </p>

                <div style="margin: 25px 0; padding: 15px; background: #f7f7f7; border-radius: 8px; text-align: left;">
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #333; text-align: center;">Chave PIX (Copia e Cola):</p>
                    <div style="display: flex; align-items: center; gap: 10px; background: #e9e9e9; padding: 8px; border-radius: 5px;">
                        <input type="text" id="pix-key-input" value="a7cb8e67-96be-498f-977a-1d60a6804918" readonly style="flex-grow: 1; border: none; background: transparent; font-size: 14px; color: #333;">
                        <button id="btn-copiar-pix" style="padding: 5px 10px; border: none; background: #007AFF; color: white; border-radius: 5px; cursor: pointer;">Copiar</button>
                    </div>
                    <p style="margin: 20px 0 10px 0; font-weight: bold; color: #333; text-align: center;">Ou leia o QR Code:</p>
                    <img src="qrcode-pix.JPEG" alt="QR Code PIX" style="width: 150px; height: 150px; margin: 0 auto; display: block; border: 1px solid #ddd; background: #fff;">
                </div>

                <button id="btn-fechar-doacao" class="btn-download" style="background: #4CAF50; border: none; margin-top: 10px;">
                    Fechar e continuar no app
                </button>
            </div>
        `;
        document.body.appendChild(popup);

        // Adiciona a lógica do botão de copiar, apenas na primeira vez que o popup é criado
        const btnCopiar = document.getElementById('btn-copiar-pix');
        btnCopiar.onclick = function() {
            const pixInput = document.getElementById('pix-key-input');
            navigator.clipboard.writeText(pixInput.value).then(() => {
                btnCopiar.innerText = 'Copiado!';
                setTimeout(() => { btnCopiar.innerText = 'Copiar'; }, 2000);
            }).catch(err => {
                console.error('Erro ao copiar a chave PIX: ', err);
                alert('Não foi possível copiar a chave.');
            });
        };
    }
    
    // Garante que o botão execute a ação correta (callback) passada desta vez
    const btn = document.getElementById('btn-fechar-doacao');
    btn.onclick = function() {
        popup.style.display = 'none';
        if (callback) callback();
    };
    
    popup.style.display = 'block';
}

function fecharIntroPopup() {
    document.getElementById('intro-popup').style.display = 'none';
}
