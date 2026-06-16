# timeTracking.add

> Source: https://developer.focus.teamleader.eu/docs/api/time-tracking-add

  * [](/)
  * [API Reference](/docs/api)
  * Time Tracking
  * [Time Tracking](/docs/api/time-tracking)
  * timeTracking.add



# timeTracking.add
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/timeTracking.add

Add tracked time.

## Request​

  * application/json



### Body**required**

Note that the time tracking entry will be split up if the time span passes midnight.

oneOf

    * With started_at & duration
    * With end date
    * With started_on & duration

**started_at** date-timerequired

**Example:**`2017-04-26T10:01:49+00:00`

**duration** numberrequired

**Example:**`3600`

**started_at** date-timerequired

**Example:**`2017-04-26T10:01:49+00:00`

**ended_at** date-timerequired

**Example:**`2017-04-26T16:02:00+00:00`

**started_on** daterequired

Only available if duration time tracking is enabled.

**Example:**`2017-04-26`

**duration** numberrequired

**Example:**`3600`

**work_type_id** string

**Example:**`2175597d-484e-4a1c-a781-cbc3d9f893ba`

**description** string

**subject** object

**id** stringrequired

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** stringrequired

**Possible values:** [`company`, `contact`, `event`, `milestone`, `nextgenTask`, `ticket`, `todo`]

**invoiceable** boolean

**Example:**`true`

**user_id** string

To add tracked time for a different user.

**Example:**`87982c96-f2fe-4b05-838c-ff42c0525758`




## Responses​

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",  
        "type": "string"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "timetracking",  
        "id": "6f052357-142e-499e-a647-36b55ecf447c"  
      }  
    }  
    

#### Authorization: http
    
    
    **name:** [httpBearer](/docs/api/teamleader-api#authentication)**type:** http**scheme:** bearer

  * csharp
  * curl
  * dart
  * go
  * http
  * java
  * javascript
  * kotlin
  * c
  * nodejs
  * objective-c
  * ocaml
  * php
  * powershell
  * python
  * r
  * ruby
  * rust
  * shell
  * swift



  * HTTPCLIENT
  * RESTSHARP


    
    
    var client = new HttpClient();  
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/timeTracking.add");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"work_type_id\": \"2175597d-484e-4a1c-a781-cbc3d9f893ba\",\n  \"description\": \"string\",\n  \"subject\": {\n    \"id\": \"eab232c6-49b2-4b7e-a977-5e1148dad471\",\n    \"type\": \"company\"\n  },\n  \"invoiceable\": true,\n  \"user_id\": \"87982c96-f2fe-4b05-838c-ff42c0525758\",\n  \"started_at\": \"2017-04-26T10:01:49+00:00\",\n  \"duration\": 3600\n}", null, "application/json");  
    request.Content = content;  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Body required
    
    
    {
      "work_type_id": "2175597d-484e-4a1c-a781-cbc3d9f893ba",
      "description": "string",
      "subject": {
        "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",
        "type": "company"
      },
      "invoiceable": true,
      "user_id": "87982c96-f2fe-4b05-838c-ff42c0525758",
      "started_at": "2017-04-26T10:01:49+00:00",
      "duration": 3600
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
