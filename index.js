const envLoaded = require('dotenv').config();
const fs = require('fs');
const {promisify} = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const sourceLanguage = 'en-US';
const targetLanguage = 'fr-FR';

if (envLoaded.error) {
    throw envLoaded.error
}

const projectId = process.env.PROJECT_ID;
const location = 'global';
const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;

// Instantiates a client
const translationClient = new TranslationServiceClient();
const translateText = async (text) => {
  // Construct request
  const request = {
    parent: translationClient.locationPath(projectId, location),
    contents: [text],
    mimeType: 'text/plain', // mime types: text/plain, text/html
    sourceLanguageCode: sourceLanguage,
    targetLanguageCode: targetLanguage,
  };

  // Run request
  const [response] = await translationClient.translateText(request);
  return response.translations[0].translatedText;
}


const traverse = async (value, prev, key) => {
    if (typeof(value) === 'object') {
        for (let key in value) {
            await traverse(value[key], value, key);
        } 
    } else {
        prev[key] = await translateText(value);
        console.log(prev[key]);
    }
};

const translate = async() => {
    const fileContent = await readFile(`./translations/${sourceLanguage}.json`);
    const source = JSON.parse(fileContent);
    console.log(JSON.stringify(source, null, 2));

    await traverse(source, null, null);
    await writeFile(`./translations/${targetLanguage}.json`, 
        JSON.stringify(source, null, 2));
};


(async () => {
    await translate();
})();
