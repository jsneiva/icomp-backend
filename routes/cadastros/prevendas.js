const createError = require('http-errors')
const PreVenda = require('../../models/prevenda')
const Venda = require('../../models/venda')

module.exports = (app) => {
  
  const path = app.get('path-api') + '/prevendas'


  app.post(path, (req, res, next) => {

    req.body.id_loja     = req.login.idLoja
    req.body.id_usuario  = req.login.usuario.data.id
    req.body.id_vendedor = req.login.usuario.data.id_vendedor
    Venda.gerarPreVenda(req.body)
      .then(result => res.status(result.sucesso ? 200 : 400).json(result))
      .catch(error => next(error))

  })



  app.get(path + '/:numero', (req, res, next) => {

    buscarPreVenda(req)
      .then(result => res.status(200).json(result))
      .catch(error => next(error))

  })



  app.get(path + '/:numero/itens', (req, res, next) => {

    buscarPreVenda(req)
      .then(result => res.status(200).json(result.itens))
      .catch(error => next(error))

  })



  app.get(path + '/:numero/pendencias', (req, res, next) => {

    this.buscarPreVenda(req)
      .then(prevenda => PreVenda.getPendencias(prevenda.id_prevenda))
      .then(pendencias => res.status(200).json(pendencias))
      .catch(error => next(error))

  })



  app.get(path, (req, res, next) => {

    const getPreVendas = async () => {
      req.query.id_loja     = req.login.idLoja
      req.query.id_vendedor = req.login.usuario.data.id_vendedor
      let lista = await new PreVenda().findByPeriodo(req.query)
      if (! lista.length) {
        throw new createError.NotFound('Pré-vendas não encontradas!')
      }
      return lista.map(prevenda => prevenda.data)
    }
    
    getPreVendas()
      .then(lista => res.status(200).json(lista))
      .catch(error => next(error))

  })

}



async function buscarPreVenda(req) {
  let idLoja = req.login.idLoja
  let numero = req.params.numero
  let prevenda = await PreVenda.getInstance(idLoja, numero)

  if (! prevenda.data) 
    throw new createError.NotFound('Pré-venda ' + numero + ' não encontrada na loja ' + idLoja + ' !')
  
  if (prevenda.data.id_vendedor !== req.login.usuario.data.id_vendedor) 
    throw new createError.Unauthorized('Acesso não autorizado à pré-venda ' + numero + ' da loja ' + idLoja + ' !')      

  return prevenda.data
}



/**
 * @apiDefine ErroPreVendaNaoEncontrada
 * 
 * @apiError {Number} status  Código do status HTTP.
 * @apiError {String} message Mensagem de erro.
 *
 * @apiErrorExample Erro:
 *     HTTP/1.1 404 
 *     {
 *       "status": 404,
 *       "message": "Pré-venda 4547 não encontrada na loja 01 !"
 *     }
*/


