import React, { useState, useEffect, useRef } from 'react';
import type { LicitacaoData, PropostaData, ProductData, UnidadeAdministrativaData, EmpresaData, BrandingConfig, PropostaItem } from '../types';
import DocumentEditor from '../components/DocumentEditor';
import { ArrowLeft, Printer, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Strikethrough, Quote, Minus, Indent, Outdent, Undo, Redo, AlignJustify, GitCommit, ListPlus, ListX } from 'lucide-react';

interface CartaPropostaPageProps {
    licitacao: LicitacaoData;
    proposta: PropostaData;
    products: ProductData[];
    unidadesAdministrativas: UnidadeAdministrativaData[];
    onCancel: () => void;
    proponenteEmpresa: EmpresaData;
    brandingConfig: BrandingConfig;
    mode: 'proposta' | 'reserva' | 'orçamento' | 'adesao';
}

const numeroPorExtensoSimples = (s: number | string): string => {
    const num = parseInt(s.toString(), 10);
    if (isNaN(num)) return "";

    const unidades = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
    const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
    const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

    if (num < 0) return "menos " + numeroPorExtensoSimples(Math.abs(num));
    
    if (num < 20) return unidades[num];
    
    if (num < 100) {
        const dezena = Math.floor(num / 10);
        const unidade = num % 10;
        return dezenas[dezena] + (unidade !== 0 ? " e " + unidades[unidade] : "");
    }
    
    if (num < 1000) {
        const centena = Math.floor(num / 100);
        const resto = num % 100;
        if (num === 100) return "cem";
        return centenas[centena] + (resto !== 0 ? " e " + numeroPorExtensoSimples(resto) : "");
    }

    return num.toString(); // Fallback for numbers >= 1000
};


const numeroPorExtenso = (s: number | string) => {
    s = parseFloat(s.toString()).toFixed(2);
    let n = s.toString().replace('.', ',');
    const
        unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"],
        dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"],
        centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"],
        escala = ["", ["mil", "mil"], ["milhão", "milhões"], ["bilhão", "bilhões"], ["trilhão", "trilhões"], ["quatrilhão", "quatrilhões"], ["quintilhão", "quintilhões"], ["sextilhão", "sextilhões"], ["septilhão", "septilhões"]];

    const getExtenso = (n: string): string => {
        if (n.length > 3) return "";
        let c = n[0], d = n[1], u = n[2];
        if (n.length === 1) { u = c; d = '0'; c = '0'; }
        if (n.length === 2) { u = d; d = c; c = '0'; }
        if (c == '0' && d == '0' && u == '0') return "";

        let str = "";
        const cNum = parseInt(c, 10), dNum = parseInt(d, 10), uNum = parseInt(u, 10);

        if (cNum !== 0) {
            if (cNum === 1 && dNum === 0 && uNum === 0) {
                str += "cem";
            } else {
                str += centenas[cNum] + ((dNum !== 0 || uNum !== 0) ? " e " : "");
            }
        }
        
        if (dNum !== 0) {
            if (dNum === 1) {
                str += unidades[10 + uNum];
            } else {
                str += dezenas[dNum] + (uNum !== 0 ? " e " : "");
            }
        }

        if (uNum !== 0 && dNum !== 1) {
            str += unidades[uNum];
        }

        return str;
    };
    
    let extenso = "";
    let i: number, grupos: string[];
    let nSplit = n.split(',');
    let parteInteira = nSplit[0].split('.').join("");
    let parteDecimal = nSplit.length > 1 ? nSplit[1] : "00";

    if (parseInt(parteInteira) === 0 && parseInt(parteDecimal) === 0) return "Zero";

    if (parteInteira.length > 21) parteInteira = parteInteira.substr(0, 21);
    
    grupos = [];
    if (parteInteira.length > 3) {
        let inicio = parteInteira.length % 3;
        if (inicio > 0) grupos.push(parteInteira.substr(0, inicio));
        for (i = inicio; i < parteInteira.length; i = i + 3) {
            grupos.push(parteInteira.substr(i, 3));
        }
    } else {
        grupos = [parteInteira];
    }
    
    for (i = grupos.length - 1; i >= 0; i--) {
        if (parseInt(grupos[i]) > 0) {
            let e = getExtenso(grupos[i]);
            if (i > 0) {
                e = e + " " + (parseInt(grupos[i]) > 1 ? escala[i][1] : escala[i][0]);
            }
            if (extenso.length > 0) {
                if (i === 1 && parseInt(grupos[i]) === 1) { // "mil"
                    extenso = "mil" + (extenso.startsWith(" e") ? "" : " e ") + extenso;
                } else {
                     extenso = e + " e " + extenso;
                }
            } else {
                extenso = e;
            }
        }
    }
    
    // Ajuste para "um mil" -> "mil"
    if (extenso.startsWith("um mil")) {
      extenso = extenso.substring(3);
    }
    
    // Remove "e" antes de centenas, dezenas ou unidades se for o caso.
    if(extenso.endsWith(" e ")) {
        extenso = extenso.slice(0, -3);
    }

    let moeda;
    if (extenso !== "") {
        moeda = parseInt(parteInteira) === 1 ? "real" : "reais";
        extenso = extenso + " " + moeda;
    }

    if (parseInt(parteDecimal) > 0) {
        moeda = parseInt(parteDecimal) === 1 ? "centavo" : "centavos";
        if (extenso !== "") extenso = extenso + " e ";
        extenso = extenso + getExtenso(parteDecimal) + " " + moeda;
    }
    
    return extenso.charAt(0).toUpperCase() + extenso.slice(1);
};


