# materials.duplicate

> Source: https://developer.focus.teamleader.eu/docs/api/nextgen-projects-materials-duplicate

  * [](/)
  * [API Reference](/docs/api)
  * New Projects
  * [Materials](/docs/api/materials)
  * materials.duplicate



# materials.duplicate
    
    
    POST 
    
    ## https://api.focus.teamleader.eu/projects-v2/materials.duplicate

Duplicate a material.

## Request​

  * application/json



### Body**required**

**origin_id** stringrequired

The id of the material that is being duplicated

**Example:**`0186a74b-b640-7458-9717-7c84356b26fd`




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
        "type": "nextgenMaterial",  
        "id": "0186a2f3-32a5-7c81-b3a9-55809146ad0c"  
      }  
    }  
    
    
    
    {  
      "data": {  
        "type": "nextgenMaterial",  
        "id": "0186a2f3-32a5-7c81-b3a9-55809146ad0c"  
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
    var request = new HttpRequestMessage(HttpMethod.Post, "https://api.focus.teamleader.eu/projects-v2/materials.duplicate");  
    request.Headers.Add("Accept", "application/json");  
    request.Headers.Add("Authorization", "Bearer <token>");  
    var content = new StringContent("{\n  \"origin_id\": \"0186a74b-b640-7458-9717-7c84356b26fd\"\n}", null, "application/json");  
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
      "origin_id": "0186a74b-b640-7458-9717-7c84356b26fd"
    }
    

Send API Request

ResponseClear

Click the `Send API Request` button above and see the response here!
