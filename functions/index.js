
const functions = require("firebase-functions");
const {defineSecret} = require("firebase-functions/params");
const axios = require("axios");
const https = require("https");
const JWT = require("jsonwebtoken");

const fs = require("fs");
const path = require("path");

// Carregar variáveis de ambiente (apenas para desenvolvimento local)
require("dotenv").config();

// Definir secrets (do Secret Manager ou process.env como fallback)
const gerencianetClientIdSecret = defineSecret("GERENCIANET_CLIENT_ID");
const gerencianetClientSecret = defineSecret("GERENCIANET_CLIENT_SECRET");
const pixKeySecret = defineSecret("PIX_KEY");
const jwtPandaSecret = defineSecret("JWT_PANDA_SECRET");

// Configurações do Firebase Functions Config (ou process.env como fallback)
/**
 * Obtém valor de configuração do Firebase Functions Config ou process.env
 * @param {string} key - Chave da configuração (ex: "gerencianet.cert_name")
 * @param {string} defaultValue - Valor padrão caso não encontre
 * @return {string|undefined} Valor da configuração
 */
function getConfig(key, defaultValue) {
  try {
    const parts = key.split(".");
    let value = functions.config();
    for (const part of parts) {
      value = value[part];
      if (!value) break;
    }
    const envKey = key.replace(/\./g, "_").toUpperCase();
    return value || process.env[envKey] || defaultValue;
  } catch {
    const envKey = key.replace(/\./g, "_").toUpperCase();
    return process.env[envKey] || defaultValue;
  }
}

const certName = getConfig("gerencianet.cert_name");
const endPoint = getConfig("gerencianet.endpoint", "https://pix.api.efipay.com.br");
const jwtPandaDrmGroupId = getConfig("jwt_panda.drm_group_id");
const pandaAuth = getConfig("panda.auth_key");

// Função helper para obter valores de secrets (com fallback para process.env)
/**
 * Obtém valor de secret do Firebase Secret Manager ou process.env
 * @param {object} secret - Objeto secret do Firebase
 * @param {string} envKey - Nome da variável de ambiente como fallback
 * @return {string|undefined} Valor do secret
 */
function getSecretValue(secret, envKey) {
  try {
    return secret.value() || process.env[envKey];
  } catch {
    return process.env[envKey];
  }
}

// Validação das variáveis obrigatórias (só no carregamento inicial)
if (!certName) {
  console.warn(
      "AVISO: GERENCIANET_CERT_NAME não configurado. " +
      "Certifique-se de configurar via functions config ou .env",
  );
}

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
const {getAuth} = require("firebase-admin/auth");

admin.initializeApp();

exports.checkCpfExists = functions.https.onCall(async (data, context) => {
  try {
    const cpf = data.cpf;

    if (!cpf) {
      console.error("checkCpfExists: CPF não fornecido");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "CPF é obrigatório",
      );
    }

    const usersRef = admin.firestore().collection("Users");
    const querySnapshot = await usersRef.where("cpf", "==", cpf).get();

    if (!querySnapshot.empty) {
      return {exists: true};
    } else {
      return {exists: false};
    }
  } catch (error) {
    console.error("checkCpfExists: Erro ao verificar CPF:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Falha ao verificar CPF",
        error,
    );
  }
});