const generateProposalLetterHTML = (licitacao: LicitacaoData, proposta: PropostaData, orgaoGerenciador: UnidadeAdministrativaData, proponenteEmpresa: EmpresaData, allUnidades: UnidadeAdministrativaData[], products: ProductData[]): string => {
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    
    const orgaoAderente = proposta.is_adesao 
        ? allUnidades.find(u => u.unidade_unique_id === proposta.orgao_adesao_id) 
        : null;

    const orgao = orgaoAderente || orgaoGerenciador;
    
    const itensVencedores = proposta.itens_proposta.filter(item => item.vencedor);
    let valorTotalProposta = 0;

    const itemsHtml = itensVencedores.map((item) => {
        const licitacaoItem = licitacao.itens_licitacao.find(li => li.item_licitacao === item.item_licitacao);
        const product = products.find(p => p.produto_unique === item.produto_fornecedor);
        const valorVencedor = item.valor_lance_vencedor || 0;
        const quantidade = parseInt(licitacaoItem?.item_quantidade || '0', 10);
        const valorTotalItem = valorVencedor * quantidade;
        
        valorTotalProposta += valorTotalItem;

        return `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">${licitacaoItem?.item_licitacao || ''}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #000;">
                    ${licitacaoItem?.item_descricao || ''}
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 8px 0;">
                    <b>${product?.produto_nome || 'Produto não especificado'}</b><br>
                    ${product?.produto_descricao || ''}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">${quantidade}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">R$ ${valorVencedor.toFixed(2).replace('.', ',')}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">R$ ${valorTotalItem.toFixed(2).replace('.', ',')}</td>
            </tr>
        `;
    }).join('');
    
    const valorTotalExtenso = numeroPorExtenso(valorTotalProposta);

    const fullAddress = [
        proponenteEmpresa.endereco_rua,
        proponenteEmpresa.endereco_numero,
        proponenteEmpresa.endereco_bairro,
        proponenteEmpresa.endereco_cidade,
        proponenteEmpresa.endereco_estado,
        proponenteEmpresa.endereco_cep,
    ].filter(Boolean).join(', ');

    return `
        <p style="text-align: right;">${proponenteEmpresa.endereco_cidade}, ${proponenteEmpresa.endereco_estado}, ${today}.</p>
        <br><br>
        <p>
            À<br>
            <strong>${orgao.nome_completo}</strong><br>
            CNPJ: ${orgao.cpf_cnpj || 'Não informado'}<br>
            ${orgao.endereco_rua || ''}, ${orgao.endereco_cidade || ''} - ${orgao.endereco_estado || ''}, CEP: ${orgao.endereco_cep || ''}
        </p>
        <br>
        <p><strong>Ref.: ${licitacao.licitacao_modalidade} Nº ${licitacao.licitacao_numero}</strong></p>
        <p><strong>Objeto: ${licitacao.licitacao_objeto}</strong></p>
        <br><br>
        <p>Prezados Senhores,</p>
        <br>
        <p>A empresa <strong>${proponenteEmpresa.nome_completo}</strong>, inscrita no CNPJ sob o nº ${proponenteEmpresa.cpf_cnpj}, com sede em ${fullAddress}, vem, por meio desta, apresentar nossa proposta de preços para o certame em referência, conforme detalhado abaixo:</p>
        <br>
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2; color: #000;">Item</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2; color: #000;">Descrição</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2; color: #000;">Qtd.</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: #f2f2f2; color: #000;">Valor Unit.</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: #f2f2f2; color: #000;">Valor Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        <br>
        <p><strong>Valor Total da Proposta: (R$ ${valorTotalProposta.toFixed(2).replace('.', ',')}) - ${valorTotalExtenso}.</strong></p>
        <br>
        <p><b>Validade da Proposta:</b> ${licitacao.licitacao_validadeproposta} (${numeroPorExtensoSimples(licitacao.licitacao_validadeproposta)}) dias, a contar da data de abertura da sessão pública.</p>
        <br>
        <p><b>Prazo de Entrega:</b> O prazo de entrega dos bens será de ${licitacao.licitacao_prazoentrega} (${numeroPorExtensoSimples(licitacao.licitacao_prazoentrega)}) dias, contados da emissão da nota de empenho, em remessa única.</p>
        <p><b>Local de Entrega:</b> Os bens deverão ser entregues no seguinte endereço:</p>
        <ul style="padding-left: 20px; list-style-position: inside; text-indent: -20px;">
            <li style="margin-bottom: 8px;">${licitacao.licitacao_localentrega}</li>
        </ul>
        <p><b>Garantia:</b> ${licitacao.licitacao_garantiaproduto}</p>

        <br>
        <p>Declaramos ainda em nossa proposta que:</p>
        <ul style="padding-left: 20px; list-style-position: inside; text-indent: -20px;">
            <li style="margin-bottom: 8px;">serão entregues os materiais comprovadamente novos e de primeiro uso, de acordo com as normas vigentes para comercialização em território nacional.</li>
            <li style="margin-bottom: 8px;">os valores propostos incluem todos os custos operacionais, encargos previdenciários, trabalhistas, tributários, comerciais e quaisquer outros que incidam direta ou indiretamente no fornecimento dos bens.</li>
            <li style="margin-bottom: 8px;">está de acordo com todas as condições estabelecidas no Edital e seus anexos, estando ciente das condições contidas no Edital e seus anexos;</li>
            <li style="margin-bottom: 8px;">cumpre os requisitos para a habilitação definidos no Edital e que a proposta apresentada atende as exigências do instrumento convocatório;</li>
            <li style="margin-bottom: 8px;">inexistem fatos impeditivos para sua habilitação no certame, ciente da obrigatoriedade de declarar ocorrências posteriores;</li>
            <li style="margin-bottom: 8px;">não emprega menor de 18 anos em trabalho noturno, perigoso ou insalubre e não emprega menor de 16 anos, salvo menor, a partir de 14 anos, na condição de aprendiz, nos termos do artigo 7°, XXXIII, da Constituição Federal;</li>
            <li style="margin-bottom: 8px;">não possui, em sua cadeia produtiva, empregados executando trabalho degradante ou forçado, observando o disposto nos incisos III e IV do art. 1º e no inciso III do art. 5º da Constituição Federal;</li>
            <li style="margin-bottom: 8px;">o objeto é prestado por empresas que comprovam cumprimento de reserva de cargos prevista em lei para pessoa com deficiência ou para reabilitado da Previdência Social e que atendam às regras de acessibilidade previstas na legislação, conforme disposto no art. 93 da Lei nº 8.213, de 24 de julho de 1991.</li>
        </ul>
        <br><br><br>
        <div class="fecho" style="text-align: center;">
            <p>Atenciosamente,</p>
            <br><br><br>
            <p>_________________________________________<br><strong>${proponenteEmpresa.nome_completo}</strong></p>
        </div>
    `;
};

