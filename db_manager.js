const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Encryption key
const ENCRYPTION_KEY = crypto.randomBytes(32); // 256 bits
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // For AES, this is always 16

// File path
const FILE_PATH = path.join(__dirname, 'db.txt');

// Function to write serverid and apikey to a text file
function write_db(serverid, apikey) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(apikey);

    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const data = iv.toString('hex') + ':' + encrypted.toString('hex');

    fs.appendFileSync(FILE_PATH, `${serverid}:${data}\n`);
}

// Function to read serverid and apikey from the text file
function read_db(serverid) {
  return new Promise((resolve, reject) => {
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const lines = data.split('\n');
        for (let i = 0; i < lines.length; i++) {
          let [id, iv, encryptedText] = lines[i].split(':');

          if (id === serverid.toString()) {
            if (iv && encryptedText) {
              
              let decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), Buffer.from(iv, 'hex'));
              let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'));
              decrypted = Buffer.concat([decrypted, decipher.final()]);
              resolve(decrypted.toString());

              return;
            }
          } else {
          }
        }
        reject(new Error(`Server ID: ${serverid} not found.`));
      }
    });
  });
}



// Function to delete all records with a specific serverid from the database
function delete_db(serverid) {
    let data = fs.readFileSync(FILE_PATH, 'utf8').split('\n');
    data = data.filter(item => item.split(':')[0] !== serverid);
    fs.writeFileSync(FILE_PATH, data.join('\n'));
}

function add(serverid, apikey) {
  delete_db(serverid);
  write_db(serverid, apikey);
}

module.exports = {
  write_db,
  read_db,
  delete_db,
  add,
};
