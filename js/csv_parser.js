function CsvParser() {
}

let fs = require('fs');
const electron = require('electron');
let documentsFolder = electron.app.getPath('documents') + "/";

CsvParser.prototype.saveJsonDataAsCsvs = function (jsonData) {
    let EMAIL_BULK_REQUEST_PREFIX = "https://api.fullcontact.com/v2/person.json?email=";
    let contentsGraph = JSON.parse(jsonData);

    let PHOTOS_FILE_NAME = documentsFolder + 'photos.csv';
    let CONTACT_INFO_FILE_NAME = documentsFolder + 'contact_info.csv';
    let ORGANIZATIONS_FILE_NAME = documentsFolder + 'organizations.csv';
    let DEMOGRAPHICS_FILE_NAME = documentsFolder + 'demographics.csv';
    let SOCIAL_PROFILES_FILE_NAME = documentsFolder + "social_profiles.csv";
    let METADATA_FILE_NAME = documentsFolder + "metadata.csv";
    let DIGITAL_FOOTPRINT_TOPICS_FILE_NAME = documentsFolder + 'digital_footprint_topics.csv';
    let DIGITAL_FOOTPRINT_SCORES_FILE_NAME = documentsFolder + 'digital_footprint_scores.csv';

    let photosColumnHeaders = ["email", "requestId", "typeName", "isPrimary", "type", "typeId", "url"];
    let contactInfoColumnHeaders = ["email", "requestId", "familyName", "givenName", "fullName", "websites"];
    let organizationsColumnHeaders = ["email", "requestId", "startDate", "title", "isPrimary", "name", "current"];
    let demographicsColumnHeaders = ["email", "requestId", "locationGeneral", "gender", "normalizedLocation", "deducedLocation", "county",
        "isCountyDeduced", "continent", "isContinentDeduced", "stateName", "stateCode", "isStateDeduced", "countryName",
        "countryCode", "isCountryDeduced", "city", "isCityDeduced", "likelihood"];
    let socialProfilesColumnHeaders = ["email", "requestId", "id", "typeName", "username", "followers", "following",
        "bio", "type", "typeId", "url"];
    let metaDataHeaders = ["email", "requestId", "likelihood", "status", "message"];
    let digitalFootprintTopicsHeaders = ["email", "requestId", "value", "provider"];
    let digitalFootprintScoresHeaders = ["email", "requestId", "value", "provider", "type"];

    fs.appendFileSync(PHOTOS_FILE_NAME, photosColumnHeaders.join(','));
    fs.appendFileSync(CONTACT_INFO_FILE_NAME, contactInfoColumnHeaders.join(','));
    fs.appendFileSync(ORGANIZATIONS_FILE_NAME, organizationsColumnHeaders.join(','));
    fs.appendFileSync(DEMOGRAPHICS_FILE_NAME, demographicsColumnHeaders.join(','));
    fs.appendFileSync(SOCIAL_PROFILES_FILE_NAME, socialProfilesColumnHeaders.join(','));
    fs.appendFileSync(METADATA_FILE_NAME, metaDataHeaders.join(','));
    fs.appendFileSync(DIGITAL_FOOTPRINT_SCORES_FILE_NAME, digitalFootprintScoresHeaders.join(','));
    fs.appendFileSync(DIGITAL_FOOTPRINT_TOPICS_FILE_NAME, digitalFootprintTopicsHeaders.join(','));

    for (let bulkRequestEmail in contentsGraph.responses) {
        let overallPhotosObjectphotoObject = initializeObject(photosColumnHeaders);
        let overallContactInfoObject = initializeObject(contactInfoColumnHeaders);
        let overallOrganizationsInfoObject = initializeObject(organizationsColumnHeaders);
        let overallDemographicsInfoObject = {};
        let overallSocialProfilesInfoObject = initializeObject(socialProfilesColumnHeaders);
        let overallMetadataInfoObject = {};
        let overallDigitalFootprintScores = initializeObject(digitalFootprintScoresHeaders);
        let overallDigitalFootprintTopics = initializeObject(digitalFootprintTopicsHeaders);

        let email = bulkRequestEmail.replace(EMAIL_BULK_REQUEST_PREFIX, '');
        let requestId = contentsGraph.responses[bulkRequestEmail].requestId;

        overallPhotosObjectphotoObject = parsePhotoObject(overallPhotosObjectphotoObject, contentsGraph.responses[bulkRequestEmail].photos);
        overallContactInfoObject = parseContactInfoObject(overallContactInfoObject, contentsGraph.responses[bulkRequestEmail].contactInfo);
        overallOrganizationsInfoObject = parseOrgObject(overallOrganizationsInfoObject, contentsGraph.responses[bulkRequestEmail].organizations);
        overallDemographicsInfoObject = parseDemographicsObject(overallDemographicsInfoObject, contentsGraph.responses[bulkRequestEmail].demographics,
            demographicsColumnHeaders);
        overallSocialProfilesInfoObject = parseSocialProfilesObject(overallSocialProfilesInfoObject,
            contentsGraph.responses[bulkRequestEmail].socialProfiles, socialProfilesColumnHeaders);
        overallMetadataInfoObject = parseMetaData(overallMetadataInfoObject, contentsGraph.responses[bulkRequestEmail], metaDataHeaders);

        let digitalFootprint = contentsGraph.responses[bulkRequestEmail].digitalFootprint;
        if (digitalFootprint) {
            overallDigitalFootprintScores = parseDigitalFootprint(overallDigitalFootprintScores, digitalFootprint.scores, digitalFootprintScoresHeaders);
            overallDigitalFootprintTopics = parseDigitalFootprint(overallDigitalFootprintTopics, digitalFootprint.topics, digitalFootprintTopicsHeaders);
        }


        //Photos
        for (let i = 0; i < overallPhotosObjectphotoObject.typeName.length; ++i) {

            prependNewlineEmailAndRequestId(PHOTOS_FILE_NAME, email, requestId, fs);

            fs.appendFileSync(PHOTOS_FILE_NAME, overallPhotosObjectphotoObject.typeName[i] + ',');
            fs.appendFileSync(PHOTOS_FILE_NAME, overallPhotosObjectphotoObject.isPrimary[i] + ',');
            fs.appendFileSync(PHOTOS_FILE_NAME, overallPhotosObjectphotoObject.type[i] + ',');
            fs.appendFileSync(PHOTOS_FILE_NAME, overallPhotosObjectphotoObject.typeId[i] + ',');
            fs.appendFileSync(PHOTOS_FILE_NAME, overallPhotosObjectphotoObject.url[i]);
        }

        //Contact Info
        if (overallContactInfoObject.websites) {
            for (let i = 0; i < overallContactInfoObject.websites.length; ++i) {

                prependNewlineEmailAndRequestId(CONTACT_INFO_FILE_NAME, email, requestId, fs);

                fs.appendFileSync(CONTACT_INFO_FILE_NAME, overallContactInfoObject.familyName + ',');
                fs.appendFileSync(CONTACT_INFO_FILE_NAME, overallContactInfoObject.givenName + ',');
                fs.appendFileSync(CONTACT_INFO_FILE_NAME, overallContactInfoObject.fullName + ',');
                fs.appendFileSync(CONTACT_INFO_FILE_NAME, overallContactInfoObject.websites[i]);
            }
        } else if (Object.keys(overallContactInfoObject).length > 0) {

            prependNewlineEmailAndRequestId(CONTACT_INFO_FILE_NAME, email, requestId, fs);

            fs.appendFileSync(CONTACT_INFO_FILE_NAME, overallContactInfoObject.familyName + ',');
            fs.appendFileSync(CONTACT_INFO_FILE_NAME, overallContactInfoObject.givenName + ',');
            fs.appendFileSync(CONTACT_INFO_FILE_NAME, overallContactInfoObject.fullName + ',');
        }

        //Organizations
        for (let i = 0; i < overallOrganizationsInfoObject.startDate.length; ++i) {
            prependNewlineEmailAndRequestId(ORGANIZATIONS_FILE_NAME, email, requestId, fs);

            //Start at 2, skip email and requestId
            for (let j = 2; j < organizationsColumnHeaders.length; ++j) {

                let currentHeader = organizationsColumnHeaders[j];

                fs.appendFileSync(ORGANIZATIONS_FILE_NAME, overallOrganizationsInfoObject[currentHeader][i]);

                if (j + 1 != organizationsColumnHeaders.length) {
                    fs.appendFileSync(ORGANIZATIONS_FILE_NAME, ',');
                }

            }
        }

        //Demographics
        if (Object.keys(overallDemographicsInfoObject).length > 0) {
            prependNewlineEmailAndRequestId(DEMOGRAPHICS_FILE_NAME, email, requestId, fs);

            //Start at 2, skip email and requestId
            for (i = 2; i < demographicsColumnHeaders.length; ++i) {
                let header = demographicsColumnHeaders[i];
                fs.appendFileSync(DEMOGRAPHICS_FILE_NAME, overallDemographicsInfoObject[header]);

                if (i + 1 < demographicsColumnHeaders.length) {
                    fs.appendFileSync(DEMOGRAPHICS_FILE_NAME, ',');
                }
            }
        }

        //Social Profiles
        for (let i = 0; i < overallSocialProfilesInfoObject.id.length; ++i) {
            prependNewlineEmailAndRequestId(SOCIAL_PROFILES_FILE_NAME, email, requestId, fs);

            //Start at 2 to skip the email and requestId
            for (let headerIndex = 2; headerIndex < socialProfilesColumnHeaders.length; ++headerIndex) {
                let header = socialProfilesColumnHeaders[headerIndex];
                fs.appendFileSync(SOCIAL_PROFILES_FILE_NAME, overallSocialProfilesInfoObject[header][i]);

                if (i + 1 < socialProfilesColumnHeaders.length) {
                    fs.appendFileSync(SOCIAL_PROFILES_FILE_NAME, ',');
                }
            }

        }

        //Metadata
        fs.appendFileSync(METADATA_FILE_NAME, '\n' + email);
        for (let headerIndex = 1; headerIndex < metaDataHeaders.length; ++headerIndex) {
            let header = metaDataHeaders[headerIndex];
            fs.appendFileSync(METADATA_FILE_NAME, overallMetadataInfoObject[header]);

            if (headerIndex + 1 < metaDataHeaders.length) {
                fs.appendFileSync(METADATA_FILE_NAME, ',');
            }
        }

        //Digital footprint scores
        writeDigitalFootprint(overallDigitalFootprintScores, digitalFootprintScoresHeaders,
            DIGITAL_FOOTPRINT_SCORES_FILE_NAME, email, requestId, fs);

        //Digital footprint headers
        writeDigitalFootprint(overallDigitalFootprintTopics, digitalFootprintTopicsHeaders,
            DIGITAL_FOOTPRINT_TOPICS_FILE_NAME, email, requestId, fs);
    }
};