const generateReservationLetterHTML = (licitacao: LicitacaoData, proposta: PropostaData, orgaoGerenciador: UnidadeAdministrativaData, proponenteEmpresa: EmpresaData, allUnidades: UnidadeAdministrativaData[], products: ProductData[]): string => {
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    const orgao = orgaoGerenciador;
    
    let itensParaReserva: PropostaItem[];
    const useLanceVencedor = ['Julgamento', 'Homologada', 'Adesão'].includes(proposta.proposta_status);

    if (useLanceVencedor) {
        itensParaReserva = proposta.itens_proposta.filter(item => item.vencedor);
    } else {
        itensParaReserva = proposta.itens_proposta.filter(item => item.produto_fornecedor);
    }
    
    let valorTotalReserva = 0;

    const itemsHtml = itensParaReserva.map((item) => {
        const licitacaoItem = licitacao.itens_licitacao.find(li => li.item_licitacao === item.item_licitacao);
        const product = products.find(p => p.produto_unique === item.produto_fornecedor);
        const valorUnitario = useLanceVencedor ? (item.valor_lance_vencedor || 0) : (item.valor_referencia || 0);
        const quantidade = parseInt(licitacaoItem?.item_quantidade || '0', 10);
        const valorTotalItem = valorUnitario * quantidade;
        
        valorTotalReserva += valorTotalItem;
        
        return `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">${licitacaoItem?.item_licitacao || ''}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #000;">
                    ${licitacaoItem?.item_descricao || ''}
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 8px 0;">
                    <b>${product?.produto_nome || 'Produto não especificado'}</b><br>
                    ${product?.produto_descricao || ''}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">${quantidade}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">R$ ${valorUnitario.toFixed(2).replace('.', ',')}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">R$ ${valorTotalItem.toFixed(2).replace('.', ',')}</td>
            </tr>
        `;
    }).join('');
    
    const valorTotalExtenso = numeroPorExtenso(valorTotalReserva);

    const fullAddress = [
        proponenteEmpresa.endereco_rua,
        proponenteEmpresa.endereco_numero,
        proponenteEmpresa.endereco_bairro,
        proponenteEmpresa.endereco_cidade,
        proponenteEmpresa.endereco_estado,
        proponenteEmpresa.endereco_cep,
    ].filter(Boolean).join(', ');

    return `
        <p style="text-align: right;">${proponenteEmpresa.endereco_cidade}, ${proponenteEmpresa.endereco_estado}, ${today}.</p>
        <br><br>
        <p><strong>Ref.: RESERVA DE MATERIAL - ${licitacao.licitacao_modalidade} Nº ${licitacao.licitacao_numero}</strong></p>
        <br>
        <p><br>
            <strong>${orgao.nome_completo}</strong><br>
            CNPJ: ${orgao.cpf_cnpj || 'Não informado'}<br>
            ${orgao.endereco_rua || ''}, ${orgao.endereco_cidade || ''} - ${orgao.endereco_estado || ''}, CEP: ${orgao.endereco_cep || ''}
        </p>
        <br>
        <p>Solicita-se efetivar RESERVA para empresa <strong>${proponenteEmpresa.nome_completo}</strong>, com vistas a futuro fornecimento ao órgão qualificado acima, caso sejamos vencedores no certame em referência, conforme detalhado abaixo:</p>
        <br>
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2; color: #000;">Item</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2; color: #000;">Descrição</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2; color: #000;">Qtd.</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: #f2f2f2; color: #000;">Valor Unit.</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: #f2f2f2; color: #000;">Valor Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        <br>
        <p><strong>Valor Total da Reserva: (R$ ${valorTotalReserva.toFixed(2).replace('.', ',')}) -  ${valorTotalExtenso}.</strong></p>
        <br>
        <p><b>Prazo de Entrega:</b> O prazo de entrega dos bens será de ${licitacao.licitacao_prazoentrega} (${numeroPorExtensoSimples(licitacao.licitacao_prazoentrega)}) dias, contados da emissão da nota de empenho, em remessa única.</p>
        <p><b>Local de Entrega:</b> Os bens deverão ser entregues no seguinte endereço:</p>
        <ul style="padding-left: 20px; list-style-position: inside; text-indent: -20px;">
            <li style="margin-bottom: 8px;">${licitacao.licitacao_localentrega}</li>
        </ul>
        <p><b>Garantia:</b> ${licitacao.licitacao_garantiaproduto}.</p>
        <br><br>
        <div class="fecho" style="text-align: center;">
            <p>Atenciosamente,</p>
            <br><br><br>
            <p>_________________________________________<br><strong>${proponenteEmpresa.nome_completo}</strong></p>
        </div>
    `;
};

const generateReservationAdhesionLetterHTML = (licitacao: LicitacaoData, proposta: PropostaData, orgaoGerenciador: UnidadeAdministrativaData, proponenteEmpresa: EmpresaData, allUnidades: UnidadeAdministrativaData[], products: ProductData[]): string => {
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    
    const orgaoAderente = allUnidades.find(u => u.unidade_unique_id === proposta.orgao_adesao_id);
    if (!orgaoAderente) {
        return `<p><strong>Erro: Órgão Aderente não encontrado para esta proposta de adesão. Selecione um na página da proposta.</strong></p>`;
    }
    const orgao = orgaoAderente;
    
    const itensParaReserva = proposta.itens_proposta.filter(item => item.item_adesao);
    
    let valorTotalReserva = 0;

    const itemsHtml = itensParaReserva.map((item) => {
        const licitacaoItem = licitacao.itens_licitacao.find(li => li.item_licitacao === item.item_licitacao);
        const product = products.find(p => p.produto_unique === item.produto_fornecedor);
        const valorUnitario = item.valor_lance_vencedor || 0;
        const quantidade = parseInt(item.quantidade_adesao || '0', 10);
        const valorTotalItem = valorUnitario * quantidade;
        
        valorTotalReserva += valorTotalItem;
        
        return `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">${licitacaoItem?.item_licitacao || ''}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #000;">
                    ${licitacaoItem?.item_descricao || ''}
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 8px 0;">
                    <b>${product?.produto_nome || 'Produto não especificado'}</b><br>
                    ${product?.produto_descricao || ''}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">${quantidade}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">R$ ${valorUnitario.toFixed(2).replace('.', ',')}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">R$ ${valorTotalItem.toFixed(2).replace('.', ',')}</td>
            </tr>
        `;
    }).join('');
    
    const valorTotalExtenso = numeroPorExtenso(valorTotalReserva);

    return `
        <p style="text-align: right;">${proponenteEmpresa.endereco_cidade}, ${proponenteEmpresa.endereco_estado}, ${today}.</p>
        <br><br>
        <p><strong>Ref.: RESERVA DE MATERIAL - Adesão à Ata de Registro de Preços do ${licitacao.licitacao_modalidade} Nº ${licitacao.licitacao_numero}</strong></p>
        <br>
        <p><br>
            <strong>${orgao.nome_completo} (Órgão Aderente)</strong><br>
            CNPJ: ${orgao.cpf_cnpj || 'Não informado'}<br>
            ${orgao.endereco_rua || ''}, ${orgao.endereco_cidade || ''} - ${orgao.endereco_estado || ''}, CEP: ${orgao.endereco_cep || ''}
        </p>
        <br>
        <p>Solicita-se efetivar RESERVA para empresa <strong>${proponenteEmpresa.nome_completo}</strong>, com vistas a futuro fornecimento ao órgão qualificado acima (Aderente), referente à adesão da Ata de Registro de Preços do ${licitacao.licitacao_modalidade} Nº ${licitacao.licitacao_numero}, gerenciado por ${orgaoGerenciador.nome_completo}, conforme detalhado abaixo:</p>
        <br>
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2; color: #000;">Item</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2; color: #000;">Descrição</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2; color: #000;">Qtd.</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: #f2f2f2; color: #000;">Valor Unit.</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: #f2f2f2; color: #000;">Valor Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        <br>
        <p><strong>Valor Total da Reserva: (R$ ${valorTotalReserva.toFixed(2).replace('.', ',')}) -  ${valorTotalExtenso}.</strong></p>
        <br>
        <p><b>Prazo de Entrega:</b> O prazo de entrega dos bens será de ${licitacao.licitacao_prazoentrega} (${numeroPorExtensoSimples(licitacao.licitacao_prazoentrega)}) dias, contados da emissão da nota de empenho, em remessa única.</p>
        <p><b>Local de Entrega:</b> Os bens deverão ser entregues no seguinte endereço:</p>
        <ul style="padding-left: 20px; list-style-position: inside; text-indent: -20px;">
            <li style="margin-bottom: 8px;">${licitacao.licitacao_localentrega}</li>
        </ul>
        <p><b>Garantia:</b> ${licitacao.licitacao_garantiaproduto}.</p>
        <br><br>
        <div class="fecho" style="text-align: center;">
            <p>Atenciosamente,</p>
            <br><br><br>
            <p>_________________________________________<br><strong>${proponenteEmpresa.nome_completo}</strong></p>
        </div>
    `;
};


