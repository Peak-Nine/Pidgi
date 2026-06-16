# timeTracking.update

> Source: https://developer.focus.teamleader.eu/docs/api/time-tracking-update

  * [](/)
  * [API Reference](/docs/api)
  * Time Tracking
  * [Time Tracking](/docs/api/time-tracking)
  * timeTracking.update



# timeTracking.update
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/timeTracking.update

Update tracked time.

## Request​

  * application/json



### Body**required**

oneOf

    * Update with started_at
    * Update with started_on

**started_at** date-timerequired

**Example:**`2017-04-26T10:01:49+00:00`

**started_on** daterequired

Only available if duration time tracking is enabled.

**Example:**`2017-04-26`

**id** stringrequired

**Example:**`66621f54-3d0d-420f-8d4b-ddd7fc473bf2`

**work_type_id** stringnullable

**Example:**`a12f4289-3580-4780-bb6d-b4e9f84f80ad`

**duration** integerrequired

In seconds

**Example:**`3600`

**description** stringnullable

**subject** objectnullable

**id** stringrequired

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** stringrequired

**Possible values:** [`company`, `contact`, `event`, `todo`, `milestone`, `ticket`]

**invoiceable** boolean

**Example:**`true`




## Responses​

  * 204



**Response Headers**




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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/timeTracking.update");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"66621f54-3d0d-420f-8d4b-ddd7fc473bf2\",\n  \"work_type_id\": \"a12f4289-3580-4780-bb6d-b4e9f84f80ad\",\n  \"duration\": 3600,\n  \"description\": \"string\",\n  \"subject\": {\n    \"id\": \"eab232c6-49b2-4b7e-a977-5e1148dad471\",\n    \"type\": \"company\"\n  },\n  \"invoiceable\": true,\n  \"started_at\": \"2017-04-26T10:01:49+00:00\"\n}", null, "application/json");  
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
      "id": "66621f54-3d0d-420f-8d4b-ddd7fc473bf2",
      "work_type_id": "a12f4289-3580-4780-bb6d-b4e9f84f80ad",
      "duration": 3600,
      "description": "string",
      "subject": {
        "id": "eab232c6-49b2-4b7e-a977-5e1148dad471",
        "type": "company"
      },
      "invoiceable": true,
      "started_at": "2017-04-26T10:01:49+00:00"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