function parsePhotoObject(photosObject, photosContent) {
    for (let photos in photosContent) {
        photosObject.typeName.push(photosContent[photos].typeName ? photosContent[photos].typeName : null);
        photosObject.isPrimary.push(photosContent[photos].isPrimary ? photosContent[photos].isPrimary : null);
        photosObject.type.push(photosContent[photos].type ? photosContent[photos].type : null);
        photosObject.typeId.push(photosContent[photos].typeId ? photosContent[photos].typeId : null);
        photosObject.url.push(photosContent[photos].url ? photosContent[photos].url : null);
    }

    return photosObject;
}

function parseContactInfoObject(contactInfoObject, contactInfoContent) {
    if (contactInfoContent) {
        contactInfoObject.familyName = contactInfoContent.familyName ? contactInfoContent.familyName : null;
        contactInfoObject.givenName = contactInfoContent.givenName ? contactInfoContent.givenName : null;
        contactInfoObject.fullName = contactInfoContent.fullName ? contactInfoContent.fullName : null;

        if (contactInfoContent.websites != null && contactInfoContent.websites.length > 0) {
            for (let website in contactInfoContent.websites) {
                contactInfoObject.websites.push(contactInfoContent.websites[website].url);
            }
        } else {
            contactInfoObject.websites.push(null);
        }
    }

    return contactInfoObject;

}