const generateQuoteLetterHTML = (licitacao: LicitacaoData, proposta: PropostaData, orgaoGerenciador: UnidadeAdministrativaData, proponenteEmpresa: EmpresaData, allUnidades: UnidadeAdministrativaData[], products: ProductData[]): string => {
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    
    const orgao = orgaoGerenciador;
    
    const itensParaOrcamento = proposta.itens_proposta.filter(item => item.produto_fornecedor);
    let valorTotalOrcamento = 0;

    const itemsHtml = itensParaOrcamento.map((item) => {
        const licitacaoItem = licitacao.itens_licitacao.find(li => li.item_licitacao === item.item_licitacao);
        const product = products.find(p => p.produto_unique === item.produto_fornecedor);
        const valorUnitario = item.valor_referencia || 0;
        const quantidade = parseInt(licitacaoItem?.item_quantidade || '0', 10);
        const valorTotalItem = valorUnitario * quantidade;
        
        valorTotalOrcamento += valorTotalItem;

        return `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">${licitacaoItem?.item_licitacao || ''}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #000;">
                    ${licitacaoItem?.item_descricao || ''}
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 8px 0;">
                    <b>${product?.produto_nome || 'Produto não especificado'}</b><br>
                    ${product?.produto_descricao || ''}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">${quantidade}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">R$ ${valorUnitario.toFixed(2).replace('.', ',')}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">R$ ${valorTotalItem.toFixed(2).replace('.', ',')}</td>
            </tr>
        `;
    }).join('');
    
    const valorTotalExtenso = numeroPorExtenso(valorTotalOrcamento);

    const fullAddress = [
        proponenteEmpresa.endereco_rua,
        proponenteEmpresa.endereco_numero,
        proponenteEmpresa.endereco_bairro,
        proponenteEmpresa.endereco_cidade,
        proponenteEmpresa.endereco_estado,
        proponenteEmpresa.endereco_cep,
    ].filter(Boolean).join(', ');

    return `
        <p style="text-align: right;">${proponenteEmpresa.endereco_cidade},${proponenteEmpresa.endereco_estado}, ${today}.</p>
        <br><br>
        <p>
            À<br>
            <strong>${orgao.nome_completo}</strong><br>
            CNPJ: ${orgao.cpf_cnpj || 'Não informado'}<br>
            ${orgao.endereco_rua || ''}, ${orgao.endereco_cidade || ''} - ${orgao.endereco_estado || ''}, CEP: ${orgao.endereco_cep || ''}
        </p>
        <br>
        <p><strong>Ref.: PROPOSTA DE ORÇAMENTO</strong></p>
        <br>
        <p>Prezados Senhores,</p>
        <br>
        <p>A empresa <strong>${proponenteEmpresa.nome_completo}</strong>, inscrita no CNPJ sob o nº ${proponenteEmpresa.cpf_cnpj}, com sede em ${fullAddress}, vem, por meio desta, apresentar nossa proposta de orçamento, conforme detalhado abaixo:</p>
        <br>
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2; color: #000;">Item</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2; color: #000;">Descrição</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2; color: #000;">Qtd.</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: #f2f2f2; color: #000;">Valor Unit.</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: #f2f2f2; color: #000;">Valor Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        <br>
        <p><strong>Valor Total do Orçamento: (R$ ${valorTotalOrcamento.toFixed(2).replace('.', ',')}) - ${valorTotalExtenso}.</strong></p>
        <br>
        <p><b>Validade da Proposta:</b> 60 (sessenta) dias, a contar da data de envio deste Orçamento.</p>
        <br>
        <p><b>Prazo de Entrega:</b> 30 (trinta) dias após o recebimento da Nota de Empenho.</p>
        <p><b>Garantia:</b> O prazo de garantia é aquele estabelecido na Lei nº 8.078, de 11 de setembro de 1990 (Código de Defesa do Consumidor).</p>
        <br>
        <p>Declaramos ainda em nossa proposta que:</p>
        <ul style="padding-left: 20px; list-style-position: inside; text-indent: -20px;">
            <li style="margin-bottom: 8px;">serão entregues os materiais comprovadamente novos e de primeiro uso, de acordo com as normas vigentes para comercialização em território nacional.</li>
            <li style="margin-bottom: 8px;">os valores propostos incluem todos os custos operacionais, encargos previdenciários, trabalhistas, tributários, comerciais e quaisquer outros que incidam direta ou indiretamente no fornecimento dos bens.</li>
        </ul>
        <br><br><br>
        <div class="fecho" style="text-align: center;">
            <p>Atenciosamente,</p>
            <br><br><br>
            <p>_________________________________________<br><strong>${proponenteEmpresa.nome_completo}</strong></p>
        </div>
    `;
};

