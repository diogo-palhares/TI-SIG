
// DTOs (Data Transfer Objects) para comunicação com o backend

/**
 * DTO para cadastro/atualização de paciente
 */
class PacienteDTO {
    constructor() {
        this.nome = '';
        this.cpf = '';
        this.rg = '';
        this.dataNascimento = '';
        this.email = '';
        this.telefone = '';
        this.endereco = new EnderecoDTO();
        this.contatos = []; // Array de ContatoDTO
        this.informacoesMedicas = new InformacoesMedicasDTO();
        this.status = 'ativo'; // ativo, inativo
        this.dataAdmissao = '';
        this.observacoes = '';
    }

    /**
     * Cria DTO a partir de dados do formulário
     * @param {FormData|Object} formData - Dados do formulário
     * @returns {PacienteDTO} - DTO preenchido
     */
    static fromForm(formData) {
        const dto = new PacienteDTO();
        
        if (formData instanceof FormData) {
            dto.nome = formData.get('nome') || '';
            dto.cpf = formData.get('cpf') || '';
            dto.rg = formData.get('rg') || '';
            dto.dataNascimento = formData.get('data_nascimento') || '';
            dto.email = formData.get('email') || '';
            dto.telefone = formData.get('telefone') || '';
            dto.status = formData.get('status') || 'ativo';
            dto.dataAdmissao = formData.get('data_admissao') || '';
            dto.observacoes = formData.get('observacoes') || '';
            
            // Endereço
            dto.endereco = EnderecoDTO.fromForm(formData);
            
            // Informações médicas
            dto.informacoesMedicas = InformacoesMedicasDTO.fromForm(formData);
            
        } else {
            // Objeto JavaScript
            Object.assign(dto, formData);
            dto.endereco = new EnderecoDTO();
            Object.assign(dto.endereco, formData.endereco || {});
            dto.informacoesMedicas = new InformacoesMedicasDTO();
            Object.assign(dto.informacoesMedicas, formData.informacoesMedicas || {});
        }
        
        return dto;
    }

