// [START apps_script_youtube_slides]
/**
 * Creates a slide presentation with 10 videos from the YouTube search `YOUTUBE_QUERY`.
 * The YouTube Advanced Service must be enabled before using this sample.
 */
var PRESENTATION_TITLE = 'Vertin Go Website';
var YOUTUBE_QUERY = 'Vertin Go Website';

/**
 * Gets a list of YouTube videos.
 * @param {String} query - The query term to search for.
 * @return {object[]} A list of objects with YouTube video data.
 * @ref https://developers.google.com/youtube/v3/docs/search/list
 */
function getYouTubeVideosJSON(query) {
  var youTubeResults = YouTube.Search.list('id,snippet', {
    q: query,
    type: 'video',
    maxResults: 10
  });

  return youTubeResults.items.map(function(item) {
    return {
      url: 'https://youtu.be/' + item.id.videoId,
      title: item.snippet.title,
      thumbnailUrl: item.snippet.thumbnails.high.url
    };
  });
}

/**
 * Creates a presentation where each slide features a YouTube video.
 * Logs out the URL of the presentation.
 */
function createSlides() {
  var youTubeVideos = getYouTubeVideosJSON(YOUTUBE_QUERY);
  var presentation = SlidesApp.create(PRESENTATION_TITLE);
  presentation.getSlides()[0].getPageElements()[0].asShape()
      .getText().setText(PRESENTATION_TITLE);

  // Add slides with videos and log the presentation URL to the user.
  youTubeVideos.forEach(function(video) {
    var slide = presentation.appendSlide();
    slide.insertVideo(video.url,
      0, 0, presentation.getPageWidth(), presentation.getPageHeight());
  });
  Logger.log(presentation.getUrl());
}
// [END apps_script_youtube_slides]



// [START apps_script_youtube_subscription]
/**
 * This sample subscribes the user to the Google Developers channel on YouTube.
 */
function addSubscription() {
  // Replace this channel ID with the channel ID you want to subscribe to
  var channelId = 'UC2g_-ipVjit6ZlACPWG4JvA';
  var resource = {
    snippet: {
      resourceId: {
        kind: 'youtube#channel',
        channelId: channelId
      }
    }
  };

  try {
    var response = YouTube.Subscriptions.insert(resource, 'snippet');
    Logger.log(response);
  } catch (e) {
    if (e.message.match('subscriptionDuplicate')) {
      Logger.log('Cannot subscribe; already subscribed to channel: ' +
          channelId);
    } else {
      Logger.log('Error adding subscription: ' + e.message);
    }
  }
}
// [END apps_script_youtube_subscription]



// [START apps_script_analytics_accounts]
/**
 * Lists Analytics accounts.
 */
function listAccounts() {
  var accounts = Analytics.Management.Accounts.list();
  if (accounts.items && accounts.items.length) {
    for (var i = 0; i < accounts.items.length; i++) {
      var account = accounts.items[i];
      Logger.log('Account: name "%s", id "%s".', account.name, account.id);

      // List web properties in the account.
      listWebProperties(account.id);
    }
  } else {
    Logger.log('No accounts found.');
  }
}

/**
 * Lists web properites for an Analytics account.
 * @param  {string} accountId The account ID.
 */
function listWebProperties(accountId) {
  var webProperties = Analytics.Management.Webproperties.list(accountId);
  if (webProperties.items && webProperties.items.length) {
    for (var i = 0; i < webProperties.items.length; i++) {
      var webProperty = webProperties.items[i];
      Logger.log('\tWeb Property: name "%s", id "%s".', webProperty.name,
          webProperty.id);

      // List profiles in the web property.
      listProfiles(accountId, webProperty.id);
      }
  } else {
    Logger.log('\tNo web properties found.');
  }
}

/**
 * Logs a list of Analytics accounts profiles.
 * @param  {string} accountId     The Analytics account ID
 * @param  {string} webPropertyId The web property ID
 */