const generateAdhesionLetterHTML = (licitacao: LicitacaoData, proposta: PropostaData, orgaoGerenciador: UnidadeAdministrativaData, proponenteEmpresa: EmpresaData, allUnidades: UnidadeAdministrativaData[], products: ProductData[]): string => {
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    
    const orgaoAderente = allUnidades.find(u => u.unidade_unique_id === proposta.orgao_adesao_id);
    
    if (!orgaoAderente) {
        return `<p><strong>Erro: Órgão Aderente não encontrado para esta proposta de adesão. Selecione um na página da proposta.</strong></p>`;
    }

    const itensAdesao = proposta.itens_proposta.filter(item => item.item_adesao);
    let valorTotalProposta = 0;

    const itemsHtml = itensAdesao.map((item) => {
        const licitacaoItem = licitacao.itens_licitacao.find(li => li.item_licitacao === item.item_licitacao);
        const product = products.find(p => p.produto_unique === item.produto_fornecedor);
        const valorVencedor = item.valor_lance_vencedor || 0;
        const quantidade = parseInt(item.quantidade_adesao || '0', 10);
        const valorTotalItem = valorVencedor * quantidade;
        
        valorTotalProposta += valorTotalItem;
        
        return `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">${licitacaoItem?.item_licitacao || ''}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: #000;">
                    ${licitacaoItem?.item_descricao || ''}
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin: 8px 0;">
                    <b>${product?.produto_nome || 'Produto não especificado'}</b><br>
                    ${product?.produto_descricao || ''}
                </td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">${quantidade}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">R$ ${valorVencedor.toFixed(2).replace('.', ',')}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">R$ ${valorTotalItem.toFixed(2).replace('.', ',')}</td>
            </tr>
        `;
    }).join('');
    
    const valorTotalExtenso = numeroPorExtenso(valorTotalProposta);

    const fullAddress = [
        proponenteEmpresa.endereco_rua,
        proponenteEmpresa.endereco_numero,
        proponenteEmpresa.endereco_bairro,
        proponenteEmpresa.endereco_cidade,
        proponenteEmpresa.endereco_estado,
        proponenteEmpresa.endereco_cep,
    ].filter(Boolean).join(', ');

    return `
        <p style="text-align: right;">${proponenteEmpresa.endereco_cidade}, ${proponenteEmpresa.endereco_estado}, ${today}.</p>
        <br><br>
        <p>
            À<br>
            <strong>${orgaoAderente.nome_completo}</strong><br>
            CNPJ: ${orgaoAderente.cpf_cnpj || 'Não informado'}<br>
            ${orgaoAderente.endereco_rua || ''}, ${orgaoAderente.endereco_cidade || ''} - ${orgaoAderente.endereco_estado || ''}, CEP: ${orgaoAderente.endereco_cep || ''}
        </p>
        <br>
        <p><strong>Ref.: Adesão à Ata de Registro de Preços do ${licitacao.licitacao_modalidade} Nº ${licitacao.licitacao_numero}</strong></p>
        <p><strong>Órgão Gerenciador: ${orgaoGerenciador.nome_completo}</strong></p>
        <br><br>
        <p>Prezados Senhores,</p>
        <br>
        <p>A empresa <strong>${proponenteEmpresa.nome_completo}</strong>, inscrita no CNPJ sob o nº ${proponenteEmpresa.cpf_cnpj}, com sede em ${fullAddress}, vem, por meio desta, formalizar o aceite para o fornecimento dos itens abaixo, em conformidade com as condições estabelecidas na Ata de Registro de Preços oriunda do certame em referência, de acordo com Art. 31, inc. III, do Decreto nº 11.462/2023.</p>
        <br>
        <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2; color: #000;">Item</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2; color: #000;">Descrição</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2; color: #000;">Qtd.</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: #f2f2f2; color: #000;">Valor Unit.</th>
                    <th style="border: 1px solid #ddd; padding: 8px; text-align: right; background-color: #f2f2f2; color: #000;">Valor Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
        </table>
        <br>
        <p><strong>Valor Total da Adesão: (R$ ${valorTotalProposta.toFixed(2).replace('.', ',')}) - ${valorTotalExtenso}.</strong></p>
        <br>
        <p><b>Local de Entrega:</b> ${licitacao.licitacao_localentrega}.</p>
        <p><b>Prazo de Entrega:</b> ${licitacao.licitacao_prazoentrega} (${numeroPorExtensoSimples(licitacao.licitacao_prazoentrega)}) dias após o recebimento da Nota de Empenho.</p>
        <br>
        <p>A presente aceitação pelo fornecedor tem validade de 90 (noventa) dias para efetivação da contratação, observado o prazo de vigência da Ata, de acordo com Art. 31, § 2º, do Decreto nº 11.462/2023.</p>
        <p>A contratação com o fornecedor registrado observa todas as condições originais da Ata e será formalizada pelo órgão ou pela entidade interessada por meio de instrumento contratual, emissão de nota de empenho de despesa, autorização de compra ou outro instrumento hábil, conforme o disposto no art. 95 da Lei nº 14.133, de 2021, em acordo com Art. 34 do Decreto nº 11.462/2023.</p>
        <br><br>
        <div class="fecho" style="text-align: center;">
            <p>Atenciosamente,</p>
            <br><br><br>
            <p>_________________________________________<br><strong>${proponenteEmpresa.nome_completo}</strong></p>
        </div>
    `;
};


const ToolbarButton: React.FC<{ onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode; title: string }> = ({ onClick, children, title }) => (
  <button
    type="button"
    onMouseDown={onClick} // Use onMouseDown to prevent the contentEditable from losing focus
    className="p-2 rounded hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors"
    title={title}
  >
    {children}
  </button>
);

