// Função Cifra de César (Criptografia Simétrica)
function cifraDeCesar(texto, chave) {
    let resultado = '';
    for (let i = 0; i < texto.length; i++) {
        let charCode = texto.charCodeAt(i);
        if (charCode >= 65 && charCode <= 90) { // A-Z
            resultado += String.fromCharCode(((charCode - 65 + chave) % 26) + 65);
        } else if (charCode >= 97 && charCode <= 122) { // a-z
            resultado += String.fromCharCode(((charCode - 97 + chave) % 26) + 97);
        } else {
            resultado += texto[i]; // caracteres especiais e espaços
        }
    }
    return resultado;
}

// Variável global para armazenar as chaves RSA
let rsaKeys;

// Gera par de chaves RSA
async function gerarChavesRSA() {
    rsaKeys = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );
    document.getElementById("rsaKeys").innerHTML = "<p>Chaves RSA geradas!</p>";
    await exportarChaves(); // Exibe as chaves geradas no formato PEM
}

// Exporta as chaves para Base64 e exibe no HTML
async function exportarChaves() {
    const publicKeyBuffer = await window.crypto.subtle.exportKey("spki", rsaKeys.publicKey);
    const privateKeyBuffer = await window.crypto.subtle.exportKey("pkcs8", rsaKeys.privateKey);

    const publicKeyBase64 = arrayBufferToBase64(publicKeyBuffer);
    const privateKeyBase64 = arrayBufferToBase64(privateKeyBuffer);

    document.getElementById("publicKey").value =
        "-----BEGIN PUBLIC KEY-----\n" + publicKeyBase64 + "\n-----END PUBLIC KEY-----";

    document.getElementById("privateKey").value =
        "-----BEGIN PRIVATE KEY-----\n" + privateKeyBase64 + "\n-----END PRIVATE KEY-----";
}

// Converte ArrayBuffer em Base64
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000; // evita stack overflow em grandes strings
    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}

// Criptografa com RSA usando a chave pública
async function criptografarRSA(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        rsaKeys.publicKey,
        data
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// Descriptografa com RSA usando a chave privada
async function descriptografarRSA(encryptedBase64) {
    const data = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        rsaKeys.privateKey,
        data
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

// Botão CRIPTOGRAFAR
async function criptografar() {
    const texto = document.getElementById("texto").value;
    const tipo = document.getElementById("tipo").value;
    let resultado;

    if (tipo === "simetrica") {
        const chave = parseInt(document.getElementById("chaveSimetrica").value);
        if (isNaN(chave)) {
            alert("Informe uma chave numérica!");
            return;
        }
        resultado = cifraDeCesar(texto, chave);
    } else {
        if (!rsaKeys) await gerarChavesRSA();
        resultado = await criptografarRSA(texto);
    }

    document.getElementById("resultado").value = resultado;
}

// Botão DESCRIPTOGRAFAR
async function descriptografar() {
    const texto = document.getElementById("resultado").value;
    const tipo = document.getElementById("tipo").value;
    let resultado;

    if (tipo === "simetrica") {
        const chave = parseInt(document.getElementById("chaveSimetrica").value);
        if (isNaN(chave)) {
            alert("Informe uma chave numérica!");
            return;
        }
        resultado = cifraDeCesar(texto, -chave);
    } else {
        if (!rsaKeys) {
            alert("As chaves RSA ainda não foram geradas.");
            return;
        }
        resultado = await descriptografarRSA(texto);
    }

    document.getElementById("resultado").value = resultado;
}
