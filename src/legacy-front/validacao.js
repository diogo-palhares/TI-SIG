// Validações de dados para o sistema 

/**
 * Valida CPF
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
function validarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto < 2 ? 0 : resto;
    
    if (parseInt(cpf.charAt(9)) !== digito1) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto < 2 ? 0 : resto;
    
    return parseInt(cpf.charAt(10)) === digito2;
}

/**
 * Valida email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida telefone brasileiro
 * @param {string} telefone - Telefone a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
function validarTelefone(telefone) {
    // Remove caracteres não numéricos
    telefone = telefone.replace(/[^\d]/g, '');
    
    // Verifica se tem 10 ou 11 dígitos (com DDD)
    if (telefone.length < 10 || telefone.length > 11) return false;
    
    // Verifica se o DDD é válido (11 a 99)
    const ddd = parseInt(telefone.substring(0, 2));
    if (ddd < 11 || ddd > 99) return false;
    
    // Para celular (11 dígitos), o terceiro dígito deve ser 9
    if (telefone.length === 11 && telefone.charAt(2) !== '9') return false;
    
    return true;
}

/**
 * Valida CEP
 * @param {string} cep - CEP a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
function validarCEP(cep) {
    // Remove caracteres não numéricos
    cep = cep.replace(/[^\d]/g, '');
    
    // Verifica se tem 8 dígitos
    return cep.length === 8;
}

/**
 * Valida data de nascimento
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {boolean} - true se válida, false se inválida
 */
function validarDataNascimento(data) {
    if (!data) return false;
    
    const hoje = new Date();
    const nascimento = new Date(data);
    
    // Verifica se a data é válida
    if (isNaN(nascimento.getTime())) return false;
    
    // Verifica se não é uma data futura
    if (nascimento > hoje) return false;
    
    // Verifica se a pessoa não tem mais de 150 anos
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    if (idade > 150) return false;
    
    return true;
}

/**
 * Valida nome (apenas letras e espaços)
 * @param {string} nome - Nome a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
function validarNome(nome) {
    if (!nome || nome.trim().length < 2) return false;
    
    // Permite apenas letras, espaços, acentos e hífens
    const regex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
    return regex.test(nome.trim());
}

/**
 * Valida RG
 * @param {string} rg - RG a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
function validarRG(rg) {
    // Remove caracteres não alfanuméricos
    rg = rg.replace(/[^\w]/g, '');
    
    // Verifica se tem entre 7 e 9 caracteres
    return rg.length >= 7 && rg.length <= 9;
}

/**
 * Formata CPF
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} - CPF formatado
 */
function formatarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone
 * @param {string} telefone - Telefone a ser formatado
 * @returns {string} - Telefone formatado
 */