    /**
     * Valida o DTO
     * @returns {Object} - {isValid: boolean, errors: string[]}
     */
    validate() {
        const errors = [];
        
        if (!this.nome || this.nome.trim().length < 2) {
            errors.push('Nome é obrigatório e deve ter pelo menos 2 caracteres');
        }
        
        if (!this.cpf || !validarCPF(this.cpf)) {
            errors.push('CPF é obrigatório e deve ser válido');
        }
        
        if (!this.dataNascimento || !validarDataNascimento(this.dataNascimento)) {
            errors.push('Data de nascimento é obrigatória e deve ser válida');
        }
        
        if (this.email && !validarEmail(this.email)) {
            errors.push('Email deve ser válido');
        }
        
        if (this.telefone && !validarTelefone(this.telefone)) {
            errors.push('Telefone deve ser válido');
        }
        
        // Valida endereço
        const enderecoValidation = this.endereco.validate();
        if (!enderecoValidation.isValid) {
            errors.push(...enderecoValidation.errors);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Converte para JSON para envio ao backend
     * @returns {Object} - Objeto JSON
     */
    toJSON() {
        return {
            nome: this.nome.trim(),
            cpf: this.cpf.replace(/[^\d]/g, ''),
            rg: this.rg.trim(),
            dataNascimento: this.dataNascimento,
            email: this.email.trim(),
            telefone: this.telefone.replace(/[^\d]/g, ''),
            endereco: this.endereco.toJSON(),
            contatos: this.contatos.map(c => c.toJSON()),
            informacoesMedicas: this.informacoesMedicas.toJSON(),
            status: this.status,
            dataAdmissao: this.dataAdmissao,
            observacoes: this.observacoes.trim()
        };
    }
}

/**
 * DTO para endereço
 */
class EnderecoDTO {
    constructor() {
        this.logradouro = '';
        this.numero = '';
        this.complemento = '';
        this.bairro = '';
        this.cidade = '';
        this.estado = '';
    }

    static fromForm(formData) {
        const dto = new EnderecoDTO();
        
        if (formData instanceof FormData) {
            dto.cep = formData.get('cep') || '';
            dto.logradouro = formData.get('logradouro') || '';
            dto.numero = formData.get('numero') || '';
            dto.complemento = formData.get('complemento') || '';
            dto.bairro = formData.get('bairro') || '';
            dto.cidade = formData.get('cidade') || '';
            dto.estado = formData.get('estado') || '';
        } else {
            Object.assign(dto, formData);
        }
        
        return dto;
    }

    validate() {
        const errors = [];
        
        if (this.cep && !validarCEP(this.cep)) {
            errors.push('CEP deve ser válido');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    toJSON() {
        return {
            cep: this.cep.replace(/[^\d]/g, ''),
            logradouro: this.logradouro.trim(),
            numero: this.numero.trim(),
            complemento: this.complemento.trim(),
            bairro: this.bairro.trim(),
            cidade: this.cidade.trim(),
            estado: this.estado.trim()
        };
    }
}

/**
 * DTO para contato de emergência
 */
class ContatoDTO {
    constructor() {
        this.nome = '';
        this.parentesco = '';
        this.telefone = '';
        this.email = '';
        this.endereco = '';
        this.principal = false; // Se é o contato principal
    }

    static fromForm(formData, index = 0) {
        const dto = new ContatoDTO();
        
        if (formData instanceof FormData) {
            dto.nome = formData.get(`contato_nome_${index}`) || '';
            dto.parentesco = formData.get(`contato_parentesco_${index}`) || '';
            dto.telefone = formData.get(`contato_telefone_${index}`) || '';
            dto.email = formData.get(`contato_email_${index}`) || '';
            dto.endereco = formData.get(`contato_endereco_${index}`) || '';
            dto.principal = formData.get(`contato_principal_${index}`) === 'true';
        } else {
            Object.assign(dto, formData);
        }
        
        return dto;
    }

    validate() {
        const errors = [];
        
        if (!this.nome || this.nome.trim().length < 2) {
            errors.push('Nome do contato é obrigatório');
        }
        
        if (!this.telefone || !validarTelefone(this.telefone)) {
            errors.push('Telefone do contato é obrigatório e deve ser válido');
        }
        
        if (this.email && !validarEmail(this.email)) {
            errors.push('Email do contato deve ser válido');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    toJSON() {
        return {
            nome: this.nome.trim(),
            parentesco: this.parentesco.trim(),
            telefone: this.telefone.replace(/[^\d]/g, ''),
            email: this.email.trim(),
            endereco: this.endereco.trim(),
            principal: this.principal
        };
    }
}

/**
 * DTO para informações médicas
 */
class InformacoesMedicasDTO {
    constructor() {
        this.tipoSanguineo = '';
        this.alergias = '';
        this.medicamentos = '';
        this.condicoesMedicas = '';
        this.medicoResponsavel = '';
        this.telefoneEmergencia = '';
        this.convenioMedico = '';
        this.numeroConvenio = '';
    }

    static fromForm(formData) {
        const dto = new InformacoesMedicasDTO();
        
        if (formData instanceof FormData) {
            dto.tipoSanguineo = formData.get('tipo_sanguineo') || '';
            dto.alergias = formData.get('alergias') || '';
            dto.medicamentos = formData.get('medicamentos') || '';
            dto.condicoesMedicas = formData.get('condicoes_medicas') || '';
            dto.medicoResponsavel = formData.get('medico_responsavel') || '';
            dto.telefoneEmergencia = formData.get('telefone_emergencia') || '';
            dto.convenioMedico = formData.get('convenio_medico') || '';
            dto.numeroConvenio = formData.get('numero_convenio') || '';
        } else {
            Object.assign(dto, formData);
        }
        
        return dto;
    }

    validate() {
        const errors = [];
        
        if (this.telefoneEmergencia && !validarTelefone(this.telefoneEmergencia)) {
            errors.push('Telefone de emergência deve ser válido');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    toJSON() {
        return {
            tipoSanguineo: this.tipoSanguineo,
            alergias: this.alergias.trim(),
            medicamentos: this.medicamentos.trim(),
            condicoesMedicas: this.condicoesMedicas.trim(),
            medicoResponsavel: this.medicoResponsavel.trim(),
            telefoneEmergencia: this.telefoneEmergencia.replace(/[^\d]/g, ''),
            convenioMedico: this.convenioMedico.trim(),
            numeroConvenio: this.numeroConvenio.trim()
        };
    }
}

/**
 * DTO para login
 */
class LoginDTO {
    constructor() {
        this.usuario = '';
        this.senha = '';
        this.lembrarAcesso = false;
    }

    static fromForm(formData) {
        const dto = new LoginDTO();
        
        if (formData instanceof FormData) {
            dto.usuario = formData.get('usuario') || '';
            dto.senha = formData.get('senha') || '';
            dto.lembrarAcesso = formData.get('lembrar_acesso') === 'on';
        } else {
            Object.assign(dto, formData);
        }
        
        return dto;
    }

    validate() {
        const errors = [];
        
        if (!this.usuario || this.usuario.trim().length < 3) {
            errors.push('Usuário é obrigatório e deve ter pelo menos 3 caracteres');
        }
        
        if (!this.senha || this.senha.length < 6) {
            errors.push('Senha é obrigatória e deve ter pelo menos 6 caracteres');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    toJSON() {
        return {
            usuario: this.usuario.trim(),
            senha: this.senha,
            lembrarAcesso: this.lembrarAcesso
        };
    }
}

/**
 * DTO para pesquisa de pacientes
 */
class PesquisaPacienteDTO {
    constructor() {
        this.nome = '';
        this.cpf = '';
        this.status = '';
        this.dataAdmissaoInicio = '';
        this.dataAdmissaoFim = '';
        this.pagina = 1;
        this.itensPorPagina = 10;
        this.ordenarPor = 'nome';
        this.direcaoOrdem = 'asc'; // asc, desc
    }

    static fromForm(formData) {
        const dto = new PesquisaPacienteDTO();
        
        if (formData instanceof FormData) {
            dto.nome = formData.get('nome') || '';
            dto.cpf = formData.get('cpf') || '';
            dto.status = formData.get('status') || '';
            dto.dataAdmissaoInicio = formData.get('data_admissao_inicio') || '';
            dto.dataAdmissaoFim = formData.get('data_admissao_fim') || '';
            dto.pagina = parseInt(formData.get('pagina')) || 1;
            dto.itensPorPagina = parseInt(formData.get('itens_por_pagina')) || 10;
            dto.ordenarPor = formData.get('ordenar_por') || 'nome';
            dto.direcaoOrdem = formData.get('direcao_ordem') || 'asc';
        } else {
            Object.assign(dto, formData);
        }
        
        return dto;
    }

    /**
     * Converte para query string para requisições GET
     * @returns {string} - Query string
     */
    toQueryString() {
        const params = new URLSearchParams();
        
        if (this.nome) params.append('nome', this.nome);
        if (this.cpf) params.append('cpf', this.cpf.replace(/[^\d]/g, ''));
        if (this.status) params.append('status', this.status);
        if (this.dataAdmissaoInicio) params.append('dataAdmissaoInicio', this.dataAdmissaoInicio);
        if (this.dataAdmissaoFim) params.append('dataAdmissaoFim', this.dataAdmissaoFim);
        
        params.append('pagina', this.pagina.toString());
        params.append('itensPorPagina', this.itensPorPagina.toString());
        params.append('ordenarPor', this.ordenarPor);
        params.append('direcaoOrdem', this.direcaoOrdem);
        
        return params.toString();
    }

    toJSON() {
        return {
            nome: this.nome.trim(),
            cpf: this.cpf.replace(/[^\d]/g, ''),
            status: this.status,
            dataAdmissaoInicio: this.dataAdmissaoInicio,
            dataAdmissaoFim: this.dataAdmissaoFim,
            pagina: this.pagina,
            itensPorPagina: this.itensPorPagina,
            ordenarPor: this.ordenarPor,
            direcaoOrdem: this.direcaoOrdem
        };
    }
}

/**
 * DTO para resposta do backend
 */
class RespostaDTO {
    constructor() {
        this.sucesso = false;
        this.mensagem = '';
        this.dados = null;
        this.erros = [];
        this.codigo = 200;
    }

    static fromResponse(response) {
        const dto = new RespostaDTO();
        Object.assign(dto, response);
        return dto;
    }

    /**
     * Verifica se a resposta indica sucesso
     * @returns {boolean}
     */
    isSuccess() {
        return this.sucesso && this.codigo >= 200 && this.codigo < 300;
    }

    /**
     * Obtém a primeira mensagem de erro
     * @returns {string}
     */
    getPrimeiroErro() {
        if (this.erros && this.erros.length > 0) {
            return this.erros[0];
        }
        return this.mensagem || 'Erro desconhecido';
    }
}

/**
 * Utilitários para DTOs
 */
class DTOUtils {
    /**
     * Cria FormData a partir de um DTO
     * @param {Object} dto - DTO a ser convertido
     * @returns {FormData} - FormData criado
     */
    static toFormData(dto) {
        const formData = new FormData();
        
        function appendToFormData(obj, prefix = '') {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    const fieldName = prefix ? `${prefix}[${key}]` : key;
                    
                    if (value === null || value === undefined) {
                        continue;
                    } else if (typeof value === 'object' && !(value instanceof File) && !(value instanceof Date)) {
                        if (Array.isArray(value)) {
                            value.forEach((item, index) => {
                                if (typeof item === 'object') {
                                    appendToFormData(item, `${fieldName}[${index}]`);
                                } else {
                                    formData.append(`${fieldName}[${index}]`, item);
                                }
                            });
                        } else {
                            appendToFormData(value, fieldName);
                        }
                    } else {
                        formData.append(fieldName, value);
                    }
                }
            }
        }
        
        appendToFormData(dto);
        return formData;
    }

    /**
     * Limpa campos vazios de um objeto
     * @param {Object} obj - Objeto a ser limpo
     * @returns {Object} - Objeto limpo
     */
    static removeEmptyFields(obj) {
        const cleaned = {};
        
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                
                if (value !== null && value !== undefined && value !== '') {
                    if (typeof value === 'object' && !Array.isArray(value)) {
                        const cleanedNested = this.removeEmptyFields(value);
                        if (Object.keys(cleanedNested).length > 0) {
                            cleaned[key] = cleanedNested;
                        }
                    } else if (Array.isArray(value) && value.length > 0) {
                        cleaned[key] = value.map(item => 
                            typeof item === 'object' ? this.removeEmptyFields(item) : item
                        ).filter(item => 
                            typeof item !== 'object' || Object.keys(item).length > 0
                        );
                    } else {
                        cleaned[key] = value;
                    }
                }
            }
        }
        
        return cleaned;
    }
}

// Exporta as classes para uso global
window.PacienteDTO = PacienteDTO;
window.EnderecoDTO = EnderecoDTO;
window.ContatoDTO = ContatoDTO;
window.InformacoesMedicasDTO = InformacoesMedicasDTO;
window.LoginDTO = LoginDTO;
window.PesquisaPacienteDTO = PesquisaPacienteDTO;
window.RespostaDTO = RespostaDTO;
window.DTOUtils = DTOUtils;

