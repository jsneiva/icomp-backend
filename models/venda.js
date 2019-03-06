const db = require('../utils/db')

module.exports = class Venda {


  static async delete(data) {

    let msg = []
    data.id_venda = parseInt(data.id_venda || 0)    

    Venda.validar(data, msg)

    if (msg.length > 0) 
      return {sucesso: false, erros: msg}

    let sql = 'SELECT api_venda_excluir( $1 ) as sucesso'
  
    let {rows} = await db.query(sql, [JSON.stringify(data)])
  
    return {sucesso: rows[0].sucesso}
  
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

    let sql = 'SELECT api_venda_excluir_item( $1 ) as sucesso'
  
    let {rows} = await db.query(sql, [JSON.stringify(item)])
  
    return {sucesso: rows[0].sucesso}
  
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

    let sql = 'SELECT api_venda_salvar_item( $1 ) as result'

    let {rows} = await db.query(sql, [JSON.stringify(item)])

    return {
      sucesso: true, 
      ...JSON.parse(rows[0].result)
    }

  }


  static async gerarPreVenda(venda) {

    let msg = []
    venda.id_venda = parseInt(venda.id_venda || 0)    

    Venda.validar(venda, msg)

    if (! venda.id_cliente)
      msg.push('Cliente não informado.')
    if (! venda.id_vendedor)
      msg.push('Vendedor não informado.')
    if (! venda.id_plano_pag)
      msg.push('Plano de pagamento não informado.')
    if (! venda.id_tab_preco)
      msg.push('Tabela de preço não informada.')
    if (msg.length > 0) 
      return {sucesso: false, erros: msg}

    let sql = 'SELECT api_venda_gerar_prevenda( $1 ) as result'

    let {rows} = await db.query(sql, [JSON.stringify(venda)])

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

}