function formatarTelefone(telefone) {
    telefone = telefone.replace(/[^\d]/g, '');
    
    if (telefone.length === 10) {
        return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length === 11) {
        return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    return telefone;
}

/**
 * Formata CEP
 * @param {string} cep - CEP a ser formatado
 * @returns {string} - CEP formatado
 */
function formatarCEP(cep) {
    cep = cep.replace(/[^\d]/g, '');
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Aplica validação em tempo real a um campo
 * @param {HTMLElement} campo - Elemento do campo
 * @param {Function} validador - Função de validação
 * @param {string} mensagemErro - Mensagem de erro
 */
function aplicarValidacao(campo, validador, mensagemErro) {
    const container = campo.parentElement;
    
    function validar() {
        const valor = campo.value;
        const isValido = validador(valor);
        
        // Remove mensagens de erro anteriores
        const erroAnterior = container.querySelector('.erro-validacao');
        if (erroAnterior) {
            erroAnterior.remove();
        }
        
        // Remove classes de erro
        campo.classList.remove('campo-erro', 'campo-valido');
        
        if (valor.trim() === '') {
            // Campo vazio - não mostra erro nem sucesso
            return;
        }
        
        if (isValido) {
            campo.classList.add('campo-valido');
        } else {
            campo.classList.add('campo-erro');
            
            // Adiciona mensagem de erro
            const divErro = document.createElement('div');
            divErro.className = 'erro-validacao';
            divErro.textContent = mensagemErro;
            container.appendChild(divErro);
        }
    }
    
    // Aplica validação em tempo real
    campo.addEventListener('blur', validar);
    campo.addEventListener('input', function() {
        // Delay para não validar a cada tecla
        clearTimeout(this.validationTimeout);
        this.validationTimeout = setTimeout(validar, 500);
    });
}

/**
 * Inicializa validações para formulário de paciente
 */
function inicializarValidacoesPaciente() {
    // CPF
    const campoCPF = document.getElementById('cpf');
    if (campoCPF) {
        aplicarValidacao(campoCPF, validarCPF, 'CPF inválido');
        
        // Formatação automática
        campoCPF.addEventListener('input', function() {
            let valor = this.value.replace(/[^\d]/g, '');
            if (valor.length <= 11) {
                this.value = formatarCPF(valor);
            }
        });
    }
    
    // Email
    const campoEmail = document.getElementById('email');
    if (campoEmail) {
        aplicarValidacao(campoEmail, validarEmail, 'Email inválido');
    }
    
    // Telefone
    const campoTelefone = document.getElementById('telefone');
    if (campoTelefone) {
        aplicarValidacao(campoTelefone, validarTelefone, 'Telefone inválido');
        
        // Formatação automática
        campoTelefone.addEventListener('input', function() {
            let valor = this.value.replace(/[^\d]/g, '');
            if (valor.length <= 11) {
                this.value = formatarTelefone(valor);
            }
        });
    }
    
    // CEP
    const campoCEP = document.getElementById('cep');
    if (campoCEP) {
        aplicarValidacao(campoCEP, validarCEP, 'CEP inválido');
        
        // Formatação automática
        campoCEP.addEventListener('input', function() {
            let valor = this.value.replace(/[^\d]/g, '');
            if (valor.length <= 8) {
                this.value = formatarCEP(valor);
            }
        });
    }
    
    // Data de nascimento
    const campoDataNascimento = document.getElementById('data_nascimento');
    if (campoDataNascimento) {
        aplicarValidacao(campoDataNascimento, validarDataNascimento, 'Data de nascimento inválida');
    }
    
    // Nome
    const campoNome = document.getElementById('nome');
    if (campoNome) {
        aplicarValidacao(campoNome, validarNome, 'Nome deve conter apenas letras e ter pelo menos 2 caracteres');
    }
    
    // RG
    const campoRG = document.getElementById('rg');
    if (campoRG) {
        aplicarValidacao(campoRG, validarRG, 'RG inválido');
    }
}

/**
 * Valida formulário completo antes do envio
 * @param {HTMLFormElement} formulario - Formulário a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
function validarFormulario(formulario) {
    let isValido = true;
    const campos = formulario.querySelectorAll('input[required], select[required]');
    
    campos.forEach(campo => {
        const valor = campo.value.trim();
        
        if (valor === '') {
            campo.classList.add('campo-erro');
            isValido = false;
            return;
        }
        
        // Validações específicas por tipo de campo
        switch (campo.id) {
            case 'cpf':
                if (!validarCPF(valor)) {
                    campo.classList.add('campo-erro');
                    isValido = false;
                }
                break;
            case 'email':
                if (!validarEmail(valor)) {
                    campo.classList.add('campo-erro');
                    isValido = false;
                }
                break;
            case 'telefone':
                if (!validarTelefone(valor)) {
                    campo.classList.add('campo-erro');
                    isValido = false;
                }
                break;
            case 'cep':
                if (!validarCEP(valor)) {
                    campo.classList.add('campo-erro');
                    isValido = false;
                }
                break;
            case 'data_nascimento':
                if (!validarDataNascimento(valor)) {
                    campo.classList.add('campo-erro');
                    isValido = false;
                }
                break;
            case 'nome':
                if (!validarNome(valor)) {
                    campo.classList.add('campo-erro');
                    isValido = false;
                }
                break;
            case 'rg':
                if (!validarRG(valor)) {
                    campo.classList.add('campo-erro');
                    isValido = false;
                }
                break;
        }
    });
    
    return isValido;
}

// Inicializa validações quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    inicializarValidacoesPaciente();
});

