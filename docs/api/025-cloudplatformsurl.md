# cloudPlatforms.url

> Source: https://developer.focus.teamleader.eu/docs/api/cloud-platforms-url

  * [](/)
  * [API Reference](/docs/api)
  * Other
  * [Cloud Platforms](/docs/api/cloud-platforms)
  * cloudPlatforms.url



# cloudPlatforms.url
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/cloudPlatforms.url

Fetch cloudPlatform url for type and id.

## Request​

  * application/json



### Body**required**

**type** stringrequired

**Possible values:** [`invoice`, `quotation`, `ticket`]

**id** stringrequired

**Example:**`b7023c11-455e-4fa5-bb96-87f37dbc7d07`




## Responses​

  * 200



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**url** string

**Example:**`https://teamleader.cloud/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.yUmR5yNZ45P_jHDbjAzuk4kRA8YNoM9ckSZOZpMIJmU/`



    
    
    {  
      "data": {  
        "url": "https://teamleader.cloud/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.yUmR5yNZ45P_jHDbjAzuk4kRA8YNoM9ckSZOZpMIJmU/"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "url": "https://teamleader.cloud/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.yUmR5yNZ45P_jHDbjAzuk4kRA8YNoM9ckSZOZpMIJmU/"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/cloudPlatforms.url");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"type\": \"invoice\",\n  \"id\": \"b7023c11-455e-4fa5-bb96-87f37dbc7d07\"\n}", null, "application/json");  
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
      "type": "invoice",
      "id": "b7023c11-455e-4fa5-bb96-87f37dbc7d07"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