function listProfiles(accountId, webPropertyId) {
  // Note: If you experience "Quota Error: User Rate Limit Exceeded" errors
  // due to the number of accounts or profiles you have, you may be able to
  // avoid it by adding a Utilities.sleep(1000) statement here.

  var profiles = Analytics.Management.Profiles.list(accountId,
      webPropertyId);
  if (profiles.items && profiles.items.length) {
    for (var i = 0; i < profiles.items.length; i++) {
      var profile = profiles.items[i];
      Logger.log('\t\tProfile: name "%s", id "%s".', profile.name,
          profile.id);
    }
  } else {
    Logger.log('\t\tNo web properties found.');
  }
}
// [END apps_script_analytics_accounts]

// [START apps_script_analytics_reports]
/**
 * Runs a report of an Analytics profile ID. Creates a sheet with the report.
 * @param  {string} profileId The profile ID.
 */
function runReport(profileId) {
  var today = new Date();
  var oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  var startDate = Utilities.formatDate(oneWeekAgo, Session.getScriptTimeZone(),
      'yyyy-MM-dd');
  var endDate = Utilities.formatDate(today, Session.getScriptTimeZone(),
      'yyyy-MM-dd');

  var tableId = 'ga:' + '187573181';
  var metric = 'ga:visits';
  var options = {
    'dimensions': 'ga:source,ga:keyword',
    'sort': '-ga:visits,ga:source',
    'filters': 'ga:medium==organic',
    'max-results': 25
  };
  var report = Analytics.Data.Ga.get(tableId, startDate, endDate, metric,options);

  if (report.rows) {
    var spreadsheet = SpreadsheetApp.create('Google Analytics Report');
    var sheet = spreadsheet.getActiveSheet();

    // Append the headers.
    var headers = report.columnHeaders.map(function(columnHeader) {
      return columnHeader.name;
    });
    sheet.appendRow(headers);

    // Append the results.
    sheet.getRange(2, 1, report.rows.length, headers.length)
        .setValues(report.rows);

    Logger.log('Report spreadsheet created: %s',
        spreadsheet.getUrl());
  } else {
    Logger.log('No rows returned.');
  }
}
// [END apps_script_analytics_reports]



// [START apps_script_bigquery_run_query]
/**
 * Runs a BigQuery query and logs the results in a spreadsheet.
 */
function runQuery() {
  // Replace this value with the project ID listed in the Google
  // Cloud Platform project.
  var projectId = 'project-id-7881654880450816347';

  var request = {
    query: 'SELECT TOP(word, 300) AS word, COUNT(*) AS word_count ' +
      'FROM publicdata:samples.shakespeare WHERE LENGTH(word) > 10;'
  };
  var queryResults = BigQuery.Jobs.query(request, projectId);
  var jobId = queryResults.jobReference.jobId;

  // Check on status of the Query Job.
  var sleepTimeMs = 500;
  while (!queryResults.jobComplete) {
    Utilities.sleep(sleepTimeMs);
    sleepTimeMs *= 2;
    queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId);
  }

  // Get all the rows of results.
  var rows = queryResults.rows;
  while (queryResults.pageToken) {
    queryResults = BigQuery.Jobs.getQueryResults(projectId, jobId, {
      pageToken: queryResults.pageToken
    });
    rows = rows.concat(queryResults.rows);
  }

  if (rows) {
    var spreadsheet = SpreadsheetApp.create('BiqQuery Results');
    var sheet = spreadsheet.getActiveSheet();

    // Append the headers.
    var headers = queryResults.schema.fields.map(function(field) {
      return field.name;
    });
    sheet.appendRow(headers);

    // Append the results.
    var data = new Array(rows.length);
    for (var i = 0; i < rows.length; i++) {
      var cols = rows[i].f;
      data[i] = new Array(cols.length);
      for (var j = 0; j < cols.length; j++) {
        data[i][j] = cols[j].v;
      }
    }
    sheet.getRange(2, 1, rows.length, headers.length).setValues(data);

    Logger.log('Results spreadsheet created: %s',
        spreadsheet.getUrl());
  } else {
    Logger.log('No rows returned.');
  }
}
// [END apps_script_bigquery_run_query]