exports.uploadPandaFile = functions.https.onCall(async (data) => {
  const {Buffer} = require("buffer");
  try {
    const {filename, fileBuffer} = data;

    if (!filename || !fileBuffer) {
      console.error("uploadPandaFile: Dados de upload inválidos");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Filename e fileBuffer são obrigatórios",
      );
    }

    if (!pandaAuth) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "PANDA_AUTH_KEY não configurada",
      );
    }

    const pandaId = require("uuid").v4();

    // Criando metadata (deve ser uma única linha sem quebras)
    const authB64 = Buffer.from(pandaAuth).toString("base64");
    const filenameB64 = Buffer.from(filename).toString("base64");
    const videoIdB64 = Buffer.from(pandaId).toString("base64");
    const metadata =
        `authorization ${authB64},filename ${filenameB64},video_id ${videoIdB64}`;

    // Limpar a string base64 removendo espaços, quebras de linha e
    // outros caracteres inválidos
    const cleanBase64 = fileBuffer.replace(/\s/g, "");

    // Validar se é base64 válido
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
      console.error("uploadPandaFile: String base64 inválida");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "String base64 inválida",
      );
    }

    let buffer;
    try {
      buffer = Buffer.from(cleanBase64, "base64");
    } catch (error) {
      console.error(
          "uploadPandaFile: Erro ao converter base64 para Buffer:",
          error);
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Erro ao processar base64: " + error.message,
      );
    }

    await axios.post("https://uploader-us01.pandavideo.com.br/files", buffer, {
      headers: {
        "Tus-Resumable": "1.0.0",
        "Upload-Length": buffer.length,
        "Content-Type": "application/offset+octet-stream",
        "Upload-Metadata": metadata,
      },
    });

    console.log(
        `uploadPandaFile: Upload realizado com sucesso. PandaId: ${pandaId}`,
    );
    return {pandaId};
  } catch (error) {
    console.error("uploadPandaFile: Erro ao fazer upload:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Falha no upload",
        error,
    );
  }
});

exports.updateUser = functions.https.onCall(async (data) => {
  try {
    if (!data.user || !data.user.id) {
      console.error("updateUser: Dados de usuário inválidos");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Dados de usuário são obrigatórios",
      );
    }

    const result = await getAuth().updateUser(data.user.id, data.user);
    console.log(`updateUser: Usuário ${data.user.id} atualizado com sucesso`);
    return result;
  } catch (error) {
    console.error("updateUser: Erro ao atualizar usuário:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Falha ao atualizar usuário",
        error,
    );
  }
});
exports.deleteUser = functions.https.onCall(async (data) => {
  try {
    if (!data.userId) {
      console.error("deleteUser: ID do usuário não fornecido");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "ID do usuário é obrigatório",
      );
    }

    const result = await getAuth().deleteUser(data.userId);
    console.log(`deleteUser: Usuário ${data.userId} deletado com sucesso`);
    return result;
  } catch (error) {
    console.error("deleteUser: Erro ao deletar usuário:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Falha ao deletar usuário",
        error,
    );
  }
});

exports.gerenciaNetAuth = functions.runWith({
  secrets: ["GERENCIANET_CLIENT_ID", "GERENCIANET_CLIENT_SECRET"],
}).https.onCall(async () => {
  try {
    const clientId = getSecretValue(
        gerencianetClientIdSecret,
        "GERENCIANET_CLIENT_ID",
    );
    const clientSecret = getSecretValue(
        gerencianetClientSecret,
        "GERENCIANET_CLIENT_SECRET",
    );

    if (!clientId || !clientSecret || !certName) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "Credenciais GerenciaNet não configuradas",
      );
    }

    const cert = fs.readFileSync(
        path.resolve(__dirname, `./certs/${certName}`),
    );

    const agent = new https.Agent({
      pfx: cert,
      passphrase: "",
    });

    const credentials = Buffer.from(
        `${clientId}:${clientSecret}`,
    ).toString("base64");

    console.log("gerenciaNetAuth: Iniciando autenticação GerenciaNet");
    const response = await axios({
      method: "POST",
      url: `${endPoint}/oauth/token`,
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      httpsAgent: agent,
      data: {
        grant_type: "client_credentials",
      },
    });

    console.log("gerenciaNetAuth: Autenticação realizada com sucesso");
    return response.data.access_token;
  } catch (error) {
    console.error("gerenciaNetAuth: Erro na autenticação:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Falha na autenticação GerenciaNet",
        error,
    );
  }
});

