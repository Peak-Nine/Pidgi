# timers.current

> Source: https://developer.focus.teamleader.eu/docs/api/timers-current

  * [](/)
  * [API Reference](/docs/api)
  * Time Tracking
  * [Timers](/docs/api/timers)
  * timers.current



# timers.current
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/timers.current

Get the current running timer.

## Request​

## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**id** string

**Example:**`2b282dec-ba9d-4faa-9b39-944b99ee5c0a`

**user** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**work_type** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**started_at** string

**Example:**`2017-04-26T10:01:49+00:00`

**description** string

**Example:**`Timer description`

**subject** object

**id** string

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string

**Possible values:** [`company`, `contact`, `event`, `todo`, `milestone`, `ticket`]

**invoiceable** boolean

**Example:**`true`



    
    
    {  
      "data": {  
        "id": "2b282dec-ba9d-4faa-9b39-944b99ee5c0a",  
        "user": {  
          "type": "user",  
          "id": "5443a1b9-7673-4922-921f-1da4ff557783"  
        },  
        "work_type": {  
          "type": "workType",  
          "id": "d02de940-9435-4e35-bc0b-3d17f3d0ea7b"  
        },  
        "started_at": "2017-04-26T10:01:49+00:00",  
        "description": "Timer description",  
        "subject": {  
          "type": "milestone",  
          "id": "31931bc9-4ae8-4c50-ba8d-9ea88498c1c1"  
        },  
        "invoiceable": true  
      }  
    }  
    
    
    
    {  
      "data": {  
        "id": "2b282dec-ba9d-4faa-9b39-944b99ee5c0a",  
        "user": {  
          "type": "user",  
          "id": "5443a1b9-7673-4922-921f-1da4ff557783"  
        },  
        "work_type": {  
          "type": "workType",  
          "id": "d02de940-9435-4e35-bc0b-3d17f3d0ea7b"  
        },  
        "started_at": "2017-04-26T10:01:49+00:00",  
        "description": "Timer description",  
        "subject": {  
          "type": "milestone",  
          "id": "31931bc9-4ae8-4c50-ba8d-9ea88498c1c1"  
        },  
        "invoiceable": true  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/timers.current");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var response = await client.SendAsync(request);  
    response.EnsureSuccessStatusCode();  
    Console.WriteLine(await response.Content.ReadAsStringAsync());  
    

Request Collapse all

Base URL

Edit

https://api.focus.teamleader.eu

Auth

Bearer Token

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
