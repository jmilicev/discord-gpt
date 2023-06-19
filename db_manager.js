const crypto = require('crypto');
const fs = require('fs');

// Function to encrypt a string using Fernet-like encryption
function encrypt_string(key, data) {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// Function to decrypt an encrypted string using Fernet-like encryption
function decrypt_string(key, encrypted_data) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.alloc(16, 0));
    let decrypted = decipher.update(encrypted_data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Function to write serverid, chatbotid, and apikey to a text file
function write_db(serverid, chatbotid, apikey) {
    let lines = [];
    if (fs.existsSync('database.txt')) {
        lines = fs.readFileSync('database.txt', 'utf8').split('\n');
    }

    // Remove any existing records with the same serverid
    let updated_lines = lines.filter(line => line.trim() !== serverid);

    // Generate encryption key
    const key = crypto.randomBytes(32);

    // Encrypt chatbotid and apikey
    const encrypted_chatbotid = encrypt_string(key, chatbotid);
    const encrypted_apikey = encrypt_string(key, apikey);

    // Append the new record
    updated_lines.push(`${serverid}\n${encrypted_chatbotid}\n${encrypted_apikey}\n${key.toString('hex')}\n`);

    // Write updated data to text file
    fs.writeFileSync('database.txt', updated_lines.join(''));
}

// Function to read serverid, chatbotid, and apikey from the text file
function read_db(serverid) {
    // Read data from text file
    const lines = fs.readFileSync('database.txt', 'utf8').split('\n');

    // Find the matching serverid and retrieve the encrypted chatbotid, apikey, and encryption key
    for (let i = 0; i < lines.length; i += 4) {
        if (lines[i].trim() === serverid) {
            const encrypted_chatbotid = lines[i + 1].trim();
            const encrypted_apikey = lines[i + 2].trim();
            const key = Buffer.from(lines[i + 3].trim(), 'hex'); // Retrieve key as Buffer

            // Decrypt chatbotid and apikey
            const chatbotid = decrypt_string(key, encrypted_chatbotid);
            const apikey = decrypt_string(key, encrypted_apikey);

            return { chatbotid, apikey };
        }
    }

    return { chatbotid: null, apikey: null };
}

// Function to delete all records with a specific serverid from the database
function delete_db(serverid) {
    // Read existing data from text file
    let lines = [];
    if (fs.existsSync('database.txt')) {
        lines = fs.readFileSync('database.txt', 'utf8').split('\n');
    }

    // Remove all records with the specified serverid
    const updated_lines = [];
    for (let i = 0; i < lines.length; i += 4) {
        if (lines[i].trim() !== serverid) {
            updated_lines.push(lines.slice(i, i + 4).join(''));
        }
    }

    // Write updated data to text file
    fs.writeFileSync('database.txt', updated_lines.join(''));
}

function add(serverid, chatbotid, apikey) {
    delete_db(serverid);
    write_db(serverid, chatbotid, apikey);
}