// [START apps_script_bigquery_load_csv]
/**
 * Loads a CSV into BigQuery
 */
function loadCsv() {
  // Replace this value with the project ID listed in the Google
  // Cloud Platform project.
  var projectId = 'project-id-7881654880450816347';
  // Create a dataset in the BigQuery UI (https://bigquery.cloud.google.com)
  // and enter its ID below.
  var datasetId = 'YYYYYYYY';
  // Sample CSV file of Google Trends data conforming to the schema below.
  // https://docs.google.com/file/d/0BwzA1Orbvy5WMXFLaTR1Z1p2UDg/edit
  var csvFileId = '0BwzA1Orbvy5WMXFLaTR1Z1p2UDg';

  // Create the table.
  var tableId = 'pets_' + new Date().getTime();
  var table = {
    tableReference: {
      projectId: projectId,
      datasetId: datasetId,
      tableId: tableId
    },
    schema: {
      fields: [
        {name: 'week', type: 'STRING'},
        {name: 'cat', type: 'INTEGER'},
        {name: 'dog', type: 'INTEGER'},
        {name: 'bird', type: 'INTEGER'}
      ]
    }
  };
  table = BigQuery.Tables.insert(table, projectId, datasetId);
  Logger.log('Table created: %s', table.id);

  // Load CSV data from Drive and convert to the correct format for upload.
  var file = DriveApp.getFileById(csvFileId);
  var data = file.getBlob().setContentType('application/octet-stream');

  // Create the data upload job.
  var job = {
    configuration: {
      load: {
        destinationTable: {
          projectId: projectId,
          datasetId: datasetId,
          tableId: tableId
        },
        skipLeadingRows: 1
      }
    }
  };
  job = BigQuery.Jobs.insert(job, projectId, data);
  Logger.log('Load job started. Check on the status of it here: ' +
      'https://bigquery.cloud.google.com/jobs/%s', projectId);
}
// [END apps_script_bigquery_load_csv]


// [START apps_script_prediction_query_hosted_model]
/**
 * Runs sentiment analysis across a sentence.
 * Prints the sentiment label.
 */
function queryHostedModel() {
  // When querying hosted models you must always use this
  // specific project number.
  var projectNumber = '275731011174';
  var hostedModelName = 'YouTube-SpreadSheet';

  // Query the hosted model with a positive statement.
  var predictionString = 'Want to go to the park this weekend?';
  var prediction = Prediction.Hostedmodels.predict(
      {
        input: {
          csvInstance: [predictionString]
        }
      },
      projectNumber,
      hostedModelName);
  // Logs Sentiment: positive.
  Logger.log('Sentiment: ' + prediction.outputLabel);

  // Now query the hosted model with a negative statement.
  predictionString = 'You are not very nice!';
  prediction = Prediction.Hostedmodels.predict(
      {
        input: {
          csvInstance: [predictionString]
        }
      },
      projectNumber,
      hostedModelName);
  // Logs Sentiment: negative.
  Logger.log('Sentiment: ' + prediction.outputLabel);
}
// [END apps_script_prediction_query_hosted_model]

// [START apps_script_prediction_create_new_model]
/**
 * Creates a new prediction model.
 */
function createNewModel() {
  // Replace this value with the project number listed in the Google
  // APIs Console project.
  var projectNumber = 'XXXXXXXX';
  var id = 'mylanguageidmodel';
  var storageDataLocation = 'languageidsample/language_id.txt';

  // Returns immediately. Training happens asynchronously.
  var result = Prediction.Trainedmodels.insert(
      {
        id: id,
        storageDataLocation: storageDataLocation
      },
      projectNumber);
  Logger.log(result);
}
// [END apps_script_prediction_create_new_model]

// [START apps_script_prediction_query_training_status]
/**
 * Gets the training status from a prediction model.
 * Logs the status.
 */