exports.generateCob = functions.runWith({
  secrets: ["GERENCIANET_CLIENT_ID", "GERENCIANET_CLIENT_SECRET", "PIX_KEY"],
}).https.onCall(async (data) => {
  try {
    if (!data.accessToken || !data.price) {
      console.error("generateCob: Dados obrigatórios não fornecidos");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "AccessToken e price são obrigatórios",
      );
    }

    const clientId = getSecretValue(
        gerencianetClientIdSecret,
        "GERENCIANET_CLIENT_ID",
    );
    const clientSecret = getSecretValue(
        gerencianetClientSecret,
        "GERENCIANET_CLIENT_SECRET",
    );
    const pixKey = getSecretValue(pixKeySecret, "PIX_KEY");

    if (!clientId || !clientSecret || !certName) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "Credenciais GerenciaNet não configuradas",
      );
    }

    const cert = fs.readFileSync(
        path.resolve(__dirname, `./certs/${certName}`),
    );

    const agent = new https.Agent({
      pfx: cert,
      passphrase: "",
    });

    const endpoint = `${endPoint}/v2/cob`;

    const dataCob = {
      calendario: {
        expiracao: 3600,
      },
      valor: {
        original: data.price,
      },
      chave: pixKey,
      solicitacaoPagador: "Aula",
    };

    if (!dataCob.chave) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "Chave PIX não configurada",
      );
    }

    const config = {
      httpsAgent: agent,
      headers: {
        "Authorization": `Bearer ${data.accessToken}`,
        "Content-Type": "application/json",
      },
    };

    console.log(`generateCob: Gerando cobrança para valor ${data.price}`);
    const response = await axios.post(endpoint, dataCob, config);
    console.log("generateCob: Cobrança gerada com sucesso");
    return response.data;
  } catch (error) {
    console.error("generateCob: Erro ao gerar cobrança:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Falha ao gerar cobrança",
        error,
    );
  }
});

exports.jwtPanda = functions.runWith({
  secrets: ["JWT_PANDA_SECRET"],
}).https.onCall(async (data) => {
  try {
    if (!data.name || !data.cpf) {
      console.error("jwtPanda: Dados obrigatórios não fornecidos");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Nome e CPF são obrigatórios",
      );
    }

    const secret = getSecretValue(jwtPandaSecret, "JWT_PANDA_SECRET");
    const drmGroupId = jwtPandaDrmGroupId || process.env.JWT_PANDA_DRM_GROUP_ID;

    const jwtObj = {
      drm_group_id: drmGroupId,
      string1: "Licenciado para",
      string2: "Nome: " + data.name,
      string3: "CPF: " + data.cpf,
    };
    const expiresIn = 86400;

    if (!secret || !jwtObj.drm_group_id) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "Configurações JWT não encontradas",
      );
    }

    const token = JWT.sign(jwtObj, secret, {expiresIn});

    console.log(`jwtPanda: JWT gerado com sucesso para ${data.name}`);
    return token;
  } catch (error) {
    console.error("jwtPanda: Erro ao gerar JWT:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Falha ao gerar JWT",
        error,
    );
  }
});

exports.generateQRCode = functions.runWith({
  secrets: ["GERENCIANET_CLIENT_ID", "GERENCIANET_CLIENT_SECRET"],
}).https.onCall(async (data) => {
  try {
    if (!data.id || !data.accessToken) {
      console.error("generateQRCode: Dados obrigatórios não fornecidos");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "ID e accessToken são obrigatórios",
      );
    }

    if (!certName) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "Certificado GerenciaNet não configurado",
      );
    }

    const cert = fs.readFileSync(
        path.resolve(__dirname, `./certs/${certName}`),
    );

    const agent = new https.Agent({
      pfx: cert,
      passphrase: "",
    });

    const endpoint = `${endPoint}/v2/loc/${data.id}/qrcode`;

    const config = {
      httpsAgent: agent,
      headers: {
        "Authorization": `Bearer ${data.accessToken}`,
        "Content-Type": "application/json",
      },
    };

    console.log(`generateQRCode: Gerando QR Code para ID ${data.id}`);
    const response = await axios.get(endpoint, config);
    console.log("generateQRCode: QR Code gerado com sucesso");
    return response.data;
  } catch (error) {
    console.error("generateQRCode: Erro ao gerar QR Code:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Falha ao gerar QR Code",
        error,
    );
  }
});

