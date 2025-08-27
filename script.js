// script.js

// Função Cifra de César
function cifraDeCesar(texto, chave) {
    let resultado = '';
    for (let i = 0; i < texto.length; i++) {
        let charCode = texto.charCodeAt(i);
        if (charCode >= 65 && charCode <= 90) {
            resultado += String.fromCharCode(((charCode - 65 + chave) % 26) + 65);
        } else if (charCode >= 97 && charCode <= 122) {
            resultado += String.fromCharCode(((charCode - 97 + chave) % 26) + 97);
        } else {
            resultado += texto[i];
        }
    }
    return resultado;
}

// Funções RSA (usando SubtleCrypto)
let rsaKeys;

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
}

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

// Ações nos botões
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