function queryTrainingStatus() {
  // Replace this value with the project number listed in the Google
  // APIs Console project.
  var projectNumber = 'XXXXXXXX';
  var id = 'mylanguageidmodel';

  var result = Prediction.Trainedmodels.get(projectNumber, id);
  Logger.log(result.trainingStatus);
}
// [END apps_script_prediction_query_training_status]

// [START apps_script_prediction_query_trailed_model]
/**
 * Gets the language from a trained language model.
 * Logs the language of the sentence.
 */
function queryTrainedModel() {
  // Replace this value with the project number listed in the Google
  // APIs Console project.
  var projectNumber = 'XXXXXXXX';
  var id = 'mylanguageidmodel';
  var query = 'Este es un mensaje de prueba de ejemplo';

  var prediction = Prediction.Trainedmodels.predict(
      {
        input:
          {
            csvInstance: [query]
          }
      },
      projectNumber,
      id);
  // Logs Language: Spanish.
  Logger.log('Language: ' + prediction.outputLabel);
}
// [END apps_script_prediction_query_trailed_model]

/**
 * Title: Search by keyword
 * Method: youtube.search.list
 * This function searches for videos related to the keyword 'dogs'. The video IDs and titles
 * of the search results are logged to Apps Script's log.
 *
 * Note that this sample limits the results to 25. To return more results, pass
 * additional parameters as documented here:
 *   https://developers.google.com/youtube/v3/docs/search/list
 */
function searchByKeyword() {
  var results = YouTube.Search.list('id,snippet', {q: 'dogs', maxResults: 25});

  for(var i in results.items) {
    var item = results.items[i];
    Logger.log('[%s] Title: %s', item.id.videoId, item.snippet.title);
  }
}


/**
 * Title: Retrieve my uploads
 * Method: youtube.channels.list
 * This function retrieves the current script user's uploaded videos. To execute,
 * it requires the OAuth read/write scope for YouTube as well as user authorization.
 * In Apps Script's runtime environment, the first time a user runs a script, Apps
 * Script will prompt the user for permission to access the services called by the
 * script. After permissions are granted, they are cached for some periodF of time.
 * The user running the script will be prompted for permission again once the
 * permissions required change, or when they are invalidated by the
 * ScriptApp.invalidateAuth() function.
 *
 * This script takes the following steps to retrieve the active user's uploaded videos:
 *    1. Fetches the user's channels
 *    2. Fetches the user's 'uploads' playlist
 *    3. Iterates through this playlist and logs the video IDs and titles
 *    4. Fetches a next page token (if any). If there is one, fetches the next page. GOTO Step 3
 */
function retrieveMyUploads() {
  var results = YouTube.Channels.list('contentDetails', {mine: true});

  for(var i in results.items) {
    var item = results.items[i];
    // Get the playlist ID, which is nested in contentDetails, as described in the
    // Channel resource: https://developers.google.com/youtube/v3/docs/channels
    var playlistId = item.contentDetails.relatedPlaylists.uploads;

    var nextPageToken = '';

    // This loop retrieves a set of playlist items and checks the nextPageToken in the
    // response to determine whether the list contains additional items. It repeats that process
    // until it has retrieved all of the items in the list.
    while (nextPageToken != null) {
      var playlistResponse = YouTube.PlaylistItems.list('snippet', {
        playlistId: playlistId,
        maxResults: 25,
        pageToken: nextPageToken
      });

      for (var j = 0; j < playlistResponse.items.length; j++) {
        var playlistItem = playlistResponse.items[j];
        Logger.log('[%s] Title: %s',
                   playlistItem.snippet.resourceId.videoId,
                   playlistItem.snippet.title);

      }
      nextPageToken = playlistResponse.nextPageToken;
    }
  }
}

/**
 * Title: Update video
 * Method: youtube.videos.update
 * This sample finds the active user's uploads, then updates the most recent
 * upload's description by appending a string.
 */
