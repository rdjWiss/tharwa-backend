const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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");
const msg = { to: 'ed_dahmane@esi.dz',
from: 'no-reply@tharwa.dz',
subject: 'code de vérification',
text: 'Cher clientDjamel\nvotre code de vérification est le :6541306',
html: '<strong>Validate your connection </strong>\n                Cher clientDjamel\nvotre code de vérification est le :6541306\n            ' }
sgMail.send(msg).then(result=>{

  console.log(result)
}).catch(error=>{
  console.log('Jai trouve lerreur ')
  console.log(error)
})
;
