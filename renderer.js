const {ipcRenderer} = require('electron');
const IO = require('./js/io');
const CsvParser = require('./js/csv_parser');

let csvInputButton = document.getElementById('select-csv');
let parsedCsvTextArea = document.getElementById('sample-csv-data');
let fullContactResponseTextArea = document.getElementById('fullcontact-response-data');
let fullContactApiKeyInput = document.getElementById('fullcontact-api-key');
let apiKeySaveButton = document.getElementById('save-api-key');
let apiKeyLoadButton = document.getElementById('load-api-key');
let fullContactSubmitButton = document.getElementById('perform-fullcontact-request');
let parseCsvButton = document.getElementById('parse-and-download-csvs');

csvInputButton.addEventListener('change', onChangeReadCsvFile);
fullContactSubmitButton.addEventListener('click', onClickSubmitFullContactRequestButton);
apiKeySaveButton.addEventListener('click', onClickSaveApiKey);
apiKeyLoadButton.addEventListener('click', onClickLoadApiKey);
parseCsvButton.addEventListener('click', onClickParseCsvButton);


function onChangeReadCsvFile(evt) {
    IO.readInCsvFile(evt.target.files).then(function (data) {
        parsedCsvTextArea.value = data;
    });
}

function onClickSubmitFullContactRequestButton() {
    IO.sendAllBatchPeopleRequests(fullContactApiKeyInput.value)
        .then(function (data) {
            fullContactResponseTextArea.value = data;
        });
}

function onClickSaveApiKey() {
    IO.saveApiKey(fullContactApiKeyInput.value);
}

function onClickLoadApiKey() {
    fullContactApiKeyInput.value = IO.loadApiKey();
}

function onClickParseCsvButton() {

    //Have to retrieve the downloads path from main.js, as it is the only thing with
    //access to the app context
    let downloadPath = ipcRenderer.sendSync('ipc-main-channel');
    let pathSlash = downloadPath.includes('\\') ? '\\' : '/';

    if (downloadPath[downloadPath.length - 1] !== pathSlash) {
        downloadPath += pathSlash;
    }

    CsvParser.setDownloadPath(downloadPath);
    CsvParser.saveJsonDataAsCsvs(fullContactResponseTextArea.value);
}
