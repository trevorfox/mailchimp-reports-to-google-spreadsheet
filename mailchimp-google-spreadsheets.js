// campaigns list api endpoint docs: apidocs.mailchimp.com/api/2.0/campaigns/list.php
// reports api endpoint: apidocs.mailchimp.com/api/2.0/reports/summary.php
// GAS docs: developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetch(String,Object)
// mailchimp open tracking calculations: kb.mailchimp.com/article/about-open-tracking
  
// your api key can be found at: admin.mailchimp.com/account/api/
// standard "24 hour format in GMT, eg "2013-12-30 20:30:00" - if this is invalid the whole call fails"
// add formated values for start and end date like: var REPORT_START_DATE = "2013-12-30 20:30:00"

function chimpReport() {
  
  var API_KEY = 'yourapikeygoeshere';
  var REPORT_START_DATE;
  var REPORT_END_DATE;
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();  
  
  var api = 'https://us4.api.mailchimp.com/2.0';
  var campaignList = '/campaigns/list.json' 
  var reports = '/reports/summary.json' 
  
  // MC api-specific parameters
  var payload = {
    "apikey": API_KEY,
    "sendtime_start": REPORT_START_DATE,
    "sendtime_end": REPORT_END_DATE
  }; 
  
  // GAS specific parameters: 
  var params = {
    "method": "POST",
    "muteHttpExceptions": true,
    "payload": payload
  };
  
  var apiCall = function(endpoint,cid){
    if(cid){
      payload.cid = cid
    }
    var apiResponse = UrlFetchApp.fetch(api+endpoint, params);
    var json = JSON.parse(apiResponse);
    return json
    }
  
  var campaigns = apiCall(campaignList);
  var total = campaigns.total;
  var campaignData = campaigns.data;
  
  for (var i=0; i< campaignData.length; i++){
      
    var c = campaignData[i];
    var cid = c.id;
    var title = c.title;
    var subject = c.subject;
    var send_time = c.send_time;
    
    // send_time values are only present for campaigns that have been sent. otherwise set to null.
    // this if statement will only call for report data and write to the spreadsheet, data from sent campaigns.
    
    if (send_time){
      
      var r = apiCall(reports,cid);
      var emails_sent = r.emails_sent;
      var opens = r.opens;
      var unique_opens = r.unique_opens;
      var clicks = r.clicks;
      var unique_clicks = r.unique_clicks;
      var open_rate = (unique_opens / emails_sent).toFixed(4);
      var click_rate = (unique_clicks / emails_sent).toFixed(4);
      
      // the report array is how each row will appear on the spreadsheet
      var report = [send_time, subject, emails_sent, opens, unique_opens, clicks, unique_clicks, open_rate, click_rate];
      
      Logger.log(report);
      
      // note that this method will append to the bottom of the spread sheet wherever that is.
      // to overwrite a specific range use setValues()
      
      sheet.appendRow(report)
    }    
  }
}
