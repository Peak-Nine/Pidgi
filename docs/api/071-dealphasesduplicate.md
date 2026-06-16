# dealPhases.duplicate

> Source: https://developer.focus.teamleader.eu/docs/api/deal-phases-duplicate

  * [](/)
  * [API Reference](/docs/api)
  * Deals
  * [Deal Phases](/docs/api/deal-phases)
  * dealPhases.duplicate



# dealPhases.duplicate
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/dealPhases.duplicate

Create a new deal phase by duplicating an existing one.

## Request​

  * application/json



### Body**required**

**id** stringrequired

Id from source phase

**Example:**`22364cbf-971e-022c-811b-a76c28000257`




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

**Example:**`dealPhase`

**id** stringrequired

**Example:**`eb264fd0-0e5c-0dbf-ae1e-49e7d6a8e6b8`



    
    
    {  
      "data": {  
        "type": "dealPhase",  
        "id": "eb264fd0-0e5c-0dbf-ae1e-49e7d6a8e6b8"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "dealPhase",  
        "id": "eb264fd0-0e5c-0dbf-ae1e-49e7d6a8e6b8"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/dealPhases.duplicate");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"id\": \"22364cbf-971e-022c-811b-a76c28000257\"\n}", null, "application/json");  
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
      "id": "22364cbf-971e-022c-811b-a76c28000257"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