/** 
 * @apiDefine CamposPreVenda
 * 
 * @apiSuccess {String}   id_loja        ID da loja onde a pré-venda foi gerada.
 * @apiSuccess {String}   numero         Número da pré-venda.     
 * @apiSuccess {Date}     data           Data que a pré-venda foi gerada.
 * @apiSuccess {String}   id_vendedor    ID do vendedor.
 * @apiSuccess {String}   nome_vendedor  Nome do vendedor.
 * @apiSuccess {String}   id_cliente     ID do cliente.
 * @apiSuccess {String}   nome_cliente   Nome do cliente.
 * @apiSuccess {String}   id_tab_preco   ID da tabela de preço usada na pré-venda.
 * @apiSuccess {String}   id_parceiro    ID do parceiro (indicador).
 * @apiSuccess {Number}   qt_itens       Número de itens lançados na pré-venda.
 * @apiSuccess {Number}   vl_itens       Valor da soma total dos itens.
 * @apiSuccess {Number}   vl_acrescimo   Valor de acréscimo sobre os itens.
 * @apiSuccess {Number}   vl_desconto    Valor de desconto sobre os itens.
 * @apiSuccess {Number}   vl_total       Valor total da pré-venda.
 * @apiSuccess {String}   id_plano_pag   ID do plano de pagamento.
 * @apiSuccess {String}   nome_plano_pag Nome do plano de pagamento.
 * @apiSuccess {String}   forma_pag      ID da forma de pagamento gerada pelo plano.
 * @apiSuccess {Number}   vl_entrada     Valor de entrada, para o caso de venda a prazo.
 * @apiSuccess {Number}   parcelas       Número de parcelas de pagamento geradas.
 * @apiSuccess {Number}   vl_parcela     Valor da parcela de pagamento.
 * @apiSuccess {String}   situacao       Situação da pré-venda: P-Pendente F-Faturada C-Cancelada I-Irregular
 * @apiSuccess {String}   id_pos         ID da posição atual da pré-venda.
 * @apiSuccess {Date}     data_pos       Data de lançamento da posição da pré-venda.
 * @apiSuccess {String}   mod_venda      Modalidade da venda: 0-Normal 1-Futura 9-NFC-e.
 * @apiSuccess {Date}     data_entrega   Data prevista para entrega dos produtos.
 * @apiSuccess {String}   hora_entrega   Hora prevista para entrega dos produtos.
 * @apiSuccess {String}   tipo_entrega   Tipo de entrega: 0-Cliente retira 1-Loja faz a entrega   
 * @apiSuccess {String}   id_end_entrega ID do endereço de entrega do cliente.
 * @apiSuccess {String}   id_loja_sep    ID da loja de separação dos produtos.
 * @apiSuccess {String}   id_obra        ID da obra cadastrada.
 * @apiSuccess {String}   id_opcom       ID da operação comercial de venda.
 * @apiSuccess {String}   num_venda      Número da venda gerada na operação comercial.
 * @apiSuccess {Date}     data_venda     Data da venda gerada.
 * @apiSuccess {String}   num_nfe        Número da NF-e ou NFC-e gerada.
 * @apiSuccess {Object[]} itens          Array contendo a lista de itens da pré-venda.
 */

 /**
  * @apiDefine pvItem Campos do item da pré-venda
  */

 /**  
  * @apiDefine CamposItensPreVenda
  * 
  * @apiSuccess (pvItem) {String}   seq           Sequência do item.
  * @apiSuccess (pvItem) {String}   id_produto    Código do produto ou serviço.
  * @apiSuccess (pvItem) {String}   descricao     Descrição do item.
  * @apiSuccess (pvItem) {String}   referencia    Referência do item.
  * @apiSuccess (pvItem) {String}   especie       Espécie do item: P-Produto ou S-Serviço.
  * @apiSuccess (pvItem) {String}   compl_descr   Complemento da descrição do item.
  * @apiSuccess (pvItem) {String}   pos_grade     Posição da grade do produto no formato 9999.
  * @apiSuccess (pvItem) {String}   lin_grade     Descrição da linha da grade.
  * @apiSuccess (pvItem) {String}   col_grade     Descrição da coluna da grade.
  * @apiSuccess (pvItem) {Number}   quantidade    Quantidade do item.
  * @apiSuccess (pvItem) {Boolean}  fracionado    Indica se o item foi vendido em unidades fracionadas.
  * @apiSuccess (pvItem) {Number}   preco         Preço unitário do item.
  * @apiSuccess (pvItem) {Number}   pdesc         Percentual e desconto sobre o preço do item.
  * @apiSuccess (pvItem) {Number}   vl_total      Valor total do item.
  * @apiSuccess (pvItem) {Boolean}  promocao      Indica se o produto foi vendido com preço de promoção.
*/


 /** 
  * @apiDefine SucessoPreVenda
  * 
  * @apiSuccessExample Sucesso:
  *     HTTP/1.1 200 OK
  *     {
  *        "id_loja":"00",
  *        "numero":"2027",
  *        "data":"2015-12-14T02:00:00.000Z",
  *        "id_vendedor":"001",
  *        "nome_vendedor":"LUIS CARLOS",
  *        "id_cliente":"00000001",
  *        "nome_cliente":"FRANCISCO OLIVEIRA COSMETICOS LTDA",
  *        "id_tab_preco":"01",
  *        "id_parceiro":"00034",
  *        "qt_itens":1,
  *        "vl_itens":152.25,
  *        "vl_acrescimo":0,
  *        "vl_desconto":10.10,
  *        "vl_total":142.15,
  *        "id_plano_pag":"001",
  *        "nome_plano_pag":"A VISTA",
  *        "forma_pag":"01",
  *        "vl_entrada":0,
  *        "parcelas":0,
  *        "vl_parcela":0,
  *        "situacao":"F",
  *        "id_pos":"",
  *        "data_pos":null,
  *        "mod_venda":"0",
  *        "data_entrega":"2015-12-14T02:00:00.000Z",
  *        "hora_entrega":"15:00:00",
  *        "tipo_entrega":"0",
  *        "id_end_entrega":"",
  *        "id_loja_sep":"00",
  *        "id_obra":"",
  *        "id_opcom":"10",
  *        "num_venda":"5219",
  *        "data_venda":"2015-12-14T02:00:00.000Z",
  *        "num_nfe":"40",
  *        "itens":[
  *            {
  *              "seq":"001",
  *              "id_produto":"00001",
  *              "cod_barras":"9788537909294",
  *              "descricao":"LEITE ITAMBE PLUS CXA C/20 UND",
  *              "referencia":"ABC-DEF-GHI-JKLM-NOP",
  *              "especie":"P",
  *              "compl_descr":"",
  *              "pos_grade":"",
  *              "lin_grade":"",
  *              "col_grade":"",
  *              "quantidade":1,
  *              "fracionado":false,
  *              "unidade":"CXA",
  *              "preco":152.25,
  *              "pdesc":0,
  *              "vl_total":152.25,
  *              "promocao":false
  *            }
  *        ]
  *     }
  */ 

