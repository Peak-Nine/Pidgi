# dealPipelines.duplicate

> Source: https://developer.focus.teamleader.eu/docs/api/deal-pipelines-duplicate

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deal Pipelines](/docs/api/deal-pipelines)
  * dealPipelines.duplicate



# dealPipelines.duplicate
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dealPipelines.duplicate

Create a new deal pipeline by duplicating an existing one.

## Request​

  * application/json



### Body**required**

**id** stringrequired

Id from source pipeline

**Example:**`f350e48a-fbc3-0a79-e62a-53aa1ae86d44`




## Responses​

  * 201



**Response Headers**




  * application/json



  * Schema
  * Example (auto)
  * Example



**Schema**

**data** object

**type** string

**Example:**`closingDay`

**id** stringrequired

**Example:**`eb264fd0-0e5c-0dbf-ae1e-49e7d6a8e6b8`



    
    
    {  
      "data": {  
        "type": "dealPipeline",  
        "id": "5876126e-11c2-4731-b9e3-6e2fecd01d80"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "dealPipeline",  
        "id": "5876126e-11c2-4731-b9e3-6e2fecd01d80"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dealPipelines.duplicate");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"f350e48a-fbc3-0a79-e62a-53aa1ae86d44\"\n}", null, "application/json");  
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
      "id": "f350e48a-fbc3-0a79-e62a-53aa1ae86d44"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
