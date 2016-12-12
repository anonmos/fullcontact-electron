function IO() {
    this.fileSystemOptions = {
        type: "openFile",
        accepts: [{extensions: ['csv']}],
        acceptsAllTypes: false,
        acceptsMultiple: false
    };
}

IO.prototype.readInCsvFile = function (selectedFile) {
    let mainContext = this;
    return new Promise(function (resolve, reject) {
        mainContext.readFile(selectedFile[0])
            .then(function (data) {
                let parsedData = mainContext.parseCsvData(data);
                mainContext.csvData = parsedData;

                resolve(parsedData.join(','));
            });
    });
};

IO.prototype.parseCsvData = function (rawData) {
    let parsedData = rawData;

    parsedData = parsedData.replace('"', '');
    parsedData = parsedData.split(/[\n,]+/);

    //There's an empty entry in the parsedData array after it's split.
    //Pop that off if it exists.
    if (parsedData[parsedData.length - 1].length == 0) {
        parsedData.pop();
    }

    return parsedData;
};

IO.prototype.getCsvData = function () {
    return this.csvData;
};

IO.prototype.readFile = function (selectedFile) {
    return new Promise(function (resolve, reject) {
        let fileReader = new FileReader();

        fileReader.onload = function (loadedData) {
            resolve(loadedData.target.result);
        };

        fileReader.onerror = function () {
            reject('Failed to read in file from filereader!');
        };

        fileReader.readAsText(selectedFile);
    });
};

IO.prototype.sendBatchPeopleRequest = function (apiKey) {
    return new Promise(function (resolve, reject) {
        if (this.csvData && apiKey.value.length > 0) {
            let ajax = new XMLHttpRequest();
            let requestBody = {};
            requestBody.requests = this.generateRequests();
            ajax.open("POST", "https://api.fullcontact.com/v2/batch.json?apiKey=" + apiKey.value);
            ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            ajax.onreadystatechange = function () {
                if (ajax.readyState === XMLHttpRequest.DONE && ajax.status === 200) {
                    this.peopleResponse = ajax.responseText;
                    resolve(this.peopleResponse);
                }
                else if (ajax.readyState === XMLHttpRequest.DONE && ajax.status !== 200) {
                    reject('Oops!  Something went wrong with the request to Fullcontact.  Please seek developer assistance.');
                }
            };

            ajax.send(JSON.stringify(requestBody));
        }
        else {
            reject('Please select a CSV and provide an API key first.');
        }
    });
};

IO.prototype.generateRequests = function () {
    let PEOPLE_ENDPOINT = "https://api.fullcontact.com/v2/person.json?email=";
    let rval = [];
    for (let i = 0; i < this.csvData.length; ++i) {
        rval.push(PEOPLE_ENDPOINT + this.csvData[i]);
    }

    return rval;
};

IO.prototype.saveApiKey = function (key) {
    localStorage.setItem('apiKey', key);
};

IO.prototype.loadApiKey = function () {
    return localStorage.getItem('apiKey');
};

module.exports = new IO();