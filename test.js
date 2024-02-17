//const dogecore = require('dogecore-lib')
const bitcoinMessage = require('./message')
const dogecore = require('bitcore-doge-lib')

const privKeyData = 'QPGcJRVeQfTGHwerFh67aLt289cgPTmxhC3CHVLSMZ9gWfVPvydA'
const code = 'thisisabot';
const address = 'DGZCuwdvUptDwviXCq3d2E7Fvk6TFLHMQH';

const DOGECOIN_NETWORK = {
    messagePrefix: '\x19Dogecoin Signed Message:\n',
    bip32: {
      public: 0x02facafd,
      private: 0x02fac398,
    },
    pubKeyHash: 0x1e,
    scriptHash: 0x16,
    wif: 0x9e,
    bech32: '',
}

const privKey = new dogecore.PrivateKey(privKeyData, dogecore.Networks.livenet);
console.log(privKey.toPublicKey().toAddress().toString());
//const privKey = new dogecore.PrivateKey.fromString(privKeyData);
const msg = new bitcoinMessage(code);
//console.log(privKey);
//console.log(privKey instanceof dogecore.PrivateKey);
const s1 =msg.sign(privKey);
console.log(s1);

const verified = msg.verify(address, s1);//"Gwaiftk+UnxNQIDYF558BOUzjFGFpvTF/mCU3Od4zPnPcQxugE02JmSC3g2njco0wxNi/j69/v0EnR0sLH7APKo=");
console.log(verified);
console.log(msg.error);
