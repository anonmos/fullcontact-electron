# [FullContact](https://www.fullcontact.com) API Client
A way to query FullContact's Person API in a batched, sane way.

## Developers -- Getting Started
1. Ensure that [nodejs](https://nodejs.org) and [npm](https://www.npmjs.com/) are installed.  If developing on a Mac, 
I recommend using [Homebrew](http://brew.sh/) to install these dependencies.
2. Run `npm install` to install the nodejs dependencies
3. Run `npm start` to run the app

This should make the client run.  To develop further, you'll need a FullContact API key.  This can be obtained from their developer portal.

Additionally, you'll need some sample e-mails.  This client was built to take a simple CSV file as an input with all e-mails separated
either by column or by row (consistently, whichever path is chosen).

## Developers -- Distributing
1. Run `npm run build-mac`
2. Visit the `bin/macOS/fullcontact-electron-darwin-x64` directory and find `fullcontact-electron.app`.  This can be distributed to
other users as a complete package.
3. Place `fullcontact-electron.app` in the `Applications` directory of the target Mac
4. You should now be able to run the app normally on that Mac.

_Note:_ There are several caviats here:
1. These instructions are for building for macOS on a Mac.  You may have to figure out how to build on your target machine
  on your own. To do so, I recommend using [electron-packager](https://github.com/electron-userland/electron-packager)
2. The binary for `electron-packager` may need to be installed globally in order to run `step 1` above.  To do this, run `npm install -g electron-packager`

## Developers -- Contributing
There are several areas that are desparate for contributions here.  This was a very quick and dirty app, so pull requests
are certainly welcome.

The two major files that matter are:
* `js/csv_parser.js`
* `js/io.js`

`io.js` is responsible for handling all I/O operations, including web requests, button clicks, and output to the web view.

`csv_parser.js` handles all parsing of the FullContact People API.  It outputs 8 different CSV files that can be linked via the requestId column
of each file.

### Ideas for Contribution
1. UX/UI -- There is zero user feedback when a request is made or an error happens.  Even a simple modal implementation will go a long way.
Also, admittedly, it's not a very pretty app.  Some design TLC would go a long way.
2. Error Handling -- There is no solid error handling with the app.  It simply just doesn't respond and throws an error in the JS console.
It would be nice to give this feedback back to the user.
3. Automated Tests/CI -- There are currently no tests for this app.  This would be handy for anyone that wants to make sure the app
always works (especially for the csv_parser module, which gets a little hairy).
4. Request Rate Limiting -- FullContact's Batch API only allows for 20 requests to be made at a time.  This app splits the input CSV
into sub-batches of 20 and requests each batch of 20 all at once.  FullContact's simultaneous request limit is 600/min.  A high enough
number of e-mails will blow the top off of that limit, so a client side limit would be very nice.
5. Documentation -- This file is the entirety of the documentation that exists, along with what the actual client steps state.
Additional documentation may be helpful.
6.  Additional FullContact API Client Implementations -- This client could be used for a whole host of different requests.
Being able to use it as a multi-tool would be wonderful.
7.  Bugfixes -- I haven't found any bugs yet, but I know they're lurking.  If you see it, fix it!