/**
 * @apiDefine Prevendas Pré-vendas
 */

/**
 * @api {post} /prevendas  Gerar uma nova pré-venda
 * @apiVersion 1.0.0
 * @apiName postPreVendas
 * @apiGroup Prevendas
 * 
 * @apiHeader {String} Authorization 'Bearer ' + Token obtido no login do usuário.
 * 
 * @apiParam {Number}   id_venda          ID da venda temporária a ser transformada em pré-venda.
 * @apiParam {String}   id_cliente        ID (código) do cliente.
 * @apiParam {String}   id_vendedor       ID do vendedor.
 * @apiParam {String}   id_plano_pag      ID do plano de pagamento.
 * @apiParam {String}   [id_pos]          ID da posição inicial da pré-venda.
 * @apiParam {String}   mod_venda         Modalidade da venda. 1-Normal 2-Futura ou 9-NFC-e
 * @apiParam {Number}   vl_itens          Valor total dos produtos.
 * @apiParam {Number}   vl_desconto       Valor do desconto concedido nos produtos.
 * @apiParam {Number}   vl_acrescimo      Valor do acréscimo sobre os produtos.
 * @apiParam {Number}   vl_total          Valor total da venda.
 * @apiParam {Number}   [vl_entrada]      Valor de entrada, caso a venda seja a prazo.
 * @apiParam {Number}   [parcelas]        Quantidade de parcelas de pagamento, se a venda for a prazo.
 * @apiParam {Number}   [vl_parcela]      Valor da parcela de pagamento, se a venda for a prazo.
 * @apiParam {Date}     [data_entrega]    Data de entrega dos produtos.
 * @apiParam {String}   tipo_entrega      Tipo de entrega. 0-Cliente retira ou 1-Loja entrega.
 * @apiParam {String}   [id_end_entrega]  ID do endereço de entrega do cliente.
 * @apiParam {String}   [id_obra]         ID da obra.
 * @apiParam {String}   [id_parceiro]     ID do parceiro (indicador).
 * @apiParam {String}   [obs]             Observações referentes a venda.
 * @apiParam {Boolean}  [faturar]         Indica se a pre-venda será imediatamente faturada.
 * @apiParam {String}   [id_op_com]       ID da operação comercial de venda.
 * @apiParam {String}   [id_caixa]        ID do caixa onde a pré-venda será faturada.
 * @apiParam {Object[]} [cartoes]         Array contendo a lista dos pagamentos via cartão de crédito/débito.
 * @apiParam {String}   cartoes.rede          Nome da rede do cartão.
 * @apiParam {String}   cartoes.data_hora     Data e hora da transação (ISO 8601).
 * @apiParam {String}   cartoes.nsu           NSU da transação.
 * @apiParam {String}   cartoes.autoriz       ID de autorização da transação.
 * @apiParam {String}   cartoes.tipo          Tipo da transação.
 * @apiParam {Number}   cartoes.valor         Valor da transação.
 * @apiParam {Number}   cartoes.parcelas      Número de parcelas de pagamento.
 *  
 * @apiSuccess {Boolean}  sucesso         Retorna sempre <code>true</code>.
 * @apiSuccess {String}   id_loja         ID da loja onde as pré-vendas foram geradas.
 * @apiSuccess {String}   [id_op_com]     ID da operação comercial (somente para pré-vendas faturadas)
 * @apiSuccess {String}   [num_venda]     Número da nota de venda (somente para pré-vendas faturadas)
 * @apiSuccess {Object[]} prevendas       Array contendo uma lista de objetos JSON das pré-vendas geradas.
 * @apiSuccess {String}   prevendas.numero         Número da pré-venda.
 * @apiSuccess {Number}   prevendas.vl_total       Valor total da pré-venda.
 * @apiSuccess {Number}   prevendas.pendencias     Número de pendências (irregularidades) encontradas na pré-venda.
 * 
 * @apiSuccessExample Sucesso:
 *     HTTP/1.1 200 OK
 *    {
 *      "sucesso": true,
 *      "id_loja": "01",
 *      "prevendas:" [
 *        {
 *          "numero": "112654",
 *          "vl_total": 1543.45,
 *          "pendencias": 0
 *        },
 *        {
 *          "numero": "112655",
 *          "vl_total": 123.58,
 *          "pendencias": 3
 *        }
 *      ]
 *    }
 *
 * @apiUse ErroVendaNaoEncontrada
 */


