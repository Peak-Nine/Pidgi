# dealPipelines.create

> Source: https://developer.focus.teamleader.eu/docs/api/deal-pipelines-create

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deal Pipelines](/docs/api/deal-pipelines)
  * dealPipelines.create



# dealPipelines.create
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dealPipelines.create

Create a new deal pipeline.

## Request​

  * application/json



### Body**required**

**name** stringrequired

**Example:**`Primary Pipeline`




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
        "type": "dealPipeline",  
        "id": "f350e48a-fbc3-0a79-e62a-53aa1ae86d44"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "dealPipeline",  
        "id": "f350e48a-fbc3-0a79-e62a-53aa1ae86d44"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dealPipelines.create");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"name\": \"Primary Pipeline\"\n}", null, "application/json");  
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
      "name": "Primary Pipeline"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