function updateVideo() {
  // 1. Fetch all the channels owned by active user
  var myChannels = YouTube.Channels.list('contentDetails', {mine: true});

  // 2. Iterate through the channels and get the uploads playlist ID
  for (var i = 0; i < myChannels.items.length; i++) {
    var item = myChannels.items[i];
    var uploadsPlaylistId = item.contentDetails.relatedPlaylists.uploads;

    var playlistResponse = YouTube.PlaylistItems.list('snippet', {
      playlistId: uploadsPlaylistId,
      maxResults: 1
    });

    // Get the videoID of the first video in the list
    var video = playlistResponse.items[0];
    var originalDescription = video.snippet.description;
    var updatedDescription = originalDescription + ' Description updated via Google Apps Script';

    video.snippet.description = updatedDescription;

    var resource = {
      snippet: {
        title: video.snippet.title,
        description: updatedDescription,
        categoryId: '22'
      },
      id: video.snippet.resourceId.videoId
    };
    YouTube.Videos.update(resource, 'id,snippet');
  }
}



/**
 * Title: Post channel bulletin
 * Method: youtube.activities.insert
 * This function creates and posts a new channel bulletin, adding a video and message. Note that this
 * will also accept a playlist ID. After completing the API call, logs the output to the log.
 */
function postChannelBulletin() {
  var message = 'Thanks for subscribing to my channel!  This posting is from Google Apps Script';
  var videoId = 'qZRsVqOIWms';

  var resource = {
    snippet: {
      description: message
    },
    contentDetails: {
      bulletin: {
        resourceId: {
          kind: 'youtube#video',
          videoId: videoId
        }
      }
    }
  };

  var response = YouTube.Activities.insert(resource, 'snippet,contentDetails');
  Logger.log(response);
}

/**
 * Title: Export YouTube Analytics data to Google Sheets
 * Method: youtubeAnalytics.reports.query
 * This function uses the YouTube Analytics API to fetch data about the
 * authenticated user's channel, creating a new Google Sheet in the user's Drive
 * with the data.
 *
 * The first part of this sample demonstrates a simple YouTube Analytics API
 * call. This function first fetches the active user's channel ID. Using that
 * ID, the function makes a YouTube Analytics API call to retrieve views,
 * likes, dislikes and shares for the last 30 days. The API returns the data
 * in a response object that contains a 2D array.
 *
 * The second part of the sample constructs a Spreadsheet. This spreadsheet
 * is placed in the authenticated user's Google Drive with the name
 * 'YouTube Report' and date range in the title. The function populates the
 * spreadsheet with the API response, then locks columns and rows that will
 * define a chart axes. A stacked column chart is added for the spreadsheet.
 */