function parseOrgObject(orgObject, orgContent) {

    for (let org in orgContent) {
        orgObject.startDate.push(orgContent[org].startDate ? orgContent[org].startDate : null);
        orgObject.title.push(orgContent[org].title ? orgContent[org].title : null);
        orgObject.isPrimary.push(orgContent[org].isPrimary ? orgContent[org].isPrimary : null);
        orgObject.name.push(orgContent[org].name ? orgContent[org].name : null);
        orgObject.current.push(orgContent[org].current ? orgContent[org].current : null);
    }

    return orgObject;
}

function parseDemographicsObject(demoObject, demoContent, demographicsHeaders) {

    if (demoContent) {
        let locationDeduced = demoContent.locationDeduced;
        demoObject.locationGeneral = demoContent.locationGeneral ? demoContent.locationGeneral : null;
        demoObject.gender = demoContent.gender ? demoContent.gender : null;

        if (locationDeduced) {
            demoObject.normalizedLocation = locationDeduced.normalizedLocation ? locationDeduced.normalizedLocation : null;
            demoObject.deducedLocation = locationDeduced.deducedLocation ? locationDeduced.deducedLocation : null;
            demoObject.county = (locationDeduced.county && locationDeduced.county.name) ?
                locationDeduced.county.name : null;
            demoObject.isCountyDeduced = (locationDeduced.county && locationDeduced.county.deduced) ?
                locationDeduced.county.deduced : false;
            demoObject.continent = (locationDeduced.continent && locationDeduced.continent.name) ?
                locationDeduced.continent.name : null;
            demoObject.stateName = (locationDeduced.state && locationDeduced.state.name) ? locationDeduced.state.name : null;
            demoObject.stateCode = (locationDeduced.state && locationDeduced.state.code) ? locationDeduced.state.code : null;
            demoObject.isStateDeduced = (locationDeduced.state && locationDeduced.state.deduced) ?
                locationDeduced.state.deduced : false;
            demoObject.countryName = (locationDeduced.country && locationDeduced.country.name) ?
                locationDeduced.country.name : null;
            demoObject.countryCode = (locationDeduced.country && locationDeduced.country.code) ?
                locationDeduced.country.code : null;
            demoObject.isCountryDeduced = (locationDeduced.country && locationDeduced.country.deduced) ?
                locationDeduced.country.deduced : false;
            demoObject.city = (locationDeduced.city && locationDeduced.city.name) ? locationDeduced.city.name : null;
            demoObject.isCityDeduced = (locationDeduced.city && locationDeduced.city.deduced) ?
                locationDeduced.city.deduced : false;
            demoObject.likelihood = locationDeduced.likelihood ? locationDeduced.likelihood : null;
        }

        //Commas within strings mess with the CSV formatting, so surround those strings with quotes
        for (let header in demographicsHeaders) {
            let currentHeader = demographicsHeaders[header];
            demoObject[currentHeader] = checkAndWrapStringsWithCommasAndNewlines(demoObject[currentHeader]);
        }
    }

    return demoObject;
}