exports.webhook = functions.https.onRequest((req, res) => {
  return res.status(200).send("OK");
});

exports.deletePandaVideo = functions.https.onCall(async (data) => {
  try {
    const {videoId} = data;

    if (!videoId) {
      console.error("deletePandaVideo: ID do vídeo não fornecido");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "ID do vídeo é obrigatório",
      );
    }

    if (!pandaAuth) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "PANDA_AUTH_KEY não configurada",
      );
    }

    console.log(`deletePandaVideo: Deletando vídeo ${videoId}`);
    await axios.delete("https://api-v2.pandavideo.com.br/videos", {
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": pandaAuth,
      },
      data: [{video_id: videoId}],
    });

    console.log(`deletePandaVideo: Vídeo ${videoId} deletado com sucesso`);
    return {success: true};
  } catch (error) {
    console.error("deletePandaVideo: Erro ao deletar vídeo:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Falha ao deletar vídeo",
        error,
    );
  }
});

exports.getPandaVideoInfo = functions.https.onCall(async (data) => {
  try {
    const {pandaId} = data;

    if (!pandaId) {
      console.error("getPandaVideoInfo: ID do vídeo não fornecido");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "ID do vídeo é obrigatório",
      );
    }

    if (!pandaAuth) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "PANDA_AUTH_KEY não configurada",
      );
    }

    console.log(`getPandaVideoInfo: Buscando informações do vídeo ${pandaId}`);
    const response = await axios.get("https://api-v2.pandavideo.com.br/videos/" + pandaId, {
      headers: {
        Authorization: pandaAuth,
      },
    });

    console.log(
        `getPandaVideoInfo: Informações do vídeo ${pandaId} obtidas ` +
        `com sucesso`,
    );
    return response.data;
  } catch (error) {
    console.error(
        "getPandaVideoInfo: Erro ao buscar informações do vídeo:",
        error,
    );
    throw new functions.https.HttpsError(
        "internal",
        "Falha ao buscar informações do vídeo",
        error,
    );
  }
});

exports.uploadPandaVideo = functions.https.onCall(async (data) => {
  try {
    const {filename, fileBuffer} = data;

    if (!filename || !fileBuffer) {
      console.error("uploadPandaVideo: Dados de upload inválidos");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Filename e fileBuffer são obrigatórios",
      );
    }

    if (!pandaAuth) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "PANDA_AUTH_KEY não configurada",
      );
    }

    const {Buffer} = require("buffer");
    const pandaId = require("uuid").v4();

    // Criando metadata (deve ser uma única linha sem quebras)
    const authB64 = Buffer.from(pandaAuth).toString("base64");
    const filenameB64 = Buffer.from(filename).toString("base64");
    const videoIdB64 = Buffer.from(pandaId).toString("base64");
    const metadata =
        `authorization ${authB64},filename ${filenameB64},video_id ${videoIdB64}`;

    // Limpar a string base64 removendo espaços, quebras de linha e
    // outros caracteres inválidos
    const cleanBase64 = fileBuffer.replace(/\s/g, "");

    // Validar se é base64 válido
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
      console.error("uploadPandaVideo: String base64 inválida");
      throw new functions.https.HttpsError(
          "invalid-argument",
          "String base64 inválida",
      );
    }

    let buffer;
    try {
      buffer = Buffer.from(cleanBase64, "base64");
    } catch (error) {
      console.error(
          "uploadPandaVideo: Erro ao converter base64 para Buffer:",
          error);
      throw new functions.https.HttpsError(
          "invalid-argument",
          "Erro ao processar base64: " + error.message,
      );
    }

    console.log(
        `uploadPandaVideo: Iniciando upload do arquivo ${filename} ` +
        `com ID ${pandaId}, tamanho: ${buffer.length} bytes`,
    );
    await axios.post("https://uploader-us01.pandavideo.com.br/files", buffer, {
      headers: {
        "Tus-Resumable": "1.0.0",
        "Upload-Length": buffer.length,
        "Content-Type": "application/offset+octet-stream",
        "Upload-Metadata": metadata,
      },
    });

    console.log(
        `uploadPandaVideo: Upload do arquivo ${filename} concluído ` +
        `com sucesso. ` +
        `PandaId: ${pandaId}`,
    );
    return {pandaId};
  } catch (error) {
    console.error("uploadPandaVideo: Erro ao fazer upload do vídeo:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Falha no upload do vídeo",
        error,
    );
  }
});