function spreadsheetAnalytics() {
  // Get the channel ID
  var myChannels = YouTube.Channels.list('id', {mine: true});
  Logger.log("Hello, " + myChannels);
  var channel = myChannels.items[0];
  var channelId = channel.id;
  
  Logger.log("Hello, " + channelId);

  // Set the dates for our report
  var today = new Date();
  var oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  var todayFormatted = Utilities.formatDate(today, 'UTC', 'yyyy-MM-dd')
  var oneMonthAgoFormatted = Utilities.formatDate(oneMonthAgo, 'UTC', 'yyyy-MM-dd');

  // The YouTubeAnalytics.Reports.query() function has four required parameters and one optional
  // parameter. The first parameter identifies the channel or content owner for which you are
  // retrieving data. The second and third parameters specify the start and end dates for the
  // report, respectively. The fourth parameter identifies the metrics that you are retrieving.
  // The fifth parameter is an object that contains any additional optional parameters
  // (dimensions, filters, sort, etc.) that you want to set.
  var analyticsResponse = YouTubeAnalytics.Reports.query(
    'channel==' + channelId,
    oneMonthAgoFormatted,
    todayFormatted,
    'views,likes,dislikes,shares',
    {
      dimensions: 'day',
      sort: '-day'
    });

  // Create a new Spreadsheet with rows and columns corresponding to our dates
  var ssName = 'YouTube channel report ' + oneMonthAgoFormatted + ' - ' + todayFormatted;
  var numRows = analyticsResponse.rows.length;
  var numCols = analyticsResponse.columnHeaders.length;

  // Add an extra row for column headers
  var ssNew = SpreadsheetApp.create(ssName, numRows + 1, numCols);

  // Get the first sheet
  var sheet = ssNew.getSheets()[0];

  // Get the range for the title columns
  // Remember, spreadsheets are 1-indexed, whereas arrays are 0-indexed
  var headersRange = sheet.getRange(1, 1, 1, numCols);
  var headers = [];

  // These column headers will correspond with the metrics requested
  // in the initial call: views, likes, dislikes, shares
  for(var i in analyticsResponse.columnHeaders) {
    var columnHeader = analyticsResponse.columnHeaders[i];
    var columnName = columnHeader.name;
    headers[i] = columnName;
  }
  // This takes a 2 dimensional array
  headersRange.setValues([headers]);

  // Bold and freeze the column names
  headersRange.setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Get the data range and set the values
  var dataRange = sheet.getRange(2, 1, numRows, numCols);
  dataRange.setValues(analyticsResponse.rows);

  // Bold and freeze the dates
  var dateHeaders = sheet.getRange(1, 1, numRows, 1);
  dateHeaders.setFontWeight('bold');
  sheet.setFrozenColumns(1);

  // Include the headers in our range. The headers are used
  // to label the axes
  var range = sheet.getRange(1, 1, numRows, numCols);
  var chart = sheet.newChart()
                   .asColumnChart()
                   .setStacked()
                   .addRange(range)
                   .setPosition(4, 2, 10, 10)
                   .build();
  sheet.insertChart(chart);

}


 // [START apps_script_youtube_report]
/**
 * Creates a spreadsheet containing daily view counts, watch-time metrics,
 * and new-subscriber counts for a channel's videos.
 */
function createReport() {
  // Retrieve info about the user's YouTube channel.
  var channels = YouTube.Channels.list('id,contentDetails', {
    mine: true
  });
  var channelId = channels.items[0].id;

  // Retrieve analytics report for the channel.
  var oneMonthInMillis = 1000 * 60 * 60 * 24 * 30;
  var today = new Date();
  var lastMonth = new Date(today.getTime() - oneMonthInMillis);

  var metrics = [
    'views',
    'estimatedMinutesWatched',
    'averageViewDuration',
    'averageViewPercentage',
    'subscribersGained'
  ];
  var options = {
    dimensions: 'day',
    sort: 'day'
  };
  var result = YouTubeAnalytics.Reports.query('channel==' + channelId,formatDateString(lastMonth),formatDateString(today),metrics.join(','),options);

  if (result.rows) {
    var spreadsheet = SpreadsheetApp.create('YouTube Analytics Report');
    var sheet = spreadsheet.getActiveSheet();

    // Append the headers.
    var headers = result.columnHeaders.map(function(columnHeader) {
      return formatColumnName(columnHeader.name);
    });
    sheet.appendRow(headers);

    // Append the results.
    sheet.getRange(2, 1, result.rows.length, headers.length)
        .setValues(result.rows);

    Logger.log('Report spreadsheet created: %s',
        spreadsheet.getUrl());
  } else {
    Logger.log('No rows returned.');
  }
}

/**
 * Converts a Date object into a YYYY-MM-DD string.
 * @param {Date} date The date to convert to a string.
 * @return {string} The formatted date.
 */
function formatDateString(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/**
 * Formats a column name into a more human-friendly name.
 * @param {string} columnName The unprocessed name of the column.
 * @return {string} The formatted column name.
 * @example "averageViewPercentage" becomes "Average View Percentage".
 */
function formatColumnName(columnName) {
  var name = columnName.replace(/([a-z])([A-Z])/g, '$1 $2');
  name = name.slice(0, 1).toUpperCase() + name.slice(1);
  return name;
}
// [END apps_script_youtube_report]