function parseSocialProfilesObject(socialProfilesObject, socialProfilesContent, socialProfilesColumnHeaders) {
    if (socialProfilesContent) {
        for (let profileIndex in socialProfilesContent) {
            let profile = socialProfilesContent[profileIndex];

            for (let i = 2; i < socialProfilesColumnHeaders.length; ++i) {
                let header = socialProfilesColumnHeaders[i];
                socialProfilesObject[header].push(profile[header] ? profile[header] : null);
            }
        }

        for (i = 0; i < socialProfilesObject.bio.length; ++i) {
            socialProfilesObject.bio[i] = checkAndWrapStringsWithCommasAndNewlines(socialProfilesObject.bio[i]);
        }
    }

    return socialProfilesObject;
}

function parseMetaData(metadataObject, metadataContent, metadataHeaders) {
    for (let headerIndex in metadataHeaders) {
        let header = metadataHeaders[headerIndex];

        metadataObject[header] = metadataContent[header] ? metadataContent[header] : null;
    }

    metadataObject.message = checkAndWrapStringsWithCommasAndNewlines(metadataObject.message);

    return metadataObject;
}

function parseDigitalFootprint(digitalFootprintObject, digitalFootprintContent, digitalFootprintHeaders) {

    if (digitalFootprintContent) {
        for (let index in digitalFootprintContent) {
            for (let headerIndex = 2; headerIndex < digitalFootprintHeaders.length; ++headerIndex) {
                let header = digitalFootprintHeaders[headerIndex];

                digitalFootprintObject[header].push(digitalFootprintContent[index][header] ? digitalFootprintContent[index][header] : null);
            }
        }
    }

    return digitalFootprintObject;
}

function initializeObject(objectHeaders) {
    let rval = {};

    for (let i = 0; i < objectHeaders.length; ++i) {
        rval[objectHeaders[i]] = [];
    }

    return rval;
}

function prependNewlineEmailAndRequestId(csvName, email, requestId, fs) {
    fs.appendFileSync(csvName, '\n');

    fs.appendFileSync(csvName, email + ',');

    fs.appendFileSync(csvName, requestId + ',');
}

function checkAndWrapStringsWithCommasAndNewlines(stringToCheck) {
    if (stringToCheck && typeof stringToCheck === 'string') {

        stringToCheck = replaceAll(stringToCheck, "\"", '“');

        if (stringToCheck.includes(',')) {
            stringToCheck = "\"" + stringToCheck + "\"";
        }

        stringToCheck = replaceAll(stringToCheck, '\n', ' ');
    }

    return stringToCheck;
}

function replaceAll(targetString, searchValue, replaceValue) {
    return targetString.replace(new RegExp(searchValue, 'g'), replaceValue);
}

function writeDigitalFootprint(overallDigitalFootprintFile, digitalFootprintHeaders, filename, email, requestId, fs) {
    for (let i = 0; i < overallDigitalFootprintFile.value.length; ++i) {
        prependNewlineEmailAndRequestId(filename, email, requestId, fs);

        for (let headerIndex = 2; headerIndex < digitalFootprintHeaders.length; ++headerIndex) {
            let header = digitalFootprintHeaders[headerIndex];

            fs.appendFileSync(filename, overallDigitalFootprintFile[header][i]);

            if (headerIndex + 1 < digitalFootprintHeaders.length) {
                fs.appendFileSync(filename, ',');
            }
        }
    }
}

modules.export = new CsvParser();