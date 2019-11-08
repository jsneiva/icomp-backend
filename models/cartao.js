const { ERede  } = require('erede')

const store = new ERede('10004612', 'c11a583157b74e8ab0a328abb8f0506b', true);

module.exports = class Cartao {

  constructor(
    kind, 
    reference, 
    amount, 
    installments, 
    cardHolderName, 
    cardNumber, 
    expirationMonth, 
    expirationYear, 
    securityCode
  ) {
    this.transacao = {
      kind, 
      reference, 
      amount, 
      installments, 
      cardHolderName, 
      cardNumber, 
      expirationMonth, 
      expirationYear, 
      securityCode
    }
    this.respAutorizacao = null
    this.respConfirmacao = null
  }


  async AutorizarTransacao() {
    this.respConfirmacao = null
    this.respAutorizacao = await store.authorization(this.transacao)
    return (this.respAutorizacao && this.respAutorizacao.returnCode === '00')
  }

  async ConfirmarTransacao() {
    this.respConfirmacao = await store.capture(this.response.tid, {amount: this.transacao.amount})
    return (this.respConfirmacao && this.respConfirmacao.returnCode == '00')
  }

  async CancelarTransacao() {

  }

}
