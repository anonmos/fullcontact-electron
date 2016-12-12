function IO() {
  this.fileSystemOptions = {
    type: "openFile",
    accepts: [{extensions: ['csv']}],
    acceptsAllTypes: false,
    acceptsMultiple: false
  };
}

IO.prototype.readInCsvFile = function () {

  return new Promise(function (resolve, reject) {
    chrome.fileSystem.chooseEntry(this.fileSystemOptions, function (selectedFile) {
      let actualSelectedFile = null;

      if (selectedFile && !Array.isArray(selectedFile)) {
        actualSelectedFile = selectedFile;
      }
      else if (selectedFile && Array.isArray(selectedFile)) {
        actualSelectedFile = selectedFile[0];
      }

      this.readFile(actualSelectedFile)
        .then(function (data) {
          let parsedData = this.parseCsvData(data);
          this.csvData = parsedData;

          resolve(parsedData.join(','));
        });
    }.bind(this));
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
    let file = selectedFile.file(function (data) {
      let fileReader = new FileReader();

      fileReader.onload = function (loadedData) {
        resolve(loadedData.target.result);
      };

      fileReader.onerror = function () {
        reject('Failed to read in file from filereader!');
      };

      fileReader.readAsText(data);
    });
  });
};

IO.prototype.sendBatchPeopleRequest = function (apiKey) {
  return new Promise(function(resolve, reject)
  {
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

IO.prototype.generateRequests = function() {
  let PEOPLE_ENDPOINT = "https://api.fullcontact.com/v2/person.json?email=";
  let rval = [];
  for (let i = 0; i < this.csvData.length; ++i) {
    rval.push(PEOPLE_ENDPOINT + this.csvData[i]);
  }

  return rval;
};

IO.prototype.saveApiKey = function(key) {
  chrome.storage.sync.set({'apiKey': key}, function (data) {
  });
};

IO.prototype.loadApiKey = function() {
  chrome.storage.sync.get('apiKey', function (values) {
    return values.apiKey;
  });
};

module.exports = new IO();