exports.webhookPix = functions.https.onRequest(async (req, res) => {
  try {
    console.log("webhookPix: Webhook PIX recebido");

    if (!req.body || !req.body.pix || !req.body.pix[0] ||
        !req.body.pix[0].txid) {
      console.error("webhookPix: Dados do webhook inválidos");
      return res.status(400).send("Dados inválidos");
    }

    const txid = req.body.pix[0].txid;
    console.log(`webhookPix: Processando transação ${txid}`);

    const chargesCollection = admin.firestore().collection("Charges");
    const chargeDoc = chargesCollection.doc(txid);
    const charge = await chargeDoc.get();

    if (!charge.exists) {
      console.error(`webhookPix: Cobrança ${txid} não encontrada`);
      return res.status(404).send("Cobrança não encontrada");
    }

    const usersCollection = admin.firestore().collection("Users");
    const userDoc = usersCollection.doc(charge.data().userId);
    const user = await userDoc.get();

    if (!user.exists) {
      console.error(
          `webhookPix: Usuário ${charge.data().userId} não encontrado`,
      );
      return res.status(404).send("Usuário não encontrado");
    }

    const lessonList = user.data().lessonList || [];
    let alreadyHaveLesson = false;

    if (lessonList.find((l) => l.lessonId == charge.data().lessonId)) {
      alreadyHaveLesson = true;
    }

    const lessonsCollection = admin.firestore().collection("Lessons");
    const lessonDoc = lessonsCollection.doc(charge.data().lessonId);
    const lesson = await lessonDoc.get();

    if (!lesson.exists) {
      console.error(
          `webhookPix: Aula ${charge.data().lessonId} não encontrada`,
      );
      return res.status(404).send("Aula não encontrada");
    }

    const lessonVideos = lesson.data().videosIds.map((videoId) => {
      return {videoId, views: 0};
    });

    if (!alreadyHaveLesson) {
      lessonList.push({
        lessonId: charge.data().lessonId,
        videos: lessonVideos,
      });
      console.log(
          `webhookPix: Aula ${charge.data().lessonId} adicionada ao usuário ` +
          `${charge.data().userId}`,
      );
    } else {
      const lessonIndex = lessonList.findIndex(
          (l) => l.lessonId == charge.data().lessonId,
      );
      lessonList[lessonIndex].videos = lessonVideos;
      console.log(
          `webhookPix: Aula ${charge.data().lessonId} atualizada ` +
          `para o usuário ` +
          `${charge.data().userId}`,
      );
    }

    await userDoc.set({lessonList}, {merge: true});
    console.log(
        `webhookPix: Webhook processado com sucesso para transação ${txid}`,
    );
    return res.status(200).send("OK");
  } catch (error) {
    console.error("webhookPix: Erro ao processar webhook:", error);
    return res.status(500).send("Erro interno do servidor");
  }
});
