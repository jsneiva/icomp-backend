const knex = require('../knex/knexload')

const Cartao = require('../models/cartao')

module.exports = class Venda {

  static async delete(data) {

    let msg = []
    data.id_venda = parseInt(data.id_venda || 0)    

    Venda.validar(data, msg)

    if (msg.length > 0) 
      return {sucesso: false, erros: msg}

    const { rows } = await knex.raw('SELECT api_venda_excluir( ? ) as sucesso', JSON.stringify(data))
  
    return { sucesso: rows[0].sucesso }
  
  }

  

  static async deleteItem(item) {

    let msg = []
    item.id_item  = parseInt(item.id_item  || 0)
    item.id_venda = parseInt(item.id_venda || 0)    

    Venda.validar(item, msg)

    if (! item.id_item)
      msg.push('ID do item não informado.')

    if (msg.length > 0) 
      return {sucesso: false, erros: msg}

    const { rows } = await knex.raw('SELECT api_venda_excluir_item( ? ) as sucesso', JSON.stringify(item))
  
    return { sucesso: rows[0].sucesso }
  
  }



  static async getItens(item) {

    let msg = []
    item.id_item  = parseInt(item.id_item  || 0)
    item.id_venda = parseInt(item.id_venda || 0)

    Venda.validar(item, msg)

    if (! msg.length) {

      let sqlBuilder = knex('vs_api_vendas_temp_itens').where('id_venda', item.id_venda)

      if (item.id_item) 
        sqlBuilder.where('id_item', item.id_item).orderBy('id_item')

      let rows = await sqlBuilder

      if (item.id_item) {
        
        if (rows.length) 
          return {sucesso: true, item: rows[0]}
        
        msg.push('O item '+item.id_item+' não existe na venda '+item.id_venda+'.')

      } else {

        if (rows.length) 
          return {sucesso: true, itens: rows}
        
        msg.push('Não há itens lançados na venda '+item.id_venda+'.')

      }

    }

    return {sucesso: false, erros: msg}

  }



  static async getVendas(oJson) {

    let msg = []

    if (! oJson.id_loja)
      msg.push('ID da loja não informado.')    
    if (! oJson.id_usuario)
      msg.push('ID do usuário não informado.')

    if (msg.length) 
      return {sucesso: false, erros: msg}

    const rows = await knex('vs_api_vendas_temp')
      .where({ id_loja: oJson.id_loja, id_usuario: oJson.id_usuario })
      .orderBy('id_venda')

    return {sucesso: true, vendas: rows}

  }



  static async saveItem(item) {

    let msg = []
    item.id_item  = parseInt(item.id_item  || 0)
    item.id_venda = parseInt(item.id_venda || 0)    

    if (! item.id_produto)
      msg.push('ID do produto ou serviço não informado.')
    if (! item.quantidade || item.quantidade <= 0)
      msg.push('Quantidade do item inválida ou não informada.')
    if (! item.preco || item.preco <= 0)
      msg.push('Preço do item inválido ou não informado.')
    if (! item.id_usuario)
      msg.push('ID do usuário não informado.')
    if (! item.id_loja)
      msg.push('ID da loja não informado.')

    if (msg.length > 0) 
      return {sucesso: false, erros: msg}

    const { rows } = await knex.raw('SELECT api_venda_salvar_item( ? ) as result', JSON.stringify(item))

    return {
      sucesso: true, 
      ...JSON.parse(rows[0].result)
    }

  }



  static async gerarOrcamento(venda) {
    return await this.converterVenda('OR', venda)
  }



  static async gerarPreVenda(venda) {
    return await this.converterVenda('PV', venda)
  }



  static async converterVenda(tipoDoc, venda) {

    let msg = []

    venda.id_venda = parseInt(venda.id_venda || 0)    

    Venda.validar(venda, msg)

    if (!venda.id_cliente)
      msg.push('Cliente não informado.')
    if (!venda.id_vendedor)
      msg.push('Vendedor não informado.')
    if (!venda.id_plano_pag)
      msg.push('Plano de pagamento não informado.')


    if (msg.length === 0 && venda.cartao) {
      let cartao = new Cartao(
        venda.cartao.kind,
        venda.cartao.reference,
        venda.cartao.amount,
        venda.cartao.intallments,
        venda.cartao.cardHolderName,
        venda.cartao.cardNumber,
        venda.cartao.expirationMonth,
        venda.cartao.expirationYear,
        venda.cartao.securityCode
      )
      if (not (await cartao.AutorizarTransacao()))
        msg.push(cartao.respAutorizacao.returnMessage)
      else if (not (await cartao.ConfirmarTransacao()))
        msg.push(cartao.respConfirmacao.returnMessage)
      else {
        return {
          sucesso: true,
          ...cartao.respConfirmacao
        }
      }
    }

    if (msg.length > 0) 
      return {sucesso: false, erros: msg}

    const { rows } = await knex.raw(`SELECT api_venda_gerar_${ tipoDoc==='PV' ? 'prevenda' : 'orcamento' }( ? ) as result`,
                                  JSON.stringify(venda))

    return {
      sucesso: true,
      ...JSON.parse(rows[0].result)
    }

  }



  static validar(oJson, aMsg) {
    aMsg = Array.isArray(aMsg) ? aMsg : []
    if (! oJson.id_venda)
      aMsg.push('ID da venda não informado.')
    if (! oJson.id_loja)
      aMsg.push('ID da loja não informado.')    
    if (! oJson.id_usuario)
      aMsg.push('ID do usuário não informado.')
  }



  static async mudarTabelaPreco(venda) {
    let msg = []
    venda.id_venda = parseInt(venda.id_venda || 0)

    Venda.validar(venda)

    if (! venda.id_tab_preco)
      msg.push('ID da tabela de preço não informado.')

    if (msg.length > 0)
      return {sucesso: false, erros: msg}

    const { rows } = await knex.raw('SELECT api_venda_mudar_tab_preco( ? ) as result', JSON.stringify(venda))

    return {
      sucesso: true,
      ...JSON.parse(rows[0].result)
    }

  }

}
