# migrate.activityType

> Source: https://developer.focus.teamleader.eu/docs/api/migrate-activity-type

  * [](/)
  * [API Reference](/docs/api)
  * Other
  * [Migrating](/docs/api/migrating)
  * migrate.activityType



# migrate.activityType
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/migrate.activityType

Translates `meeting`, `call` and `task` into their respective activity type UUID.

## Request​

  * application/json



### Body**required**

**type** string

**Possible values:** [`meeting`, `call`, `task`]

**Example:**`meeting`




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

**Example:**`eab232c6-49b2-4b7e-a977-5e1148dad471`

**type** string



    
    
    {  
      "data": {  
        "type": "activityType",  
        "id": "28f3639d-9b64-44a8-974d-a4df645af6a5"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "activityType",  
        "id": "28f3639d-9b64-44a8-974d-a4df645af6a5"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/migrate.activityType");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"type\": \"meeting\"\n}", null, "application/json");  
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

  * Example (from schema)
  * Example


    
    
    {
      "type": "meeting"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
