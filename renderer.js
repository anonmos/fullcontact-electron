console.log("Runner Loaded!");

const IO = require('./js/io');

let csvInputButton = document.getElementById('select-csv');
let parsedCsvTextArea = document.getElementById('sample-csv-data');
let fullContactResponseTextArea = document.getElementById('fullcontact-response-data');
let fullContactApiKeyInput = document.getElementById('fullcontact-api-key');
let apiKeySaveButton = document.getElementById('save-api-key');
let apiKeyLoadButton = document.getElementById('load-api-key');
let fullContactSubmitButton = document.getElementById('perform-fullcontact-request');

csvInputButton.addEventListener('click', onClickReadCsvFile);
fullContactSubmitButton.addEventListener('click', onClickSubmitFullContactRequestButton);
apiKeySaveButton.addEventListener('click', onClickSaveApiKey);
apiKeyLoadButton.addEventListener('click', onClickLoadApiKey);

function onClickReadCsvFile() {
    IO.readInCsvFile().then(function (data) {
        parsedCsvTextArea.value = data;
    });
}

function onClickSubmitFullContactRequestButton() {
    IO.sendBatchPeopleRequest(fullContactApiKeyInput.value)
        .then(function (data) {
            fullContactResponseTextArea.value = data;
        });
}

function onClickSaveApiKey() {
    IO.saveApiKey(fullContactApiKeyInput.value);
}

function onClickLoadApiKey() {
    apiKeyLoadButton.value = IO.loadApiKey();
}