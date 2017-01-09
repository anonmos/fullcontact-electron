function IO() {}

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

IO.prototype.sendAllBatchPeopleRequests = function (apiKey) {
    let MAXIMUM_BATCH_REQUEST_SIZE = 20;    //Fullcontact only allows batch requests of 20 emails at a time

    let mainContext = this;

    return new Promise(function(resolve, reject) {
        let requestUrls = mainContext.generateRequests();

        let requestPromises = [];

        for (let i = 0; i < requestUrls.length; i += MAXIMUM_BATCH_REQUEST_SIZE) {
            let truncatedRequests = requestUrls.slice(i, i + MAXIMUM_BATCH_REQUEST_SIZE);

            requestPromises.push(mainContext.sendTruncatedBatchRequest(apiKey, truncatedRequests));
        }

        Promise.all(requestPromises)
            .then(function(values) {
                let finalResult = JSON.parse(values[0]);

                for (let i = 1; i < values.length; ++i) {
                    finalResult.responses = Object.assign(finalResult.responses, JSON.parse(values[i]).responses);
                }

                mainContext.peopleResponse = finalResult;

                resolve(JSON.stringify(finalResult));
            });
    });
};

IO.prototype.sendTruncatedBatchRequest = function (apiKey, truncatedRequests) {
    let mainContext = this;

    return new Promise(function (resolve, reject) {
        if (mainContext.csvData && apiKey.length > 0) {
            let ajax = new XMLHttpRequest();
            let requestBody = {};
            requestBody.requests = truncatedRequests;
            ajax.open("POST", "https://api.fullcontact.com/v2/batch.json?apiKey=" + apiKey);
            ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

            ajax.onreadystatechange = function () {
                if (ajax.readyState === XMLHttpRequest.DONE && ajax.status === 200) {
                    resolve(ajax.responseText);
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