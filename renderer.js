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
    IO.sendBatchPeopleRequest(fullContactApiKeyInput.value)
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
    CsvParser.saveJsonDataAsCsvs(fullContactResponseTextArea.value);
}