/**
 * @api {get} /prevendas/:numero  Consultar uma pré-venda pelo número
 * @apiVersion 1.0.0
 * @apiName getPreVendasNumero
 * @apiGroup Prevendas
 *
 * @apiHeader {String} Authorization 'Bearer ' + Token obtido no login do usuário.
 *
 * @apiParam {String}   numero            Número da pré-venda a ser consultada.
 * 
 * @apiUse CamposPreVenda
 * @apiUse CamposItensPreVenda
 * 
 * @apiUse SucessoPreVenda
 *
 * @apiUse ErroPreVendaNaoEncontrada
 */


 /**
 * @api {get} /prevendas/:numero/itens  Consultar os itens de uma pré-venda
 * @apiVersion 1.0.0
 * @apiName getPreVendasNumeroItens
 * @apiGroup Prevendas
 *
 * @apiHeader {String} Authorization 'Bearer ' + Token obtido no login do usuário.
 *
 * @apiParam {String}   numero Número da pré-venda a ser consultada.
 * 
 * @apiUse CamposItensPreVenda
 * 
 * @apiSuccessExample Sucesso:
 *     HTTP/1.1 200 OK
 *     [ 
 *        {
 *           "seq":"001",
 *           "id_produto":"00001",
 *           "cod_barras":"9788537909294",
 *           "descricao":"LEITE ITAMBE PLUS CXA C/20 UND",
 *           "referencia":"ABC-DEF-GHI-JKLM-NOP",
 *           "especie":"P",
 *           "compl_descr":"",
 *           "pos_grade":"",
 *           "lin_grade":"",
 *           "col_grade":"",
 *           "quantidade":1,
 *           "fracionado":false,
 *           "unidade":"CXA",
 *           "preco":152.25,
 *           "pdesc":0,
 *           "vl_total":152.25,
 *           "promocao":false
 *        }
 *     ]
 *
 * @apiError {Number} status  Código do status HTTP.
 * @apiError {String} message Mensagem de erro.
 *
 * @apiErrorExample Erro:
 *     HTTP/1.1 404 
 *     {
 *       "status": 404,
 *       "message": "Os itens da pré-venda não foram encontrados !"
 *     }
 */



 /**
 * @api {get} /prevendas  Consultar pré-vendas no período
 * @apiVersion 1.0.0
 * @apiName getPreVendas
 * @apiGroup Prevendas
 * @apiDescription Esta requisição retorna um array de pré-vendas geradas no período informado, de acordo com a página informada. Os itens das pré-vendas não serão retornados.
 * 
 * @apiHeader {String} Authorization 'Bearer ' + Token obtido no login do usuário.
 *
 * @apiParam {date}   data_ini        Data inicial do periodo.
 * @apiParam {date}   data_fim        Data final do período.
 * @apiParam {Number} page            Número da página.
 * @apiParam {String} [id_cliente]    ID do cliente.
 * @apiParam {String} [id_plano_pag]  Lista de ID de planos de pagamentos, separados por "|". Ex.: "001|005|012"
 * @apiParam {String} [situacao]      Lista de situações, separadas por "|". Ex.: "P|C|F" para consultar pré-vendas Pendentes, Canceladas e Faturadas.
 * @apiParam {String} [id_posicao]    Lista de ID de posições de pré-vendas, separadas por "|". Ex.: "01|02|03"
 * 
 * @apiError {Number} status  Código do status HTTP.
 * @apiError {String} message Mensagem de erro.
 *
 * @apiErrorExample Erro:
 *     HTTP/1.1 404 
 *     {
 *       "status": 404,
 *       "message": "Pré-vendas não encontradas!"
 *     }
 */