const CartaPropostaPage: React.FC<CartaPropostaPageProps> = ({ licitacao, proposta, products, unidadesAdministrativas, onCancel, proponenteEmpresa, brandingConfig, mode }) => {
    const [letterHtml, setLetterHtml] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const orgaoGerenciador = unidadesAdministrativas.find(u => u.unidade_unique_id === licitacao.unidade_administrativa_id);
        if (orgaoGerenciador) {
            let html = '';
            if (mode === 'reserva') {
                if (proposta.proposta_status === 'Adesão') {
                    html = generateReservationAdhesionLetterHTML(licitacao, proposta, orgaoGerenciador, proponenteEmpresa, unidadesAdministrativas, products);
                } else {
                    html = generateReservationLetterHTML(licitacao, proposta, orgaoGerenciador, proponenteEmpresa, unidadesAdministrativas, products);
                }
            } else if (mode === 'orçamento') {
                html = generateQuoteLetterHTML(licitacao, proposta, orgaoGerenciador, proponenteEmpresa, unidadesAdministrativas, products);
            } else if (mode === 'adesao') {
                html = generateAdhesionLetterHTML(licitacao, proposta, orgaoGerenciador, proponenteEmpresa, unidadesAdministrativas, products);
            } else {
                html = generateProposalLetterHTML(licitacao, proposta, orgaoGerenciador, proponenteEmpresa, unidadesAdministrativas, products);
            }
            setLetterHtml(html);
        }
    }, [licitacao, proposta, products, unidadesAdministrativas, proponenteEmpresa, mode]);
    
    const execCmd = (command: string, value?: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault(); // Prevent loss of selection
      document.execCommand(command, false, value);
      editorRef.current?.focus();
    };

    const handleAddRow = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const editor = editorRef.current;
        if (!editor) return;

        const tableBody = editor.querySelector('table > tbody');
        if (tableBody) {
            const newRowHtml = `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">&nbsp;</td>
                    <td style="border: 1px solid #ddd; padding: 8px; color: #000;">&nbsp;</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: #000;">&nbsp;</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">&nbsp;</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right; color: #000;">&nbsp;</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', newRowHtml);
            setLetterHtml(editor.innerHTML);
        } else {
            alert('Nenhuma tabela encontrada no documento para adicionar uma linha.');
        }
        editor.focus();
    };

    const handleDeleteRow = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const editor = editorRef.current;
        if (!editor) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            alert('Por favor, clique dentro da linha da tabela que deseja remover.');
            return;
        }

        const range = selection.getRangeAt(0);
        let node = range.startContainer;
        
        if (node.nodeType === Node.TEXT_NODE) {
            node = node.parentNode as Node;
        }

        const rowToDelete = (node as Element).closest('tbody > tr');

        if (rowToDelete) {
            rowToDelete.remove();
            setLetterHtml(editor.innerHTML);
        } else {
            alert('Por favor, coloque o cursor dentro de uma linha da tabela (não no cabeçalho) para remover.');
        }
        editor.focus();
    };
    
    const insertPageBreak = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        // Insert a styled HR tag that also has a specific class for the pagination logic to find.
        document.execCommand('insertHTML', false, '<hr class="page-break-before" style="page-break-before: always; border: 0; border-top: 1px dashed #ccc; margin: 2rem 0;">');
        editorRef.current?.focus();
    };

    /**
     * Paginates the given HTML content based on A4 page dimensions and content-aware rules.
     * @param htmlContent The raw HTML string from the editor.
     * @returns A promise that resolves to an array of HTML strings, each representing a single page.
     */
    const paginateContent = (htmlContent: string): Promise<string[]> => {
        return new Promise(resolve => {
            // Use a hidden iframe to create a clean, sandboxed measurement environment.
            // This prevents styles from the main app from interfering with calculations.
            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.left = '-9999px';
            iframe.style.width = '21cm';
            iframe.style.height = '29.7cm';
            document.body.appendChild(iframe);

            iframe.onload = () => {
                const doc = iframe.contentDocument;
                if (!doc) {
                    document.body.removeChild(iframe);
                    resolve([htmlContent]); // Fallback to a single page on error
                    return;
                }

                // Inject styles into the iframe to mimic the final print layout.
                const style = doc.createElement('style');
                style.innerHTML = `
                    body { margin: 0; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
                    .measure-page {
                        width: calc(21cm - 3cm - 1.5cm); /* A4 width minus left/right margins */
                        height: calc(29.7cm - 2.5cm - 2cm); /* A4 height minus top/bottom margins */
                        overflow: hidden;
                        text-align: justify;
                        box-sizing: border-box;
                    }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #333; padding: 8px; }
                    thead { display: table-header-group; } /* Ensures thead is part of height calc */
                    .page-break-before { display: none; } /* Hide our manual break ruler during measurement */
                `;
                doc.head.appendChild(style);

                const sourceDiv = doc.createElement('div');
                sourceDiv.innerHTML = htmlContent;
                const allNodes = Array.from(sourceDiv.childNodes);

                const measurePage = doc.createElement('div');
                measurePage.className = 'measure-page';
                doc.body.appendChild(measurePage);
                
                const contentHeight = measurePage.clientHeight; // The maximum height for content on one page.
                
                const pagesArray: string[] = [];
                let nodeQueue = [...allNodes];

                while (nodeQueue.length > 0) {
                    const node = nodeQueue.shift();
                    if (!node) continue;

                    // Handle manual page breaks inserted by the user.
                    if (node.nodeName === 'HR' && (node as HTMLElement).classList.contains('page-break-before')) {
                        if (measurePage.innerHTML.trim()) {
                            pagesArray.push(measurePage.innerHTML);
                        }
                        measurePage.innerHTML = '';
                        continue;
                    }
                    
                    measurePage.appendChild(node.cloneNode(true));
                    
                    // Check if the newly added node caused an overflow.
                    if (measurePage.scrollHeight > contentHeight) {
                        const overflowNode = measurePage.lastChild;
                        if (!overflowNode) continue;
                        
                        measurePage.removeChild(overflowNode);

                        // Special handling for tables to break them by rows.
                        if (overflowNode.nodeName === 'TABLE') {
                            const table = overflowNode as HTMLTableElement;
                            const thead = table.querySelector('thead');
                            const rows = Array.from(table.querySelectorAll('tbody > tr'));

                            // Create a new table for the current page and add rows until it's full.
                            const tableForCurrentPage = table.cloneNode(false) as HTMLTableElement;
                            if (thead) tableForCurrentPage.appendChild(thead.cloneNode(true));
                            const tbodyForCurrentPage = doc.createElement('tbody');
                            tableForCurrentPage.appendChild(tbodyForCurrentPage);

                            // Add the table shell to the measure page to account for its base size.
                            measurePage.appendChild(tableForCurrentPage);
                            
                            // This loop determines how many rows of the table fit on the current page.
                            for (const row of rows) {
                                tbodyForCurrentPage.appendChild(row.cloneNode(true));
                                if (measurePage.scrollHeight > contentHeight) {
                                    // This row caused an overflow, so remove it. The table is now partially filled.
                                    tbodyForCurrentPage.removeChild(tbodyForCurrentPage.lastChild!);
                                    break;
                                }
                            }
                            
                            const remainingRows = rows.slice(tbodyForCurrentPage.rows.length);

                            if (tbodyForCurrentPage.rows.length > 0) {
                                // If at least one row fit (or the whole table fit), we finalize the current page.
                                // measurePage now contains the content before the table PLUS the part of the table that fits.
                                pagesArray.push(measurePage.innerHTML);
                                measurePage.innerHTML = ''; // Start a new blank page.

                                // If there are rows left over, create a new table for the next page.
                                if (remainingRows.length > 0) {
                                    const tableForNextPage = table.cloneNode(false) as HTMLTableElement;
                                    if (thead) tableForNextPage.appendChild(thead.cloneNode(true)); // IMPORTANT: Repeat the header
                                    const tbodyForNextPage = doc.createElement('tbody');
                                    tableForNextPage.appendChild(tbodyForNextPage);
                                    remainingRows.forEach(row => tbodyForNextPage.appendChild(row.cloneNode(true)));
                                    
                                    // Put the new, smaller table at the front of the queue to be processed.
                                    nodeQueue.unshift(tableForNextPage);
                                }
                            } else {
                                // No rows from the table could fit on the current page (along with preceding content).
                                // So, we finalize the page with only the content that came before the table.
                                measurePage.removeChild(tableForCurrentPage); // Remove the empty table shell we added.
                                if (measurePage.innerHTML.trim()) {
                                    pagesArray.push(measurePage.innerHTML);
                                }
                                measurePage.innerHTML = ''; // Start a new blank page.
                                
                                // Put the whole original table back in the queue to be processed on the new, empty page.
                                nodeQueue.unshift(table);
                            }
                        } else {
                            // For non-table elements (like paragraphs), just break before the element.
                            if (measurePage.innerHTML.trim()) {
                                pagesArray.push(measurePage.innerHTML);
                            }
                            measurePage.innerHTML = '';
                            // Put the overflowing node back in the queue to start the next page.
                            nodeQueue.unshift(overflowNode);
                        }
                    }
                }
                
                // Add any remaining content as the final page.
                if (measurePage.innerHTML.trim()) {
                    pagesArray.push(measurePage.innerHTML);
                }

                document.body.removeChild(iframe);
                resolve(pagesArray);
            };
            iframe.src = 'about:blank'; // This triggers the iframe's onload event.
        });
    };

    const handlePrint = async () => {
        const pages = await paginateContent(letterHtml);
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const orgaoGerenciador = unidadesAdministrativas.find(u => u.unidade_unique_id === licitacao.unidade_administrativa_id);
            const uasg = orgaoGerenciador?.uasg || 's_uasg';
            const numeroLicitacao = licitacao.licitacao_numero.replace(/\//g, '-');
            
            const documentTypeMap = {
                proposta: 'Proposta',
                reserva: 'Reserva',
                orcamento: 'Orçamento',
                adesao: 'Adesao'
            };
            const documentType = documentTypeMap[mode];
            const pdfFilename = `${documentType} ${uasg} ${numeroLicitacao}`;

            const logomarcaUrl = proponenteEmpresa.logomarca && 'base64' in proponenteEmpresa.logomarca ? proponenteEmpresa.logomarca.base64 : '';
            const watermarkUrl = proponenteEmpresa.marca_dagua && 'base64' in proponenteEmpresa.marca_dagua ? proponenteEmpresa.marca_dagua.base64 : '';
            const rezenIconUrl = brandingConfig.icone && 'base64' in brandingConfig.icone ? brandingConfig.icone.base64 : '';

            const fullAddress = [proponenteEmpresa.endereco_rua, proponenteEmpresa.endereco_numero, proponenteEmpresa.endereco_bairro].filter(Boolean).join(', ');
            const cityStateZip = [proponenteEmpresa.endereco_cidade, proponenteEmpresa.endereco_estado, proponenteEmpresa.endereco_cep].filter(Boolean).join(' - ');
            const primaryEmail = proponenteEmpresa.emails.find(e => e.isPrimary)?.email || proponenteEmpresa.emails[0]?.email || '';
            const primaryPhone = proponenteEmpresa.telefones.find(t => t.isPrimary)?.phone || proponenteEmpresa.telefones[0]?.phone || '';

            const pagesHtml = pages.map((pageHtml, pageIndex) => `
                <div class="print-page">
                    ${watermarkUrl ? `<div class="print-watermark-container"><img src="${watermarkUrl}" alt="Watermark"/></div>` : ''}
                    ${logomarcaUrl ? `<header class="print-header"><img src="${logomarcaUrl}" alt="Logomarca"/></header>` : ''}
                    
                    <main class="main-content">
                        ${pageHtml}
                    </main>

                    <footer class="print-footer">
                        ${rezenIconUrl ? `<img src="${rezenIconUrl}" class="rezen-icon" alt="Rezen Icon"/>` : '<div></div>'}
                        <div class="company-info">
                            ${fullAddress}${cityStateZip ? `, ${cityStateZip}` : ''}<br/>
                            ${primaryEmail ? `E-mail: ${primaryEmail}` : ''} ${primaryPhone && primaryEmail ? ' | ' : ''} ${primaryPhone ? `Telefone: ${primaryPhone}` : ''}
                        </div>
                        <div class="page-number">Página ${pageIndex + 1} de ${pages.length}</div>
                    </footer>
                </div>
            `).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>${pdfFilename}</title>
                        <style>
                            @media print {
                                @page {
                                    size: A4;
                                    margin: 0;
                                }
                                body {
                                    -webkit-print-color-adjust: exact;
                                    print-color-adjust: exact;
                                }
                            }
                            body { margin: 0; font-family: 'Times New Roman', Times, serif; font-size: 12pt; }
                            .print-page {
                                width: 21cm;
                                height: 29.7cm;
                                position: relative;
                                page-break-after: always;
                                overflow: hidden;
                                box-sizing: border-box;
                            }
                            .print-header, .print-footer, .print-watermark-container { position: absolute; left: 0; right: 0; page-break-inside: avoid; }
                            .print-header { top: 0; height: 2.5cm; padding: 0.5cm 3cm; z-index: 10; }
                            .print-header img { max-height: 1.5cm; max-width: 100%; }
                            .print-footer { bottom: 0; height: 2cm; padding: 0 1.5cm 0.5cm 3cm; font-size: 9pt; color: #333; display: flex; justify-content: space-between; align-items: flex-end; z-index: 10; }
                            .print-footer .company-info { text-align: center; flex-grow: 1; }
                            .print-footer .rezen-icon { height: 24px; width: auto; flex-shrink: 0; }
                            .print-footer .page-number { flex-shrink: 0; width: 80px; text-align: right; }
                            .print-watermark-container { top: 0; bottom: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; z-index: -1; }
                            .print-watermark-container img { opacity: 0.1; width: calc(21cm - 3cm - 1.5cm); height: auto; max-height: calc(29.7cm - 2.5cm - 2cm); }
                            .main-content { padding: 2.5cm 1.5cm 2cm 3cm; box-sizing: border-box; height: 100%; text-align: justify; }
                            .main-content * { color: #000 !important; }
                            .main-content table { width: 100%; border-collapse: collapse; font-size: 10pt; }
                            .main-content tr { page-break-inside: avoid; }
                            .main-content thead { display: table-header-group; }
                            .main-content th, .main-content td { border: 1px solid #333; padding: 8px; vertical-align: top; }
                            .main-content th { background-color: #f2f2f2 !important; }
                            .page-break-before { display: none; }
                        </style>
                    </head>
                    <body>${pagesHtml}</body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    const pageTitleMap = {
        proposta: 'Editor de Documento de Proposta',
        reserva: 'Editor de Pedido de Reserva',
        orcamento: 'Editor de Proposta de Orçamento',
        adesao: 'Editor de Ofício de Adesão'
    };

    return (
        <div className="h-full flex flex-col bg-gray-200">
            <div className="flex-shrink-0 bg-white p-2 z-20 shadow-md border-b flex justify-between items-center h-14">
                <div className="flex items-center space-x-4">
                    <button onClick={onCancel} className="flex items-center text-gray-700 font-semibold px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                        <ArrowLeft size={18} className="mr-2"/> Voltar
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">{pageTitleMap[mode]}</h1>
                </div>
                <button onClick={handlePrint} className="flex items-center bg-blue-800 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-900 transition-colors">
                    <Printer size={18} className="mr-2"/> Imprimir
                </button>
            </div>
            
            <div className="flex-shrink-0 p-2 bg-gray-100 border-b border-gray-300 flex items-center space-x-1 flex-wrap gap-y-1 z-10 shadow">
                <ToolbarButton onClick={execCmd('undo')} title="Desfazer"><Undo size={16} /></ToolbarButton>
                <ToolbarButton onClick={execCmd('redo')} title="Refazer"><Redo size={16} /></ToolbarButton>
                <div className="w-px h-6 bg-gray-300 mx-2 self-center"></div>
                
                <select onChange={(e) => { e.preventDefault(); if (e.target.value) { document.execCommand('formatBlock', false, e.target.value); editorRef.current?.focus(); } }} className="p-1 border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="p">Parágrafo</option>
                    <option value="h1">Título 1</option>
                    <option value="h2">Título 2</option>
                    <option value="h3">Título 3</option>
                </select>
                <div className="w-px h-6 bg-gray-300 mx-2 self-center"></div>

                <ToolbarButton onClick={execCmd('bold')} title="Negrito"><Bold size={16} /></ToolbarButton>
                <ToolbarButton onClick={execCmd('italic')} title="Itálico"><Italic size={16} /></ToolbarButton>
                <ToolbarButton onClick={execCmd('underline')} title="Sublinhado"><Underline size={16} /></ToolbarButton>
                <ToolbarButton onClick={execCmd('strikeThrough')} title="Tachado"><Strikethrough size={16} /></ToolbarButton>
                <div className="w-px h-6 bg-gray-300 mx-2 self-center"></div>

                <ToolbarButton onClick={execCmd('justifyLeft')} title="Alinhar à Esquerda"><AlignLeft size={16} /></ToolbarButton>
                <ToolbarButton onClick={execCmd('justifyCenter')} title="Centralizar"><AlignCenter size={16} /></ToolbarButton>
                <ToolbarButton onClick={execCmd('justifyRight')} title="Alinhar à Direita"><AlignRight size={16} /></ToolbarButton>
                <ToolbarButton onClick={execCmd('justifyFull')} title="Justificar"><AlignJustify size={16} /></ToolbarButton>
                <div className="w-px h-6 bg-gray-300 mx-2 self-center"></div>

                <ToolbarButton onClick={execCmd('insertUnorderedList')} title="Lista com Marcadores"><List size={16} /></ToolbarButton>
                <ToolbarButton onClick={execCmd('insertOrderedList')} title="Lista Numerada"><ListOrdered size={16} /></ToolbarButton>
                <div className="w-px h-6 bg-gray-300 mx-2 self-center"></div>

                <ToolbarButton onClick={handleAddRow} title="Adicionar Linha à Tabela"><ListPlus size={16} /></ToolbarButton>
                <ToolbarButton onClick={handleDeleteRow} title="Excluir Linha da Tabela"><ListX size={16} /></ToolbarButton>
                <div className="w-px h-6 bg-gray-300 mx-2 self-center"></div>

                <ToolbarButton onClick={execCmd('outdent')} title="Diminuir Recuo"><Outdent size={16} /></ToolbarButton>
                <ToolbarButton onClick={execCmd('indent')} title="Aumentar Recuo"><Indent size={16} /></ToolbarButton>
                <div className="w-px h-6 bg-gray-300 mx-2 self-center"></div>
                
                <ToolbarButton onClick={execCmd('formatBlock', 'blockquote')} title="Citação"><Quote size={16} /></ToolbarButton>
                <ToolbarButton onClick={execCmd('insertHorizontalRule')} title="Linha Horizontal"><Minus size={16} /></ToolbarButton>
                <ToolbarButton onClick={insertPageBreak} title="Quebra de Página"><GitCommit size={16} /></ToolbarButton>
            </div>
            
            <div className="flex-grow overflow-y-auto">
                <div className="py-8 px-4 flex justify-center">
                    {/* The 'paper' container. It has a min-height to look like a page, but will grow as needed. */}
                    <div className="w-[21cm] min-h-[29.7cm] bg-white shadow-lg">
                        {/* The DocumentEditor now serves as the single content area. 
                            It has internal padding that simulates the document margins. */}
                        <DocumentEditor ref={editorRef} value={letterHtml} onChange={setLetterHtml} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartaPropostaPage;